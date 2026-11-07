@extends('layouts.public')

@section('title', $article->title)
@section('hide_header_footer', true)
@section('body_class', 'bg-white text-stone-900 font-body antialiased h-screen overflow-hidden m-0 p-0 article-reader-body')

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

<!-- Full-Screen Article Reader Shell (No Header, No Footer, No Visible Scrollbar) -->
<div class="article-reader-fullscreen modal-scroll-container" id="article-reader-container" tabindex="0">
    
    <!-- Minimalist Top Reader Bar -->
    <header class="modal-topbar">
        <a href="{{ route('public.home') }}" class="modal-topbar-brand" aria-label="The Lens home">
            <i class="fa-regular fa-newspaper" aria-hidden="true"></i>
            <span>THE LENS</span>
        </a>
        <button type="button" class="modal-topbar-close" onclick="closeArticleReader()" aria-label="Close article reader" title="Close reader (Esc)">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
    </header>

    <!-- Reading Content (Exactly matches reader dialog styling) -->
    <div class="modal-reader">
        <article class="modal-reading-content">
            
            <!-- Category & Reading Time Row -->
            <div class="modal-category-row">
                <span class="modal-category">
                    <i class="fa-solid fa-layer-group" aria-hidden="true"></i>
                    <a href="{{ route('public.category', $article->category->slug ?? 'news') }}">
                        {{ $article->category->name ?? 'The Lens' }}
                    </a>
                </span>
                <span class="modal-reading-time">
                    <i class="fa-regular fa-clock" aria-hidden="true"></i>
                    <span>{{ $readingTime }} min read</span>
                </span>
            </div>

            <!-- Headline -->
            <h1 class="modal-title">
                {{ $article->title }}
            </h1>

            <!-- Byline & Published Date -->
            <div class="modal-byline">
                <span>
                    <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
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
                <span>
                    <i class="fa-regular fa-calendar" aria-hidden="true"></i>
                    <span>Published {{ $article->published_at ? $article->published_at->format('M j, Y') : $article->created_at->format('M j, Y') }}</span>
                </span>
            </div>

            <!-- Lead Excerpt Callout -->
            @if(!empty($article->excerpt))
                <p class="modal-lead-excerpt">
                    {{ $article->excerpt }}
                </p>
            @endif

            <!-- Cover Image Figure -->
            <figure class="modal-figure">
                <div class="modal-image">
                    <img src="{{ $coverUrl }}" alt="{{ $article->title }}" loading="eager">
                </div>
                <figcaption class="modal-caption">
                    <span><i class="fa-solid fa-camera mr-1" aria-hidden="true"></i> {{ $article->title }}</span>
                    <span>THE LENS / {{ strtoupper($article->category->name ?? 'COVER MEDIA') }}</span>
                </figcaption>
            </figure>

            <!-- Sanitized Article Body -->
            <div class="modal-body prose prose-stone max-w-none">
                {!! $cleanContent !!}
            </div>

            <!-- Engagement & Sharing Row -->
            <div class="modal-engagement-row flex items-center justify-between">
                <div class="article-stats flex items-center gap-6">
                    <span class="article-view-count flex items-center gap-2" title="Views">
                        <i class="fa-regular fa-eye text-stone-400" aria-hidden="true"></i>
                        <strong class="font-bold text-stone-800">{{ number_format($article->views) }}</strong>
                        <span class="stat-label text-xs text-stone-500">views</span>
                    </span>
                    <button type="button" class="copy-link-btn inline-flex items-center gap-2" data-copy-article-id="{{ $article->id }}" data-article-url="{{ route('public.article', $article->slug) }}" title="Copy article link">
                        <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
                        <span>Share</span>
                        <span class="share-count" data-share-count="{{ $article->id }}">{{ $article->shares }}</span>
                    </button>
                </div>
                <div>
                    <a href="{{ route('public.category', $article->category->slug ?? 'news') }}" class="more-in-category-link">
                        More in {{ $article->category->name ?? 'Section' }} →
                    </a>
                </div>
            </div>

            <!-- Continue Reading Section -->
            @if($relatedArticles->isNotEmpty())
                <section class="continue-reading" aria-labelledby="continue-reading-title">
                    <div class="continue-reading-heading">
                        <p class="continue-reading-eyebrow">MORE FROM THE LENS</p>
                        <h2 id="continue-reading-title">Continue reading</h2>
                        <p>Explore more campus stories selected for you.</p>
                    </div>
                    <div class="continue-reading-grid">
                        @foreach($relatedArticles as $rel)
                            @php
                                $relWords = str_word_count(strip_tags($rel->content ?? ''));
                                $relMinutes = max(1, (int) ceil($relWords / 200));
                                $relImg = $rel->cover_url ?: asset('images/maroon.jpg');
                            @endphp
                            <article class="continue-story-card" data-article-id="{{ $rel->id }}">
                                <a href="{{ route('public.article', $rel->slug) }}" class="continue-story-image" aria-label="Read article: {{ $rel->title }}">
                                    <div class="continue-story-thumb">
                                        <img src="{{ $relImg }}" alt="{{ $rel->title }}" loading="lazy">
                                    </div>
                                </a>
                                <div class="continue-story-copy">
                                    <p class="continue-story-category">
                                        {{ $rel->category->name ?? 'The Lens' }}
                                    </p>
                                    <h3>
                                        <a href="{{ route('public.article', $rel->slug) }}" class="continue-story-title">
                                            {{ $rel->title }}
                                        </a>
                                    </h3>
                                    <p class="continue-story-excerpt">
                                        {{ $rel->excerpt ?: 'Read more from The Lens.' }}
                                    </p>
                                    <div class="continue-story-meta">
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

</div>

@push('scripts')
<script>
    function closeArticleReader() {
        if (document.referrer && document.referrer.indexOf(window.location.host) !== -1 && window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = "{{ route('public.home') }}";
        }
    }

    // Keyboard navigation: Escape key closes the reader
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeArticleReader();
        }
    });

    // Auto-focus container so arrow keys and page up/down scroll immediately
    document.addEventListener('DOMContentLoaded', function () {
        const container = document.getElementById('article-reader-container');
        if (container) {
            container.focus();
        }
    });
</script>
@endpush
@endsection
