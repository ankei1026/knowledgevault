<?php
// app/Http/Controllers/StudentMyManuscriptController.php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentMyManuscriptController extends Controller
{
    /**
     * Display a listing of the student's manuscripts.
     */
    public function index(Request $request)
    {
        $query = Document::where('user_id', auth()->id())
            ->with(['reviewer', 'collaborators', 'finalSubmission']);

        // Apply status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('abstract', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%")
                    ->orWhereJsonContains('authors', $search);
            });
        }

        // Apply sorting
        switch ($request->sort) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'title_asc':
                $query->orderBy('title', 'asc');
                break;
            case 'title_desc':
                $query->orderBy('title', 'desc');
                break;
            case 'views':
                $query->orderBy('views', 'desc');
                break;
            case 'downloads':
                $query->orderBy('downloads', 'desc');
                break;
            default: // latest
                $query->orderBy('created_at', 'desc');
                break;
        }

        $documents = $query->paginate(12);

        // Transform documents to include final submission status
        $documents->getCollection()->transform(function ($document) {
            $document->final_submission = $document->finalSubmission;
            return $document;
        });

        return Inertia::render('Student/MyManuscripts', [
            'documents' => $documents,
            'stats' => $this->getStats(),
            'filters' => [
                'status' => $request->input('status', 'all'),
                'search' => $request->input('search', ''),
                'sort' => $request->input('sort', 'latest'),
            ],
        ]);
    }

    /**
     * Get statistics for the student's manuscripts.
     */
    private function getStats(): array
    {
        $userId = auth()->id();

        return [
            'total' => Document::where('user_id', $userId)->count(),
            'draft' => Document::where('user_id', $userId)
                ->where('status', 'draft')
                ->count(),
            'pending_review' => Document::where('user_id', $userId)
                ->where('status', 'pending_review')
                ->count(),
            'approved' => Document::where('user_id', $userId)
                ->where('status', 'approved')
                ->count(),
            'rejected' => Document::where('user_id', $userId)
                ->where('status', 'rejected')
                ->count(),
            'published' => Document::where('user_id', $userId)
                ->where('status', 'published')
                ->count(),
            'total_views' => Document::where('user_id', $userId)->sum('views'),
            'total_downloads' => Document::where('user_id', $userId)->sum('downloads'),
            'total_citations' => Document::where('user_id', $userId)->sum('citations'),
        ];
    }

    /**
     * Show a specific manuscript.
     */
    // app/Http/Controllers/Student/StudentMyManuscriptController.php

    public function show($id)
    {
        $document = Document::with([
            'user',
            'reviewer',
            'collaborators',
            'finalSubmission',
            'finalSubmission.verifiedBy'
        ])
            ->where('user_id', auth()->id())
            ->findOrFail($id);

        // Calculate stats with proper fallback values
        $stats = [
            'views' => $document->views ?? 0,
            'downloads' => $document->downloads ?? 0,
            'citations' => $document->citations ?? 0,
            'submitted_at' => $document->submitted_at ?? null,
            'reviewed_at' => $document->reviewed_at ?? null,
        ];

        // Get authors as array
        $authors = $document->authors ?? [];

        return Inertia::render('Student/MyManuscriptDetail', [
            'document' => $document,
            'reviewHistory' => [],
            'stats' => $stats,
            'authors' => $authors, // Pass authors separately
        ]);
    }


    /**
     * Add a co-author to the document.
     */
    public function addAuthor(Request $request, $id)
    {
        $document = Document::where('user_id', auth()->id())
            ->findOrFail($id);

        // Only allow if status is draft or rejected
        if (!in_array($document->status, ['draft', 'rejected'])) {
            return back()->with('error', 'Cannot add authors when document is not in draft or rejected status.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        // Get current authors array
        $authors = $document->authors ?? [];

        // Check if author already exists (by name)
        $exists = collect($authors)->contains(function ($author) use ($validated) {
            return $author['name'] === $validated['name'];
        });

        if ($exists) {
            return back()->with('error', 'This author is already in the list.');
        }

        // Add new author
        $authors[] = [
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
        ];

        $document->authors = $authors;
        $document->save();

        return back()->with('success', 'Co-author added successfully!');
    }

    /**
     * Remove a co-author from the document.
     */
    public function removeAuthor(Request $request, $id)
    {
        $document = Document::where('user_id', auth()->id())
            ->findOrFail($id);

        // Only allow if status is draft or rejected
        if (!in_array($document->status, ['draft', 'rejected'])) {
            return back()->with('error', 'Cannot remove authors when document is not in draft or rejected status.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Get current authors array
        $authors = $document->authors ?? [];

        // Filter out the author to remove
        $authors = array_filter($authors, function ($author) use ($validated) {
            return $author['name'] !== $validated['name'];
        });

        // Re-index array
        $authors = array_values($authors);

        $document->authors = $authors;
        $document->save();

        return back()->with('success', 'Co-author removed successfully!');
    }

    /**
     * Update a co-author's details.
     */
    public function updateAuthor(Request $request, $id)
    {
        $document = Document::where('user_id', auth()->id())
            ->findOrFail($id);

        // Only allow if status is draft or rejected
        if (!in_array($document->status, ['draft', 'rejected'])) {
            return back()->with('error', 'Cannot update authors when document is not in draft or rejected status.');
        }

        $validated = $request->validate([
            'old_name' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        // Get current authors array
        $authors = $document->authors ?? [];

        // Find and update the author
        $found = false;
        foreach ($authors as &$author) {
            if ($author['name'] === $validated['old_name']) {
                $author['name'] = $validated['name'];
                $author['email'] = $validated['email'] ?? null;
                $found = true;
                break;
            }
        }

        if (!$found) {
            return back()->with('error', 'Author not found.');
        }

        $document->authors = $authors;
        $document->save();

        return back()->with('success', 'Author updated successfully!');
    }
    /**
     * Show the edit form for a manuscript.
     */
    public function edit($id)
    {
        $document = Document::where('user_id', auth()->id())
            ->findOrFail($id);

        // Only allow editing if status is draft or rejected
        if (!in_array($document->status, ['draft', 'rejected'])) {
            return redirect()->route('student.my-manuscripts')
                ->with('error', 'This document cannot be edited in its current status.');
        }

        return Inertia::render('Student/EditManuscript', [
            'document' => $document,
        ]);
    }

    /**
     * Update a manuscript.
     */
    public function update(Request $request, $id)
    {
        $document = Document::where('user_id', auth()->id())
            ->findOrFail($id);

        // Only allow editing if status is draft or rejected
        if (!in_array($document->status, ['draft', 'rejected'])) {
            return back()->with('error', 'This document cannot be edited in its current status.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'abstract' => 'nullable|string',
            'description' => 'nullable|string',
            'keywords' => 'nullable|array',
            'authors' => 'nullable|array',
            'publication_year' => 'nullable|integer|min:1900|max:' . date('Y'),
        ]);

        $document->update($validated);

        return redirect()->route('student.my-manuscripts')
            ->with('success', 'Manuscript updated successfully.');
    }

    /**
     * Submit a manuscript for review.
     */
    public function submitForReview($id)
    {
        $document = Document::where('user_id', auth()->id())
            ->findOrFail($id);

        // Only allow submission if status is draft or rejected
        if (!in_array($document->status, ['draft', 'rejected'])) {
            return back()->with('error', 'This document cannot be submitted for review.');
        }

        $document->status = 'pending_review';
        $document->submitted_at = now();
        $document->save();

        // TODO: Send notification to faculty reviewers

        return back()->with('success', 'Document submitted for review successfully.');
    }

    /**
     * Delete a manuscript.
     */
    public function destroy($id)
    {
        $document = Document::where('user_id', auth()->id())
            ->findOrFail($id);

        // Only allow deletion if status is draft or rejected
        if (!in_array($document->status, ['draft', 'rejected'])) {
            return back()->with('error', 'This document cannot be deleted in its current status.');
        }

        // Delete the file
        if ($document->file_path && \Storage::disk('public')->exists($document->file_path)) {
            \Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return back()->with('success', 'Document deleted successfully.');
    }

    /**
     * Show analytics for a manuscript.
     */
    public function analytics($id)
    {
        $document = Document::where('user_id', auth()->id())
            ->findOrFail($id);

        return Inertia::render('Student/ManuscriptAnalytics', [
            'document' => $document,
        ]);
    }
}
