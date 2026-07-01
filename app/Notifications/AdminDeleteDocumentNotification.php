<?php
// app/Notifications/AdminDeleteDocumentNotification.php

namespace App\Notifications;

use App\Models\Document;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminDeleteDocumentNotification extends Notification
{
    use Queueable;

    protected $document;
    protected $admin;
    protected $reason;

    public function __construct(Document $document, User $admin, ?string $reason = null)
    {
        $this->document = $document;
        $this->admin = $admin;
        $this->reason = $reason;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database']; // Only database notifications
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'document_deleted',
            'title' => 'Document Deleted by Admin',
            'message' => "Your document '{$this->document->title}' has been deleted by {$this->admin->name}.",
            'data' => [
                'document_id' => $this->document->id,
                'document_title' => $this->document->title,
                'admin_id' => $this->admin->id,
                'admin_name' => $this->admin->name,
                'reason' => $this->reason,
                'deleted_at' => now()->toDateTimeString(),
            ],
        ];
    }
}
