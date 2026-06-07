<?php
// app/Notifications/ManuscriptReviewerAssignedNotification.php

namespace App\Notifications;

use App\Models\Document;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ManuscriptReviewerAssignedNotification extends Notification
{
    use Queueable;

    protected $document;
    protected $assignedBy;
    protected $role;

    /**
     * Create a new notification instance.
     */
    public function __construct(Document $document, User $assignedBy, string $role = 'reviewer')
    {
        $this->document = $document;
        $this->assignedBy = $assignedBy;
        $this->role = $role;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $roleText = $this->role === 'reviewer' ? 'reviewer' : 'co-author';

        return (new MailMessage)
            ->subject("Manuscript {$roleText} assignment: {$this->document->title}")
            ->greeting("Hello {$notifiable->name}!")
            ->line("You have been assigned as a {$roleText} for the manuscript: **{$this->document->title}**")
            ->line("Assigned by: {$this->assignedBy->name}")
            ->action('View Manuscript', url("/documents/{$this->document->id}"))
            ->line("Please review the document and provide your feedback.")
            ->line('Thank you for contributing to ASC KnowledgeVault!');
    }

    /**
     * Get the array representation of the notification (for database).
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'manuscript_assigned',
            'role' => $this->role,
            'document_id' => $this->document->id,
            'document_title' => $this->document->title,
            'assigned_by_id' => $this->assignedBy->id,
            'assigned_by_name' => $this->assignedBy->name,
            'message' => "{$this->assignedBy->name} assigned you as a {$this->role} for: {$this->document->title}",
            'action_url' => "/documents/{$this->document->id}",
            'action_text' => 'View Manuscript',
        ];
    }
}
