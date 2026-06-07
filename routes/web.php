<?php
// routes/web.php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminUserManagementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentDashboardController;
use App\Http\Controllers\StudentUploadManuscriptController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// Guest routes (only accessible when not logged in)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
    Route::post('/register', [AuthController::class, 'register'])->name('register.post');
});

// Auth routes (requires authentication)
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});

// Admin routes (requires auth and admin role)
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/documents', [AdminDashboardController::class, 'documents'])->name('documents');
    Route::get('/settings', [AdminDashboardController::class, 'settings'])->name('settings');

    // User Management Routes
    Route::get('/users', [AdminUserManagementController::class, 'index'])->name('users');
    Route::post('/users', [AdminUserManagementController::class, 'store'])->name('users.store');
    Route::put('/users/{user}/role', [AdminUserManagementController::class, 'updateRole'])->name('users.update-role');
    Route::put('/users/{user}/status', [AdminUserManagementController::class, 'updateStatus'])->name('users.update-status');
    Route::delete('/users/{user}', [AdminUserManagementController::class, 'destroy'])->name('users.destroy');
    Route::post('/users/{user}/resend-verification', [AdminUserManagementController::class, 'resendVerification'])->name('users.resend-verification');
    Route::post('/users/import', [AdminUserManagementController::class, 'import'])->name('users.import');
    Route::get('/users/export', [AdminUserManagementController::class, 'export'])->name('users.export');
});

Route::middleware(['auth', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('dashboard');

    Route::get('/documents/upload', [StudentUploadManuscriptController::class, 'create'])->name('documents.upload');
    Route::post('/documents', [StudentUploadManuscriptController::class, 'store'])->name('documents.store');
    Route::post('/documents/{id}/submit', [StudentUploadManuscriptController::class, 'submitForReview'])->name('documents.submit');
});
