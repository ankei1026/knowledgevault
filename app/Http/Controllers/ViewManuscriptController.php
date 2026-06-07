<?php
// app/Http/Controllers/ViewManuscriptController.php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ViewManuscriptController extends Controller
{
    /**
     * Show the manuscript view page
     */
    public function show($id)
    {
        $document = Document::with(['user', 'collaborators', 'reviewer'])
            ->findOrFail($id);

        // Check if user has access
        $user = Auth::user();
        $isOwner = $document->user_id === $user->id;
        $isCollaborator = $document->collaborators->contains($user->id);
        $isReviewer = $document->reviewer_id === $user->id;
        $isAdmin = $user->role === 'admin';

        // Check permissions
        if (!$document->is_public && !$isOwner && !$isCollaborator && !$isReviewer && !$isAdmin) {
            abort(403, 'You do not have permission to view this document.');
        }

        // Get user's role on this document
        $userRole = 'viewer';
        if ($isOwner)
            $userRole = 'owner';
        elseif ($isCollaborator) {
            $collab = $document->collaborators->where('id', $user->id)->first();
            $userRole = $collab->pivot->role ?? 'viewer';
        } elseif ($isReviewer)
            $userRole = 'reviewer';

        // Get pending invitations
        $pendingInvitations = Invitation::where('document_id', $document->id)
            ->where('status', 'pending')
            ->get();

        // Get collaborators with their details
        $collaborators = $document->collaborators->map(function ($collab) {
            return [
                'id' => $collab->id,
                'name' => $collab->name,
                'email' => $collab->email,
                'role' => $collab->pivot->role,
                'status' => $collab->pivot->status,
            ];
        });

        // Get similar documents (same keywords)
        $similarDocuments = Document::where('id', '!=', $document->id)
            ->where('is_public', true)
            ->where(function ($q) use ($document) {
                foreach ($document->keywords ?? [] as $keyword) {
                    $q->orWhereJsonContains('keywords', $keyword);
                }
            })
            ->with('user')
            ->limit(5)
            ->get();

        return Inertia::render('Student/ShowManuscript', [
            'document' => [
                'id' => $document->id,
                'title' => $document->title,
                'abstract' => $document->abstract,
                'description' => $document->description,
                'keywords' => $document->keywords,
                'file_path' => $document->file_path,
                'file_name' => $document->file_name,
                'file_size' => $document->formatted_file_size,
                'status' => $document->status,
                'status_label' => $document->status_label,
                'status_color' => $document->status_color,
                'views' => $document->views,
                'downloads' => $document->downloads,
                'citations' => $document->citations,
                'created_at' => $document->created_at->diffForHumans(),
                'updated_at' => $document->updated_at->diffForHumans(),
                'submitted_at' => $document->submitted_at?->diffForHumans(),
                'reviewed_at' => $document->reviewed_at?->diffForHumans(),
                'reviewer_feedback' => $document->reviewer_feedback,
                'is_public' => $document->is_public,
                'is_featured' => $document->is_featured,
            ],
            'author' => [
                'id' => $document->user->id,
                'name' => $document->user->name,
                'email' => $document->user->email,
                'role' => $document->user->role,
            ],
            'reviewer' => $document->reviewer ? [
                'id' => $document->reviewer->id,
                'name' => $document->reviewer->name,
                'email' => $document->reviewer->email,
            ] : null,
            'collaborators' => $collaborators,
            'pendingInvitations' => $pendingInvitations,
            'userRole' => $userRole,
            'canEdit' => in_array($userRole, ['owner', 'co-author']),
            'canReview' => $userRole === 'reviewer',
            'similarDocuments' => $similarDocuments,
            'mime_type' => $document->mime_type,
            'file_type' => $document->file_type,
        ]);
    }

    /**
     * Download manuscript file
     */
    public function download($id)
    {
        $document = Document::findOrFail($id);

        // Check permissions
        $user = Auth::user();
        $isOwner = $document->user_id === $user->id;
        $isCollaborator = $document->collaborators->contains($user->id);
        $isAdmin = $user->role === 'admin';

        if (!$document->is_public && !$isOwner && !$isCollaborator && !$isAdmin) {
            abort(403);
        }

        // Increment download count
        $document->incrementDownloads();

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    /**
     * Submit review for manuscript
     */
    public function submitReview(Request $request, $id)
    {
        $document = Document::findOrFail($id);
        $user = Auth::user();

        // Check if user is assigned as reviewer
        if ($document->reviewer_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'feedback' => 'required_if:status,rejected|nullable|string|max:5000',
        ]);

        $document->update([
            'status' => $request->status === 'approved' ? 'approved' : 'rejected',
            'reviewer_feedback' => $request->feedback,
            'reviewed_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Review submitted successfully!');
    }
}
