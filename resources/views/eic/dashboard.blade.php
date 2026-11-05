@extends('layouts.eic')

@section('title', 'Dashboard')

@push('styles')
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
            <div class="metric-subtitle">Awaiting editorial review</div>
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

    <!-- Main Grid (Single Column on mobile) -->
    <div class="main-grid">

        <!-- Left Column (Larger - Editorial Operations Stack) -->
        <div class="left-column-stack">

            <!-- Section 1: Pending Approval (Above Activity Log, Simplified Table on Mobile) -->
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
                                <th>Author</th>
                                <th>Status</th>
                                <th class="hide-on-mobile">Date</th>
                                <th class="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody id="submissions-table-body">
                            @forelse($pendingArticles ?? [] as $art)
                                <tr>
                                    <td>
                                        <div class="table-article-info">
                                            <button type="button" class="table-article-btn" data-action="view-modal" data-id="{{ $art['id'] }}" data-article="{{ json_encode($art) }}" title="{{ $art['title'] }}">
                                                {{ $art['title'] }}
                                            </button>
                                        </div>
                                    </td>
                                    <td><span class="table-author"><i class="fa-solid fa-pen-nib" aria-hidden="true" style="color: var(--sidebar-maroon, #5c0a18); font-size: 0.72rem; margin-right: 4px;"></i>{{ $art['author'] ?? 'Author' }}</span></td>
                                    <td><span class="status-badge status-review">Pending</span></td>
                                    <td class="hide-on-mobile"><span class="table-date">{{ $art['date'] ?? '' }}</span></td>
                                    <td class="text-right">
                                        <a href="{{ route('eic.review-articles') }}" class="table-manage-btn" title="Review Article">
                                            Manage
                                        </a>
                                    </td>
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

            <!-- Section 2: Activity Log (Top 5 Recent with View All) -->
            <section class="card-panel animate-fade-in delay-3" aria-labelledby="activity-log-heading">
                <div class="panel-header">
                    <h2 id="activity-log-heading" class="panel-title">Activity Log</h2>
                    <a href="{{ route('eic.activity-logs') }}" class="panel-action-link">View all &rarr;</a>
                </div>
                <div id="recent-activity-list" class="activity-timeline"></div>
            </section>

        </div>

        <!-- Right Column (Widened Analytics & Leaderboard Stack) -->
        <div class="right-column-stack">

            <!-- Section 1: Most Viewed Articles (Current month with eye & share icons) -->
            <section class="card-panel animate-fade-in delay-2" aria-labelledby="most-viewed-heading">
                <div class="panel-header">
                    <h2 id="most-viewed-heading" class="panel-title">Most Viewed Articles</h2>
                    <span id="most-viewed-month-badge" class="panel-badge">October</span>
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
<!-- MODAL 1: Full Article Viewer Modal (For EIC to View Article)            -->
<!-- Bottom Choices: Edit Article, Move to Archive, Emergency Delete         -->
<!-- ====================================================================== -->
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
                <div class="viewer-byline-author">
                    <i class="fa-solid fa-pen-nib" aria-hidden="true" style="color: var(--sidebar-maroon, #5c0a18); font-size: 0.85rem; margin-right: 4px;"></i>
                    <span class="viewer-by">By <strong id="viewer-author" class="viewer-author-name">Author Name</strong></span>
                </div>
            </div>

            <p id="viewer-excerpt" class="viewer-excerpt" style="display: none;"></p>

            <div id="viewer-content" class="viewer-content-text">
                <!-- Paragraphs populated dynamically -->
            </div>

            <!-- Editorial Revision Remarks Box -->
            <div class="manuscript-remarks-section" id="viewer-remarks-section" style="display: none;">
                <label for="viewer-remarks" class="remarks-label">
                    <span class="remarks-label-text">
                        <i class="fa-solid fa-comment-dots"></i>
                        <span>Editorial Revision Remarks:</span>
                    </span>
                    <span class="required-badge">Required</span>
                </label>
                <textarea id="viewer-remarks" class="remarks-textarea" placeholder="Enter mandatory revision feedback for the writer before returning this story..."></textarea>
                <div id="viewer-remarks-error" class="remarks-error-msg hidden">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>Revision remarks are required. You cannot return for revision without remarks.</span>
                </div>
            </div>

            <div class="viewer-stats-bar" id="viewer-stats-bar" style="display: none;">
                <span class="stat-pill"><i class="fa-regular fa-eye"></i> <span id="viewer-views">0</span></span>
                <span class="stat-pill"><i class="fa-solid fa-share-nodes"></i> <span id="viewer-shares">0</span></span>
            </div>
        </div>

        <div class="viewer-modal-footer" id="viewer-modal-footer">
            <div class="modal-footer-right" id="viewer-review-actions">
                <button type="button" id="viewer-revision-btn" class="btn-box-revision">
                    <i class="fa-solid fa-rotate-left"></i>
                    <span>For Revision</span>
                </button>
                <button type="button" id="viewer-approve-btn" class="btn-box-approve">
                    <i class="fa-solid fa-check"></i>
                    <span>Approve</span>
                </button>
            </div>
            <div id="viewer-published-actions" style="display: none; width: 100%; justify-content: flex-end; gap: 10px;">
                <button type="button" id="viewer-action-edit" class="modal-btn modal-btn-secondary">
                    <i class="fa-regular fa-pen-to-square"></i> Edit Article
                </button>
                <button type="button" id="viewer-action-archive" class="modal-btn modal-btn-warning">
                    <i class="fa-solid fa-box-archive"></i> <span id="viewer-archive-label">Move to Archive</span>
                </button>
                <button type="button" id="viewer-action-delete" class="modal-btn modal-btn-danger">
                    <i class="fa-regular fa-trash-can"></i> Emergency Delete
                </button>
            </div>
        </div>
    </div>
</div>

<!-- ====================================================================== -->
<!-- MODAL 2: Edit Article Modal                                            -->
<!-- ====================================================================== -->
<div id="edit-article-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
    <div class="modal-card edit-modal-card">
        <div class="modal-header-simple">
            <h2 id="edit-modal-title" class="modal-title">
                <i class="fa-solid fa-pen-nib"></i> Edit Article
            </h2>
            <button type="button" id="close-edit-btn" class="icon-button" aria-label="Close edit dialog">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <form id="edit-article-form" class="edit-modal-form">
            <input type="hidden" id="edit-article-id">

            <div class="form-field">
                <label for="edit-title-input">Article Title</label>
                <input type="text" id="edit-title-input" class="form-input" required>
            </div>

            <div class="form-row-2">
                <div class="form-field">
                    <label for="edit-author-input">Author</label>
                    <input type="text" id="edit-author-input" class="form-input" required>
                </div>
                <div class="form-field">
                    <label for="edit-category-select">Category</label>
                    <select id="edit-category-select" class="form-select">
                        <option value="News">News</option>
                        <option value="Features">Features</option>
                        <option value="Opinion">Opinion</option>
                        <option value="Science and Technology">Science and Technology</option>
                        <option value="Literature">Literature</option>
                    </select>
                </div>
            </div>

            <div class="form-field">
                <label for="edit-readtime-input">Estimated Read Time</label>
                <input type="text" id="edit-readtime-input" class="form-input" placeholder="e.g. 2 min read">
            </div>

            <div class="form-field">
                <label for="edit-excerpt-input">Excerpt / Brief Summary</label>
                <textarea id="edit-excerpt-input" class="form-textarea" rows="3" required></textarea>
            </div>

            <div class="modal-footer">
                <button type="button" id="cancel-edit-btn" class="modal-btn modal-btn-cancel">Cancel</button>
                <button type="submit" class="modal-btn modal-btn-confirm-primary">
                    <i class="fa-solid fa-check"></i> Save Changes
                </button>
            </div>
        </form>
    </div>
</div>

<!-- ====================================================================== -->
<!-- MODAL 3: Interactive Action Confirmation Modal (Archive/Restore/Delete) -->
<!-- ====================================================================== -->
<div id="action-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-card">
        <div class="modal-body">
            <div id="modal-icon-header" class="modal-icon-header warning">
                <i id="modal-icon" class="fa-solid fa-box-archive"></i>
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

<!-- Toast Notification Container -->
<div id="toast-container" class="toast-container" aria-live="polite"></div>
@endsection

@push('scripts')
<script>
    window.__DASHBOARD_PENDING__ = @json($pendingArticles ?? []);
    window.__DASHBOARD_METRICS__ = @json($metrics ?? []);
    window.__REVIEW_ARTICLES_URL__ = "{{ route('eic.review-articles') }}";
</script>
<script type="module" src="{{ asset('js/eic-dashboard.js') }}"></script>
@endpush

