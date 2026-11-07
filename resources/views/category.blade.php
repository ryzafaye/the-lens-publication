@extends('layouts.public')

@section('title', $currentCategory->name)

@section('content')
<main class="max-w-7xl mx-auto px-6 py-10" data-page="category" data-category="{{ $currentCategory->slug }}">

    <!-- Category Header -->
    <section class="mb-10 pb-6 border-b border-stone-200">
        <p class="text-xs tracking-widest text-wine font-bold mb-2 uppercase">
            The Lens Publication · Section
        </p>
        <h1 class="font-display text-4xl md:text-5xl font-extrabold text-wine">
            {{ $currentCategory->name }}
        </h1>
        @if(!empty($currentCategory->description))
            <p class="mt-3 text-stone-600 text-sm max-w-2xl leading-relaxed">
                {{ $currentCategory->description }}
            </p>
        @endif
    </section>

    <!-- Articles Feed -->
    <section class="space-y-6">
        @forelse($articles as $article)
            @php
                $words = str_word_count(strip_tags($article->content ?? ''));
                $readingTime = max(1, (int) ceil($words / 200));
                $coverUrl = $article->cover_url ?: asset('images/maroon.jpg');
            @endphp
            <article class="category-list-card" data-article-id="{{ $article->id }}">
                <a href="{{ route('public.article', $article->slug) }}" class="category-list-image article-clickable" aria-label="Read article: {{ $article->title }}">
                    <div class="article-image category-list-thumb">
                        <img src="{{ $coverUrl }}" alt="{{ $article->title }}" loading="lazy">
                    </div>
                </a>
                <div class="category-list-copy">
                    <div class="article-meta">
                        <span class="article-category-label">{{ $article->category->name ?? 'The Lens' }}</span>
                        <span class="article-meta-separator" aria-hidden="true">·</span>
                        <time>{{ $article->published_at ? $article->published_at->format('M d, Y') : $article->created_at->format('M d, Y') }}</time>
                    </div>
                    <h3 class="category-list-title">
                        <a href="{{ route('public.article', $article->slug) }}" class="article-title-button">
                            {{ $article->title }}
                        </a>
                    </h3>
                    <p class="category-list-excerpt">{{ $article->excerpt }}</p>
                    <p class="article-byline">
                        <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
                        <span>By 
                            @if($article->user)
                                <a class="author-profile-link" href="{{ route('public.author', $article->user_id) }}">
                                    {{ $article->user->full_name }}
                                </a>
                            @else
                                <strong>The Lens Staff</strong>
                            @endif
                        </span>
                    </p>
                    <div class="article-stats" aria-label="Article engagement and reading time">
                        <span class="article-view-count" title="Views">
                            <i class="fa-regular fa-eye" aria-hidden="true"></i>
                            <span>{{ number_format($article->views) }}</span><span class="stat-label">views</span>
                        </span>
                        <span class="article-read-time" title="Estimated reading time">
                            <i class="fa-regular fa-clock" aria-hidden="true"></i>
                            <span>{{ $readingTime }} min read</span>
                        </span>
                        <button type="button" class="article-share-button" data-copy-article-id="{{ $article->id }}" data-article-url="{{ route('public.article', $article->slug) }}" title="Copy article link">
                            <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
                            <span>Share</span>
                            <span class="share-count" data-share-count="{{ $article->id }}">{{ $article->shares }}</span>
                        </button>
                    </div>
                </div>
            </article>
        @empty
            <div class="p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl my-8">
                <i class="fa-regular fa-newspaper text-4xl mb-3 text-slate-300 block"></i>
                <h3 class="font-bold text-lg text-slate-700">No Published Stories in this Section Yet</h3>
                <p class="text-xs text-slate-500 mt-1">Articles published by the editorial team will appear here.</p>
                <div class="mt-6">
                    <a href="{{ route('public.home') }}" class="inline-block border border-wine px-4 py-2 text-wine text-xs font-bold rounded hover:bg-rose-50 transition-colors">
                        ← Back to Homepage
                    </a>
                </div>
            </div>
        @endforelse
    </section>

    <!-- Pagination -->
    @if($articles->hasPages())
        <div class="mt-10 flex justify-center">
            {{ $articles->links() }}
        </div>
    @endif

</main>
@endsection
