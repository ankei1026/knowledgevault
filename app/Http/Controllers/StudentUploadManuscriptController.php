<?php
// app/Http/Controllers/StudentUploadManuscriptController.php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StudentUploadManuscriptController extends Controller
{
    /**
     * Show the upload manuscript page
     */
    public function create()
    {
        return Inertia::render('Student/UploadManuscript');
    }

    /**
     * Store the uploaded manuscript
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'abstract' => 'nullable|string|max:5000',
            'description' => 'nullable|string',
            'keywords' => 'nullable|array',
            'keywords.*' => 'string|max:50',
            'file' => 'required|file|mimes:pdf,doc,docx|max:20480', // 20MB max
        ]);

        $file = $request->file('file');
        $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
        $filePath = $file->storeAs('documents/' . Auth::id(), $fileName, 'public');

        $document = Document::create([
            'title' => $request->title,
            'abstract' => $request->abstract,
            'description' => $request->description,
            'keywords' => $request->keywords,
            'file_path' => $filePath,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'user_id' => Auth::id(),
            'status' => 'draft',
            'is_public' => $request->boolean('is_public', true),
        ]);

        return redirect()->route('student.dashboard')
            ->with('success', 'Manuscript uploaded successfully! You can now submit it for review.');
    }

    /**
     * Submit document for review
     */
    public function submitForReview($id)
    {
        $document = Document::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $document->update([
            'status' => 'pending_review',
            'submitted_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Manuscript submitted for review successfully!');
    }
}
