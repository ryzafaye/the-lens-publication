@extends('layouts.cartoonist')

@section('title', 'Dashboard')

@section('extra-css')
    <link rel="stylesheet" href="{{ asset('css/writer-dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('css/media-manage-media.css') }}">
    <link rel="stylesheet" href="{{ asset('css/cartoonist-manage-cartoons.css') }}">
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

    <!-- SECTION: MY RECENT CARTOONS -->
    <div class="writer-section-header animate-fade-in delay-3" style="margin-top: 16px;">
        <div class="section-title-wrap">
            <h2 class="writer-section-title">My Recent Cartoons</h2>
        </div>

        <a href="{{ route('cartoonist.manage-cartoons') }}" class="view-all-link">
            <span>Manage all cartoons</span>
            <i class="fa-solid fa-arrow-right"></i>
        </a>
    </div>

    <section class="manage-media-grid animate-fade-in delay-4" id="cartoon-recent-grid" aria-label="Recent cartoon submissions">
        <!-- Populated dynamically by js/cartoonist-dashboard.js or controller -->
    </section>

</main>

<!-- Full Cartoon Inspect Modal -->
<div id="cartoon-inspect-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="modal-inspect-status">
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
                </div>

                <div id="modal-inspect-remarks-box" class="media-review-note-box" style="display: none; margin-top: 14px;">
                    <strong><i class="fa-solid fa-comment-dots"></i> Desk Revision Feedback:</strong>
                    <span id="modal-inspect-remarks-text"></span>
                </div>
            </div>
        </div>

        <div class="modal-footer" style="padding: 14px 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; align-items: center; gap: 10px;">
            <a href="{{ route('cartoonist.manage-cartoons') }}" class="btn-maroon-action" style="font-size: 0.82rem; padding: 8px 16px;">
                <i class="fa-solid fa-palette"></i>
                <span>Open in Manage Cartoons</span>
            </a>
        </div>
    </div>
</div>
@endsection

@section('extra-js')
<script>
    window.INITIAL_DATA = @json($cartoons ?? []);
    window.INITIAL_CARTOONS = @json($cartoons ?? []);
</script>
<script src="{{ asset('js/cartoonist-dashboard.js') }}"></script>
@endsection

