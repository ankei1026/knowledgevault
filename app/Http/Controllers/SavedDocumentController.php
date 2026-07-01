<?php
// app/Http/Controllers/SavedDocumentController.php

namespace App\Http\Controllers;

use App\Models\SavedDocument;
use App\Models\FinalDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SavedDocumentController extends Controller
{
    /**
     * Display the user's saved documents.
     */
    public function index(Request $request)
    {
        $query = SavedDocument::with([
            'finalDocument.document.user',
            'finalDocument.document.reviewer',
            'finalDocument.verifiedBy',
            'finalDocument.student'
        ])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc');

        // Filter by search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('finalDocument.document', function ($docQuery) use ($search) {
                    $docQuery->where('title', 'LIKE', "%{$search}%")
                        ->orWhere('abstract', 'LIKE', "%{$search}%");
                })
                    ->orWhere('notes', 'LIKE', "%{$search}%")
                    ->orWhereJsonContains('tags', $search);
            });
        }

        $savedDocuments = $query->paginate(12);

        // Transform to ensure data is properly structured
        $savedDocuments->getCollection()->transform(function ($saved) {
            $finalDoc = $saved->finalDocument;
            $document = $finalDoc ? $finalDoc->document : null;

            if ($document) {
                // Get the main author (uploader/student)
                $mainAuthor = null;
                if ($document->user) {
                    $mainAuthor = [
                        'name' => $document->user->name,
                        'email' => $document->user->email,
                        'role' => 'Main Author',
                    ];
                }

                // Get co-authors from JSON authors field
                $coAuthors = [];
                if ($document->authors) {
                    $authors = $document->authors;
                    if (is_string($authors)) {
                        $authors = json_decode($authors, true) ?? [];
                    }
                    if (is_array($authors)) {
                        foreach ($authors as $author) {
                            // Skip if this is the main author (same name as uploader)
                            if ($mainAuthor && isset($author['name']) && $author['name'] === $mainAuthor['name']) {
                                continue;
                            }
                            $coAuthors[] = [
                                'name' => $author['name'] ?? 'Unknown',
                                'email' => $author['email'] ?? null,
                                'role' => 'Co-author',
                            ];
                        }
                    }
                }

                // Combine main author and co-authors
                $allAuthors = [];
                if ($mainAuthor) {
                    $allAuthors[] = $mainAuthor;
                }
                $allAuthors = array_merge($allAuthors, $coAuthors);

                // Set the combined authors
                $document->authors = $allAuthors;

                // Ensure keywords is always an array
                if ($document->keywords) {
                    $keywords = $document->keywords;
                    if (is_string($keywords)) {
                        $keywords = json_decode($keywords, true) ?? [];
                    }
                    if (!is_array($keywords)) {
                        $keywords = [];
                    }
                    $document->keywords = $keywords;
                } else {
                    $document->keywords = [];
                }
            }

            return $saved;
        });

        // Get statistics
        $stats = [
            'total' => SavedDocument::where('user_id', auth()->id())->count(),
        ];

        return Inertia::render('Documents/Saved', [
            'savedDocuments' => $savedDocuments,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    /**
     * Toggle save status (add/remove) for a final document.
     * Uses Inertia redirect instead of JSON response.
     */
    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'final_document_id' => 'required|exists:final_documents,id',
        ]);

        // Check if already saved
        $saved = SavedDocument::where('user_id', auth()->id())
            ->where('final_document_id', $validated['final_document_id'])
            ->first();

        if ($saved) {
            $saved->delete();
            return back()->with('success', 'Document removed from saved collection');
        }

        // Create new saved document
        SavedDocument::create([
            'user_id' => auth()->id(),
            'final_document_id' => $validated['final_document_id'],
        ]);

        return back()->with('success', 'Document saved successfully');
    }

    /**
     * Update a saved document (notes, tags).
     */
    public function update(Request $request, $id)
    {
        $savedDocument = SavedDocument::where('user_id', auth()->id())
            ->findOrFail($id);

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
            'tags' => 'nullable|array',
        ]);

        $savedDocument->update($validated);

        return back()->with('success', 'Document updated successfully!');
    }

    /**
     * Remove a saved document.
     */
    public function destroy($id)
    {
        $savedDocument = SavedDocument::where('user_id', auth()->id())
            ->findOrFail($id);

        $savedDocument->delete();

        return back()->with('success', 'Document removed from saved collection.');
    }
}
