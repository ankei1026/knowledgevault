<?php
// app/Models/Document.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'abstract',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'keywords',
        'authors',
        'doi',
        'publication_year',
        'status',
        'reviewer_feedback',
        'submitted_at',
        'reviewed_at',
        'published_at',
        'user_id',
        'reviewer_id',
        'views',
        'downloads',
        'citations',
        'metadata',
        'is_featured',
        'is_public',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'keywords' => 'array',
        'authors' => 'array',
        'metadata' => 'array',
        'submitted_at' => 'date',
        'reviewed_at' => 'date',
        'published_at' => 'date',
        'is_featured' => 'boolean',
        'is_public' => 'boolean',
        'file_size' => 'integer',
        'views' => 'integer',
        'downloads' => 'integer',
        'citations' => 'integer',
    ];

    /**
     * Get the user who owns the document
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the reviewer assigned to this document
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }


    /**
     * Scope for documents pending review
     */
    public function scopePendingReview($query)
    {
        return $query->where('status', 'pending_review')->orWhere('status', 'under_review');
    }

    /**
     * Scope for approved documents
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for published documents
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope for draft documents
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope for rejected documents
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope for documents by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for featured documents
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for public documents
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Get the file size in human readable format
     */
    public function getFormattedFileSizeAttribute(): string
    {
        $bytes = $this->file_size;

        if ($bytes < 1024) {
            return $bytes . ' B';
        } elseif ($bytes < 1048576) {
            return round($bytes / 1024, 1) . ' KB';
        } elseif ($bytes < 1073741824) {
            return round($bytes / 1048576, 1) . ' MB';
        }

        return round($bytes / 1073741824, 1) . ' GB';
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'approved' => 'green',
            'pending_review', 'under_review' => 'yellow',
            'rejected' => 'red',
            'published' => 'blue',
            default => 'gray',
        };
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending_review' => 'Pending Review',
            'under_review' => 'Under Review',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'published' => 'Published',
            default => 'Draft',
        };
    }

    /**
     * Increment view count
     */
    public function incrementViews(): void
    {
        $this->increment('views');
    }

    /**
     * Increment download count
     */
    public function incrementDownloads(): void
    {
        $this->increment('downloads');
    }

    /**
     * Submit document for review
     */
    public function submitForReview(): void
    {
        $this->update([
            'status' => 'pending_review',
            'submitted_at' => now(),
        ]);
    }

    /**
     * Approve document
     */
    public function approve(?string $feedback = null): void
    {
        $this->update([
            'status' => 'approved',
            'reviewer_feedback' => $feedback,
            'reviewed_at' => now(),
        ]);
    }

    /**
     * Reject document
     */
    public function reject(string $feedback): void
    {
        $this->update([
            'status' => 'rejected',
            'reviewer_feedback' => $feedback,
            'reviewed_at' => now(),
        ]);
    }

    /**
     * Publish document
     */
    public function publish(): void
    {
        $this->update([
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    /**
     * Check if document is editable by user
     */
    public function isEditableBy(User $user): bool
    {
        return $user->id === $this->user_id || $user->role === 'admin';
    }

    /**
     * Check if document is reviewable by user
     */
    public function isReviewableBy(User $user): bool
    {
        return $user->role === 'faculty' || $user->role === 'admin';
    }
}
