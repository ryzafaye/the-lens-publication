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

        /** @var \App\Models\User $user */
        $user = Auth::user();
        // Eager load role relationship if not already loaded
        $user?->loadMissing('role');

        // Retrieve the authenticated user's role
        $userRole = $user->role->role_name ?? '';
        $userRoleLower = strtolower(trim($userRole));
        $rolesLower = array_map(fn($r) => strtolower(trim($r)), $roles);

        // If the user's role is in the authorized roles list, allow the request
        if (in_array($userRole, $roles) || in_array($userRoleLower, $rolesLower)) {
            return $next($request);
        }

        // Allow any Chief / EIC role if Editor-in-Chief or Associate Editor-in-Chief is among authorized roles
        if (
            in_array('Editor-in-Chief', $roles) ||
            in_array('Associate Editor-in-Chief', $roles) ||
            in_array('editor-in-chief', $rolesLower) ||
            in_array('associate editor-in-chief', $rolesLower)
        ) {
            if (str_contains($userRoleLower, 'chief') || str_contains($userRoleLower, 'eic')) {
                return $next($request);
            }
        }

        // Support SectionHead group alias
        $isMpcHead = str_contains($userRoleLower, 'm&pc')
            || str_contains($userRoleLower, 'mpc')
            || (str_contains($userRoleLower, 'media') && str_contains($userRoleLower, 'public communications') && str_contains($userRoleLower, 'head'));

        if (!$isMpcHead && (in_array('SectionHead', $roles) || in_array('sectionhead', $rolesLower)) && (str_ends_with($userRole, 'Head') || in_array($userRole, [
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
