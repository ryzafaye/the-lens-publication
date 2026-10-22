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
            'password' => ['required', 'string'],
        ]);

        // Attempt login with Supabase database
        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            $user = Auth::user();

            // Check if account is active
            if ($user->account_status !== 'active') {
                Auth::logout();
                return response()->json([
                    'success' => false,
                    'message' => 'Your account is deactivated.'
                ], 403);
            }

            $user->load('role');
            $roleName = $user->role ? $user->role->role_name : 'Staffer';
            $isWriter = str_contains(strtolower($roleName), 'writer') || 
                        str_contains(strtolower($roleName), 'staffer') ||
                        str_contains(strtolower($roleName), 'contributor');

            $targetPage = $isWriter ? 'writer-dashboard.html' : 'executive-dashboard.html';

            return response()->json([
                'success' => true,
                'message' => 'Login successful!',
                'user' => [
                    'id' => $user->id,
                    'student_number' => $user->student_number,
                    'full_name' => $user->full_name,
                    'role' => $roleName,
                    'is_writer' => $isWriter,
                    'redirect_to' => $targetPage,
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid student number or password.'
        ], 401);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully!']);
    }
}
