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
     * Update user's profile details (Name, Student Number, Avatar) in Supabase.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'student_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('users', 'student_number')->ignore($user->id),
            ],
            'full_name' => ['required', 'string', 'max:255'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:3072'],
            'remove_avatar' => ['nullable', 'in:0,1,true,false'],
        ]);

        $updateData = [
            'student_number' => $request->student_number,
            'full_name' => $request->full_name,
        ];

        // Handle avatar removal
        if ($request->input('remove_avatar') == '1' || $request->input('remove_avatar') === 'true') {
            $updateData['profile_picture_url'] = null;
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
            $updateData['profile_picture_url'] = 'images/avatars/' . $filename;
        }

        $user->update($updateData);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully.',
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'student_number' => $user->student_number,
                    'profile_picture_url' => $user->profile_picture_url ? asset($user->profile_picture_url) : asset('images/member-placeholder.svg'),
                    'role' => $user->role->role_name ?? '',
                ],
            ]);
        }

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Update user's password in Supabase.
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect.',
                ], 422);
            }
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        if (Hash::check($request->new_password, $user->password)) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'New password must be different from your current password.',
                ], 422);
            }
            return back()->withErrors(['new_password' => 'New password must be different from current password.']);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully.',
            ]);
        }

        return back()->with('success', 'Password updated successfully.');
    }
}
