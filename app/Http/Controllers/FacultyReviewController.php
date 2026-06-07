<?php
// app/Http/Controllers/FacultyReviewController.php

namespace App\Http\Controllers;

use App\Models\Document;
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
        // Fix: Use findOrFail with where conditions
        $document = Document::where('reviewer_id', Auth::id())
            ->where('status', 'pending_review')
            ->with('user')
            ->findOrFail($id);  // Changed from firstOrFail($id) to findOrFail($id)

        return Inertia::render('Faculty/ReviewDetail', [
            'document' => [
                'id' => $document->id,
                'title' => $document->title,
                'abstract' => $document->abstract,
                'description' => $document->description,
                'keywords' => $document->keywords,
                'file_path' => $document->file_path,
                'file_name' => $document->file_name,
                'file_size' => $this->formatFileSize($document->file_size),
                'mime_type' => $document->mime_type,
                'status' => $document->status,
                'submitted_at' => $document->submitted_at?->format('F j, Y, g:i a'),
                'user_id' => $document->user_id,
            ],
            'author' => [
                'id' => $document->user->id,
                'name' => $document->user->name,
                'email' => $document->user->email,
            ],
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
