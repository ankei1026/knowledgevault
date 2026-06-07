<?php
// app/Http/Controllers/StudentUploadManuscriptController.php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class StudentUploadManuscriptController extends Controller
{
    /**
     * Show the upload manuscript page with SSR disabled
     */
    public function create()
    {
        // Disable SSR for this page
        return Inertia::render('Student/UploadManuscript', [])
            ->withViewData(['ssr' => false]);
    }

    /**
     * Store the uploaded manuscript
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'abstract' => 'nullable|string|max:5000',
            'description' => 'nullable|string',
            'keywords' => 'nullable|string',
            'file' => 'required|file|mimes:pdf,doc,docx|max:122880', // 120MB max (120 * 1024 = 122880 KB)
            'is_public' => 'nullable|boolean',
        ]);

        try {
            $file = $request->file('file');
            $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
            $filePath = $file->storeAs('documents/' . Auth::id(), $fileName, 'public');

            $keywords = $request->keywords ? json_decode($request->keywords, true) : [];

            $document = Document::create([
                'title' => $validated['title'],
                'abstract' => $validated['abstract'],
                'description' => $validated['description'],
                'keywords' => $keywords,
                'file_path' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'user_id' => Auth::id(),
                'status' => 'draft',
                'is_public' => $request->boolean('is_public', true),
            ]);

            return redirect()->back()->with([
                'success' => 'Manuscript uploaded successfully!',
                'document' => $document
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to upload manuscript: ' . $e->getMessage());
        }
    }

    /**
     * Send invitation to co-author or reviewer
     */
    public function sendInvitation(Request $request, Document $document)
    {
        if ($document->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'email' => 'required|email',
            'role' => 'required|in:co-author,reviewer',
            'message' => 'nullable|string|max:500',
        ]);

        $existingUser = \App\Models\User::where('email', $request->email)->first();

        if ($existingUser) {
            $existingCollaborator = $document->collaborators()
                ->where('user_id', $existingUser->id)
                ->exists();

            if ($existingCollaborator) {
                return back()->with('error', 'This user is already a collaborator on this document.');
            }
        }

        $existingInvitation = Invitation::where('email', $request->email)
            ->where('document_id', $document->id)
            ->where('status', 'pending')
            ->first();

        if ($existingInvitation) {
            return back()->with('error', 'An invitation has already been sent to this email.');
        }

        $invitation = Invitation::create([
            'email' => $request->email,
            'token' => Str::random(64),
            'role' => $request->role,
            'document_id' => $document->id,
            'invited_by' => Auth::id(),
            'expires_at' => now()->addDays(7),
            'message' => $request->message,
            'permissions' => $this->getPermissionsForRole($request->role),
        ]);

        return back()->with('success', "Invitation sent to {$request->email} as {$request->role}.");
    }

    private function getPermissionsForRole(string $role): array
    {
        return match ($role) {
            'co-author' => ['view', 'edit', 'comment', 'download'],
            'reviewer' => ['view', 'review', 'comment'],
            default => ['view'],
        };
    }
}
