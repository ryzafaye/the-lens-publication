<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
<<<<<<< HEAD
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function updateInfo(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        $user->loadMissing('role');

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:80'],
            'student_number' => ['required', 'string', 'max:30', 'unique:users,student_number,' . $user->id],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:3072'],
        ]);

        $user->full_name = $validated['full_name'];
        $user->student_number = $validated['student_number'];

        $avatarUrl = null;
        if ($request->hasFile('avatar')) {
            // Delete old avatar if stored on public disk
            if ($user->profile_picture_url && str_starts_with($user->profile_picture_url, 'avatars/')) {
                Storage::disk('public')->delete($user->profile_picture_url);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->profile_picture_url = $path;

            // Ensure physical copy in public/storage/avatars for direct serving without symlink
            try {
                $destDir = public_path('storage/avatars');
                if (!file_exists($destDir)) {
                    @mkdir($destDir, 0755, true);
                }
                @copy(storage_path('app/public/' . $path), public_path('storage/' . $path));
            } catch (\Throwable $e) {}

            $avatarUrl = asset('storage/' . $path);
        } elseif ($request->boolean('remove_avatar') || $request->input('remove_avatar') === '1') {
            if ($user->profile_picture_url && str_starts_with($user->profile_picture_url, 'avatars/')) {
                Storage::disk('public')->delete($user->profile_picture_url);
            }
            $user->profile_picture_url = null;
            $avatarUrl = asset('images/member-placeholder.svg');
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'full_name' => $user->full_name,
                'student_number' => $user->student_number,
                'avatar_url' => $avatarUrl ?? ($user->profile_picture_url ? asset('storage/' . $user->profile_picture_url) : asset('images/member-placeholder.svg')),
            ]
        ]);
    }

    public function updatePassword(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        $user->loadMissing('role');

        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:6', 'confirmed', 'different:current_password'],
        ], [
            'new_password.different' => 'The new password must be different from your current password.',
            'new_password.confirmed' => 'New password confirmation does not match.',
            'new_password.min' => 'The new password must be at least 6 characters.',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'The provided current password does not match our records.'
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }
}

=======
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
>>>>>>> 5b599e1874fdaa84f38395ada5e3509bd80996ab
