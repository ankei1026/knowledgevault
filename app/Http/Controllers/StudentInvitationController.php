<?php
// app/Http/Controllers/StudentInvitationController.php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class StudentInvitationController extends Controller
{
    /**
     * Show invitation page for a document
     */
    public function index(Document $document)
    {
        // Check if user owns the document
        if ($document->user_id !== Auth::id()) {
            abort(403, 'You do not have permission to manage invitations for this document.');
        }

        $invitations = $document->invitations()
            ->where('status', 'pending')
            ->latest()
            ->get();

        $collaborators = $document->collaborators()
            ->withPivot('role', 'status')
            ->get();

        return Inertia::render('Student/Invitations', [
            'document' => $document,
            'invitations' => $invitations,
            'collaborators' => $collaborators,
        ]);
    }

    /**
     * Send invitation to co-author or reviewer
     */
    public function send(Request $request, Document $document)
    {
        // Check if user owns the document
        if ($document->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'email' => 'required|email',
            'role' => 'required|in:co-author,reviewer',
            'message' => 'nullable|string|max:500',
        ]);

        // Check if user already exists
        $existingUser = User::where('email', $request->email)->first();
        
        // Check if already a collaborator
        if ($existingUser) {
            $existingCollaborator = $document->collaborators()
                ->where('user_id', $existingUser->id)
                ->exists();
                
            if ($existingCollaborator) {
                return back()->with('error', 'This user is already a collaborator on this document.');
            }
        }

        // Check for existing pending invitation
        $existingInvitation = Invitation::where('email', $request->email)
            ->where('document_id', $document->id)
            ->where('status', 'pending')
            ->first();

        if ($existingInvitation) {
            return back()->with('error', 'An invitation has already been sent to this email.');
        }

        // Create invitation
        $invitation = Invitation::create([
            'email' => $request->email,
            'token' => Str::random(64),
            'role' => $request->role,
            'document_id' => $document->id,
            'invited_by' => Auth::id(),
            'expires_at' => now()->addDays(7),
            'message' => $request->message,
            'permissions' => $this->getPermissionsForRole($request->role),
        ]);

        // Send email notification
        $this->sendInvitationEmail($invitation, $document);

        return back()->with('success', "Invitation sent to {$request->email} as {$request->role}.");
    }

    /**
     * Resend invitation
     */
    public function resend(Invitation $invitation)
    {
        // Check if user owns the document
        if ($invitation->document->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($invitation->status !== 'pending') {
            return back()->with('error', 'Cannot resend an already processed invitation.');
        }

        // Update expiration
        $invitation->update([
            'expires_at' => now()->addDays(7),
        ]);

        // Resend email
        $this->sendInvitationEmail($invitation, $invitation->document);

        return back()->with('success', 'Invitation resent successfully.');
    }

    /**
     * Cancel invitation
     */
    public function cancel(Invitation $invitation)
    {
        // Check if user owns the document
        if ($invitation->document->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $invitation->update(['status' => 'cancelled']);

        return back()->with('success', 'Invitation cancelled.');
    }

    /**
     * Remove collaborator
     */
    public function removeCollaborator(Document $document, User $user)
    {
        // Check if user owns the document
        if ($document->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Don't allow removing the owner
        if ($user->id === $document->user_id) {
            return back()->with('error', 'Cannot remove the document owner.');
        }

        $document->collaborators()->detach($user->id);

        return back()->with('success', "{$user->name} has been removed as a collaborator.");
    }

    /**
     * Get permissions based on role
     */
    private function getPermissionsForRole(string $role): array
    {
        return match ($role) {
            'co-author' => ['view', 'edit', 'comment', 'download'],
            'reviewer' => ['view', 'review', 'comment'],
            default => ['view'],
        };
    }

    /**
     * Send invitation email
     */
    private function sendInvitationEmail(Invitation $invitation, Document $document)
    {
        $acceptUrl = route('invitations.accept', $invitation->token);
        $declineUrl = route('invitations.decline', $invitation->token);

        // You can implement actual email sending here
        // For now, we'll log it
        \Log::info("Invitation sent to {$invitation->email} for document {$document->title}");
        \Log::info("Accept URL: {$acceptUrl}");
        
        // When email is configured, uncomment this:
        /*
        Mail::send('emails.document-invitation', [
            'invitation' => $invitation,
            'document' => $document,
            'acceptUrl' => $acceptUrl,
            'declineUrl' => $declineUrl,
        ], function ($message) use ($invitation, $document) {
            $message->to($invitation->email)
                ->subject("Invitation to collaborate on: {$document->title}");
        });
        */
    }
}