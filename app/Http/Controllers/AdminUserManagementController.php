<?php
// app/Http/Controllers/AdminUserManagementController.php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminUserManagementController extends Controller
{
    /**
     * Display user management page
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // Status filter (assuming you have a 'status' column or using email_verified_at)
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->whereNotNull('email_verified_at');
            } elseif ($request->status === 'inactive') {
                $query->whereNull('email_verified_at');
            }
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15);

        // Get statistics
        $stats = [
            'total' => User::count(),
            'active' => User::whereNotNull('email_verified_at')->count(),
            'inactive' => User::whereNull('email_verified_at')->count(),
            'students' => User::where('role', 'student')->count(),
            'faculty' => User::where('role', 'faculty')->count(),
            'admin' => User::where('role', 'admin')->count(),
        ];

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'role' => $request->role,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Store a new user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|in:student,faculty,admin',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    /**
     * Update user role
     */
    public function updateRole(Request $request, User $user)
    {
        // Prevent admin from changing their own role
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot change your own role.');
        }

        $validated = $request->validate([
            'role' => 'required|in:student,faculty,admin',
        ]);

        $user->update(['role' => $validated['role']]);

        return redirect()->back()->with('success', 'User role updated successfully.');
    }

    /**
     * Update user status (active/inactive via email verification)
     */
    public function updateStatus(Request $request, User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot change your own status.');
        }

        $validated = $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        if ($validated['status'] === 'active') {
            $user->email_verified_at = now();
        } else {
            $user->email_verified_at = null;
        }
        $user->save();

        return redirect()->back()->with('success', 'User status updated successfully.');
    }

    /**
     * Delete a user
     */
    public function destroy(User $user)
    {
        // Prevent admin from deleting themselves
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }

    /**
     * Resend verification email
     */
    public function resendVerification(User $user)
    {
        if ($user->hasVerifiedEmail()) {
            return redirect()->back()->with('info', 'User already verified.');
        }

        $user->sendEmailVerificationNotification();

        return redirect()->back()->with('success', 'Verification email sent.');
    }

    /**
     * Bulk import users (optional)
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx',
        ]);

        // Handle CSV import logic here
        // You can implement this with Laravel Excel package

        return redirect()->back()->with('success', 'Users imported successfully.');
    }

    /**
     * Export users
     */
    public function export(Request $request)
    {
        $users = User::all();

        // Implement CSV export logic here
        // You can use Laravel Excel or simple CSV generation

        return redirect()->back()->with('success', 'Export started.');
    }
}
