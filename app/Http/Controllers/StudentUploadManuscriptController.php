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
        try {
            // Log the incoming request
            \Log::info('Upload attempt', [
                'has_file' => $request->hasFile('file'),
                'file_valid' => $request->file('file') ? $request->file('file')->isValid() : false,
            ]);

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'abstract' => 'nullable|string',
                'description' => 'nullable|string',
                'keywords' => 'nullable|string',
                'file' => [
                    'required',
                    'file',
                    'mimes:pdf,doc,docx',
                    'max:2048000', // 2GB in KB
                ],
                'is_public' => 'nullable|boolean',
            ]);

            \Log::info('Validation passed');

            $file = $request->file('file');

            // Check if file is valid
            if (!$file->isValid()) {
                throw new \Exception('Uploaded file is not valid: ' . $file->getErrorMessage());
            }

            // Log file details
            \Log::info('File details', [
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'extension' => $file->getClientOriginalExtension(),
                'error' => $file->getError(),
                'is_valid' => $file->isValid(),
            ]);

            // Generate a clean filename
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $cleanName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $originalName);
            $fileName = time() . '_' . $cleanName . '.' . $extension;

            // Create user directory if it doesn't exist
            $userDirectory = 'documents/' . Auth::id();

            // Store the file with explicit disk
            $filePath = $file->storeAs($userDirectory, $fileName, 'public');

            if (!$filePath) {
                throw new \Exception('Failed to store file. Check storage permissions.');
            }

            // Verify file exists
            if (!Storage::disk('public')->exists($filePath)) {
                throw new \Exception('File was not stored properly: ' . $filePath);
            }

            \Log::info('File stored', [
                'path' => $filePath,
                'full_path' => Storage::disk('public')->path($filePath),
                'exists' => Storage::disk('public')->exists($filePath),
            ]);

            // Parse keywords
            $keywords = [];
            if ($request->filled('keywords')) {
                $keywords = json_decode($request->keywords, true);
                if (!is_array($keywords)) {
                    $keywords = [];
                }
            }

            // Create document record
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

            \Log::info('Document created', [
                'id' => $document->id,
                'title' => $document->title,
                'file_path' => $document->file_path,
            ]);

            // Return success with document data
            return redirect()->back()->with([
                'success' => 'Manuscript uploaded successfully!',
                'document' => $document
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', ['errors' => $e->errors()]);
            return redirect()->back()
                ->withErrors($e->errors())
                ->with('error', 'Validation failed: ' . implode(', ', array_merge(...array_values($e->errors()))));
        } catch (\Exception $e) {
            \Log::error('Upload failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
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
