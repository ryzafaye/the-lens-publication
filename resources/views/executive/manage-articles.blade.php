@extends('layouts.executive')

@section('title', 'Manage Articles & Archives')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/executive-manage-articles.css') }}">
@endpush

@section('content')
<main class="content-container">

    <!-- Page Header & Title Section -->
    <div class="page-title-section animate-fade-in delay-1">
        <h1 class="page-title">Manage Articles &amp; Archives</h1>
    </div>

    <!-- Tabs Navigation (Active Articles vs. Archived Articles) -->
    <div class="manage-tabs-container animate-fade-in delay-2">
        <button type="button" id="tab-active-btn" class="manage-tab-btn active" data-tab="active">
            <i class="fa-regular fa-newspaper"></i>
            <span>Active Articles</span>
            <span id="badge-active-count" class="tab-count-badge">0</span>
        </button>
        <button type="button" id="tab-archived-btn" class="manage-tab-btn" data-tab="archived">
            <i class="fa-solid fa-box-archive"></i>
            <span>Archived Articles</span>
            <span id="badge-archived-count" class="tab-count-badge">0</span>
        </button>
    </div>

    <!-- Search & Filter Toolbar -->
    <div class="manage-toolbar animate-fade-in delay-2">
        
        <!-- Search Bar -->
        <div class="manage-search-shell">
            <i class="fa-solid fa-magnifying-glass search-leading-icon" aria-hidden="true"></i>
            <input type="search" id="manage-search-input" class="manage-search-input" placeholder="Search by article title or author..." aria-label="Search by article title or author" autocomplete="off">
            <button type="button" id="clear-search-btn" class="clear-search-icon hidden" title="Clear search">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <!-- Sort & Filter Dropdown Trigger & Popup -->
        <div class="sort-filter-wrapper">
            <button type="button" id="sort-filter-btn" class="sort-filter-btn" aria-expanded="false" aria-controls="filter-dropdown">
                <i class="fa-solid fa-sliders" aria-hidden="true"></i>
                <span>Sort &amp; Filter</span>
                <span id="filter-active-dot" class="filter-active-indicator hidden" title="Filters active"></span>
                <i class="fa-solid fa-chevron-down filter-chevron" aria-hidden="true"></i>
            </button>

            <!-- Floating Filter Popover -->
            <div id="filter-dropdown" class="filter-dropdown-menu hidden" role="region" aria-label="Sort and filter options">
                
                <!-- Filter Section: Section Category -->
                <div class="filter-group">
                    <label for="filter-category" class="filter-group-label">Category</label>
                    <select id="filter-category" class="filter-select">
                        <option value="all">All Categories</option>
                        <option value="News">News</option>
                        <option value="Opinion">Opinion</option>
                        <option value="Feature">Feature</option>
                        <option value="SciTech">SciTech</option>
                        <option value="Literature">Literature</option>
                    </select>
                </div>

                <!-- Filter Section: Sorting Order -->
                <div class="filter-group">
                    <label for="filter-sort" class="filter-group-label">Sort Order</label>
                    <select id="filter-sort" class="filter-select">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="views-desc">Most Viewed</option>
                        <option value="views-asc">Least Viewed</option>
                        <option value="title-asc">Title (A &rarr; Z)</option>
                        <option value="title-desc">Title (Z &rarr; A)</option>
                    </select>
                </div>

                <!-- Popover Action Buttons -->
                <div class="filter-actions-row">
                    <button type="button" id="reset-filter-btn" class="btn-filter-reset">Reset</button>
                    <button type="button" id="apply-filter-btn" class="btn-filter-apply">Apply</button>
                </div>

            </div>
        </div>

    </div>

    <!-- Active Filters Summary Chips Bar (Hidden when default) -->
    <div id="active-filters-chips" class="active-chips-bar hidden" aria-live="polite">
        <span class="chips-label">Filters:</span>
        <div id="chips-container" class="chips-container"></div>
        <button type="button" id="clear-all-chips-btn" class="btn-clear-chips">Clear All</button>
    </div>

    <!-- Results Status Announcement (Screen Reader friendly + Visual summary) -->
    <div class="results-meta-row animate-fade-in delay-3">
        <span id="results-count-summary" class="results-count-summary">Showing 0 articles</span>
    </div>

    <!-- Responsive Cards Grid View -->
    <div id="manage-cards-grid" class="manage-cards-grid animate-fade-in delay-3">
        <!-- Dynamically populated article cards generated by js/executive-manage-articles.js -->
    </div>

    <!-- Empty State View -->
    <div id="empty-state-view" class="manage-empty-state hidden">
        <div class="empty-icon-circle">
            <i class="fa-regular fa-folder-open" aria-hidden="true"></i>
        </div>
        <h2 id="empty-state-title" class="empty-state-title">No Articles Found</h2>
        <p id="empty-state-desc" class="empty-state-desc">There are currently no articles matching your active search or filters.</p>
        <button type="button" id="empty-reset-btn" class="btn-empty-reset">Reset Filters</button>
    </div>

</main>

<!-- ====================================================================== -->
<!-- MODAL: Minimalist Full Story Reader (Preview Full Article)              -->
<!-- ====================================================================== -->
<div id="story-reader-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="modal-story-title">
    <div class="modal-card reader-modal-card">
        
        <!-- Reader Header -->
        <div class="reader-modal-header">
            <div class="reader-header-meta">
                <span id="reader-category" class="reader-category-pill">News</span>
                <span class="reader-meta-dot">&bull;</span>
                <span id="reader-date" class="reader-date-text">Oct 18, 2026</span>
                <span class="reader-meta-dot">&bull;</span>
                <span id="reader-read-time" class="reader-read-time-text">3 min read</span>
            </div>
            <button type="button" id="close-reader-btn" class="viewer-close-btn" aria-label="Close article reader">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <!-- Reader Body -->
        <div class="reader-modal-body">
            <h1 id="modal-story-title" class="reader-headline">Article Title Headline</h1>

            <!-- Byline Banner -->
            <div class="reader-byline-banner">
                <div class="reader-avatar-wrap">
                    <img id="reader-author-avatar" src="{{ asset('images/member-placeholder.svg') }}" alt="Author avatar">
                </div>
                <div class="reader-author-info">
                    <span id="reader-author-name" class="reader-author-name">Author Name</span>
                    <span id="reader-author-role" class="reader-author-role">Staff Writer</span>
                </div>
            </div>

            <!-- Stats Bar (Views & Shares) -->
            <div class="reader-stats-banner">
                <div class="reader-stat-item">
                    <i class="fa-regular fa-eye" aria-hidden="true"></i>
                    <span id="reader-views-count">0</span>
                    <span class="stat-unit">views</span>
                </div>
                <div class="reader-stat-item">
                    <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
                    <span id="reader-shares-count">0</span>
                    <span class="stat-unit">shares</span>
                </div>
                <div id="reader-archived-badge" class="reader-status-badge hidden">
                    <i class="fa-solid fa-box-archive"></i>
                    <span>Archived</span>
                </div>
            </div>

            <!-- Excerpt Callout -->
            <div id="reader-excerpt-callout" class="reader-excerpt-callout">
                <p id="reader-excerpt-text"></p>
            </div>

            <!-- Full Article Body -->
            <div id="reader-article-body" class="reader-article-content"></div>
        </div>

        <!-- Reader Footer -->
        <div class="reader-modal-footer">
            <button type="button" id="reader-close-bottom-btn" class="btn-reader-close">Close</button>
        </div>

    </div>
</div>

<!-- ====================================================================== -->
<!-- MODAL: Confirmation Dialog (Archive / Restore)                          -->
<!-- ====================================================================== -->
<div id="action-confirm-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-card confirm-modal-card">
        <div class="modal-body-confirm">
            <div class="modal-icon-wrap" id="modal-icon-wrap">
                <i id="confirm-modal-icon" class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div class="modal-confirm-texts">
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
<script type="module" src="{{ asset('js/executive-manage-articles.js') }}"></script>
@endpush
