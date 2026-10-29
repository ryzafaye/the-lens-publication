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

            $role = Auth::user()->role?->role_name;

            if ($role && in_array($role, ['President', 'Executive Vice President', 'Secretary', 'Associate Secretary', 'Treasurer', 'Auditor', 'Public Relations Officer'])) {
                return redirect()->intended('/executive/dashboard');
            } elseif ($role === 'Writer') {
                return redirect()->intended('/writer/dashboard');
            } elseif ($role && str_contains($role, 'Editor-in-Chief')) {
                return redirect()->intended('/eic/dashboard');
            }
            
            return redirect()->intended('/dashboard'); 
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