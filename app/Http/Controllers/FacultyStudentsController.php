<?php
// app/Http/Controllers/FacultyStudentsController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class FacultyStudentsController extends Controller
{
    /**
     * Display a listing of faculty students.
     */
    public function index()
    {
        // Demo data - no database queries
        $students = [
            [
                'id' => 1,
                'name' => 'Maria Santos',
                'email' => 'maria.santos@asc.edu.ph',
                'program' => 'BS Computer Science',
                'year_level' => '4th Year',
                'co_authors' => [
                    ['name' => 'Juan Dela Cruz', 'email' => 'juan.delacruz@asc.edu.ph'],
                    ['name' => 'Ana Reyes', 'email' => 'ana.reyes@asc.edu.ph'],
                    ['name' => 'Carlos Mendoza', 'email' => 'carlos.mendoza@asc.edu.ph'],
                ],
                'manuscripts' => [
                    ['id' => 101, 'title' => 'AI-Powered Learning Management System for ASC', 'status' => 'approved'],

                ]
            ],
            [
                'id' => 2,
                'name' => 'Juan Dela Cruz',
                'email' => 'juan.delacruz@asc.edu.ph',
                'program' => 'BS Information Technology',
                'year_level' => '4th Year',
                'co_authors' => [
                    ['name' => 'Maria Santos', 'email' => 'maria.santos@asc.edu.ph'],
                    ['name' => 'Elena Villanueva', 'email' => 'elena.villanueva@asc.edu.ph'],
                ],
                'manuscripts' => [
                    ['id' => 103, 'title' => 'E-Learning Platform for K-12 Students', 'status' => 'approved'],
                ]
            ],
            [
                'id' => 3,
                'name' => 'Ana Reyes',
                'email' => 'ana.reyes@asc.edu.ph',
                'program' => 'BS Computer Engineering',
                'year_level' => '4th Year',
                'co_authors' => [
                    ['name' => 'Maria Santos', 'email' => 'maria.santos@asc.edu.ph'],
                    ['name' => 'Carlos Mendoza', 'email' => 'carlos.mendoza@asc.edu.ph'],
                ],
                'manuscripts' => [
                    ['id' => 104, 'title' => 'IoT-based Smart Campus Management System', 'status' => 'rejected'],
                    ['id' => 105, 'title' => 'Mobile Application for Student Records Management', 'status' => 'approved'],
                ]
            ],
            [
                'id' => 4,
                'name' => 'Carlos Mendoza',
                'email' => 'carlos.mendoza@asc.edu.ph',
                'program' => 'BS Information Systems',
                'year_level' => '3rd Year',
                'co_authors' => [
                    ['name' => 'Ana Reyes', 'email' => 'ana.reyes@asc.edu.ph'],
                    ['name' => 'Juan Dela Cruz', 'email' => 'juan.delacruz@asc.edu.ph'],
                ],
                'manuscripts' => [
                    ['id' => 106, 'title' => 'Data Analytics Dashboard for School Administration', 'status' => 'pending_review'],
                ]
            ],
            [
                'id' => 5,
                'name' => 'Elena Villanueva',
                'email' => 'elena.villanueva@asc.edu.ph',
                'program' => 'BS Computer Science',
                'year_level' => '4th Year',
                'co_authors' => [],
                'manuscripts' => [
                    ['id' => 107, 'title' => 'Machine Learning for Student Performance Prediction', 'status' => 'approved'],
                ]
            ],
        ];

        return Inertia::render('Faculty/Students', [
            'students' => $students,
            'stats' => [
                'total_students' => count($students),
                'total_manuscripts' => collect($students)->sum(function ($student) {
                    return count($student['manuscripts']);
                }),
            ],
        ]);
    }
}
