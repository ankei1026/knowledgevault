<?php
// app/Notifications/ReviewerResponseNotification.php

namespace App\Notifications;

use App\Models\Document;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReviewerResponseNotification extends Notification
{
    use Queueable;

    protected $document;
    protected $reviewer;
    protected $status;
    protected $feedback;

    public function __construct(Document $document, User $reviewer, string $status, ?string $feedback = null)
    {
        $this->document = $document;
        $this->reviewer = $reviewer;
        $this->status = $status;
        $this->feedback = $feedback;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $statusText = $this->status === 'approved' ? 'Approved' : 'Rejected';
        $statusColor = $this->status === 'approved' ? 'green' : 'red';

        $mail = (new MailMessage)
            ->subject("Review Response: {$this->document->title} - {$statusText}")
            ->greeting("Hello {$notifiable->name}!")
            ->line("{$this->reviewer->name} has {$this->status} your manuscript: **{$this->document->title}**");

        if ($this->feedback) {
            $mail->line("**Reviewer Feedback:**");
            $mail->line($this->feedback);
        }

        $mail->action('View Manuscript', url("/documents/{$this->document->id}"));

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'reviewer_response',
            'status' => $this->status,
            'document_id' => $this->document->id,
            'document_title' => $this->document->title,
            'reviewer_id' => $this->reviewer->id,
            'reviewer_name' => $this->reviewer->name,
            'feedback' => $this->feedback,
            'message' => "{$this->reviewer->name} {$this->status} your manuscript: {$this->document->title}",
            'action_url' => "/documents/{$this->document->id}",
            'action_text' => 'View Response',
        ];
    }
}
