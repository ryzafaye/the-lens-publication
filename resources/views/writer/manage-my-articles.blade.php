@extends('layouts.writer')

@section('title', 'Manage My Articles')

@section('extra-css')
    <link rel="stylesheet" href="{{ asset('css/manage-my-articles.css') }}">
@endsection

@section('content')
<main class="content-container">

    <!-- Page Title Section -->
    <div class="writer-header-row animate-fade-in delay-1">
        <div class="writer-header-left">
            <h1 class="page-title">Manage My Articles</h1>
        </div>

        <div class="writer-header-right">
            <a href="{{ route('writer.submit-article') }}" class="btn-primary-action">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>New Article</span>
            </a>
        </div>
    </div>

    <!-- Tabs Navigation (All, Published, Pending, Revision, Drafts) -->
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
<!-- MODAL 1: Full Article Viewer Modal (Executive Parity Design)             -->
<!-- ====================================================================== -->
<div id="article-viewer-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="viewer-title">
    <div class="modal-card viewer-modal-card">
        
        <!-- Header matching Executive Viewer -->
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

        <!-- Body matching Executive Viewer -->
        <div class="viewer-modal-body">
            <h1 id="viewer-title" class="viewer-title">Article Title</h1>
            
            <div class="viewer-byline-row">
                <div class="viewer-author-avatar">
                    <img id="viewer-author-avatar-img" src="{{ asset('images/member-placeholder.svg') }}" alt="Author avatar">
                </div>
                <div class="viewer-byline-text">
                    <span class="viewer-by">By <strong id="viewer-author">{{ Auth::user()->full_name }}</strong></span>
                </div>
            </div>

            <p id="viewer-excerpt" class="viewer-excerpt" style="display: none;"></p>

            <div id="viewer-banner-wrap" class="viewer-banner" style="display: none;">
                <img id="viewer-banner-img" src="{{ asset('images/maroon.jpg') }}" alt="Article banner">
            </div>

            <div id="viewer-content" class="viewer-content-text">
                <!-- Paragraphs populated dynamically -->
            </div>

            <!-- Section Head Remarks Box (for articles with revision feedback) -->
            <div id="viewer-remarks-wrap" class="remarks-alert-box" style="display: none; margin-top: 20px;">
                <div class="remarks-alert-title">
                    <i class="fa-solid fa-comment-dots"></i>
                    <span>Section Head Feedback:</span>
                </div>
                <p id="viewer-remarks-text" class="remarks-alert-text"></p>
            </div>

            <!-- Views & Shares Stats Bar (Visible ONLY if article is Published) -->
            <div id="viewer-stats-bar" class="viewer-stats-bar" style="display: none;">
                <span class="stat-pill"><i class="fa-regular fa-eye"></i> <span id="viewer-views">0</span></span>
                <span class="stat-pill"><i class="fa-solid fa-share-nodes"></i> <span id="viewer-shares">0</span></span>
            </div>
        </div>

    </div>
</div>

<!-- ====================================================================== -->
<!-- MODAL 2: Revision Remarks Dedicated Modal                              -->
<!-- ====================================================================== -->
<div id="remarks-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="remarks-modal-title">
    <div class="modal-card" style="max-width: 560px;">
        <div class="manuscript-header">
            <span class="status-badge status-revision">Revision Feedback</span>
            <button type="button" id="close-remarks-modal-btn" class="viewer-close-btn" aria-label="Close revision modal">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <div class="manuscript-body" style="padding: 24px;">
            <h3 id="remarks-modal-title" style="font-size: 1.15rem; font-weight: 700; color: #101828; margin: 0 0 12px 0;">Article Title</h3>
            <div class="remarks-alert-box" style="margin-top: 0;">
                <div class="remarks-alert-title">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>Section Head Feedback:</span>
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

