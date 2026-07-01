<?php
// database/migrations/2026_06_30_235124_create_saved_documents_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saved_documents', function (Blueprint $table) {
            $table->id();

            // User who saved the document
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

            // The final document being saved (from final_documents table)
            $table->foreignId('final_document_id')
                ->constrained('final_documents')
                ->onDelete('cascade');

            // Optional notes for the saved document
            $table->text('notes')->nullable();

            // Tags for organization (stored as JSON)
            $table->json('tags')->nullable();

            $table->timestamps();

            // Unique constraint to prevent duplicate saves
            $table->unique(['user_id', 'final_document_id']);

            // Indexes for performance
            $table->index('user_id');
            $table->index('final_document_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_documents');
    }
};
