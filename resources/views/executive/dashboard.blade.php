@extends('layouts.executive')

@section('title', 'Executive Dashboard')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/executive-dashboard.css') }}">
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
            <div class="metric-value">{{ number_format($metrics['total_views'] ?? ($metrics['monthly_views'] ?? 0)) }}</div>
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
                <div id="recent-activity-list" class="activity-timeline">
                    @forelse($recentActivities ?? [] as $log)
                        <div class="activity-item" onclick="window.location.href='{{ route('executive.activity-logs') }}'" style="cursor: pointer; display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f2f4f7;" title="Open Activity Log">
                            <div class="activity-avatar" style="width: 34px; height: 34px; border-radius: 50%; overflow: hidden; background: #f2f4f7; flex-shrink: 0;">
                                <img src="{{ asset('images/member-placeholder.svg') }}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <div class="activity-content" style="flex: 1; font-size: 0.86rem; color: #344054;">
                                <p style="margin: 0; line-height: 1.4;">
                                    <strong>{{ $log['user'] }}</strong> ({{ $log['role'] ?? 'Executive Board' }})
                                    <span style="color: #667085;">{{ $log['action'] }}</span>
                                    <strong style="color: #101828;">"{{ $log['target'] }}"</strong>
                                </p>
                                <span class="activity-time" style="font-size: 0.78rem; color: #98a2b3; display: inline-block; margin-top: 3px;">
                                    <i class="fa-regular fa-clock"></i> {{ $log['time'] }}
                                </span>
                            </div>
                        </div>
                    @empty
                        <div style="padding: 16px; color: #667085; font-size: 0.9rem; text-align: center;">
                            No recent activities recorded.
                        </div>
                    @endforelse
                </div>
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
                <div id="most-viewed-list" class="ranked-list">
                    @forelse($mostViewed ?? [] as $index => $item)
                        <div class="ranked-item" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f2f4f7;">
                            <div style="display: flex; align-items: center; gap: 12px; overflow: hidden;">
                                <span style="font-weight: 700; color: #7a1526; width: 20px;">#{{ $index + 1 }}</span>
                                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    <div style="font-weight: 500; font-size: 0.9rem; color: #1d2939; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ $item->title }}</div>
                                    <div style="font-size: 0.8rem; color: #667085;">{{ ($item->published_at ?? $item->created_at)->format('M d, Y') }}</div>
                                </div>
                            </div>
                            <span style="font-weight: 600; color: #344054; font-size: 0.85rem; padding-left: 12px; white-space: nowrap;">{{ number_format($item->views) }} views</span>
                        </div>
                    @empty
                        <div style="padding: 20px 0; text-align: center; color: #667085; font-size: 0.88rem;">
                            No published articles recorded.
                        </div>
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
                                <th class="col-article-count" style="text-align: right;">Article Count</th>
                            </tr>
                        </thead>
                        <tbody id="top-journalists-table-body">
                            @forelse($topJournalists ?? [] as $writer)
                                <tr>
                                    <td class="col-author">
                                        <span style="font-weight: 500; color: #1d2939;">{{ $writer->full_name }}</span>
                                    </td>
                                    <td class="col-article-count" style="text-align: right; font-weight: 700; color: #b42318;">{{ $writer->articles_count ?? 0 }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="2" style="text-align: center; padding: 16px; color: #667085; font-size: 0.88rem;">
                                        No journalists registered yet.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
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
    document.addEventListener('DOMContentLoaded', () => {
        const modal = document.getElementById('article-viewer-modal');
        const closeBtn = document.getElementById('close-viewer-btn');

        document.querySelectorAll('.table-article-btn[data-action="view"]').forEach(btn => {
            btn.addEventListener('click', () => {
                try {
                    const art = JSON.parse(btn.getAttribute('data-article') || '{}');
                    document.getElementById('viewer-title').textContent = art.title || 'Untitled Article';
                    document.getElementById('viewer-author').textContent = art.author || 'Staff Writer';
                    document.getElementById('viewer-category').textContent = art.category || 'General';
                    document.getElementById('viewer-date').textContent = art.date || '';
                    document.getElementById('viewer-content').innerHTML = art.content || '<p>No content preview available.</p>';
                    modal?.classList.remove('hidden');
                } catch (e) {
                    console.error('Error opening article viewer:', e);
                }
            });
        });

        closeBtn?.addEventListener('click', () => {
            modal?.classList.add('hidden');
        });

        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
</script>
@endpush
