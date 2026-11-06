@extends('layouts.mpc')

@section('title', 'Media & Public Communications Dashboard')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/executive-dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-modals.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-manage-articles.css') }}">
    <link rel="stylesheet" href="{{ asset('css/section-head-dashboard.css') }}">
@endpush

@section('content')
<main class="content-container">

    <!-- Page Title Section -->
    <div class="page-title-section animate-fade-in delay-1">
        <h1 class="page-title">Dashboard</h1>
    </div>

    <!-- Metrics Row (3-Column Layout in One Line) -->
    <section id="metrics-grid" class="metrics-grid metrics-grid-3" aria-label="Operational metrics">
        <div class="metric-card animate-fade-in delay-1">
            <div class="metric-header">
                <span class="metric-label">Pending Approvals</span>
                <div class="metric-icon-box">
                    <i class="fa-regular fa-clock"></i>
                </div>
            </div>
            <div class="metric-value">{{ $metrics['pending'] ?? 0 }}</div>
            <div class="metric-subtitle">Awaiting publication release</div>
        </div>

        <div class="metric-card animate-fade-in delay-2">
            <div class="metric-header">
                <span class="metric-label">Monthly Readership</span>
                <div class="metric-icon-box">
                    <i class="fa-regular fa-eye"></i>
                </div>
            </div>
            <div class="metric-value">{{ number_format($metrics['total_views'] ?? 0) }}</div>
            <div class="metric-subtitle">Views across all desks for {{ date('F') }}</div>
        </div>

        <div class="metric-card animate-fade-in delay-3">
            <div class="metric-header">
                <span class="metric-label">Published Stories</span>
                <div class="metric-icon-box">
                    <i class="fa-regular fa-newspaper"></i>
                </div>
            </div>
            <div class="metric-value">{{ $metrics['published_stories'] ?? 0 }}</div>
            <div class="metric-subtitle">Total overall published</div>
        </div>
    </section>

    <!-- Main Grid -->
    <div class="main-grid">

        <!-- Left Column: Editorial Operations Stack -->
        <div class="left-column-stack">

            <!-- Section 1: Pending Approval -->
            <section class="card-panel animate-fade-in delay-2" aria-labelledby="pending-approval-heading">
                <div class="panel-header">
                    <h2 id="pending-approval-heading" class="panel-title">Pending Approval</h2>
                    <a href="{{ route('mpc.publish-article') }}" class="panel-action-link">View all &rarr;</a>
                </div>
                
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Article Title</th>
                                <th>Author</th>
                                <th>Status</th>
                                <th class="hide-on-mobile">Date</th>
                                <th class="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody id="submissions-table-body">
                            @forelse($pendingArticles ?? [] as $article)
                                <tr>
                                    <td>
                                        <div class="table-article-info">
                                            <button type="button" class="table-article-btn" data-action="view" data-id="{{ $article['id'] }}" data-article="{{ json_encode($article) }}" title="{{ $article['title'] }}">
                                                {{ $article['title'] }}
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="author-cell">
                                            <i class="fa-solid fa-pen-nib author-pen-icon" style="color: #7b1113; margin-right: 6px; font-size: 0.85rem;"></i>
                                            <span>{{ $article['author'] }}</span>
                                        </div>
                                    </td>
                                    <td><span class="status-pill status-pill-pending">{{ $article['status'] }}</span></td>
                                    <td class="hide-on-mobile text-muted">{{ $article['date'] }}</td>
                                    <td class="text-right">
                                        <a href="{{ route('mpc.publish-article') }}" class="action-btn action-btn-review">
                                            Manage
                                        </a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="empty-state-cell" style="text-align: center; color: #667085; padding: 24px;">No pending articles to review.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Section 2: Activity Log -->
            <section class="card-panel animate-fade-in delay-3" aria-labelledby="activity-log-heading">
                <div class="panel-header">
                    <h2 id="activity-log-heading" class="panel-title">Activity Log</h2>
                    <a href="{{ route('mpc.activity-logs') }}" class="panel-action-link">View all &rarr;</a>
                </div>
                <div id="recent-activity-list" class="activity-timeline">
                    <div class="empty-state-cell" style="text-align: center; color: #667085; padding: 24px;">No recent activity recorded.</div>
                </div>
            </section>

        </div>

        <!-- Right Column: Analytics & Leaderboard Stack -->
        <div class="right-column-stack">

            <!-- Section 1: Most Viewed Articles -->
            <section class="card-panel animate-fade-in delay-2" aria-labelledby="most-viewed-heading">
                <div class="panel-header">
                    <h2 id="most-viewed-heading" class="panel-title">Most Viewed Articles</h2>
                    <span id="most-viewed-month-badge" class="panel-badge">{{ date('F') }}</span>
                </div>
                <div id="most-viewed-list" class="ranked-list">
                    @forelse($publishedArticles ?? [] as $index => $pubArt)
                        <div class="ranked-item" data-action="view" data-article-id="{{ $pubArt['id'] }}" data-article="{{ json_encode($pubArt) }}">
                            <span class="rank-number {{ $index === 0 ? 'top-rank' : '' }}">{{ $index + 1 }}</span>
                            <div class="ranked-content">
                                <div class="ranked-category-tag">{{ $pubArt['category'] ?? 'General' }}</div>
                                <button type="button" class="ranked-title-btn" data-action="view" data-id="{{ $pubArt['id'] }}" data-article="{{ json_encode($pubArt) }}" title="{{ $pubArt['title'] }}">
                                    {{ $pubArt['title'] }}
                                </button>
                                <div class="ranked-meta-row">
                                    <span class="ranked-author"><i class="fa-solid fa-pen-nib" style="font-size: 0.70rem; margin-right: 4px; color: #667085;"></i>{{ $pubArt['author'] ?? 'Author' }}</span>
                                    <span class="ranked-stats"><i class="fa-regular fa-eye"></i> {{ number_format($pubArt['views'] ?? 0) }}</span>
                                </div>
                            </div>
                        </div>
                    @empty
                        <div class="empty-state-cell" style="text-align: center; color: #667085; padding: 24px;">No data available yet</div>
                    @endforelse
                </div>
            </section>

            <!-- Section 2: Top Performing Journalists -->
            <section class="card-panel animate-fade-in delay-3" aria-labelledby="top-journalists-heading">
                <div class="panel-header">
                    <h2 id="top-journalists-heading" class="panel-title">Top Performing Journalists</h2>
                    <span class="panel-badge">Leaderboard</span>
                </div>
                <div class="journalists-table-wrap">
                    <table class="journalists-table">
                        <thead>
                            <tr>
                                <th class="col-author">Author</th>
                                <th class="col-article-count">Article Count</th>
                            </tr>
                        </thead>
                        <tbody id="top-journalists-table-body">
                            <tr>
                                <td colspan="2" class="empty-state-cell" style="text-align: center; color: #667085; padding: 24px;">No data available yet</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

        </div>

    </div>

</main>

<!-- Full Article Viewer Modal -->
<div id="article-viewer-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="viewer-title">
    <div class="modal-card viewer-modal-card">
        <div class="viewer-modal-header">
            <div class="viewer-meta-row">
                <span id="viewer-category" class="viewer-category-tag">News</span>
                <span class="viewer-dot">·</span>
                <span id="viewer-date" class="viewer-date">Oct 12, 2026</span>
            </div>
            <div class="viewer-header-right">
                <span class="viewer-reading-time"><i class="fa-regular fa-clock"></i> <span id="viewer-read-time">2 min read</span></span>
                <button type="button" id="close-viewer-btn" class="viewer-close-btn" aria-label="Close article preview">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>

        <div class="viewer-modal-body">
            <h1 id="viewer-title" class="viewer-title">Article Title</h1>
            
            <div class="viewer-byline-row">
                <div class="viewer-author-info">
                    <i class="fa-solid fa-pen-nib" style="color: #7b1113; margin-right: 6px;"></i>
                    <span id="viewer-author" class="viewer-author-name">{{ Auth::user()?->full_name ?? 'Author' }}</span>
                </div>
            </div>

            <p id="viewer-excerpt" class="viewer-excerpt" style="display: none;"></p>

            <div id="viewer-content" class="viewer-article-body"></div>
        </div>

        <div class="viewer-modal-footer">
            <button type="button" id="viewer-cancel-btn" class="modal-btn modal-btn-cancel">
                Close
            </button>
            <a href="{{ route('mpc.publish-article') }}" id="viewer-publish-btn" class="modal-btn modal-btn-confirm-primary">
                <i class="fa-solid fa-globe"></i>
                <span>Open in Publish Article</span>
            </a>
        </div>
    </div>
</div>
@endsection

@push('scripts')
    <script>
        window.INITIAL_DATA = {
            metrics: @json($metrics ?? []),
            pending: @json($pendingArticles ?? []),
            published: @json($publishedArticles ?? $approvedArticles ?? []),
            recentActivities: @json($recentActivities ?? [])
        };
        window.INITIAL_ACTIVITIES = @json($recentActivities ?? []);
    </script>
    <script type="module" src="{{ asset('js/mpc-dashboard.js') }}"></script>
@endpush

