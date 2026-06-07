<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class GuestViewDocumentController extends Controller
{
    /**
     * Display the document viewing page for guests
     */
    public function index()
    {
        return Inertia::render('Guest/Document');
    }
}
