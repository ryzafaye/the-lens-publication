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
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect()->route('login');
        }
        $user->loadMissing('role');

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:80'],
            'student_number' => ['required', 'string', 'max:30', 'unique:users,student_number,' . $user->id],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:3072'],
        ]);

        $user->full_name = trim($validated['full_name']);
        $user->student_number = trim($validated['student_number']);

        $avatarUrl = null;
        if ($request->hasFile('avatar')) {
            // Delete old avatar if stored on public disk
            $oldPath = ltrim((string) $user->profile_picture_url, '/');
            if (str_starts_with($oldPath, 'storage/')) {
                $oldPath = substr($oldPath, 8);
            }
            if ($oldPath && str_starts_with($oldPath, 'avatars/')) {
                Storage::disk('public')->delete($oldPath);
                @unlink(public_path('storage/' . $oldPath));
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
            $oldPath = ltrim((string) $user->profile_picture_url, '/');
            if (str_starts_with($oldPath, 'storage/')) {
                $oldPath = substr($oldPath, 8);
            }
            if ($oldPath && str_starts_with($oldPath, 'avatars/')) {
                Storage::disk('public')->delete($oldPath);
                @unlink(public_path('storage/' . $oldPath));
            }
            $user->profile_picture_url = null;
            $avatarUrl = asset('images/member-placeholder.svg');
        }

        $user->save();
        Auth::setUser($user);
        \App\Auth\CachedEloquentUserProvider::clearCache($user->id);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => [
                    'full_name' => $user->full_name,
                    'student_number' => $user->student_number,
                    'role' => $user->role ? $user->role->role_name : null,
                    'avatar_url' => $avatarUrl ?? $user->avatar_url,
                ]
            ]);
        }

        return back()->with('success', 'Profile updated successfully');
    }

    public function updatePassword(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect()->route('login');
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
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'The provided current password does not match our records.'
                ], 422);
            }
            return back()->withErrors(['current_password' => 'The provided current password does not match our records.']);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();
        Auth::setUser($user);
        \App\Auth\CachedEloquentUserProvider::clearCache($user->id);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Password updated successfully'
            ]);
        }

        return back()->with('success', 'Password updated successfully');
    }
}

