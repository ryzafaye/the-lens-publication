@extends('layouts.mpc')

@section('title', 'Manage My Articles')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/executive-dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-modals.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-manage-articles.css') }}">
    <link rel="stylesheet" href="{{ asset('css/shared-manage-my-articles.css') }}">
@endpush

@section('content')
<main class="content-container">

    <!-- Page Title Section with Total Views Counter & New Article Action -->
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

            <a href="{{ route('mpc.submit-article') }}" class="btn-primary-action">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>New Article</span>
            </a>
        </div>
    </div>

    <!-- Tabs Navigation (All, Published, Pending Review, For Revision, Drafts) -->
    <div class="manage-tabs-container animate-fade-in delay-2" role="tablist" aria-label="Filter my articles">
        <button type="button" class="manage-tab-btn active" data-tab="all" role="tab" aria-selected="true">
            <i class="fa-solid fa-layer-group"></i><span>All Articles</span>
            <span id="badge-count-all" class="tab-count-badge">{{ count($articles ?? []) }}</span>
        </button>
        <button type="button" class="manage-tab-btn" data-tab="published" role="tab" aria-selected="false">
            <i class="fa-solid fa-circle-check"></i><span>Published</span>
            <span id="badge-count-published" class="tab-count-badge">{{ collect($articles ?? [])->where('status', 'Published')->count() }}</span>
        </button>
        <button type="button" class="manage-tab-btn" data-tab="pending" role="tab" aria-selected="false">
            <i class="fa-regular fa-clock"></i><span>Pending Review</span>
            <span id="badge-count-pending" class="tab-count-badge">{{ collect($articles ?? [])->where('status', 'Pending Review')->count() }}</span>
        </button>
        <button type="button" class="manage-tab-btn" data-tab="revision" role="tab" aria-selected="false">
            <i class="fa-solid fa-rotate-left"></i><span>For Revision</span>
            <span id="badge-count-revision" class="tab-count-badge">{{ collect($articles ?? [])->where('status', 'For Revision')->count() }}</span>
        </button>
        <button type="button" class="manage-tab-btn" data-tab="drafts" role="tab" aria-selected="false">
            <i class="fa-regular fa-folder-open"></i><span>Drafts</span>
            <span id="badge-count-drafts" class="tab-count-badge">{{ collect($articles ?? [])->where('status', 'Draft')->count() }}</span>
        </button>
    </div>

    <!-- Search Bar & Sort Dropdown Toolbar -->
    <div class="manage-toolbar animate-fade-in delay-2">
        
        <!-- Search Bar -->
        <div class="manage-search-shell">
            <i class="fa-solid fa-magnifying-glass search-leading-icon" aria-hidden="true"></i>
            <input 
                type="search" 
                id="executive-search-input" 
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
            <label for="executive-sort-select" class="review-sort-label">
                <i class="fa-solid fa-arrow-down-short-wide"></i>
                <span>Sort:</span>
            </label>
            <div class="sort-select-wrapper">
                <select id="executive-sort-select" class="review-sort-select" aria-label="Sort articles">
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
    <section class="writer-articles-list animate-fade-in delay-3" id="executive-manage-list" aria-label="My articles list">
        <!-- Dynamically populated by js/mpc-manage-my-articles.js -->
    </section>

    <!-- Empty State -->
    <div id="manage-empty-state" class="manage-empty-state hidden animate-fade-in delay-3" aria-live="polite">
        <div class="manage-empty-icon">
            <i class="fa-regular fa-newspaper"></i>
        </div>
        <h3 class="manage-empty-title">No articles found</h3>
        <p class="manage-empty-desc">There are no articles matching your active tab or search criteria. Try modifying your search or reset the filters.</p>
        <button type="button" id="reset-filters-btn" class="btn-reset-filters">
            <i class="fa-solid fa-rotate-left"></i>
            <span>Reset Filters</span>
        </button>
    </div>

</main>

<!-- ====================================================================== -->
<!-- MODAL 1: Full Article Viewer Modal (Executive Parity Design)           -->
<!-- ====================================================================== -->
<div id="article-viewer-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="viewer-title">
    <div class="modal-card viewer-modal-card">
        
        <div class="viewer-modal-header">
            <div class="viewer-meta-row">
                <span id="viewer-category" class="viewer-category-tag">News</span>
                <span class="viewer-dot">·</span>
                <span id="viewer-date" class="viewer-date">{{ date('M d, Y') }}</span>
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
                    <img id="viewer-author-avatar-img" src="{{ Auth::user()?->avatar_url ?? (Auth::user()?->avatar ? asset(Auth::user()->avatar) : asset('images/member-placeholder.svg')) }}" alt="Author avatar">
                </div>
                <div class="viewer-byline-text">
                    <span class="viewer-by">By <strong id="viewer-author">{{ Auth::user()?->full_name ?? 'M&PC Officer' }}</strong></span>
                </div>
            </div>

            <p id="viewer-excerpt" class="viewer-excerpt" style="display: none;"></p>

            <div id="viewer-banner-wrap" class="viewer-banner" style="display: none;">
                <img id="viewer-banner-img" src="{{ asset('images/maroon.jpg') }}" alt="Article banner">
            </div>

            <!-- Clean Story Content Paragraphs -->
            <div id="viewer-content" class="viewer-content-text"></div>

            <!-- Editorial Remarks Alert Box (Displayed if feedback is present) -->
            <div id="viewer-remarks-wrap" class="remarks-alert-box" style="display: none; margin-top: 20px;">
                <div class="remarks-alert-title">
                    <i class="fa-solid fa-comment-dots"></i>
                    <span>Editorial Feedback:</span>
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
<!-- MODAL 2: Revision Feedback Modal                                       -->
<!-- ====================================================================== -->
<div id="remarks-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="remarks-modal-title">
    <div class="modal-card viewer-modal-card" style="max-width: 540px;">
        <div class="viewer-modal-header">
            <div class="viewer-meta-row">
                <span class="viewer-category-tag" style="background-color: #fef3f2; color: #b42318; border: 1px solid #fecdca;">
                    <i class="fa-solid fa-rotate-right"></i> Revision Requested
                </span>
            </div>
            <button type="button" id="close-remarks-modal-btn" class="viewer-close-btn" aria-label="Close remarks">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <div class="viewer-modal-body" style="padding-top: 10px;">
            <h2 id="remarks-modal-title" style="font-size: 1.15rem; font-weight: 700; color: #101828; margin: 0 0 16px 0; font-family: var(--font-heading, 'Playfair Display', Georgia, serif);">
                Article Title
            </h2>
            <div style="background-color: #fef3f2; border: 1px solid #fecdca; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <div style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #b42318; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-comment-dots"></i>
                    <span>Editor-in-Chief / Section Head Note</span>
                </div>
                <p id="remarks-modal-content" style="font-size: 0.88rem; color: #344054; line-height: 1.5; margin: 0;"></p>
            </div>
        </div>
        <div class="viewer-modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" class="btn-viewer-secondary" onclick="document.getElementById('remarks-modal').classList.add('hidden')">
                <span>Close</span>
            </button>
            <a href="#" id="btn-edit-from-remarks" class="btn-primary-action" style="height: 36px; padding: 0 14px; text-decoration: none;">
                <i class="fa-solid fa-pen-to-square"></i>
                <span>Open Editor</span>
            </a>
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
@endsection

@push('scripts')
    <script>
        window.INITIAL_DATA = @json($articles ?? []);
        window.INITIAL_ARTICLES = window.INITIAL_DATA;
        window.SUBMIT_ARTICLE_URL = @json(route('mpc.submit-article'));
        window.DELETE_DRAFT_URL = @json(url('/mpc/drafts'));
    </script>
    <script src="{{ asset('js/mpc-manage-my-articles.js') }}"></script>
@endpush
