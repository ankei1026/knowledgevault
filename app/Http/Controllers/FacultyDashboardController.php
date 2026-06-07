<?php
// app/Http/Controllers/FacultyDashboardController.php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\User;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FacultyDashboardController extends Controller
{
    /**
     * Show faculty dashboard
     */
    public function index()
    {
        $user = Auth::user();

        // Make sure user is faculty
        if ($user->role !== 'faculty') {
            return redirect()->route('dashboard');
        }

        // Get statistics
        $stats = [
            'pending_reviews' => Document::where('reviewer_id', $user->id)
                ->where('status', 'pending_review')
                ->count(),
            'under_review' => Document::where('reviewer_id', $user->id)
                ->where('status', 'under_review')
                ->count(),
            'completed_reviews' => Document::where('reviewer_id', $user->id)
                ->whereIn('status', ['approved', 'rejected'])
                ->count(),
            'total_reviews' => Document::where('reviewer_id', $user->id)->count(),
            'avg_response_time' => $this->getAverageResponseTime($user->id),
        ];

        // Get pending reviews (documents assigned to this faculty)
        $pendingReviews = Document::where('reviewer_id', $user->id)
            ->where('status', 'pending_review')
            ->with('user')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'title' => $doc->title,
                    'author' => $doc->user->name,
                    'author_email' => $doc->user->email,
                    'submitted_at' => $doc->submitted_at?->diffForHumans() ?? $doc->created_at->diffForHumans(),
                    'status' => $doc->status,
                ];
            });

        // Get recently reviewed documents
        $recentlyReviewed = Document::where('reviewer_id', $user->id)
            ->whereIn('status', ['approved', 'rejected'])
            ->with('user')
            ->latest('reviewed_at')
            ->limit(5)
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'title' => $doc->title,
                    'author' => $doc->user->name,
                    'status' => $doc->status,
                    'reviewed_at' => $doc->reviewed_at?->diffForHumans(),
                    'feedback' => $doc->reviewer_feedback,
                ];
            });

        // Get recent activity
        $recentActivity = Document::where('reviewer_id', $user->id)
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($doc) {
                return [
                    'type' => 'document',
                    'action' => $doc->status === 'pending_review' ? 'assigned for review' : ($doc->status === 'approved' ? 'approved' : ($doc->status === 'rejected' ? 'rejected' : 'reviewed')),
                    'title' => $doc->title,
                    'date' => $doc->updated_at->diffForHumans(),
                    'status' => $doc->status,
                ];
            });

        return Inertia::render('Faculty/Dashboard', [
            'user' => $user,
            'stats' => $stats,
            'pendingReviews' => $pendingReviews,
            'recentlyReviewed' => $recentlyReviewed,
            'recentActivity' => $recentActivity,
        ]);
    }

    /**
     * Get all pending submissions for faculty
     */
    public function pendingSubmissions()
    {
        $user = Auth::user();

        $documents = Document::where('reviewer_id', $user->id)
            ->where('status', 'pending_review')
            ->with('user')
            ->latest()
            ->paginate(12);

        return Inertia::render('Faculty/PendingSubmissions', [
            'documents' => $documents,
        ]);
    }

    /**
     * Get review history
     */
    public function reviewHistory()
    {
        $user = Auth::user();

        $documents = Document::where('reviewer_id', $user->id)
            ->whereIn('status', ['approved', 'rejected'])
            ->with('user')
            ->latest('reviewed_at')
            ->paginate(15);

        return Inertia::render('Faculty/ReviewHistory', [
            'documents' => $documents,
        ]);
    }

    /**
     * Show review form for a document
     */
    public function showReviewForm($id)
    {
        $document = Document::where('reviewer_id', Auth::id())
            ->where('status', 'pending_review')
            ->with('user')
            ->findOrFail($id);

        return Inertia::render('Faculty/ReviewDocument', [
            'document' => $document,
        ]);
    }

    /**
     * Submit review
     */
    public function submitReview(Request $request, $id)
    {
        $document = Document::where('reviewer_id', Auth::id())
            ->where('status', 'pending_review')
            ->findOrFail($id);

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
        $student->notify(new \App\Notifications\ReviewerResponseNotification($document, Auth::user(), $request->status, $request->feedback));

        return redirect()->route('faculty.dashboard')
            ->with('success', 'Review submitted successfully!');
    }

    /**
     * Get average response time for reviews
     */
    private function getAverageResponseTime($facultyId)
    {
        $documents = Document::where('reviewer_id', $facultyId)
            ->whereNotNull('reviewed_at')
            ->whereNotNull('submitted_at')
            ->get();

        if ($documents->isEmpty()) {
            return 'N/A';
        }

        $totalDays = 0;
        foreach ($documents as $doc) {
            $totalDays += $doc->submitted_at->diffInDays($doc->reviewed_at);
        }

        $avgDays = round($totalDays / $documents->count(), 1);

        if ($avgDays < 1) {
            return '< 1 day';
        }

        return $avgDays . ' days';
    }
}
