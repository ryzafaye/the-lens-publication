<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'student_number' => ['required', 'string'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            /** @var \App\Models\User $user */
            $user = Auth::user();
            // Eager load role relationship immediately for redirection and session state
            $user?->load('role');

<<<<<<< HEAD
            // Fetch relational role name and normalize
            $rawRoleName = $user->role->role_name ?? '';
            $roleName = strtolower(trim($rawRoleName));

            // Broad check for Editor-in-Chief and Associate Editor-in-Chief roles (e.g., "Associate Editor-in-Chief", "Assoc EIC")
            if (str_contains($roleName, 'editor-in-chief') || str_contains($roleName, 'chief') || str_contains($roleName, 'eic')) {
                return redirect()->route('eic.dashboard');
            } elseif (str_ends_with($roleName, 'head')) {
                return redirect()->route('section-head.dashboard');
            } elseif ($roleName === 'writer') {
                return redirect()->route('writer.dashboard');
            } elseif (in_array($rawRoleName, ['President', 'Executive Vice President', 'Secretary', 'Associate Secretary', 'Treasurer', 'Auditor', 'Public Relations Officer'])) {
                return redirect()->route('executive.dashboard');
=======
            if ($role && in_array($role, ['President', 'Executive Vice President', 'Secretary', 'Associate Secretary', 'Treasurer', 'Auditor', 'Public Relations Officer'])) {
                return redirect()->intended('/executive/dashboard');
            } elseif ($role === 'Writer') {
                return redirect()->intended('/writer/dashboard');
            } elseif ($role && str_contains($role, 'Editor-in-Chief')) {
                return redirect()->intended('/eic/dashboard');
            } elseif ($role && (str_ends_with($role, 'Head') || in_array($role, [
                'News Head', 'Literary Head', 'Feature Head', 'Science and Technology Head',
                'Documentary and Podcast Head', 'Media and Public Communications Head',
                'Associate Media and Public Communications Head',
                'Photojournalist Head', 'Cartoonist Head'
            ]))) {
                return redirect()->intended('/section-head/dashboard');
>>>>>>> 5b599e1874fdaa84f38395ada5e3509bd80996ab
            }

            // Fallback
            return redirect('/dashboard'); 
        }

        return back()->withErrors([
            'student_number' => 'Invalid student number or password.',
        ])->onlyInput('student_number');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }
}