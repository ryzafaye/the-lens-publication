/**
 * The Lens — Media & Public Communications (M&PC) Dashboard Script
 * Clean, Reusable & Modular Implementation matching Executive Dashboard logic & design
 * 
 * Features:
 * 1. Auth Guard (Redirects to login if userRole is missing)
 * 2. Data-Driven Hydration from Shared Dataset:
 *    - 4 Metrics Cards (Pending Approvals, Monthly Readership, Active Members, Published Stories)
 *    - Pending Approval (Top 5 table with direct article viewer modal triggers)
 *    - Activity Log with "View all"
 *    - Most Viewed Articles (Maroon category above title, Pen-nib author icon, Views & Shares)
 *    - Top Performing Journalists Leaderboard
 * 3. In-Place Article Viewer Modal:
 *    - Opens full story overlay directly
 *    - Actions: Close, Open in Publish Article
 */

import { articles as defaultArticles } from './articles.js';

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. AUTHENTICATION & ROLE VERIFICATION
    // =========================================================================
    const userRole = localStorage.getItem('mpcRole') || localStorage.getItem('userRole');

    // Route Guard: If not signed in with a valid role, redirect to login
    if (!userRole) {
        window.location.href = 'login.html';
        return;
    }

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
        }, 3200);
    }

    // =========================================================================
    // 3. SHARED ARTICLES DATASET & PERSISTENCE
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
    const ACTIVITY_LOG_DATA = [
        {
            user: "Julian Del Rosario",
            avatar: "images/member-placeholder.svg",
            action: "published",
            subjectType: "Article",
            target: "PUP Bans Single-Use Plastics on Main Campus Starting Next Academic Term",
            time: "10m ago"
        },
        {
            user: "Samantha Cruz",
            avatar: "images/member-placeholder.svg",
            action: "assigned cover to",
            subjectType: "Article",
            target: "Student council financial audit reveals ₱320,000 unallocated surplus",
            time: "25m ago"
        },
        {
            user: "Victoria Reyes",
            avatar: "images/member-placeholder.svg",
            action: "endorsed",
            subjectType: "Article",
            target: "Academic Freedom in the Digital Era",
            time: "1h ago"
        },
        {
            user: "Maria Santos",
            avatar: "images/member-placeholder.svg",
            action: "uploaded Pubmat for",
            subjectType: "Visual Asset",
            target: "Central University Library Modernization Gallery",
            time: "2h ago"
        },
        {
            user: "Finance Desk",
            avatar: "images/member-placeholder.svg",
            action: "verified",
            subjectType: "Transparency Report",
            target: "Q3 Publication Operating Budget Liquidation",
            time: "4h ago"
        }
    ];

    // Pending Review Queue Dataset & Persistence
    const DEFAULT_PENDING_ARTICLES = [
        {
            id: 'rev-01',
            title: "Student council financial audit reveals ₱320,000 unallocated surplus",
            category: "News",
            date: "Oct 18, 2026",
            rawDate: "2026-10-18",
            author: "Mara Villanueva",
            status: "Pending",
            readTime: "3 min read",
            content: `An independent financial audit of the Central Student Council (CSC) expenditures for the first quarter of Academic Year 2026–2027 has revealed an unallocated surplus of ₱320,450 from the student activity development fund.\n\nThe findings, presented during an extraordinary collegiate assembly, prompted student leaders from the College of Science and College of Engineering to question why emergency welfare assistance programs were stalled earlier this term due to cited budgetary deficits.`
        },
        {
            id: 'rev-02',
            title: "Why the enrollment portal keeps timing out: A technical post-mortem",
            category: "Science and Technology",
            date: "Oct 18, 2026",
            rawDate: "2026-10-18",
            author: "Noah Reyes",
            status: "Pending",
            readTime: "4 min read",
            content: `Every enlistment cycle, tens of thousands of university students endure hours of connection timeouts, 504 Gateway errors, and lost subject slots. An in-depth technical examination of the campus enrollment infrastructure reveals that database locking bottlenecks, rather than network bandwidth, remain the root cause.`
        },
        {
            id: 'rev-03',
            title: "Faculty union files formal grievance over proposed 24-unit overload directive",
            category: "News",
            date: "Oct 17, 2026",
            rawDate: "2026-10-17",
            author: "Rafael Ramos",
            status: "Pending",
            readTime: "3 min read",
            content: `The University Faculty Association (UFA) has formally submitted a dispute grievance to the Office of the Vice President for Academic Affairs following administrative directives requiring full-time instructors to absorb up to 24 class teaching units without proportional overtime compensation.`
        },
        {
            id: 'rev-04',
            title: "The cost of compromise: Why student publication independence cannot be negotiated",
            category: "Opinion",
            date: "Oct 15, 2026",
            rawDate: "2026-10-15",
            author: "Paolo Santos",
            status: "Pending",
            readTime: "4 min read",
            content: `When institutional administrators propose prior editorial review under the guise of 'brand alignment', the sacred covenant of campus journalism is under direct siege.`
        },
        {
            id: 'rev-05',
            title: "Inside the 24-hour night shift of university sanitation workers",
            category: "Features",
            date: "Oct 12, 2026",
            rawDate: "2026-10-12",
            author: "Lia Mendoza",
            status: "Pending",
            readTime: "5 min read",
            content: `At 11:30 PM, long after the last student leaves the library and lecture lights flick off, an army of twenty-two custodial workers steps onto the silent campus grounds.`
        },
        {
            id: 'rev-06',
            title: "Echoes from the Quadrangle: Verses from the Midnight Study Hall",
            category: "Literature",
            date: "Oct 11, 2026",
            rawDate: "2026-10-11",
            author: "Camille Torres",
            status: "Pending",
            readTime: "2 min read",
            content: `The hum of fluorescent tubes,\nthe rustle of photocopied notes,\nshadows stretching across tiled floorboards,\nwhile the city sleeps in heavy coats.`
        }
    ];

    function getPendingQueue() {
        try {
            const raw = localStorage.getItem('eicPendingReviewQueue') || localStorage.getItem('executivePendingReviewQueue');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('Could not read pending review queue', e);
        }
        return JSON.parse(JSON.stringify(DEFAULT_PENDING_ARTICLES));
    }

    // =========================================================================
    // 5. DASHBOARD RENDERING PIPELINE
    // =========================================================================
    function renderDashboard() {
        const activeArticles = articles.filter(a => !a.isArchived);
        const totalViews = activeArticles.reduce((sum, a) => sum + (Number(a.views) || 0), 0);
        const pendingList = getPendingQueue();

        // A. Metrics Cards (4 Cards)
        const metricsContainer = document.getElementById('metrics-grid');
        if (metricsContainer) {
            const metrics = [
                {
                    label: "Pending Approvals",
                    value: String(pendingList.length),
                    subtitle: "Awaiting editorial review",
                    icon: "fa-regular fa-clock",
                    delayClass: "delay-1"
                },
                {
                    label: "Monthly Readership",
                    value: totalViews.toLocaleString(),
                    subtitle: "Views across all desks",
                    icon: "fa-regular fa-eye",
                    delayClass: "delay-2"
                },
                {
                    label: "Active Members",
                    value: "28",
                    subtitle: "Staff & editorial roster",
                    icon: "fa-solid fa-users",
                    delayClass: "delay-3"
                },
                {
                    label: "Published Stories",
                    value: String(activeArticles.length),
                    subtitle: "Total overall published",
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

        // B. Activity Log (Top 5 Recent with Causer Action Subject Format)
        const activityContainer = document.getElementById('recent-activity-list');
        if (activityContainer) {
            let logsToDisplay = ACTIVITY_LOG_DATA;
            try {
                const storedLogs = localStorage.getItem('executiveActivityLogs_v1');
                if (storedLogs) {
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

            activityContainer.innerHTML = logsToDisplay.map(item => `
                <div class="activity-item" onclick="window.location.href='mpc-activity-logs.html'" style="cursor: pointer;" title="Open Activity Log">
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

        // C. Pending Approval (Top 5 Table with Direct Modal View Trigger)
        const tableBody = document.getElementById('submissions-table-body');
        
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

        if (tableBody) {
            const topPending = pendingList.slice(0, 5);

            if (topPending.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted, #667085);">No pending submissions awaiting review.</td></tr>`;
            } else {
                tableBody.innerHTML = topPending.map(art => `
                    <tr>
                        <td>
                            <div class="table-article-info">
                                <button type="button" class="table-article-btn" data-action="view" data-id="${escapeHTML(art.id)}" title="${escapeHTML(art.title)}">
                                    ${escapeHTML(art.title)}
                                </button>
                                <div class="table-author-subline">
                                    <i class="fa-solid fa-pen-nib"></i>
                                    <span>${escapeHTML(art.author)}</span>
                                </div>
                            </div>
                        </td>
                        <td class="hide-on-mobile">${formatSectionBadgeHtml(art.category)}</td>
                        <td><span class="status-badge status-review">Pending</span></td>
                        <td class="hide-on-mobile"><span class="table-date">${escapeHTML(art.date)}</span></td>
                        <td class="text-right">
                            <a href="mpc-publish-article.html" class="table-manage-btn" title="Manage &amp; Publish">
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

            mostViewedContainer.innerHTML = mostViewed.map((art, idx) => `
                <div class="ranked-item" data-article-id="${art.id}">
                    <span class="rank-number ${idx === 0 ? 'top-rank' : ''}">${idx + 1}</span>
                    <div class="ranked-content">
                        <div class="ranked-category-tag">${escapeHTML(art.category)}</div>
                        <button type="button" class="ranked-title-btn" data-action="view" data-id="${art.id}" title="${escapeHTML(art.title)}">
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

        // E. Top Performing Journalists (Table Layout: Name & Number Only)
        const topJournalistsTableBody = document.getElementById('top-journalists-table-body');

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

        if (topJournalistsTableBody) {
            topJournalistsTableBody.innerHTML = topJournalists.map(j => `
                <tr>
                    <td class="col-author-name">${escapeHTML(j.name)}</td>
                    <td class="col-article-count">${j.count}</td>
                </tr>
            `).join('');
        }
    }

    // Initial Dashboard Render
    renderDashboard();

    // =========================================================================
    // 6. MODALS SYSTEM: VIEWER MODAL
    // =========================================================================
    const viewerModal = document.getElementById('article-viewer-modal');
    const closeViewerBtn = document.getElementById('close-viewer-btn');
    const viewerCancelBtn = document.getElementById('viewer-cancel-btn');
    const viewerPublishBtn = document.getElementById('viewer-publish-btn');
    const viewerTitle = document.getElementById('viewer-title');
    const viewerCategory = document.getElementById('viewer-category');
    const viewerDate = document.getElementById('viewer-date');
    const viewerAuthor = document.getElementById('viewer-author');
    const viewerReadTime = document.getElementById('viewer-read-time');
    const viewerContent = document.getElementById('viewer-content');

    function openViewerModal(art) {
        if (!viewerModal || !art) return;

        if (viewerTitle) viewerTitle.textContent = art.title || 'Untitled';
        if (viewerCategory) viewerCategory.textContent = art.category || 'General';
        if (viewerDate) viewerDate.textContent = art.date || 'Oct 2026';
        if (viewerAuthor) viewerAuthor.textContent = art.author || 'The Lens Staff';
        if (viewerReadTime) viewerReadTime.textContent = art.readTime || '3 min read';

        if (viewerContent) {
            if (art.content) {
                viewerContent.innerHTML = art.content.split('\n\n').map(p => `<p>${escapeHTML(p.trim())}</p>`).join('');
            } else if (art.excerpt) {
                viewerContent.innerHTML = `<p>${escapeHTML(art.excerpt)}</p>`;
            } else {
                viewerContent.innerHTML = `<p>Full article manuscript loaded from The Lens archives.</p>`;
            }
        }

        viewerModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeViewer() {
        if (!viewerModal) return;
        viewerModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    if (closeViewerBtn) closeViewerBtn.addEventListener('click', closeViewer);
    if (viewerCancelBtn) viewerCancelBtn.addEventListener('click', closeViewer);
    if (viewerPublishBtn) {
        viewerPublishBtn.addEventListener('click', () => {
            closeViewer();
            window.location.href = 'mpc-publish-article.html';
        });
    }

    if (viewerModal) {
        viewerModal.addEventListener('click', (e) => {
            if (e.target === viewerModal) closeViewer();
        });
    }

    // Delegate click for table buttons & ranked title buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="view"]');
        if (!btn) return;

        const id = btn.getAttribute('data-id');
        if (!id) return;

        const pendingList = getPendingQueue();
        const foundPending = pendingList.find(a => String(a.id) === String(id));
        if (foundPending) {
            openViewerModal(foundPending);
            return;
        }

        const foundArticle = articles.find(a => String(a.id) === String(id));
        if (foundArticle) {
            openViewerModal(foundArticle);
        }
    });

    // Keyboard ESC listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && viewerModal && !viewerModal.classList.contains('hidden')) {
            closeViewer();
        }
    });

});
