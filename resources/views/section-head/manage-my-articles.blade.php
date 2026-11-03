@extends('layouts.section-head')

@section('title', 'Manage My Articles | Section Head Portal')

@section('extra-css')
    <link rel="stylesheet" href="{{ asset('css/manage-my-articles.css') }}">
@endsection

@section('content')
<main class="content-container">

    <!-- Page Title Section with Total Views Counter & Action Button -->
    <div class="writer-header-row animate-fade-in delay-1">
        <div class="writer-header-left">
            <h1 class="page-title">Manage My Articles</h1>
        </div>

        <div class="writer-header-right">
            <!-- Total Views Header Metric Pill -->
            <div class="header-views-badge" title="Total Views Across Published Articles">
                <span class="views-badge-icon">
                    <i class="fa-regular fa-eye"></i>
                </span>
                <span class="views-badge-content">
                    <span class="views-badge-label">Total Views</span>
                    <span id="stat-total-views" class="views-badge-val">0</span>
                </span>
            </div>

            <a href="{{ route('section-head.submit-article') }}" class="btn-primary-action">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>New Article</span>
            </a>
        </div>
    </div>

    <!-- Tabs Navigation Adjusted Directly Under Page Title (All, Published, Pending, Revision, Drafts) -->
    <div class="manage-tabs-container animate-fade-in delay-2" role="tablist" aria-label="Filter my articles">
        <button type="button" class="manage-tab-btn active" data-tab="all" role="tab" aria-selected="true">
            <span>All Articles</span>
            <span id="badge-count-all" class="tab-count-badge">0</span>
        </button>
        <button type="button" class="manage-tab-btn" data-tab="published" role="tab" aria-selected="false">
            <span>Published</span>
            <span id="badge-count-published" class="tab-count-badge">0</span>
        </button>
        <button type="button" class="manage-tab-btn" data-tab="pending" role="tab" aria-selected="false">
            <span>Pending Review</span>
            <span id="badge-count-pending" class="tab-count-badge">0</span>
        </button>
        <button type="button" class="manage-tab-btn" data-tab="revision" role="tab" aria-selected="false">
            <span>For Revision</span>
            <span id="badge-count-revision" class="tab-count-badge">0</span>
        </button>
        <button type="button" class="manage-tab-btn" data-tab="drafts" role="tab" aria-selected="false">
            <span>Drafts</span>
            <span id="badge-count-drafts" class="tab-count-badge">0</span>
        </button>
    </div>

    <!-- Search Bar & Sort Dropdown Toolbar -->
    <div class="manage-toolbar animate-fade-in delay-2">
        
        <!-- Search Bar -->
        <div class="manage-search-shell">
            <i class="fa-solid fa-magnifying-glass search-leading-icon" aria-hidden="true"></i>
            <input 
                type="text" 
                id="writer-search-input" 
                class="manage-search-input" 
                placeholder="Search my articles by title, section, or keyword..." 
                aria-label="Search my articles" 
                autocomplete="off"
            >
            <button type="button" id="clear-search-btn" class="clear-search-icon hidden" title="Clear search">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <!-- Sort Control -->
        <div class="review-sort-container">
            <label for="writer-sort-select" class="review-sort-label">
                <i class="fa-solid fa-arrow-down-short-wide"></i>
                <span>Sort:</span>
            </label>
            <div class="sort-select-wrapper">
                <select id="writer-sort-select" class="review-sort-select" aria-label="Sort articles">
                    <option value="newest" selected>Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Viewed</option>
                    <option value="az">A–Z</option>
                </select>
                <i class="fa-solid fa-chevron-down sort-chevron" aria-hidden="true"></i>
            </div>
        </div>

    </div>

    <!-- Articles List Container -->
    <section class="writer-articles-list animate-fade-in delay-3" id="writer-manage-list" aria-label="My articles list">
        <!-- Populated dynamically by js/writer-manage-my-articles.js -->
    </section>

    <!-- Empty State -->
    <div id="manage-empty-state" class="manage-empty-state hidden" role="status" aria-live="polite">
        <div class="manage-empty-icon">
            <i class="fa-regular fa-folder-open" id="manage-empty-icon-i" aria-hidden="true"></i>
        </div>
        <h3 class="manage-empty-title" id="manage-empty-title">No articles found</h3>
        <p class="manage-empty-desc hidden" id="manage-empty-desc"></p>
    </div>

</main>

<!-- ====================================================================== -->
<!-- MODAL 1: Full Article Viewer Modal                                     -->
<!-- ====================================================================== -->
<div id="viewer-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="viewer-title">
    <div class="modal-card viewer-modal-card">
        
        <div class="viewer-modal-header">
            <div class="viewer-meta-row">
                <span id="viewer-category" class="viewer-category-tag">News</span>
                <span class="viewer-dot">·</span>
                <span id="viewer-date" class="viewer-date">Oct 19, 2026</span>
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
                    <img id="viewer-author-avatar-img" src="{{ asset('images/member-placeholder.svg') }}" alt="Author avatar">
                </div>
                <div class="viewer-byline-text">
                    <span class="viewer-by"><i class="fa-solid fa-pen-nib" aria-hidden="true" style="font-size: 0.72rem; margin-right: 4px; color: var(--text-muted, #667085);"></i><strong id="viewer-author">{{ Auth::user()->full_name }}</strong></span>
                </div>
            </div>

            <p id="viewer-excerpt" class="viewer-excerpt"></p>

            <div id="viewer-body" class="viewer-body-content"></div>
        </div>

    </div>
</div>

<!-- ====================================================================== -->
<!-- MODAL 2: Revision Feedback Modal                                       -->
<!-- ====================================================================== -->
<div id="remarks-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="remarks-modal-title">
    <div class="modal-card remarks-modal-card">
        <div class="remarks-modal-header">
            <h3 id="remarks-modal-title" class="remarks-modal-title">Revision Feedback</h3>
            <button type="button" id="close-remarks-btn" class="viewer-close-btn" aria-label="Close feedback dialog">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <div class="remarks-modal-body">
            <div class="remarks-alert-box" style="margin-top: 0;">
                <div class="remarks-alert-title">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>Editorial Feedback:</span>
                </div>
                <p id="remarks-modal-content" class="remarks-alert-text"></p>
            </div>
            <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" id="btn-edit-from-remarks" class="btn-primary-action" style="height: 36px; padding: 0 14px;">
                    <i class="fa-solid fa-pen-to-square"></i>
                    <span>Edit Manuscript</span>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- ====================================================================== -->
<!-- MODAL 3: Delete Draft Confirmation Modal                               -->
<!-- ====================================================================== -->
<div id="delete-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="delete-heading">
    <div class="modal-card delete-modal-card">
        <div class="delete-icon-wrapper">
            <i class="fa-solid fa-trash-can"></i>
        </div>
        <h2 id="delete-heading" class="delete-modal-title">Delete Draft Manuscript?</h2>
        <p class="delete-modal-desc">
            Are you sure you want to permanently delete <strong id="delete-article-title">this draft</strong>? This action cannot be undone.
        </p>
        <div class="delete-modal-actions">
            <button type="button" id="cancel-delete-btn" class="btn-cancel">
                <span>Keep Draft</span>
            </button>
            <button type="button" id="confirm-delete-btn" class="btn-delete-confirm">
                <span>Yes, Delete</span>
            </button>
        </div>
    </div>
</div>

<!-- Toast Notification Container -->
<div id="toast-container" class="toast-container" aria-live="polite" aria-atomic="true"></div>
@endsection

@section('extra-js')
    <script>
        window.__WRITER_ARTICLES__ = @json($articles);
    </script>
    <script src="{{ asset('js/writer-manage-my-articles.js') }}"></script>
@endsection
