<?php
// app/Http/Controllers/AdminDashboardController.php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    /**
     * Show admin dashboard
     */
    public function index()
    {
        // System statistics
        $stats = [
            'total_users' => User::count(),
            // 'total_documents' => Document::count(),
            // 'pending_reviews' => Document::where('status', 'pending_review')->count(),
            // 'approved_documents' => Document::where('status', 'approved')->count(),
            // 'rejected_documents' => Document::where('status', 'rejected')->count(),
            // 'storage_used' => $this->getStorageUsage(),
            // 'active_users_today' => User::where('last_login_at', '>=', now()->subDay())->count(),
            // 'documents_this_month' => Document::whereMonth('created_at', now()->month)->count(),
        ];

        // Recent users
        $recentUsers = User::latest()->limit(5)->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at->diffForHumans(),
            ];
        });

        // Recent documents
        // $recentDocuments = Document::with('user')
        //     ->latest()
        //     ->limit(5)
        //     ->get()
        //     ->map(function ($doc) {
        //         return [
        //             'id' => $doc->id,
        //             'title' => $doc->title,
        //             'author' => $doc->user->name,
        //             'status' => $doc->status,
        //             'created_at' => $doc->created_at->diffForHumans(),
        //         ];
        //     });

        // // Document status distribution for chart
        // $documentStatus = [
        //     'draft' => Document::where('status', 'draft')->count(),
        //     'pending_review' => Document::where('status', 'pending_review')->count(),
        //     'approved' => Document::where('status', 'approved')->count(),
        //     'rejected' => Document::where('status', 'rejected')->count(),
        // ];

        // Role distribution
        $roleDistribution = [
            'students' => User::where('role', 'student')->count(),
            'faculty' => User::where('role', 'faculty')->count(),
            'admin' => User::where('role', 'admin')->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'user' => Auth::user(),
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            // 'recentDocuments' => $recentDocuments,
            // 'documentStatus' => $documentStatus,
            'roleDistribution' => $roleDistribution,
        ]);
    }

    /**
     * Get storage usage
     */
    // private function getStorageUsage(): string
    // {
    //     $totalSize = Document::sum('file_size');

    //     if ($totalSize < 1024) {
    //         return $totalSize . ' B';
    //     } elseif ($totalSize < 1048576) {
    //         return round($totalSize / 1024, 1) . ' KB';
    //     } elseif ($totalSize < 1073741824) {
    //         return round($totalSize / 1048576, 1) . ' MB';
    //     }

    //     return round($totalSize / 1073741824, 1) . ' GB';
    // }
}
