<?php
// database/migrations/2025_01_01_000001_create_documents_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();

            // Basic document information
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('abstract')->nullable();

            // File information
            $table->string('file_path');
            $table->string('file_name');
            $table->integer('file_size');
            $table->string('mime_type');

            // Document metadata
            $table->json('keywords')->nullable();
            $table->json('authors')->nullable();
            $table->string('doi')->nullable(); // Digital Object Identifier
            $table->year('publication_year')->nullable();

            // Status tracking
            $table->enum('status', [
                'draft',
                'pending_review',
                'under_review',
                'approved',
                'rejected',
                'published'
            ])->default('draft');

            // Review information
            $table->text('reviewer_feedback')->nullable();
            $table->date('submitted_at')->nullable();
            $table->date('reviewed_at')->nullable();
            $table->date('published_at')->nullable();

            // Relationships
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->onDelete('set null');

            // Tracking metrics
            $table->integer('views')->default(0);
            $table->integer('downloads')->default(0);
            $table->integer('citations')->default(0);

            // Additional metadata
            $table->json('metadata')->nullable(); // For extra flexible data
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_public')->default(true);

            $table->timestamps();

            // Indexes for performance
            $table->index('status');
            $table->index('user_id');
            $table->index('created_at');
            $table->index(['status', 'created_at']);
            $table->fullText(['title', 'description', 'abstract']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
