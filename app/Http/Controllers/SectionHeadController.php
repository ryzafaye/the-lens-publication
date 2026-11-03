<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Article;
use App\Models\Category;

class SectionHeadController extends ExecutiveController
{
    public function dashboard()
    {
        return parent::dashboard();
    }

    public function manageMyArticles()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user?->loadMissing('role');

        $articles = Article::with(['category', 'user.role'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($article) use ($user) {
                return [
                    'id' => $article->id,
                    'title' => $article->title,
                    'category' => $article->category->name ?? 'General',
                    'excerpt' => $article->excerpt,
                    'content' => $article->content,
                    'status' => $article->status,
                    'date' => $article->created_at->format('M d, Y'),
                    'rawDate' => $article->created_at->toIso8601String(),
                    'views' => $article->views ?? 0,
                    'shares' => $article->shares ?? 0,
                    'remarks' => $article->remarks,
                    'author' => $user->full_name ?? ($article->user->full_name ?? 'Staff Writer'),
                ];
            });

        return view('executive.manage-my-articles', compact('articles'));
    }

    public function reviewArticles(Request $request)
    {
        return parent::reviewArticles($request);
    }

    public function submitArticle(Request $request)
    {
        $categories = Category::all();

        $drafts = Article::with(['category', 'user.role'])
            ->where('user_id', Auth::id())
            ->whereIn('status', ['Draft', 'For Revision'])
            ->latest()
            ->get();

        $editingDraft = null;
        if ($request->has('draft_id')) {
            $editingDraft = Article::with(['category', 'user.role'])
                ->where('user_id', Auth::id())
                ->whereIn('status', ['Draft', 'For Revision'])
                ->find($request->draft_id);
        }

        return view('executive.submit-article', compact('categories', 'drafts', 'editingDraft'));
    }

    public function activityLogs()
    {
        return view('executive.activity-logs');
    }

    public function profileSettings()
    {
        return view('executive.profile-settings');
    }
}
