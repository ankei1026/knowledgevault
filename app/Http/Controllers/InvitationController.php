<?php
// app/Http/Controllers/InvitationController.php

namespace App\Http\Controllers;

use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class InvitationController extends Controller
{
    /**
     * Accept invitation
     */
    public function accept($token)
    {
        $invitation = Invitation::where('token', $token)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->firstOrFail();
        
        // If user is logged in, check email match
        if (Auth::check()) {
            if (Auth::user()->email !== $invitation->email) {
                return redirect()->route('dashboard')
                    ->with('error', 'This invitation was sent to a different email address.');
            }
            
            // Add as collaborator
            $invitation->document->collaborators()->attach(Auth::id(), [
                'role' => $invitation->role,
                'status' => 'active',
                'permissions' => json_encode($invitation->permissions),
            ]);
            
            $invitation->update([
                'status' => 'accepted',
                'accepted_by' => Auth::id(),
                'accepted_at' => now(),
            ]);
            
            return redirect()->route('documents.show', $invitation->document_id)
                ->with('success', "You are now a {$invitation->role} on this document.");
        }
        
        // Store token in session for after registration/login
        session(['invitation_token' => $token]);
        
        return redirect()->route('register')
            ->with('info', 'Please create an account or login to accept this invitation.');
    }
    
    /**
     * Decline invitation
     */
    public function decline($token)
    {
        $invitation = Invitation::where('token', $token)
            ->where('status', 'pending')
            ->firstOrFail();
        
        $invitation->update(['status' => 'declined']);
        
        return redirect()->route('home')
            ->with('info', 'Invitation declined.');
    }
}