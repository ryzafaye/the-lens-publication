@extends('layouts.mpc')

@section('title', 'Publish Article')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/executive-dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-modals.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-manage-articles.css') }}">
    <link rel="stylesheet" href="{{ asset('css/mpc-publish-article.css') }}">
@endpush

@section('content')
<main class="content-container">

    <!-- Top Section: Header with Title and Sort Control -->
    <div class="page-title-section animate-fade-in delay-1">
        <div class="page-header-row">
            <h1 class="page-title">Publish Article</h1>

            <!-- Search & Sort Controls Lockup -->
            <div class="publish-controls-group">
                <div class="compact-search-box">
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input type="text" id="mpc-search-input" class="compact-search-input" placeholder="Search articles..." aria-label="Search articles">
                </div>

                <div class="review-sort-container">
                    <label for="mpc-sort-select" class="review-sort-label">
                        <i class="fa-solid fa-arrow-down-wide-short"></i>
                        <span>Sort:</span>
                    </label>
                    <div class="sort-select-wrapper">
                        <select id="mpc-sort-select" class="review-sort-select" aria-label="Sort articles">
                            <option value="newest" selected>Newest Approved</option>
                            <option value="oldest">Oldest Approved</option>
                        </select>
                        <i class="fa-solid fa-chevron-down sort-chevron" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Category Filter Pills -->
        <div class="mpc-filters-bar" id="mpc-category-filters-bar">
            <div class="mpc-category-pills">
                <button type="button" class="mpc-category-pill active" data-category="all">All Categories</button>
                <button type="button" class="mpc-category-pill" data-category="news">News</button>
                <button type="button" class="mpc-category-pill" data-category="opinion">Opinion</button>
                <button type="button" class="mpc-category-pill" data-category="features">Features</button>
                <button type="button" class="mpc-category-pill" data-category="scitech">Science and Technology</button>
                <button type="button" class="mpc-category-pill" data-category="literature">Literature</button>
            </div>
        </div>

        <!-- Primary View Tabs -->
        <div class="mpc-view-tabs manage-tabs-container" role="tablist">
            <button type="button" class="mpc-view-tab-btn manage-tab-btn active" data-view="ready" role="tab" aria-selected="true">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>Ready to Publish</span>
                <span id="badge-tab-ready" class="mpc-tab-count-pill tab-count-badge">{{ $readyCount ?? count($approvedArticles ?? []) }}</span>
            </button>
            <button type="button" class="mpc-view-tab-btn manage-tab-btn" data-view="published" role="tab" aria-selected="false">
                <i class="fa-solid fa-globe"></i>
                <span>Published Articles</span>
                <span id="badge-tab-published" class="mpc-tab-count-pill tab-count-badge">{{ $publishedCount ?? 0 }}</span>
            </button>
            <button type="button" class="mpc-view-tab-btn manage-tab-btn" data-view="unpublished" role="tab" aria-selected="false">
                <i class="fa-solid fa-box-archive"></i>
                <span>Unpublished</span>
                <span id="badge-tab-unpublished" class="mpc-tab-count-pill tab-count-badge">{{ $unpublishedCount ?? 0 }}</span>
            </button>
            <button type="button" class="mpc-view-tab-btn manage-tab-btn" data-view="covers" role="tab" aria-selected="false">
                <i class="fa-regular fa-image"></i>
                <span>Approved Covers Library</span>
                <span id="badge-tab-covers" class="mpc-tab-count-pill tab-count-badge">{{ $coversCount ?? 0 }}</span>
            </button>
        </div>
    </div>

    <!-- Articles Queue Grid -->
    <div id="mpc-articles-grid" class="mpc-articles-grid">
        @php
            $readyArticles = collect($articles ?? $approvedArticles ?? [])->filter(function($a) {
                if (is_array($a)) {
                    return in_array($a['status'] ?? '', ['ready', 'Approved', 'Ready to Publish']);
                }
                return in_array($a->status ?? '', ['ready', 'Approved', 'Ready to Publish']);
            });
        @endphp
        @forelse($readyArticles as $article)
            <div class="article-card-queue">
                <div class="article-card-header">
                    <span class="category-badge">{{ is_array($article) ? ($article['category'] ?? 'General') : ($article->category->name ?? 'General') }}</span>
                    <span class="date-text">{{ is_array($article) ? ($article['dateApproved'] ?? '') : ($article->created_at?->format('M d, Y')) }}</span>
                </div>
                <h3 class="article-card-title" data-action="read" data-id="{{ is_array($article) ? ($article['id'] ?? '') : $article->id }}" style="cursor: pointer;" title="Click to read manuscript">{{ is_array($article) ? ($article['title'] ?? '') : $article->title }}</h3>
                <p class="article-card-excerpt">{{ is_array($article) ? ($article['excerpt'] ?? '') : ($article->excerpt ?? Str::limit(strip_tags($article->content), 120)) }}</p>
                <div class="article-card-byline">
                    <i class="fa-solid fa-pen-nib author-pen-icon" style="color: #7b1113; margin-right: 6px;"></i>
                    <span>{{ is_array($article) ? ($article['author'] ?? 'Author') : ($article->user->full_name ?? 'Author') }}</span>
                </div>
                <div class="article-card-actions" style="margin-top: 14px; display: flex; align-items: center; justify-content: space-between;">
                    <span class="status-pill status-pill-pending">Ready to Publish</span>
                    <button type="button" class="btn-mpc-read" data-action="read" data-id="{{ is_array($article) ? ($article['id'] ?? '') : $article->id }}">
                        <i class="fa-regular fa-file-lines"></i>
                        <span>Read Article</span>
                    </button>
                </div>
            </div>
        @empty
            <div class="mpc-tab-empty-state" style="width: 100%; text-align: center; padding: 56px 20px; background: #ffffff; border: 1px dashed var(--border-subtle, #eaecf0); border-radius: 12px; margin-top: 10px;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: #fdf2f4; color: var(--sidebar-maroon, #5c0a18); display: inline-flex; align-items: center; justify-content: center; font-size: 1.25rem; margin-bottom: 14px;">
                    <i class="fa-solid fa-feather-pointed"></i>
                </div>
                <h3 style="font-family: var(--font-heading, 'Newsreader', serif); font-size: 1.15rem; font-weight: 700; color: #101828; margin: 0;">No Articles Awaiting Publication</h3>
            </div>
        @endforelse
    </div>

    <!-- Covers Library Gallery View (Hidden by default) -->
    <div id="mpc-covers-library-view" style="display: none;">
        <div id="mpc-covers-library-grid" class="mpc-gallery-grid">
            <div class="mpc-tab-empty-state" style="grid-column: 1 / -1; width: 100%; text-align: center; padding: 56px 20px; background: #ffffff; border: 1px dashed var(--border-subtle, #eaecf0); border-radius: 12px; margin-top: 10px;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: #fdf2f4; color: var(--sidebar-maroon, #5c0a18); display: inline-flex; align-items: center; justify-content: center; font-size: 1.25rem; margin-bottom: 14px;">
                    <i class="fa-regular fa-image"></i>
                </div>
                <h3 style="font-family: var(--font-heading, 'Newsreader', serif); font-size: 1.15rem; font-weight: 700; color: #101828; margin: 0;">No Approved Artwork Available</h3>
            </div>
        </div>
    </div>

</main>

<!-- Modal 1: Assign Cover Selection Modal -->
<div id="assign-cover-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="modal-cover-title">
    <div class="modal-card mpc-cover-modal-card">
        <div class="mpc-modal-header">
            <div class="mpc-modal-header-left">
                <h2 id="modal-cover-title" class="mpc-modal-title">Select Article Cover</h2>
                <div class="mpc-modal-sub">Choose from approved visual materials for: <strong id="modal-target-article-title">Article</strong></div>
            </div>
            <button type="button" id="close-cover-modal-btn" class="cover-modal-close-btn" aria-label="Close modal">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="mpc-cover-gallery-body">
            <div class="mpc-modal-filter-row">
                <div class="mpc-modal-pills">
                    <button type="button" class="mpc-modal-pill active" data-cover-type="all">All Formats</button>
                    <button type="button" class="mpc-modal-pill" data-cover-type="pubmat">PUBMAT</button>
                    <button type="button" class="mpc-modal-pill" data-cover-type="photo">PHOTOS</button>
                    <button type="button" class="mpc-modal-pill" data-cover-type="cartoon">CARTOON</button>
                </div>
                <span style="font-size: 0.76rem; color: #667085;">Click an artwork to select</span>
            </div>
            <div id="modal-cover-gallery" class="mpc-gallery-grid"></div>
        </div>

        <div class="mpc-modal-footer">
            <button type="button" id="cancel-cover-modal-btn" class="btn-modal-cancel">
                <span>Cancel</span>
            </button>
            <button type="button" id="confirm-cover-modal-btn" class="btn-inspect-approve">
                <i class="fa-solid fa-check"></i>
                <span>Confirm &amp; Attach Cover</span>
            </button>
        </div>
    </div>
</div>

<!-- Modal 2: Full Manuscript Reading Modal -->
<div id="manuscript-viewer-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="reader-title">
    <div class="modal-card viewer-modal-card">
        <div class="viewer-modal-header">
            <div class="viewer-meta-row">
                <span id="reader-category" class="viewer-category-tag">CATEGORY</span>
                <span class="viewer-dot">&bull;</span>
                <span id="reader-date" class="viewer-date">Approved Date</span>
            </div>
            <div class="viewer-header-right">
                <span class="viewer-reading-time"><i class="fa-regular fa-clock"></i> <span id="reader-read-time">3 min read</span></span>
                <button type="button" id="close-reader-btn" class="viewer-close-btn" aria-label="Close reader">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>

        <div class="viewer-modal-body">
            <h1 id="reader-title" class="viewer-title">Article Title</h1>
            
            <div class="viewer-byline-row">
                <div class="viewer-author-avatar">
                    <img id="reader-author-avatar" src="{{ asset('images/member-placeholder.svg') }}" alt="Author avatar">
                </div>
                <div class="viewer-byline-text">
                    <span class="viewer-by">By <strong id="reader-author">Author Name</strong></span>
                    <span id="reader-endorsements" style="font-size: 0.78rem; color: #667085; margin-top: 2px;"></span>
                </div>
            </div>

            <!-- Assigned cover preview banner -->
            <div id="reader-cover-wrap" class="viewer-banner" style="display: none; position: relative;">
                <img id="reader-cover-img" src="" alt="Assigned cover">
                <div id="reader-cover-badge" style="position: absolute; bottom: 12px; left: 14px; background: rgba(16, 24, 40, 0.85); color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; backdrop-filter: blur(4px);">COVER</div>
            </div>

            <p id="reader-excerpt" class="viewer-excerpt" style="display: none;"></p>

            <div id="reader-body" class="manuscript-prose"></div>
        </div>

        <div class="viewer-modal-footer">
            <button type="button" id="close-reader-footer-btn" class="btn-modal-cancel">
                <span>Close</span>
            </button>
            <div style="display: inline-flex; align-items: center; gap: 8px;">
                <button type="button" id="reader-action-assign" class="btn-mpc-assign">
                    <i class="fa-solid fa-palette"></i>
                    <span id="reader-assign-label">Assign Cover</span>
                </button>
                <button type="button" id="reader-action-publish" class="btn-mpc-publish">
                    <i class="fa-solid fa-globe"></i>
                    <span id="reader-publish-label">Publish to Website</span>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Modal 3: Return Article to EIC for Revision Modal -->
<div id="mpc-return-article-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="mpc-return-title">
    <div class="modal-card return-modal-card" style="max-width: 500px;">
        <div class="mpc-modal-header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #eaecf0; padding: 18px 24px;">
            <div class="mpc-modal-header-left">
                <h2 id="mpc-return-title" class="mpc-modal-title" style="font-size: 1.15rem; font-weight: 700; color: #101828; margin: 0;">Return Article to Editor-in-Chief</h2>
                <div class="mpc-modal-sub" style="font-size: 0.8rem; color: #667085; margin-top: 4px;">Story: <strong id="mpc-return-article-title">Article</strong></div>
            </div>
            <button type="button" id="close-mpc-return-modal-btn" class="cover-modal-close-btn" aria-label="Close modal" style="background: transparent; border: none; font-size: 1.25rem; color: #667085; cursor: pointer;">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div style="padding: 20px 24px;">
            <div style="background: #fdf2f4; border: 1px solid #fecdca; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-rotate-left" style="color: #b42318; font-size: 1rem;"></i>
                <span style="font-size: 0.82rem; color: #7a1f2e; font-weight: 500;">This article will be returned backwards to the Editor-in-Chief's review queue.</span>
            </div>

            <div class="form-group">
                <label for="mpc-return-remarks" style="display: block; font-weight: 600; font-size: 0.85rem; color: #344054; margin-bottom: 8px;">
                    Revision Remarks for EIC / Writer: <span style="color: #d92d20;">*</span>
                </label>
                <textarea id="mpc-return-remarks" rows="4" placeholder="Detail any requested editorial or formatting adjustments..." style="width: 100%; border: 1px solid #d0d5dd; border-radius: 8px; padding: 10px 12px; font-family: inherit; font-size: 0.85rem; box-sizing: border-box;"></textarea>
                <div id="mpc-return-error" class="hidden" style="color: #d92d20; font-size: 0.78rem; margin-top: 6px;">Please provide revision remarks before returning.</div>
            </div>
        </div>

        <div class="mpc-modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; padding: 14px 24px; border-top: 1px solid #eaecf0; background: #fafafa; border-radius: 0 0 16px 16px;">
            <button type="button" id="cancel-mpc-return-btn" class="btn-modal-cancel" style="padding: 8px 16px; border: 1px solid #d0d5dd; background: #fff; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem; color: #344054;">
                Cancel
            </button>
            <button type="button" id="confirm-mpc-return-btn" style="padding: 8px 18px; border: none; background: #b42318; color: #fff; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-rotate-left"></i>
                <span>Confirm Return</span>
            </button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
    <script>
        window.INITIAL_DATA = @json($articles ?? $approvedArticles ?? []);
    </script>
    <script src="{{ asset('js/mpc-publish-article.js') }}"></script>
@endpush

