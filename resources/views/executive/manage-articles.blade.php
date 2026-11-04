@extends('layouts.executive')

@section('title', 'Manage Articles & Archives')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/executive-manage-articles.css') }}">
@endpush

@section('content')
<main class="content-container">

    <!-- Page Header & Title Section -->
    <div class="page-title-section animate-fade-in delay-1">
        <h1 class="page-title">Manage Articles &amp; Archives</h1>
    </div>

    <!-- Tabs Navigation (Active Articles vs. Archived Articles) -->
    <div class="manage-tabs-container animate-fade-in delay-2">
        <button type="button" id="tab-active-btn" class="manage-tab-btn active" data-tab="active">
            <i class="fa-regular fa-newspaper"></i>
            <span>Active Articles</span>
            <span id="badge-active-count" class="tab-count-badge">0</span>
        </button>
        <button type="button" id="tab-archived-btn" class="manage-tab-btn" data-tab="archived">
            <i class="fa-solid fa-box-archive"></i>
            <span>Archived Articles</span>
            <span id="badge-archived-count" class="tab-count-badge">0</span>
        </button>
    </div>

    <!-- Search & Filter Toolbar -->
    <div class="manage-toolbar animate-fade-in delay-2">
        
        <!-- Search Bar -->
        <div class="manage-search-shell">
            <i class="fa-solid fa-magnifying-glass search-leading-icon" aria-hidden="true"></i>
            <input type="search" id="manage-search-input" class="manage-search-input" placeholder="Search by article title or author..." aria-label="Search by article title or author" autocomplete="off">
            <button type="button" id="clear-search-btn" class="clear-search-icon hidden" title="Clear search">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <!-- Sort & Filter Dropdown Trigger & Popup -->
        <div class="sort-filter-wrapper">
            <button type="button" id="sort-filter-btn" class="sort-filter-btn" aria-expanded="false" aria-controls="filter-dropdown">
                <i class="fa-solid fa-sliders" aria-hidden="true"></i>
                <span>Sort &amp; Filter</span>
                <span id="filter-active-dot" class="filter-active-indicator hidden" title="Filters active"></span>
                <i class="fa-solid fa-chevron-down filter-chevron" aria-hidden="true"></i>
            </button>

            <!-- Exact Public Site Filter Dropdown Popup -->
            <div id="filter-dropdown" class="filter-dropdown hidden">
                <div class="filter-panel-heading">
                    <span>Sort &amp; Filter</span>
                    <button type="button" id="close-filter-btn" class="icon-button" aria-label="Close filters">
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="filter-grid">
                    <div class="filter-field">
                        <label for="sort-select">Sort by</label>
                        <select id="sort-select" class="archive-select">
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="popular">Most Viewed</option>
                            <option value="az">A-Z</option>
                        </select>
                    </div>
                    <div class="filter-field">
                        <label for="category-select">Category</label>
                        <select id="category-select" class="archive-select">
                            <option value="All">All categories</option>
                            <option value="News">News</option>
                            <option value="Features">Features</option>
                            <option value="Opinion">Opinion</option>
                            <option value="Science and Technology">Science &amp; Technology</option>
                            <option value="Literature">Literature</option>
                        </select>
                    </div>
                    <div class="filter-field filter-date-field">
                        <label for="date-filter-type">Published date</label>
                        <div class="published-date-controls">
                            <select id="date-filter-type" class="archive-select">
                                <option value="any">Any date</option>
                                <option value="today">Today</option>
                                <option value="this_week">This week</option>
                                <option value="choose">Choose date</option>
                            </select>
                            <div class="date-filter-selects" id="date-filter-value-wrap" hidden>
                                <select id="date-month-select" class="archive-select date-filter-select" aria-label="Month" disabled>
                                    <option value="">Month</option>
                                    <option value="1">Jan</option><option value="2">Feb</option><option value="3">Mar</option>
                                    <option value="4">Apr</option><option value="5">May</option><option value="6">Jun</option>
                                    <option value="7">Jul</option><option value="8">Aug</option><option value="9">Sep</option>
                                    <option value="10">Oct</option><option value="11">Nov</option><option value="12">Dec</option>
                                </select>
                                <select id="date-day-select" class="archive-select date-filter-select" aria-label="Day" disabled>
                                    <option value="">Day</option>
                                    <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                                    <option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option>
                                    <option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option>
                                    <option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option>
                                    <option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option>
                                    <option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option>
                                    <option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option>
                                    <option value="29">29</option><option value="30">30</option><option value="31">31</option>
                                </select>
                                <select id="date-year-select" class="archive-select date-filter-select" aria-label="Year" disabled>
                                    <option value="">Year</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="filter-panel-footer">
                    <button type="button" id="clear-filters-btn" class="clear-filters-btn">Clear filters</button>
                    <button type="button" id="apply-filters-btn" class="apply-filters-btn">
                        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                        <span>Apply</span>
                    </button>
                </div>
            </div>
        </div>

    </div>

    <!-- Active Filter Chips -->
    <div id="active-filter-chips" class="active-filter-chips hidden animate-fade-in"></div>

    <!-- Articles Cards Panel -->
    <section class="articles-panel animate-fade-in delay-3" aria-labelledby="articles-panel-heading">
        
        <!-- Section Header Metadata -->
        <div class="articles-header-meta">
            <div class="meta-left">
                <span id="articles-results-counter" class="articles-results-counter">Loading articles…</span>
            </div>
        </div>

        <!-- 2-column Grid of Article Cards -->
        <div id="articles-grid" class="articles-grid" aria-label="Article cards list">
            <!-- Cards populated dynamically via JS -->
        </div>

        <!-- Empty State (Only Shown When Searching or Filtering) -->
        <div id="manage-empty-state" class="table-empty-state hidden">
            <div class="empty-state-icon">
                <i class="fa-regular fa-folder-open"></i>
            </div>
            <div class="empty-state-title">No articles found</div>
            <p class="empty-state-desc">We couldn't find any articles matching your search query or active filter settings.</p>
            <button type="button" id="reset-empty-filters-btn" class="modal-btn modal-btn-cancel" style="margin-top: 8px;">
                Reset filters
            </button>
        </div>

        <!-- Default Empty State (Shown When Category/Tab Has No Articles) -->
        <div id="manage-no-articles-state" class="table-empty-state hidden">
            <div class="empty-state-icon">
                <i class="fa-regular fa-newspaper" id="no-articles-icon"></i>
            </div>
            <div class="empty-state-title" id="no-articles-title">No articles yet</div>
            <p class="empty-state-desc" id="no-articles-desc">There are currently no active articles.</p>
        </div>

    </section>

</main>

<!-- ====================================================================== -->
<!-- MODAL 1: Full Article Viewer Modal (For Executive to View Article)     -->
<!-- ====================================================================== -->
<div id="article-viewer-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="viewer-title">
    <div class="modal-card viewer-modal-card">
        <div class="viewer-modal-header">
            <div class="viewer-meta-row">
                <span id="viewer-category" class="viewer-category-tag">News</span>
                <span class="viewer-dot">·</span>
                <span id="viewer-date" class="viewer-date">Oct 12, 2026</span>
            </div>
            <div class="viewer-header-right">
                <span class="viewer-reading-time"><i class="fa-regular fa-clock"></i> <span id="viewer-read-time">2 min read</span></span>
                <button type="button" id="close-viewer-btn" class="viewer-close-btn" aria-label="Close article preview">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>

        <div class="viewer-modal-body">
            <h1 id="viewer-title" class="viewer-title">Article Title</h1>
            
            <div class="viewer-byline-row">
                <div class="viewer-author-avatar">
                    <img src="{{ asset('images/member-placeholder.svg') }}" alt="Author avatar">
                </div>
                <div class="viewer-byline-text">
                    <span class="viewer-by">By <strong id="viewer-author">Author Name</strong></span>
                </div>
            </div>

            <p id="viewer-excerpt" class="viewer-excerpt" style="display: none;"></p>

            <div id="viewer-banner-wrap" class="viewer-banner">
                <img id="viewer-banner-img" src="{{ asset('images/maroon.jpg') }}" alt="Article banner">
            </div>

            <div id="viewer-content" class="viewer-content-text">
                <!-- Paragraphs populated dynamically -->
            </div>

            <div class="viewer-stats-bar">
                <span class="stat-pill"><i class="fa-regular fa-eye"></i> <span id="viewer-views">0</span></span>
                <span class="stat-pill"><i class="fa-solid fa-share-nodes"></i> <span id="viewer-shares">0</span></span>
            </div>
        </div>

        <div class="viewer-modal-footer">
            <button type="button" id="viewer-action-edit" class="modal-btn modal-btn-secondary">
                <i class="fa-regular fa-pen-to-square"></i> Edit Article
            </button>
            <button type="button" id="viewer-action-archive" class="modal-btn modal-btn-warning">
                <i class="fa-solid fa-box-archive"></i> <span id="viewer-archive-label">Move to Archive</span>
            </button>
            <button type="button" id="viewer-action-delete" class="modal-btn modal-btn-danger">
                <i class="fa-regular fa-trash-can"></i> Emergency Delete
            </button>
        </div>
    </div>
</div>

<!-- ====================================================================== -->
<!-- MODAL 2: Edit Article Modal                                            -->
<!-- ====================================================================== -->
<div id="edit-article-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
    <div class="modal-card edit-modal-card">
        <div class="modal-header-simple">
            <h2 id="edit-modal-title" class="modal-title">
                <i class="fa-solid fa-pen-nib"></i> Edit Article
            </h2>
            <button type="button" id="close-edit-btn" class="icon-button" aria-label="Close edit dialog">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <form id="edit-article-form" class="edit-modal-form">
            <input type="hidden" id="edit-article-id">

            <div class="form-field">
                <label for="edit-title-input">Article Title</label>
                <input type="text" id="edit-title-input" class="form-input" required>
            </div>

            <div class="form-row-2">
                <div class="form-field">
                    <label for="edit-author-input">Author</label>
                    <input type="text" id="edit-author-input" class="form-input" required>
                </div>
                <div class="form-field">
                    <label for="edit-category-select">Category</label>
                    <select id="edit-category-select" class="form-select">
                        <option value="News">News</option>
                        <option value="Features">Features</option>
                        <option value="Opinion">Opinion</option>
                        <option value="Science and Technology">Science and Technology</option>
                        <option value="Literature">Literature</option>
                    </select>
                </div>
            </div>

            <div class="form-field">
                <label for="edit-readtime-input">Estimated Read Time</label>
                <input type="text" id="edit-readtime-input" class="form-input" placeholder="e.g. 2 min read">
            </div>

            <div class="form-field">
                <label for="edit-excerpt-input">Excerpt / Brief Summary</label>
                <textarea id="edit-excerpt-input" class="form-textarea" rows="3" required></textarea>
            </div>

            <div class="modal-footer">
                <button type="button" id="cancel-edit-btn" class="modal-btn modal-btn-cancel">Cancel</button>
                <button type="submit" class="modal-btn modal-btn-confirm-primary">
                    <i class="fa-solid fa-check"></i> Save Changes
                </button>
            </div>
        </form>
    </div>
</div>

<!-- ====================================================================== -->
<!-- MODAL 3: Interactive Action Confirmation Modal (Archive/Restore/Delete) -->
<!-- ====================================================================== -->
<div id="action-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-card">
        <div class="modal-body">
            <div id="modal-icon-header" class="modal-icon-header warning">
                <i id="modal-icon" class="fa-solid fa-box-archive"></i>
            </div>
            <div>
                <h2 id="modal-title" class="modal-title">Confirm Action</h2>
                <p id="modal-description" class="modal-description">Are you sure you want to perform this action?</p>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" id="modal-cancel-btn" class="modal-btn modal-btn-cancel">Cancel</button>
            <button type="button" id="modal-confirm-btn" class="modal-btn modal-btn-confirm-primary">Confirm</button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    window.LARAVEL_EXECUTIVE_ARTICLES = {!! json_encode($articles ?? [], JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT) !!};
</script>
<script type="module" src="{{ asset('js/executive-manage-articles.js') }}"></script>
@endpush
