<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sender_name' => 'nullable|string|max:100',
            'sender_email' => 'nullable|email|max:150',
            'subject' => 'nullable|string|max:255',
            'content' => 'required|string|max:2000',
        ]);

        $feedback = Feedback::create([
            'sender_name' => $validated['sender_name'] ?? 'Anonymous Reader',
            'sender_email' => $validated['sender_email'] ?? 'anonymous@thelens.edu',
            'subject' => $validated['subject'] ?? 'Reader Feedback',
            'content' => $validated['content'],
            'status' => 'unread',
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Thank you! Your feedback has been sent to the editorial board.',
        ], 201);
    }
}
