@extends('layouts.public')

@section('title', $authorName . ' | Author Profile')

@section('content')
<main class="author-profile-page page-shell max-w-5xl mx-auto px-6 py-10" data-page="author-profile">

    <a class="author-back-link inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-wine mb-8 transition-colors" href="{{ route('public.category', 'latest') }}">
        <i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Back to articles
    </a>

    <section id="author-profile-content" aria-live="polite">
        @if(!$author && $articles->isEmpty())
            <section class="author-not-found p-12 text-center border border-dashed border-stone-200 rounded-2xl">
                <span class="inline-block p-4 rounded-full bg-stone-100 text-stone-400 text-3xl mb-4">
                    <i class="fa-regular fa-user" aria-hidden="true"></i>
                </span>
                <h1 class="font-display text-2xl font-bold text-stone-800 mb-2">Author not found</h1>
                <p class="text-stone-500 text-xs mb-6">We couldn't find public articles under that author name.</p>
                <a href="{{ route('public.category', 'latest') }}" class="author-primary-link inline-flex items-center gap-2 px-4 py-2 bg-wine text-white rounded-lg text-xs font-bold hover:bg-rose-950 transition-colors">
                    <span>Explore latest articles</span>
                    <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </a>
            </section>
        @else
            <!-- Author Summary Card -->
            <section class="author-summary-card mb-12 p-6 sm:p-8 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center gap-6">
                <div class="author-avatar w-20 h-20 rounded-full bg-rose-900/10 text-wine flex items-center justify-center text-3xl flex-shrink-0">
                    <i class="fa-solid fa-user-pen" aria-hidden="true"></i>
                </div>
                <div class="author-summary-copy flex-grow text-center sm:text-left">
                    <p class="author-role-chip inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-100 text-rose-900 mb-2">
                        {{ $roleName }}
                    </p>
                    <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
                        {{ $authorName }}
                    </h1>
                    <p class="author-summary-bio text-xs sm:text-sm text-stone-600 max-w-xl">
                        Staff contributor covering university news, campus affairs, and community developments for The Lens Publication.
                    </p>
                </div>
                <div class="author-article-count text-center border-t sm:border-t-0 sm:border-l border-stone-200 pt-4 sm:pt-0 sm:pl-6">
                    <strong class="block text-3xl font-display font-extrabold text-wine">{{ $articles->count() }}</strong>
                    <span class="text-xs text-stone-500">{{ Str::plural('Published article', $articles->count()) }}</span>
                </div>
            </section>

            <!-- Articles By Author -->
            <section class="author-articles-section" aria-labelledby="articles-by-author-title">
                <div class="author-articles-heading flex items-center justify-between pb-4 mb-6 border-b border-stone-200">
                    <div>
                        <p class="author-profile-eyebrow text-xs font-bold uppercase tracking-widest text-wine">BYLINE ARCHIVE</p>
                        <h2 id="articles-by-author-title" class="font-display text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
                            Articles by {{ $authorName }}
                        </h2>
                    </div>
                    <span class="author-count-chip text-xs bg-stone-100 text-stone-600 px-3 py-1 rounded-full font-medium">
                        {{ $articles->count() }} {{ Str::plural('story', $articles->count()) }}
                    </span>
                </div>

                <div class="author-articles-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                    @forelse($articles as $article)
                        @php
                            $words = str_word_count(strip_tags($article->content ?? ''));
                            $readingTime = max(1, (int) ceil($words / 200));
                            $coverUrl = $article->cover_url ?: asset('images/maroon.jpg');
                        @endphp
                        <article class="author-article-card border border-stone-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col" data-article-id="{{ $article->id }}">
                            <a class="author-article-image block aspect-video overflow-hidden bg-stone-100" href="{{ route('public.article', $article->slug) }}" aria-label="Read article: {{ $article->title }}">
                                <img src="{{ $coverUrl }}" alt="{{ $article->title }}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy">
                            </a>
                            <div class="author-article-copy p-4 flex flex-col flex-grow">
                                <div class="article-meta text-xs text-stone-500 mb-1">
                                    <span class="article-category-label font-bold text-wine">{{ $article->category->name ?? 'The Lens' }}</span>
                                    <span class="article-meta-separator" aria-hidden="true">·</span>
                                    <time>{{ $article->published_at ? $article->published_at->format('M d, Y') : $article->created_at->format('M d, Y') }}</time>
                                </div>
                                <h2 class="font-display font-bold text-base text-stone-900 mb-2 line-clamp-2 hover:text-wine transition-colors">
                                    <a href="{{ route('public.article', $article->slug) }}" class="author-article-title">
                                        {{ $article->title }}
                                    </a>
                                </h2>
                                <p class="author-article-excerpt text-xs text-stone-500 line-clamp-2 mb-4 flex-grow">
                                    {{ $article->excerpt ?: 'Read this story from The Lens.' }}
                                </p>
                                <div class="author-article-footer pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                                    <span><i class="fa-regular fa-clock mr-1" aria-hidden="true"></i> {{ $readingTime }} min read</span>
                                    <span><i class="fa-regular fa-eye mr-1" aria-hidden="true"></i> {{ number_format($article->views) }} views</span>
                                </div>
                            </div>
                        </article>
                    @empty
                        <p class="text-xs text-stone-400 italic py-4 col-span-full">No published articles under this author yet.</p>
                    @endforelse
                </div>
            </section>
        @endif
    </section>

</main>
@endsection
