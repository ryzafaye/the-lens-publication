@extends('layouts.eic')

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

        <!-- Clean Empty State when Inbox has no submissions (No boxes shown) -->
        <div class="feedback-empty-state {{ count($feedbacks ?? []) === 0 ? '' : 'hidden' }}" id="feedback-empty-state">
            <div class="feedback-empty-card">
                <div class="feedback-empty-icon-wrap">
                    <i class="fa-regular fa-envelope-open"></i>
                </div>
                <h2 class="feedback-empty-heading">No feedback messages yet</h2>
                <p class="feedback-empty-description">When readers submit feedback, suggestions, or comments through the publication, they will appear here in your inbox.</p>
            </div>
        </div>

        <!-- Search, Filter, and Sort Controls Bar (Directly under Title) -->
        <div class="feedback-controls-bar {{ count($feedbacks ?? []) === 0 ? 'hidden' : '' }}" id="feedback-controls-bar">
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
                        <i class="fa-solid fa-arrow-down-short-wide"></i>
                        <span>Sort:</span>
                    </label>
                    <select id="feedback-sort-select" class="feedback-sort-select" aria-label="Sort feedback messages">
                        <option value="newest" selected>Newest</option>
                        <option value="oldest">Oldest</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Master-Detail Split Inbox Layout -->
        <div class="inbox-split-grid {{ count($feedbacks ?? []) === 0 ? 'hidden' : '' }}" id="inbox-split-grid">
            
            <!-- Left: Scrollable Message List -->
            <div class="inbox-list-pane">
                <div class="inbox-list-header">
                    <span>All Submissions</span>
                </div>
                <div class="inbox-scroll-list" id="inbox-scroll-list" role="listbox" aria-label="Feedback message list">
                    <!-- Populated dynamically by js/eic-feedback-inbox.js -->
                </div>
            </div>

            <!-- Right: Reading Detail Pane -->
            <div class="inbox-detail-pane" id="inbox-detail-pane" aria-live="polite">
                <!-- Populated dynamically by js/eic-feedback-inbox.js -->
            </div>

        </div>

    </div>

</main>
@endsection

@push('scripts')
    <script>
        window.INITIAL_DATA = @json($feedbacks ?? []);
    </script>
    <script src="{{ asset('js/shared-feedback-inbox.js') }}"></script>
@endpush

