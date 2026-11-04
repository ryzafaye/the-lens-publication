@extends('layouts.writer')

@section('title', 'Dashboard')

@section('content')
@php
    // Extract first name from full name (e.g., "Ryza Faye Javier Reyes" -> "Ryza")
    $firstName = explode(' ', Auth::user()->full_name)[0];
@endphp

<main class="content-container">
    <div class="writer-header-row animate-fade-in delay-1">
        <div class="writer-header-left">
            <h1 class="writer-greeting" id="writer-greeting-heading">
                Welcome back, <span class="writer-name-highlight">{{ $firstName }}</span>
            </h1>
            <p class="writer-greeting-subtitle">Here is your publication overview and manuscript status.</p>
        </div>
        <div class="writer-header-right">
            <a href="/writer/submit-article" class="btn-primary-action">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>New Article</span>
            </a>
        </div>
    </div>

    <section class="writer-analytics-grid animate-fade-in delay-2">
        <div class="writer-stat-card">
            <div class="stat-number">{{ number_format($writerStats['total_views'] ?? 0) }}</div>
            <div class="stat-label">Total Views</div>
        </div>
        <div class="writer-stat-card">
            <div class="stat-number">{{ number_format($writerStats['published'] ?? 0) }}</div>
            <div class="stat-label">Published Articles</div>
        </div>
        <div class="writer-stat-card">
            <div class="stat-number">{{ number_format($writerStats['pending'] ?? 0) }}</div>
            <div class="stat-label">In Review</div>
        </div>
        <div class="writer-stat-card">
            <div class="stat-number">{{ number_format($writerStats['drafts'] ?? 0) }}</div>
            <div class="stat-label">Drafts</div>
        </div>
    </section>

    <div class="writer-dashboard-content-grid animate-fade-in delay-3">
        <div class="writer-recent-column">
            <div class="writer-section-header">
                <div class="section-title-wrap">
                    <h2 class="writer-section-title">My Recent Articles</h2>
                </div>
                <a href="/writer/manage-articles" class="view-all-link">
                    <span>View all</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </a>
            </div>

            <section class="writer-articles-list">
                @forelse($recentArticles as $art)
                    @php
                        // Determine status badge class
                        $badgeClass = 'status-draft';
                        $status = $art->status ?? $art['status'];
                        if($status === 'Published') $badgeClass = 'status-published';
                        elseif(in_array($status, ['Pending Review', 'Pending EIC Review', 'Pending M&PC Review'])) $badgeClass = 'status-pending';
                        elseif($status === 'Declined') $badgeClass = 'status-revision';

                        $categoryName = $art->category->name ?? ($art['category']['name'] ?? ($art['category'] ?? 'Uncategorized'));
                        $formattedDate = $art->created_at ? $art->created_at->format('M d, Y') : ($art['date'] ?? '');
                        
                        $modalData = [
                            'id' => $art->id ?? $art['id'],
                            'title' => $art->title ?? $art['title'],
                            'category' => $categoryName,
                            'date' => $formattedDate,
                            'author' => Auth::user()->full_name,
                            'excerpt' => $art->excerpt ?? $art['excerpt'],
                            'content' => $art->content ?? $art['content'],
                            'status' => $status,
                            'views' => $art->views ?? $art['views'] ?? 0,
                        ];
                    @endphp

                    <article class="writer-article-card" data-action="view" data-article="{{ json_encode($modalData) }}">
                        <div class="article-card-header">
                            <div class="article-card-meta">
                                <span class="article-card-category">{{ $categoryName }}</span>
                                <span class="meta-dot">&bull;</span>
                                <span class="article-card-date"><i class="fa-regular fa-calendar"></i> {{ $formattedDate }}</span>
                                
                                @if($status === 'Published')
                                    <span class="meta-dot">&bull;</span>
                                    <span class="article-card-date"><i class="fa-regular fa-eye"></i> {{ number_format($art->views ?? $art['views'] ?? 0) }} views</span>
                                @endif
                            </div>
                            <div class="article-card-status-top">
                                <span class="status-badge {{ $badgeClass }}">{{ $status }}</span>
                            </div>
                        </div>
                        <div class="article-card-body">
                            <h3 class="article-card-title">{{ $art->title ?? $art['title'] }}</h3>
                            <p class="article-card-excerpt">{{ $art->excerpt ?? $art['excerpt'] }}</p>
                        </div>
                        @if(in_array($status, ['Draft', 'For Revision']))
                            <div class="article-card-footer">
                                <a href="{{ route('writer.submit-article', ['draft_id' => $art->id ?? $art['id']]) }}" class="btn-box-edit" onclick="event.stopPropagation()">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                    <span>Edit</span>
                                </a>
                            </div>
                        @endif
                    </article>
                @empty
                    <div class="writer-empty-state">
                        <i class="fa-regular fa-folder-open"></i>
                        <p class="empty-title">No Articles Yet</p>
                        <p class="empty-subtitle">You have not submitted or drafted any articles yet. Click "New Article" above to begin.</p>
                    </div>
                @endforelse
            </section>
        </div>

        <aside class="writer-top-performing-column" aria-label="Top performing articles">
            <section class="card-panel">
                <div class="panel-header">
                    <h2 class="panel-title">Top Performing Articles</h2>
                    <span class="panel-badge">By Views</span>
                </div>
                <div id="writer-top-performing-list" class="ranked-list">
                    @forelse($topArticles as $idx => $art)
                        <div class="ranked-item" style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f2f4f7;">
                            <div style="display:flex;align-items:center;gap:12px;overflow:hidden;">
                                <span style="font-weight:700;color:#7a1526;width:20px;">#{{ $idx + 1 }}</span>
                                <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                    <div style="font-weight:500;font-size:0.9rem;color:#1d2939;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ $art->title }}</div>
                                    <div style="font-size:0.8rem;color:#667085;">{{ ($art->published_at ?? $art->created_at)->format('M d, Y') }}</div>
                                </div>
                            </div>
                            <span style="font-weight:600;color:#344054;font-size:0.85rem;padding-left:12px;white-space:nowrap;">{{ number_format($art->views) }} views</span>
                        </div>
                    @empty
                        <div style="padding:24px 0;color:#667085;font-size:0.88rem;text-align:center;">
                            No published articles yet.
                        </div>
                    @endforelse
                </div>
            </section>
        </aside>
    </div>
</main>

<!-- Article Viewer Modal (Exact Writer/Executive Parity Design) -->
<div id="article-viewer-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="viewer-title">
    <div class="modal-card viewer-modal-card">
        <div class="viewer-modal-header">
            <div class="viewer-meta-row">
                <span id="viewer-category" class="viewer-category-tag">News</span>
                <span class="viewer-dot">·</span>
                <span id="viewer-date" class="viewer-date">Date</span>
            </div>
            <div class="viewer-header-right">
                <span class="viewer-reading-time"><i class="fa-regular fa-clock"></i> <span id="viewer-read-time">2 min read</span></span>
                <button type="button" id="close-viewer-btn" class="viewer-close-btn" aria-label="Close article preview"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>
        <div class="viewer-modal-body">
            <h1 id="viewer-title" class="viewer-title">Title</h1>
            <div class="viewer-byline-row">
                <div class="viewer-author-avatar"><img id="viewer-author-avatar-img" src="{{ asset('images/member-placeholder.svg') }}" alt="Author avatar"></div>
                <div class="viewer-byline-text"><span class="viewer-by">By <strong id="viewer-author">Author</strong></span></div>
            </div>
            <p id="viewer-excerpt" class="viewer-excerpt" style="display:none;"></p>
            <div id="viewer-banner-wrap" class="viewer-banner" style="display:none;">
                <img id="viewer-banner-img" src="{{ asset('images/maroon.jpg') }}" alt="Article banner">
            </div>
            <div id="viewer-content" class="viewer-content-text"></div>
            <div id="viewer-remarks-wrap" class="remarks-alert-box" style="display:none;margin-top:20px;padding:14px;background:#fef3f2;border:1px solid #fee4e2;border-radius:8px;">
                <div class="remarks-alert-title" style="display:flex;align-items:center;gap:6px;font-weight:600;color:#b42318;margin-bottom:6px;">
                    <i class="fa-solid fa-comment-dots"></i>
                    <span>Editorial Feedback:</span>
                </div>
                <p id="viewer-remarks-text" class="remarks-alert-text" style="color:#b42318;font-size:0.88rem;margin:0;"></p>
            </div>
            <div id="viewer-stats-bar" class="viewer-stats-bar" style="display:none;margin-top:16px;">
                <span class="stat-pill"><i class="fa-regular fa-eye"></i> <span id="viewer-views">0</span> views</span>
            </div>
        </div>
    </div>
</div>
@endsection

@section('extra-js')
<script>
    document.addEventListener('DOMContentLoaded', () => {
        const modal = document.getElementById('article-viewer-modal');
        const closeBtn = document.getElementById('close-viewer-btn');

        document.querySelectorAll('[data-action="view"]').forEach(card => {
            card.addEventListener('click', () => {
                const raw = card.getAttribute('data-article');
                if (!raw) return;
                try {
                    const data = JSON.parse(raw);
                    document.getElementById('viewer-title').textContent = data.title || 'Untitled';
                    document.getElementById('viewer-category').textContent = data.category || 'General';
                    document.getElementById('viewer-date').textContent = data.date || '';
                    document.getElementById('viewer-author').textContent = data.author || 'Writer';

                    const words = (data.content || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
                    const mins = Math.max(1, Math.ceil(words / 200));
                    document.getElementById('viewer-read-time').textContent = mins + ' min read';

                    const excerptEl = document.getElementById('viewer-excerpt');
                    if (data.excerpt) {
                        excerptEl.textContent = data.excerpt;
                        excerptEl.style.display = 'block';
                    } else {
                        excerptEl.style.display = 'none';
                    }

                    document.getElementById('viewer-content').innerHTML = data.content || '<p>No content.</p>';

                    const remarksWrap = document.getElementById('viewer-remarks-wrap');
                    if (data.remarks) {
                        document.getElementById('viewer-remarks-text').textContent = data.remarks;
                        remarksWrap.style.display = 'block';
                    } else {
                        remarksWrap.style.display = 'none';
                    }

                    const statsBar = document.getElementById('viewer-stats-bar');
                    if (data.status === 'Published') {
                        document.getElementById('viewer-views').textContent = Number(data.views || 0).toLocaleString();
                        statsBar.style.display = 'flex';
                    } else {
                        statsBar.style.display = 'none';
                    }

                    modal.classList.remove('hidden');
                } catch (e) {
                    console.error('Error opening viewer modal:', e);
                }
            });
        });

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.add('hidden');
            });
        }
    });
</script>
@endsection
