<?php
// app/Http/Controllers/AdminActivitiesController.php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Document;
use App\Models\FinalDocument;
use App\Models\SavedDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminActivitiesController extends Controller
{
    /**
     * Display all system activities with filtering and pagination.
     */
    public function index(Request $request)
    {
        $activities = $this->getAllActivities($request);

        // Get statistics
        $stats = [
            'total' => $this->getTotalActivities(),
            'documents' => Document::count(),
            'users' => User::count(),
            'final_submissions' => FinalDocument::count(),
            'saved_documents' => SavedDocument::count(),
            'today' => $this->getTodayActivities(),
            'this_week' => $this->getWeekActivities(),
            'this_month' => $this->getMonthActivities(),
        ];

        // Get activity types for filter
        $activityTypes = [
            'document_upload' => 'Document Uploads',
            'document_update' => 'Document Updates',
            'final_submission' => 'Final Submissions',
            'final_verification' => 'Final Verifications',
            'final_archive' => 'Final Archives',
            'user_registration' => 'User Registrations',
            'saved_document' => 'Saved Documents',
            'review_submitted' => 'Reviews Submitted',
        ];

        return Inertia::render('Admin/Activities', [
            'activities' => $activities,
            'stats' => $stats,
            'activityTypes' => $activityTypes,
            'filters' => [
                'type' => $request->input('type', 'all'),
                'search' => $request->input('search', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to' => $request->input('date_to', ''),
            ],
        ]);
    }

    /**
     * Get all activities with filtering.
     */
    private function getAllActivities(Request $request)
    {
        $activities = collect();

        // Get document activities (uploads and updates)
        $docActivities = $this->getDocumentActivities($request);
        $activities = $activities->merge($docActivities);

        // Get final submission activities
        $finalActivities = $this->getFinalSubmissionActivities($request);
        $activities = $activities->merge($finalActivities);

        // Get user activities (registrations)
        $userActivities = $this->getUserActivities($request);
        $activities = $activities->merge($userActivities);

        // Get saved document activities
        $savedActivities = $this->getSavedDocumentActivities($request);
        $activities = $activities->merge($savedActivities);

        // Sort by timestamp (newest first)
        $activities = $activities->sortByDesc('timestamp')->values();

        // Apply type filter
        if ($request->filled('type') && $request->type !== 'all') {
            $activities = $activities->filter(function ($activity) use ($request) {
                return $activity['type'] === $request->type;
            })->values();
        }

        // Apply search filter
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $activities = $activities->filter(function ($activity) use ($search) {
                return stripos($activity['user'], $search) !== false ||
                    stripos($activity['title'], $search) !== false ||
                    stripos($activity['action'], $search) !== false ||
                    stripos($activity['description'] ?? '', $search) !== false;
            })->values();
        }

        // Apply date range filter
        if ($request->filled('date_from')) {
            $dateFrom = $request->date_from;
            $activities = $activities->filter(function ($activity) use ($dateFrom) {
                return $activity['timestamp'] >= $dateFrom;
            })->values();
        }

        if ($request->filled('date_to')) {
            $dateTo = $request->date_to . ' 23:59:59';
            $activities = $activities->filter(function ($activity) use ($dateTo) {
                return $activity['timestamp'] <= $dateTo;
            })->values();
        }

        // Paginate manually
        $perPage = $request->input('per_page', 20);
        $page = $request->input('page', 1);
        $total = $activities->count();
        $items = $activities->slice(($page - 1) * $perPage, $perPage)->values();

        return [
            'data' => $items,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
            'per_page' => $perPage,
            'total' => $total,
        ];
    }

    /**
     * Get document activities.
     */
    private function getDocumentActivities(Request $request)
    {
        $documents = Document::with(['user'])
            ->latest('created_at')
            ->limit(100)
            ->get();

        $activities = collect();

        foreach ($documents as $doc) {
            $action = $this->getDocumentAction($doc);

            if (!$action) continue;

            if ($request->filled('type') && $request->type !== 'all') {
                if (!in_array($request->type, ['document_upload', 'document_update'])) {
                    continue;
                }
            }

            $activities->push([
                'id' => $doc->id,
                'type' => $action['type'],
                'user' => $doc->user?->name ?? 'Unknown User',
                'user_role' => $doc->user?->role ?? 'unknown',
                'user_id' => $doc->user_id,
                'action' => $action['label'],
                'title' => $doc->title,
                'description' => $action['description'] ?? null,
                'status' => $doc->status,
                'created_at' => $doc->updated_at->diffForHumans(),
                'timestamp' => $doc->updated_at->toDateTimeString(),
                'metadata' => [
                    'document_id' => $doc->id,
                    'views' => $doc->views ?? 0,
                    'downloads' => $doc->downloads ?? 0,
                ],
            ]);
        }

        return $activities;
    }

    /**
     * Get final submission activities.
     */
    private function getFinalSubmissionActivities(Request $request)
    {
        $finalDocuments = FinalDocument::with(['student', 'document', 'verifiedBy'])
            ->latest('created_at')
            ->limit(100)
            ->get();

        $activities = collect();

        foreach ($finalDocuments as $final) {
            $action = $this->getFinalAction($final);

            if (!$action) continue;

            if ($request->filled('type') && $request->type !== 'all') {
                if (!in_array($request->type, ['final_submission', 'final_verification', 'final_archive'])) {
                    continue;
                }
                if ($action['type'] !== $request->type) {
                    continue;
                }
            }

            $activities->push([
                'id' => $final->id,
                'type' => $action['type'],
                'user' => $final->student?->name ?? 'Unknown Student',
                'user_role' => 'student',
                'user_id' => $final->student_id,
                'action' => $action['label'],
                'title' => $final->document?->title ?? 'Unknown Document',
                'description' => $action['description'] ?? null,
                'status' => $final->status,
                'created_at' => $final->updated_at->diffForHumans(),
                'timestamp' => $final->updated_at->toDateTimeString(),
                'metadata' => [
                    'final_document_id' => $final->id,
                    'verified_by' => $final->verifiedBy?->name,
                ],
            ]);
        }

        return $activities;
    }

    /**
     * Get user activities (registrations).
     */
    private function getUserActivities(Request $request)
    {
        $users = User::latest('created_at')
            ->limit(100)
            ->get();

        $activities = collect();

        foreach ($users as $user) {
            if ($request->filled('type') && $request->type !== 'all') {
                if ($request->type !== 'user_registration') {
                    continue;
                }
            }

            $activities->push([
                'id' => $user->id,
                'type' => 'user_registration',
                'user' => $user->name,
                'user_role' => $user->role,
                'user_id' => $user->id,
                'action' => 'registered on the platform',
                'title' => $user->email,
                'description' => "{$user->name} joined as a " . ucfirst($user->role),
                'status' => $user->email_verified_at ? 'verified' : 'unverified',
                'created_at' => $user->created_at->diffForHumans(),
                'timestamp' => $user->created_at->toDateTimeString(),
                'metadata' => [
                    'user_id' => $user->id,
                    'role' => $user->role,
                ],
            ]);
        }

        return $activities;
    }

    /**
     * Get saved document activities.
     */
    private function getSavedDocumentActivities(Request $request)
    {
        $savedDocuments = SavedDocument::with(['user', 'finalDocument.document'])
            ->latest('created_at')
            ->limit(100)
            ->get();

        $activities = collect();

        foreach ($savedDocuments as $saved) {
            if ($request->filled('type') && $request->type !== 'all') {
                if ($request->type !== 'saved_document') {
                    continue;
                }
            }

            $document = $saved->finalDocument?->document;

            $activities->push([
                'id' => $saved->id,
                'type' => 'saved_document',
                'user' => $saved->user?->name ?? 'Unknown User',
                'user_role' => $saved->user?->role ?? 'unknown',
                'user_id' => $saved->user_id,
                'action' => 'saved a document',
                'title' => $document?->title ?? 'Unknown Document',
                'description' => 'Saved to personal collection',
                'status' => 'saved',
                'created_at' => $saved->created_at->diffForHumans(),
                'timestamp' => $saved->created_at->toDateTimeString(),
                'metadata' => [
                    'saved_document_id' => $saved->id,
                    'document_id' => $document?->id,
                ],
            ]);
        }

        return $activities;
    }

    /**
     * Get document action based on status.
     */
    private function getDocumentAction($doc)
    {
        $actions = [
            'draft' => ['type' => 'document_upload', 'label' => 'uploaded a new document', 'description' => 'Saved as draft'],
            'pending_review' => ['type' => 'document_update', 'label' => 'submitted for review', 'description' => 'Waiting for review'],
            'under_review' => ['type' => 'document_update', 'label' => 'is under review', 'description' => 'Being reviewed by faculty'],
            'approved' => ['type' => 'document_update', 'label' => 'was approved', 'description' => 'Approved by reviewer'],
            'rejected' => ['type' => 'document_update', 'label' => 'was rejected', 'description' => 'Rejected by reviewer'],
            'published' => ['type' => 'document_update', 'label' => 'was published', 'description' => 'Published to repository'],
        ];

        return $actions[$doc->status] ?? null;
    }

    /**
     * Get final action based on status.
     */
    private function getFinalAction($final)
    {
        $actions = [
            'pending' => ['type' => 'final_submission', 'label' => 'submitted a final paper', 'description' => 'Waiting for verification'],
            'verified' => ['type' => 'final_verification', 'label' => 'verified a final paper', 'description' => 'Verified by faculty'],
            'archived' => ['type' => 'final_archive', 'label' => 'archived a final paper', 'description' => 'Archived for record'],
        ];

        return $actions[$final->status] ?? null;
    }

    /**
     * Get total activities.
     */
    private function getTotalActivities()
    {
        return Document::count() + FinalDocument::count() + User::count() + SavedDocument::count();
    }

    /**
     * Get today's activities.
     */
    private function getTodayActivities()
    {
        $today = now()->startOfDay();
        return Document::where('created_at', '>=', $today)->count() +
            FinalDocument::where('created_at', '>=', $today)->count() +
            User::where('created_at', '>=', $today)->count() +
            SavedDocument::where('created_at', '>=', $today)->count();
    }

    /**
     * Get this week's activities.
     */
    private function getWeekActivities()
    {
        $week = now()->startOfWeek();
        return Document::where('created_at', '>=', $week)->count() +
            FinalDocument::where('created_at', '>=', $week)->count() +
            User::where('created_at', '>=', $week)->count() +
            SavedDocument::where('created_at', '>=', $week)->count();
    }

    /**
     * Get this month's activities.
     */
    private function getMonthActivities()
    {
        $month = now()->startOfMonth();
        return Document::where('created_at', '>=', $month)->count() +
            FinalDocument::where('created_at', '>=', $month)->count() +
            User::where('created_at', '>=', $month)->count() +
            SavedDocument::where('created_at', '>=', $month)->count();
    }
}
