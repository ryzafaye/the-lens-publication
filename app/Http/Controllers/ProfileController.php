<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
        \App\Auth\CachedEloquentUserProvider::clearCache($user->id);

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
        \App\Auth\CachedEloquentUserProvider::clearCache($user->id);

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }
}

