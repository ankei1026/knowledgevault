<?php
// app/Http/Controllers/FacultyDashboardController.php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\FinalDocument;
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
            // Add final submission stats
            'pending_final_submissions' => FinalDocument::where('status', 'pending')->count(),
            'verified_final_submissions' => FinalDocument::where('status', 'verified')->count(),
            'archived_final_submissions' => FinalDocument::where('status', 'archived')->count(),
            'total_final_submissions' => FinalDocument::count(),
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

        // Get pending final submissions
        $pendingFinalSubmissions = FinalDocument::with(['document.user', 'student'])
            ->where('status', 'pending')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($finalDoc) {
                return [
                    'id' => $finalDoc->id,
                    'title' => $finalDoc->document->title,
                    'student' => $finalDoc->student->name,
                    'student_email' => $finalDoc->student->email,
                    'submitted_at' => $finalDoc->submitted_at->diffForHumans(),
                    'status' => $finalDoc->status,
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

        // Get recent final submissions (verified/archived)
        $recentFinalSubmissions = FinalDocument::with(['document.user', 'student', 'verifiedBy'])
            ->whereIn('status', ['verified', 'archived'])
            ->latest('verified_at')
            ->limit(5)
            ->get()
            ->map(function ($finalDoc) {
                return [
                    'id' => $finalDoc->id,
                    'title' => $finalDoc->document->title,
                    'student' => $finalDoc->student->name,
                    'verified_at' => $finalDoc->verified_at?->diffForHumans(),
                    'status' => $finalDoc->status,
                    'verified_by' => $finalDoc->verifiedBy?->name,
                ];
            });

        // Get recent activity (combine both document reviews and final submissions)
        $recentActivity = $this->getRecentActivity($user->id);

        return Inertia::render('Faculty/Dashboard', [
            'user' => $user,
            'stats' => $stats,
            'pendingReviews' => $pendingReviews,
            'pendingFinalSubmissions' => $pendingFinalSubmissions,
            'recentlyReviewed' => $recentlyReviewed,
            'recentFinalSubmissions' => $recentFinalSubmissions,
            'recentActivity' => $recentActivity,
        ]);
    }

    /**
     * Get recent activity combining document reviews and final submissions
     */
    private function getRecentActivity($facultyId)
    {
        // Get document review activities
        $documentActivities = Document::where('reviewer_id', $facultyId)
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

        // Get final submission activities
        $finalActivities = FinalDocument::whereIn('status', ['verified', 'archived'])
            ->latest('verified_at')
            ->limit(10)
            ->get()
            ->map(function ($finalDoc) {
                return [
                    'type' => 'final_submission',
                    'action' => $finalDoc->status === 'verified' ? 'verified final paper' : 'archived final paper',
                    'title' => $finalDoc->document->title,
                    'date' => $finalDoc->verified_at?->diffForHumans() ?? $finalDoc->updated_at->diffForHumans(),
                    'status' => $finalDoc->status,
                    'student' => $finalDoc->student->name,
                ];
            });

        // Merge and sort by date
        $activities = $documentActivities->merge($finalActivities)
            ->sortByDesc('date')
            ->take(10)
            ->values();

        return $activities;
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
        if ($student) {
            $student->notify(new \App\Notifications\ReviewerResponseNotification(
                $document,
                Auth::user(),
                $request->status,
                $request->feedback
            ));
        }

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
