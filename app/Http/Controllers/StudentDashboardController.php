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
    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        if ($user->role !== 'student') {
            return redirect()->route('dashboard');
        }

        // Get faculty members for reviewer selection
        $facultyMembers = User::where('role', 'faculty')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

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

        // Get recent documents with reviewer info
        $recentDocuments = Document::where('user_id', $user->id)
            ->with('reviewer')
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
                    'reviewer_id' => $doc->reviewer_id,
                    'reviewer_name' => $doc->reviewer?->name,
                ];
            });

        // Get pending documents
        $pendingDocuments = Document::where('user_id', $user->id)
            ->where('status', 'pending_review')
            ->with('reviewer')
            ->latest()
            ->limit(3)
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'title' => $doc->title,
                    'submitted_at' => $doc->submitted_at?->diffForHumans() ?? $doc->updated_at->diffForHumans(),
                    'reviewer_id' => $doc->reviewer_id,
                    'reviewer_name' => $doc->reviewer?->name,
                ];
            });

        // Get documents that need reviewer assignment (draft or no reviewer)
        $documentsNeedingReviewer = Document::where('user_id', $user->id)
            ->where(function ($q) {
                $q->whereNull('reviewer_id')
                    ->orWhere('reviewer_id', 0);
            })
            ->whereIn('status', ['draft', 'pending_review'])
            ->latest()
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'title' => $doc->title,
                    'status' => $doc->status,
                    'created_at' => $doc->created_at->diffForHumans(),
                ];
            });

        // Get recent activity
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
            'documentsNeedingReviewer' => $documentsNeedingReviewer,
            'facultyMembers' => $facultyMembers,
            'recentActivity' => $recentActivity,
        ]);
    }
}
