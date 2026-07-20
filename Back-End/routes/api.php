<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TodoController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected todo and logout routes require a valid Sanctum token.
Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/todos', [TodoController::class, 'index']);

    Route::post('/todos', [TodoController::class, 'store']);

    Route::put('/todos/{todo}', [TodoController::class, 'update']);

    Route::delete('/todos/{todo}', [TodoController::class, 'destroy']);

    Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');
});

