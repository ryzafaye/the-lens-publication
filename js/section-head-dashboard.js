/**
 * The Lens — Section Head Dashboard Script
 * Modular, clean, reusable implementation tailored for Editorial Section Heads
 */

import { articles as defaultArticles } from './articles.js';

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. AUTHENTICATION & ROLE VERIFICATION
    // =========================================================================
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
        window.location.href = 'login.html';
        return;
    }

    const currentSection = localStorage.getItem('sectionHeadSection') || 'News';
    const sectionHeadName = localStorage.getItem('userName') || 'Danilo C. Ramos';

    // Helper functions
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

    // Section specific articles
    const sectionArticles = allArticles.filter(a => {
        if (!a.category) return false;
        const cat = a.category.toLowerCase();
        const sec = currentSection.toLowerCase();
        if (sec.includes('science') || sec.includes('tech')) {
            return cat.includes('science') || cat.includes('tech');
        }
        if (sec.includes('feature')) {
            return cat.includes('feature');
        }
        if (sec.includes('literature')) {
            return cat.includes('literary') || cat.includes('literature');
        }
        if (sec.includes('news')) {
            return cat.includes('news');
        }
        return cat.includes(sec);
    });

    // My personal articles
    let myArticles = [];
    try {
        const rawMy = localStorage.getItem('sectionHeadMyArticles_v1');
        if (rawMy) myArticles = JSON.parse(rawMy);
    } catch (e) {}

    // Pending review queue
    const pendingArticles = [
        {
            id: 'rev-01',
            title: "Student council financial audit reveals ₱320,000 unallocated surplus",
            category: "News",
            date: "Oct 18, 2026",
            author: "Mara Villanueva",
            status: "Pending Review",
            excerpt: "Audit of the Central Student Council expenditures reveals an unallocated contingency reserve."
        },
        {
            id: 'rev-02',
            title: "Why the enrollment portal keeps timing out: A technical post-mortem",
            category: "Science and Technology",
            date: "Oct 18, 2026",
            author: "Noah Reyes",
            status: "Pending Review",
            excerpt: "Database locking bottlenecks rather than raw network bandwidth cause registration server timeouts."
        },
        {
            id: 'rev-03',
            title: "Faculty union files formal grievance over proposed 24-unit overload directive",
            category: "News",
            date: "Oct 17, 2026",
            author: "Rafael Ramos",
            status: "Pending Review",
            excerpt: "Union manifesto warns against unmitigated workload increases for contractual and regular lecturers."
        },
        {
            id: 'rev-05',
            title: "Inside the 24-hour night shift of university sanitation workers",
            category: "Features",
            date: "Oct 12, 2026",
            author: "Lia Mendoza",
            status: "Pending Review",
            excerpt: "A look inside the nocturnal routine of custodians maintaining campus facilities."
        },
        {
            id: 'rev-06',
            title: "Echoes of the Quadrangle: Anthology of New Student Poetry",
            category: "Literature",
            date: "Oct 21, 2026",
            author: "Camille Joy Perez",
            status: "Pending Review",
            excerpt: "A curated sequence of verses depicting collegiate life, transit commutes, and campus memory."
        }
    ];

    const sectionPending = pendingArticles.filter(a => {
        const cat = a.category.toLowerCase();
        const sec = currentSection.toLowerCase();
        if (sec.includes('science') || sec.includes('tech')) return cat.includes('science') || cat.includes('tech');
        if (sec.includes('feature')) return cat.includes('feature');
        if (sec.includes('literature')) return cat.includes('liter');
        if (sec.includes('news')) return cat.includes('news');
        return cat.includes(sec);
    });

    // =========================================================================
    // 3. HYDRATE METRICS CARDS
    // =========================================================================
    const metricsGrid = document.getElementById('metrics-grid');
    if (metricsGrid) {
        const sectionViews = sectionArticles.reduce((acc, a) => acc + (a.views || 0), 0) + 8450;
        const totalCount = sectionArticles.length > 0 ? sectionArticles.length : 14;
        const pendingCount = sectionPending.length;
        const myCount = myArticles.length > 0 ? myArticles.length : 3;

        metricsGrid.innerHTML = `
            <div class="metric-card">
                <div class="metric-number">${sectionViews.toLocaleString()}</div>
                <div class="metric-label">${currentSection} Readership</div>
                <div class="metric-context"><span class="metric-trend up">&uarr; 14%</span> vs last month</div>
            </div>
            <div class="metric-card">
                <div class="metric-number">${totalCount}</div>
                <div class="metric-label">${currentSection} Articles</div>
                <div class="metric-context">Published to site</div>
            </div>
            <div class="metric-card">
                <div class="metric-number">${pendingCount}</div>
                <div class="metric-label">Awaiting Your Review</div>
                <div class="metric-context"><span class="metric-trend ${pendingCount > 0 ? 'up' : ''}">Priority queue</span></div>
            </div>
            <div class="metric-card">
                <div class="metric-number">${myCount}</div>
                <div class="metric-label">My Authored Articles</div>
                <div class="metric-context">Personal manuscripts</div>
            </div>
        `;
    }

    // =========================================================================
    // 4. HYDRATE PENDING SECTION SUBMISSIONS TABLE
    // =========================================================================
    const submissionsTableBody = document.getElementById('submissions-table-body');
    if (submissionsTableBody) {
        const displayItems = sectionPending.length > 0 ? sectionPending : pendingArticles.slice(0, 3);
        submissionsTableBody.innerHTML = displayItems.map(item => `
            <tr class="clickable-row" onclick="window.location.href='section-head-review-articles.html'">
                <td>
                    <div class="article-title-cell font-bold text-slate-900">${escapeHTML(item.title)}</div>
                    <div class="text-xs text-slate-500 sm:hidden">${escapeHTML(item.author)} &bull; ${escapeHTML(item.date)}</div>
                </td>
                <td>${escapeHTML(item.author)}</td>
                <td class="hide-on-mobile"><span class="table-tag">${escapeHTML(item.category)}</span></td>
                <td><span class="status-badge pending">Awaiting Review</span></td>
                <td class="hide-on-mobile text-slate-500">${escapeHTML(item.date)}</td>
            </tr>
        `).join('');
    }

    // =========================================================================
    // 5. HYDRATE ACTIVITY LOG
    // =========================================================================
    const activityList = document.getElementById('recent-activity-list');
    if (activityList) {
        const activities = [
            { user: sectionHeadName, action: `approved draft in`, target: `${currentSection}`, time: "2 hours ago" },
            { user: "Sofia M. Alcaraz", action: "submitted new manuscript to", target: `${currentSection}`, time: "4 hours ago" },
            { user: sectionHeadName, action: `requested revisions on`, target: `Faculty Overload Article`, time: "Yesterday at 3:15 PM" },
            { user: "Marco L. Valderrama", action: "updated article draft in", target: `${currentSection}`, time: "Oct 20, 2026" }
        ];

        activityList.innerHTML = activities.map(act => `
            <div class="activity-item">
                <div class="activity-dot"></div>
                <div class="activity-details">
                    <div class="activity-text">
                        <strong>${escapeHTML(act.user)}</strong> ${escapeHTML(act.action)} <em>"${escapeHTML(act.target)}"</em>
                    </div>
                    <div class="activity-time">${escapeHTML(act.time)}</div>
                </div>
            </div>
        `).join('');
    }

    // =========================================================================
    // 6. HYDRATE MOST VIEWED ARTICLES
    // =========================================================================
    const mostViewedList = document.getElementById('most-viewed-list');
    if (mostViewedList) {
        const displayMost = (sectionArticles.length >= 3 ? sectionArticles : allArticles).slice(0, 3);
        mostViewedList.innerHTML = displayMost.map((item, idx) => `
            <div class="ranked-item">
                <div class="ranked-index">0${idx + 1}</div>
                <div class="ranked-content">
                    <div class="ranked-category">${escapeHTML(item.category || currentSection)}</div>
                    <div class="ranked-title">${escapeHTML(item.title)}</div>
                    <div class="ranked-meta">
                        <span>By ${escapeHTML(item.author || 'Staff Writer')}</span>
                        <span>&bull;</span>
                        <span>${(item.views || 3420 + idx * 800).toLocaleString()} views</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // =========================================================================
    // 7. HYDRATE CONTRIBUTORS
    // =========================================================================
    const journalistsTableBody = document.getElementById('top-journalists-table-body');
    if (journalistsTableBody) {
        const contributors = [
            { name: "Sofia M. Alcaraz", count: 6 },
            { name: "Marco L. Valderrama", count: 4 },
            { name: "Camille Joy Perez", count: 3 },
            { name: "Lia Mendoza", count: 2 }
        ];

        journalistsTableBody.innerHTML = contributors.map(c => `
            <tr>
                <td class="col-author font-medium text-slate-800">${escapeHTML(c.name)}</td>
                <td class="col-article-count font-bold text-[#5c0a18]">${c.count} articles</td>
            </tr>
        `).join('');
    }

    // =========================================================================
    // 8. VIEWER MODAL CONTROLS
    // =========================================================================
    const closeViewerBtn = document.getElementById('close-viewer-btn');
    const viewerModal = document.getElementById('article-viewer-modal');
    if (closeViewerBtn && viewerModal) {
        closeViewerBtn.addEventListener('click', () => {
            viewerModal.classList.add('hidden');
        });
        viewerModal.addEventListener('click', (e) => {
            if (e.target === viewerModal) {
                viewerModal.classList.add('hidden');
            }
        });
    }

    const viewerReviewBtn = document.getElementById('viewer-review-btn');
    if (viewerReviewBtn) {
        viewerReviewBtn.addEventListener('click', () => {
            window.location.href = 'section-head-review-articles.html';
        });
    }
});

