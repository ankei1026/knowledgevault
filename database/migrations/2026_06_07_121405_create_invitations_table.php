<?php
// database/migrations/2025_01_01_000004_create_invitations_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitations', function (Blueprint $table) {
            $table->id();
            
            // Invitation details
            $table->string('email');
            $table->string('token')->unique();
            $table->enum('role', ['co-author', 'reviewer', 'viewer'])->default('viewer');
            $table->enum('status', ['pending', 'accepted', 'declined', 'expired'])->default('pending');
            
            // Document reference (optional - for document-specific invitations)
            $table->foreignId('document_id')->nullable()->constrained()->onDelete('cascade');
            
            // Who sent the invitation
            $table->foreignId('invited_by')->constrained('users')->onDelete('cascade');
            
            // Who accepted the invitation (if registered)
            $table->foreignId('accepted_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Expiration
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            
            // Additional data
            $table->text('message')->nullable();
            $table->json('permissions')->nullable(); // Specific permissions for the invitee
            
            $table->timestamps();
            
            // Indexes
            $table->index('email');
            $table->index('token');
            $table->index('status');
            $table->index(['document_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};