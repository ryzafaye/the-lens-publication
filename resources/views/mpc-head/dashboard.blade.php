@extends('layouts.mpc-head')

@section('title', 'Dashboard')

@section('content')
<main class="content-container">

    <!-- Page Title Section -->
    <div class="page-title-section animate-fade-in delay-1">
        <h1 class="page-title">Dashboard</h1>
    </div>

    @if(session('success'))
        <div role="status" style="background:#e6f4ea;color:#137333;padding:12px 18px;border-radius:10px;margin-bottom:18px;font-weight:500;display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-circle-check"></i>
            <span>{{ session('success') }}</span>
        </div>
    @endif

    <!-- Metrics Row (2 per row on mobile: 1fr 1fr) -->
    <section id="metrics-grid" class="metrics-grid" aria-label="Operational metrics">
        <div class="metric-card animate-fade-in delay-1">
            <div class="metric-header">
                <span class="metric-label">Pending Approval</span>
                <div class="metric-icon-box"><i class="fa-regular fa-clock"></i></div>
            </div>
            <div class="metric-value">{{ number_format($metrics['pending'] ?? 0) }}</div>
            <div class="metric-subtitle">Awaiting M&amp;PC publication</div>
        </div>

        <div class="metric-card animate-fade-in delay-2">
            <div class="metric-header">
                <span class="metric-label">Monthly Readership</span>
                <div class="metric-icon-box"><i class="fa-regular fa-eye"></i></div>
            </div>
            <div class="metric-value">{{ number_format($metrics['total_views'] ?? 0) }}</div>
            <div class="metric-subtitle">Views across all desks</div>
        </div>

        <div class="metric-card animate-fade-in delay-3">
            <div class="metric-header">
                <span class="metric-label">Active Members</span>
                <div class="metric-icon-box"><i class="fa-solid fa-users"></i></div>
            </div>
            <div class="metric-value">{{ number_format($metrics['active_members'] ?? 0) }}</div>
            <div class="metric-subtitle">Staff &amp; editorial roster</div>
        </div>

        <div class="metric-card animate-fade-in delay-4">
            <div class="metric-header">
                <span class="metric-label">Published Stories</span>
                <div class="metric-icon-box"><i class="fa-regular fa-newspaper"></i></div>
            </div>
            <div class="metric-value">{{ number_format($metrics['published_stories'] ?? 0) }}</div>
            <div class="metric-subtitle">Live on public site</div>
        </div>
    </section>

    <!-- Main Grid (Single Column on mobile) -->
    <div class="main-grid">

        <!-- Left Column (Larger - Editorial Operations Stack) -->
        <div class="left-column-stack">

            <!-- Section 1: Ready for Publication / Pending Approval -->
            <section class="card-panel animate-fade-in delay-2" aria-labelledby="pending-approval-heading">
                <div class="panel-header">
                    <div>
                        <h2 id="pending-approval-heading" class="panel-title">Pending Approval</h2>
                        <p class="panel-subtitle" style="font-size: 0.78rem; color: #667085; margin: 2px 0 0 0;">Endorsed by Section Heads &amp; EIC, awaiting M&amp;PC publication</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span id="pending-count-badge" class="panel-badge">{{ count($pendingArticles) }} awaiting review</span>
                        <a href="{{ route('mpc-head.publish-article') }}" class="panel-action-link" style="color: #7a1526; font-weight: 600; text-decoration: none; font-size: 0.88rem;">View all &rarr;</a>
                    </div>
                </div>
                
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Article Title</th>
                                <th class="hide-on-mobile">Section</th>
                                <th>Status</th>
                                <th class="hide-on-mobile">Date</th>
                                <th class="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody id="submissions-table-body">
                            @forelse($pendingArticles as $art)
                                <tr>
                                    <td>
                                        <div style="font-weight: 600; color: #101828;">{{ $art['title'] }}</div>
                                        <div style="font-size: 0.82rem; color: #667085;">By {{ $art['author'] }}</div>
                                    </td>
                                    <td class="hide-on-mobile">
                                        <span class="table-section-tag">{{ $art['category'] }}</span>
                                    </td>
                                    <td>
                                        <span class="status-badge status-review">{{ $art['status'] }}</span>
                                    </td>
                                    <td class="hide-on-mobile">{{ $art['date'] }}</td>
                                    <td class="text-right">
                                        <button type="button" class="btn-primary-action open-article-btn" data-article="{{ json_encode($art) }}" style="padding: 6px 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">
                                            <i class="fa-solid fa-eye"></i>
                                            <span>Inspect</span>
                                        </button>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" style="text-align: center; padding: 20px 16px; color: #667085; font-size: 0.9rem;">
                                        No articles awaiting M&amp;PC publication.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Section 2: Activity Log -->
            <section class="card-panel animate-fade-in delay-3" aria-labelledby="activity-log-heading">
                <div class="panel-header">
                    <h2 id="activity-log-heading" class="panel-title">Activity Log</h2>
                    <a href="{{ route('mpc-head.activity-logs') }}" class="panel-action-link">View all &rarr;</a>
                </div>
                <div id="recent-activity-list" class="activity-timeline">
                    @forelse($recentActivities as $log)
                        <div class="activity-item" style="display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f2f4f7;">
                            <div class="activity-avatar" style="width: 34px; height: 34px; border-radius: 50%; overflow: hidden; background: #f2f4f7; flex-shrink: 0;">
                                <img src="{{ asset('images/member-placeholder.svg') }}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <div class="activity-content" style="flex: 1; font-size: 0.86rem; color: #344054;">
                                <p style="margin: 0; line-height: 1.4;">
                                    <strong>{{ $log['user'] }}</strong> ({{ $log['role'] ?? 'Editorial' }})
                                    <span style="color: #667085;">{{ $log['action'] }}</span>
                                    <strong style="color: #101828;">"{{ $log['target'] }}"</strong>
                                </p>
                                <span class="activity-time" style="font-size: 0.78rem; color: #98a2b3; display: inline-block; margin-top: 3px;">
                                    <i class="fa-regular fa-clock"></i> {{ $log['time'] }}
                                </span>
                            </div>
                        </div>
                    @empty
                        <div style="padding: 16px; color: #667085; font-size: 0.9rem; text-align: center;">
                            No recent activities recorded.
                        </div>
                    @endforelse
                </div>
            </section>

        </div>

        <!-- Right Column (Widened Analytics & Leaderboard Stack) -->
        <div class="right-column-stack">

            <!-- Section 1: Most Viewed Articles -->
            <section class="card-panel animate-fade-in delay-2" aria-labelledby="most-viewed-heading">
                <div class="panel-header">
                    <div>
                        <h2 id="most-viewed-heading" class="panel-title">Most Viewed Articles</h2>
                        <p class="panel-subtitle" style="font-size: 0.78rem; color: #667085; margin: 2px 0 0 0;">Live on public site · click to inspect or take down</p>
                    </div>
                    <span id="most-viewed-month-badge" class="panel-badge">This Month</span>
                </div>
                <div id="most-viewed-list" class="ranked-list">
                    @forelse($publishedArticles as $index => $item)
                        <div class="ranked-item open-article-btn" data-article="{{ json_encode($item) }}" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f2f4f7;">
                            <div style="display: flex; align-items: center; gap: 12px; overflow: hidden;">
                                <span style="font-weight: 700; color: #7a1526; width: 20px;">#{{ $index + 1 }}</span>
                                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    <div style="font-weight: 500; font-size: 0.9rem; color: #1d2939; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ $item['title'] }}</div>
                                    <div style="font-size: 0.8rem; color: #667085;">{{ $item['date'] }} · By {{ $item['author'] }}</div>
                                </div>
                            </div>
                            <span style="font-weight: 600; color: #344054; font-size: 0.85rem; padding-left: 12px; white-space: nowrap;">{{ number_format($item['views'] ?? 0) }} views</span>
                        </div>
                    @empty
                        <div style="padding: 20px 0; text-align: center; color: #667085; font-size: 0.88rem;">
                            No published articles recorded.
                        </div>
                    @endforelse
                </div>
            </section>

            <!-- Section 2: Top Performing Journalists -->
            <section class="card-panel animate-fade-in delay-3" aria-labelledby="top-journalists-heading">
                <div class="panel-header">
                    <h2 id="top-journalists-heading" class="panel-title">Top Performing Journalists</h2>
                    <span class="panel-badge">Leaderboard</span>
                </div>
                <div class="journalists-table-wrap">
                    <table class="journalists-table">
                        <thead>
                            <tr>
                                <th class="col-author">Author</th>
                                <th class="col-article-count" style="text-align: right;">Article Count</th>
                            </tr>
                        </thead>
                        <tbody id="top-journalists-table-body">
                            @forelse($topJournalists as $writer)
                                <tr>
                                    <td class="col-author">
                                        <span style="font-weight: 500; color: #1d2939;">{{ $writer['name'] }}</span>
                                    </td>
                                    <td class="col-article-count" style="text-align: right; font-weight: 700; color: #b42318;">{{ $writer['articleCount'] ?? 0 }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="2" style="text-align: center; padding: 16px; color: #667085; font-size: 0.88rem;">
                                        No journalists registered yet.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </section>

        </div>

    </div>

</main>

<!-- MODAL: Full Article Viewer Modal (For M&PC to View, Approve or Take Down) -->
<div id="article-viewer-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="viewer-title">
    <div class="modal-card viewer-modal-card">
        <div class="viewer-modal-header">
            <div class="viewer-meta-row">
                <span id="viewer-category" class="viewer-category-tag">News</span>
                <span class="viewer-dot">·</span>
                <span id="viewer-date" class="viewer-date">Date</span>
                <span class="viewer-dot">·</span>
                <span id="viewer-status-badge" class="status-badge status-approved">Status</span>
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

            <div id="viewer-content" class="viewer-content-text"></div>

            <div class="viewer-stats-bar" id="viewer-stats-bar" style="display: none;">
                <span class="stat-pill"><i class="fa-regular fa-eye"></i> <span id="viewer-views">0</span> views</span>
                <span class="stat-pill"><i class="fa-solid fa-share-nodes"></i> <span id="viewer-shares">0</span> shares</span>
            </div>

            <!-- Remarks Box -->
            <div id="viewer-remarks-section" class="viewer-remarks-wrap" style="display: none; margin-top: 18px; padding: 14px; background: #fafbfc; border: 1px solid #e4e7ec; border-radius: 8px;">
                <label for="viewer-remarks-input" style="display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; font-weight: 600; color: #344054; margin-bottom: 6px;">
                    <span style="display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-comment-dots" style="color: #667085;"></i>
                        <span id="viewer-remarks-label">Editorial Remarks (Required for Revision or Decline):</span>
                    </span>
                    <span id="viewer-remarks-required-badge" style="font-size: 0.70rem; color: #b42318; background: #fee4e2; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Required</span>
                </label>
                <textarea id="viewer-remarks-input" class="form-textarea" rows="3" placeholder="Enter editorial feedback for the writer before returning this story..." style="resize: vertical; font-size: 0.85rem; width: 100%; box-sizing: border-box;"></textarea>
                <div id="viewer-remarks-error" style="display: none; color: #b42318; font-size: 0.78rem; margin-top: 6px; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>Remarks are required before submitting for revision or decline.</span>
                </div>
            </div>
        </div>

        <div class="viewer-modal-footer">
            <button type="button" id="viewer-cancel-btn" class="modal-btn modal-btn-cancel">
                Close
            </button>

            <!-- Decline Button -->
            <button type="button" id="viewer-action-decline" class="modal-btn modal-btn-secondary" style="display: none; color: #b42318; border-color: #fecdca;">
                <i class="fa-solid fa-xmark"></i>
                <span>Decline</span>
            </button>

            <!-- For Revision Button -->
            <button type="button" id="viewer-action-revision" class="modal-btn modal-btn-warning" style="display: none;">
                <i class="fa-solid fa-rotate-left"></i>
                <span>For Revision</span>
            </button>

            <!-- Approve & Publish Button -->
            <button type="button" id="viewer-action-approve" class="modal-btn modal-btn-confirm-primary" style="display: none;">
                <i class="fa-solid fa-check"></i>
                <span>Approve &amp; Publish</span>
            </button>

            <!-- Take Down Article Button -->
            <button type="button" id="viewer-action-takedown" class="modal-btn modal-btn-danger" style="display: none;">
                <i class="fa-solid fa-arrow-down-from-bracket"></i>
                <span>Take Down Article</span>
            </button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', () => {
        const modal = document.getElementById('article-viewer-modal');
        const closeBtn = document.getElementById('close-viewer-btn');
        const cancelBtn = document.getElementById('viewer-cancel-btn');

        let currentArticle = null;

        document.querySelectorAll('.open-article-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const raw = btn.getAttribute('data-article');
                if (!raw) return;
                try {
                    currentArticle = JSON.parse(raw);
                    document.getElementById('viewer-title').textContent = currentArticle.title || 'Untitled';
                    document.getElementById('viewer-category').textContent = currentArticle.category || 'General';
                    document.getElementById('viewer-date').textContent = currentArticle.date || '';
                    document.getElementById('viewer-author').textContent = currentArticle.author || 'Writer';

                    const statusBadge = document.getElementById('viewer-status-badge');
                    statusBadge.textContent = currentArticle.status;

                    const words = (currentArticle.content || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
                    document.getElementById('viewer-read-time').textContent = Math.max(1, Math.ceil(words / 200)) + ' min read';

                    const excerptEl = document.getElementById('viewer-excerpt');
                    if (currentArticle.excerpt) {
                        excerptEl.textContent = currentArticle.excerpt;
                        excerptEl.style.display = 'block';
                    } else {
                        excerptEl.style.display = 'none';
                    }

                    document.getElementById('viewer-content').innerHTML = currentArticle.content || '<p>No content.</p>';

                    const statsBar = document.getElementById('viewer-stats-bar');
                    const approveBtn = document.getElementById('viewer-action-approve');
                    const revisionBtn = document.getElementById('viewer-action-revision');
                    const declineBtn = document.getElementById('viewer-action-decline');
                    const takedownBtn = document.getElementById('viewer-action-takedown');
                    const remarksSection = document.getElementById('viewer-remarks-section');

                    if (currentArticle.status === 'Published') {
                        statsBar.style.display = 'flex';
                        document.getElementById('viewer-views').textContent = Number(currentArticle.views || 0).toLocaleString();
                        document.getElementById('viewer-shares').textContent = Number(currentArticle.shares || 0).toLocaleString();
                        approveBtn.style.display = 'none';
                        revisionBtn.style.display = 'none';
                        declineBtn.style.display = 'none';
                        remarksSection.style.display = 'none';
                        takedownBtn.style.display = 'inline-flex';
                    } else {
                        statsBar.style.display = 'none';
                        approveBtn.style.display = 'inline-flex';
                        revisionBtn.style.display = 'inline-flex';
                        declineBtn.style.display = 'inline-flex';
                        remarksSection.style.display = 'block';
                        takedownBtn.style.display = 'none';
                    }

                    modal.classList.remove('hidden');
                } catch (e) {
                    console.error('Error opening MPC article modal:', e);
                }
            });
        });

        function hideModal() {
            modal.classList.add('hidden');
            currentArticle = null;
        }

        if (closeBtn) closeBtn.addEventListener('click', hideModal);
        if (cancelBtn) cancelBtn.addEventListener('click', hideModal);
        if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

        async function submitAction(endpoint, payload = {}) {
            if (!currentArticle) return;
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            try {
                const response = await fetch(`{{ url('/mpc-head/articles') }}/${currentArticle.id}/${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (result.success || response.ok) {
                    window.location.reload();
                } else {
                    alert(result.message || 'Operation failed.');
                }
            } catch (err) {
                console.error(err);
                alert('An error occurred.');
            }
        }

        document.getElementById('viewer-action-approve')?.addEventListener('click', () => {
            if (confirm('Approve and publish this article immediately to the public site?')) {
                submitAction('approve');
            }
        });

        document.getElementById('viewer-action-revision')?.addEventListener('click', () => {
            const remarks = document.getElementById('viewer-remarks-input').value.trim();
            if (!remarks) {
                document.getElementById('viewer-remarks-error').style.display = 'flex';
                return;
            }
            submitAction('revision', { remarks });
        });

        document.getElementById('viewer-action-decline')?.addEventListener('click', () => {
            const remarks = document.getElementById('viewer-remarks-input').value.trim();
            if (!remarks) {
                document.getElementById('viewer-remarks-error').style.display = 'flex';
                return;
            }
            if (confirm('Decline this article?')) {
                submitAction('decline', { remarks });
            }
        });

        document.getElementById('viewer-action-takedown')?.addEventListener('click', () => {
            if (confirm('Take down this article from the public site?')) {
                submitAction('takedown');
            }
        });
    });
</script>
@endpush
