<?php
// app/Http/Controllers/AdminDashboardController.php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Document;
use App\Models\FinalDocument;
use App\Models\SavedDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    /**
     * Show admin dashboard with full analytics
     */
    public function index()
    {
        // System Statistics
        $stats = [
            'total_users' => User::count(),
            'total_documents' => Document::count(),
            'total_final_submissions' => FinalDocument::count(),
            'total_saved_documents' => SavedDocument::count(),
            'pending_reviews' => Document::where('status', 'pending_review')->count(),
            'approved_documents' => Document::where('status', 'approved')->count(),
            'rejected_documents' => Document::where('status', 'rejected')->count(),
            'published_documents' => Document::where('status', 'published')->count(),
            'verified_final' => FinalDocument::where('status', 'verified')->count(),
            'archived_final' => FinalDocument::where('status', 'archived')->count(),
            'pending_final' => FinalDocument::where('status', 'pending')->count(),
        ];

        // User Analytics
        $userAnalytics = [
            'total' => User::count(),
            'students' => User::where('role', 'student')->count(),
            'faculty' => User::where('role', 'faculty')->count(),
            'admins' => User::where('role', 'admin')->count(),
            'verified_users' => User::whereNotNull('email_verified_at')->count(),
            'unverified_users' => User::whereNull('email_verified_at')->count(),
            'new_this_week' => User::where('created_at', '>=', now()->subWeek())->count(),
            'new_this_month' => User::where('created_at', '>=', now()->subMonth())->count(),
        ];

        // Document Analytics
        $documentAnalytics = [
            'total' => Document::count(),
            'by_status' => [
                'draft' => Document::where('status', 'draft')->count(),
                'pending_review' => Document::where('status', 'pending_review')->count(),
                'under_review' => Document::where('status', 'under_review')->count(),
                'approved' => Document::where('status', 'approved')->count(),
                'rejected' => Document::where('status', 'rejected')->count(),
                'published' => Document::where('status', 'published')->count(),
            ],
            'total_views' => Document::sum('views'),
            'total_downloads' => Document::sum('downloads'),
            'total_citations' => Document::sum('citations'),
            'most_viewed' => Document::orderBy('views', 'desc')->limit(5)->get(['id', 'title', 'views', 'downloads']),
            'most_downloaded' => Document::orderBy('downloads', 'desc')->limit(5)->get(['id', 'title', 'views', 'downloads']),
            'new_this_week' => Document::where('created_at', '>=', now()->subWeek())->count(),
            'new_this_month' => Document::where('created_at', '>=', now()->subMonth())->count(),
        ];

        // Final Submission Analytics
        $finalAnalytics = [
            'total' => FinalDocument::count(),
            'pending' => FinalDocument::where('status', 'pending')->count(),
            'verified' => FinalDocument::where('status', 'verified')->count(),
            'archived' => FinalDocument::where('status', 'archived')->count(),
            'new_this_week' => FinalDocument::where('created_at', '>=', now()->subWeek())->count(),
            'new_this_month' => FinalDocument::where('created_at', '>=', now()->subMonth())->count(),
        ];

        // Activity Logs (recent system activities)
        $recentActivities = $this->getRecentActivities();

        // Daily activity for chart (last 30 days)
        $dailyActivity = $this->getDailyActivity();

        // Top users by activity
        $topUsers = $this->getTopUsers();

        // Role distribution
        $roleDistribution = [
            'students' => User::where('role', 'student')->count(),
            'faculty' => User::where('role', 'faculty')->count(),
            'admin' => User::where('role', 'admin')->count(),
        ];

        // Storage usage
        $storageUsage = $this->getStorageUsage();

        return Inertia::render('Admin/Dashboard', [
            'user' => Auth::user(),
            'stats' => $stats,
            'userAnalytics' => $userAnalytics,
            'documentAnalytics' => $documentAnalytics,
            'finalAnalytics' => $finalAnalytics,
            'recentActivities' => $recentActivities,
            'dailyActivity' => $dailyActivity,
            'topUsers' => $topUsers,
            'roleDistribution' => $roleDistribution,
            'storageUsage' => $storageUsage,
        ]);
    }

    /**
     * Get recent system activities
     */
    private function getRecentActivities()
    {
        $activities = [];

        // Get recent document uploads
        $documents = Document::with('user')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($doc) {
                return [
                    'type' => 'document_upload',
                    'user' => $doc->user?->name ?? 'Unknown',
                    'user_role' => $doc->user?->role ?? 'unknown',
                    'action' => 'uploaded a new document',
                    'title' => $doc->title,
                    'status' => $doc->status,
                    'created_at' => $doc->created_at->diffForHumans(),
                    'timestamp' => $doc->created_at,
                ];
            });

        // Get recent final submissions
        $finalSubmissions = FinalDocument::with(['student', 'document'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($final) {
                return [
                    'type' => 'final_submission',
                    'user' => $final->student?->name ?? 'Unknown',
                    'user_role' => 'student',
                    'action' => 'submitted a final paper',
                    'title' => $final->document?->title ?? 'Unknown',
                    'status' => $final->status,
                    'created_at' => $final->created_at->diffForHumans(),
                    'timestamp' => $final->created_at,
                ];
            });

        // Get recent user registrations
        $users = User::latest()
            ->limit(5)
            ->get()
            ->map(function ($user) {
                return [
                    'type' => 'user_registration',
                    'user' => $user->name,
                    'user_role' => $user->role,
                    'action' => 'joined the platform',
                    'title' => $user->email,
                    'status' => 'active',
                    'created_at' => $user->created_at->diffForHumans(),
                    'timestamp' => $user->created_at,
                ];
            });

        // Merge and sort by timestamp
        $activities = $documents->merge($finalSubmissions)
            ->merge($users)
            ->sortByDesc('timestamp')
            ->take(15)
            ->values();

        return $activities;
    }

    /**
     * Get daily activity for the last 30 days
     */
    private function getDailyActivity()
    {
        $dates = collect();
        $days = 30;

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dateString = $date->format('Y-m-d');

            $dates->push([
                'date' => $dateString,
                'label' => $date->format('M d'),
                'documents' => Document::whereDate('created_at', $dateString)->count(),
                'users' => User::whereDate('created_at', $dateString)->count(),
                'final_submissions' => FinalDocument::whereDate('created_at', $dateString)->count(),
                'saves' => SavedDocument::whereDate('created_at', $dateString)->count(),
            ]);
        }

        return $dates;
    }

    /**
     * Get top users by activity
     */
    private function getTopUsers()
    {
        $users = User::withCount([
            'documents',
            'reviewedDocuments',
        ])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'documents_count' => $user->documents_count,
                    'reviews_count' => $user->reviewed_documents_count,
                    'total_activity' => $user->documents_count + $user->reviewed_documents_count,
                ];
            })
            ->sortByDesc('total_activity')
            ->take(10)
            ->values();

        return $users;
    }

    /**
     * Get storage usage
     */
    private function getStorageUsage()
    {
        $totalSize = Document::sum('file_size');

        if ($totalSize < 1024) {
            return $totalSize . ' B';
        } elseif ($totalSize < 1048576) {
            return round($totalSize / 1024, 1) . ' KB';
        } elseif ($totalSize < 1073741824) {
            return round($totalSize / 1048576, 1) . ' MB';
        }

        return round($totalSize / 1073741824, 1) . ' GB';
    }
}
