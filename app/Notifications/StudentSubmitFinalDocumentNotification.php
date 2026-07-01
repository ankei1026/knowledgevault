<?php
// app/Notifications/StudentSubmitFinalDocumentNotification.php

namespace App\Notifications;

use App\Models\FinalDocument;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudentSubmitFinalDocumentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $finalDocument;
    protected $student;
    protected $action;

    public function __construct(FinalDocument $finalDocument, User $student, string $action = 'submitted')
    {
        $this->finalDocument = $finalDocument;
        $this->student = $student;
        $this->action = $action;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database']; // Only database notifications, no email
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $documentTitle = $this->finalDocument->document->title;
        $studentName = $this->student->name;

        if ($this->action === 'submitted') {
            return [
                'type' => 'final_document_submitted',
                'title' => 'New Final Document Submitted',
                'message' => "Student {$studentName} submitted '{$documentTitle}' as a final paper.",
                'link' => route('faculty.final-submissions.show', $this->finalDocument->id),
                'data' => [
                    'student_id' => $this->student->id,
                    'student_name' => $studentName,
                    'document_title' => $documentTitle,
                    'final_document_id' => $this->finalDocument->id,
                    'status' => 'pending',
                ],
            ];
        } elseif ($this->action === 'verified') {
            return [
                'type' => 'final_document_verified',
                'title' => 'Final Document Verified',
                'message' => "Your final document '{$documentTitle}' has been verified and published.",
                'link' => route('documents.show', $this->finalDocument->id),
                'data' => [
                    'student_id' => $this->student->id,
                    'student_name' => $studentName,
                    'document_title' => $documentTitle,
                    'final_document_id' => $this->finalDocument->id,
                    'status' => 'verified',
                ],
            ];
        } elseif ($this->action === 'archived') {
            return [
                'type' => 'final_document_archived',
                'title' => 'Final Document Archived',
                'message' => "Your final document '{$documentTitle}' has been archived.",
                'link' => route('documents.show', $this->finalDocument->id),
                'data' => [
                    'student_id' => $this->student->id,
                    'student_name' => $studentName,
                    'document_title' => $documentTitle,
                    'final_document_id' => $this->finalDocument->id,
                    'status' => 'archived',
                ],
            ];
        }

        return [
            'type' => 'final_document_update',
            'title' => 'Final Document Update',
            'message' => "A final document has been updated.",
            'link' => route('faculty.final-submissions.show', $this->finalDocument->id),
            'data' => [
                'final_document_id' => $this->finalDocument->id,
            ],
        ];
    }

    /**
     * Get the database notification data.
     */
    public function toDatabase(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }
}
