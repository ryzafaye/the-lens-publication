@extends('layouts.executive')

@section('title', 'Feedback Inbox')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/shared-feedback-inbox.css') }}">
@endpush

@section('content')
<main class="content-container">

    <div class="feedback-inbox-container">
        
        <!-- Page Header: Clean Title -->
        <div class="feedback-header-row">
            <h1 class="feedback-page-title">Feedback Inbox</h1>
        </div>

        <!-- Search, Filter, and Sort Controls Bar (Directly under Title) -->
        <div class="feedback-controls-bar">
            <div class="feedback-search-box">
                <i class="fa-solid fa-magnifying-glass feedback-search-icon"></i>
                <input 
                    type="text" 
                    id="feedback-search-input" 
                    class="feedback-search-input" 
                    placeholder="Search by sender name, subject, or message content..."
                    aria-label="Search feedback messages"
                >
                <button type="button" id="feedback-search-clear" class="feedback-search-clear" aria-label="Clear search">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div class="feedback-filters-and-sort">
                <!-- Read Status Tabs -->
                <div class="feedback-filter-tabs" id="feedback-filter-tabs" role="tablist">
                    <button type="button" class="tab-filter-btn active" data-tab="all" role="tab" aria-selected="true">
                        <span>All</span>
                        <span class="tab-pill-count" id="count-tab-all">0</span>
                    </button>
                    <button type="button" class="tab-filter-btn" data-tab="unread" role="tab" aria-selected="false">
                        <span>Unread</span>
                        <span class="tab-pill-count" id="count-tab-unread">0</span>
                    </button>
                </div>

                <!-- Sort Dropdown (Newest / Oldest) -->
                <div class="feedback-sort-wrap">
                    <label for="feedback-sort-select" class="feedback-sort-label">
                        <i class="fa-solid fa-arrow-down-wide-short"></i>
                        <span>Sort:</span>
                    </label>
                    <div class="sort-select-wrapper">
                        <select id="feedback-sort-select" class="feedback-sort-select" aria-label="Sort feedback messages">
                            <option value="newest" selected>Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                        <i class="fa-solid fa-chevron-down sort-chevron" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Feedback Cards List Container (Horizontal Card Layout) -->
        <div class="feedback-cards-list" id="feedback-cards-list">
            <!-- Dynamically populated feedback cards -->
        </div>

        <!-- Empty State Container -->
        <div class="feedback-empty-state hidden" id="feedback-empty-state">
            <i class="fa-regular fa-comments empty-icon"></i>
            <h3 class="empty-title" id="empty-state-title">No feedback messages found</h3>
            <p class="empty-subtitle" id="empty-state-subtitle">Feedback submitted by readers on the public site will appear here.</p>
        </div>

    </div>

</main>

<!-- Minimalist Feedback Viewer Modal -->
<div class="modal-overlay hidden" id="feedback-modal" role="dialog" aria-modal="true" aria-labelledby="modal-subject">
    <div class="modal-card feedback-modal-card">
        <div class="modal-header">
            <div class="modal-meta-row">
                <span class="modal-date" id="modal-date">Oct 18, 2026 • 02:45 PM</span>
                <span class="modal-status-badge" id="modal-status-badge">Unread</span>
            </div>
            <button type="button" class="modal-close-btn" id="modal-close-btn" aria-label="Close modal">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="modal-body">
            <h2 class="modal-subject" id="modal-subject">Feedback Subject Headline</h2>

            <div class="modal-sender-banner">
                <div class="sender-avatar">
                    <i class="fa-solid fa-user"></i>
                </div>
                <div class="sender-info">
                    <span class="sender-name" id="modal-sender-name">Anonymous Reader</span>
                    <a href="#" class="sender-email" id="modal-sender-email">reader@example.com</a>
                </div>
            </div>

            <div class="modal-message-content">
                <p id="modal-message-body">Message text will appear here...</p>
            </div>
        </div>

        <div class="modal-footer">
            <button type="button" class="btn-modal-close" id="modal-bottom-close-btn">Close</button>
        </div>
    </div>
</div>

<!-- Global Toast Notification Container -->
<div id="toast-container" class="toast-container" aria-live="polite"></div>
@endsection

@push('scripts')
<script>
    window.__FEEDBACK_DATA__ = @json($feedbacks ?? []);
</script>
<script src="{{ asset('js/executive-feedback-inbox.js') }}"></script>
@endpush
