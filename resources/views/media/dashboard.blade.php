@extends('layouts.media')

@section('title', 'Dashboard')

@section('extra-css')
    <link rel="stylesheet" href="{{ asset('css/writer-dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('css/media-manage-media.css') }}">
@endsection

@section('content')
<!-- Main Content Area -->
<main class="content-container">

    <!-- Greeting Header with Dual Quick Action CTAs -->
    <div class="writer-header-row animate-fade-in delay-1">
        <div class="writer-header-left">
            <h1 class="writer-greeting" id="media-greeting-heading">
                Welcome back, <span id="media-name-display" class="writer-name-highlight">{{ explode(' ', Auth::user()?->full_name ?? 'Media Team')[0] }}</span>
            </h1>
        </div>

        <div class="writer-header-right" style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="{{ route('media.submit-media') }}" class="btn-maroon-action">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <span>Submit PUBMAT</span>
            </a>
            <a href="{{ route('media.submit-article') }}" class="btn-maroon-action">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>New Article</span>
            </a>
        </div>
    </div>

    <!-- Metrics Row (Exact Copy of Executive Card Architecture) -->
    <section class="metrics-grid animate-fade-in delay-2" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); margin-bottom: 28px;" aria-label="Operational metrics">
        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-label">Total PUBMATs Published</span>
                <div class="metric-icon-box">
                    <i class="fa-solid fa-globe"></i>
                </div>
            </div>
            <div class="metric-value" id="stat-pubmats-published">0</div>
            <div class="metric-subtitle">Live across campus &amp; digital portals</div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-label">Total Pending Approvals</span>
                <div class="metric-icon-box">
                    <i class="fa-regular fa-clock"></i>
                </div>
            </div>
            <div class="metric-value" id="stat-pending-approvals">0</div>
            <div class="metric-subtitle">Awaiting editorial verification</div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-label">Total in Media Library</span>
                <div class="metric-icon-box">
                    <i class="fa-solid fa-images"></i>
                </div>
            </div>
            <div class="metric-value" id="stat-media-library">0</div>
            <div class="metric-subtitle">EIC Approved &amp; Published assets</div>
        </div>
    </section>

    <!-- SECTION: MY RECENT MEDIA -->
    <div class="writer-section-header animate-fade-in delay-3" style="margin-top: 16px;">
        <div class="section-title-wrap">
            <h2 class="writer-section-title">My Recent Media</h2>
        </div>

        <a href="{{ route('media.manage-media') }}" class="view-all-link">
            <span>Manage all media</span>
            <i class="fa-solid fa-arrow-right"></i>
        </a>
    </div>

    <section class="manage-media-grid animate-fade-in delay-4" id="media-recent-grid" aria-label="Recent media submissions">
        <!-- Populated dynamically by js/media-dashboard.js -->
    </section>

</main>

<!-- ====================================================================== -->
<!-- MODAL: Full Media Inspect Modal                                        -->
<!-- ====================================================================== -->
<div id="media-inspect-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="modal-inspect-status">
    <div class="modal-card media-inspect-modal-card">
        <div class="viewer-modal-header" style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span id="modal-inspect-status" class="media-status-pill pending-with-head">Pending with Head</span>
            </div>
            <button type="button" id="close-inspect-modal-btn" class="modal-close-icon" aria-label="Close modal">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="modal-body" style="padding: 20px; overflow-y: auto;">
            <div class="media-inspect-preview-container">
                <img id="modal-inspect-img" src="" alt="Full Graphic Preview" class="media-inspect-img" onerror="this.onerror=null; this.src='{{ asset('images/covers/portal-pubmat.svg') }}'">
            </div>

            <div style="margin-top: 14px;">
                <div style="display: flex; gap: 12px; font-size: 0.82rem; color: #64748b; flex-wrap: wrap;">
                    <span><i class="fa-regular fa-calendar"></i> <span id="modal-inspect-date">Oct 24, 2026</span></span>
                </div>

                <div id="modal-inspect-remarks-box" class="media-review-note-box" style="display: none; margin-top: 14px;">
                    <strong><i class="fa-solid fa-comment-dots"></i> Desk Revision Feedback:</strong>
                    <span id="modal-inspect-remarks-text"></span>
                </div>
            </div>
        </div>

        <div class="modal-footer" style="padding: 14px 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; align-items: center; gap: 10px;">
            <a href="{{ route('media.manage-media') }}" class="btn-maroon-action" style="font-size: 0.82rem; padding: 8px 16px;">
                <i class="fa-solid fa-images"></i>
                <span>Open in Manage Media</span>
            </a>
        </div>
    </div>
</div>
@endsection

@section('extra-js')
    <script>
        window.INITIAL_DATA = @json($mediaItems ?? []);
        window.INITIAL_MEDIA = @json($mediaItems ?? []);
    </script>
    <script src="{{ asset('js/media-data.js') }}"></script>
    <script src="{{ asset('js/media-dashboard.js') }}"></script>
@endsection
