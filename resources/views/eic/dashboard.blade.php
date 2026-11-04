@extends('layouts.eic')

@section('title', 'Dashboard')

@section('content')
<main class="content-container">

    <!-- Page Title Section -->
    <div class="page-title-section animate-fade-in delay-1">
        <h1 class="page-title">Dashboard</h1>
    </div>

    @if(session('success'))
        <div role="status" style="background:#e6f4ea;color:#137333;padding:12px 18px;border-radius:10px;margin-bottom:18px;font-weight:500;display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-circle-check"></i>
            <span>{{ session('success') }}</span>
        </div>
    @endif

    <!-- Metrics Row (2 per row on mobile: 1fr 1fr) -->
    <section id="metrics-grid" class="metrics-grid" aria-label="Operational metrics">
        <div class="metric-card animate-fade-in delay-1">
            <div class="metric-header">
                <span class="metric-label">Pending Approvals</span>
                <div class="metric-icon-box"><i class="fa-regular fa-clock"></i></div>
            </div>
            <div class="metric-value">{{ number_format($metrics['pending'] ?? 0) }}</div>
            <div class="metric-subtitle">Awaiting editorial review</div>
        </div>

        <div class="metric-card animate-fade-in delay-2">
            <div class="metric-header">
                <span class="metric-label">Total Article Views</span>
                <div class="metric-icon-box"><i class="fa-regular fa-eye"></i></div>
            </div>
            <div class="metric-value">{{ number_format($metrics['total_views'] ?? 0) }}</div>
            <div class="metric-subtitle">Views across all desks</div>
        </div>

        <div class="metric-card animate-fade-in delay-3">
            <div class="metric-header">
                <span class="metric-label">Active Members</span>
                <div class="metric-icon-box"><i class="fa-solid fa-users"></i></div>
            </div>
            <div class="metric-value">{{ number_format($metrics['active_members'] ?? 0) }}</div>
            <div class="metric-subtitle">Staff &amp; editorial roster</div>
        </div>

        <div class="metric-card animate-fade-in delay-4">
            <div class="metric-header">
                <span class="metric-label">Published Stories</span>
                <div class="metric-icon-box"><i class="fa-regular fa-newspaper"></i></div>
            </div>
            <div class="metric-value">{{ number_format($metrics['published_stories'] ?? 0) }}</div>
            <div class="metric-subtitle">Total overall published</div>
        </div>
    </section>

    <!-- Main Grid (Single Column on mobile) -->
    <div class="main-grid">

        <!-- Left Column (Larger - Editorial Operations Stack) -->
        <div class="left-column-stack">

            <!-- Section 1: Pending Approval -->
            <section class="card-panel animate-fade-in delay-2" aria-labelledby="pending-approval-heading">
                <div class="panel-header">
                    <h2 id="pending-approval-heading" class="panel-title">Pending Approval</h2>
                    <a href="{{ route('eic.review-articles') }}" class="panel-action-link">View all &rarr;</a>
                </div>
                
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Article Title</th>
                                <th class="hide-on-mobile">Section</th>
                                <th>Status</th>
                                <th class="hide-on-mobile">Date</th>
                                <th class="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody id="submissions-table-body">
                            @forelse($pendingArticles as $art)
                                <tr>
                                    <td>
                                        <div style="font-weight: 600; color: #101828;">{{ $art['title'] }}</div>
                                        <div style="font-size: 0.82rem; color: #667085;">By {{ $art['author'] }}</div>
                                    </td>
                                    <td class="hide-on-mobile">
                                        <span class="table-section-tag">{{ $art['category'] }}</span>
                                    </td>
                                    <td>
                                        <span class="status-badge status-review">{{ $art['status'] }}</span>
                                    </td>
                                    <td class="hide-on-mobile">{{ $art['date'] }}</td>
                                    <td class="text-right">
                                        <a href="{{ route('eic.review-articles') }}" class="btn-primary-action" style="padding: 6px 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">
                                            <i class="fa-solid fa-clipboard-check"></i>
                                            <span>Review</span>
                                        </a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" style="text-align: center; padding: 20px 16px; color: #667085; font-size: 0.9rem;">
                                        No articles awaiting EIC review.
                                    </td>
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
                    <a href="{{ route('eic.activity-logs') }}" class="panel-action-link">View all &rarr;</a>
                </div>
                <div id="recent-activity-list" class="activity-timeline">
                    @forelse($recentActivities as $log)
                        <div class="activity-item" style="display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f2f4f7;">
                            <div class="activity-avatar" style="width: 34px; height: 34px; border-radius: 50%; overflow: hidden; background: #f2f4f7; flex-shrink: 0;">
                                <img src="{{ asset('images/member-placeholder.svg') }}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <div class="activity-content" style="flex: 1; font-size: 0.86rem; color: #344054;">
                                <p style="margin: 0; line-height: 1.4;">
                                    <strong>{{ $log['user'] }}</strong> ({{ $log['role'] ?? 'Editorial Board' }})
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

        <!-- Right Column (Widened Analytics & Leaderboard Stack) -->
        <div class="right-column-stack">

            <!-- Section 1: Most Viewed Articles -->
            <section class="card-panel animate-fade-in delay-2" aria-labelledby="most-viewed-heading">
                <div class="panel-header">
                    <h2 id="most-viewed-heading" class="panel-title">Most Viewed Articles</h2>
                    <span id="most-viewed-month-badge" class="panel-badge">This Month</span>
                </div>
                <div id="most-viewed-list" class="ranked-list">
                    @forelse($mostViewed as $index => $item)
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
                            @forelse($topJournalists as $writer)
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
@endsection
