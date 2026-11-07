@extends('layouts.public')

@section('title', 'Home')

@section('content')
<main id="home" class="max-w-7xl mx-auto px-6 py-8">

    <!-- Search status message if any -->
    <p id="search-message" class="hidden mb-5 text-sm text-wine"></p>

    <!-- Featured article and latest releases -->
    <section class="home-feature-layout">
        <div id="featured-article">
            @if($featuredArticle)
                @php
                    $featWords = str_word_count(strip_tags($featuredArticle->content ?? ''));
                    $featReadTime = max(1, (int) ceil($featWords / 200));
                    $featImg = $featuredArticle->cover_url ?: asset('images/maroon.jpg');
                @endphp
                <article class="featured-story" data-article-id="{{ $featuredArticle->id }}">
                    <a href="{{ route('public.article', $featuredArticle->slug) }}" class="featured-image-trigger article-clickable" aria-label="Read article: {{ $featuredArticle->title }}">
                        <div class="article-image featured-image">
                            <img src="{{ $featImg }}" alt="{{ $featuredArticle->title }}" loading="lazy">
                        </div>
                    </a>
                    <div class="article-meta">
                        <span class="article-category-label">{{ $featuredArticle->category->name ?? 'The Lens' }}</span>
                        <span class="article-meta-separator" aria-hidden="true">·</span>
                        <time>{{ $featuredArticle->published_at ? $featuredArticle->published_at->format('M d, Y') : $featuredArticle->created_at->format('M d, Y') }}</time>
                    </div>
                    <h2 class="featured-title">
                        <a href="{{ route('public.article', $featuredArticle->slug) }}" class="article-title-button featured-headline-button">
                            {{ $featuredArticle->title }}
                        </a>
                    </h2>
                    <div class="featured-divider"></div>
                    <p class="featured-excerpt">{{ $featuredArticle->excerpt }}</p>
                    <p class="article-byline">
                        <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
                        <span>By 
                            @if($featuredArticle->user)
                                <a class="author-profile-link" href="{{ route('public.author', $featuredArticle->user_id) }}">
                                    {{ $featuredArticle->user->full_name }}
                                </a>
                            @else
                                <strong>The Lens Staff</strong>
                            @endif
                        </span>
                    </p>
                    <div class="article-stats" aria-label="Article engagement and reading time">
                        <span class="article-view-count" title="Views">
                            <i class="fa-regular fa-eye" aria-hidden="true"></i>
                            <span>{{ number_format($featuredArticle->views) }}</span><span class="stat-label">views</span>
                        </span>
                        <span class="article-read-time" title="Estimated reading time">
                            <i class="fa-regular fa-clock" aria-hidden="true"></i>
                            <span>{{ $featReadTime }} min read</span>
                        </span>
                        <button type="button" class="article-share-button" data-copy-article-id="{{ $featuredArticle->id }}" data-article-url="{{ route('public.article', $featuredArticle->slug) }}" title="Copy article link">
                            <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
                            <span>Share</span>
                            <span class="share-count" data-share-count="{{ $featuredArticle->id }}">{{ $featuredArticle->shares }}</span>
                        </button>
                    </div>
                </article>
            @else
                <div class="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl my-4">
                    <i class="fa-regular fa-newspaper text-3xl mb-3 text-slate-300 block"></i>
                    <h3 class="font-bold text-base text-slate-700">No Published Articles Yet</h3>
                    <p class="text-xs text-slate-500 mt-1">Stories published by the editorial team will appear here.</p>
                </div>
            @endif
        </div>

        <aside id="latest" class="latest-section">
            <h2 class="section-label">LATEST RELEASES</h2>
            <div id="latest-articles" class="space-y-7 mt-6">
                @forelse($latestArticles as $latest)
                    @php
                        $latestWords = str_word_count(strip_tags($latest->content ?? ''));
                        $latestReadTime = max(1, (int) ceil($latestWords / 200));
                        $latestImg = $latest->cover_url ?: asset('images/maroon.jpg');
                    @endphp
                    <article class="latest-item" data-article-id="{{ $latest->id }}">
                        <div class="latest-item-copy">
                            <p class="latest-category">{{ $latest->category->name ?? 'Campus' }}</p>
                            <h3 class="latest-title">
                                <a href="{{ route('public.article', $latest->slug) }}" class="article-title-button">
                                    {{ $latest->title }}
                                </a>
                            </h3>
                            <p class="article-byline text-xs">
                                <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
                                <span>By 
                                    @if($latest->user)
                                        <a class="author-profile-link" href="{{ route('public.author', $latest->user_id) }}">
                                            {{ $latest->user->full_name }}
                                        </a>
                                    @else
                                        <strong>The Lens Staff</strong>
                                    @endif
                                </span>
                            </p>
                            <div class="article-stats text-xs">
                                <span class="article-view-count">
                                    <i class="fa-regular fa-eye"></i> <span>{{ number_format($latest->views) }}</span>
                                </span>
                                <span class="article-read-time">
                                    <i class="fa-regular fa-clock"></i> <span>{{ $latestReadTime }} min</span>
                                </span>
                            </div>
                        </div>
                        <a href="{{ route('public.article', $latest->slug) }}" class="latest-image-trigger article-clickable" aria-label="Read article: {{ $latest->title }}">
                            <div class="article-image latest-image">
                                <img src="{{ $latestImg }}" alt="{{ $latest->title }}" loading="lazy">
                            </div>
                        </a>
                    </article>
                @empty
                    <p class="text-xs text-slate-400 py-3 italic">No recent releases yet.</p>
                @endforelse
            </div>
        </aside>
    </section>

    <!-- More stories -->
    @if($moreStories->isNotEmpty())
        <section class="mt-14" id="more-stories">
            <div class="section-heading">
                <h2>More stories</h2>
                <a href="{{ route('public.category', 'latest') }}" class="text-wine text-sm font-bold">Explore latest →</a>
            </div>
            <div id="more-articles" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                @foreach($moreStories as $story)
                    @php
                        $storyWords = str_word_count(strip_tags($story->content ?? ''));
                        $storyReadTime = max(1, (int) ceil($storyWords / 200));
                        $storyImg = $story->cover_url ?: asset('images/maroon.jpg');
                    @endphp
                    <article class="story-card" data-article-id="{{ $story->id }}">
                        <a href="{{ route('public.article', $story->slug) }}" class="story-card-image-trigger article-clickable" aria-label="Read article: {{ $story->title }}">
                            <div class="article-image story-card-image">
                                <img src="{{ $storyImg }}" alt="{{ $story->title }}" loading="lazy">
                            </div>
                        </a>
                        <div class="article-meta">
                            <span class="article-category-label">{{ $story->category->name ?? 'The Lens' }}</span>
                            <span class="article-meta-separator" aria-hidden="true">·</span>
                            <time>{{ $story->published_at ? $story->published_at->format('M d, Y') : $story->created_at->format('M d, Y') }}</time>
                        </div>
                        <h3 class="story-card-title">
                            <a href="{{ route('public.article', $story->slug) }}" class="article-title-button">
                                {{ $story->title }}
                            </a>
                        </h3>
                        <p class="story-card-excerpt">{{ $story->excerpt }}</p>
                        <p class="article-byline text-xs">
                            <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
                            <span>By 
                                @if($story->user)
                                    <a class="author-profile-link" href="{{ route('public.author', $story->user_id) }}">
                                        {{ $story->user->full_name }}
                                    </a>
                                @else
                                    <strong>The Lens Staff</strong>
                                @endif
                            </span>
                        </p>
                        <div class="article-stats text-xs">
                            <span class="article-view-count">
                                <i class="fa-regular fa-eye"></i> <span>{{ number_format($story->views) }}</span>
                            </span>
                            <span class="article-read-time">
                                <i class="fa-regular fa-clock"></i> <span>{{ $storyReadTime }} min</span>
                            </span>
                        </div>
                    </article>
                @endforeach
            </div>
        </section>
    @endif

    <!-- Category Sections -->
    @foreach($categories as $category)
        @php
            $catArticles = $categoryArticles[$category->id] ?? collect();
        @endphp
        <section id="{{ $category->slug }}" class="category-section mt-14">
            <div class="section-heading">
                <h2>{{ $category->name }}</h2>
                <a href="{{ route('public.category', $category->slug) }}" class="category-button">View all →</a>
            </div>
            <div class="category-grid">
                @forelse($catArticles as $catArticle)
                    @php
                        $cWords = str_word_count(strip_tags($catArticle->content ?? ''));
                        $cReadTime = max(1, (int) ceil($cWords / 200));
                        $cImg = $catArticle->cover_url ?: asset('images/maroon.jpg');
                    @endphp
                    <article class="category-card" data-article-id="{{ $catArticle->id }}">
                        <a href="{{ route('public.article', $catArticle->slug) }}" class="category-image-trigger article-clickable" aria-label="Read article: {{ $catArticle->title }}">
                            <div class="article-image small-image">
                                <img src="{{ $cImg }}" alt="{{ $catArticle->title }}" loading="lazy">
                            </div>
                        </a>
                        <div class="category-card-copy">
                            <div class="article-meta">
                                <span class="article-category-label">{{ $category->name }}</span>
                                <span class="article-meta-separator" aria-hidden="true">·</span>
                                <time>{{ $catArticle->published_at ? $catArticle->published_at->format('M d, Y') : $catArticle->created_at->format('M d, Y') }}</time>
                            </div>
                            <h3 class="category-card-title">
                                <a href="{{ route('public.article', $catArticle->slug) }}" class="article-title-button">
                                    {{ $catArticle->title }}
                                </a>
                            </h3>
                            <p class="category-card-excerpt">{{ $catArticle->excerpt }}</p>
                            <p class="article-byline text-xs">
                                <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
                                <span>By 
                                    @if($catArticle->user)
                                        <a class="author-profile-link" href="{{ route('public.author', $catArticle->user_id) }}">
                                            {{ $catArticle->user->full_name }}
                                        </a>
                                    @else
                                        <strong>The Lens Staff</strong>
                                    @endif
                                </span>
                            </p>
                            <div class="article-stats text-xs">
                                <span class="article-view-count">
                                    <i class="fa-regular fa-eye"></i> <span>{{ number_format($catArticle->views) }}</span>
                                </span>
                                <span class="article-read-time">
                                    <i class="fa-regular fa-clock"></i> <span>{{ $cReadTime }} min read</span>
                                </span>
                            </div>
                        </div>
                    </article>
                @empty
                    <p class="empty-state text-xs text-slate-400 italic py-2 col-span-full">No articles available yet in this section.</p>
                @endforelse
            </div>
        </section>
    @endforeach

</main>
@endsection
