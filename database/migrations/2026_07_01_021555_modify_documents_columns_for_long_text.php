<?php
// database/migrations/2026_07_01_000000_modify_documents_columns_for_long_text.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // Change abstract to longtext (supports up to 4GB)
            $table->longText('abstract')->nullable()->change();

            // Change description to longtext
            $table->longText('description')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // Revert back to text
            $table->text('abstract')->nullable()->change();
            $table->text('description')->nullable()->change();
        });
    }
};
