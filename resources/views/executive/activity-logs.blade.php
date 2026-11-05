@extends('layouts.executive')

@section('title', 'Activity Log')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/executive-activity-logs.css') }}">
@endpush

@section('content')
<main class="content-container">

    <div class="activity-logs-container">

        <!-- 1. Clean Title of the Page -->
        <div class="activity-page-header">
            <h1 class="activity-page-title">Activity Log</h1>
        </div>

        <!-- 2. Filter Bar: Search + Date Range -->
        <div class="activity-filter-bar">
            <div class="activity-search-box">
                <i class="fa-solid fa-magnifying-glass activity-search-icon"></i>
                <input 
                    type="text" 
                    id="activity-search-input" 
                    class="activity-search-input" 
                    placeholder="Search activity logs..." 
                    aria-label="Search activity logs">
                <button type="button" id="activity-search-clear" class="activity-search-clear" aria-label="Clear search">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div class="activity-date-controls">
                <select id="date-filter-select" class="activity-date-select" aria-label="Filter by time range">
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="7days">Past 7 Days</option>
                    <option value="30days">Past 30 Days</option>
                    <option value="specific">Specific Date</option>
                </select>

                <div id="specific-date-wrapper" class="specific-date-wrapper hidden">
                    <input 
                        type="date" 
                        id="specific-date-picker" 
                        class="specific-date-input" 
                        aria-label="Choose specific date">
                </div>
            </div>
        </div>

        <!-- 3. Status Results Counter -->
        <div id="activity-results-counter" class="activity-results-counter">
            Showing all logged events
        </div>

        <!-- 4. Clean Timeline Stream -->
        <section 
            id="activity-stream-timeline" 
            class="activity-stream-timeline" 
            aria-label="Activity events timeline">
            <!-- Populated dynamically via js/executive-activity-logs.js -->
        </section>

    </div>

</main>

<!-- Notification Toast Container -->
<div id="toast-container" class="toast-container" aria-live="polite" aria-atomic="true"></div>
@endsection

@push('scripts')
    <script>
        window.INITIAL_DATA = @json($activities ?? []);
        window.INITIAL_ACTIVITIES = window.INITIAL_DATA;
    </script>
    <script src="{{ asset('js/executive-activity-logs.js') }}"></script>
@endpush
