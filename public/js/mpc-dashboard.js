/**
 * The Lens — Media & Public Communications (M&PC) Dashboard Script
 * Built with full parity to the Editor-in-Chief (EIC) Dashboard.
 * 
 * Capabilities:
 * 1. 4 Metrics Cards (Awaiting Publication, Monthly Readership, Active Members, Published Stories)
 * 2. Pending Approval Table (with direct article preview and approval action)
 * 3. Activity Log (Top recent actions)
 * 4. Most Viewed Articles (Current month with views, shares, and Take Down capability once posted)
 * 5. Top Performing Journalists Leaderboard
 * 6. Full Article Viewer Modal with:
 *    - "Approve & Publish" button when viewing pending submissions
 *    - "Take Down Article" button when viewing posted/published articles
 * 7. Interactive Action Confirmation Modal
 * 8. Real-time Toast Notifications & CSRF-protected Backend Integration
 */

import { articles as defaultArticles } from './articles.js';

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. DATA SOURCES & INITIALIZATION
    // =========================================================================
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    const APPROVE_URL_BASE = window.__APPROVE_URL__ || '/mpc-head/articles';
    const REVISION_URL_BASE = window.__REVISION_URL__ || '/mpc-head/articles';
    const DECLINE_URL_BASE = window.__DECLINE_URL__ || '/mpc-head/articles';
    const TAKEDOWN_URL_BASE = window.__TAKEDOWN_URL__ || '/mpc-head/articles';

    // Retrieve database-backed lists passed from MpcHeadController
    const serverPending = Array.isArray(window.__PENDING_ARTICLES__) ? window.__PENDING_ARTICLES__ : [];
    const serverPublished = Array.isArray(window.__PUBLISHED_ARTICLES__) ? window.__PUBLISHED_ARTICLES__ : [];
    const serverMetrics = window.__DASHBOARD_METRICS__ || null;
    const serverJournalists = Array.isArray(window.__TOP_JOURNALISTS__) ? window.__TOP_JOURNALISTS__ : [];
    const serverActivities = Array.isArray(window.__RECENT_ACTIVITIES__) ? window.__RECENT_ACTIVITIES__ : [];

    // Fallback helpers for localStorage
    function getStoredPublishedArticles() {
        if (serverPublished.length > 0) return serverPublished;
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
            console.warn('Could not read published articles from localStorage', e);
        }
        return Array.isArray(defaultArticles) ? defaultArticles : [];
    }

    function getStoredPendingArticles() {
        if (serverPending.length > 0) return serverPending;
        try {
            const raw = localStorage.getItem('mpc_publish_articles_v2') || localStorage.getItem('mpc_publish_articles_v1') || localStorage.getItem('eicPendingReviewQueue');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.warn('Could not read pending articles from localStorage', e);
        }
        return [];
    }

    let publishedArticles = getStoredPublishedArticles();
    let pendingArticles = getStoredPendingArticles();

    // =========================================================================
    // 2. HELPER UTILITIES: ESCAPING & TOASTS
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
        while (maxPasses > 0 && (/&amp;lt;/i.test(decoded) || /&lt;/i.test(decoded) || /&amp;gt;/i.test(decoded) || /&gt;/i.test(decoded))) {
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
        if (!rawContent) {
            return '<p style="color: #98a2b3; font-style: italic;">No manuscript content available.</p>';
        }

        let decoded = decodeCorruptedHtmlEntities(rawContent);

        decoded = decoded
            .replace(/&lt;\/?span[^&>]*&gt;/gi, '')
            .replace(/<\/?span[^>]*>/gi, '')
            .replace(/\s*style="[^"]*"/gi, '')
            .replace(/\s*style='[^']*'/gi, '')
            .replace(/&lt;[^&>]+&gt;/gi, '');

        const stripped = decoded
            .replace(/<div><br\s*\/?><\/div>/gi, '\n\n')
            .replace(/<\/(?:div|p|blockquote|h[1-6])>/gi, '\n\n')
            .replace(/<\/?(?:div|p|blockquote|h[1-6])[^>]*>/gi, '\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '');

        const paragraphs = stripped
            .split(/\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        if (paragraphs.length === 0) {
            return '<p style="color: #98a2b3; font-style: italic;">No manuscript content available.</p>';
        }

        return paragraphs.map(p => `<p class="viewer-paragraph">${escapeHTML(p)}</p>`).join('');
    }

    const toastContainer = document.getElementById('toast-container');
    function showToast(message, type = 'success') {
        if (!toastContainer) return;

        const existingToasts = toastContainer.querySelectorAll('.toast-message');
        existingToasts.forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;
        toast.innerHTML = `<span class="toast-bullet-dot"></span><span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-dismissing');
            setTimeout(() => toast.remove(), 260);
        }, 3400);
    }

    // =========================================================================
    // 3. DASHBOARD RENDERING PIPELINE
    // =========================================================================
    function renderDashboard() {
        const now = new Date();
        const currentMonthName = now.toLocaleString('en-US', { month: 'long' });

        // A. Dynamic Month Badge
        const mostViewedMonthBadge = document.getElementById('most-viewed-month-badge');
        if (mostViewedMonthBadge) {
            mostViewedMonthBadge.textContent = currentMonthName;
        }

        // B. Metrics Calculation
        const totalViews = serverMetrics?.total_views ?? publishedArticles.reduce((sum, a) => sum + (Number(a.views) || 0), 0);
        const publishedCount = serverMetrics?.published_stories ?? publishedArticles.length;
        const pendingCount = serverMetrics?.pending ?? pendingArticles.length;
        const activeMembersCount = serverMetrics?.active_members ?? 28;

        const pendingBadge = document.getElementById('pending-count-badge');
        if (pendingBadge) {
            pendingBadge.textContent = `${pendingCount} awaiting review`;
        }

        // C. Metrics Cards
        const metricsContainer = document.getElementById('metrics-grid');
        if (metricsContainer) {
            const metrics = [
                {
                    label: "Awaiting Publication",
                    value: String(pendingCount),
                    subtitle: "Approved by EIC, ready for M&PC",
                    icon: "fa-regular fa-clock",
                    delayClass: "delay-1"
                },
                {
                    label: "Monthly Readership",
                    value: Number(totalViews).toLocaleString(),
                    subtitle: "Total views across public site",
                    icon: "fa-regular fa-eye",
                    delayClass: "delay-2"
                },
                {
                    label: "Active Members",
                    value: String(activeMembersCount),
                    subtitle: "Staff & editorial roster",
                    icon: "fa-solid fa-users",
                    delayClass: "delay-3"
                },
                {
                    label: "Published Stories",
                    value: String(publishedCount),
                    subtitle: "Live stories on public site",
                    icon: "fa-regular fa-newspaper",
                    delayClass: "delay-4"
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

        // D. Pending Approval Table (Left Column Section 1)
        const submissionsTableBody = document.getElementById('submissions-table-body');
        if (submissionsTableBody) {
            if (pendingArticles.length === 0) {
                submissionsTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 28px; color: var(--text-muted, #667085);">
                            <i class="fa-regular fa-circle-check" style="margin-right: 6px; color: #137333;"></i>
                            All caught up. No articles awaiting M&amp;PC publication review.
                        </td>
                    </tr>
                `;
            } else {
                submissionsTableBody.innerHTML = pendingArticles.slice(0, 5).map(art => {
                    const categoryName = art.category?.name || art.category || 'General';
                    let formattedCat = escapeHTML(categoryName);
                    if (/^science\s+(and|&)\s+technology$/i.test(categoryName)) {
                        formattedCat = 'Science &amp;<br>Technology';
                    }

                    return `
                        <tr>
                            <td>
                                <div class="table-article-info">
                                    <button type="button" class="table-article-btn" data-action="view-pending" data-id="${escapeHTML(art.id)}" title="${escapeHTML(art.title)}">
                                        ${escapeHTML(art.title)}
                                    </button>
                                    <div class="table-author-subline">
                                        <i class="fa-solid fa-pen-nib"></i>
                                        <span>${escapeHTML(art.author || 'Staff Writer')}</span>
                                    </div>
                                </div>
                            </td>
                            <td class="hide-on-mobile">
                                <span class="table-section-tag">${formattedCat}</span>
                            </td>
                            <td>
                                <span class="status-badge status-review">Pending M&amp;PC</span>
                            </td>
                            <td class="hide-on-mobile">
                                <span class="table-date">${escapeHTML(art.date || 'Recent')}</span>
                            </td>
                            <td class="text-right">
                                <button type="button" class="table-manage-btn" data-action="view-pending" data-id="${escapeHTML(art.id)}">
                                    <i class="fa-solid fa-eye"></i> Review
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }

        // E. Activity Log (Left Column Section 2)
        const activityContainer = document.getElementById('recent-activity-list');
        if (activityContainer) {
            let logsToDisplay = [];

            if (serverActivities.length > 0) {
                logsToDisplay = serverActivities.map(item => ({
                    user: item.user || 'Editorial Member',
                    avatar: item.avatar || '/images/member-placeholder.svg',
                    action: item.action || 'updated',
                    subjectType: item.subjectType || 'Article',
                    target: item.target || 'Article',
                    time: item.time || 'Recent'
                }));
            } else {
                try {
                    const storedLogs = localStorage.getItem('mpcActivityLogs_v1') || localStorage.getItem('executiveActivityLogs_v1');
                    if (storedLogs) {
                        const parsed = JSON.parse(storedLogs);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            logsToDisplay = parsed.slice(0, 5).map(item => ({
                                user: item.causer || 'M&PC Head',
                                avatar: item.causerAvatar || '/images/member-placeholder.svg',
                                action: item.action || 'updated',
                                subjectType: item.subjectType || 'Article',
                                target: item.subjectName || 'Article',
                                time: item.timestampText || item.formattedDate || 'Recent'
                            }));
                        }
                    }
                } catch (e) {}
            }

            if (logsToDisplay.length === 0) {
                logsToDisplay = [
                    {
                        user: 'Julian Del Rosario',
                        avatar: '/images/member-placeholder.svg',
                        action: 'published',
                        subjectType: 'Article',
                        target: 'Campus Journalism in the Digital Era',
                        time: '2 hours ago'
                    },
                    {
                        user: 'Samantha Cruz',
                        avatar: '/images/member-placeholder.svg',
                        action: 'reviewed',
                        subjectType: 'Article',
                        target: 'PUPQC Celebrates 27th Foundation Anniversary',
                        time: 'Yesterday'
                    }
                ];
            }

            activityContainer.innerHTML = logsToDisplay.map(item => `
                <div class="activity-item">
                    <div class="activity-avatar">
                        <img src="${item.avatar}" alt="${escapeHTML(item.user)}">
                    </div>
                    <div class="activity-details">
                        <p class="activity-text">
                            <strong>${escapeHTML(item.user)}</strong> ${escapeHTML(item.action)} the ${escapeHTML(item.subjectType)} <em>"${escapeHTML(item.target)}"</em> <span style="color:#667085; font-size:0.75rem; margin-left:3px;">${escapeHTML(item.time)}.</span>
                        </p>
                        <span class="activity-time">${escapeHTML(item.time)}</span>
                    </div>
                </div>
            `).join('');
        }

        // F. Most Viewed Articles (Right Column Section 1) — With TAKE DOWN capability!
        const mostViewedContainer = document.getElementById('most-viewed-list');
        if (mostViewedContainer) {
            if (publishedArticles.length === 0) {
                mostViewedContainer.innerHTML = `
                    <div style="text-align: center; padding: 28px 16px; color: var(--text-muted, #667085); font-size: 0.90rem;">
                        No published articles found on the public site yet.
                    </div>
                `;
            } else {
                mostViewedContainer.innerHTML = publishedArticles.slice(0, 5).map((art, idx) => {
                    const categoryName = art.category?.name || art.category || 'News';
                    const views = Number(art.views) || 0;
                    const shares = Number(art.shares) || 0;

                    return `
                        <div class="ranked-item" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border-bottom: 1px solid #f2f4f7;">
                            <div style="flex: 1; min-width: 0;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                    <span class="viewer-category-tag" style="font-size: 0.68rem; padding: 2px 7px;">${escapeHTML(categoryName)}</span>
                                    <span style="font-size: 0.72rem; color: #98a2b3;">${escapeHTML(art.date || '')}</span>
                                </div>
                                <button type="button" class="table-article-btn" data-action="view-published" data-id="${escapeHTML(art.id)}" style="font-weight: 600; text-align: left; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;">
                                    ${escapeHTML(art.title)}
                                </button>
                                <div style="display: flex; align-items: center; gap: 12px; font-size: 0.74rem; color: #667085; margin-top: 4px;">
                                    <span><i class="fa-solid fa-pen-nib"></i> ${escapeHTML(art.author || 'Staff Writer')}</span>
                                    <span><i class="fa-regular fa-eye"></i> ${views.toLocaleString()}</span>
                                    <span><i class="fa-solid fa-share-nodes"></i> ${shares.toLocaleString()}</span>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                                <button type="button" class="modal-btn modal-btn-danger" data-action="takedown-direct" data-id="${escapeHTML(art.id)}" title="Take down this article from public site" style="padding: 6px 10px; font-size: 0.75rem; border-radius: 7px; display: inline-flex; align-items: center; gap: 5px;">
                                    <i class="fa-solid fa-arrow-down-from-bracket"></i>
                                    <span class="hide-on-mobile">Take Down</span>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        // G. Top Performing Journalists (Right Column Section 2)
        const topJournalistsTableBody = document.getElementById('top-journalists-table-body');
        if (topJournalistsTableBody) {
            let journalists = serverJournalists;

            if (journalists.length === 0) {
                // Compute from published articles
                const authorCounts = {};
                publishedArticles.forEach(a => {
                    const author = a.author || 'Staff Writer';
                    authorCounts[author] = (authorCounts[author] || 0) + 1;
                });
                journalists = Object.entries(authorCounts)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
            }

            if (journalists.length === 0) {
                topJournalistsTableBody.innerHTML = `
                    <tr>
                        <td colspan="2" style="text-align: center; padding: 24px; color: var(--text-muted, #667085); font-size: 0.85rem;">
                            No published journalist records yet.
                        </td>
                    </tr>
                `;
            } else {
                topJournalistsTableBody.innerHTML = journalists.map(j => `
                    <tr>
                        <td class="col-author"><strong>${escapeHTML(j.name)}</strong></td>
                        <td class="col-article-count">${j.count} ${j.count === 1 ? 'article' : 'articles'}</td>
                    </tr>
                `).join('');
            }
        }
    }

    // Initial Dashboard Render
    renderDashboard();

    // =========================================================================
    // 4. ARTICLE VIEWER MODAL LOGIC (Approve vs Take Down)
    // =========================================================================
    let currentViewingArticle = null;
    let currentViewingType = null; // 'pending' | 'published'

    const viewerModal = document.getElementById('article-viewer-modal');
    const closeViewerBtn = document.getElementById('close-viewer-btn');
    const viewerCancelBtn = document.getElementById('viewer-cancel-btn');
    const viewerActionApprove = document.getElementById('viewer-action-approve');
    const viewerActionRevision = document.getElementById('viewer-action-revision');
    const viewerActionDecline = document.getElementById('viewer-action-decline');
    const viewerActionTakedown = document.getElementById('viewer-action-takedown');

    const viewerRemarksSection = document.getElementById('viewer-remarks-section');
    const viewerRemarksInput = document.getElementById('viewer-remarks-input');
    const viewerRemarksError = document.getElementById('viewer-remarks-error');

    const viewerTitle = document.getElementById('viewer-title');
    const viewerCategory = document.getElementById('viewer-category');
    const viewerDate = document.getElementById('viewer-date');
    const viewerAuthor = document.getElementById('viewer-author');
    const viewerReadTime = document.getElementById('viewer-read-time');
    const viewerExcerpt = document.getElementById('viewer-excerpt');
    const viewerContent = document.getElementById('viewer-content');
    const viewerViews = document.getElementById('viewer-views');
    const viewerShares = document.getElementById('viewer-shares');
    const viewerStatusBadge = document.getElementById('viewer-status-badge');

    function openViewerModal(article, type = 'published') {
        if (!viewerModal || !article) return;
        currentViewingArticle = article;
        currentViewingType = type;

        const isPublished = (type === 'published') || (article.status === 'Published');

        if (viewerTitle) viewerTitle.textContent = article.title || 'Untitled Article';
        if (viewerCategory) viewerCategory.textContent = article.category?.name || article.category || 'General';
        if (viewerDate) viewerDate.textContent = article.date || 'Recent';
        if (viewerAuthor) viewerAuthor.textContent = article.author || 'Staff Writer';
        
        // Calculate estimated read time
        const wordCount = (article.content || article.excerpt || '').replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
        const readMin = Math.max(1, Math.ceil(wordCount / 220));
        if (viewerReadTime) viewerReadTime.textContent = `${readMin} min read`;

        if (viewerViews) viewerViews.textContent = Number(article.views || 0).toLocaleString();
        if (viewerShares) viewerShares.textContent = Number(article.shares || 0).toLocaleString();

        if (viewerStatusBadge) {
            viewerStatusBadge.textContent = isPublished ? 'Published' : 'Pending M&PC';
            viewerStatusBadge.className = isPublished ? 'status-badge status-approved' : 'status-badge status-review';
        }

        if (viewerExcerpt) {
            if (article.excerpt && article.excerpt.trim()) {
                viewerExcerpt.textContent = article.excerpt.trim();
                viewerExcerpt.style.display = 'block';
            } else {
                viewerExcerpt.style.display = 'none';
            }
        }

        if (viewerContent) {
            viewerContent.innerHTML = formatCleanArticleContent(article.content || article.excerpt);
        }

        // Reset remarks input and validation error
        if (viewerRemarksInput) viewerRemarksInput.value = '';
        if (viewerRemarksError) viewerRemarksError.style.display = 'none';

        // Configure footer action buttons and remarks box according to status:
        if (isPublished) {
            // Once posted: Show "Take Down Article" button!
            if (viewerActionTakedown) viewerActionTakedown.style.display = 'inline-flex';
            if (viewerActionApprove) viewerActionApprove.style.display = 'none';
            if (viewerActionRevision) viewerActionRevision.style.display = 'none';
            if (viewerActionDecline) viewerActionDecline.style.display = 'none';
            if (viewerRemarksSection) viewerRemarksSection.style.display = 'none';
        } else {
            // Pending: Show "Approve & Publish", "For Revision", and "Reject" buttons + Remarks
            if (viewerActionTakedown) viewerActionTakedown.style.display = 'none';
            if (viewerActionApprove) viewerActionApprove.style.display = 'inline-flex';
            if (viewerActionRevision) viewerActionRevision.style.display = 'inline-flex';
            if (viewerActionDecline) viewerActionDecline.style.display = 'inline-flex';
            if (viewerRemarksSection) viewerRemarksSection.style.display = 'block';
        }

        viewerModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeViewerModal() {
        if (!viewerModal) return;
        viewerModal.classList.add('hidden');
        document.body.style.overflow = '';
        if (viewerRemarksInput) viewerRemarksInput.value = '';
        if (viewerRemarksError) viewerRemarksError.style.display = 'none';
        currentViewingArticle = null;
        currentViewingType = null;
    }

    if (viewerRemarksInput) {
        viewerRemarksInput.addEventListener('input', () => {
            if (viewerRemarksInput.value.trim().length > 0 && viewerRemarksError) {
                viewerRemarksError.style.display = 'none';
            }
        });
    }

    if (closeViewerBtn) closeViewerBtn.addEventListener('click', closeViewerModal);
    if (viewerCancelBtn) viewerCancelBtn.addEventListener('click', closeViewerModal);
    if (viewerModal) {
        viewerModal.addEventListener('click', (e) => {
            if (e.target === viewerModal) closeViewerModal();
        });
    }

    // =========================================================================
    // 5. ACTION CONFIRMATION MODAL (Take Down & Approve)
    // =========================================================================
    const actionModal = document.getElementById('action-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');
    const modalIcon = document.getElementById('modal-icon');
    const modalIconHeader = document.getElementById('modal-icon-header');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    let onModalConfirmCallback = null;

    function openActionModal({ title, description, confirmText, type = 'warning', onConfirm }) {
        if (!actionModal) return;

        if (modalTitle) modalTitle.textContent = title;
        if (modalDesc) modalDesc.textContent = description;
        if (modalConfirmBtn) {
            modalConfirmBtn.textContent = confirmText;
            modalConfirmBtn.className = type === 'danger' ? 'modal-btn modal-btn-danger' : 'modal-btn modal-btn-confirm-primary';
        }

        if (modalIconHeader) {
            modalIconHeader.className = `modal-icon-header ${type}`;
        }
        if (modalIcon) {
            if (type === 'danger') modalIcon.className = 'fa-solid fa-arrow-down-from-bracket';
            else if (type === 'success') modalIcon.className = 'fa-solid fa-circle-check';
            else modalIcon.className = 'fa-solid fa-triangle-exclamation';
        }

        onModalConfirmCallback = onConfirm;
        actionModal.classList.remove('hidden');
    }

    function closeActionModal() {
        if (!actionModal) return;
        actionModal.classList.add('hidden');
        onModalConfirmCallback = null;
    }

    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeActionModal);
    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener('click', () => {
            if (typeof onModalConfirmCallback === 'function') {
                const cb = onModalConfirmCallback;
                closeActionModal();
                cb();
            }
        });
    }

    // =========================================================================
    // 6. TAKE DOWN ARTICLE WORKFLOW
    // =========================================================================
    function executeTakedown(articleId) {
        const id = String(articleId);
        const article = publishedArticles.find(a => String(a.id) === id) || currentViewingArticle;
        const title = article ? article.title : 'this article';

        openActionModal({
            title: 'Take Down Article',
            description: `Are you sure you want to take down "${title}" from the public site? It will immediately be unpublished and removed from public circulation.`,
            confirmText: 'Take Down Article',
            type: 'danger',
            onConfirm: () => {
                showToast('Taking down article from public site…', 'info');

                // Call backend route
                fetch(`${TAKEDOWN_URL_BASE}/${id}/takedown`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ id })
                })
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json().catch(() => ({ success: true }));
                })
                .then(data => {
                    // Sync localStorage
                    try {
                        const rawPub = localStorage.getItem('theLensPublishedArticles');
                        if (rawPub) {
                            let list = JSON.parse(rawPub);
                            if (Array.isArray(list)) {
                                list = list.filter(a => String(a.id) !== id);
                                localStorage.setItem('theLensPublishedArticles', JSON.stringify(list));
                            }
                        }
                    } catch (e) {}

                    // Log activity
                    try {
                        const rawLogs = localStorage.getItem('mpcActivityLogs_v1');
                        let logs = rawLogs ? JSON.parse(rawLogs) : [];
                        if (!Array.isArray(logs)) logs = [];
                        logs.unshift({
                            id: 'mpc-act-' + Date.now(),
                            causer: localStorage.getItem('userName') || 'M&PC Head',
                            action: 'took down',
                            subjectType: 'Article',
                            subjectName: title,
                            timestampText: 'Just now',
                            time: 'Just now'
                        });
                        localStorage.setItem('mpcActivityLogs_v1', JSON.stringify(logs.slice(0, 30)));
                    } catch (e) {}

                    showToast(`"${title}" has been taken down from the public site.`, 'warning');
                    closeViewerModal();

                    setTimeout(() => {
                        window.location.reload();
                    }, 1100);
                })
                .catch(err => {
                    console.error('Takedown error:', err);
                    showToast('Failed to take down article. Please try again.', 'danger');
                });
            }
        });
    }

    // =========================================================================
    // 7. APPROVE & PUBLISH WORKFLOW
    // =========================================================================
    function executeApprove(articleId) {
        const id = String(articleId);
        const article = pendingArticles.find(a => String(a.id) === id) || currentViewingArticle;
        const title = article ? article.title : 'this article';

        openActionModal({
            title: 'Approve & Publish Article',
            description: `Publish "${title}" live to the public site now?`,
            confirmText: 'Publish Now',
            type: 'success',
            onConfirm: () => {
                showToast('Publishing article to public site…', 'info');

                fetch(`${APPROVE_URL_BASE}/${id}/approve`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ id })
                })
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json().catch(() => ({ success: true }));
                })
                .then(data => {
                    showToast(`"${title}" is now published live on The Lens!`, 'success');
                    closeViewerModal();

                    setTimeout(() => {
                        window.location.reload();
                    }, 1100);
                })
                .catch(err => {
                    console.error('Publish error:', err);
                    showToast('Failed to publish article. Please try again.', 'danger');
                });
            }
        });
    }

    // =========================================================================
    // 8. RETURN FOR REVISION WORKFLOW
    // =========================================================================
    function executeRevision(articleId, remarks) {
        const id = String(articleId);
        const article = pendingArticles.find(a => String(a.id) === id) || currentViewingArticle;
        const title = article ? article.title : 'this article';

        openActionModal({
            title: 'Return for Revision',
            description: `Are you sure you want to return "${title}" to the writer for revision? Your editorial remarks will be attached.`,
            confirmText: 'Return for Revision',
            type: 'warning',
            onConfirm: () => {
                showToast('Returning article for revision…', 'info');

                fetch(`${REVISION_URL_BASE}/${id}/revision`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ remarks })
                })
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json().catch(() => ({ success: true }));
                })
                .then(data => {
                    showToast(`"${title}" returned for revision.`, 'warning');
                    closeViewerModal();

                    setTimeout(() => {
                        window.location.reload();
                    }, 1100);
                })
                .catch(err => {
                    console.error('Revision error:', err);
                    showToast('Failed to return for revision. Please try again.', 'danger');
                });
            }
        });
    }

    // =========================================================================
    // 9. REJECT / DECLINE WORKFLOW
    // =========================================================================
    function executeDecline(articleId, remarks) {
        const id = String(articleId);
        const article = pendingArticles.find(a => String(a.id) === id) || currentViewingArticle;
        const title = article ? article.title : 'this article';

        openActionModal({
            title: 'Reject Article',
            description: `Are you sure you want to reject "${title}"? This will mark the manuscript as Declined.`,
            confirmText: 'Reject Article',
            type: 'danger',
            onConfirm: () => {
                showToast('Rejecting article…', 'info');

                fetch(`${DECLINE_URL_BASE}/${id}/decline`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ remarks })
                })
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json().catch(() => ({ success: true }));
                })
                .then(data => {
                    showToast(`"${title}" has been rejected.`, 'danger');
                    closeViewerModal();

                    setTimeout(() => {
                        window.location.reload();
                    }, 1100);
                })
                .catch(err => {
                    console.error('Decline error:', err);
                    showToast('Failed to reject article. Please try again.', 'danger');
                });
            }
        });
    }

    // =========================================================================
    // 10. EVENT DELEGATION & LISTENERS
    // =========================================================================
    if (viewerActionTakedown) {
        viewerActionTakedown.addEventListener('click', () => {
            if (currentViewingArticle) {
                executeTakedown(currentViewingArticle.id);
            }
        });
    }

    if (viewerActionApprove) {
        viewerActionApprove.addEventListener('click', () => {
            if (currentViewingArticle) {
                executeApprove(currentViewingArticle.id);
            }
        });
    }

    if (viewerActionRevision) {
        viewerActionRevision.addEventListener('click', () => {
            if (!currentViewingArticle) return;
            const remarks = viewerRemarksInput ? viewerRemarksInput.value.trim() : '';
            if (!remarks) {
                if (viewerRemarksError) viewerRemarksError.style.display = 'flex';
                if (viewerRemarksInput) viewerRemarksInput.focus();
                return;
            }
            if (viewerRemarksError) viewerRemarksError.style.display = 'none';
            executeRevision(currentViewingArticle.id, remarks);
        });
    }

    if (viewerActionDecline) {
        viewerActionDecline.addEventListener('click', () => {
            if (!currentViewingArticle) return;
            const remarks = viewerRemarksInput ? viewerRemarksInput.value.trim() : '';
            if (!remarks) {
                if (viewerRemarksError) viewerRemarksError.style.display = 'flex';
                if (viewerRemarksInput) viewerRemarksInput.focus();
                return;
            }
            if (viewerRemarksError) viewerRemarksError.style.display = 'none';
            executeDecline(currentViewingArticle.id, remarks);
        });
    }

    // Click delegate for pending table buttons and published cards
    document.addEventListener('click', (e) => {
        // View pending article
        const viewPendingBtn = e.target.closest('[data-action="view-pending"]');
        if (viewPendingBtn) {
            const id = viewPendingBtn.getAttribute('data-id');
            const art = pendingArticles.find(a => String(a.id) === String(id));
            if (art) openViewerModal(art, 'pending');
            return;
        }

        // View published article
        const viewPublishedBtn = e.target.closest('[data-action="view-published"]');
        if (viewPublishedBtn) {
            const id = viewPublishedBtn.getAttribute('data-id');
            const art = publishedArticles.find(a => String(a.id) === String(id));
            if (art) openViewerModal(art, 'published');
            return;
        }

        // Direct take down button from Most Viewed Articles list
        const takedownDirectBtn = e.target.closest('[data-action="takedown-direct"]');
        if (takedownDirectBtn) {
            const id = takedownDirectBtn.getAttribute('data-id');
            if (id) executeTakedown(id);
            return;
        }
    });

    // Keyboard ESC to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (actionModal && !actionModal.classList.contains('hidden')) {
                closeActionModal();
                return;
            }
            if (viewerModal && !viewerModal.classList.contains('hidden')) {
                closeViewerModal();
            }
        }
    });
});
