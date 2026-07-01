<?php
// app/Http/Controllers/NotificationController.php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Notification::forUser($user->id)
            ->latest();

        if ($request->filter === 'unread') {
            $query->whereNull('read_at');
        }

        if ($request->filter === 'read') {
            $query->whereNotNull('read_at');
        }

        $notifications = $query->paginate(20);
        $unreadCount = Notification::forUser($user->id)
            ->whereNull('read_at')
            ->count();

        // Check if the request wants JSON (for API calls)
        if ($request->wantsJson() || $request->has('unread')) {
            return response()->json([
                'notifications' => $notifications->items(),
                'unread_count' => $unreadCount,
                'total' => $notifications->total(),
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
            ]);
        }

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
            'filters' => [
                'filter' => $request->input('filter', 'all'),
            ],
        ]);
    }

    /**
     * Get unread notifications (AJAX endpoint).
     */
    public function getUnread()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'notifications' => [],
                    'unread_count' => 0,
                ]);
            }

            $notifications = Notification::forUser($user->id)
                ->whereNull('read_at')
                ->latest()
                ->limit(10)
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'type' => $notification->type,
                        'title' => $notification->title,
                        'message' => $notification->message,
                        'link' => $notification->link,
                        'created_at' => $notification->created_at->diffForHumans(),
                        'read_at' => $notification->read_at,
                        'data' => $notification->data,
                    ];
                });

            return response()->json([
                'notifications' => $notifications,
                'unread_count' => Notification::forUser($user->id)
                    ->whereNull('read_at')
                    ->count(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching unread notifications: ' . $e->getMessage());
            return response()->json([
                'notifications' => [],
                'unread_count' => 0,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead($id)
    {
        try {
            $notification = Notification::forUser(Auth::id())
                ->findOrFail($id);

            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error marking notification as read: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read.',
            ], 500);
        }
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        try {
            Notification::forUser(Auth::id())
                ->whereNull('read_at')
                ->update([
                    'read_at' => now(),
                ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'All notifications marked as read.',
                ]);
            }

            return back()->with('success', 'All notifications marked as read.');
        } catch (\Exception $e) {
            \Log::error('Error marking all notifications as read: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark all notifications as read.',
            ], 500);
        }
    }
}
