<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{

    public function login(Request $request)
    {
        // Validate the form data
        $credentials = $request->validate([
            'student_number' => ['required', 'string'],
            'password' => ['required'],
        ]);

        // Supabase check if credentials are correct
        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            // Check if account is active
            if (Auth::user()->account_status !== 'active') {
                Auth::logout();
                return back()->withErrors(['student_number' => 'Your account is deactivated.']);
            }

            return response()->json([
                'message' => 'Login successful!',
                'user' => Auth::user()
            ]);
        }

        return back()->withErrors([
            'student_number' => 'Wrong student number or password.',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        
        // Erasing the session data
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully!']);
    }
}