@extends('layouts.eic')

@section('title', 'Activity Log')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/shared-activity-logs.css') }}">
@endpush

@section('content')
<main class="content-container">

    <div class="activity-logs-container">

        <!-- 1. Clean Title of the Page -->
        <div class="activity-page-header">
            <h1 class="activity-page-title">Activity Log</h1>
        </div>

        <!-- 2. Under it: Search Bar + Date Filter (Today, Past 7 Days, Past 30 Days, Specific Date) -->
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
            Showing all <em>15</em> logged events
        </div>

        <!-- 4. Clean Timeline Stream -->
        <section 
            id="activity-stream-timeline" 
            class="activity-stream-timeline" 
            aria-label="Activity events timeline">
            <!-- Populated dynamically via js/eic-activity-logs.js -->
        </section>

    </div>

</main>
@endsection

@push('scripts')
    <script>
        window.INITIAL_DATA = @json($activities ?? []);
        window.INITIAL_ACTIVITIES = window.INITIAL_DATA;
    </script>
    <script src="{{ asset('js/shared-activity-logs.js') }}"></script>
@endpush

