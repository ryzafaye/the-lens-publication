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
        window.location.href = 'login.html';
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
            const raw = localStorage.getItem('executiveArticles');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('Could not read executiveArticles from localStorage', e);
        }
        return defaultArticles;
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
    const defaultPendingArticles = [
        {
            id: 'rev-01',
            title: "Student council financial audit reveals ₱320,000 unallocated surplus",
            category: "News",
            date: "Oct 18, 2026",
            rawDate: "2026-10-18",
            author: "Mara Villanueva",
            status: "In Review",
            excerpt: "Audit of the Central Student Council expenditures reveals an unallocated contingency reserve.",
            content: `An independent financial audit of the Central Student Council (CSC) expenditures for the first quarter of Academic Year 2026–2027 has revealed an unallocated surplus of ₱320,450 from the student activity development fund.\n\nThe findings, presented during an extraordinary collegiate assembly, prompted student leaders from the College of Science and College of Engineering to question why emergency welfare assistance programs were stalled earlier this term due to cited budgetary deficits.`
        },
        {
            id: 'rev-02',
            title: "Why the enrollment portal keeps timing out: A technical post-mortem",
            category: "Science and Technology",
            date: "Oct 18, 2026",
            rawDate: "2026-10-18",
            author: "Noah Reyes",
            status: "In Review",
            excerpt: "Database locking bottlenecks rather than raw network bandwidth cause registration server timeouts.",
            content: `Every enlistment cycle, tens of thousands of university students endure hours of connection timeouts, 504 Gateway errors, and lost subject slots. An in-depth technical examination of the campus enrollment infrastructure reveals that database locking bottlenecks, rather than network bandwidth, remain the root cause.`
        },
        {
            id: 'rev-03',
            title: "Faculty union files formal grievance over proposed 24-unit overload directive",
            category: "News",
            date: "Oct 17, 2026",
            rawDate: "2026-10-17",
            author: "Rafael Ramos",
            status: "In Review",
            excerpt: "Union manifesto warns against unmitigated workload increases for contractual and regular lecturers.",
            content: `The University Faculty Association (UFA) has formally submitted a dispute grievance to the Office of the Vice President for Academic Affairs following administrative directives requiring full-time instructors to absorb up to 24 class teaching units without proportional overtime compensation.`
        },
        {
            id: 'rev-04',
            title: "Inside the 24-hour night shift of university sanitation workers",
            category: "Features",
            date: "Oct 12, 2026",
            rawDate: "2026-10-12",
            author: "Lia Mendoza",
            status: "In Review",
            excerpt: "A look inside the nocturnal routine of custodians maintaining campus facilities.",
            content: `At 11:30 PM, long after the last student leaves the library and lecture lights flick off, an army of twenty-two custodial workers steps onto the silent campus grounds.`
        },
        {
            id: 'rev-05',
            title: "Echoes of the Quadrangle: Anthology of New Student Poetry",
            category: "Literature",
            date: "Oct 21, 2026",
            rawDate: "2026-10-21",
            author: "Camille Joy Perez",
            status: "In Review",
            excerpt: "A curated sequence of verses depicting collegiate life, transit commutes, and campus memory.",
            content: `Under the shadows of the century-old Acacia trees, student poets observe the shifting cadence of university life.`
        }
    ];

    let pendingQueue = defaultPendingArticles;
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
        const sectionViews = sectionArticles.reduce((sum, a) => sum + (Number(a.views) || 0), 0) + 14280;
        const totalCount = sectionArticles.length > 0 ? sectionArticles.length : 18;
        const pendingCount = sectionPending.length > 0 ? sectionPending.length : 2;

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
        const displayItems = sectionPending.length > 0 ? sectionPending : defaultPendingArticles.slice(0, 4);

        submissionsTableBody.innerHTML = displayItems.map(item => `
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

    // =========================================================================
    // 5. ACTIVITY LOG (Whole Website, Accessible to Executives & Editorials)
    // =========================================================================
    const activityContainer = document.getElementById('recent-activity-list');
    if (activityContainer) {
        const DEFAULT_PUBLICATION_LOGS = [
            {
                user: "Juan Dela Cruz",
                avatar: "images/member-placeholder.svg",
                action: "approved",
                subjectType: "Article",
                target: "Academic Freedom in the Digital Era",
                time: "12m ago"
            },
            {
                user: "Maria Santos",
                avatar: "images/member-placeholder.svg",
                action: "submitted",
                subjectType: "Article",
                target: "Digital divide persists as student WiFi coverage drops in outer colleges",
                time: "45m ago"
            },
            {
                user: sectionHeadName,
                avatar: "images/member-placeholder.svg",
                action: "approved",
                subjectType: "Manuscript",
                target: "Student Council financial audit reveals surplus",
                time: "1h ago"
            },
            {
                user: "Danilo C. Ramos",
                avatar: "images/member-placeholder.svg",
                action: "requested revision on",
                subjectType: "Manuscript",
                target: "Faculty union files formal grievance directive",
                time: "2h ago"
            },
            {
                user: "Carlo Ramos",
                avatar: "images/member-placeholder.svg",
                action: "uploaded",
                subjectType: "Photo Asset",
                target: "Central University Library Modernization Gallery",
                time: "3h ago"
            }
        ];

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

        if (viewerContent) {
            const raw = art.content || art.excerpt || 'No manuscript body content available.';
            const paras = raw.split(/\n\n+/).filter(p => p.trim());
            viewerContent.innerHTML = paras.map(p => `<p class="viewer-paragraph">${escapeHTML(p.trim())}</p>`).join('');
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
