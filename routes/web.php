<?php
// routes/web.php

use App\Http\Controllers\AdminActivitiesController;
use App\Http\Controllers\AdminAllDocumentsController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminUserManagementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocumentsController;
use App\Http\Controllers\FacultyFinalSubmissionsController;
use App\Http\Controllers\FacultyDashboardController;
use App\Http\Controllers\FacultyReviewController;
use App\Http\Controllers\FacultyStudentsController;
use App\Http\Controllers\GuestViewDocumentController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\FinalDocumentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SavedDocumentController;
use App\Http\Controllers\StudentMyManuscriptController;
use App\Http\Controllers\StudentDashboardController;
use App\Http\Controllers\StudentFacultyReviewerController;
use App\Http\Controllers\StudentInvitationController;
use App\Http\Controllers\StudentUploadManuscriptController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

// Guest document viewing
Route::get('/guest/documents', [GuestViewDocumentController::class, 'index'])
    ->name('guest.documents');
Route::get('/guest/documents/{id}', [GuestViewDocumentController::class, 'show'])
    ->name('guest.documents.show');

Route::get('/documents/{id}', function ($id) {
    return Inertia::render('Guest/DocumentDetail', ['documentId' => $id]);
})->name('guest.document.show');

// Guest routes (only accessible when not logged in)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
    Route::post('/register', [AuthController::class, 'register'])->name('register.post');
});

// Invitation routes (public)
Route::get('/invitations/accept/{token}', [InvitationController::class, 'accept'])->name('invitations.accept');
Route::get('/invitations/decline/{token}', [InvitationController::class, 'decline'])->name('invitations.decline');

// Auth routes (requires authentication)
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});


// ==================== ADMIN ROUTES ====================
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/settings', [AdminDashboardController::class, 'settings'])->name('settings');

    // Document Management Routes

    Route::get('/documents', [AdminAllDocumentsController::class, 'index'])
        ->name('documents');

    Route::delete('/documents/bulk', [AdminAllDocumentsController::class, 'bulkDestroy'])
        ->name('documents.bulk-destroy');

    Route::delete('/documents/{id}', [AdminAllDocumentsController::class, 'destroy'])
        ->name('documents.destroy');

    // User Management Routes
    Route::get('/users', [AdminUserManagementController::class, 'index'])->name('users');
    Route::post('/users', [AdminUserManagementController::class, 'store'])->name('users.store');
    Route::put('/users/{user}/role', [AdminUserManagementController::class, 'updateRole'])->name('users.update-role');
    Route::put('/users/{user}/status', [AdminUserManagementController::class, 'updateStatus'])->name('users.update-status');
    Route::delete('/users/{user}', [AdminUserManagementController::class, 'destroy'])->name('users.destroy');
    Route::post('/users/{user}/resend-verification', [AdminUserManagementController::class, 'resendVerification'])->name('users.resend-verification');
    Route::post('/users/import', [AdminUserManagementController::class, 'import'])->name('users.import');
    Route::get('/users/export', [AdminUserManagementController::class, 'export'])->name('users.export');
    Route::post('/users/{id}/reset-password', [AdminUserManagementController::class, 'resetPassword'])->name('admin.users.reset-password');

    // Activities Routes
    Route::get('/activities', [AdminActivitiesController::class, 'index'])->name('activities');
});

// ==================== STUDENT ROUTES ====================
Route::middleware(['auth', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('dashboard');

    // Upload routes
    Route::get('/documents/upload', [StudentUploadManuscriptController::class, 'create'])->name('documents.upload');
    Route::post('/documents', [StudentUploadManuscriptController::class, 'store'])->name('documents.store');
    Route::post('/documents/{id}/submit', [StudentUploadManuscriptController::class, 'submitForReview'])->name('documents.submit');

    // My Manuscripts Routes
    Route::get('/my-manuscripts', [StudentMyManuscriptController::class, 'index'])->name('my-manuscripts');
    Route::get('/my-manuscripts/{id}/edit', [StudentMyManuscriptController::class, 'edit'])->name('my-manuscripts.edit');
    Route::get('/my-manuscripts/{id}', [StudentMyManuscriptController::class, 'show'])->name('my-manuscripts.show');
    Route::put('/my-manuscripts/{id}', [StudentMyManuscriptController::class, 'update'])->name('my-manuscripts.update');
    Route::post('/my-manuscripts/{id}/submit', [StudentMyManuscriptController::class, 'submitForReview'])->name('my-manuscripts.submit');
    Route::delete('/my-manuscripts/{id}', [StudentMyManuscriptController::class, 'destroy'])->name('my-manuscripts.destroy');
    Route::get('/my-manuscripts/{id}/analytics', [StudentMyManuscriptController::class, 'analytics'])->name('my-manuscripts.analytics');

    // Final Paper Routes (simplified)
    Route::get('/final-papers', [FinalDocumentController::class, 'index'])->name('final-documents');
    Route::post('/final-papers/submit/{document}', [FinalDocumentController::class, 'submit'])->name('final-papers.submit');
    Route::get('/final-papers/{finalDocument}', [FinalDocumentController::class, 'show'])->name('final-papers.show');
    Route::get('/final-papers/stats', [FinalDocumentController::class, 'stats'])->name('final-papers.stats');

    // Faculty reviewer assignment
    Route::post('/documents/{documentId}/assign-reviewer', [StudentFacultyReviewerController::class, 'assignReviewer'])->name('documents.assign-reviewer');

    // Document invitations
    Route::get('/documents/{document}/invitations', [StudentInvitationController::class, 'index'])->name('documents.invitations');
    Route::post('/documents/{document}/invite', [StudentInvitationController::class, 'send'])->name('documents.invite');
    Route::post('/invitations/{invitation}/resend', [StudentInvitationController::class, 'resend'])->name('invitations.resend');
    Route::delete('/invitations/{invitation}', [StudentInvitationController::class, 'cancel'])->name('invitations.cancel');
    Route::delete('/documents/{document}/collaborators/{user}', [StudentInvitationController::class, 'removeCollaborator'])->name('documents.remove-collaborator');

    // Co-author routes
    Route::post('/my-manuscripts/{id}/authors', [StudentMyManuscriptController::class, 'addAuthor'])->name('my-manuscripts.add-author');
    Route::delete('/my-manuscripts/{id}/authors', [StudentMyManuscriptController::class, 'removeAuthor'])->name('my-manuscripts.remove-author');
    Route::put('/my-manuscripts/{id}/authors', [StudentMyManuscriptController::class, 'updateAuthor'])->name('my-manuscripts.update-author');
});

// ==================== FACULTY ROUTES ====================
Route::middleware(['auth', 'role:faculty'])->prefix('faculty')->name('faculty.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [FacultyDashboardController::class, 'index'])->name('dashboard');

    // Submissions management (using FacultyReviewController)
    Route::get('/pending-submissions', [FacultyReviewController::class, 'pendingSubmissions'])->name('pending-submissions');
    Route::get('/review-history', [FacultyReviewController::class, 'reviewHistory'])->name('review-history');

    // Review actions (using FacultyReviewController)
    Route::get('/review/{id}', [FacultyReviewController::class, 'show'])->name('review.show');
    Route::post('/review/{id}', [FacultyReviewController::class, 'submitReview'])->name('review.submit');

    Route::get('/students', [FacultyStudentsController::class, 'index'])->name('students');

    // Final Submissions Routes
    Route::get('/final-submissions', [FacultyFinalSubmissionsController::class, 'index'])->name('final-submissions');
    Route::get('/final-submissions/{id}', [FacultyFinalSubmissionsController::class, 'show'])->name('final-submissions.show');
    Route::post('/final-submissions/{id}/verify', [FacultyFinalSubmissionsController::class, 'verify'])->name('final-submissions.verify');
    Route::get('/final-submissions/{id}/download', [FacultyFinalSubmissionsController::class, 'download'])->name('final-submissions.download');
    Route::get('/final-submissions/stats', [FacultyFinalSubmissionsController::class, 'stats'])->name('final-submissions.stats');
});

Route::middleware('auth')->group(function () {
    Route::get('/documents', [DocumentsController::class, 'index'])->name('documents.index');
    Route::get('/documents/{id}', [DocumentsController::class, 'show'])->name('documents.show');
    Route::get('/documents/{id}/download', [DocumentsController::class, 'download'])->name('documents.download');

    Route::get('/saved-documents', [SavedDocumentController::class, 'index'])->name('saved-documents.index');
    Route::post('/saved-documents', [SavedDocumentController::class, 'store'])->name('saved-documents.store');
    Route::post('/saved-documents/toggle', [SavedDocumentController::class, 'toggle'])->name('saved-documents.toggle');
    Route::put('/saved-documents/{id}', [SavedDocumentController::class, 'update'])->name('saved-documents.update');
    Route::delete('/saved-documents/{id}', [SavedDocumentController::class, 'destroy'])->name('saved-documents.destroy');
    Route::get('/saved-documents/folders', [SavedDocumentController::class, 'folders'])->name('saved-documents.folders');
    Route::get('/saved-documents/check/{documentId}', [SavedDocumentController::class, 'check'])->name('saved-documents.check');
});

// ==================== NOTIFICATION ROUTES ====================
Route::middleware('auth')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/unread', [NotificationController::class, 'getUnread'])->name('notifications.unread');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
});

// ==================== PROFILE ROUTES ====================
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile.index');
    Route::post('/profile/update-password', [ProfileController::class, 'updatePassword'])->name('profile.update-password');
});
