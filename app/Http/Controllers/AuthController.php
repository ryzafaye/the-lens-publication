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