@extends('layouts.executive')

@section('title', 'Dashboard')

@section('content')
<main class="content-container">
    <div class="page-title-section animate-fade-in delay-1">
        <h1 class="page-title">Dashboard</h1>
    </div>

    <!-- Metrics Grid -->
    <section id="metrics-grid" class="metrics-grid" aria-label="Operational metrics">
        <div class="metric-card animate-fade-in delay-1">
            <div class="metric-header">
                <span class="metric-label">Pending Approvals</span>
                <div class="metric-icon-box"><i class="fa-regular fa-clock"></i></div>
            </div>
            <div class="metric-value">{{ $metrics['pending'] }}</div>
            <div class="metric-subtitle">Awaiting editorial review</div>
        </div>
        
        <div class="metric-card animate-fade-in delay-2">
            <div class="metric-header">
                <span class="metric-label">Monthly Readership</span>
                <div class="metric-icon-box"><i class="fa-regular fa-eye"></i></div>
            </div>
            <div class="metric-value">{{ $metrics['monthly_views'] }}</div>
            <div class="metric-subtitle">Views across all desks</div>
        </div>

        <div class="metric-card animate-fade-in delay-3">
            <div class="metric-header">
                <span class="metric-label">Active Members</span>
                <div class="metric-icon-box"><i class="fa-solid fa-users"></i></div>
            </div>
            <div class="metric-value">{{ $metrics['active_members'] }}</div>
            <div class="metric-subtitle">Staff & editorial roster</div>
        </div>

        <div class="metric-card animate-fade-in delay-4">
            <div class="metric-header">
                <span class="metric-label">Published Stories</span>
                <div class="metric-icon-box"><i class="fa-regular fa-newspaper"></i></div>
            </div>
            <div class="metric-value">{{ $metrics['published_stories'] }}</div>
            <div class="metric-subtitle">Total overall published</div>
        </div>
    </section>

    <div class="main-grid">
        <div class="left-column-stack">
            <section class="card-panel animate-fade-in delay-2">
                <div class="panel-header">
                    <h2 class="panel-title">Pending Approval</h2>
                    <a href="/executive/review-articles" class="panel-action-link">View all &rarr;</a>
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
                                        <div class="table-article-info">
                                            <button type="button" class="table-article-btn" data-action="view" data-article="{{ json_encode($art) }}">
                                                {{ $art['title'] }}
                                            </button>
                                            <div class="table-author-subline">
                                                <i class="fa-solid fa-pen-nib"></i>
                                                <span>{{ $art['author'] }}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="hide-on-mobile"><span class="table-section-tag">{{ $art['category'] }}</span></td>
                                    <td><span class="status-badge status-review">Pending</span></td>
                                    <td class="hide-on-mobile"><span class="table-date">{{ $art['date'] }}</span></td>
                                    <td class="text-right">
                                        <a href="/executive/review/{{ $art['id'] }}" class="table-manage-btn">Manage</a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" style="text-align: center; padding: 24px; color: #667085;">No pending submissions awaiting review.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <div class="right-column-stack">
            <section class="card-panel animate-fade-in delay-2">
                <div class="panel-header">
                    <h2 class="panel-title">Most Viewed Articles</h2>
                    <span class="panel-badge">{{ date('F') }}</span>
                </div>
                <div id="most-viewed-list" class="ranked-list">
                    <!-- Dynamic rendering here later -->
                </div>
            </section>
        </div>
    </div>
</main>

<!-- Ilagay mo rito sa ibaba yung HTML ng Modals (Article Viewer, Edit, Action) -->
<div id="article-viewer-modal" class="modal-overlay hidden">
    <!-- Paste ang laman ng viewer modal dito -->
</div>

<!-- Container ng Toasts -->
<div id="toast-container" class="toast-container" aria-live="polite"></div>
@endsection

@section('extra-js')
    <script type="module" src="{{ asset('js/executive-dashboard.js') }}"></script>
@endsection