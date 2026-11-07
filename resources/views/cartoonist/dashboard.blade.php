@extends('layouts.cartoonist')

@section('title', 'Dashboard')

@section('extra-css')
    <link rel="stylesheet" href="{{ asset('css/writer-dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('css/media-manage-media.css') }}">
    <link rel="stylesheet" href="{{ asset('css/cartoonist-manage-cartoons.css') }}">
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
        #cartoon-recent-grid .cover-card .cover-thumb-container,
        .cover-cards-grid .cover-card .cover-thumb-container,
        #cartoon-recent-grid .media-card-preview-box,
        .manage-media-card .media-card-preview-box {
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
        #cartoon-recent-grid .cover-card .cover-thumb-img,
        .cover-cards-grid .cover-card .cover-thumb-img,
        #cartoon-recent-grid .media-card-img,
        .manage-media-card .media-card-img {
            max-width: 100% !important;
            max-height: 100% !important;
            width: auto !important;
            height: auto !important;
            object-fit: contain !important;
            border-radius: 8px !important;
            transition: transform 0.25s ease !important;
            display: block !important;
        }
        #cartoon-recent-grid .cover-card:hover .cover-thumb-img,
        .cover-cards-grid .cover-card:hover .cover-thumb-img,
        #cartoon-recent-grid .manage-media-card:hover .media-card-img {
            transform: scale(1.02) !important;
        }
        #cartoon-recent-grid .cover-card .cover-thumb-date,
        .cover-cards-grid .cover-card .cover-thumb-date {
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
<!-- Main Content Area -->
<main class="content-container">

    <!-- Greeting Header with Dual Quick Action CTAs -->
    <div class="writer-header-row animate-fade-in delay-1">
        <div class="writer-header-left">
            <h1 class="writer-greeting" id="cartoonist-greeting-heading">
                Welcome back, <span id="cartoonist-name-display" class="writer-name-highlight">{{ Auth::user()->first_name ?? (explode(' ', Auth::user()->full_name)[0] ?? 'Cartoonist') }}</span>
            </h1>
        </div>

        <div class="writer-header-right" style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="{{ route('cartoonist.submit-cartoon') }}" class="btn-maroon-action">
                <i class="fa-solid fa-paintbrush"></i>
                <span>Submit Cartoon</span>
            </a>
            <a href="{{ route('cartoonist.submit-article') }}" class="btn-maroon-action">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>New Article</span>
            </a>
        </div>
    </div>

    <!-- Metrics Row (Exact Copy of Executive Card Architecture) -->
    <section class="metrics-grid animate-fade-in delay-2" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); margin-bottom: 28px;" aria-label="Operational metrics">
        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-label">Total Cartoons Published</span>
                <div class="metric-icon-box">
                    <i class="fa-solid fa-globe"></i>
                </div>
            </div>
            <div class="metric-value" id="stat-cartoons-published">{{ $metrics['published'] ?? 0 }}</div>
            <div class="metric-subtitle">Live across campus &amp; digital portals</div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-label">Total Pending Approvals</span>
                <div class="metric-icon-box">
                    <i class="fa-regular fa-clock"></i>
                </div>
            </div>
            <div class="metric-value" id="stat-pending-approvals">{{ $metrics['pending'] ?? 0 }}</div>
            <div class="metric-subtitle">Awaiting editorial verification</div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-label">Total in Cartoon Library</span>
                <div class="metric-icon-box">
                    <i class="fa-solid fa-palette"></i>
                </div>
            </div>
            <div class="metric-value" id="stat-cartoons-library">{{ $metrics['library'] ?? 0 }}</div>
            <div class="metric-subtitle">EIC Approved &amp; Published illustrations</div>
        </div>
    </section>

    @php
        $isSectionHead = in_array(Auth::user()?->role?->role_name, ['Cartoonist Head', 'Associate Cartoonist Head', 'Chief Cartoonist']);
    @endphp

    <!-- SECTION: PENDING APPROVAL (FOR HEAD) OR MY RECENT CARTOONS (FOR CARTOONIST) -->
    <div class="writer-section-header animate-fade-in delay-3" style="margin-top: 16px;">
        <div class="section-title-wrap">
            <h2 class="writer-section-title" id="dashboard-cartoons-section-title">
                {{ $isSectionHead ? 'Pending Approval' : 'My Recent Cartoons' }}
            </h2>
        </div>

        <a href="{{ $isSectionHead ? route('cartoonist.cartoon-desk') : route('cartoonist.manage-cartoons') }}" class="view-all-link" id="dashboard-manage-cartoons-link">
            <span>Manage all cartoons</span>
            <i class="fa-solid fa-arrow-right"></i>
        </a>
    </div>

    <section class="{{ $isSectionHead ? 'cover-cards-grid' : 'manage-media-grid' }} animate-fade-in delay-4" id="cartoon-recent-grid" aria-label="{{ $isSectionHead ? 'Pending cartoon approvals' : 'Recent cartoon submissions' }}">
        <!-- Populated dynamically by js/cartoonist-dashboard.js or controller -->
    </section>

</main>

<!-- ====================================================================== -->
<!-- MODAL: Theater Artwork Inspection Modal (Cartoon Desk Parity)          -->
<!-- ====================================================================== -->
<div id="cover-inspect-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="inspect-artist">
    <div class="modal-card cover-inspect-modal-card">
        
        <div class="cover-inspect-header">
            <div class="cover-inspect-header-left">
                <span id="inspect-type-tag" class="cover-type-tag cartoon">
                    <i class="fa-solid fa-palette"></i> CARTOON
                </span>
                <div class="cover-inspect-artist-row">
                    <span>Cartoonist: <strong id="inspect-artist">Staff Cartoonist</strong></span>
                </div>
            </div>
            <div class="cover-inspect-header-right">
                <button type="button" id="close-inspect-btn" class="cover-modal-close-btn" aria-label="Close artwork inspector">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>

        <div class="cover-inspect-theater">
            <img id="inspect-image" src="" alt="Publication Artwork Full View" class="cover-inspect-image-fullscreen" onerror="this.onerror=null; this.src='{{ asset('images/covers/faculty-overload-cartoon.svg') }}'">
        </div>

        <div class="cover-inspect-footer-bar" style="justify-content: flex-end;">
            <div class="inspect-footer-buttons">
                @if($isSectionHead)
                <button type="button" id="inspect-return-btn" class="btn-inspect-return">
                    <i class="fa-solid fa-rotate-left"></i>
                    <span>Return for Revision</span>
                </button>
                <button type="button" id="inspect-approve-btn" class="btn-inspect-approve">
                    <i class="fa-solid fa-check"></i>
                    <span>Endorse to EIC</span>
                </button>
                @endif
                <a href="{{ $isSectionHead ? route('cartoonist.cartoon-desk') : route('cartoonist.manage-cartoons') }}" id="modal-open-manage-btn" class="btn-maroon-action" style="font-size: 0.82rem; padding: 8px 16px;">
                    <i class="fa-solid {{ $isSectionHead ? 'fa-table-cells-large' : 'fa-palette' }}"></i>
                    <span>{{ $isSectionHead ? 'Open in Cartoon Desk' : 'Open in Manage Cartoons' }}</span>
                </a>
            </div>
        </div>

    </div>
</div>

<!-- Return for Revision Remarks Modal -->
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

@section('extra-js')
<script>
    window.INITIAL_DATA = @json($cartoons ?? []);
    window.INITIAL_CARTOONS = @json($cartoons ?? []);
    window.CARTOONIST_DESK_ROUTE = "{{ route('cartoonist.cartoon-desk') }}";
    window.CARTOONIST_MANAGE_ROUTE = "{{ route('cartoonist.manage-cartoons') }}";
</script>
<script src="{{ asset('js/cartoon-data.js') }}"></script>
<script src="{{ asset('js/cartoonist-dashboard.js') }}"></script>
@endsection

