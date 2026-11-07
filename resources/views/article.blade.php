@extends('layouts.public')

@section('title', $article->title)

@section('content')
@php
    $words = str_word_count(strip_tags($article->content ?? ''));
    $readingTime = max(1, (int) ceil($words / 200));
    $coverUrl = $article->cover_url ?: asset('images/maroon.jpg');

    // Content formatting: sanitize dangerous tags while preserving editorial formatting
    $raw = $article->content ?: $article->excerpt ?: '';
    $cleanContent = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $raw);
    $cleanContent = preg_replace('/<iframe\b[^>]*>(.*?)<\/iframe>/is', '', $cleanContent);
    if (!str_contains($cleanContent, '<p>') && !str_contains($cleanContent, '<div') && !str_contains($cleanContent, '<h')) {
        $cleanContent = '<p>' . nl2br(e($cleanContent)) . '</p>';
    }
@endphp

<div class="max-w-4xl mx-auto px-6 py-10 font-body">

    <!-- Top Navigation / Breadcrumbs -->
    <div class="flex items-center justify-between pb-6 mb-8 border-b border-stone-200 text-xs">
        <a href="{{ route('public.home') }}" class="inline-flex items-center gap-2 text-stone-500 hover:text-wine font-medium transition-colors">
            <i class="fa-solid fa-arrow-left text-xs" aria-hidden="true"></i>
            <span>Back to Stories</span>
        </a>
        <div class="flex items-center gap-2 text-stone-400">
            <a href="{{ route('public.home') }}" class="hover:text-stone-600">Home</a>
            <span>/</span>
            <a href="{{ route('public.category', $article->category->slug ?? 'news') }}" class="hover:text-stone-600">
                {{ $article->category->name ?? 'News' }}
            </a>
        </div>
    </div>

    <!-- Article Content Shell (modal-reading-content styling) -->
    <article class="modal-reading-content max-w-3xl mx-auto">
        <!-- Category & Reading Time Row -->
        <div class="modal-category-row flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-wine mb-3">
            <span class="modal-category flex items-center gap-1.5">
                <i class="fa-solid fa-layer-group" aria-hidden="true"></i>
                <a href="{{ route('public.category', $article->category->slug ?? 'news') }}" class="hover:underline">
                    {{ $article->category->name ?? 'The Lens' }}
                </a>
            </span>
            <span class="modal-reading-time flex items-center gap-1.5 text-stone-500 font-normal">
                <i class="fa-regular fa-clock" aria-hidden="true"></i>
                <span>{{ $readingTime }} min read</span>
            </span>
        </div>

        <!-- Headline -->
        <h1 class="modal-title font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 leading-tight mb-4">
            {{ $article->title }}
        </h1>

        <!-- Byline & Published Date -->
        <div class="modal-byline flex flex-wrap items-center gap-4 text-xs text-stone-500 pb-5 border-b border-stone-200 mb-6">
            <span class="flex items-center gap-1.5 font-medium text-stone-800">
                <i class="fa-solid fa-pen-nib text-wine" aria-hidden="true"></i>
                <span>By 
                    @if($article->user)
                        <a class="author-profile-link font-bold text-wine hover:underline" href="{{ route('public.author', $article->user_id) }}">
                            {{ $article->user->full_name }}
                        </a>
                    @else
                        <strong>The Lens Staff</strong>
                    @endif
                </span>
            </span>
            <span class="text-stone-300">•</span>
            <span class="flex items-center gap-1.5">
                <i class="fa-regular fa-calendar" aria-hidden="true"></i>
                <span>Published {{ $article->published_at ? $article->published_at->format('F j, Y') : $article->created_at->format('F j, Y') }}</span>
            </span>
        </div>

        <!-- Lead Excerpt -->
        @if(!empty($article->excerpt))
            <p class="modal-lead-excerpt text-lg md:text-xl font-serif text-stone-600 italic leading-relaxed mb-8 pl-4 border-l-4 border-wine">
                {{ $article->excerpt }}
            </p>
        @endif

        <!-- Cover Image -->
        <figure class="modal-figure mb-8">
            <div class="article-image modal-image rounded-xl overflow-hidden shadow-sm border border-stone-100">
                <img src="{{ $coverUrl }}" alt="{{ $article->title }}" class="w-full object-cover max-h-[500px]">
            </div>
            <figcaption class="modal-caption text-xs text-stone-500 mt-2.5 flex items-center justify-between">
                <span><i class="fa-solid fa-camera mr-1" aria-hidden="true"></i> {{ $article->title }}</span>
                <span class="text-stone-400">The Lens / {{ $article->category->name ?? 'Publication' }}</span>
            </figcaption>
        </figure>

        <!-- Sanitized Article Body -->
        {{-- Outputting sanitized editorial HTML content from rich-text editor --}}
        <div class="modal-body prose prose-stone max-w-none text-stone-800 leading-relaxed font-body text-base space-y-5">
            {!! $cleanContent !!}
        </div>

        <!-- Article Engagement Row -->
        <div class="modal-engagement-row mt-10 pt-6 border-t border-stone-200 flex items-center justify-between">
            <div class="article-stats flex items-center gap-6 text-sm text-stone-600">
                <span class="article-view-count flex items-center gap-2" title="Views">
                    <i class="fa-regular fa-eye text-stone-400" aria-hidden="true"></i>
                    <span class="font-bold text-stone-800">{{ number_format($article->views) }}</span>
                    <span class="stat-label text-xs text-stone-500">views</span>
                </span>
                <button type="button" class="article-share-button inline-flex items-center gap-2 border border-stone-300 hover:border-wine hover:text-wine px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors" data-copy-article-id="{{ $article->id }}" data-article-url="{{ route('public.article', $article->slug) }}" title="Copy article link">
                    <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
                    <span>Share</span>
                    <span class="share-count bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded text-[11px]" data-share-count="{{ $article->id }}">{{ $article->shares }}</span>
                </button>
            </div>
            <div>
                <a href="{{ route('public.category', $article->category->slug ?? 'news') }}" class="text-xs font-bold text-wine hover:underline">
                    More in {{ $article->category->name ?? 'Section' }} →
                </a>
            </div>
        </div>

        <!-- Continue Reading Section -->
        @if($relatedArticles->isNotEmpty())
            <section class="continue-reading mt-16 pt-10 border-t-2 border-wine" aria-labelledby="continue-reading-title">
                <div class="continue-reading-heading mb-8">
                    <p class="continue-reading-eyebrow text-xs font-bold tracking-widest text-wine uppercase">MORE FROM THE LENS</p>
                    <h2 id="continue-reading-title" class="font-display text-2xl md:text-3xl font-bold text-stone-900 mt-1">
                        Continue reading
                    </h2>
                    <p class="text-xs text-stone-500 mt-1">Explore more campus stories selected for you.</p>
                </div>
                <div class="continue-reading-grid grid grid-cols-1 md:grid-cols-3 gap-6">
                    @foreach($relatedArticles as $rel)
                        @php
                            $relWords = str_word_count(strip_tags($rel->content ?? ''));
                            $relMinutes = max(1, (int) ceil($relWords / 200));
                            $relImg = $rel->cover_url ?: asset('images/maroon.jpg');
                        @endphp
                        <article class="continue-story-card border border-stone-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col" data-article-id="{{ $rel->id }}">
                            <a href="{{ route('public.article', $rel->slug) }}" class="continue-story-image block aspect-video overflow-hidden bg-stone-100" aria-label="Read article: {{ $rel->title }}">
                                <img src="{{ $relImg }}" alt="{{ $rel->title }}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy">
                            </a>
                            <div class="continue-story-copy p-4 flex flex-col flex-grow">
                                <p class="continue-story-category text-[11px] font-bold text-wine uppercase tracking-wider mb-1">
                                    {{ $rel->category->name ?? 'The Lens' }}
                                </p>
                                <h3 class="font-display font-bold text-stone-900 text-sm mb-2 line-clamp-2 hover:text-wine transition-colors">
                                    <a href="{{ route('public.article', $rel->slug) }}">
                                        {{ $rel->title }}
                                    </a>
                                </h3>
                                <p class="continue-story-excerpt text-xs text-stone-500 line-clamp-2 mb-4 flex-grow">
                                    {{ $rel->excerpt ?: 'Read more from The Lens.' }}
                                </p>
                                <div class="continue-story-meta pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                                    <span><i class="fa-regular fa-clock mr-1" aria-hidden="true"></i> {{ $relMinutes }} min read</span>
                                    <span>{{ $rel->published_at ? $rel->published_at->format('M d') : $rel->created_at->format('M d') }}</span>
                                </div>
                            </div>
                        </article>
                    @endforeach
                </div>
            </section>
        @endif

    </article>
</div>
@endsection
