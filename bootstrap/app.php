<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function ($response, $e, $request) {
            if ($response->getStatusCode() === 419) {
                if ($request->expectsJson() || $request->ajax()) {
                    return response()->json(['message' => 'Your session has expired. Please refresh the page and try again.'], 419);
                }
                return redirect()->route('login')->withErrors([
                    'student_number' => 'Your session expired. Please sign in again.',
                ])->withInput($request->except('password', '_token'));
            }
            return $response;
        });
    })->create();
