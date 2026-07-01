<?php
// app/Http/Controllers/GuestViewDocumentController.php

namespace App\Http\Controllers;

use App\Models\FinalDocument;
use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuestViewDocumentController extends Controller
{
    /**
     * Display the document listing page for guests
     */
    public function index(Request $request)
    {
        $query = FinalDocument::with([
            'document.user',
            'document.reviewer',
            'student',
            'verifiedBy'
        ])
            ->whereIn('status', ['verified', 'archived'])
            ->orderBy('created_at', 'desc');

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('document', function ($docQuery) use ($search) {
                    $docQuery->where('title', 'LIKE', "%{$search}%")
                        ->orWhere('abstract', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%")
                        ->orWhereJsonContains('authors', ['name' => $search]);
                })
                    ->orWhereHas('student', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'LIKE', "%{$search}%")
                            ->orWhere('email', 'LIKE', "%{$search}%");
                    });
            });
        }

        // Apply year filter
        if ($request->filled('year') && $request->year !== 'all') {
            $query->whereYear('created_at', $request->year);
        }

        // Apply sorting
        $sort = $request->get('sort', 'latest');
        switch ($sort) {
            case 'latest':
                $query->latest('created_at');
                break;
            case 'oldest':
                $query->oldest('created_at');
                break;
            default:
                $query->latest('created_at');
        }

        $documents = $query->paginate(12)->withQueryString();

        // Transform documents for display
        $documents->getCollection()->transform(function ($finalDoc) {
            $document = $finalDoc->document;

            // Get all authors
            $authors = [];
            $documentAuthors = $document->authors ?? [];

            if ($document->user) {
                $authors[] = $document->user->name;
            }

            if (is_array($documentAuthors) && count($documentAuthors) > 0) {
                foreach ($documentAuthors as $author) {
                    if ($document->user && isset($author['name']) && $author['name'] !== $document->user->name) {
                        $authors[] = $author['name'];
                    }
                }
            }

            // Get tags from keywords
            $tags = $document->keywords ?? [];
            if (is_string($tags)) {
                $tags = json_decode($tags, true) ?? [];
            }

            return [
                'id' => $finalDoc->id,
                'title' => $document->title,
                'authors' => $authors,
                'abstract' => $document->abstract,
                'type' => $document->type ?? 'Research Paper',
                'department' => $document->user?->program ?? 'N/A',
                'year' => $finalDoc->created_at->year,
                'views' => $document->views ?? 0,
                'downloads' => $document->downloads ?? 0,
                'tags' => is_array($tags) ? $tags : [],
                'status' => $finalDoc->status,
                'file_path' => $document->file_path,
                'file_name' => $document->file_name,
                'mime_type' => $document->mime_type,
                'student_name' => $finalDoc->student?->name,
                'verified_at' => $finalDoc->verified_at,
            ];
        });

        // Get statistics
        $stats = [
            'total' => FinalDocument::whereIn('status', ['verified', 'archived'])->count(),
            'verified' => FinalDocument::where('status', 'verified')->count(),
            'archived' => FinalDocument::where('status', 'archived')->count(),
        ];

        // Get unique years for filters
        $years = FinalDocument::whereIn('status', ['verified', 'archived'])
            ->selectRaw('DISTINCT YEAR(created_at) as year')
            ->pluck('year')
            ->filter()
            ->values()
            ->toArray();

        return Inertia::render('Guest/Document', [
            'documents' => $documents,
            'stats' => $stats,
            'filters' => [
                'search' => $request->get('search', ''),
                'year' => $request->get('year', 'all'),
                'sort' => $request->get('sort', 'latest'),
            ],
            'years' => $years,
        ]);
    }

    /**
     * Display a specific document for guests
     */
    public function show($id)
    {
        $finalDoc = FinalDocument::with([
            'document.user',
            'document.reviewer',
            'student',
            'verifiedBy'
        ])->findOrFail($id);

        // Only show if verified or archived
        if (!in_array($finalDoc->status, ['verified', 'archived'])) {
            abort(404, 'Document not found.');
        }

        $document = $finalDoc->document;

        // Increment view count
        $document->increment('views');

        // Get all authors
        $authors = [];
        $documentAuthors = $document->authors ?? [];

        if ($document->user) {
            $authors[] = $document->user->name;
        }

        if (is_array($documentAuthors) && count($documentAuthors) > 0) {
            foreach ($documentAuthors as $author) {
                if ($document->user && isset($author['name']) && $author['name'] !== $document->user->name) {
                    $authors[] = $author['name'];
                }
            }
        }

        // Get tags from keywords
        $tags = $document->keywords ?? [];
        if (is_string($tags)) {
            $tags = json_decode($tags, true) ?? [];
        }

        // Get related documents
        $relatedDocuments = FinalDocument::with('document')
            ->where('id', '!=', $id)
            ->whereIn('status', ['verified', 'archived'])
            ->limit(4)
            ->get()
            ->map(function ($related) {
                return [
                    'id' => $related->id,
                    'title' => $related->document->title,
                ];
            });

        return Inertia::render('Guest/DocumentDetail', [
            'document' => [
                'id' => $finalDoc->id,
                'title' => $document->title,
                'authors' => $authors,
                'abstract' => $document->abstract,
                'department' => $document->user?->program ?? 'N/A',
                'year' => $finalDoc->created_at->year,
                'views' => $document->views ?? 0,
                'downloads' => $document->downloads ?? 0,
                'tags' => is_array($tags) ? $tags : [],
                'file_path' => $document->file_path,
                'file_name' => $document->file_name,
                'mime_type' => $document->mime_type,
                'status' => $finalDoc->status,
                'student_name' => $finalDoc->student?->name,
                'verified_at' => $finalDoc->verified_at,
                'verified_by' => $finalDoc->verifiedBy?->name,
            ],
            'relatedDocuments' => $relatedDocuments,
        ]);
    }
}
