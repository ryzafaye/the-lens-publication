@extends('layouts.executive')

@section('title', 'Executive Dashboard')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/section-head-dashboard.css') }}">
@endpush

@section('content')
<main class="content-container">

    <!-- Page Title Section -->
    <div class="page-title-section animate-fade-in delay-1">
        <h1 class="page-title" id="page-title-heading">{{ Auth::user()?->role?->role_name ?? 'Executive' }} Dashboard</h1>
    </div>

    <!-- Metrics Row -->
    <section id="metrics-grid" class="metrics-grid" aria-label="Operational metrics">
        <div class="metric-card animate-fade-in delay-1">
            <div class="metric-header">
                <span class="metric-label">Pending Approvals</span>
                <div class="metric-icon-box"><i class="fa-regular fa-clock"></i></div>
            </div>
            <div class="metric-value">{{ $metrics['pending'] ?? 0 }}</div>
            <div class="metric-subtitle">Awaiting editorial review</div>
        </div>
        
        <div class="metric-card animate-fade-in delay-2">
            <div class="metric-header">
                <span class="metric-label">Monthly Readership</span>
                <div class="metric-icon-box"><i class="fa-regular fa-eye"></i></div>
            </div>
            <div class="metric-value">{{ $metrics['monthly_views'] ?? 0 }}</div>
            <div class="metric-subtitle">Views across all desks</div>
        </div>

        <div class="metric-card animate-fade-in delay-3">
            <div class="metric-header">
                <span class="metric-label">Active Members</span>
                <div class="metric-icon-box"><i class="fa-solid fa-users"></i></div>
            </div>
            <div class="metric-value">{{ $metrics['active_members'] ?? 0 }}</div>
            <div class="metric-subtitle">Staff &amp; editorial roster</div>
        </div>

        <div class="metric-card animate-fade-in delay-4">
            <div class="metric-header">
                <span class="metric-label">Published Stories</span>
                <div class="metric-icon-box"><i class="fa-regular fa-newspaper"></i></div>
            </div>
            <div class="metric-value">{{ $metrics['published_stories'] ?? 0 }}</div>
            <div class="metric-subtitle">Total overall published</div>
        </div>
    </section>

    <!-- Main Grid -->
    <div class="main-grid">

        <!-- Left Column (Submissions & Activity Stack) -->
        <div class="left-column-stack">

            <!-- Section 1: Recent Submissions -->
            <section class="card-panel animate-fade-in delay-2" aria-labelledby="recent-submissions-heading">
                <div class="panel-header">
                    <h2 id="recent-submissions-heading" class="panel-title">Recent Submissions</h2>
                    <a href="{{ route('executive.review-articles') }}" class="panel-action-link">View all &rarr;</a>
                </div>
                
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Article Title</th>
                                <th>Author</th>
                                <th class="hide-on-mobile">Section</th>
                                <th>Status</th>
                                <th class="hide-on-mobile">Date</th>
                            </tr>
                        </thead>
                        <tbody id="submissions-table-body">
                            @forelse($pendingArticles ?? [] as $art)
                                <tr>
                                    <td>
                                        <div class="table-article-info">
                                            <button type="button" class="table-article-btn" data-action="view" data-article="{{ json_encode($art) }}">
                                                {{ $art['title'] }}
                                            </button>
                                        </div>
                                    </td>
                                    <td>{{ $art['author'] ?? 'Staff Writer' }}</td>
                                    <td class="hide-on-mobile"><span class="table-section-tag">{{ $art['category'] ?? 'General' }}</span></td>
                                    <td><span class="status-badge status-review">Pending</span></td>
                                    <td class="hide-on-mobile"><span class="table-date">{{ $art['date'] ?? '' }}</span></td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" style="text-align: center; padding: 28px 16px; font-size: 0.95rem; color: var(--text-muted, #667085);">No pending submissions awaiting review.</td>
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
                    <a href="{{ route('executive.activity-logs') }}" class="panel-action-link">View all &rarr;</a>
                </div>
                <div id="recent-activity-list" class="activity-timeline"></div>
            </section>

        </div>

        <!-- Right Column (Widened Analytics Stack) -->
        <div class="right-column-stack">

            <!-- Section 1: Most Viewed Articles -->
            <section class="card-panel animate-fade-in delay-2" aria-labelledby="most-viewed-heading">
                <div class="panel-header">
                    <h2 id="most-viewed-heading" class="panel-title">Most Viewed Articles</h2>
                    <span id="most-viewed-month-badge" class="panel-badge">{{ date('F') }}</span>
                </div>
                <div id="most-viewed-list" class="ranked-list"></div>
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
                        <tbody id="top-journalists-table-body"></tbody>
                    </table>
                </div>
            </section>

        </div>

    </div>

</main>

<!-- Article Viewer Modal (Exact Executive Styling) -->
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
                <div class="viewer-author-avatar">
                    <img id="viewer-author-img" src="{{ asset('images/member-placeholder.svg') }}" alt="Author avatar">
                </div>
                <div class="viewer-author-details">
                    <div id="viewer-author" class="viewer-author-name">Author Name</div>
                    <div class="viewer-author-role">Staff Writer</div>
                </div>
            </div>

            <p id="viewer-excerpt" class="viewer-excerpt" style="display: none;"></p>

            <div class="viewer-banner-wrapper">
                <img id="viewer-banner-img" src="{{ asset('images/maroon.jpg') }}" alt="Article banner">
            </div>

            <div id="viewer-content" class="viewer-content-text"></div>
        </div>

        <div class="viewer-modal-footer">
            <a href="{{ route('executive.review-articles') }}" id="viewer-review-btn" class="btn-primary-action" style="text-decoration: none;">
                <i class="fa-solid fa-clipboard-check"></i>
                <span>Open in Review Queue</span>
            </a>
        </div>
    </div>
</div>

<!-- Toast Container -->
<div id="toast-container" class="toast-container" aria-live="polite"></div>
@endsection

@push('scripts')
    <script>
        window.__DASHBOARD_PENDING__ = @json($pendingArticles ?? []);
        window.__DASHBOARD_METRICS__ = @json($metrics ?? []);
        window.__SECTION_CATEGORY__ = @json($category?->name ?? null);
    </script>
    <script type="module" src="{{ asset('js/section-head-dashboard.js') }}"></script>
@endpush
