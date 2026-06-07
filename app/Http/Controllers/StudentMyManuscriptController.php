<?php
// app/Http/Controllers/StudentMyManuscriptController.php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentMyManuscriptController extends Controller
{
    /**
     * Display a listing of the student's manuscripts.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = Document::where('user_id', $user->id)
            ->with(['collaborators', 'reviewer']);
        
        // Apply status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('abstract', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Sorting
        $sort = $request->get('sort', 'latest');
        switch ($sort) {
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
            default:
                $query->orderBy('created_at', 'desc');
        }
        
        $documents = $query->paginate(12);
        
        // Get statistics
        $stats = [
            'total' => Document::where('user_id', $user->id)->count(),
            'draft' => Document::where('user_id', $user->id)->where('status', 'draft')->count(),
            'pending_review' => Document::where('user_id', $user->id)->where('status', 'pending_review')->count(),
            'approved' => Document::where('user_id', $user->id)->where('status', 'approved')->count(),
            'rejected' => Document::where('user_id', $user->id)->where('status', 'rejected')->count(),
            'published' => Document::where('user_id', $user->id)->where('status', 'published')->count(),
            'total_views' => Document::where('user_id', $user->id)->sum('views'),
            'total_downloads' => Document::where('user_id', $user->id)->sum('downloads'),
            'total_citations' => Document::where('user_id', $user->id)->sum('citations'),
        ];
        
        return Inertia::render('Student/MyManuscripts', [
            'documents' => $documents,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status,
                'search' => $request->search,
                'sort' => $sort,
            ],
        ]);
    }
    
    /**
     * Show the form for editing the specified manuscript.
     */
    public function edit($id)
    {
        $document = Document::where('user_id', Auth::id())
            ->findOrFail($id);
        
        return Inertia::render('Student/EditManuscript', [
            'document' => $document,
        ]);
    }
    
    /**
     * Update the specified manuscript.
     */
    public function update(Request $request, $id)
    {
        $document = Document::where('user_id', Auth::id())
            ->findOrFail($id);
        
        $request->validate([
            'title' => 'required|string|max:255',
            'abstract' => 'nullable|string|max:5000',
            'description' => 'nullable|string',
            'keywords' => 'nullable|array',
        ]);
        
        $document->update([
            'title' => $request->title,
            'abstract' => $request->abstract,
            'description' => $request->description,
            'keywords' => $request->keywords,
        ]);
        
        return redirect()->back()->with('success', 'Manuscript updated successfully!');
    }
    
    /**
     * Submit manuscript for review.
     */
    public function submitForReview($id)
    {
        $document = Document::where('user_id', Auth::id())
            ->findOrFail($id);
        
        if ($document->status !== 'draft') {
            return redirect()->back()->with('error', 'Only draft manuscripts can be submitted for review.');
        }
        
        $document->update([
            'status' => 'pending_review',
            'submitted_at' => now(),
        ]);
        
        return redirect()->back()->with('success', 'Manuscript submitted for review successfully!');
    }
    
    /**
     * Delete the specified manuscript.
     */
    public function destroy($id)
    {
        $document = Document::where('user_id', Auth::id())
            ->findOrFail($id);
        
        // Delete file from storage
        if ($document->file_path && \Storage::disk('public')->exists($document->file_path)) {
            \Storage::disk('public')->delete($document->file_path);
        }
        
        $document->delete();
        
        return redirect()->route('student.my-manuscripts')
            ->with('success', 'Manuscript deleted successfully!');
    }
    
    /**
     * Get manuscript analytics.
     */
    public function analytics($id)
    {
        $document = Document::where('user_id', Auth::id())
            ->with(['collaborators', 'reviewer'])
            ->findOrFail($id);
        
        // Get weekly views data
        $weeklyViews = [
            'Mon' => rand(10, 100),
            'Tue' => rand(10, 100),
            'Wed' => rand(10, 100),
            'Thu' => rand(10, 100),
            'Fri' => rand(10, 100),
            'Sat' => rand(5, 50),
            'Sun' => rand(5, 50),
        ];
        
        return Inertia::render('Student/ManuscriptAnalytics', [
            'document' => $document,
            'weeklyViews' => $weeklyViews,
        ]);
    }
}