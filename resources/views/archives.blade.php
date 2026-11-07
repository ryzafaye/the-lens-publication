@extends('layouts.public')

@section('title', 'Article Archives')

@section('content')
<main class="max-w-7xl mx-auto px-6 py-10">

    <!-- Page introduction -->
    <section class="mb-9">
        <p class="text-xs tracking-widest text-wine font-bold mb-3 uppercase">
            THE LENS COLLECTION
        </p>
        <h1 class="font-display text-4xl md:text-5xl font-extrabold text-wine">
            Article Archives
        </h1>
        <p class="mt-2 text-stone-600 text-sm max-w-2xl">
            Explore past coverage, documented campus events, opinions, and feature stories.
        </p>
    </section>

    <!-- Search status message -->
    @if(!empty($queryParam) || ($categoryParam !== 'All' && !empty($categoryParam)))
        <p id="search-message" class="mb-5 text-sm text-wine font-medium">
            Showing results for 
            @if(!empty($queryParam)) “{{ $queryParam }}” @endif
            @if(!empty($queryParam) && $categoryParam !== 'All') in @endif
            @if($categoryParam !== 'All') {{ $categoryParam }} @endif
            ({{ $articles->total() }} {{ Str::plural('article', $articles->total()) }} found)
        </p>
    @endif

    <!-- Category filter & toolbar -->
    <section class="border-t-2 border-wine pt-5">
        <form action="{{ route('public.archives') }}" method="GET" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <input type="hidden" name="q" value="{{ $queryParam }}">
            <input type="hidden" name="sort" value="{{ $sortBy }}">
            <input type="hidden" name="dateType" value="{{ $dateType }}">
            <input type="hidden" name="dateValue" value="{{ $dateValue }}">

            <h2 class="font-display text-2xl font-bold text-stone-900">
                Browse archived stories
            </h2>

            <label class="flex items-center gap-3 text-sm text-stone-600">
                <span>Category:</span>
                <select id="archive-filter" name="category" class="archive-select" onchange="this.form.submit()">
                    <option value="All" @selected($categoryParam === 'All')>All categories</option>
                    @foreach($categories as $cat)
                        <option value="{{ $cat->name }}" @selected($categoryParam === $cat->name || $categoryParam === $cat->slug)>
                            {{ $cat->name }}
                        </option>
                    @endforeach
                </select>
            </label>
        </form>

        <!-- Archived Articles Grid -->
        <div id="archive-articles" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            @forelse($articles as $article)
                @php
                    $words = str_word_count(strip_tags($article->content ?? ''));
                    $readingTime = max(1, (int) ceil($words / 200));
                    $coverUrl = $article->cover_url ?: asset('images/maroon.jpg');
                @endphp
                <article class="archive-item flex flex-col sm:flex-row gap-5 p-4 rounded-xl border border-stone-100 hover:border-stone-200 hover:shadow-sm transition-all bg-white" data-article-id="{{ $article->id }}">
                    <a href="{{ route('public.article', $article->slug) }}" class="archive-image-trigger w-full sm:w-44 h-36 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100" aria-label="Read article: {{ $article->title }}">
                        <div class="article-image archive-image w-full h-full">
                            <img src="{{ $coverUrl }}" alt="{{ $article->title }}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy">
                        </div>
                    </a>
                    <div class="archive-item-copy flex flex-col justify-between flex-grow">
                        <div>
                            <div class="article-meta mb-1 text-xs text-stone-500">
                                <span class="article-category-label font-bold text-wine">{{ $article->category->name ?? 'The Lens' }}</span>
                                <span class="article-meta-separator" aria-hidden="true">·</span>
                                <time>{{ $article->published_at ? $article->published_at->format('M d, Y') : $article->created_at->format('M d, Y') }}</time>
                            </div>
                            <h3 class="font-display font-bold text-base text-stone-900 line-clamp-2 hover:text-wine transition-colors mb-2">
                                <a href="{{ route('public.article', $article->slug) }}" class="article-title-button">
                                    {{ $article->title }}
                                </a>
                            </h3>
                            <p class="archive-excerpt text-xs text-stone-500 line-clamp-2 mb-3">
                                {{ $article->excerpt }}
                            </p>
                        </div>
                        <div>
                            <p class="article-byline text-[11px] text-stone-500 mb-2">
                                <i class="fa-solid fa-pen-nib text-stone-400 mr-1" aria-hidden="true"></i>
                                <span>By 
                                    @if($article->user)
                                        <a class="author-profile-link font-medium text-stone-700 hover:underline" href="{{ route('public.author', $article->user_id) }}">
                                            {{ $article->user->full_name }}
                                        </a>
                                    @else
                                        <strong>The Lens Staff</strong>
                                    @endif
                                </span>
                            </p>
                            <div class="article-stats flex items-center gap-4 text-[11px] text-stone-400">
                                <span><i class="fa-regular fa-eye mr-1"></i> {{ number_format($article->views) }} views</span>
                                <span><i class="fa-regular fa-clock mr-1"></i> {{ $readingTime }} min</span>
                            </div>
                        </div>
                    </div>
                </article>
            @empty
                <div class="archive-empty-state col-span-full p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl my-6">
                    <i class="fa-regular fa-folder-open text-4xl mb-3 text-slate-300 block" aria-hidden="true"></i>
                    <h3 class="font-bold text-lg text-slate-700">No stories found</h3>
                    <p class="text-xs text-slate-500 mt-1">Try another keyword, author, category, or date range.</p>
                </div>
            @endforelse
        </div>

        <p id="archive-count" class="mt-6 text-xs text-stone-500">
            {{ $articles->total() }} {{ Str::plural('article', $articles->total()) }} found
        </p>

        <!-- Pagination -->
        @if($articles->hasPages())
            <div class="mt-8 flex justify-center">
                {{ $articles->links() }}
            </div>
        @endif

    </section>

    <!-- Return to homepage -->
    <div class="mt-12">
        <a href="{{ route('public.home') }}" class="inline-block border border-wine px-5 py-3 text-wine text-sm font-bold rounded hover:bg-rose-50 transition-colors">
            ← Back to Homepage
        </a>
    </div>

</main>
@endsection
