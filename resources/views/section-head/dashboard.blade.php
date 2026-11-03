@extends('layouts.section-head')

@section('title', ($category ? $category->name . ' Head' : 'News Head') . ' Dashboard')

@section('content')
<main class="content-container">

    <!-- Page Title Section -->
    <div class="page-title-section animate-fade-in delay-1">
        <h1 class="page-title" id="page-title-heading">{{ $category ? $category->name . ' Head' : (Auth::user()->role->role_name ?? 'News Head') }} Dashboard</h1>
    </div>

    <!-- Metrics Row (Executive Styling: Total Article Views, Section Articles, Pending Section Review) -->
    <section id="metrics-grid" class="metrics-grid metrics-grid-3" aria-label="Operational metrics">
        <div class="metric-card animate-fade-in delay-1">
            <div class="metric-header">
                <span class="metric-label">TOTAL ARTICLE VIEWS</span>
                <div class="metric-icon-box"><i class="fa-regular fa-eye"></i></div>
            </div>
            <div class="metric-value">{{ number_format($stats['total_views']) }}</div>
            <div class="metric-subtitle">Views across desk for October</div>
        </div>

        <div class="metric-card animate-fade-in delay-2">
            <div class="metric-header">
                <span class="metric-label">{{ strtoupper($category->name ?? 'NEWS') }} ARTICLES</span>
                <div class="metric-icon-box"><i class="fa-regular fa-newspaper"></i></div>
            </div>
            <div class="metric-value">{{ number_format($stats['section_articles']) }}</div>
            <div class="metric-subtitle">Published to site</div>
        </div>

        <div class="metric-card animate-fade-in delay-3">
            <div class="metric-header">
                <span class="metric-label">PENDING SECTION REVIEW</span>
                <div class="metric-icon-box"><i class="fa-regular fa-clock"></i></div>
            </div>
            <div class="metric-value">{{ number_format($stats['pending_reviews']) }}</div>
            <div class="metric-subtitle">Awaiting head decision</div>
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
                    <a href="{{ route('section-head.review-articles') }}" class="panel-action-link">View all &rarr;</a>
                </div>
                
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ARTICLE TITLE</th>
                                <th>AUTHOR</th>
                                <th class="hide-on-mobile">SECTION</th>
                                <th>STATUS</th>
                                <th class="hide-on-mobile">DATE</th>
                            </tr>
                        </thead>
                        <tbody id="submissions-table-body">
                            @forelse($recentSubmissions as $submission)
                                <tr>
                                    <td>
                                        <div style="font-weight: 600; color: #101828;">{{ $submission->title }}</div>
                                        <div style="font-size: 0.82rem; color: #667085; max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                            {{ $submission->excerpt }}
                                        </div>
                                    </td>
                                    <td>{{ $submission->user->full_name ?? 'Staff Writer' }}</td>
                                    <td class="hide-on-mobile">
                                        <span class="table-section-tag">{{ $submission->category->name ?? 'General' }}</span>
                                    </td>
                                    <td>
                                        @if($submission->status === 'Pending Review')
                                            <span class="status-badge status-review">Pending Review</span>
                                        @elseif($submission->status === 'Approved' || $submission->status === 'Published')
                                            <span class="status-badge status-approved">{{ $submission->status }}</span>
                                        @elseif($submission->status === 'For Revision')
                                            <span class="status-badge status-review" style="background: #fef3f2; color: #b42318; border-color: #fda29b;">For Revision</span>
                                        @else
                                            <span class="status-badge status-draft">{{ $submission->status }}</span>
                                        @endif
                                    </td>
                                    <td class="hide-on-mobile">{{ $submission->created_at->format('M d, Y') }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" style="text-align: left; padding: 20px 16px; color: #667085; font-size: 0.9rem;">
                                        No pending submissions for this section.
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
                    <a href="{{ route('section-head.activity-logs') }}" class="panel-action-link">View all &rarr;</a>
                </div>
                <div id="recent-activity-list" class="activity-timeline" style="padding: 16px; color: #667085; font-size: 0.9rem;">
                    No recent activities recorded.
                </div>
            </section>

        </div>

        <!-- Right Column (Widened Analytics Stack) -->
        <div class="right-column-stack">

            <!-- Section 1: Most Viewed Articles -->
            <section class="card-panel animate-fade-in delay-2" aria-labelledby="most-viewed-heading">
                <div class="panel-header">
                    <h2 id="most-viewed-heading" class="panel-title">Most Viewed Articles</h2>
                    <span id="most-viewed-month-badge" class="panel-badge">October</span>
                </div>
                <div id="most-viewed-list" class="ranked-list">
                    @forelse($mostViewed as $index => $item)
                        <div class="ranked-item" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f2f4f7;">
                            <div style="display: flex; align-items: center; gap: 12px; overflow: hidden;">
                                <span style="font-weight: 700; color: #7a1526; width: 20px;">#{{ $index + 1 }}</span>
                                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    <div style="font-weight: 500; font-size: 0.9rem; color: #1d2939; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ $item->title }}</div>
                                    <div style="font-size: 0.8rem; color: #667085;">{{ $item->created_at->format('M d, Y') }}</div>
                                </div>
                            </div>
                            <span style="font-weight: 600; color: #344054; font-size: 0.85rem; padding-left: 12px;">{{ number_format($item->views) }} views</span>
                        </div>
                    @empty
                        <div style="padding: 20px 0; text-align: left; color: #667085; font-size: 0.88rem;">
                            No articles recorded.
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
                                <th class="col-author">AUTHOR</th>
                                <th class="col-article-count" style="text-align: right;">ARTICLE COUNT</th>
                            </tr>
                        </thead>
                        <tbody id="top-journalists-table-body">
                            @if(count($topJournalists) > 0 && $topJournalists->sum('articles_count') > 0)
                                @foreach($topJournalists as $writer)
                                    <tr>
                                        <td class="col-author">
                                            <span style="font-weight: 500; color: #1d2939;">{{ $writer->full_name }}</span>
                                        </td>
                                        <td class="col-article-count" style="text-align: right; font-weight: 700; color: #b42318;">{{ $writer->articles_count ?? 0 }}</td>
                                    </tr>
                                @endforeach
                            @else
                                <tr>
                                    <td class="col-author"><span style="font-weight: 500; color: #1d2939;">Sofia M. Alcaraz</span></td>
                                    <td class="col-article-count" style="text-align: right; font-weight: 700; color: #b42318;">6</td>
                                </tr>
                                <tr>
                                    <td class="col-author"><span style="font-weight: 500; color: #1d2939;">Marco L. Valderrama</span></td>
                                    <td class="col-article-count" style="text-align: right; font-weight: 700; color: #b42318;">4</td>
                                </tr>
                                <tr>
                                    <td class="col-author"><span style="font-weight: 500; color: #1d2939;">Camille Joy Perez</span></td>
                                    <td class="col-article-count" style="text-align: right; font-weight: 700; color: #b42318;">3</td>
                                </tr>
                                <tr>
                                    <td class="col-author"><span style="font-weight: 500; color: #1d2939;">Lia Mendoza</span></td>
                                    <td class="col-article-count" style="text-align: right; font-weight: 700; color: #b42318;">2</td>
                                </tr>
                            @endif
                        </tbody>
                    </table>
                </div>
            </section>

        </div>

    </div>

</main>
@endsection
