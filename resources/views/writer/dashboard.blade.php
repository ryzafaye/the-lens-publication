@extends('layouts.writer')

@section('title', 'Dashboard')

@section('content')
@php
    // Extract first name from full name (e.g., "Ryza Faye Javier Reyes" -> "Ryza")
    $firstName = explode(' ', Auth::user()->full_name)[0];
@endphp

<main class="content-container">
    <div class="writer-header-row animate-fade-in delay-1">
        <div class="writer-header-left">
            <h1 class="writer-greeting" id="writer-greeting-heading">
                Welcome back, <span class="writer-name-highlight">{{ $firstName }}</span>
            </h1>
            <p class="writer-greeting-subtitle">Here is your publication overview and manuscript status.</p>
        </div>
        <div class="writer-header-right">
            <a href="/writer/submit-article" class="btn-primary-action">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>New Article</span>
            </a>
        </div>
    </div>

    <section class="writer-analytics-grid animate-fade-in delay-2">
        <div class="writer-stat-card">
            <div class="stat-number">{{ number_format($writerStats['total_views'] ?? 0) }}</div>
            <div class="stat-label">Total Views</div>
        </div>
        <div class="writer-stat-card">
            <div class="stat-number">{{ number_format($writerStats['published'] ?? 0) }}</div>
            <div class="stat-label">Published Articles</div>
        </div>
        <div class="writer-stat-card">
            <div class="stat-number">{{ number_format($writerStats['pending'] ?? 0) }}</div>
            <div class="stat-label">Pending Revision</div>
        </div>
        <div class="writer-stat-card">
            <div class="stat-number">{{ number_format($writerStats['drafts'] ?? 0) }}</div>
            <div class="stat-label">Drafts</div>
        </div>
    </section>

    <div class="writer-dashboard-content-grid animate-fade-in delay-3">
        <div class="writer-recent-column">
            <div class="writer-section-header">
                <div class="section-title-wrap">
                    <h2 class="writer-section-title">My Recent Articles</h2>
                </div>
                <a href="/writer/manage-articles" class="view-all-link">
                    <span>View all</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </a>
            </div>

            <section class="writer-articles-list">
                @forelse($recentArticles as $art)
                    @php
                        // Determine status badge class
                        $badgeClass = 'status-draft';
                        $status = $art->status ?? $art['status'];
                        if($status === 'Published') $badgeClass = 'status-published';
                        elseif($status === 'Pending Review') $badgeClass = 'status-pending';

                        $categoryName = $art->category->name ?? ($art['category']['name'] ?? ($art['category'] ?? 'Uncategorized'));
                        $formattedDate = $art->created_at ? $art->created_at->format('M d, Y') : ($art['date'] ?? '');
                        
                        $modalData = [
                            'id' => $art->id ?? $art['id'],
                            'title' => $art->title ?? $art['title'],
                            'category' => $categoryName,
                            'date' => $formattedDate,
                            'author' => Auth::user()->full_name,
                            'excerpt' => $art->excerpt ?? $art['excerpt'],
                            'content' => $art->content ?? $art['content'],
                            'status' => $status,
                            'views' => $art->views ?? $art['views'] ?? 0,
                        ];
                    @endphp

                    <article class="writer-article-card" data-action="view" data-article="{{ json_encode($modalData) }}">
                        <div class="article-card-header">
                            <div class="article-card-meta">
                                <span class="article-card-category">{{ $categoryName }}</span>
                                <span class="meta-dot">&bull;</span>
                                <span class="article-card-date"><i class="fa-regular fa-calendar"></i> {{ $formattedDate }}</span>
                                
                                @if($status === 'Published')
                                    <span class="meta-dot">&bull;</span>
                                    <span class="article-card-date"><i class="fa-regular fa-eye"></i> {{ number_format($art->views ?? $art['views'] ?? 0) }} views</span>
                                @endif
                            </div>
                            <div class="article-card-status-top">
                                <span class="status-badge {{ $badgeClass }}">{{ $status }}</span>
                            </div>
                        </div>
                        <div class="article-card-body">
                            <h3 class="article-card-title">{{ $art->title ?? $art['title'] }}</h3>
                            <p class="article-card-excerpt">{{ $art->excerpt ?? $art['excerpt'] }}</p>
                        </div>
                        @if($status !== 'Published' && $status !== 'Pending Review')
                            <div class="article-card-footer">
                                <a href="{{ route('writer.submit-article', ['draft_id' => $art->id ?? $art['id']]) }}" class="btn-box-edit" onclick="event.stopPropagation()">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                    <span>Edit</span>
                                </a>
                            </div>
                        @endif
                    </article>
                @empty
                    <div class="writer-empty-state">
                        <i class="fa-regular fa-folder-open"></i>
                        <p class="empty-title">No Articles Yet</p>
                        <p class="empty-subtitle">You have not submitted or drafted any articles yet. Click "New Article" above to begin.</p>
                    </div>
                @endforelse
            </section>
        </div>

        <aside class="writer-top-performing-column">
            <section class="card-panel">
                <div class="panel-header">
                    <h2 class="panel-title">Top Performing Articles</h2>
                    <span class="panel-badge">By Views</span>
                </div>
                <div class="ranked-list">
                    <!-- Iteration for top performing articles here -->
                </div>
            </section>
        </aside>
    </div>
</main>

<!-- Article Viewer Modal (Reusable) -->
<div id="article-viewer-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="viewer-title">
    <div class="modal-card viewer-modal-card">
        <div class="viewer-modal-header">
            <div class="viewer-meta-row">
                <span id="viewer-category" class="viewer-category-tag">News</span>
                <span class="viewer-dot">·</span>
                <span id="viewer-date" class="viewer-date">Date</span>
            </div>
            <div class="viewer-header-right">
                <span class="viewer-reading-time"><i class="fa-regular fa-clock"></i> <span id="viewer-read-time">2 min read</span></span>
                <button type="button" id="close-viewer-btn" class="viewer-close-btn"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>
        <div class="viewer-modal-body">
            <h1 id="viewer-title" class="viewer-title">Title</h1>
            <div class="viewer-byline-row">
                <div class="viewer-author-avatar"><img src="{{ asset('images/member-placeholder.svg') }}"></div>
                <div class="viewer-byline-text"><span class="viewer-by">By <strong id="viewer-author">Author</strong></span></div>
            </div>
            <div id="viewer-content" class="viewer-content-text"></div>
        </div>
    </div>
</div>
@endsection

@section('extra-js')
    <!-- Reusable Modal Controller Script -->
    <script type="module" src="{{ asset('js/executive-dashboard.js') }}"></script>
@endsection
