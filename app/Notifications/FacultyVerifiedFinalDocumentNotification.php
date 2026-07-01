<?php
// app/Notifications/FacultyVerifiedFinalDocumentNotification.php

namespace App\Notifications;

use App\Models\FinalDocument;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class FacultyVerifiedFinalDocumentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $finalDocument;
    protected $faculty;
    protected $status;

    public function __construct(FinalDocument $finalDocument, User $faculty, string $status)
    {
        $this->finalDocument = $finalDocument;
        $this->faculty = $faculty;
        $this->status = $status;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $documentTitle = $this->finalDocument->document->title;
        $statusText = $this->status === 'verified' ? 'verified' : 'archived';
        $icon = $this->status === 'verified' ? '✅' : '📁';

        return [
            'type' => 'faculty_verified_final_document',
            'title' => "Final Document {$statusText}",
            'message' => "Your final document '{$documentTitle}' has been {$statusText} by {$this->faculty->name}.",
            'link' => route('my-manuscripts.show', $this->finalDocument->id),
            'data' => [
                'faculty_id' => $this->faculty->id,
                'faculty_name' => $this->faculty->name,
                'document_title' => $documentTitle,
                'final_document_id' => $this->finalDocument->id,
                'status' => $this->status,
                'verification_notes' => $this->finalDocument->verification_notes,
                'verified_at' => $this->finalDocument->verified_at?->toDateTimeString(),
            ],
        ];
    }

    public function toDatabase(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }
}
