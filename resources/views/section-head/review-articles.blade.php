@extends('layouts.section-head')

@section('title', 'Review Articles | ' . ($category ? $category->name . ' Head' : 'Section Head'))

@section('extra-css')
    <link rel="stylesheet" href="{{ asset('css/section-head-review-articles.css') }}">
@endsection

@section('content')
<main class="content-container">

    <!-- Top Section: Header with Title and Sort Control (Executive Parity) -->
    <div class="page-title-section">
        <div class="page-header-row">
            <h1 class="page-title">Review Articles</h1>
            
            <div class="review-sort-container">
                <form method="GET" action="{{ route('section-head.review-articles') }}" id="sort-form">
                    <label for="review-sort-select" class="review-sort-label">
                        <i class="fa-solid fa-arrow-down-wide-short"></i>
                        <span>Sort:</span>
                    </label>
                    <div class="sort-select-wrapper">
                        <select id="review-sort-select" name="sort" class="review-sort-select" onchange="document.getElementById('sort-form').submit()" aria-label="Sort pending articles by date">
                            <option value="newest" {{ ($sort ?? 'newest') === 'newest' ? 'selected' : '' }}>Newest First</option>
                            <option value="oldest" {{ ($sort ?? '') === 'oldest' ? 'selected' : '' }}>Oldest First</option>
                        </select>
                        <i class="fa-solid fa-chevron-down sort-chevron" aria-hidden="true"></i>
                    </div>
                </form>
            </div>
        </div>
    </div>

    @if(session('success'))
        <div class="alert alert-success" style="background: #e6f4ea; color: #137333; padding: 12px 18px; border-radius: 8px; margin-bottom: 20px; font-weight: 500;">
            <i class="fa-solid fa-circle-check"></i> {{ session('success') }}
        </div>
    @endif

    @if(session('warning'))
        <div class="alert alert-warning" style="background: #fef7e0; color: #b06000; padding: 12px 18px; border-radius: 8px; margin-bottom: 20px; font-weight: 500;">
            <i class="fa-solid fa-triangle-exclamation"></i> {{ session('warning') }}
        </div>
    @endif

    <!-- List Container -->
    <div id="review-list-container" class="review-list-container">
        @forelse($pendingArticles as $article)
            <div class="review-box" id="box-{{ $article->id }}">
                <div class="review-box-content">
                    <div class="review-box-meta">
                        <span class="review-box-category">{{ $article->category->name ?? 'General' }}</span>
                        <span class="review-box-date"><i class="fa-regular fa-calendar" aria-hidden="true"></i> {{ $article->created_at->format('M d, Y') }}</span>
                    </div>
                    <h3 class="review-box-headline">{{ $article->title }}</h3>
                    <div class="review-box-author">
                        <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
                        <span>By <strong>{{ $article->user->full_name ?? 'Staff Writer' }}</strong></span>
                    </div>
                    @if($article->excerpt)
                        <p class="review-box-excerpt">{{ $article->excerpt }}</p>
                    @endif
                </div>
                <div class="review-box-actions">
                    <button type="button" class="btn-box-read" onclick="openManuscript({{ $article->id }}, false)" title="Read full manuscript">
                        <i class="fa-regular fa-file-lines"></i>
                        <span>Read Manuscript</span>
                    </button>
                    <button type="button" class="btn-box-revision" onclick="openManuscript({{ $article->id }}, true)" title="Return with required revision remarks">
                        <i class="fa-solid fa-rotate-left"></i>
                        <span>For Revision</span>
                    </button>
                    <form method="POST" action="{{ route('section-head.approve-article', $article->id) }}" style="margin: 0; display: inline-flex;">
                        @csrf
                        <button type="submit" class="btn-box-approve" onclick="return confirm('Approve this story for publication?')" title="Approve and endorse story for final review">
                            <i class="fa-solid fa-check"></i>
                            <span>Approve for Publication</span>
                        </button>
                    </form>
                </div>

                <!-- Hidden full article body for modal hydration -->
                <div id="article-body-{{ $article->id }}" style="display: none;">
                    {!! $article->content !!}
                </div>
                <div id="article-excerpt-{{ $article->id }}" style="display: none;">
                    {{ $article->excerpt }}
                </div>
                <div id="article-author-{{ $article->id }}" style="display: none;">
                    {{ $article->user->full_name ?? 'Staff Writer' }}
                </div>
                <div id="article-title-{{ $article->id }}" style="display: none;">
                    {{ $article->title }}
                </div>
                <div id="article-category-{{ $article->id }}" style="display: none;">
                    {{ $article->category->name ?? 'General' }}
                </div>
                <div id="article-date-{{ $article->id }}" style="display: none;">
                    {{ $article->created_at->format('M d, Y') }}
                </div>
            </div>
        @empty
            <!-- Empty Queue State -->
            <div id="empty-queue-state" class="review-empty-queue">
                <i class="fa-regular fa-circle-check"></i>
                <span>All caught up. No manuscripts pending {{ $category ? $category->name : 'section' }} head review.</span>
            </div>
        @endforelse
    </div>

</main>

<!-- Minimalist Manuscript Reader Modal (Exact 1:1 Parity) -->
<div id="manuscript-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
    <div class="modal-card manuscript-modal-card">
        
        <div class="manuscript-header">
            <div class="manuscript-header-left">
                <span id="modal-section" class="review-box-category">News</span>
                <span>&bull;</span>
                <span id="modal-date" class="review-box-date">Oct 18, 2026</span>
            </div>
            <div class="manuscript-header-right">
                <button type="button" id="close-manuscript-btn" onclick="closeManuscript()" class="viewer-close-btn" aria-label="Close manuscript reader">
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
            <form id="manuscript-revision-form" method="POST" action="">
                @csrf
                <div class="manuscript-remarks-section" id="manuscript-remarks-section">
                    <label for="modal-remarks" class="remarks-label">
                        <span class="remarks-label-text">
                            <i class="fa-solid fa-comment-dots"></i>
                            <span>Section Head Revision Remarks:</span>
                        </span>
                        <span class="required-badge">Required</span>
                    </label>
                    <textarea id="modal-remarks" name="remarks" class="remarks-textarea" placeholder="Enter mandatory revision feedback for the writer before returning this story..." required></textarea>
                    <div id="remarks-error-msg" class="remarks-error-msg hidden">
                        <i class="fa-solid fa-circle-exclamation"></i>
                        <span>Revision remarks are required. You cannot return for revision without remarks.</span>
                    </div>
                </div>
            </form>
        </div>

        <div class="manuscript-footer">
            <div class="modal-footer-right">
                <button type="button" id="modal-revision-btn" class="btn-box-revision" onclick="submitRevision()">
                    <i class="fa-solid fa-rotate-left"></i>
                    <span>For Revision</span>
                </button>
                <form id="modal-approve-form" method="POST" action="" style="margin: 0; display: inline-flex;">
                    @csrf
                    <button type="submit" id="modal-approve-btn" class="btn-box-approve" onclick="return confirm('Approve this story for publication?')">
                        <i class="fa-solid fa-check"></i>
                        <span>Approve for Publication</span>
                    </button>
                </form>
            </div>
        </div>

    </div>
</div>
@endsection

@section('extra-js')
<script>
    let currentActiveId = null;

    function openManuscript(id, focusRemarks = false) {
        currentActiveId = id;
        const title = document.getElementById('article-title-' + id)?.textContent || '';
        const author = document.getElementById('article-author-' + id)?.textContent || '';
        const category = document.getElementById('article-category-' + id)?.textContent || '';
        const date = document.getElementById('article-date-' + id)?.textContent || '';
        const excerpt = document.getElementById('article-excerpt-' + id)?.textContent || '';
        const content = document.getElementById('article-body-' + id)?.innerHTML || '';

        document.getElementById('modal-headline').textContent = title;
        document.getElementById('modal-writer').textContent = author;
        document.getElementById('modal-section').textContent = category;
        document.getElementById('modal-date').textContent = date;
        
        const excerptEl = document.getElementById('modal-excerpt');
        if (excerpt && excerpt.trim()) {
            excerptEl.textContent = excerpt.trim();
            excerptEl.style.display = 'block';
        } else {
            excerptEl.style.display = 'none';
        }

        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('modal-approve-form').action = '/section-head/review-articles/' + id + '/approve';
        document.getElementById('manuscript-revision-form').action = '/section-head/review-articles/' + id + '/revision';

        const modal = document.getElementById('manuscript-modal');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        const remarksInput = document.getElementById('modal-remarks');
        remarksInput.value = '';
        remarksInput.classList.remove('input-invalid');
        document.getElementById('remarks-error-msg')?.classList.add('hidden');

        if (focusRemarks) {
            setTimeout(() => {
                document.getElementById('manuscript-remarks-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                remarksInput.focus();
            }, 180);
        } else {
            const bodyEl = document.querySelector('.manuscript-body');
            if (bodyEl) bodyEl.scrollTop = 0;
        }
    }

    function closeManuscript() {
        const modal = document.getElementById('manuscript-modal');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        currentActiveId = null;
    }

    function submitRevision() {
        const remarksInput = document.getElementById('modal-remarks');
        const remarks = remarksInput.value.trim();
        if (!remarks) {
            remarksInput.classList.add('input-invalid');
            remarksInput.focus();
            document.getElementById('remarks-error-msg')?.classList.remove('hidden');
            return;
        }
        document.getElementById('manuscript-revision-form').submit();
    }

    document.getElementById('modal-remarks')?.addEventListener('input', function() {
        if (this.value.trim().length > 0) {
            this.classList.remove('input-invalid');
            document.getElementById('remarks-error-msg')?.classList.add('hidden');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeManuscript();
    });
</script>
@endsection
