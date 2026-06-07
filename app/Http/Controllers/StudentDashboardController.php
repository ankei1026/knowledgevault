<?php
// app/Http/Controllers/StudentDashboardController.php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentDashboardController extends Controller
{
    /**
     * Show student dashboard
     */
    public function index()
    {
        $user = Auth::user();

        // Get student statistics
        $stats = [
            'total_documents' => Document::where('user_id', $user->id)->count(),
            'pending_reviews' => Document::where('user_id', $user->id)
                ->where('status', 'pending_review')
                ->count(),
            'approved_documents' => Document::where('user_id', $user->id)
                ->where('status', 'approved')
                ->count(),
            'rejected_documents' => Document::where('user_id', $user->id)
                ->where('status', 'rejected')
                ->count(),
            'draft_documents' => Document::where('user_id', $user->id)
                ->where('status', 'draft')
                ->count(),
        ];

        // Get recent documents
        $recentDocuments = Document::where('user_id', $user->id)
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'title' => $doc->title,
                    'status' => $doc->status,
                    'created_at' => $doc->created_at->diffForHumans(),
                    'updated_at' => $doc->updated_at->diffForHumans(),
                ];
            });

        // Get pending documents for review
        $pendingDocuments = Document::where('user_id', $user->id)
            ->where('status', 'pending_review')
            ->latest()
            ->limit(3)
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'title' => $doc->title,
                    'submitted_at' => $doc->updated_at->diffForHumans(),
                ];
            });

        // Get recent activity (all user actions)
        $recentActivity = Document::where('user_id', $user->id)
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($doc) {
                return [
                    'type' => 'document',
                    'action' => $doc->status === 'draft' ? 'created' : ($doc->status === 'pending_review' ? 'submitted for review' : $doc->status),
                    'title' => $doc->title,
                    'date' => $doc->created_at->diffForHumans(),
                    'status' => $doc->status,
                ];
            });

        return Inertia::render('Student/Dashboard', [
            'user' => $user,
            'stats' => $stats,
            'recentDocuments' => $recentDocuments,
            'pendingDocuments' => $pendingDocuments,
            'recentActivity' => $recentActivity,
        ]);
    }

    /**
     * Get document library page
     */
    public function library()
    {
        $documents = Document::where('user_id', Auth::id())
            ->latest()
            ->paginate(12);

        $stats = [
            'total' => Document::where('user_id', Auth::id())->count(),
            'approved' => Document::where('user_id', Auth::id())->where('status', 'approved')->count(),
            'pending' => Document::where('user_id', Auth::id())->where('status', 'pending_review')->count(),
            'rejected' => Document::where('user_id', Auth::id())->where('status', 'rejected')->count(),
            'draft' => Document::where('user_id', Auth::id())->where('status', 'draft')->count(),
        ];

        return Inertia::render('Student/Library', [
            'documents' => $documents,
            'stats' => $stats,
        ]);
    }
}
