<?php
// app/Http/Controllers/StudentFacultyReviewerController.php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Document;
use App\Models\Invitation;
use App\Notifications\ManuscriptReviewerAssignedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class StudentFacultyReviewerController extends Controller
{
    /**
     * Show the page to select a faculty reviewer
     */
    public function index($documentId)
    {
        $document = Document::where('user_id', Auth::id())
            ->findOrFail($documentId);

        // Get all faculty members
        $facultyMembers = User::where('role', 'faculty')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('Student/SelectReviewer', [
            'document' => $document,
            'facultyMembers' => $facultyMembers,
        ]);
    }

    /**
     * Assign a faculty reviewer to the document
     */
    public function assignReviewer(Request $request, $documentId)
    {
        $document = Document::where('user_id', Auth::id())
            ->findOrFail($documentId);

        $request->validate([
            'reviewer_id' => 'required|exists:users,id',
            'message' => 'nullable|string|max:500',
        ]);

        $reviewer = User::findOrFail($request->reviewer_id);

        // Check if the selected user is actually a faculty
        if ($reviewer->role !== 'faculty') {
            return back()->with('error', 'Selected user is not a faculty member.');
        }

        // Check if document already has a reviewer
        if ($document->reviewer_id) {
            $oldReviewer = User::find($document->reviewer_id);
            return back()->with('warning', "Document already has a reviewer: {$oldReviewer->name}. Remove them first if you want to change.");
        }

        // Update document with reviewer
        $document->update([
            'reviewer_id' => $request->reviewer_id,
        ]);

        // Create invitation for the reviewer
        $invitation = Invitation::updateOrCreate(
            [
                'document_id' => $document->id,
                'email' => $reviewer->email,
                'role' => 'reviewer',
            ],
            [
                'token' => Str::random(64),
                'invited_by' => Auth::id(),
                'expires_at' => now()->addDays(7),
                'status' => 'pending',
                'message' => $request->message,
                'permissions' => ['view', 'review', 'comment'],
            ]
        );

        // Send notification to the reviewer
        try {
            $reviewer->notify(new ManuscriptReviewerAssignedNotification($document, Auth::user(), 'reviewer'));
        } catch (\Exception $e) {
            // Log error but continue
            \Log::error('Failed to send notification: ' . $e->getMessage());
        }

        // Also notify the student that reviewer was assigned
        try {
            Auth::user()->notify(new ManuscriptReviewerAssignedNotification($document, Auth::user(), 'assigned_reviewer'));
        } catch (\Exception $e) {
            \Log::error('Failed to send notification to student: ' . $e->getMessage());
        }

        return redirect()->route('student.documents.show', $document->id)
            ->with('success', "Reviewer assigned successfully! {$reviewer->name} has been notified.");
    }

    /**
     * Get all faculty members (for API/JSON requests)
     */
    public function getFacultyList()
    {
        $facultyMembers = User::where('role', 'faculty')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return response()->json($facultyMembers);
    }

    /**
     * Remove assigned reviewer
     */
    public function removeReviewer($documentId)
    {
        $document = Document::where('user_id', Auth::id())
            ->findOrFail($documentId);

        if (!$document->reviewer_id) {
            return back()->with('error', 'No reviewer assigned to this document.');
        }

        $oldReviewer = User::find($document->reviewer_id);

        $document->update([
            'reviewer_id' => null,
        ]);

        // Delete associated invitations
        Invitation::where('document_id', $document->id)
            ->where('role', 'reviewer')
            ->delete();

        return back()->with('success', "Reviewer {$oldReviewer->name} removed successfully.");
    }

    /**
     * Resend review invitation
     */
    public function resendInvitation($documentId)
    {
        $document = Document::where('user_id', Auth::id())
            ->findOrFail($documentId);

        if (!$document->reviewer_id) {
            return back()->with('error', 'No reviewer assigned to this document.');
        }

        $reviewer = User::find($document->reviewer_id);

        if (!$reviewer) {
            return back()->with('error', 'Reviewer not found.');
        }

        // Update or create invitation
        $invitation = Invitation::updateOrCreate(
            [
                'document_id' => $document->id,
                'email' => $reviewer->email,
                'role' => 'reviewer',
            ],
            [
                'token' => Str::random(64),
                'invited_by' => Auth::id(),
                'expires_at' => now()->addDays(7),
                'status' => 'pending',
                'permissions' => ['view', 'review', 'comment'],
            ]
        );

        // Resend notification
        try {
            $reviewer->notify(new ManuscriptReviewerAssignedNotification($document, Auth::user(), 'reviewer'));
        } catch (\Exception $e) {
            \Log::error('Failed to resend notification: ' . $e->getMessage());
            return back()->with('warning', "Invitation resent but notification email failed. Reviewer can still access via dashboard.");
        }

        return back()->with('success', "Invitation resent to {$reviewer->name}.");
    }

    /**
     * Get documents pending review for a faculty member
     */
    public function getPendingReviews()
    {
        $user = Auth::user();

        if ($user->role !== 'faculty') {
            abort(403);
        }

        $pendingDocuments = Document::where('reviewer_id', $user->id)
            ->where('status', 'pending_review')
            ->with('user')
            ->latest()
            ->get();

        return Inertia::render('Faculty/PendingReviews', [
            'documents' => $pendingDocuments,
        ]);
    }
}
