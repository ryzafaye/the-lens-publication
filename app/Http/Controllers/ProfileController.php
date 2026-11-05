<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Update user's profile details (Name, Student Number, Avatar).
     */
    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        $user->loadMissing('role');

        $request->validate([
            'student_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('users', 'student_number')->ignore($user->id),
            ],
            'full_name' => ['required', 'string', 'max:80'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:3072'],
            'remove_avatar' => ['nullable'],
        ]);

        $user->student_number = $request->student_number;
        $user->full_name = $request->full_name;

        $avatarUrl = null;

        // Handle avatar removal
        if ($request->boolean('remove_avatar') || $request->input('remove_avatar') === '1' || $request->input('remove_avatar') === 'true') {
            if ($user->profile_picture_url && file_exists(public_path($user->profile_picture_url))) {
                @unlink(public_path($user->profile_picture_url));
            }
            $user->profile_picture_url = null;
            $avatarUrl = asset('images/member-placeholder.svg');
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $uploadDir = public_path('images/avatars');
            if (!File::exists($uploadDir)) {
                File::makeDirectory($uploadDir, 0755, true);
            }

            $filename = 'avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadDir, $filename);
            $user->profile_picture_url = 'images/avatars/' . $filename;
            $avatarUrl = asset('images/avatars/' . $filename);
        }

        $user->save();

        if (!$avatarUrl) {
            $avatarUrl = $user->profile_picture_url ? asset($user->profile_picture_url) : asset('images/member-placeholder.svg');
        }

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'student_number' => $user->student_number,
                    'avatar_url' => $avatarUrl,
                    'profile_picture_url' => $avatarUrl,
                    'role' => $user->role->role_name ?? '',
                ],
            ]);
        }

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Alias for updateProfile (shared profile settings).
     */
    public function updateInfo(Request $request)
    {
        return $this->updateProfile($request);
    }

    /**
     * Update user's password.
     */
    public function updatePassword(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        $user->loadMissing('role');

        if (!$request->filled('new_password') && $request->filled('password')) {
            $request->merge(['new_password' => $request->input('password')]);
        }
        if (!$request->filled('new_password_confirmation')) {
            $confirm = $request->input('confirm_password') ?? $request->input('password_confirmation');
            if ($confirm) {
                $request->merge(['new_password_confirmation' => $confirm]);
            }
        }

        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:6', 'confirmed', 'different:current_password'],
        ], [
            'new_password.different' => 'The new password must be different from your current password.',
            'new_password.confirmed' => 'New password confirmation does not match.',
            'new_password.min' => 'The new password must be at least 6 characters.',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'The provided current password does not match our records.'
                ], 422);
            }
            return back()->withErrors(['current_password' => 'The provided current password does not match our records.']);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully'
            ]);
        }

        return back()->with('success', 'Password updated successfully.');
    }
}
