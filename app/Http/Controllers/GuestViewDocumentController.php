<?php

namespace App\Http\Controllers;

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
        $query = Document::query()
            ->where(function ($q) {
                $q->where('status', 'published')
                    ->orWhere('status', 'approved');
            });

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('abstract', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Apply type filter
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Apply year filter
        if ($request->filled('year') && $request->year !== 'all') {
            $query->whereYear('created_at', $request->year);
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

        $documents = $query->paginate(12)->withQueryString();

        // Get statistics
        $stats = [
            'total' => Document::whereIn('status', ['published', 'approved'])->count(),
            'published' => Document::where('status', 'published')->count(),
            'pending' => Document::where('status', 'pending_review')->count(),
            'views' => Document::sum('views'),
            'downloads' => Document::sum('downloads'),
        ];

        // Get unique types and years for filters
        $years = Document::selectRaw('DISTINCT YEAR(created_at) as year')
            ->pluck('year')
            ->filter()
            ->values();

        return Inertia::render('Guest/Document', [
            'documents' => $documents,
            'stats' => $stats,
            'filters' => [
                'search' => $request->get('search', ''),
                'type' => $request->get('type', 'all'),
                'year' => $request->get('year', 'all'),
                'sort' => $request->get('sort', 'latest'),
            ],
            'years' => $years,
        ]);
    }

    /**
     * Display a specific document
     */
    public function show($id)
    {
        $document = Document::with(['user', 'collaborators'])
            ->whereIn('status', ['published', 'approved'])
            ->findOrFail($id);

        // Increment view count
        $document->increment('views');

        // Get related documents
        $relatedDocuments = Document::where('id', '!=', $id)
            ->whereIn('status', ['published', 'approved'])
            ->where(function ($q) use ($document) {
                $q->where('type', $document->type)
                    ->orWhere('department', $document->department);
            })
            ->limit(4)
            ->get(['id', 'title', 'type', 'views']);

        return Inertia::render('Guest/DocumentDetail', [
            'document' => $document,
            'relatedDocuments' => $relatedDocuments,
        ]);
    }

    /**
     * Search documents (AJAX endpoint)
     */
    public function search(Request $request)
    {
        $search = $request->get('q');

        $documents = Document::whereIn('status', ['published', 'approved'])
            ->where(function ($query) use ($search) {
                $query->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('abstract', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            })
            ->limit(10)
            ->get(['id', 'title', 'abstract', 'type', 'created_at']);

        return response()->json($documents);
    }
}
