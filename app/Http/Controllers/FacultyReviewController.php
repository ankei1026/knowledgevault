<?php
// app/Http/Controllers/FacultyReviewController.php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Invitation;
use App\Models\User;
use App\Notifications\ReviewerResponseNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FacultyReviewController extends Controller
{
    /**
     * Show all pending submissions for the faculty
     */
    public function pendingSubmissions()
    {
        $user = Auth::user();

        $documents = Document::where('reviewer_id', $user->id)
            ->where('status', 'pending_review')
            ->with('user')
            ->latest()
            ->paginate(12);

        $stats = [
            'total' => Document::where('reviewer_id', $user->id)->where('status', 'pending_review')->count(),
        ];

        return Inertia::render('Faculty/PendingSubmissions', [
            'documents' => $documents,
            'stats' => $stats,
        ]);
    }

    /**
     * Show review detail page for a specific document
     */
    public function show($id)
    {
        $document = Document::with(['user', 'reviewer'])
            ->findOrFail($id);

        // Check if the logged-in faculty is the assigned reviewer
        if ($document->reviewer_id !== auth()->id()) {
            abort(403, 'You are not authorized to review this document.');
        }

        // Get all authors from JSON field
        $authors = $document->authors ?? [];

        // Get the main author (student who submitted)
        $mainAuthor = $document->user;

        // Combine authors (main author + co-authors from JSON)
        $allAuthors = [];

        // Add main author first
        if ($mainAuthor) {
            $allAuthors[] = [
                'name' => $mainAuthor->name,
                'email' => $mainAuthor->email,
                'role' => 'Main Author',
            ];
        }

        // Add co-authors from JSON
        if (is_array($authors) && count($authors) > 0) {
            foreach ($authors as $author) {
                // Skip if the author is the same as the main author
                if ($mainAuthor && isset($author['name']) && $author['name'] === $mainAuthor->name) {
                    continue;
                }
                $allAuthors[] = [
                    'name' => $author['name'] ?? 'Unknown Author',
                    'email' => $author['email'] ?? null,
                    'role' => 'Co-author',
                ];
            }
        }

        // Get the invitation for this document and faculty
        $invitation = Invitation::where('document_id', $document->id)
            ->where('email', auth()->user()->email)
            ->whereIn('status', ['pending', 'accepted'])
            ->with('inviter')
            ->first();

        // Format file size
        $fileSize = $document->file_size;
        if ($fileSize) {
            if ($fileSize < 1024) {
                $formattedSize = $fileSize . ' B';
            } elseif ($fileSize < 1048576) {
                $formattedSize = round($fileSize / 1024, 1) . ' KB';
            } else {
                $formattedSize = round($fileSize / 1048576, 1) . ' MB';
            }
        } else {
            $formattedSize = 'N/A';
        }

        return Inertia::render('Faculty/ReviewDetail', [
            'document' => [
                'id' => $document->id,
                'title' => $document->title,
                'abstract' => $document->abstract,
                'description' => $document->description,
                'keywords' => $document->keywords,
                'file_path' => $document->file_path,
                'file_name' => $document->file_name,
                'file_size' => $formattedSize,
                'mime_type' => $document->mime_type,
                'status' => $document->status,
                'submitted_at' => $document->submitted_at ? $document->submitted_at->format('M d, Y h:i A') : 'N/A',
                'user_id' => $document->user_id,
            ],
            'authors' => $allAuthors,
            'invitation' => $invitation ? [
                'id' => $invitation->id,
                'email' => $invitation->email,
                'message' => $invitation->message,
                'role' => $invitation->role,
                'status' => $invitation->status,
                'created_at' => $invitation->created_at->format('M d, Y'),
                'inviter' => $invitation->inviter ? [
                    'id' => $invitation->inviter->id,
                    'name' => $invitation->inviter->name,
                    'email' => $invitation->inviter->email,
                ] : null,
            ] : null,
        ]);
    }



    /**
     * Submit review for a document
     */
    public function submitReview(Request $request, $id)
    {
        // Fix: Use findOrFail with where conditions
        $document = Document::where('reviewer_id', Auth::id())
            ->where('status', 'pending_review')
            ->findOrFail($id);  // Changed from firstOrFail($id) to findOrFail($id)

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'feedback' => 'required|string|min:10|max:5000',
        ]);

        $document->update([
            'status' => $request->status,
            'reviewer_feedback' => $request->feedback,
            'reviewed_at' => now(),
        ]);

        // Send notification to student
        $student = User::find($document->user_id);
        if ($student) {
            $student->notify(new ReviewerResponseNotification($document, Auth::user(), $request->status, $request->feedback));
        }

        return redirect()->route('faculty.pending-submissions')
            ->with('success', 'Review submitted successfully!');
    }

    /**
     * Show review history
     */
    public function reviewHistory()
    {
        $user = Auth::user();

        $documents = Document::where('reviewer_id', $user->id)
            ->whereIn('status', ['approved', 'rejected'])
            ->with('user')
            ->latest('reviewed_at')
            ->paginate(15);

        $stats = [
            'total' => $documents->total(),
            'approved' => Document::where('reviewer_id', $user->id)->where('status', 'approved')->count(),
            'rejected' => Document::where('reviewer_id', $user->id)->where('status', 'rejected')->count(),
        ];

        return Inertia::render('Faculty/ReviewHistory', [
            'documents' => $documents,
            'stats' => $stats,
        ]);
    }

    /**
     * Format file size
     */
    private function formatFileSize($bytes): string
    {
        if ($bytes < 1024) {
            return $bytes . ' B';
        } elseif ($bytes < 1048576) {
            return round($bytes / 1024, 1) . ' KB';
        } elseif ($bytes < 1073741824) {
            return round($bytes / 1048576, 1) . ' MB';
        }
        return round($bytes / 1073741824, 1) . ' GB';
    }
}
