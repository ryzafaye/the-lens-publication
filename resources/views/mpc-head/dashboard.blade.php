@extends('layouts.mpc-head')

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
    <section id="metrics-grid" class="metrics-grid" aria-label="Operational metrics"></section>

    <!-- Main Grid (Single Column on mobile) -->
    <div class="main-grid">

        <!-- Left Column (Larger - Editorial Operations Stack) -->
        <div class="left-column-stack">

            <!-- Section 1: Ready for Publication / Pending Approval -->
            <section class="card-panel animate-fade-in delay-2" aria-labelledby="pending-approval-heading">
                <div class="panel-header">
                    <div>
                        <h2 id="pending-approval-heading" class="panel-title">Pending Approval</h2>
                        <p class="panel-subtitle" style="font-size: 0.78rem; color: #667085; margin: 2px 0 0 0;">Endorsed by Section Heads &amp; EIC, awaiting M&amp;PC publication</p>
                    </div>
                    <span id="pending-count-badge" class="panel-badge">0 awaiting review</span>
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
                        <tbody id="submissions-table-body"></tbody>
                    </table>
                </div>
            </section>

            <!-- Section 2: Activity Log -->
            <section class="card-panel animate-fade-in delay-3" aria-labelledby="activity-log-heading">
                <div class="panel-header">
                    <h2 id="activity-log-heading" class="panel-title">Activity Log</h2>
                    <span class="panel-badge">Recent actions</span>
                </div>
                <div id="recent-activity-list" class="activity-timeline"></div>
            </section>

        </div>

        <!-- Right Column (Widened Analytics & Leaderboard Stack) -->
        <div class="right-column-stack">

            <!-- Section 1: Most Viewed Articles (With Take Down Capability) -->
            <section class="card-panel animate-fade-in delay-2" aria-labelledby="most-viewed-heading">
                <div class="panel-header">
                    <div>
                        <h2 id="most-viewed-heading" class="panel-title">Most Viewed Articles</h2>
                        <p class="panel-subtitle" style="font-size: 0.78rem; color: #667085; margin: 2px 0 0 0;">Live on public site · click to inspect or take down</p>
                    </div>
                    <span id="most-viewed-month-badge" class="panel-badge">This Month</span>
                </div>
                <div id="most-viewed-list" class="ranked-list"></div>
            </section>

            <!-- Section 2: Top Performing Journalists (Table Layout) -->
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

<!-- ====================================================================== -->
<!-- MODAL 1: Full Article Viewer Modal (For M&PC to View, Approve or Take Down) -->
<!-- ====================================================================== -->
<div id="article-viewer-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="viewer-title">
    <div class="modal-card viewer-modal-card">
        <div class="viewer-modal-header">
            <div class="viewer-meta-row">
                <span id="viewer-category" class="viewer-category-tag">News</span>
                <span class="viewer-dot">·</span>
                <span id="viewer-date" class="viewer-date">Oct 12, 2026</span>
                <span class="viewer-dot">·</span>
                <span id="viewer-status-badge" class="status-badge status-approved">Published</span>
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
                    <img src="{{ asset('images/member-placeholder.svg') }}" alt="Author avatar">
                </div>
                <div class="viewer-byline-text">
                    <span class="viewer-by">By <strong id="viewer-author">Author Name</strong></span>
                </div>
            </div>

            <p id="viewer-excerpt" class="viewer-excerpt" style="display: none;"></p>

            <div id="viewer-banner-wrap" class="viewer-banner">
                <img id="viewer-banner-img" src="{{ asset('images/maroon.jpg') }}" alt="Article banner">
            </div>

            <div id="viewer-content" class="viewer-content-text">
                <!-- Content populated dynamically -->
            </div>

            <div class="viewer-stats-bar">
                <span class="stat-pill"><i class="fa-regular fa-eye"></i> <span id="viewer-views">0</span></span>
                <span class="stat-pill"><i class="fa-solid fa-share-nodes"></i> <span id="viewer-shares">0</span></span>
            </div>

            <!-- Remarks Box (Required for Revision or Rejection) -->
            <div id="viewer-remarks-section" class="viewer-remarks-wrap" style="display: none; margin-top: 18px; padding: 14px; background: #fafbfc; border: 1px solid #e4e7ec; border-radius: 8px;">
                <label for="viewer-remarks-input" style="display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; font-weight: 600; color: #344054; margin-bottom: 6px;">
                    <span style="display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-comment-dots" style="color: #667085;"></i>
                        <span id="viewer-remarks-label">Editorial Remarks (Required for Revision or Reject):</span>
                    </span>
                    <span id="viewer-remarks-required-badge" style="font-size: 0.70rem; color: #b42318; background: #fee4e2; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Required</span>
                </label>
                <textarea id="viewer-remarks-input" class="form-textarea" rows="3" placeholder="Enter editorial feedback for the writer before returning this story..." style="resize: vertical; font-size: 0.85rem; width: 100%; box-sizing: border-box;"></textarea>
                <div id="viewer-remarks-error" style="display: none; color: #b42318; font-size: 0.78rem; margin-top: 6px; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>Remarks are required before submitting for revision or rejection.</span>
                </div>
            </div>
        </div>

        <div class="viewer-modal-footer">
            <button type="button" id="viewer-cancel-btn" class="modal-btn modal-btn-cancel">
                Close
            </button>

            <!-- Reject / Decline Button (Shown if Pending) -->
            <button type="button" id="viewer-action-decline" class="modal-btn modal-btn-secondary" style="display: none; color: #b42318; border-color: #fecdca;">
                <i class="fa-solid fa-xmark"></i>
                <span>Reject</span>
            </button>

            <!-- For Revision Button (Shown if Pending) -->
            <button type="button" id="viewer-action-revision" class="modal-btn modal-btn-warning" style="display: none;">
                <i class="fa-solid fa-rotate-left"></i>
                <span>For Revision</span>
            </button>

            <!-- Approve & Publish Button (Shown if Pending) -->
            <button type="button" id="viewer-action-approve" class="modal-btn modal-btn-confirm-primary" style="display: none;">
                <i class="fa-solid fa-check"></i>
                <span>Approve &amp; Publish</span>
            </button>

            <!-- Take Down Article Button (Shown once Posted / Published) -->
            <button type="button" id="viewer-action-takedown" class="modal-btn modal-btn-danger" style="display: none;">
                <i class="fa-solid fa-arrow-down-from-bracket"></i>
                <span>Take Down Article</span>
            </button>
        </div>
    </div>
</div>

<!-- ====================================================================== -->
<!-- MODAL 2: Interactive Action Confirmation Modal (Approve / Take Down)   -->
<!-- ====================================================================== -->
<div id="action-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-card">
        <div class="modal-body">
            <div id="modal-icon-header" class="modal-icon-header warning">
                <i id="modal-icon" class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
                <h2 id="modal-title" class="modal-title">Confirm Action</h2>
                <p id="modal-description" class="modal-description">Are you sure you want to perform this action?</p>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" id="modal-cancel-btn" class="modal-btn modal-btn-cancel">Cancel</button>
            <button type="button" id="modal-confirm-btn" class="modal-btn modal-btn-confirm-primary">Confirm</button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    window.__DASHBOARD_METRICS__ = @json($metrics ?? []);
    window.__PENDING_ARTICLES__ = @json($pendingArticles ?? []);
    window.__PUBLISHED_ARTICLES__ = @json($publishedArticles ?? []);
    window.__TOP_JOURNALISTS__ = @json($topJournalists ?? []);
    window.__RECENT_ACTIVITIES__ = @json($recentActivities ?? []);
    window.__APPROVE_URL__ = "{{ url('/mpc-head/articles') }}";
    window.__REVISION_URL__ = "{{ url('/mpc-head/articles') }}";
    window.__DECLINE_URL__ = "{{ url('/mpc-head/articles') }}";
    window.__TAKEDOWN_URL__ = "{{ url('/mpc-head/articles') }}";
</script>
<script type="module" src="{{ asset('js/mpc-dashboard.js') }}"></script>
@endpush
