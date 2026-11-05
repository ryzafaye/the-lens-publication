@php
    $portalLayout = 'layouts.mpc-head';
    if (request()->is('executive*')) {
        $portalLayout = 'layouts.executive';
    } elseif (request()->is('eic*')) {
        $portalLayout = 'layouts.eic';
    }
@endphp

@extends($portalLayout)

@section('title', 'Publish Article')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/mpc-publish-article.css') }}">
@endpush

@section('content')
<!-- Main Content Area -->
<main class="content-container">

    <!-- Top Section: Header with Title and Sort Control -->
    <div class="page-title-section animate-fade-in delay-1">
        <div class="page-header-row">
            <h1 class="page-title">Publish Article</h1>

            <!-- Search & Sort Controls Lockup -->
            <div class="publish-controls-group">
                <!-- Compact Search Bar (not too long) -->
                <div class="compact-search-box">
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input type="text" id="mpc-search-input" class="compact-search-input" placeholder="Search articles..." aria-label="Search articles">
                </div>

                <!-- Sort Control -->
                <div class="review-sort-container">
                    <label for="mpc-sort-select" class="review-sort-label">
                        <i class="fa-solid fa-arrow-down-wide-short"></i>
                        <span>Sort:</span>
                    </label>
                    <div class="sort-select-wrapper">
                        <select id="mpc-sort-select" class="review-sort-select" aria-label="Sort articles">
                            <option value="newest" selected>Newest Approved</option>
                            <option value="oldest">Oldest Approved</option>
                        </select>
                        <i class="fa-solid fa-chevron-down sort-chevron" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Category Filter Pills (Moved upper, directly above the view tabs) -->
        <div class="mpc-filters-bar" id="mpc-category-filters-bar">
            <div class="mpc-category-pills">
                <button type="button" class="mpc-category-pill active" data-category="all">All Categories</button>
                <button type="button" class="mpc-category-pill" data-category="news">News</button>
                <button type="button" class="mpc-category-pill" data-category="opinion">Opinion</button>
                <button type="button" class="mpc-category-pill" data-category="features">Features</button>
                <button type="button" class="mpc-category-pill" data-category="scitech">Science and Technology</button>
                <button type="button" class="mpc-category-pill" data-category="literature">Literature</button>
            </div>
        </div>

        <!-- Primary View Tabs (Ready to Publish | Published | Unpublished | Covers Library) -->
        <div class="mpc-view-tabs" role="tablist">
            <button type="button" class="mpc-view-tab-btn active" data-view="ready" role="tab" aria-selected="true">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>Ready to Publish</span>
                <span id="badge-tab-ready" class="mpc-tab-count-pill">0</span>
            </button>
            <button type="button" class="mpc-view-tab-btn" data-view="published" role="tab" aria-selected="false">
                <i class="fa-solid fa-globe"></i>
                <span>Published Articles</span>
                <span id="badge-tab-published" class="mpc-tab-count-pill">0</span>
            </button>
            <button type="button" class="mpc-view-tab-btn" data-view="unpublished" role="tab" aria-selected="false">
                <i class="fa-solid fa-box-archive"></i>
                <span>Unpublished</span>
                <span id="badge-tab-unpublished" class="mpc-tab-count-pill">0</span>
            </button>
            <button type="button" class="mpc-view-tab-btn" data-view="covers" role="tab" aria-selected="false">
                <i class="fa-regular fa-image"></i>
                <span>Approved Covers Library</span>
                <span id="badge-tab-covers" class="mpc-tab-count-pill">0</span>
            </button>
        </div>
    </div>

    <!-- Articles Queue Grid -->
    <div id="mpc-articles-grid" class="mpc-articles-grid">
        <!-- Dynamically populated by js/mpc-publish-article.js -->
    </div>

    <!-- Covers Library Gallery View (Hidden by default) -->
    <div id="mpc-covers-library-view" style="display: none;">
        <div class="page-header-row" style="margin-bottom: 14px;">
            <div>
                <h2 style="font-size: 1.15rem; font-weight: 700; color: #101828; font-family: var(--font-heading);">Approved Artwork &amp; Cartoon Library</h2>
                <p style="font-size: 0.80rem; color: #667085;">These visual assets have been fully endorsed by Section Heads and Executive/EIC for release to M&amp;PC.</p>
            </div>
        </div>
        <div id="mpc-covers-library-grid" class="mpc-gallery-grid">
            <!-- Populated dynamically -->
        </div>
    </div>

    <!-- Empty State -->
    <div id="mpc-empty-state" class="cover-empty-state" style="display: none; margin-top: 20px;">
        <i class="fa-regular fa-circle-check"></i>
        <h3>All Caught Up</h3>
        <p>No articles currently pending in this queue.</p>
    </div>

</main>

<!-- ====================================================================== -->
<!-- MODAL 1: Assign Cover Selection Modal                                  -->
<!-- ====================================================================== -->
<div id="assign-cover-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="modal-cover-title">
    <div class="modal-card mpc-cover-modal-card">
        
        <div class="mpc-modal-header">
            <div class="mpc-modal-header-left">
                <h2 id="modal-cover-title" class="mpc-modal-title">Select Article Cover</h2>
                <div class="mpc-modal-sub">Choose from approved visual materials for: <strong id="modal-target-article-title">Article</strong></div>
            </div>
            <button type="button" id="close-cover-modal-btn" class="cover-modal-close-btn" aria-label="Close modal">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="mpc-cover-gallery-body">
            
            <div class="mpc-modal-filter-row">
                <div class="mpc-modal-pills">
                    <button type="button" class="mpc-modal-pill active" data-cover-type="all">All Formats</button>
                    <button type="button" class="mpc-modal-pill" data-cover-type="pubmat">PUBMAT</button>
                    <button type="button" class="mpc-modal-pill" data-cover-type="cartoon">CARTOON</button>
                </div>
                <span style="font-size: 0.76rem; color: #667085;">Click an artwork to select</span>
            </div>

            <!-- Gallery Items -->
            <div id="modal-cover-gallery" class="mpc-gallery-grid">
                <!-- Populated dynamically -->
            </div>

        </div>

        <div class="mpc-modal-footer">
            <button type="button" id="cancel-cover-modal-btn" class="btn-modal-cancel">
                <span>Cancel</span>
            </button>
            <button type="button" id="confirm-cover-modal-btn" class="btn-inspect-approve">
                <i class="fa-solid fa-check"></i>
                <span>Confirm &amp; Attach Cover</span>
            </button>
        </div>

    </div>
</div>

<!-- ====================================================================== -->
<!-- MODAL 2: Full Manuscript Reading Modal                                 -->
<!-- ====================================================================== -->
<div id="manuscript-viewer-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="reader-title">
    <div class="modal-card viewer-modal-card">
        
        <div class="viewer-modal-header">
            <div class="viewer-meta-row">
                <span id="reader-category" class="viewer-category-tag">CATEGORY</span>
                <span class="viewer-dot">&bull;</span>
                <span id="reader-date" class="viewer-date">Approved Date</span>
            </div>
            <div class="viewer-header-right">
                <button type="button" id="close-reader-btn" class="viewer-close-btn" aria-label="Close reader">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>

        <div class="viewer-modal-body">
            <h1 id="reader-title" class="viewer-title">Article Title</h1>
            <div class="viewer-byline-row">
                <i class="fa-solid fa-pen-nib" style="color: #7a1f2e; font-size: 0.85rem;"></i>
                <span style="font-size: 0.85rem; color: #475467;">By: <strong id="reader-author" style="color: #101828;">Author Name</strong></span>
            </div>
            <div id="reader-body" class="manuscript-prose" style="font-size: 0.95rem; line-height: 1.7; color: #344054;">
                <!-- Body content -->
            </div>
        </div>

    </div>
</div>

<!-- Toast Notification Container -->
<div id="toast-container" class="toast-container" aria-live="polite"></div>
@endsection

@push('scripts')
<script>
    window.LARAVEL_MPC_ARTICLES = @json($articles, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);
    window.LARAVEL_APPROVED_COVERS = @json($availableCovers, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);
</script>
<script src="{{ asset('js/mpc-publish-article.js') }}"></script>
@endpush
