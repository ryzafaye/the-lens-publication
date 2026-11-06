/**
 * The Lens — Section Head Dashboard Script
 * Modular, clean, reusable implementation tailored for Editorial Section Heads
 * Strictly styled to match Executive Dashboard design & formatting
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. AUTHENTICATION & ROLE VERIFICATION
    // =========================================================================
    const userRole = localStorage.getItem('sectionHeadRole') || localStorage.getItem('userRole') || (document.getElementById('topbar-user-role')?.textContent?.trim()) || 'Section Head';
    const currentSection = localStorage.getItem('sectionHeadSection') || 'News';
    const sectionHeadName = localStorage.getItem('sectionHeadName') || localStorage.getItem('userName') || (document.getElementById('mobile-user-name')?.textContent?.trim()) || 'Section Head';

    // -------------------------------------------------------------------------
    // Set Dynamic Title: "(Category) Head Dashboard" (No subline)
    // -------------------------------------------------------------------------
    const pageTitleHeading = document.getElementById('page-title-heading');
    const docPageTitle = document.getElementById('doc-page-title');
    const dashboardTitle = `${userRole} Dashboard`;

    if (pageTitleHeading) pageTitleHeading.textContent = dashboardTitle;
    if (docPageTitle) docPageTitle.textContent = `${dashboardTitle} | The Lens`;

    // Month formatting
    const now = new Date();
    const currentMonthName = now.toLocaleString('en-US', { month: 'long' });
    const mostViewedMonthBadge = document.getElementById('most-viewed-month-badge');
    if (mostViewedMonthBadge) {
        mostViewedMonthBadge.textContent = currentMonthName;
    }

    // Helper utilities
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

    function formatSectionBadgeHtml(category) {
        if (!category) return '';
        const catStr = String(category).trim();
        if (/^science\s+and\s+technology$/i.test(catStr)) {
            return `<span class="table-section-tag section-tag-multiline">Science and<br>Technology</span>`;
        }
        if (/^science\s+&\s+technology$/i.test(catStr)) {
            return `<span class="table-section-tag section-tag-multiline">Science &amp;<br>Technology</span>`;
        }
        return `<span class="table-section-tag">${escapeHTML(catStr)}</span>`;
    }

    function getStatusBadgeHtml(status) {
        const lower = (status || 'approved').toLowerCase();
        if (lower === 'approved' || lower === 'published') {
            return `<span class="status-badge status-approved">Approved</span>`;
        }
        if (lower === 'in review' || lower === 'pending review' || lower === 'review') {
            return `<span class="status-badge status-review">In Review</span>`;
        }
        return `<span class="status-badge status-draft">Draft</span>`;
    }

    // =========================================================================
    // 2. ARTICLES DATASET & PERSISTENCE
    // =========================================================================
    function getStoredArticles() {
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

    const allArticles = getStoredArticles();
    const activeArticles = allArticles.filter(a => !a.isArchived);

    // Section specific published articles
    const sectionArticles = activeArticles.filter(a => {
        if (!a.category) return false;
        const cat = a.category.toLowerCase();
        const sec = currentSection.toLowerCase();
        if (sec.includes('science') || sec.includes('tech')) return cat.includes('science') || cat.includes('tech');
        if (sec.includes('feature')) return cat.includes('feature');
        if (sec.includes('liter')) return cat.includes('liter');
        if (sec.includes('news')) return cat.includes('news');
        return cat.includes(sec);
    });

    // Pending Section Submissions Queue
    let pendingQueue = [];
    if (window.__DASHBOARD_PENDING__ && Array.isArray(window.__DASHBOARD_PENDING__)) {
        pendingQueue = window.__DASHBOARD_PENDING__;
    } else {
        try {
            const rawQ = localStorage.getItem('sectionHeadReviewQueue_v1');
            if (rawQ) {
                const parsedQ = JSON.parse(rawQ);
                if (Array.isArray(parsedQ)) pendingQueue = parsedQ;
            }
        } catch (e) {}
    }

    const sectionPending = pendingQueue.filter(a => {
        const cat = (a.category || '').toLowerCase();
        const sec = currentSection.toLowerCase();
        if (sec.includes('science') || sec.includes('tech')) return cat.includes('science') || cat.includes('tech');
        if (sec.includes('feature')) return cat.includes('feature');
        if (sec.includes('liter')) return cat.includes('liter');
        if (sec.includes('news')) return cat.includes('news');
        if (sec.includes('opinion')) return cat.includes('opinion');
        return cat.includes(sec);
    });

    // =========================================================================
    // 3. ANALYTICS CARDS (Exact Executive Design & Formatting)
    // - Card 1: Total Article Views (Current Month)
    // - Card 2: Section Articles (Published)
    // - Card 3: Pending Section Review
    // =========================================================================
    const metricsContainer = document.getElementById('metrics-grid');
    if (metricsContainer) {
        const serverMetrics = window.__DASHBOARD_METRICS__;
        const sectionViews = (serverMetrics && serverMetrics.total_views !== undefined)
            ? serverMetrics.total_views
            : sectionArticles.reduce((sum, a) => sum + (Number(a.views) || 0), 0);

        const totalCount = (serverMetrics && serverMetrics.published_stories !== undefined)
            ? serverMetrics.published_stories
            : sectionArticles.length;

        const pendingCount = (serverMetrics && serverMetrics.pending !== undefined)
            ? serverMetrics.pending
            : sectionPending.length;

        const metrics = [
            {
                label: "Total Article Views",
                value: sectionViews.toLocaleString(),
                subtitle: `Views across desk for ${currentMonthName}`,
                icon: "fa-regular fa-eye",
                delayClass: "delay-1"
            },
            {
                label: `${currentSection} Articles`,
                value: String(totalCount),
                subtitle: "Published to site",
                icon: "fa-regular fa-newspaper",
                delayClass: "delay-2"
            },
            {
                label: "Pending Section Review",
                value: String(pendingCount),
                subtitle: "Awaiting head decision",
                icon: "fa-regular fa-clock",
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

    // =========================================================================
    // 4. RECENT SUBMISSIONS TABLE (Executive Formatting)
    // =========================================================================
    const submissionsTableBody = document.getElementById('submissions-table-body');
    const reviewArticlesUrl = window.__REVIEW_ARTICLES_URL__ || (window.location.pathname.startsWith('/section-head') ? '/section-head/review-articles' : '/executive/review-articles');
    if (submissionsTableBody) {
        if (sectionPending.length === 0) {
            submissionsTableBody.innerHTML = `<tr><td colspan="5" style="font-size: 0.85rem; color: #667085; text-align: center; padding: 24px 0; border-bottom: none; pointer-events: none; background: transparent;">No pending submissions for this section.</td></tr>`;
        } else {
            submissionsTableBody.innerHTML = sectionPending.map(item => `
                <tr>
                    <td>
                        <button type="button" class="table-article-btn" data-action="view-modal" data-id="${item.id}" title="${escapeHTML(item.title)}">
                            ${escapeHTML(item.title)}
                        </button>
                    </td>
                    <td><span class="table-author"><i class="fa-solid fa-pen-nib" aria-hidden="true" style="color: var(--sidebar-maroon, #5c0a18); font-size: 0.72rem; margin-right: 4px;"></i>${escapeHTML(item.author || 'Author')}</span></td>
                    <td>${getStatusBadgeHtml('In Review')}</td>
                    <td class="hide-on-mobile"><span class="table-date">${escapeHTML(item.date)}</span></td>
                    <td class="text-right">
                        <a href="${reviewArticlesUrl}" class="table-manage-btn" title="Review Article">
                            Manage
                        </a>
                    </td>
                </tr>
            `).join('');
        }
    }

    // =========================================================================
    // 5. ACTIVITY LOG (Whole Website, Accessible to Executives & Editorials)
    // =========================================================================
    const activityContainer = document.getElementById('recent-activity-list');
    if (activityContainer) {
        const DEFAULT_PUBLICATION_LOGS = [];

        let logsToDisplay = DEFAULT_PUBLICATION_LOGS;
        try {
            const rawStoredLogs = localStorage.getItem('executiveActivityLogs_v1');
            if (rawStoredLogs) {
                const parsed = JSON.parse(rawStoredLogs);
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
        } catch (e) {}

        if (logsToDisplay.length === 0) {
            activityContainer.innerHTML = '<div style="font-size: 0.85rem; color: #667085; text-align: center; padding: 24px 0;">No recent activities recorded.</div>';
        } else {
            const activityUrl = window.location.pathname.startsWith('/section-head') ? '/section-head/activity-logs' : '/executive/activity-logs';
            activityContainer.innerHTML = logsToDisplay.map(item => `
                <div class="activity-item" onclick="window.location.href='${activityUrl}'" style="cursor: pointer;" title="Open Activity Log">
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

    // =========================================================================
    // 6. MOST VIEWED ARTICLES (Exact Executive Formatting)
    // =========================================================================
    const mostViewedContainer = document.getElementById('most-viewed-list');
    if (mostViewedContainer) {
        const sectionDisplayPool = (sectionArticles.length >= 3 ? sectionArticles : activeArticles);
        const mostViewed = [...sectionDisplayPool]
            .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
            .slice(0, 3);

        if (mostViewed.length === 0) {
            mostViewedContainer.innerHTML = '<div style="font-size: 0.85rem; color: #667085; text-align: center; padding: 24px 0;">No data available yet</div>';
        } else {
            mostViewedContainer.innerHTML = mostViewed.map((art, idx) => `
                <div class="ranked-item" data-article-id="${art.id}">
                    <span class="rank-number ${idx === 0 ? 'top-rank' : ''}">${idx + 1}</span>
                    <div class="ranked-content">
                        <div class="ranked-category-tag">${escapeHTML(art.category || currentSection)}</div>
                        <button type="button" class="ranked-title-btn" data-action="view-modal" data-id="${art.id}" title="${escapeHTML(art.title)}">
                            ${escapeHTML(art.title)}
                        </button>
                        <div class="ranked-meta-row">
                            <span class="ranked-author"><i class="fa-solid fa-pen-nib" aria-hidden="true" style="font-size: 0.70rem; margin-right: 4px; color: var(--sidebar-maroon, #5c0a18);"></i>${escapeHTML(art.author || 'Author')}</span>
                            <span class="ranked-stats">
                                <span class="stat-metric" title="Views"><i class="fa-regular fa-eye"></i> ${Number(art.views || 3420 + idx * 800).toLocaleString()}</span>
                                <span class="stat-sep">&bull;</span>
                                <span class="stat-metric" title="Shares"><i class="fa-solid fa-share-nodes"></i> ${Number(art.shares || 42 + idx * 12).toLocaleString()}</span>
                            </span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // =========================================================================
    // 7. TOP PERFORMING JOURNALISTS (Section Contributors Leaderboard)
    // Calculates top contributing writers for this section!
    // =========================================================================
    const topJournalistsTableBody = document.getElementById('top-journalists-table-body');
    if (topJournalistsTableBody) {
        const authorCounts = {};
        
        // Count contributions in this section
        const pool = sectionArticles.length > 0 ? sectionArticles : activeArticles;
        pool.forEach(a => {
            if (a.author) {
                authorCounts[a.author] = (authorCounts[a.author] || 0) + 1;
            }
        });

        const topJournalists = Object.entries(authorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        if (topJournalists.length === 0) {
            topJournalistsTableBody.innerHTML = `<tr><td colspan="2" style="font-size: 0.85rem; color: #667085; text-align: center; padding: 24px 0; border-bottom: none; pointer-events: none; background: transparent;">No data available yet</td></tr>`;
        } else {
            topJournalistsTableBody.innerHTML = topJournalists.map(j => `
                <tr>
                    <td class="col-author"><span class="author-name">${escapeHTML(j.name)}</span></td>
                    <td class="col-article-count"><span class="article-count-pill">${j.count}</span></td>
                </tr>
            `).join('');
        }
    }

    // =========================================================================
    // 8. NOTIFICATION TOAST UTILITY
    // =========================================================================
    const toastContainer = document.getElementById('toast-container');
    function showToast(message, type = 'success') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'fa-circle-check';
        if (type === 'warning' || type === 'error' || type === 'danger') icon = 'fa-triangle-exclamation';
        if (type === 'info') icon = 'fa-circle-info';

        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${escapeHTML(message)}</span>
        `;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 3500);
    }

    // =========================================================================
    // 9. IN-PLACE ARTICLE VIEWER MODAL WITH REVIEW ACTIONS (Approve / Revision)
    // =========================================================================
    const viewerModal = document.getElementById('article-viewer-modal');
    const closeViewerBtn = document.getElementById('close-viewer-btn');
    const viewerCategory = document.getElementById('viewer-category');
    const viewerDate = document.getElementById('viewer-date');
    const viewerTitle = document.getElementById('viewer-title');
    const viewerAuthor = document.getElementById('viewer-author');
    const viewerContent = document.getElementById('viewer-content');
    const viewerModalFooter = document.getElementById('viewer-modal-footer');
    const viewerRemarksSection = document.getElementById('viewer-remarks-section');
    const viewerRemarks = document.getElementById('viewer-remarks');
    const viewerRemarksError = document.getElementById('viewer-remarks-error');
    const viewerApproveBtn = document.getElementById('viewer-approve-btn');
    const viewerRevisionBtn = document.getElementById('viewer-revision-btn');

    let currentActiveArticle = null;
    const reviewBaseUrl = window.__REVIEW_ARTICLES_URL__ || (window.location.pathname.startsWith('/section-head') ? '/section-head/review-articles' : '/executive/review-articles');

    function removeArticleFromView(targetId) {
        pendingQueue = pendingQueue.filter(a => String(a.id) !== String(targetId));
        sectionPending = sectionPending.filter(a => String(a.id) !== String(targetId));
        if (window.__DASHBOARD_PENDING__ && Array.isArray(window.__DASHBOARD_PENDING__)) {
            window.__DASHBOARD_PENDING__ = window.__DASHBOARD_PENDING__.filter(a => String(a.id) !== String(targetId));
        }

        if (submissionsTableBody) {
            if (sectionPending.length === 0) {
                submissionsTableBody.innerHTML = `<tr><td colspan="5" style="font-size: 0.85rem; color: #667085; text-align: center; padding: 24px 0; border-bottom: none; pointer-events: none; background: transparent;">No pending submissions for this section.</td></tr>`;
            } else {
                submissionsTableBody.innerHTML = sectionPending.map(item => `
                    <tr>
                        <td>
                            <button type="button" class="table-article-btn" data-action="view-modal" data-id="${item.id}" title="${escapeHTML(item.title)}">
                                ${escapeHTML(item.title)}
                            </button>
                        </td>
                        <td><span class="table-author"><i class="fa-solid fa-pen-nib" aria-hidden="true" style="color: var(--sidebar-maroon, #5c0a18); font-size: 0.72rem; margin-right: 4px;"></i>${escapeHTML(item.author || 'Author')}</span></td>
                        <td>${getStatusBadgeHtml('In Review')}</td>
                        <td class="hide-on-mobile"><span class="table-date">${escapeHTML(item.date)}</span></td>
                        <td class="text-right">
                            <a href="${reviewBaseUrl}" class="table-manage-btn" title="Review Article">
                                Manage
                            </a>
                        </td>
                    </tr>
                `).join('');
            }
        }

        // Update metric card counter
        const metricCards = document.querySelectorAll('.metric-card');
        metricCards.forEach(card => {
            const label = card.querySelector('.metric-label')?.textContent?.trim();
            if (label && label.includes('Pending')) {
                const valEl = card.querySelector('.metric-value');
                if (valEl) valEl.textContent = String(sectionPending.length);
            }
        });
    }

    function openModalForArticle(art) {
        if (!viewerModal || !art) return;
        currentActiveArticle = art;

        if (viewerCategory) viewerCategory.textContent = art.category || currentSection;
        if (viewerDate) viewerDate.textContent = art.date || 'Recent';
        if (viewerTitle) viewerTitle.textContent = art.title || 'Untitled';
        if (viewerAuthor) viewerAuthor.textContent = art.author || 'Author';

        const viewerExcerpt = document.getElementById('viewer-excerpt');
        if (viewerExcerpt) {
            if (art.excerpt && art.excerpt.trim()) {
                viewerExcerpt.textContent = art.excerpt.trim();
                viewerExcerpt.style.display = 'block';
            } else {
                viewerExcerpt.style.display = 'none';
            }
        }

        if (viewerContent) {
            viewerContent.innerHTML = formatCleanArticleContent(art.content || art.excerpt);
        }

        // Reset remarks input
        if (viewerRemarks) {
            viewerRemarks.value = '';
            viewerRemarks.classList.remove('input-invalid');
        }
        if (viewerRemarksError) {
            viewerRemarksError.classList.add('hidden');
        }

        // Display review action buttons only for pending submissions
        const statusLower = (art.status || 'pending').toLowerCase();
        const isPending = statusLower.includes('pending') || statusLower.includes('review') || !statusLower.includes('publish');
        if (viewerModalFooter) {
            viewerModalFooter.style.display = isPending ? 'flex' : 'none';
        }
        if (viewerRemarksSection) {
            viewerRemarksSection.style.display = isPending ? 'block' : 'none';
        }

        viewerModal.classList.remove('hidden');
    }

    // Approve Action Handler
    if (viewerApproveBtn) {
        viewerApproveBtn.addEventListener('click', async () => {
            if (!currentActiveArticle) return;
            const targetId = currentActiveArticle.id;
            const targetTitle = currentActiveArticle.title;

            viewerApproveBtn.disabled = true;
            if (viewerRevisionBtn) viewerRevisionBtn.disabled = true;
            const originalHtml = viewerApproveBtn.innerHTML;
            viewerApproveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Approving...</span>';

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            try {
                const response = await fetch(`${reviewBaseUrl}/${targetId}/approve`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    }
                });

                const data = await response.json().catch(() => ({}));

                if (response.ok && data.success !== false) {
                    viewerModal.classList.add('hidden');
                    showToast(data.message || `Approved "${targetTitle}" and forwarded to Editor-in-Chief.`, 'success');
                    removeArticleFromView(targetId);
                } else {
                    showToast(data.message || 'Failed to approve manuscript.', 'danger');
                }
            } catch (err) {
                console.error('Approval request failed:', err);
                showToast('A network error occurred while approving the manuscript.', 'danger');
            } finally {
                viewerApproveBtn.disabled = false;
                if (viewerRevisionBtn) viewerRevisionBtn.disabled = false;
                viewerApproveBtn.innerHTML = originalHtml;
            }
        });
    }

    // For Revision Action Handler
    if (viewerRevisionBtn) {
        viewerRevisionBtn.addEventListener('click', async () => {
            if (!currentActiveArticle) return;
            const targetId = currentActiveArticle.id;
            const targetTitle = currentActiveArticle.title;

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
                const response = await fetch(`${reviewBaseUrl}/${targetId}/revision`, {
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
                    viewerModal.classList.add('hidden');
                    showToast(data.message || `Returned "${targetTitle}" to writer with revision remarks.`, 'warning');
                    removeArticleFromView(targetId);
                } else {
                    showToast(data.message || 'Failed to return manuscript for revision.', 'danger');
                }
            } catch (err) {
                console.error('Revision request failed:', err);
                showToast('A network error occurred while returning the manuscript.', 'danger');
            } finally {
                viewerRevisionBtn.disabled = false;
                if (viewerApproveBtn) viewerApproveBtn.disabled = false;
                viewerRevisionBtn.innerHTML = originalHtml;
            }
        });
    }

    // Clear remarks error on user input
    if (viewerRemarks) {
        viewerRemarks.addEventListener('input', () => {
            if (viewerRemarks.value.trim().length > 0) {
                viewerRemarks.classList.remove('input-invalid');
                if (viewerRemarksError) viewerRemarksError.classList.add('hidden');
            }
        });
    }

    // Click handlers for table rows and ranked cards to view modal
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-action="view-modal"], [data-action="view"]');
        if (!trigger) return;
        const id = trigger.getAttribute('data-id');
        let match = null;
        if (id) {
            match = pendingQueue.find(a => String(a.id) === String(id)) || 
                    allArticles.find(a => String(a.id) === String(id));
        }
        if (!match) {
            const rawArt = trigger.getAttribute('data-article');
            if (rawArt) {
                try {
                    match = JSON.parse(rawArt);
                } catch (err) {}
            }
        }
        if (match) {
            openModalForArticle(match);
        }
    });

    if (closeViewerBtn && viewerModal) {
        closeViewerBtn.addEventListener('click', () => viewerModal.classList.add('hidden'));
        viewerModal.addEventListener('click', (e) => {
            if (e.target === viewerModal) viewerModal.classList.add('hidden');
        });
    }
});

