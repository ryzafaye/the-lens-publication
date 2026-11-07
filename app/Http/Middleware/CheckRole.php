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

        // Broad check for Media and Public Communications (M&PC) Head and Associate roles
        if (
            in_array('Media and Public Communications Head', $roles) ||
            in_array('Associate Media and Public Communications Head', $roles) ||
            in_array('M&PC Head', $roles) ||
            in_array('Associate M&PC Head', $roles) ||
            in_array('media and public communications head', $rolesLower) ||
            in_array('associate media and public communications head', $rolesLower) ||
            in_array('m&pc head', $rolesLower) ||
            in_array('associate m&pc head', $rolesLower)
        ) {
            if (str_contains($userRoleLower, 'm&pc') || str_contains($userRoleLower, 'media and public')) {
                return $next($request);
            }
        }

        // Broad check for Media Team, Photojournalist, and Photojournalist Head roles
        if (
            in_array('Media Team', $roles) ||
            in_array('media team', $rolesLower) ||
            in_array('Photojournalist', $roles) ||
            in_array('photojournalist', $rolesLower) ||
            in_array('Photojournalist Head', $roles) ||
            in_array('photojournalist head', $rolesLower) ||
            in_array('Media & Communication', $roles) ||
            in_array('media & communication', $rolesLower)
        ) {
            if (str_contains($userRoleLower, 'media') || str_contains($userRoleLower, 'photojournalist')) {
                return $next($request);
            }
        }

        // If unauthorized, abort 403 if authenticated, or redirect to login
        if (Auth::check()) {
            abort(403, 'Access Denied: Your account role does not have permission to access this page.');
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/login')->withErrors([
            'student_number' => 'Access Denied: Your account role does not have permission to access this page.',
        ]);
    }
}