<?php
// app/Http/Controllers/AdminAllDocumentsController.php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\FinalDocument;
use App\Models\User;
use App\Models\Notification;
use App\Notifications\AdminDeleteDocumentNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminAllDocumentsController extends Controller
{
    /**
     * Display all documents with filtering and pagination.
     * Excludes documents that have been submitted as final papers.
     */
    public function index(Request $request)
    {
        // Get all document IDs that have been submitted as final papers
        $finalDocumentIds = FinalDocument::pluck('document_id')->toArray();

        $query = Document::with(['user', 'reviewer'])
            ->whereNotIn('id', $finalDocumentIds); // Exclude documents with final submissions

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('abstract', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%")
                    ->orWhereJsonContains('authors', ['name' => $search]);
            });
        }

        // Apply status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Apply date filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Apply sorting
        $sort = $request->get('sort', 'latest');
        switch ($sort) {
            case 'latest':
                $query->latest();
                break;
            case 'oldest':
                $query->oldest();
                break;
            case 'views':
                $query->orderBy('views', 'desc');
                break;
            case 'downloads':
                $query->orderBy('downloads', 'desc');
                break;
            default:
                $query->latest();
        }

        $documents = $query->paginate(20)->withQueryString();

        // Transform documents for display
        $documents->getCollection()->transform(function ($doc) {
            // Get authors from JSON
            $authors = [];
            $documentAuthors = $doc->authors ?? [];

            if ($doc->user) {
                $authors[] = $doc->user->name;
            }

            if (is_array($documentAuthors) && count($documentAuthors) > 0) {
                foreach ($documentAuthors as $author) {
                    if ($doc->user && isset($author['name']) && $author['name'] !== $doc->user->name) {
                        $authors[] = $author['name'];
                    }
                }
            }

            return [
                'id' => $doc->id,
                'title' => $doc->title,
                'abstract' => $doc->abstract,
                'status' => $doc->status,
                'authors' => $authors,
                'file_name' => $doc->file_name,
                'file_size' => $doc->file_size,
                'views' => $doc->views ?? 0,
                'downloads' => $doc->downloads ?? 0,
                'created_at' => $doc->created_at->format('M d, Y'),
                'updated_at' => $doc->updated_at->format('M d, Y'),
                'user' => $doc->user ? [
                    'id' => $doc->user->id,
                    'name' => $doc->user->name,
                    'email' => $doc->user->email,
                    'role' => $doc->user->role,
                ] : null,
                'reviewer' => $doc->reviewer ? [
                    'id' => $doc->reviewer->id,
                    'name' => $doc->reviewer->name,
                ] : null,
                'can_delete' => in_array($doc->status, ['draft', 'rejected', 'pending_review']),
            ];
        });

        // Get statistics (excluding final papers)
        $finalDocumentIds = FinalDocument::pluck('document_id')->toArray();

        $stats = [
            'total' => Document::whereNotIn('id', $finalDocumentIds)->count(),
            'draft' => Document::whereNotIn('id', $finalDocumentIds)->where('status', 'draft')->count(),
            'pending_review' => Document::whereNotIn('id', $finalDocumentIds)->where('status', 'pending_review')->count(),
            'approved' => Document::whereNotIn('id', $finalDocumentIds)->where('status', 'approved')->count(),
            'rejected' => Document::whereNotIn('id', $finalDocumentIds)->where('status', 'rejected')->count(),
            'published' => Document::whereNotIn('id', $finalDocumentIds)->where('status', 'published')->count(),
            'total_views' => Document::whereNotIn('id', $finalDocumentIds)->sum('views'),
            'total_downloads' => Document::whereNotIn('id', $finalDocumentIds)->sum('downloads'),
            'total_size' => $this->getTotalSize($finalDocumentIds),
        ];

        // Get unique statuses for filter
        $statuses = [
            'all' => 'All Status',
            'draft' => 'Draft',
            'pending_review' => 'Pending Review',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'published' => 'Published',
        ];

        return Inertia::render('Admin/AllDocuments', [
            'documents' => $documents,
            'stats' => $stats,
            'statuses' => $statuses,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
                'date_from' => $request->input('date_from', ''),
                'date_to' => $request->input('date_to', ''),
                'sort' => $request->input('sort', 'latest'),
            ],
        ]);
    }

    /**
     * Delete a document.
     */
    public function destroy(Request $request, $id)
    {
        $document = Document::with(['user'])->findOrFail($id);

        // Check if document has final submission
        $hasFinalSubmission = FinalDocument::where('document_id', $document->id)->exists();
        if ($hasFinalSubmission) {
            return back()->with('error', 'Cannot delete a document that has been submitted as a final paper.');
        }

        // Only allow deletion of draft, rejected, or pending_review documents
        if (!in_array($document->status, ['draft', 'rejected', 'pending_review'])) {
            return back()->with('error', 'This document cannot be deleted. Only draft, rejected, or pending review documents can be deleted.');
        }

        $reason = $request->input('reason', 'No reason provided.');

        try {
            DB::beginTransaction();

            // Get the user (owner) of the document
            $user = $document->user;

            // Delete the file from storage
            if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }

            // Delete related data (invitations, collaborators, etc.)
            $document->collaborators()->detach();
            $document->invitations()->delete();

            // Delete the document
            $document->delete();

            // Send notification to the user if they exist
            if ($user) {
                $admin = auth()->user();
                $user->notify(new AdminDeleteDocumentNotification($document, $admin, $reason));
            }

            DB::commit();

            return back()->with('success', "Document '{$document->title}' has been deleted successfully. User has been notified.");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete document: ' . $e->getMessage());
        }
    }

    /**
     * Bulk delete documents.
     */
    public function bulkDestroy(Request $request)
    {
        // Log the incoming request
        Log::info('Bulk delete request received', [
            'ids' => $request->input('ids'),
            'reason' => $request->input('reason'),
            'user' => auth()->user()->id,
        ]);

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:documents,id',
            'reason' => 'nullable|string|max:500',
        ]);

        Log::info('Validation passed', ['validated' => $validated]);

        $deletedCount = 0;
        $errors = [];
        $deletedTitles = [];

        foreach ($validated['ids'] as $id) {
            try {
                Log::info('Processing document ID: ' . $id);

                $document = Document::with(['user'])->findOrFail($id);

                // Check if document has final submission
                $hasFinalSubmission = FinalDocument::where('document_id', $document->id)->exists();
                if ($hasFinalSubmission) {
                    $errors[] = "Document '{$document->title}' has a final submission and cannot be deleted.";
                    Log::warning('Document has final submission', ['id' => $id, 'title' => $document->title]);
                    continue;
                }

                if (!in_array($document->status, ['draft', 'rejected', 'pending_review'])) {
                    $errors[] = "Document '{$document->title}' cannot be deleted (status: {$document->status}).";
                    Log::warning('Document cannot be deleted', ['id' => $id, 'status' => $document->status]);
                    continue;
                }

                $reason = $validated['reason'] ?? 'Bulk deletion by admin.';
                $deletedTitles[] = $document->title;

                // Delete the file
                if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
                    Storage::disk('public')->delete($document->file_path);
                    Log::info('File deleted', ['path' => $document->file_path]);
                }

                // Delete related data
                $document->collaborators()->detach();
                $document->invitations()->delete();

                // Get user before deleting
                $user = $document->user;

                // Delete the document
                $document->delete();
                Log::info('Document deleted', ['id' => $id]);

                // Send notification
                if ($user) {
                    $admin = auth()->user();
                    $user->notify(new AdminDeleteDocumentNotification($document, $admin, $reason));
                    Log::info('Notification sent to user', ['user_id' => $user->id]);
                }

                $deletedCount++;
            } catch (\Exception $e) {
                Log::error('Error deleting document', ['id' => $id, 'error' => $e->getMessage()]);
                $errors[] = "Failed to delete document ID {$id}: " . $e->getMessage();
            }
        }

        $message = "Successfully deleted {$deletedCount} documents.";
        if (!empty($deletedTitles)) {
            $message .= " Deleted: " . implode(', ', $deletedTitles);
        }

        Log::info('Bulk delete completed', [
            'deleted_count' => $deletedCount,
            'errors' => $errors,
            'deleted_titles' => $deletedTitles,
        ]);

        if (count($errors) > 0) {
            return back()->with('warning', $message . " Errors: " . implode(' ', $errors));
        }

        return back()->with('success', $message);
    }

    /**
     * Get total storage size excluding final papers.
     */
    private function getTotalSize(array $excludeIds = []): string
    {
        $query = Document::query();

        if (!empty($excludeIds)) {
            $query->whereNotIn('id', $excludeIds);
        }

        $totalSize = $query->sum('file_size');

        if ($totalSize < 1024) {
            return $totalSize . ' B';
        } elseif ($totalSize < 1048576) {
            return round($totalSize / 1024, 1) . ' KB';
        } elseif ($totalSize < 1073741824) {
            return round($totalSize / 1048576, 1) . ' MB';
        }

        return round($totalSize / 1073741824, 1) . ' GB';
    }

    /**
     * Get document statistics.
     */
    private function getDocumentStats()
    {
        $finalDocumentIds = FinalDocument::pluck('document_id')->toArray();

        return [
            'total' => Document::whereNotIn('id', $finalDocumentIds)->count(),
            'draft' => Document::whereNotIn('id', $finalDocumentIds)->where('status', 'draft')->count(),
            'pending_review' => Document::whereNotIn('id', $finalDocumentIds)->where('status', 'pending_review')->count(),
            'approved' => Document::whereNotIn('id', $finalDocumentIds)->where('status', 'approved')->count(),
            'rejected' => Document::whereNotIn('id', $finalDocumentIds)->where('status', 'rejected')->count(),
            'published' => Document::whereNotIn('id', $finalDocumentIds)->where('status', 'published')->count(),
            'total_views' => Document::whereNotIn('id', $finalDocumentIds)->sum('views'),
            'total_downloads' => Document::whereNotIn('id', $finalDocumentIds)->sum('downloads'),
        ];
    }
}
