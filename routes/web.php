<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExecutiveController;
use App\Http\Controllers\WriterController;

Route::get('/', function () {
    return redirect('/login');
});

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');


Route::middleware(['auth', 'role:President,Executive Vice President,Secretary,Associate Secretary,Treasurer,Auditor,Public Relations Officer'])
    ->prefix('executive')
    ->name('executive.')
    ->group(function () {
        
    Route::get('/dashboard', [ExecutiveController::class, 'dashboard'])->name('dashboard');
    
    
});

Route::middleware(['auth', 'role:Writer'])
    ->prefix('writer')
    ->name('writer.')
    ->group(function () {
        
    Route::get('/dashboard', [WriterController::class, 'dashboard'])->name('dashboard');
    Route::get('/submit-article', [WriterController::class, 'submitArticle'])->name('submit-article');
    Route::post('/submit-article', [WriterController::class, 'storeArticle'])->name('store-article');
    Route::get('/manage-my-articles', [WriterController::class, 'manageMyArticles'])->name('manage-my-articles');
    Route::get('/manage-articles', function () {
        return redirect()->route('writer.manage-my-articles');
    });
    Route::delete('/drafts/{id}', [WriterController::class, 'destroyDraft'])->name('destroyDraft');

});
