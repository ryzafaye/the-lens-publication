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
            // Eager load role relationship if needed
            $user?->loadMissing('role');

            // Fetch relational role name and normalize
            $rawRoleName = $user->role->role_name ?? '';
            $roleName = strtolower(trim($rawRoleName));

            // Cartoonist and Cartoonist Head portal
            if (str_contains($roleName, 'cartoonist')) {
                return redirect()->route('cartoonist.dashboard');
            } elseif (str_contains($roleName, 'media team') || $roleName === 'media & communication' || str_contains($roleName, 'photojournalist')) {
                return redirect()->route('media.dashboard');
            } elseif (str_contains($roleName, 'editor-in-chief') || (str_contains($roleName, 'eic') && !str_contains($roleName, 'section')) || $roleName === 'associate editor-in-chief') {
                return redirect()->route('eic.dashboard');
            } elseif (str_contains($roleName, 'm&pc') || str_contains($roleName, 'media and public')) {
                return redirect()->route('mpc.dashboard');
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
        $userId = Auth::id();
        Auth::logout();
        \App\Auth\CachedEloquentUserProvider::clearCache($userId);
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }
}