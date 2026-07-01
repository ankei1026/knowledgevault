<?php
// database/migrations/2025_01_01_000002_create_final_documents_table.php

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
        Schema::create('final_documents', function (Blueprint $table) {
            $table->id();

            // Link to original document
            $table->foreignId('document_id')
                ->constrained('documents')
                ->onDelete('cascade');

            // Student who submitted the final paper
            $table->foreignId('student_id')
                ->constrained('users')
                ->onDelete('cascade');

            // Status tracking
            $table->enum('status', [
                'pending',
                'verified',
                'archived'
            ])->default('pending');

            // Submission details
            $table->timestamp('submitted_at');
            $table->timestamp('verified_at')->nullable();
            $table->text('verification_notes')->nullable();

            // Verification by admin/faculty
            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            $table->timestamps();

            // Indexes
            $table->index('document_id');
            $table->index('student_id');
            $table->index('status');
            $table->index('submitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('final_documents');
    }
};
