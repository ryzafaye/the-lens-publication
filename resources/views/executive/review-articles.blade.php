@extends('layouts.executive')

@section('title', 'Review Articles')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/executive-review-articles.css') }}">
@endpush

@section('content')
<main class="content-container">

    <!-- Top Section: Header with Title and Sort Control -->
    <div class="page-title-section">
        <div class="page-header-row">
            <h1 class="page-title">Review Articles</h1>
            
            <div class="review-sort-container">
                <label for="review-sort-select" class="review-sort-label">
                    <i class="fa-solid fa-arrow-down-wide-short"></i>
                    <span>Sort:</span>
                </label>
                <div class="sort-select-wrapper">
                    <select id="review-sort-select" class="review-sort-select" aria-label="Sort pending articles by date">
                        <option value="newest" selected>Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                    <i class="fa-solid fa-chevron-down sort-chevron" aria-hidden="true"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- List Container -->
    <div id="review-list-container" class="review-list-container"></div>

    <!-- Empty Queue State -->
    <div id="empty-queue-state" class="review-empty-queue" style="display: none;">
        <i class="fa-regular fa-circle-check"></i>
        <span>All caught up. No manuscripts pending editorial review.</span>
    </div>

</main>

<!-- Minimalist Manuscript Reader Modal -->
<div id="manuscript-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
    <div class="modal-card manuscript-modal-card">
        
        <div class="manuscript-header">
            <div class="manuscript-header-left">
                <span id="modal-section" class="review-box-category">News</span>
                <span>&bull;</span>
                <span id="modal-date" class="review-box-date">Oct 18, 2026</span>
            </div>
            <div class="manuscript-header-right">
                <button type="button" id="close-manuscript-btn" class="viewer-close-btn" aria-label="Close manuscript reader">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>

        <div class="manuscript-body">
            <h2 id="modal-headline" class="manuscript-headline">Article Headline</h2>
            
            <div class="manuscript-byline-banner">
                <div class="manuscript-byline-author">
                    <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
                    <span>By <strong id="modal-writer">Author Name</strong></span>
                </div>
            </div>

            <p id="modal-excerpt" class="viewer-excerpt" style="display: none;"></p>

            <div id="modal-body" class="manuscript-text-content"></div>

            <!-- Mandatory Revision Remarks Box -->
            <div class="manuscript-remarks-section" id="manuscript-remarks-section">
                <label for="modal-remarks" class="remarks-label">
                    <span class="remarks-label-text">
                        <i class="fa-solid fa-comment-dots"></i>
                        <span>Editorial Revision Remarks:</span>
                    </span>
                    <span class="required-badge">Required</span>
                </label>
                <textarea id="modal-remarks" class="remarks-textarea" placeholder="Enter mandatory revision feedback for the writer before returning this story..."></textarea>
                <div id="remarks-error-msg" class="remarks-error-msg hidden">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>Revision remarks are required. You cannot return for revision without remarks.</span>
                </div>
            </div>
        </div>

        <div class="manuscript-footer">
            <div class="modal-footer-right">
                <button type="button" id="modal-revision-btn" class="btn-box-revision">
                    <i class="fa-solid fa-rotate-left"></i>
                    <span>For Revision</span>
                </button>
                <button type="button" id="modal-approve-btn" class="btn-box-approve">
                    <i class="fa-solid fa-check"></i>
                    <span>Approve</span>
                </button>
            </div>
        </div>

    </div>
</div>

<!-- Toast Notification Container -->
<div id="toast-container" class="toast-container" aria-live="polite"></div>
@endsection

@push('scripts')
    <script>
        window.__PENDING_ARTICLES__ = @json($pendingArticles ?? []);
        window.__SECTION_CATEGORY__ = @json($category?->name ?? null);
        window.__APPROVE_URL__ = "{{ url(request()->is('section-head*') ? '/section-head/review-articles' : '/executive/review-articles') }}";
        window.__REVISION_URL__ = "{{ url(request()->is('section-head*') ? '/section-head/review-articles' : '/executive/review-articles') }}";
    </script>
    <script src="{{ asset('js/section-head-review-articles.js') }}"></script>
@endpush

