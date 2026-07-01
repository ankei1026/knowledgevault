<?php
// app/Models/SavedDocument.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedDocument extends Model
{
    protected $table = 'saved_documents';

    protected $fillable = [
        'user_id',
        'final_document_id',
        'notes',
        'tags',
        'folder',
    ];

    protected $casts = [
        'tags' => 'array',
    ];

    /**
     * Get the user who saved the document.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the final document.
     */
    public function finalDocument(): BelongsTo
    {
        return $this->belongsTo(FinalDocument::class);
    }

    /**
     * Get the document through the final document relationship.
     * This is a helper method to access the document directly.
     */
    public function getDocumentAttribute()
    {
        return $this->finalDocument?->document;
    }

    /**
     * Scope for a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for a specific folder.
     */
    public function scopeInFolder($query, $folder)
    {
        return $query->where('folder', $folder);
    }
}
