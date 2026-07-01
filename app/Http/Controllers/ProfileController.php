<?php
// app/Http/Controllers/ProfileController.php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the user's profile.
     */
    public function index()
    {
        $user = Auth::user();

        return Inertia::render('Profile', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at->format('M d, Y'),
                'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->format('M d, Y') : null,
            ],
            'stats' => $this->getUserStats($user),
        ]);
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Check current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors([
                'current_password' => 'The current password is incorrect.',
            ])->with('error', 'The current password is incorrect.');
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return back()->with('success', 'Password updated successfully!');
    }

    /**
     * Get user statistics.
     */
    private function getUserStats($user)
    {
        $stats = [
            'documents' => 0,
            'saved_documents' => 0,
            'final_submissions' => 0,
        ];

        if ($user->role === 'student') {
            $stats['documents'] = \App\Models\Document::where('user_id', $user->id)->count();
            $stats['saved_documents'] = \App\Models\SavedDocument::where('user_id', $user->id)->count();
            $stats['final_submissions'] = \App\Models\FinalDocument::where('student_id', $user->id)->count();
        } elseif ($user->role === 'faculty') {
            $stats['documents'] = \App\Models\Document::where('reviewer_id', $user->id)->count();
            $stats['saved_documents'] = \App\Models\SavedDocument::where('user_id', $user->id)->count();
        } elseif ($user->role === 'admin') {
            $stats['documents'] = \App\Models\Document::count();
            $stats['saved_documents'] = \App\Models\SavedDocument::count();
            $stats['final_submissions'] = \App\Models\FinalDocument::count();
        }

        return $stats;
    }
}
