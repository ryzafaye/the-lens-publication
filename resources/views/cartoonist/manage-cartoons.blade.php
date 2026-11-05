@extends('layouts.cartoonist')

@section('title', 'Manage Cartoons')

@section('extra-css')
    <link rel="stylesheet" href="{{ asset('css/writer-dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('css/media-manage-media.css') }}">
    <link rel="stylesheet" href="{{ asset('css/cartoonist-manage-cartoons.css') }}">
@endsection

@section('content')
<!-- Main Content Area -->
<main class="content-container">

    <!-- Page Title Section (Clean Executive Header, Tight Spacing) -->
    <div class="writer-header-row animate-fade-in delay-1" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 6px;">
        <div class="writer-header-left">
            <h1 class="page-title">Manage Cartoons</h1>
        </div>

        <div class="writer-header-right">
            <a href="{{ route('cartoonist.submit-cartoon') }}" class="btn-primary-action">
                <i class="fa-solid fa-paintbrush"></i>
                <span>Submit Cartoon</span>
            </a>
        </div>
    </div>

    <!-- Tabs Navigation (All Cartoons, Pending with Head, Returned for Revision, EIC Approved, Published) -->
    <div class="manage-tabs-container animate-fade-in delay-2" role="tablist" aria-label="Filter cartoon submissions">
        <button type="button" class="manage-tab-btn active" data-filter="all" role="tab" aria-selected="true">
            <span>All Cartoons</span>
            <span id="pill-count-all" class="tab-count-badge">0</span>
        </button>
        <button type="button" class="manage-tab-btn" data-filter="pending" role="tab" aria-selected="false">
            <span><i class="fa-regular fa-clock"></i> Pending with Head</span>
            <span id="pill-count-pending" class="tab-count-badge">0</span>
        </button>
        <button type="button" class="manage-tab-btn" data-filter="returned" role="tab" aria-selected="false">
            <span><i class="fa-solid fa-triangle-exclamation"></i> Returned for Revision</span>
            <span id="pill-count-returned" class="tab-count-badge">0</span>
        </button>
        <button type="button" class="manage-tab-btn" data-filter="eic_approved" role="tab" aria-selected="false">
            <span><i class="fa-solid fa-shield-halved"></i> EIC Approved</span>
            <span id="pill-count-eic" class="tab-count-badge">0</span>
        </button>
        <button type="button" class="manage-tab-btn" data-filter="published" role="tab" aria-selected="false">
            <span><i class="fa-solid fa-globe"></i> Published</span>
            <span id="pill-count-published" class="tab-count-badge">0</span>
        </button>
    </div>

    <!-- Search Bar & Sort Dropdown Toolbar (Executive Parity) -->
    <div class="manage-toolbar animate-fade-in delay-2">
        
        <!-- Search Bar -->
        <div class="manage-search-shell">
            <i class="fa-solid fa-magnifying-glass search-leading-icon" aria-hidden="true"></i>
            <input 
                type="search" 
                id="cartoon-search-input" 
                class="manage-search-input" 
                placeholder="Search cartoons by title, connected article, or category..." 
                aria-label="Search cartoon submissions" 
                autocomplete="off"
            >
            <button type="button" id="clear-search-btn" class="clear-search-icon hidden" title="Clear search">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <!-- Sort Control -->
        <div class="review-sort-container">
            <label for="cartoon-sort-select" class="review-sort-label">
                <i class="fa-solid fa-arrow-down-short-wide"></i>
                <span>Sort:</span>
            </label>
            <div class="sort-select-wrapper">
                <select id="cartoon-sort-select" class="review-sort-select" aria-label="Sort cartoon submissions">
                    <option value="newest" selected>Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="az">Title (A–Z)</option>
                </select>
                <i class="fa-solid fa-chevron-down sort-chevron" aria-hidden="true"></i>
            </div>
        </div>

    </div>

    <!-- Dynamic Cartoons Grid (Switches to Published Archive Boxes Style on Published tab) -->
    <div class="manage-media-grid animate-fade-in delay-3" id="cartoon-grid">
        <!-- Populated dynamically by js/cartoonist-manage-cartoons.js -->
    </div>

</main>

<!-- MODAL: Inspect Cartoon Graphic Modal -->
<div id="inspect-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="modal-inspect-status">
    <div class="modal-card media-inspect-modal-card">
        <div class="viewer-modal-header" style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span id="modal-inspect-category" class="media-card-category-chip maroon-category"><i class="fa-solid fa-tag"></i> Opinion</span>
                <span id="modal-inspect-status" class="media-status-pill pending-with-head">Pending with Head</span>
            </div>
            <button type="button" id="close-inspect-modal-btn" class="modal-close-icon" aria-label="Close modal">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="modal-body" style="padding: 20px; overflow-y: auto;">
            <div class="media-inspect-preview-container">
                <img id="modal-inspect-img" src="" alt="Full Cartoon Preview" class="media-inspect-img" onerror="this.onerror=null; this.src='{{ asset('images/covers/faculty-overload-cartoon.svg') }}'">
            </div>

            <div style="margin-top: 14px;">
                <div style="display: flex; gap: 12px; font-size: 0.82rem; color: #64748b; flex-wrap: wrap;">
                    <span><i class="fa-regular fa-calendar"></i> <span id="modal-inspect-date">{{ date('M d, Y') }}</span></span>
                    <span>&bull;</span>
                    <span><i class="fa-solid fa-hard-drive"></i> <span id="modal-inspect-filesize">Standard</span></span>
                </div>

                <div id="modal-inspect-caption" style="margin-top: 8px; font-size: 0.88rem; color: #334155; font-weight: 500;">
                    <!-- Connected story title or caption -->
                </div>

                <div id="modal-inspect-remarks-box" class="media-review-note-box" style="display: none; margin-top: 14px;">
                    <strong><i class="fa-solid fa-comment-dots"></i> Desk Revision Feedback:</strong>
                    <span id="modal-inspect-remarks-text"></span>
                </div>
            </div>
        </div>

        <div class="modal-footer" style="padding: 14px 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; align-items: center; gap: 10px;">
            <button type="button" id="btn-modal-close" class="btn-secondary-action" style="padding: 8px 16px;">
                <span>Close</span>
            </button>
        </div>
    </div>
</div>

<!-- Toast Notifications Container -->
<div id="toast-container" class="toast-container"></div>
@endsection

@section('extra-js')
<script>
    window.INITIAL_DATA = @json($cartoons ?? []);
    window.INITIAL_CARTOONS = @json($cartoons ?? []);
</script>
<script src="{{ asset('js/cartoonist-manage-cartoons.js') }}"></script>
@endsection

