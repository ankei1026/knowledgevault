<?php
// app/Http/Controllers/FacultyStudentsController.php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FacultyStudentsController extends Controller
{
    /**
     * Display a listing of students with manuscripts assigned to this faculty.
     */
    public function index(Request $request)
    {
        $facultyId = auth()->id();

        // Get all documents where this faculty is the reviewer
        $documents = Document::with([
            'user', // The student who submitted
            'reviewer'
        ])
            ->where('reviewer_id', $facultyId)
            ->whereIn('status', ['pending_review', 'under_review', 'approved', 'rejected', 'published'])
            ->get();

        // Get all unique student IDs (main authors)
        $studentIds = $documents->pluck('user_id')->unique()->toArray();

        // Fetch all users (students) with their data
        $users = User::whereIn('id', $studentIds)->get()->keyBy('id');

        // Build the students array with their manuscripts
        $students = [];
        foreach ($studentIds as $studentId) {
            $student = $users->get($studentId);
            if (!$student) continue;

            // Get all documents for this student
            $studentDocuments = $documents->filter(function ($doc) use ($studentId) {
                return $doc->user_id === $studentId;
            });

            // Get co-authors from the JSON authors field for this student's documents
            $coAuthors = [];
            foreach ($studentDocuments as $doc) {
                if ($doc->authors && is_array($doc->authors)) {
                    foreach ($doc->authors as $author) {
                        // Skip if the author is the main student
                        if ($author['name'] === $student->name) continue;

                        $key = md5($author['name'] . ($author['email'] ?? ''));
                        $coAuthors[$key] = [
                            'name' => $author['name'],
                            'email' => $author['email'] ?? null,
                        ];
                    }
                }
            }

            // Get program and year_level from user or metadata
            $program = $student->program ?? 'N/A';
            $yearLevel = $student->year_level ?? 'N/A';

            $students[] = [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'program' => $program,
                'year_level' => $yearLevel,
                'co_authors' => array_values($coAuthors),
                'manuscripts' => $studentDocuments->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'title' => $doc->title,
                        'status' => $doc->status,
                        'submitted_at' => $doc->submitted_at,
                        'reviewed_at' => $doc->reviewed_at,
                        'authors' => $doc->authors ?? [], // All authors from JSON
                    ];
                })->values()->toArray(),
                'total_manuscripts' => $studentDocuments->count(),
            ];
        }

        // Sort students by name
        usort($students, function ($a, $b) {
            return strcmp($a['name'], $b['name']);
        });

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $students = array_filter($students, function ($student) use ($search) {
                return stripos($student['name'], $search) !== false ||
                    stripos($student['email'], $search) !== false ||
                    stripos($student['program'], $search) !== false;
            });
            $students = array_values($students);
        }

        // Get statistics
        $stats = [
            'total_students' => count($students),
            'total_manuscripts' => collect($students)->sum('total_manuscripts'),
            'total_co_authors' => collect($students)->sum(function ($student) {
                return count($student['co_authors']);
            }),
        ];

        return Inertia::render('Faculty/Students', [
            'students' => $students,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    /**
     * Get student details with their manuscripts.
     */
    public function show($id)
    {
        $facultyId = auth()->id();

        // Get the student
        $student = User::findOrFail($id);

        // Get all documents where this student is the author and this faculty is the reviewer
        $documents = Document::with(['reviewer'])
            ->where('user_id', $id)
            ->where('reviewer_id', $facultyId)
            ->get();

        // Get co-authors from the JSON authors field
        $coAuthors = [];
        foreach ($documents as $doc) {
            if ($doc->authors && is_array($doc->authors)) {
                foreach ($doc->authors as $author) {
                    // Skip if the author is the main student
                    if ($author['name'] === $student->name) continue;

                    $key = md5($author['name'] . ($author['email'] ?? ''));
                    $coAuthors[$key] = [
                        'name' => $author['name'],
                        'email' => $author['email'] ?? null,
                    ];
                }
            }
        }

        return Inertia::render('Faculty/StudentDetail', [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'program' => $student->program ?? 'N/A',
                'year_level' => $student->year_level ?? 'N/A',
            ],
            'co_authors' => array_values($coAuthors),
            'manuscripts' => $documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'title' => $doc->title,
                    'abstract' => $doc->abstract,
                    'status' => $doc->status,
                    'submitted_at' => $doc->submitted_at,
                    'reviewed_at' => $doc->reviewed_at,
                    'reviewer_feedback' => $doc->reviewer_feedback,
                    'file_path' => $doc->file_path,
                    'file_name' => $doc->file_name,
                    'authors' => $doc->authors ?? [], // All authors from JSON
                ];
            }),
        ]);
    }
}
