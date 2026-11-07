@extends('layouts.public')

@section('title', $authorName . ' | Author Profile')

@section('content')
<main class="author-profile-page" data-page="author-profile">

    <!-- Top Navigation -->
    <nav class="author-nav-bar" aria-label="Author navigation">
        <a class="author-back-btn" href="{{ route('public.archives') }}">
            <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
            <span>Back to All Articles</span>
        </a>
    </nav>

    <div id="author-profile-content" aria-live="polite">
        @if(!$author && $articles->isEmpty())
            <div class="author-empty-state">
                <span class="author-empty-icon" aria-hidden="true">
                    <i class="fa-regular fa-id-card"></i>
                </span>
                <h1 class="author-empty-title">Journalist Profile Not Found</h1>
                <p class="author-empty-desc">
                    We could not locate published dispatches or an accredited portfolio associated with "{{ $authorName }}".
                </p>
                <a href="{{ route('public.home') }}" class="author-explore-btn">
                    <span>Explore Newsroom Home</span>
                    <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </a>
            </div>
        @else
            @php
                $nameParts = preg_split('/\s+/', trim($authorName));
                $firstLetter = !empty($nameParts[0]) ? mb_substr($nameParts[0], 0, 1) : 'L';
                $lastLetter = count($nameParts) > 1 ? mb_substr(end($nameParts), 0, 1) : '';
                $initials = strtoupper($firstLetter . $lastLetter);
                $hasCustomAvatar = $author && !empty($author->profile_picture_url);
            @endphp

            <!-- Editorial Press Pass / Journalist Masthead Hero -->
            <header class="author-dossier-card">
                <div class="author-dossier-layout">
                    
                    <!-- Portrait / Monogram Avatar -->
                    <div class="author-avatar-wrap">
                        <div class="author-avatar-ring">
                            @if($hasCustomAvatar)
                                <img src="{{ $author->avatar_url }}" alt="{{ $authorName }}" class="author-avatar-img">
                            @else
                                <div class="author-avatar-fallback" aria-hidden="true">
                                    {{ $initials }}
                                </div>
                            @endif
                        </div>
                        <span class="author-avatar-badge" title="The Lens Contributor" aria-hidden="true">
                            <i class="fa-solid fa-feather-pointed"></i>
                        </span>
                    </div>

                    <!-- Author Identity -->
                    <div class="author-details">
                        <h1 class="author-dossier-name">{{ $authorName }}</h1>

                        <!-- Role Badge -->
                        <div class="author-badges-row">
                            <span class="author-role-pill">
                                <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
                                <span>{{ $roleName }}</span>
                            </span>
                        </div>
                    </div>

                    <!-- Published Articles Count -->
                    <div class="author-article-count-box" aria-label="Author publication count">
                        <strong class="author-article-count-number">{{ $articles->count() }}</strong>
                        <span class="author-article-count-label">{{ Str::plural('Published article', $articles->count()) }}</span>
                    </div>

                </div>
            </header>

            <!-- Byline Articles Section -->
            <section class="author-byline-section" aria-labelledby="byline-heading">
                <div class="author-byline-header">
                    <div class="byline-header-titles">
                        <h2 id="byline-heading" class="byline-main-title">
                            Published articles and campus reporting filed by {{ $authorName }}.
                        </h2>
                    </div>

                    <!-- Category Filter Tabs -->
                    @if($beats->count() > 1)
                        <div class="byline-filter-tabs" role="tablist" aria-label="Filter articles by category">
                            <button type="button" class="filter-tab-btn active" data-filter="all" role="tab" aria-selected="true">
                                <span>All Stories</span>
                                <span class="tab-count">({{ $articles->count() }})</span>
                            </button>
                            @foreach($beatsWithCount as $beatName => $count)
                                <button type="button" class="filter-tab-btn" data-filter="{{ Str::slug($beatName) }}" role="tab" aria-selected="false">
                                    <span>{{ $beatName }}</span>
                                    <span class="tab-count">({{ $count }})</span>
                                </button>
                            @endforeach
                        </div>
                    @endif
                </div>

                <!-- Articles Grid -->
                <div class="author-byline-grid" id="author-articles-grid">
                    @forelse($articles as $article)
                        @php
                            $words = str_word_count(strip_tags($article->content ?? ''));
                            $readingTime = max(1, (int) ceil($words / 200));
                            $coverUrl = $article->cover_url ?: asset('images/maroon.jpg');
                            $catSlug = Str::slug($article->category->name ?? 'general');
                            $publishedDate = $article->published_at ? $article->published_at->format('M d, Y') : $article->created_at->format('M d, Y');
                        @endphp
                        <article class="author-story-card" data-category="{{ $catSlug }}">
                            <a class="author-story-thumb-frame" href="{{ route('public.article', $article->slug) }}" aria-label="Read story: {{ $article->title }}">
                                <img src="{{ $coverUrl }}" alt="{{ $article->title }}" loading="lazy">
                                <span class="story-category-tag">
                                    {{ $article->category->name ?? 'The Lens' }}
                                </span>
                            </a>
                            <div class="author-story-body">
                                <div class="story-meta-row">
                                    <span class="story-meta-date">
                                        <i class="fa-regular fa-calendar" aria-hidden="true"></i>
                                        <time datetime="{{ $article->published_at?->toDateString() ?? $article->created_at->toDateString() }}">{{ $publishedDate }}</time>
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span><i class="fa-regular fa-clock" aria-hidden="true"></i> {{ $readingTime }} min read</span>
                                </div>

                                <h3 class="author-story-title">
                                    <a href="{{ route('public.article', $article->slug) }}">
                                        {{ $article->title }}
                                    </a>
                                </h3>

                                <p class="author-story-excerpt">
                                    {{ $article->excerpt ?: 'Read this campus report published by The Lens Publication.' }}
                                </p>

                                <div class="author-story-footer">
                                    <div class="story-footer-stats">
                                        <span><i class="fa-regular fa-eye" aria-hidden="true"></i> {{ number_format($article->views) }} reads</span>
                                        <span><i class="fa-solid fa-share-nodes" aria-hidden="true"></i> {{ number_format($article->shares) }}</span>
                                    </div>
                                    <a href="{{ route('public.article', $article->slug) }}" class="read-story-link" aria-label="Read full article {{ $article->title }}">
                                        <span>Read Dispatch</span>
                                        <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                                    </a>
                                </div>
                            </div>
                        </article>
                    @empty
                        <div class="author-empty-state">
                            <span class="author-empty-icon" aria-hidden="true">
                                <i class="fa-solid fa-newspaper"></i>
                            </span>
                            <h3 class="author-empty-title">No Published Dispatches Yet</h3>
                            <p class="author-empty-desc">
                                {{ $authorName }} has not published articles on the public website yet. Check back soon for upcoming investigative reports and coverage.
                            </p>
                            <a href="{{ route('public.category', 'latest') }}" class="author-explore-btn">
                                <span>Browse Latest Newsroom Coverage</span>
                                <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                            </a>
                        </div>
                    @endforelse
                </div>
            </section>
        @endif
    </div>

</main>

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function () {
        const filterBtns = document.querySelectorAll('.filter-tab-btn');
        const cards = document.querySelectorAll('.author-story-card');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const filter = this.getAttribute('data-filter');

                filterBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');

                cards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    if (filter === 'all' || cardCategory === filter) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    });
</script>
@endpush
@endsection
