<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{


    public function index(Request $request)
    {
        $user = Auth::user();

        $notifications = $user->notifications()
            ->latest()
            ->paginate(20);

        $unreadCount = $user->unreadNotifications->count();

        if ($request->wantsJson() || $request->has('unread')) {
            return response()->json([
                'notifications' => $notifications->items(),
                'unread_count' => $unreadCount,
            ]);
        }

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function getUnread()
    {
        $user = Auth::user();

        return response()->json([
            'notifications' => $user->unreadNotifications,
            'unread_count' => $user->unreadNotifications->count(),
        ]);
    }
}
