<?php
// database/migrations/2025_01_01_000005_create_document_collaborators_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_collaborators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['owner', 'co-author', 'reviewer', 'viewer'])->default('viewer');
            $table->enum('status', ['pending', 'active', 'inactive'])->default('pending');
            $table->json('permissions')->nullable();
            $table->timestamps();
            
            $table->unique(['document_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_collaborators');
    }
};