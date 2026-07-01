<?php
// app/Http/Controllers/Student/FinalDocumentController.php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\FinalDocument;
use App\Models\User;
use App\Models\Notification;
use App\Notifications\StudentSubmitFinalDocumentNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FinalDocumentController extends Controller
{
    /**
     * Display a listing of final documents.
     */
    public function index()
    {
        $finalDocuments = FinalDocument::with(['document', 'verifiedBy'])
            ->where('student_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $stats = [
            'total' => FinalDocument::where('student_id', auth()->id())->count(),
            'pending' => FinalDocument::where('student_id', auth()->id())
                ->where('status', 'pending')
                ->count(),
            'verified' => FinalDocument::where('student_id', auth()->id())
                ->where('status', 'verified')
                ->count(),
            'archived' => FinalDocument::where('student_id', auth()->id())
                ->where('status', 'archived')
                ->count(),
        ];

        return Inertia::render('Student/FinalDocuments', [
            'finalDocuments' => $finalDocuments,
            'stats' => $stats,
        ]);
    }

    /**
     * Submit a document as final paper.
     */
    public function submit(Request $request, Document $document)
    {
        // Validate that the document belongs to the student
        if ($document->user_id !== auth()->id()) {
            return back()->with('error', 'You do not own this document.');
        }

        // Check if document is approved
        if ($document->status !== 'approved') {
            return back()->with('error', 'Only approved documents can be submitted as final papers.');
        }

        // Check if already submitted
        $existing = FinalDocument::where('document_id', $document->id)
            ->where('student_id', auth()->id())
            ->first();

        if ($existing) {
            return back()->with('error', 'This document has already been submitted as a final paper.');
        }

        try {
            DB::beginTransaction();

            // Create final document record
            $finalDocument = FinalDocument::create([
                'document_id' => $document->id,
                'student_id' => auth()->id(),
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            // Update document status to published
            $document->status = 'published';
            $document->published_at = now();
            $document->save();

            // Get the student
            $student = auth()->user();

            // Send notification to all faculty members
            $facultyMembers = User::where('role', 'faculty')->get();

            foreach ($facultyMembers as $faculty) {
                // Using the notification class
                $faculty->notify(new StudentSubmitFinalDocumentNotification($finalDocument, $student, 'submitted'));

                // Or you can use the direct Notification model:
                // Notification::create([
                //     'user_id' => $faculty->id,
                //     'type' => 'final_document_submitted',
                //     'title' => 'New Final Document Submitted',
                //     'message' => "Student {$student->name} submitted '{$document->title}' as a final paper.",
                //     'link' => route('faculty.final-submissions.show', $finalDocument->id),
                //     'data' => [
                //         'student_id' => $student->id,
                //         'student_name' => $student->name,
                //         'document_title' => $document->title,
                //         'final_document_id' => $finalDocument->id,
                //     ],
                // ]);
            }

            DB::commit();

            return redirect()->route('student.final-documents')
                ->with('success', 'Document submitted as final paper successfully! Faculty have been notified.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to submit final paper: ' . $e->getMessage());
        }
    }

    /**
     * Show the final document submission confirmation.
     */
    public function create(Document $document)
    {
        // Validate ownership and status
        if ($document->user_id !== auth()->id()) {
            return redirect()->route('student.my-manuscripts')
                ->with('error', 'You do not own this document.');
        }

        if ($document->status !== 'approved') {
            return redirect()->route('student.my-manuscripts')
                ->with('error', 'Only approved documents can be submitted as final papers.');
        }

        return Inertia::render('Student/SubmitFinalPaper', [
            'document' => $document->load(['user']),
        ]);
    }

    /**
     * Show a specific final document.
     */
    public function show(FinalDocument $finalDocument)
    {
        // Check if the user owns this final document
        if ($finalDocument->student_id !== auth()->id()) {
            abort(403, 'You do not have permission to view this document.');
        }

        $finalDocument->load(['document', 'verifiedBy']);

        return Inertia::render('Student/FinalDocumentDetail', [
            'finalDocument' => $finalDocument,
        ]);
    }

    /**
     * Get final document stats for dashboard.
     */
    public function stats()
    {
        return response()->json([
            'total' => FinalDocument::where('student_id', auth()->id())->count(),
            'pending' => FinalDocument::where('student_id', auth()->id())
                ->where('status', 'pending')
                ->count(),
            'verified' => FinalDocument::where('student_id', auth()->id())
                ->where('status', 'verified')
                ->count(),
            'archived' => FinalDocument::where('student_id', auth()->id())
                ->where('status', 'archived')
                ->count(),
        ]);
    }
}
