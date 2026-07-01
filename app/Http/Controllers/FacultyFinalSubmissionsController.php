<?php
// app/Http/Controllers/FacultyFinalSubmissionsController.php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\FinalDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FacultyFinalSubmissionsController extends Controller
{
    /**
     * Display a listing of final submissions that are under the faculty's review.
     */
    public function index(Request $request)
    {
        $facultyId = auth()->id();

        $query = FinalDocument::with([
            'document.user',
            'document.reviewer',
            'student',
            'verifiedBy'
        ])
            ->whereHas('document', function ($q) use ($facultyId) {
                // Only show documents where this faculty is the reviewer
                $q->where('reviewer_id', $facultyId);
            })
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by search
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

        $submissions = $query->paginate(10);

        // Transform submissions to include all necessary data
        $submissions->getCollection()->transform(function ($submission) {
            // Get all authors from document
            $documentAuthors = $submission->document->authors ?? [];
            $allAuthors = [];

            // Add main author
            if ($submission->document->user) {
                $allAuthors[] = [
                    'name' => $submission->document->user->name,
                    'email' => $submission->document->user->email,
                    'role' => 'Main Author',
                ];
            }

            // Add co-authors from JSON
            if (is_array($documentAuthors) && count($documentAuthors) > 0) {
                foreach ($documentAuthors as $author) {
                    if (
                        $submission->document->user &&
                        isset($author['name']) &&
                        $author['name'] !== $submission->document->user->name
                    ) {
                        $allAuthors[] = [
                            'name' => $author['name'] ?? 'Unknown',
                            'email' => $author['email'] ?? null,
                            'role' => 'Co-author',
                        ];
                    }
                }
            }

            $submission->all_authors = $allAuthors;
            $submission->keywords = $submission->document->keywords ?? [];
            $submission->abstract = $submission->document->abstract;
            $submission->file_preview_url = $submission->document->file_path
                ? asset('storage/' . $submission->document->file_path)
                : null;

            return $submission;
        });

        // Get statistics (only for documents reviewed by this faculty)
        $stats = [
            'total' => FinalDocument::whereHas('document', function ($q) use ($facultyId) {
                $q->where('reviewer_id', $facultyId);
            })->count(),
            'pending' => FinalDocument::whereHas('document', function ($q) use ($facultyId) {
                $q->where('reviewer_id', $facultyId);
            })->where('status', 'pending')->count(),
            'verified' => FinalDocument::whereHas('document', function ($q) use ($facultyId) {
                $q->where('reviewer_id', $facultyId);
            })->where('status', 'verified')->count(),
            'archived' => FinalDocument::whereHas('document', function ($q) use ($facultyId) {
                $q->where('reviewer_id', $facultyId);
            })->where('status', 'archived')->count(),
        ];

        return Inertia::render('Faculty/FinalSubmissions', [
            'submissions' => $submissions,
            'stats' => $stats,
            'filters' => [
                'status' => $request->input('status', 'all'),
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    /**
     * Show a specific final submission (only if under this faculty's review).
     */
    public function show($id)
    {
        $facultyId = auth()->id();

        $submission = FinalDocument::with([
            'document.user',
            'document.reviewer',
            'student',
            'verifiedBy'
        ])
            ->whereHas('document', function ($q) use ($facultyId) {
                $q->where('reviewer_id', $facultyId);
            })
            ->findOrFail($id);

        $document = $submission->document;

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

        // Create submission data array
        $submissionData = [
            'id' => $submission->id,
            'status' => $submission->status,
            'submitted_at' => $submission->submitted_at ? $submission->submitted_at->format('M d, Y') : 'N/A',
            'verified_at' => $submission->verified_at ? $submission->verified_at->format('M d, Y') : null,
            'verification_notes' => $submission->verification_notes,
        ];

        // Create document data array
        $documentData = [
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
        ];

        // Create student data
        $studentData = $submission->student ? [
            'id' => $submission->student->id,
            'name' => $submission->student->name,
            'email' => $submission->student->email,
        ] : null;

        // Create verified_by data
        $verifiedByData = $submission->verifiedBy ? [
            'id' => $submission->verifiedBy->id,
            'name' => $submission->verifiedBy->name,
            'email' => $submission->verifiedBy->email,
        ] : null;

        return Inertia::render('Faculty/FinalSubmissionDetail', [
            'submission' => $submissionData,
            'document' => $documentData,
            'student' => $studentData,
            'verified_by' => $verifiedByData,
        ]);
    }

    /**
     * Verify a final submission (only if under this faculty's review).
     */
    public function verify(Request $request, $id)
    {
        $facultyId = auth()->id();

        $submission = FinalDocument::with(['document'])
            ->whereHas('document', function ($q) use ($facultyId) {
                $q->where('reviewer_id', $facultyId);
            })
            ->findOrFail($id);

        // Only allow verification if status is pending
        if ($submission->status !== 'pending') {
            return back()->with('error', 'This submission has already been processed.');
        }

        $validated = $request->validate([
            'verification_notes' => 'nullable|string|max:1000',
            'status' => 'required|in:verified,archived',
        ]);

        $submission->status = $validated['status'];
        $submission->verification_notes = $validated['verification_notes'] ?? null;
        $submission->verified_at = now();
        $submission->verified_by = auth()->id();
        $submission->save();

        // Update the document status if verified
        if ($validated['status'] === 'verified') {
            $document = $submission->document;
            $document->status = 'published';
            $document->published_at = now();
            $document->save();
        }

        $statusText = $validated['status'] === 'verified' ? 'verified' : 'archived';
        return back()->with('success', "Final submission has been {$statusText} successfully!");
    }

    /**
     * Download the final document file (only if under this faculty's review).
     */
    public function download($id)
    {
        $facultyId = auth()->id();

        $submission = FinalDocument::with('document')
            ->whereHas('document', function ($q) use ($facultyId) {
                $q->where('reviewer_id', $facultyId);
            })
            ->findOrFail($id);

        // Use the original document's file
        $document = $submission->document;

        if (!$document || !$document->file_path) {
            return back()->with('error', 'Document file not found.');
        }

        // Check if file exists
        if (!\Storage::disk('public')->exists($document->file_path)) {
            return back()->with('error', 'File not found.');
        }

        $fileName = $document->file_name ?? 'document.pdf';

        return \Storage::disk('public')->download($document->file_path, $fileName);
    }

    /**
     * Get statistics for the dashboard (only for documents reviewed by this faculty).
     */
    public function stats()
    {
        $facultyId = auth()->id();

        $stats = [
            'total' => FinalDocument::whereHas('document', function ($q) use ($facultyId) {
                $q->where('reviewer_id', $facultyId);
            })->count(),
            'pending' => FinalDocument::whereHas('document', function ($q) use ($facultyId) {
                $q->where('reviewer_id', $facultyId);
            })->where('status', 'pending')->count(),
            'verified' => FinalDocument::whereHas('document', function ($q) use ($facultyId) {
                $q->where('reviewer_id', $facultyId);
            })->where('status', 'verified')->count(),
            'archived' => FinalDocument::whereHas('document', function ($q) use ($facultyId) {
                $q->where('reviewer_id', $facultyId);
            })->where('status', 'archived')->count(),
        ];

        $recent = FinalDocument::with(['student', 'document'])
            ->whereHas('document', function ($q) use ($facultyId) {
                $q->where('reviewer_id', $facultyId);
            })
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'title' => $submission->document->title,
                    'student' => $submission->student->name,
                    'status' => $submission->status,
                    'submitted_at' => $submission->submitted_at->format('M d, Y'),
                ];
            });

        return response()->json([
            ...$stats,
            'recent' => $recent,
        ]);
    }
}
