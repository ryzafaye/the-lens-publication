@extends('layouts.mpc')

@section('title', 'Media Desk')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/executive-dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-modals.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-manage-articles.css') }}">
    <link rel="stylesheet" href="{{ asset('css/mpc-media-desk.css') }}">
@endpush

@section('content')
<main class="content-container">

    <!-- Top Header & Tabs Section -->
    <div class="cover-page-header-section animate-fade-in delay-1">
        <div class="cover-header-row page-header-row">
            <h1 class="cover-page-title page-title">Media Desk</h1>

            <!-- Sort Dropdown -->
            <div class="review-sort-container cover-sort-container">
                <label for="cover-sort-select" class="review-sort-label cover-sort-label">
                    <i class="fa-solid fa-arrow-down-wide-short"></i>
                    <span>Sort:</span>
                </label>
                <div class="sort-select-wrapper">
                    <select id="cover-sort-select" class="review-sort-select cover-sort-select" aria-label="Sort pending artwork by date">
                        <option value="newest" selected>Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                    <i class="fa-solid fa-chevron-down sort-chevron" aria-hidden="true"></i>
                </div>
            </div>
        </div>

        <!-- Media Desk Tabs: PUBMAT, PHOTOS, CARTOON, and LIBRARY -->
        <div class="cover-tabs-container manage-tabs-container" role="tablist" aria-label="Media Desk Tabs">
            <button type="button" class="review-tab-btn manage-tab-btn active" data-tab="pubmat" id="tab-cover-pubmat" role="tab" aria-selected="true">
                <i class="fa-solid fa-palette"></i>
                <span>PUBMAT</span>
                <span id="badge-cover-pubmat" class="review-tab-badge tab-count-badge">0</span>
            </button>
            <button type="button" class="review-tab-btn manage-tab-btn" data-tab="photo" id="tab-cover-photo" role="tab" aria-selected="false">
                <i class="fa-solid fa-camera"></i>
                <span>PHOTOS</span>
                <span id="badge-cover-photo" class="review-tab-badge tab-count-badge">0</span>
            </button>
            <button type="button" class="review-tab-btn manage-tab-btn" data-tab="cartoon" id="tab-cover-cartoon" role="tab" aria-selected="false">
                <i class="fa-solid fa-pen-nib"></i>
                <span>CARTOON</span>
                <span id="badge-cover-cartoon" class="review-tab-badge tab-count-badge">0</span>
            </button>
            <button type="button" class="review-tab-btn manage-tab-btn" data-tab="library" id="tab-cover-library" role="tab" aria-selected="false">
                <i class="fa-solid fa-photo-film"></i>
                <span>LIBRARY</span>
                <span id="badge-cover-library" class="review-tab-badge tab-count-badge">0</span>
            </button>
        </div>
    </div>

    <!-- Responsive Artwork Cards Grid -->
    <div id="cover-cards-grid" class="cover-cards-grid"></div>

    <!-- Empty Queue State -->
    <div id="cover-empty-state" class="cover-empty-state mpc-tab-empty-state" style="display: none;">
        <div class="empty-state-icon-circle">
            <i class="fa-solid fa-palette" id="cover-empty-icon"></i>
        </div>
        <h3 id="cover-empty-title">All Caught Up on PUBMAT Reviews</h3>
    </div>

</main>

<!-- Modal 1: Full-Size Theater Artwork Inspection Modal -->
<div id="cover-inspect-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="inspect-artist">
    <div class="modal-card cover-inspect-modal-card">
        <div class="cover-inspect-header">
            <div class="cover-inspect-header-left">
                <span id="inspect-type-tag" class="cover-type-tag pubmat">PUBMAT</span>
                <div class="cover-inspect-artist-row">
                    <i class="fa-solid fa-paintbrush" aria-hidden="true"></i>
                    <span>Artist: <strong id="inspect-artist">Artist Name</strong></span>
                </div>
            </div>
            <div class="cover-inspect-header-right">
                <button type="button" id="close-inspect-btn" class="cover-modal-close-btn" aria-label="Close artwork inspector">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>

        <div class="cover-inspect-theater">
            <img id="inspect-image" src="" alt="Publication Artwork Full View" class="cover-inspect-image-fullscreen">
        </div>

        <div class="cover-inspect-footer-bar">
            <div class="inspect-endorsement-note">
                <i class="fa-solid fa-circle-check"></i>
                <span>Approved by: <strong id="inspect-head">Section Head</strong></span>
            </div>
            <div class="inspect-footer-buttons">
                <button type="button" id="inspect-return-btn" class="btn-inspect-return">
                    <i class="fa-solid fa-rotate-left"></i>
                    <span>Return to Head</span>
                </button>
                <button type="button" id="inspect-approve-btn" class="btn-inspect-approve">
                    <i class="fa-solid fa-check"></i>
                    <span>Approve for Library</span>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Modal 2: Return Artwork to Section Head Modal -->
<div id="cover-return-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="return-modal-title">
    <div class="modal-card cover-return-modal-card">
        <div class="cover-inspect-header">
            <div class="cover-inspect-header-left">
                <h2 id="return-modal-title" class="cover-modal-title">Return Artwork for Revision</h2>
            </div>
            <button type="button" id="close-return-modal-btn" class="cover-modal-close-btn" aria-label="Close return modal">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="cover-return-body">
            <div class="revision-author-banner">
                <div id="return-head-name" class="revision-banner-head">{{ Auth::user()?->full_name ?? 'Media Head' }} ({{ Auth::user()?->role?->role_name ?? 'Media and Public Communications Head' }})</div>
            </div>
            <div class="form-group" style="margin-top: 16px;">
                <label for="return-remarks-input" class="form-label" style="font-weight: 600; font-size: 0.85rem; color: #344054;">
                    Instructions / Notes for Revision:
                </label>
                <textarea id="return-remarks-input" class="form-textarea" rows="4" placeholder="Detail any requested adjustments (e.g., color corrections, typography adjustments, resolution issues)..." style="width: 100%; border: 1px solid #d0d5dd; border-radius: 8px; padding: 10px 12px; font-family: inherit; font-size: 0.85rem;"></textarea>
                <div id="return-remarks-error" class="form-error-msg hidden" style="color: #d92d20; font-size: 0.78rem; margin-top: 6px;">Please provide instructions for the artist/head before returning.</div>
            </div>
        </div>

        <div class="cover-inspect-footer-bar">
            <button type="button" id="cancel-return-btn" class="btn-modal-cancel">
                <span>Cancel</span>
            </button>
            <button type="button" id="confirm-return-btn" class="btn-inspect-return">
                <i class="fa-solid fa-paper-plane"></i>
                <span>Send Revision Request</span>
            </button>
        </div>
    </div>
</div>

<!-- Toast Container -->
<div id="toast-container" class="toast-container"></div>
@endsection

@push('scripts')
    <script>
        window.INITIAL_DATA = @json($coverList ?? []);
    </script>
    <script src="{{ asset('js/mpc-media-desk.js') }}"></script>
@endpush

