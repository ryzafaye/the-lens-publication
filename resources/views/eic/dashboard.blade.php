@extends('layouts.eic')

@section('title', 'Dashboard')

@section('content')
<main class="content-container">

    <!-- Page Title Section -->
    <div class="page-title-section animate-fade-in delay-1">
        <h1 class="page-title">Dashboard</h1>
    </div>

    <!-- Metrics Row (2 per row on mobile: 1fr 1fr) -->
    <section id="metrics-grid" class="metrics-grid" aria-label="Operational metrics"></section>

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
                <!-- Paragraphs populated dynamically -->
            </div>

            <div class="viewer-stats-bar">
                <span class="stat-pill"><i class="fa-regular fa-eye"></i> <span id="viewer-views">0</span></span>
                <span class="stat-pill"><i class="fa-solid fa-share-nodes"></i> <span id="viewer-shares">0</span></span>
            </div>
        </div>

        <div class="viewer-modal-footer">
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
@endsection

@push('scripts')
<script type="module" src="{{ asset('js/eic-dashboard.js') }}"></script>
@endpush

