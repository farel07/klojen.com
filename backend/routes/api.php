<?php

use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json([
        'message' => 'Hello from Laravel 12!',
        'status' => 'ok',
    ]);
});

Route::get('/users', function () {
    return response()->json([
        'data' => [
            ['id' => 1, 'name' => 'Budi', 'email' => 'budi@mail.com'],
            ['id' => 2, 'name' => 'Siti', 'email' => 'siti@mail.com'],
        ]
    ]);
});
