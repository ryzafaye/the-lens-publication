/**
 * The Lens — Editor-in-Chief (EIC) Dashboard Script
 * Clean, Reusable & Modular Implementation matching Executive Dashboard logic & design
 * 
 * Features:
 * 1. Auth Guard (Redirects to login if userRole is missing)
 * 2. Real-Time Clock & Shell Integration
 * 3. Data-Driven Hydration from Shared Dataset (localStorage / articles.js):
 *    - 4 Metrics Cards (Pending Approvals, Monthly Readership, Active Members, Published Stories)
 *    - Activity Log with "View all"
 *    - Pending Approval (Top 5 table with direct article viewer modal triggers)
 *    - Most Viewed Articles (Maroon category above title, Pen-nib author icon, Views & Shares)
 *    - Top Performing Journalists Leaderboard
 * 4. In-Place Article Viewer Modal:
 *    - Opens full story overlay directly
 *    - Bottom actions: Edit Article, Move to Archive, Emergency Delete
 *    - Full synchronization with localStorage('executiveArticles')
 */

import { articles as defaultArticles } from './articles.js';

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. AUTHENTICATION & ROLE VERIFICATION
    // =========================================================================
    const userRole = window.LARAVEL_USER_ROLE || localStorage.getItem('eicRole') || localStorage.getItem('userRole') || 'Editor-in-Chief';

    // =========================================================================
    // 2. HELPER UTILITIES: ESCAPE HTML & TOAST NOTIFICATIONS
    // =========================================================================
    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function decodeCorruptedHtmlEntities(str) {
        if (!str || typeof str !== 'string') return '';
        let decoded = str;
        let maxPasses = 5;
        while (maxPasses > 0 && (/&amp;(?:lt|gt|quot|#39|amp);/i.test(decoded) || /&(?:lt|gt);/i.test(decoded))) {
            const txt = document.createElement('textarea');
            txt.innerHTML = decoded;
            const newDecoded = txt.value;
            if (newDecoded === decoded) break;
            decoded = newDecoded;
            maxPasses--;
        }
        return decoded;
    }

    function formatCleanArticleContent(rawContent) {
        if (!rawContent || !String(rawContent).trim()) {
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this manuscript.</p>';
        }

        // 1. Decode any corrupted or double-encoded HTML entities so tags are real HTML
        let content = decodeCorruptedHtmlEntities(String(rawContent).trim());

        // 2. Strip dangerous script/iframe tags and inline event handlers
        content = content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

        // 3. Unwrap unnecessary span tags while keeping their text intact
        content = content
            .replace(/<\/?span[^>]*>/gi, '')
            .replace(/\s*style="[^"]*"/gi, '')
            .replace(/\s*style='[^']*'/gi, '');

        // 4. Normalize any broken <div><br><div> constructs to standard <div><br></div>
        content = content
            .replace(/<div><br\s*\/?><div>/gi, '<div><br></div>');

        // 5. Check if the content contains HTML structural tags
        const hasHtmlTags = /<\/?(?:div|p|br|h[1-6]|blockquote|ul|ol|li|strong|b|em|i|u|s|a|hr)[^>]*>/i.test(content);

        if (hasHtmlTags) {
            // Injected as true HTML: do NOT pass through escapeHTML() so formatting and line breaks render correctly
            return content;
        }

        // 6. Plain-text fallback: split into paragraphs and map to paragraph elements
        const paragraphs = content
            .split(/\r?\n\r?\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        if (paragraphs.length === 0) {
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this manuscript.</p>';
        }

        return paragraphs.map(p => `<p class="viewer-paragraph">${escapeHTML(p).replace(/\r?\n/g, '<br>')}</p>`).join('');
    }

    const toastContainer = document.getElementById('toast-container');
    function showToast(message, type = 'success') {
        if (!toastContainer) return;

        // Dismiss existing toast immediately to prevent stacking or flashing
        const existingToasts = toastContainer.querySelectorAll('.toast-message');
        existingToasts.forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;

        toast.innerHTML = `<span class="toast-bullet-dot"></span><span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-dismissing');
            setTimeout(() => toast.remove(), 260);
        }, 3200);
    }

    // =========================================================================
    // 3. SHARED ARTICLES DATASET & PERSISTENCE
    // =========================================================================
    function getStoredArticles() {
        if (window.__DASHBOARD_ARTICLES__ && Array.isArray(window.__DASHBOARD_ARTICLES__) && window.__DASHBOARD_ARTICLES__.length > 0) {
            return window.__DASHBOARD_ARTICLES__;
        }
        try {
            const pubRaw = localStorage.getItem('theLensPublishedArticles');
            if (pubRaw) {
                const pubParsed = JSON.parse(pubRaw);
                if (Array.isArray(pubParsed) && pubParsed.length > 0) return pubParsed;
            }
            const raw = localStorage.getItem('executiveArticles');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('Could not read executiveArticles from localStorage', e);
        }
        return [];
    }

    function saveArticles(list) {
        try {
            localStorage.setItem('executiveArticles', JSON.stringify(list));
        } catch (e) {
            console.warn('Could not persist executiveArticles to localStorage', e);
        }
    }

    let articles = getStoredArticles();

    // =========================================================================
    // 4. DYNAMIC MONTH & DATA HYDRATION
    // =========================================================================
    const now = new Date();
    const currentMonthName = now.toLocaleString('en-US', { month: 'long' });

    // Set dynamic month badge in Most Viewed Articles panel
    const mostViewedMonthBadge = document.getElementById('most-viewed-month-badge');
    if (mostViewedMonthBadge) {
        mostViewedMonthBadge.textContent = currentMonthName;
    }

    // Activity Log Static Entries (Top 5 Recent with avatars)
    const ACTIVITY_LOG_DATA = [];

    // Pending Review Queue Dataset & Persistence
    const DEFAULT_PENDING_ARTICLES = [];

    function getPendingQueue() {
        if (window.__DASHBOARD_PENDING__ && Array.isArray(window.__DASHBOARD_PENDING__)) {
            return window.__DASHBOARD_PENDING__;
        }
        try {
            const raw = localStorage.getItem('eicPendingReviewQueue') || localStorage.getItem('executivePendingReviewQueue');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.warn('Could not read pending review queue', e);
        }
        return [];
    }

    function getStatusBadgeHtml(status) {
        const lower = (status || 'approved').toLowerCase();
        if (lower === 'approved' || lower === 'published') {
            return `<span class="status-badge status-approved">Approved</span>`;
        }
        if (lower === 'in review' || lower === 'review' || lower === 'pending') {
            return `<span class="status-badge status-review">Pending</span>`;
        }
        return `<span class="status-badge status-draft">Draft</span>`;
    }

    // =========================================================================
    // 5. DASHBOARD RENDERING PIPELINE
    // =========================================================================
    function renderDashboard() {
        const activeArticles = articles.filter(a => !a.isArchived);
        const totalViews = activeArticles.reduce((sum, a) => sum + (Number(a.views) || 0), 0);
        const pendingList = getPendingQueue();

        // A. Metrics Cards (3 Cards in One Line: Active Members removed)
        const metricsContainer = document.getElementById('metrics-grid');
        if (metricsContainer) {
            const serverMetrics = window.__DASHBOARD_METRICS__;
            const pendingVal = (serverMetrics && serverMetrics.pending !== undefined)
                ? String(serverMetrics.pending)
                : String(pendingList.length);
            const viewsVal = (serverMetrics && serverMetrics.total_views !== undefined)
                ? Number(serverMetrics.total_views).toLocaleString()
                : totalViews.toLocaleString();
            const publishedVal = (serverMetrics && serverMetrics.published_stories !== undefined)
                ? String(serverMetrics.published_stories)
                : String(activeArticles.length);

            const metrics = [
                {
                    label: "Pending Approvals",
                    value: pendingVal,
                    subtitle: "Awaiting editorial review",
                    icon: "fa-regular fa-clock",
                    delayClass: "delay-1"
                },
                {
                    label: "Monthly Readership",
                    value: viewsVal,
                    subtitle: "Views across all desks",
                    icon: "fa-regular fa-eye",
                    delayClass: "delay-2"
                },
                {
                    label: "Published Stories",
                    value: publishedVal,
                    subtitle: "Total overall published",
                    icon: "fa-regular fa-newspaper",
                    delayClass: "delay-3"
                }
            ];

            metricsContainer.innerHTML = metrics.map(item => `
                <div class="metric-card animate-fade-in ${item.delayClass}">
                    <div class="metric-header">
                        <span class="metric-label">${escapeHTML(item.label)}</span>
                        <div class="metric-icon-box">
                            <i class="${item.icon}"></i>
                        </div>
                    </div>
                    <div class="metric-value">${escapeHTML(item.value)}</div>
                    <div class="metric-subtitle">${escapeHTML(item.subtitle)}</div>
                </div>
            `).join('');
        }

        // B. Activity Log (Top 5 Recent with Causer Action Subject Format)
        const activityContainer = document.getElementById('recent-activity-list');
        if (activityContainer) {
            let logsToDisplay = (window.INITIAL_ACTIVITIES && Array.isArray(window.INITIAL_ACTIVITIES))
                ? window.INITIAL_ACTIVITIES
                : (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.recentActivities))
                    ? window.INITIAL_DATA.recentActivities
                    : (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.activities))
                        ? window.INITIAL_DATA.activities
                        : ACTIVITY_LOG_DATA;
            try {
                const storedLogs = localStorage.getItem('executiveActivityLogs_v1');
                if (storedLogs && logsToDisplay === ACTIVITY_LOG_DATA) {
                    const parsed = JSON.parse(storedLogs);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        logsToDisplay = parsed.slice(0, 5).map(item => ({
                            user: item.causer,
                            avatar: item.causerAvatar || 'images/member-placeholder.svg',
                            action: item.action,
                            subjectType: item.subjectType || 'Article',
                            target: item.subjectName,
                            time: item.timestampText
                        }));
                    }
                }
            } catch (e) {
                // Fallback to default
            }

            if (logsToDisplay.length === 0) {
                activityContainer.innerHTML = '<p style="font-size: 0.95rem; color: var(--text-muted, #667085); padding: 28px 16px; text-align: center; margin: 0;">No recent activities.</p>';
            } else {
                const actLogsUrl = window.__ACTIVITY_LOGS_URL__ || '/eic/activity-logs';
                activityContainer.innerHTML = logsToDisplay.map(item => `
                    <div class="activity-item" onclick="window.location.href='${actLogsUrl}'" style="cursor: pointer;" title="Open Activity Log">
                        <div class="activity-avatar">
                            <img src="${item.avatar}" alt="${escapeHTML(item.user)}">
                        </div>
                        <div class="activity-details">
                            <p class="activity-text">
                                <strong>${escapeHTML(item.user)}</strong> ${escapeHTML(item.action)} the ${escapeHTML(item.subjectType || 'Article')} <em>"${escapeHTML(item.target)}"</em> <span style="color:#667085; font-size:0.75rem; margin-left:3px;">${escapeHTML(item.time)}.</span>
                            </p>
                            <span class="activity-time">${escapeHTML(item.time)}</span>
                        </div>
                    </div>
                `).join('');
            }
        }

        // C. Pending Approval (Top 5 Table with Direct Modal View Trigger)
        const tableBody = document.getElementById('submissions-table-body');
        
        function formatSectionBadgeHtml(category) {
            if (!category) return '';
            const catStr = String(category).trim();
            // Put "Technology" on the next line for optimal editorial fit
            if (/^science\s+and\s+technology$/i.test(catStr)) {
                return `<span class="table-section-tag section-tag-multiline">Science and<br>Technology</span>`;
            }
            if (/^science\s+&\s+technology$/i.test(catStr)) {
                return `<span class="table-section-tag section-tag-multiline">Science &amp;<br>Technology</span>`;
            }
            return `<span class="table-section-tag">${escapeHTML(catStr)}</span>`;
        }

        const reviewArticlesUrl = window.__REVIEW_ARTICLES_URL__ || '/eic/review-articles';
        if (tableBody) {
            const topPending = pendingList.slice(0, 5);

            if (topPending.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 28px 16px; font-size: 0.95rem; color: var(--text-muted, #667085);">No pending submissions awaiting review.</td></tr>`;
            } else {
                tableBody.innerHTML = topPending.map(art => `
                    <tr>
                        <td>
                            <div class="table-article-info">
                                <button type="button" class="table-article-btn" data-action="view-modal" data-id="${escapeHTML(art.id)}" data-article="${escapeHTML(JSON.stringify(art))}" title="${escapeHTML(art.title)}">
                                    ${escapeHTML(art.title)}
                                </button>
                                <div class="table-author-subline">
                                    <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
                                    <span>${escapeHTML(art.author || 'Author')}</span>
                                </div>
                            </div>
                        </td>
                        <td>${formatSectionBadgeHtml(art.category || 'General')}</td>
                        <td><span class="status-badge status-review">Pending</span></td>
                        <td class="hide-on-mobile"><span class="table-date">${escapeHTML(art.date)}</span></td>
                        <td class="text-right">
                            <a href="${reviewArticlesUrl}" class="table-manage-btn" title="Review Article">
                                Manage
                            </a>
                        </td>
                    </tr>
                `).join('');
            }
        }

        // D. Most Viewed Articles (Top 3 by Views: Category ABOVE title in maroon, Title in middle, Author below)
        const mostViewedContainer = document.getElementById('most-viewed-list');
        if (mostViewedContainer) {
            const mostViewed = [...activeArticles]
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 3);

            if (mostViewed.length === 0) {
                mostViewedContainer.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted, #667085); padding: 28px 16px; text-align: center; margin: 0;">No published articles yet.</p>';
            } else {
                mostViewedContainer.innerHTML = mostViewed.map((art, idx) => `
                    <div class="ranked-item" data-action="view-modal" data-article-id="${art.id}" data-article="${escapeHTML(JSON.stringify(art))}">
                        <span class="rank-number ${idx === 0 ? 'top-rank' : ''}">${idx + 1}</span>
                        <div class="ranked-content">
                            <div class="ranked-category-tag">${escapeHTML(art.category)}</div>
                            <button type="button" class="ranked-title-btn" data-action="view-modal" data-id="${art.id}" data-article="${escapeHTML(JSON.stringify(art))}" title="${escapeHTML(art.title)}">
                                ${escapeHTML(art.title)}
                            </button>
                            <div class="ranked-meta-row">
                                <span class="ranked-author"><i class="fa-solid fa-pen-nib" aria-hidden="true" style="font-size: 0.70rem; margin-right: 4px; color: var(--text-muted, #667085);"></i>${escapeHTML(art.author)}</span>
                                <span class="ranked-stats">
                                    <span class="stat-metric" title="Views"><i class="fa-regular fa-eye"></i> ${Number(art.views || 0).toLocaleString()}</span>
                                    <span class="stat-sep">•</span>
                                    <span class="stat-metric" title="Shares"><i class="fa-solid fa-share-nodes"></i> ${Number(art.shares || 0).toLocaleString()}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }

        // E. Top Performing Journalists (Table Layout: Name & Number Only)
        const topJournalistsTableBody = document.getElementById('top-journalists-table-body');
        const topJournalistsContainer = document.getElementById('top-journalists-list');

        const authorCounts = {};
        activeArticles.forEach(a => {
            if (a.author) {
                authorCounts[a.author] = (authorCounts[a.author] || 0) + 1;
            }
        });

        const topJournalists = Object.entries(authorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({
                name,
                count
            }));

        if (topJournalists.length === 0) {
            if (topJournalistsTableBody) {
                topJournalistsTableBody.innerHTML = '<tr><td colspan="2" style="font-size: 0.85rem; color: #667085; text-align: center; padding: 24px 0; border-bottom: none; pointer-events: none; background: transparent;">No data available yet</td></tr>';
            } else if (topJournalistsContainer) {
                topJournalistsContainer.innerHTML = '<div style="font-size: 0.85rem; color: #667085; text-align: center; padding: 24px 0;">No data available yet</div>';
            }
        } else if (topJournalistsTableBody) {
            topJournalistsTableBody.innerHTML = topJournalists.map(j => `
                <tr>
                    <td class="col-author-name">${escapeHTML(j.name)}</td>
                    <td class="col-article-count">${j.count}</td>
                </tr>
            `).join('');
        } else if (topJournalistsContainer) {
            topJournalistsContainer.innerHTML = topJournalists.map(j => `
                <div class="journalist-item">
                    <span class="journalist-name">${escapeHTML(j.name)}</span>
                    <span class="journalist-count-badge">${j.count}</span>
                </div>
            `).join('');
        }
    }

    // Initial Dashboard Render
    renderDashboard();

    // =========================================================================
    // 6. MODALS SYSTEM: VIEWER, EDIT, & ACTION CONFIRMATION
    // =========================================================================
    let currentViewingArticleId = null;
    let pendingModalAction = null;

    // Modals DOM References
    const viewerModal = document.getElementById('article-viewer-modal');
    const closeViewerBtn = document.getElementById('close-viewer-btn');
    const viewerTitle = document.getElementById('viewer-title');
    const viewerCategory = document.getElementById('viewer-category');
    const viewerDate = document.getElementById('viewer-date');
    const viewerAuthor = document.getElementById('viewer-author');
    const viewerReadTime = document.getElementById('viewer-read-time');
    const viewerContent = document.getElementById('viewer-content');
    const viewerViews = document.getElementById('viewer-views');
    const viewerShares = document.getElementById('viewer-shares');
    const viewerActionEdit = document.getElementById('viewer-action-edit');
    const viewerActionArchive = document.getElementById('viewer-action-archive');
    const viewerArchiveLabel = document.getElementById('viewer-archive-label');
    const viewerActionDelete = document.getElementById('viewer-action-delete');

    // Edit Modal DOM References
    const editModal = document.getElementById('edit-article-modal');
    const closeEditBtn = document.getElementById('close-edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const editArticleForm = document.getElementById('edit-article-form');
    const editArticleIdInput = document.getElementById('edit-article-id');
    const editTitleInput = document.getElementById('edit-title-input');
    const editAuthorInput = document.getElementById('edit-author-input');
    const editCategorySelect = document.getElementById('edit-category-select');
    const editReadtimeInput = document.getElementById('edit-readtime-input');
    const editExcerptInput = document.getElementById('edit-excerpt-input');

    // Action Confirmation Modal DOM References
    const actionModal = document.getElementById('action-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalIconHeader = document.getElementById('modal-icon-header');
    const modalIcon = document.getElementById('modal-icon');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    // -------------------------------------------------------------------------
    // Article Viewer Modal Logic
    // -------------------------------------------------------------------------
    function openArticleViewer(idOrArticle) {
        let article = typeof idOrArticle === 'object' && idOrArticle !== null ? idOrArticle : null;
        if (!article) {
            const pendingList = getPendingQueue();
            article = articles.find(a => String(a.id) === String(idOrArticle)) ||
                      pendingList.find(a => String(a.id) === String(idOrArticle));
        }
        if (!article || !viewerModal) return;

        currentViewingArticleId = article.id;

        // Populate metadata
        if (viewerTitle) viewerTitle.textContent = article.title;
        if (viewerCategory) viewerCategory.textContent = article.category;
        if (viewerDate) viewerDate.textContent = article.date;
        if (viewerAuthor) viewerAuthor.textContent = article.author || 'Author';
        if (viewerReadTime) viewerReadTime.textContent = article.readTime || '3 min read';
        if (viewerViews) viewerViews.textContent = article.views !== undefined ? Number(article.views).toLocaleString() : '—';
        if (viewerShares) viewerShares.textContent = article.shares !== undefined ? Number(article.shares).toLocaleString() : '—';

        const isPublishedStory = articles.some(a => String(a.id) === String(article.id));
        const statusLower = (article.status || 'pending').toLowerCase();
        const isPending = !isPublishedStory || statusLower.includes('pending') || statusLower.includes('review');

        const reviewActions = document.getElementById('viewer-review-actions');
        const publishedActions = document.getElementById('viewer-published-actions');
        const remarksSection = document.getElementById('viewer-remarks-section');
        const statsBar = document.getElementById('viewer-stats-bar');

        if (isPending) {
            if (reviewActions) reviewActions.style.display = 'flex';
            if (publishedActions) publishedActions.style.display = 'none';
            if (remarksSection) remarksSection.style.display = 'block';
            if (statsBar) statsBar.style.display = 'none';
        } else {
            if (reviewActions) reviewActions.style.display = 'none';
            if (publishedActions) publishedActions.style.display = 'flex';
            if (remarksSection) remarksSection.style.display = 'none';
            if (statsBar) statsBar.style.display = 'flex';
        }

        const viewerRemarks = document.getElementById('viewer-remarks');
        const viewerRemarksError = document.getElementById('viewer-remarks-error');
        if (viewerRemarks) {
            viewerRemarks.value = '';
            viewerRemarks.classList.remove('input-invalid');
        }
        if (viewerRemarksError) {
            viewerRemarksError.classList.add('hidden');
        }

        if (viewerArchiveLabel) {
            if (isPublishedStory) {
                viewerArchiveLabel.textContent = article.isArchived ? 'Restore Article' : 'Move to Archive';
                if (viewerActionArchive) viewerActionArchive.style.display = 'inline-flex';
            } else {
                if (viewerActionArchive) viewerActionArchive.style.display = 'none';
            }
        }

        if (viewerActionDelete) {
            viewerActionDelete.style.display = isPublishedStory ? 'inline-flex' : 'none';
        }

        // Paragraphs
        if (viewerContent) {
            viewerContent.innerHTML = formatCleanArticleContent(article.content || article.excerpt);
        }

                const viewerExcerpt = document.getElementById('viewer-excerpt');
        if (viewerExcerpt) {
            const rawExcerpt = (typeof article !== 'undefined' ? article.excerpt : '') || (typeof item !== 'undefined' ? item.excerpt : '') || (typeof art !== 'undefined' ? art.excerpt : '') || '';
            if (rawExcerpt && rawExcerpt.trim()) {
                viewerExcerpt.textContent = rawExcerpt.trim();
                viewerExcerpt.style.display = 'block';
            } else {
                viewerExcerpt.style.display = 'none';
            }
        }

        // Banner Image
        const bannerWrap = document.getElementById('viewer-banner-wrap');
        const bannerImg = document.getElementById('viewer-banner-img');
        if (bannerWrap && bannerImg) {
            if (article.image) {
                bannerImg.src = article.image;
                bannerImg.alt = article.title;
                bannerWrap.style.display = 'block';
            } else {
                bannerWrap.style.display = 'none';
            }
        }

        viewerModal.classList.remove('hidden');
    }

    function closeViewerModal() {
        if (!viewerModal) return;
        viewerModal.classList.add('hidden');
        currentViewingArticleId = null;
    }

    function removePendingArticleFromDashboard(id) {
        if (window.__DASHBOARD_PENDING__) {
            window.__DASHBOARD_PENDING__ = window.__DASHBOARD_PENDING__.filter(a => String(a.id) !== String(id));
        }
        let queue = getPendingQueue().filter(a => String(a.id) !== String(id));
        try {
            localStorage.setItem('eicPendingReviewQueue', JSON.stringify(queue));
            localStorage.setItem('executivePendingReviewQueue', JSON.stringify(queue));
        } catch (e) {}

        renderDashboard();
    }

    const viewerApproveBtn = document.getElementById('viewer-approve-btn');
    const viewerRevisionBtn = document.getElementById('viewer-revision-btn');
    const viewerRemarks = document.getElementById('viewer-remarks');
    const viewerRemarksError = document.getElementById('viewer-remarks-error');

    if (viewerApproveBtn) {
        viewerApproveBtn.addEventListener('click', async () => {
            if (!currentViewingArticleId) return;
            const targetId = currentViewingArticleId;

            viewerApproveBtn.disabled = true;
            if (viewerRevisionBtn) viewerRevisionBtn.disabled = true;
            const originalHtml = viewerApproveBtn.innerHTML;
            viewerApproveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Approving...</span>';

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            try {
                const response = await fetch(`/eic/review-articles/${targetId}/approve`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    }
                });

                const data = await response.json().catch(() => ({}));

                if (response.ok && data.success !== false) {
                    // Forward approved article to M&PC publishing queue in localStorage for instant parity
                    try {
                        const pendingList = getPendingQueue();
                        const art = articles.find(a => String(a.id) === String(targetId)) ||
                                    pendingList.find(a => String(a.id) === String(targetId));
                        if (art) {
                            let mpcList = [];
                            const rawMpc = localStorage.getItem('mpc_publish_articles_v2');
                            if (rawMpc) {
                                try {
                                    const parsed = JSON.parse(rawMpc);
                                    if (Array.isArray(parsed)) mpcList = parsed;
                                } catch (e) {}
                            }
                            const approverName = window.LARAVEL_USER_NAME || localStorage.getItem('userName') || localStorage.getItem('eicName') || 'Editor-in-Chief';
                            const approverRole = window.LARAVEL_USER_ROLE || localStorage.getItem('userRole') || localStorage.getItem('eicRole') || 'Editor-in-Chief';

                            mpcList = mpcList.filter(a => String(a.id) !== String(art.id));
                            mpcList.unshift({
                                id: art.id,
                                title: art.title,
                                category: art.category,
                                categorySlug: (art.category || 'news').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                author: art.author,
                                sectionHead: art.endorsedBy || art.sectionHead || 'Section Head Endorsement',
                                eicApprover: `${approverName} (${approverRole})`,
                                readTime: art.readTime || '3 min read',
                                dateApproved: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                rawDate: art.rawDate || new Date().toISOString().split('T')[0],
                                status: 'ready',
                                assignedCoverId: '',
                                excerpt: art.excerpt || '',
                                body: art.content || art.body || '<p>Manuscript content approved.</p>'
                            });
                            localStorage.setItem('mpc_publish_articles_v2', JSON.stringify(mpcList));
                        }
                    } catch (e) {
                        console.error('Failed to sync to MPC publishing queue:', e);
                    }

                    closeViewerModal();
                    showToast(data.message || 'Article approved and forwarded to Media & Publication Committee.', 'success');
                    removePendingArticleFromDashboard(targetId);
                } else {
                    showToast(data.message || 'Failed to approve manuscript.', 'danger');
                }
            } catch (err) {
                console.error('EIC approval error:', err);
                showToast('A network error occurred while approving the manuscript.', 'danger');
            } finally {
                viewerApproveBtn.disabled = false;
                if (viewerRevisionBtn) viewerRevisionBtn.disabled = false;
                viewerApproveBtn.innerHTML = originalHtml;
            }
        });
    }

    if (viewerRevisionBtn) {
        viewerRevisionBtn.addEventListener('click', async () => {
            if (!currentViewingArticleId) return;
            const targetId = currentViewingArticleId;

            const remarks = viewerRemarks ? viewerRemarks.value.trim() : '';
            if (!remarks) {
                if (viewerRemarks) {
                    viewerRemarks.classList.add('input-invalid');
                    viewerRemarks.focus();
                }
                if (viewerRemarksError) {
                    viewerRemarksError.classList.remove('hidden');
                }
                return;
            }

            viewerRevisionBtn.disabled = true;
            if (viewerApproveBtn) viewerApproveBtn.disabled = true;
            const originalHtml = viewerRevisionBtn.innerHTML;
            viewerRevisionBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Returning...</span>';

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            try {
                const response = await fetch(`/eic/review-articles/${targetId}/revision`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ remarks: remarks })
                });

                const data = await response.json().catch(() => ({}));

                if (response.ok && data.success !== false) {
                    closeViewerModal();
                    showToast(data.message || 'Article returned to writer with revision remarks.', 'warning');
                    removePendingArticleFromDashboard(targetId);
                } else {
                    showToast(data.message || 'Failed to return manuscript for revision.', 'danger');
                }
            } catch (err) {
                console.error('EIC revision error:', err);
                showToast('A network error occurred while returning the manuscript.', 'danger');
            } finally {
                viewerRevisionBtn.disabled = false;
                if (viewerApproveBtn) viewerApproveBtn.disabled = false;
                viewerRevisionBtn.innerHTML = originalHtml;
            }
        });
    }

    if (viewerRemarks) {
        viewerRemarks.addEventListener('input', () => {
            if (viewerRemarks.value.trim().length > 0) {
                viewerRemarks.classList.remove('input-invalid');
                if (viewerRemarksError) viewerRemarksError.classList.add('hidden');
            }
        });
    }

    if (closeViewerBtn) closeViewerBtn.addEventListener('click', closeViewerModal);
    if (viewerModal) {
        viewerModal.addEventListener('click', (e) => {
            if (e.target === viewerModal) closeViewerModal();
        });
    }

    // -------------------------------------------------------------------------
    // Action Confirmation Modal Logic
    // -------------------------------------------------------------------------
    function openActionModal(type, title, description, confirmText, onConfirm) {
        if (!actionModal) return;

        if (modalIconHeader) {
            modalIconHeader.className = `modal-icon-header ${type}`;
        }

        if (modalIcon) {
            if (type === 'danger') modalIcon.className = 'fa-solid fa-triangle-exclamation';
            else if (type === 'warning') modalIcon.className = 'fa-solid fa-box-archive';
            else modalIcon.className = 'fa-solid fa-arrow-rotate-left';
        }

        if (modalTitle) modalTitle.textContent = title;
        if (modalDescription) modalDescription.textContent = description;
        if (modalConfirmBtn) {
            modalConfirmBtn.textContent = confirmText;
            modalConfirmBtn.className = `modal-btn ${type === 'danger' ? 'modal-btn-confirm-danger' : 'modal-btn-confirm-primary'}`;
        }

        pendingModalAction = onConfirm;
        actionModal.classList.remove('hidden');
    }

    function closeActionModal() {
        if (!actionModal) return;
        actionModal.classList.add('hidden');
        pendingModalAction = null;
    }

    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener('click', () => {
            if (typeof pendingModalAction === 'function') {
                pendingModalAction();
            }
            closeActionModal();
        });
    }

    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeActionModal);
    if (actionModal) {
        actionModal.addEventListener('click', (e) => {
            if (e.target === actionModal) closeActionModal();
        });
    }

    // -------------------------------------------------------------------------
    // Viewer Bottom Actions: Edit, Move to Archive/Restore, Emergency Delete
    // -------------------------------------------------------------------------
    if (viewerActionEdit) {
        viewerActionEdit.addEventListener('click', () => {
            if (currentViewingArticleId) {
                const id = currentViewingArticleId;
                closeViewerModal();
                openEditModal(id);
            }
        });
    }

    if (viewerActionArchive) {
        viewerActionArchive.addEventListener('click', () => {
            if (currentViewingArticleId) {
                const id = currentViewingArticleId;
                const art = articles.find(a => String(a.id) === String(id));
                if (!art) return;
                closeViewerModal();

                if (art.isArchived) {
                    openActionModal(
                        'info',
                        'Restore Article',
                        `Restore "${art.title}" back to active editorial circulation?`,
                        'Restore Article',
                        () => {
                            art.isArchived = false;
                            saveArticles(articles);
                            renderDashboard();
                            showToast(`"${art.title}" restored to Active Articles.`, 'success');
                        }
                    );
                } else {
                    openActionModal(
                        'warning',
                        'Move Article to Archive',
                        `Are you sure you want to move "${art.title}" to the archived editions?`,
                        'Move to Archive',
                        () => {
                            art.isArchived = true;
                            saveArticles(articles);
                            renderDashboard();
                            showToast(`"${art.title}" moved to Archive.`, 'info');
                        }
                    );
                }
            }
        });
    }

    if (viewerActionDelete) {
        viewerActionDelete.addEventListener('click', () => {
            if (currentViewingArticleId) {
                const id = currentViewingArticleId;
                const art = articles.find(a => String(a.id) === String(id));
                if (!art) return;
                closeViewerModal();

                openActionModal(
                    'danger',
                    'Emergency Delete Article',
                    `PERMANENT ACTION: Are you sure you want to permanently delete "${art.title}" by ${art.author}? This operation cannot be reversed.`,
                    'Emergency Delete',
                    () => {
                        articles = articles.filter(a => String(a.id) !== String(id));
                        saveArticles(articles);
                        renderDashboard();
                        showToast(`Article permanently deleted.`, 'danger');
                    }
                );
            }
        });
    }

    // -------------------------------------------------------------------------
    // Edit Modal Logic & Form Handling
    // -------------------------------------------------------------------------
    function openEditModal(id) {
        const article = articles.find(a => String(a.id) === String(id));
        if (!article || !editModal) return;

        if (editArticleIdInput) editArticleIdInput.value = article.id;
        if (editTitleInput) editTitleInput.value = article.title;
        if (editAuthorInput) editAuthorInput.value = article.author;
        if (editCategorySelect) editCategorySelect.value = article.category;
        if (editReadtimeInput) editReadtimeInput.value = article.readTime || '2 min read';
        if (editExcerptInput) editExcerptInput.value = article.excerpt || '';

        editModal.classList.remove('hidden');
    }

    function closeEditModal() {
        if (!editModal) return;
        editModal.classList.add('hidden');
        if (editArticleForm) editArticleForm.reset();
    }

    if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) closeEditModal();
        });
    }

    if (editArticleForm) {
        editArticleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = editArticleIdInput.value;
            const targetIndex = articles.findIndex(a => String(a.id) === String(id));

            if (targetIndex !== -1) {
                const updated = {
                    ...articles[targetIndex],
                    title: editTitleInput.value.trim(),
                    author: editAuthorInput.value.trim(),
                    category: editCategorySelect.value,
                    readTime: editReadtimeInput.value.trim() || '2 min read',
                    excerpt: editExcerptInput.value.trim()
                };

                articles[targetIndex] = updated;
                saveArticles(articles);
                renderDashboard();
                closeEditModal();
                showToast(`Article "${updated.title}" updated successfully!`, 'success');
            }
        });
    }

    // -------------------------------------------------------------------------
    // Event Delegation: Click on Article to View Full Story
    // -------------------------------------------------------------------------
    document.addEventListener('click', (e) => {
        // 1. Direct [data-action="view"] or [data-action="view-modal"] button or link
        const viewTrigger = e.target.closest('[data-action="view"], [data-action="view-modal"]');
        if (viewTrigger) {
            e.preventDefault();
            e.stopPropagation();
            if (viewTrigger.dataset.article) {
                try {
                    const parsed = JSON.parse(viewTrigger.dataset.article);
                    openArticleViewer(parsed);
                    return;
                } catch (err) {}
            }
            const targetId = viewTrigger.dataset.id || viewTrigger.getAttribute('data-id');
            if (targetId) {
                openArticleViewer(targetId);
                return;
            }
        }

        // 2. Click anywhere inside a ranked item in Most Viewed Articles
        const rankedItem = e.target.closest('.ranked-item');
        if (rankedItem) {
            if (rankedItem.dataset.article) {
                try {
                    const parsed = JSON.parse(rankedItem.dataset.article);
                    openArticleViewer(parsed);
                    return;
                } catch (err) {}
            }
            if (rankedItem.dataset.articleId) {
                openArticleViewer(rankedItem.dataset.articleId);
                return;
            }
        }
    });

    // Global Escape Key to close any active modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeViewerModal();
            closeEditModal();
            closeActionModal();
        }
    });

    // =========================================================================
    // 7. NAVIGATION ACTIVE STATE HANDLER (Desktop & Mobile)
    // =========================================================================
    const mobileNavDropdown = document.getElementById('mobile-nav-dropdown');
    const mobileHamburgerBtn = document.getElementById('mobile-nav-toggle');
    const navItems = document.querySelectorAll('.sidebar-nav-item, .mobile-nav-link');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // On mobile screens, auto-close accordion dropdown upon selection
                if (mobileNavDropdown && mobileNavDropdown.classList.contains('open')) {
                    mobileNavDropdown.classList.remove('open');
                    if (mobileHamburgerBtn) mobileHamburgerBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

});
