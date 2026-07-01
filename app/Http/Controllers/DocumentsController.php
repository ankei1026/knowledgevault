<?php
// app/Http/Controllers/DocumentsController.php

namespace App\Http\Controllers;

use App\Models\FinalDocument;
use App\Models\Document;
use App\Models\SavedDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentsController extends Controller
{
    /**
     * Display a listing of all verified/archived final papers.
     * Accessible by all authenticated users.
     */
    public function index(Request $request)
    {
        // Get all final documents that are verified or archived
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
                        ->orWhereJsonContains('authors', ['name' => $search]);
                })
                    ->orWhereHas('student', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'LIKE', "%{$search}%")
                            ->orWhere('email', 'LIKE', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by year
        if ($request->filled('year')) {
            $query->whereYear('created_at', $request->year);
        }

        $documents = $query->paginate(12);

        // Transform documents to include all necessary data
        $documents->getCollection()->transform(function ($finalDoc) {
            $document = $finalDoc->document;

            // Get all authors from document
            $documentAuthors = $document->authors ?? [];
            $allAuthors = [];

            // Add main author
            if ($document->user) {
                $allAuthors[] = [
                    'name' => $document->user->name,
                    'email' => $document->user->email,
                    'role' => 'Main Author',
                ];
            }

            // Add co-authors from JSON
            if (is_array($documentAuthors) && count($documentAuthors) > 0) {
                foreach ($documentAuthors as $author) {
                    if (
                        $document->user &&
                        isset($author['name']) &&
                        $author['name'] !== $document->user->name
                    ) {
                        $allAuthors[] = [
                            'name' => $author['name'] ?? 'Unknown',
                            'email' => $author['email'] ?? null,
                            'role' => 'Co-author',
                        ];
                    }
                }
            }

            return [
                'id' => $finalDoc->id,
                'status' => $finalDoc->status,
                'submitted_at' => $finalDoc->submitted_at ? $finalDoc->submitted_at->format('M d, Y') : 'N/A',
                'verified_at' => $finalDoc->verified_at ? $finalDoc->verified_at->format('M d, Y') : null,
                'verification_notes' => $finalDoc->verification_notes,
                'document' => [
                    'id' => $document->id,
                    'title' => $document->title,
                    'abstract' => $document->abstract,
                    'description' => $document->description,
                    'file_path' => $document->file_path,
                    'file_name' => $document->file_name,
                    'file_size' => $document->file_size,
                    'mime_type' => $document->mime_type,
                    'keywords' => $document->keywords ?? [],
                    'authors' => $allAuthors,
                    'user' => $document->user ? [
                        'id' => $document->user->id,
                        'name' => $document->user->name,
                        'email' => $document->user->email,
                    ] : null,
                ],
                'student' => $finalDoc->student ? [
                    'id' => $finalDoc->student->id,
                    'name' => $finalDoc->student->name,
                    'email' => $finalDoc->student->email,
                ] : null,
                'verified_by' => $finalDoc->verifiedBy ? [
                    'id' => $finalDoc->verifiedBy->id,
                    'name' => $finalDoc->verifiedBy->name,
                    'email' => $finalDoc->verifiedBy->email,
                ] : null,
            ];
        });

        // Get statistics
        $stats = [
            'total' => FinalDocument::whereIn('status', ['verified', 'archived'])->count(),
            'verified' => FinalDocument::where('status', 'verified')->count(),
            'archived' => FinalDocument::where('status', 'archived')->count(),
        ];

        // Get available years for filter
        $years = FinalDocument::whereIn('status', ['verified', 'archived'])
            ->selectRaw('YEAR(created_at) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        return Inertia::render('Documents/Index', [
            'documents' => $documents,
            'stats' => $stats,
            'years' => $years,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
                'year' => $request->input('year', ''),
            ],
        ]);
    }

    /**
     * Show a specific document.
     * Increments view count for authenticated users.
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

        // Increment view count for authenticated users
        $document->increment('views');

        // Get all authors
        $documentAuthors = $document->authors ?? [];
        $allAuthors = [];

        if ($document->user) {
            $allAuthors[] = [
                'name' => $document->user->name,
                'email' => $document->user->email,
                'role' => 'Main Author',
            ];
        }

        if (is_array($documentAuthors) && count($documentAuthors) > 0) {
            foreach ($documentAuthors as $author) {
                if (
                    $document->user &&
                    isset($author['name']) &&
                    $author['name'] !== $document->user->name
                ) {
                    $allAuthors[] = [
                        'name' => $author['name'] ?? 'Unknown',
                        'email' => $author['email'] ?? null,
                        'role' => 'Co-author',
                    ];
                }
            }
        }

        // Format file size
        $fileSize = $document->file_size;
        if ($fileSize) {
            if ($fileSize < 1024) {
                $formattedSize = $fileSize . ' B';
            } elseif ($fileSize < 1048576) {
                $formattedSize = round($fileSize / 1024, 1) . ' KB';
            } else {
                $formattedSize = round($fileSize / 1048576, 1) . ' MB';
            }
        } else {
            $formattedSize = 'N/A';
        }

        // Check if document is saved by current user
        $isSaved = false;
        if (auth()->check()) {
            $isSaved = SavedDocument::where('user_id', auth()->id())
                ->where('final_document_id', $id)
                ->exists();
        }

        return Inertia::render('Documents/Show', [
            'submission' => [
                'id' => $finalDoc->id,
                'status' => $finalDoc->status,
                'submitted_at' => $finalDoc->submitted_at ? $finalDoc->submitted_at->format('M d, Y') : 'N/A',
                'verified_at' => $finalDoc->verified_at ? $finalDoc->verified_at->format('M d, Y') : null,
                'verification_notes' => $finalDoc->verification_notes,
            ],
            'document' => [
                'id' => $document->id,
                'title' => $document->title,
                'abstract' => $document->abstract,
                'description' => $document->description,
                'file_path' => $document->file_path,
                'file_name' => $document->file_name,
                'file_size' => $formattedSize,
                'mime_type' => $document->mime_type,
                'keywords' => $document->keywords ?? [],
                'authors' => $allAuthors,
                'user' => $document->user ? [
                    'id' => $document->user->id,
                    'name' => $document->user->name,
                    'email' => $document->user->email,
                ] : null,
                'reviewer' => $document->reviewer ? [
                    'id' => $document->reviewer->id,
                    'name' => $document->reviewer->name,
                    'email' => $document->reviewer->email,
                ] : null,
            ],
            'student' => $finalDoc->student ? [
                'id' => $finalDoc->student->id,
                'name' => $finalDoc->student->name,
                'email' => $finalDoc->student->email,
            ] : null,
            'verified_by' => $finalDoc->verifiedBy ? [
                'id' => $finalDoc->verifiedBy->id,
                'name' => $finalDoc->verifiedBy->name,
                'email' => $finalDoc->verifiedBy->email,
            ] : null,
            'is_saved' => $isSaved,
        ]);
    }

    /**
     * Download a document file.
     */
    public function download($id)
    {
        try {
            $finalDoc = FinalDocument::with('document')->findOrFail($id);

            // Only allow download if verified or archived
            if (!in_array($finalDoc->status, ['verified', 'archived'])) {
                abort(403, 'This document is not available for download.');
            }

            $document = $finalDoc->document;

            if (!$document || !$document->file_path) {
                abort(404, 'Document file not found.');
            }

            // Check if file exists
            if (!\Storage::disk('public')->exists($document->file_path)) {
                abort(404, 'File not found.');
            }

            $fileName = $document->file_name ?? 'document.pdf';

            // Return the file download directly
            return \Storage::disk('public')->download($document->file_path, $fileName);
        } catch (\Exception $e) {
            \Log::error('Download error: ' . $e->getMessage());
            return back()->with('error', 'Failed to download file: ' . $e->getMessage());
        }
    }
}
