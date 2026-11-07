@extends('layouts.cartoonist')

@section('title', 'Cartoon Desk')

@section('extra-css')
    <link rel="stylesheet" href="{{ asset('css/executive-dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-cover-review.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-modals.css') }}">
    <link rel="stylesheet" href="{{ asset('css/mpc-media-desk.css') }}">
    <style>
        .cover-inspect-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
        }
        .cover-inspect-header-left {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 12px !important;
            flex-wrap: wrap !important;
        }
        .cover-inspect-artist-row {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            margin: 0 !important;
            font-size: 0.88rem !important;
            color: #475467 !important;
        }
        .cover-type-tag.cartoon,
        #inspect-type-tag.cover-type-tag.cartoon {
            background: rgba(15, 23, 42, 0.90) !important;
            color: #f472b6 !important;
            border: 1px solid rgba(244, 114, 182, 0.3) !important;
            font-size: 0.68rem !important;
            font-weight: 700 !important;
            padding: 3px 8px !important;
            border-radius: 4px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.04em !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 4px !important;
        }

        /* Snug bounded thumbnail display (Old Style - contain, light background #f8fafc, padding 10px) */
        #cover-cards-grid .cover-card .cover-thumb-container,
        .cover-cards-grid .cover-card .cover-thumb-container {
            height: 190px !important;
            background: #f8fafc !important;
            border-bottom: 1px solid #f1f5f9 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 10px !important;
            position: relative !important;
            overflow: hidden !important;
        }
        #cover-cards-grid .cover-card .cover-thumb-img,
        .cover-cards-grid .cover-card .cover-thumb-img {
            max-width: 100% !important;
            max-height: 100% !important;
            width: auto !important;
            height: auto !important;
            object-fit: contain !important;
            border-radius: 8px !important;
            transition: transform 0.25s ease !important;
            display: block !important;
        }
        #cover-cards-grid .cover-card:hover .cover-thumb-img,
        .cover-cards-grid .cover-card:hover .cover-thumb-img {
            transform: scale(1.02) !important;
        }
        #cover-cards-grid .cover-card .cover-thumb-date {
            background: rgba(255, 255, 255, 0.90) !important;
            color: #475467 !important;
            padding: 2px 7px !important;
            border-radius: 4px !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
            font-size: 0.68rem !important;
            font-weight: 600 !important;
        }
    </style>
@endsection

@section('content')
<main class="content-container">

    <!-- Top Header & Tabs Section -->
    <div class="cover-page-header-section animate-fade-in delay-1">
        <div class="cover-header-row page-header-row">
            <h1 class="cover-page-title page-title">Cartoon Desk</h1>

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
    </div>

    <!-- Responsive Artwork Cards Grid -->
    <div id="cover-cards-grid" class="cover-cards-grid"></div>

    <!-- Empty Queue State -->
    <div id="cover-empty-state" class="cover-empty-state" style="display: none;">
        <div class="empty-state-icon-circle">
            <i class="fa-solid fa-palette"></i>
        </div>
        <h3>All Caught Up on Cartoon Reviews</h3>
    </div>

</main>

<!-- ====================================================================== -->
<!-- MODAL 1: Theater Artwork Inspection Modal                              -->
<!-- ====================================================================== -->
<div id="cover-inspect-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="inspect-artist">
    <div class="modal-card cover-inspect-modal-card">
        
        <div class="cover-inspect-header">
            <div class="cover-inspect-header-left">
                <span id="inspect-type-tag" class="cover-type-tag cartoon">
                    <i class="fa-solid fa-palette"></i> CARTOON
                </span>
                <div class="cover-inspect-artist-row">
                    <span>Cartoonist: <strong id="inspect-artist">Cartoonist Name</strong></span>
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

        <div class="cover-inspect-footer-bar" style="justify-content: flex-end;">
            <div class="inspect-footer-buttons">
                <button type="button" id="inspect-return-btn" class="btn-inspect-return">
                    <i class="fa-solid fa-rotate-left"></i>
                    <span>Return to Cartoonist</span>
                </button>
                <button type="button" id="inspect-approve-btn" class="btn-inspect-approve">
                    <i class="fa-solid fa-check"></i>
                    <span>Endorse to EIC</span>
                </button>
            </div>
        </div>

    </div>
</div>

<!-- ====================================================================== -->
<!-- MODAL 2: Mandatory Return to Cartoonist Revision Modal                 -->
<!-- ====================================================================== -->
<div id="return-remarks-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="return-head-name">
    <div class="modal-card return-modal-card">
        
        <div class="return-modal-header">
            <div class="return-modal-header-left">
                <div class="return-modal-header-titles">
                    <span class="return-modal-badge">
                        <i class="fa-solid fa-rotate-left"></i>
                        <span>Return for Revision</span>
                    </span>
                    <h2 class="return-modal-title">Return Artwork to Cartoonist</h2>
                </div>
            </div>
            <div class="return-modal-header-right">
                <button type="button" id="close-return-modal-btn" class="return-modal-close-btn" aria-label="Close revision modal">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>

        <div class="return-modal-body">
            <div class="revision-banner">
                <div class="revision-banner-avatar">
                    <i class="fa-solid fa-user-pen"></i>
                </div>
                <div class="revision-banner-info">
                    <div class="revision-banner-label">Returning to Staff Cartoonist</div>
                    <div id="return-head-name" class="revision-banner-head">Staff Cartoonist</div>
                </div>
            </div>

            <div class="return-remarks-section">
                <div class="return-remarks-label-row">
                    <label for="return-remarks-text" class="return-remarks-label-text">
                        <i class="fa-solid fa-comment-dots"></i>
                        <span>Mandatory Revision Remarks:</span>
                    </label>
                    <span class="required-badge">Required</span>
                </div>
                <textarea id="return-remarks-text" class="return-remarks-textarea" placeholder="Provide specific visual adjustment guidance for the cartoonist before returning this artwork..."></textarea>
                <div id="return-remarks-error" class="return-remarks-error hidden">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>Revision remarks are required. You cannot return without remarks.</span>
                </div>
            </div>
        </div>

        <div class="return-modal-footer">
            <button type="button" id="cancel-return-btn" class="btn-modal-cancel">
                <span>Cancel</span>
            </button>
            <button type="button" id="confirm-return-btn" class="btn-revision-confirm">
                <i class="fa-solid fa-rotate-left"></i>
                <span>Confirm Return to Cartoonist</span>
            </button>
        </div>

    </div>
</div>

<!-- Clean Success Notification Toast Container -->
<div id="toast-container" class="toast-container" aria-live="polite"></div>
@endsection

@push('scripts')
    <script>
        window.INITIAL_DATA = @json($pendingCartoons ?? []);
    </script>
    <script src="{{ asset('js/cartoonist-head-media-desk.js') }}"></script>
@endpush

