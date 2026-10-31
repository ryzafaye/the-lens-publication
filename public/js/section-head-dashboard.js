/**
 * The Lens — Section Head Dashboard Script
 * Modular, clean, reusable implementation tailored for Editorial Section Heads
 * Strictly styled to match Executive Dashboard design & formatting
 */

import { articles as defaultArticles } from './articles.js';

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. AUTHENTICATION & ROLE VERIFICATION
    // =========================================================================
    const userRole = localStorage.getItem('sectionHeadRole') || localStorage.getItem('userRole') || 'News Head';
    if (!localStorage.getItem('userRole')) {
        window.location.href = '/login';
        return;
    }

    const currentSection = localStorage.getItem('sectionHeadSection') || 'News';
    const sectionHeadName = localStorage.getItem('sectionHeadName') || localStorage.getItem('userName') || 'Danilo C. Ramos';

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
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this manuscript.</p>';
        }

        let decoded = decodeCorruptedHtmlEntities(rawContent);

        // Aggressively strip any literal or encoded span tags and style attributes
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
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this manuscript.</p>';
        }

        return paragraphs.map(p => `<p class="viewer-paragraph">${escapeHTML(p)}</p>`).join('');
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
        if (sec.includes('literature')) return cat.includes('liter');
        if (sec.includes('news')) return cat.includes('news');
        return cat.includes(sec);
    });

    // Pending Section Submissions Queue
    const defaultPendingArticles = [];

    let pendingQueue = [];
    try {
        const rawQ = localStorage.getItem('sectionHeadReviewQueue_v1');
        if (rawQ) {
            const parsedQ = JSON.parse(rawQ);
            if (Array.isArray(parsedQ)) pendingQueue = parsedQ;
        }
    } catch (e) {}

    const sectionPending = pendingQueue.filter(a => {
        const cat = (a.category || '').toLowerCase();
        const sec = currentSection.toLowerCase();
        if (sec.includes('science') || sec.includes('tech')) return cat.includes('science') || cat.includes('tech');
        if (sec.includes('feature')) return cat.includes('feature');
        if (sec.includes('literature')) return cat.includes('liter');
        if (sec.includes('news')) return cat.includes('news');
        return cat.includes(sec);
    });

    // =========================================================================
    // 3. ANALYTICS CARDS (Exact Executive Design & Formatting)
    // - Card 1: Total Article Views (Current Month)
    // - Card 2: Section Articles (Published)
    // - Card 3: Pending Section Review
    // - "My Authored Articles" removed
    // =========================================================================
    const metricsContainer = document.getElementById('metrics-grid');
    if (metricsContainer) {
        // Calculate total views for the current month across desk
        const sectionViews = sectionArticles.reduce((sum, a) => sum + (Number(a.views) || 0), 0);
        const totalCount = sectionArticles.length;
        const pendingCount = sectionPending.length;

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
    if (submissionsTableBody) {
        if (sectionPending.length === 0) {
            submissionsTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-gray-500 text-sm">No pending submissions for this section.</td></tr>`;
        } else {
            submissionsTableBody.innerHTML = sectionPending.map(item => `
                <tr>
                    <td>
                        <button type="button" class="table-article-btn" data-action="view-modal" data-id="${item.id}" title="${escapeHTML(item.title)}">
                            ${escapeHTML(item.title)}
                        </button>
                    </td>
                    <td><span class="table-author">${escapeHTML(item.author)}</span></td>
                    <td class="hide-on-mobile">${formatSectionBadgeHtml(item.category || currentSection)}</td>
                    <td>${getStatusBadgeHtml('In Review')}</td>
                    <td class="hide-on-mobile"><span class="table-date">${escapeHTML(item.date)}</span></td>
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
            activityContainer.innerHTML = '<p class="text-sm text-gray-500 py-4 text-center">No recent activities recorded.</p>';
        } else {
            activityContainer.innerHTML = logsToDisplay.map(item => `
                <div class="activity-item" onclick="window.location.href='section-head-activity-logs.html'" style="cursor: pointer;" title="Open Activity Log">
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

        mostViewedContainer.innerHTML = mostViewed.map((art, idx) => `
            <div class="ranked-item" data-article-id="${art.id}">
                <span class="rank-number ${idx === 0 ? 'top-rank' : ''}">${idx + 1}</span>
                <div class="ranked-content">
                    <div class="ranked-category-tag">${escapeHTML(art.category || currentSection)}</div>
                    <button type="button" class="ranked-title-btn" data-action="view-modal" data-id="${art.id}" title="${escapeHTML(art.title)}">
                        ${escapeHTML(art.title)}
                    </button>
                    <div class="ranked-meta-row">
                        <span class="ranked-author"><i class="fa-solid fa-pen-nib" aria-hidden="true" style="font-size: 0.70rem; margin-right: 4px; color: var(--text-muted, #667085);"></i>${escapeHTML(art.author || 'Staff Writer')}</span>
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

        // Ensure key writers are populated for demo if pool is small
        if (Object.keys(authorCounts).length < 3) {
            authorCounts["Sofia M. Alcaraz"] = 6;
            authorCounts["Marco L. Valderrama"] = 4;
            authorCounts["Camille Joy Perez"] = 3;
            authorCounts["Lia Mendoza"] = 2;
        }

        const topJournalists = Object.entries(authorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        topJournalistsTableBody.innerHTML = topJournalists.map(j => `
            <tr>
                <td class="col-author"><span class="author-name">${escapeHTML(j.name)}</span></td>
                <td class="col-article-count"><span class="article-count-pill">${j.count}</span></td>
            </tr>
        `).join('');
    }

    // =========================================================================
    // 8. IN-PLACE ARTICLE VIEWER MODAL
    // =========================================================================
    const viewerModal = document.getElementById('article-viewer-modal');
    const closeViewerBtn = document.getElementById('close-viewer-btn');
    const viewerCategory = document.getElementById('viewer-category');
    const viewerDate = document.getElementById('viewer-date');
    const viewerTitle = document.getElementById('viewer-title');
    const viewerAuthor = document.getElementById('viewer-author');
    const viewerContent = document.getElementById('viewer-content');
    const viewerReviewBtn = document.getElementById('viewer-review-btn');

    function openModalForArticle(art) {
        if (!viewerModal || !art) return;

        if (viewerCategory) viewerCategory.textContent = art.category || currentSection;
        if (viewerDate) viewerDate.textContent = art.date || 'Recent';
        if (viewerTitle) viewerTitle.textContent = art.title || 'Untitled';
        if (viewerAuthor) viewerAuthor.textContent = art.author || 'Staff Writer';

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

        viewerModal.classList.remove('hidden');
    }

    // Click handlers for table rows and ranked cards
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-action="view-modal"]');
        if (!trigger) return;
        const id = trigger.getAttribute('data-id');
        const match = allArticles.find(a => String(a.id) === String(id)) || 
                      pendingQueue.find(a => String(a.id) === String(id));
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

    if (viewerReviewBtn) {
        viewerReviewBtn.addEventListener('click', () => {
            window.location.href = 'section-head-review-articles.html';
        });
    }
});
