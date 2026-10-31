<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // If unauthenticated, redirect to the login page
        if (!Auth::check()) {
            return redirect('/login');
        }

        // Retrieve the authenticated user's role
        $userRole = Auth::user()->role->role_name ?? '';

        // If the user's role is in the authorized roles list, allow the request
        if (in_array($userRole, $roles)) {
            return $next($request);
        }

        // Support SectionHead group alias
        if (in_array('SectionHead', $roles) && (str_ends_with($userRole, 'Head') || in_array($userRole, [
            'News Head', 'Literary Head', 'Feature Head', 'Science and Technology Head',
            'Documentary and Podcast Head', 'Media and Public Communications Head',
            'Associate Media and Public Communications Head',
            'Photojournalist Head', 'Cartoonist Head'
        ]))) {
            return $next($request);
        }

        // If unauthorized, log out and redirect to login with an error message
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/login')->withErrors([
            'student_number' => 'Access Denied: Your account role does not have permission to access this page.',
        ]);
    }
}