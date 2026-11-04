<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function showLogin()
    {
        return response()
            ->view('login')
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0')
            ->header('Pragma', 'no-cache')
            ->header('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
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

            // Broad check for Editor-in-Chief and Associate Editor-in-Chief roles
            if (str_contains($roleName, 'editor-in-chief') || str_contains($roleName, 'chief') || str_contains($roleName, 'eic')) {
                return redirect()->route('eic.dashboard');
            } elseif (
                str_contains($roleName, 'media') && str_contains($roleName, 'public communications') && str_contains($roleName, 'head')
                || str_contains($roleName, 'm&pc') || str_contains($roleName, 'mpc')
            ) {
                return redirect()->route('mpc-head.dashboard');
            } elseif (str_contains($roleName, 'cartoonist') && str_contains($roleName, 'head')) {
                return redirect()->route('cartoonist-head.dashboard');
            } elseif ($roleName === 'cartoonist') {
                return redirect()->route('cartoonist.dashboard');
            } elseif (str_contains($roleName, 'media') && (str_contains($roleName, 'team') || str_contains($roleName, 'communication'))) {
                return redirect()->route('media.dashboard');
            } elseif (str_ends_with($roleName, 'head') || in_array($rawRoleName, [
                'News Head', 'Literary Head', 'Feature Head', 'Science and Technology Head',
                'Documentary and Podcast Head', 'Photojournalist Head', 'Cartoonist Head'
            ])) {
                return redirect()->route('section-head.dashboard');
            } elseif ($roleName === 'writer') {
                return redirect()->route('writer.dashboard');
            } elseif (in_array($rawRoleName, ['President', 'Executive Vice President', 'Secretary', 'Associate Secretary', 'Treasurer', 'Auditor', 'Public Relations Officer'])) {
                return redirect()->route('executive.dashboard');
            }

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'student_number' => 'Your account does not have a dashboard role configured.',
            ]);
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
        return redirect()->route('login')->with('success', 'You have been logged out successfully.');
    }
}
