<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // Kung hindi pa naka-login, ibalik sa login page
        if (!Auth::check()) {
            return redirect('/login');
        }

        // Kunin ang role ng nag-login
        $userRole = Auth::user()->role->role_name ?? '';

        // Kung ang role niya ay nasa listahan ng pinapayagan (ex. 'Writer'), papasukin
        if (in_array($userRole, $roles)) {
            return $next($request);
        }

        // Kung bawal siya rito, ibalik sa login na may error
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/login')->withErrors([
            'student_number' => 'Access Denied: Hindi tugma ang iyong posisyon para sa pahinang ito.',
        ]);
    }
}