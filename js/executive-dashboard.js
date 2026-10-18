/**
 * The Lens — Executive Dashboard Script
 * Clean, Reusable & Modular Implementation
 * 
 * Features:
 * 1. Auth Guard (Redirects to login if userRole is missing)
 * 2. Mobile Drawer Navigation (Hamburger, Close 'X', Backdrop)
 * 3. Real-Time Clock on Left (Date | Time in PH: "Oct 18, 2026 | 1:15 PM")
 * 4. Data-Driven Hydration:
 *    - 4 Metrics Cards (including "Total Articles")
 *    - Activity Log (Top 5 entries with personalized profile avatars)
 *    - Recent Submissions (Top 5 entries in responsive table)
 *    - Most Viewed Articles (Monthly with Eye & Share icons)
 *    - Top 5 Journalists Leaderboard
 * 5. Logout Session Cleanup
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. AUTHENTICATION & ROLE VERIFICATION
    // =========================================================================
    const userRole = localStorage.getItem('userRole');

    // Route Guard: If not signed in with a valid role, redirect to login
    if (!userRole) {
        window.location.href = 'login.html';
        return;
    }

    // Populate userRole into top-right badge, sidebar profile, and mobile dropdown
    const topbarRoleBadge = document.getElementById('topbar-user-role');
    const sidebarRoleText = document.getElementById('sidebar-user-role');
    const mobileRoleText = document.getElementById('mobile-user-role');

    if (topbarRoleBadge) topbarRoleBadge.textContent = userRole;
    if (sidebarRoleText) sidebarRoleText.textContent = userRole;
    if (mobileRoleText) mobileRoleText.textContent = userRole;

    // =========================================================================
    // 2. MOBILE ACCORDION DROPDOWN NAVIGATION (NO Off-Canvas Drawer)
    // =========================================================================
    const mobileHamburgerBtn = document.getElementById('mobile-hamburger-btn');
    const mobileNavDropdown = document.getElementById('mobile-nav-dropdown');

    if (mobileHamburgerBtn && mobileNavDropdown) {
        mobileHamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mobileNavDropdown.classList.toggle('open');
            mobileHamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close dropdown when tapping anywhere outside
        document.addEventListener('click', (e) => {
            if (!mobileNavDropdown.contains(e.target) && !mobileHamburgerBtn.contains(e.target)) {
                if (mobileNavDropdown.classList.contains('open')) {
                    mobileNavDropdown.classList.remove('open');
                    mobileHamburgerBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });

        // Close dropdown on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNavDropdown.classList.contains('open')) {
                mobileNavDropdown.classList.remove('open');
                mobileHamburgerBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // =========================================================================
    // 3. REAL-TIME CLOCK (Date | Time in PH: "Oct 18, 2026 | 1:15 PM")
    // =========================================================================
    const clockEl = document.getElementById('topbar-clock-display');

    function updateRealTimeClock() {
        if (!clockEl) return;

        const now = new Date();

        // Format Date: e.g. "Oct 18, 2026"
        const datePart = now.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Format Time: e.g. "1:15 PM" (just time then AM or PM)
        const timePart = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        clockEl.textContent = `${datePart} | ${timePart}`;
    }

    updateRealTimeClock();
    setInterval(updateRealTimeClock, 1000);

    // =========================================================================
    // 4. LOGOUT FUNCTIONALITY (Desktop Sidebar & Mobile Accordion)
    // =========================================================================
    function handleLogout(e) {
        e.preventDefault();
        localStorage.removeItem('userRole');
        localStorage.removeItem('studentNumber');
        window.location.href = 'login.html';
    }

    const logoutBtn = document.getElementById('logout-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);

    // =========================================================================
    // 5. DATA MODELS & REUSABLE HYDRATION
    // =========================================================================

    const now = new Date();
    const currentMonthName = now.toLocaleString('en-US', { month: 'long' });

    // A. Operational Metrics (4 Cards)
    const METRICS_DATA = [
        {
            label: "Pending Approvals",
            value: "7",
            subtitle: "Awaiting EIC / Pres review",
            icon: "fa-regular fa-clock",
            delayClass: "delay-1"
        },
        {
            label: "Monthly Readership",
            value: "42,850",
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
            label: "Total Articles", // Strictly "Total Articles"
            value: "14",
            subtitle: `Published this ${currentMonthName}`,
            icon: "fa-regular fa-newspaper",
            delayClass: "delay-4"
        }
    ];

    // B. Activity Log (Top 5 Entries with Personalized Profile Avatars)
    const ACTIVITY_LOG_DATA = [
        {
            user: "Juan Dela Cruz",
            avatar: "images/member-placeholder.svg",
            action: "updated an article",
            target: "Academic Freedom in the Digital Era",
            time: "25m ago"
        },
        {
            user: "Maria Santos",
            avatar: "images/member-placeholder.svg",
            action: "submitted a new draft for",
            target: "News Section",
            time: "2h ago"
        },
        {
            user: "Carlo Ramos",
            avatar: "images/member-placeholder.svg",
            action: "uploaded photo assets for",
            target: "Science & Tech Feature",
            time: "4h ago"
        },
        {
            user: "Finance Desk",
            avatar: "images/member-placeholder.svg",
            action: "approved transparency report",
            target: "Q1 Liquidation Report",
            time: "Yesterday"
        },
        {
            user: "Elena Cruz",
            avatar: "images/member-placeholder.svg",
            action: "revised literary folio submission",
            target: "Courtyard Poetry Folio",
            time: "2 days ago"
        }
    ];

    // C. Recent Submissions (Top 5 Entries for Responsive Table)
    const SUBMISSIONS_DATA = [
        {
            title: "PUP Biñan Campus Holds Annual Student Council Elections",
            author: "Maria Santos",
            section: "News",
            status: "Approved",
            date: "Oct 18, 2026"
        },
        {
            title: "Academic Freedom and Student Journalism in the Digital Era",
            author: "Juan Dela Cruz",
            section: "Opinion",
            status: "In Review",
            date: "Oct 17, 2026"
        },
        {
            title: "Engineering Students Develop Clean Energy Water Filtration Unit",
            author: "Carlo Ramos",
            section: "Science & Tech",
            status: "In Review",
            date: "Oct 16, 2026"
        },
        {
            title: "Whispers in the Courtyard: An Anthology of Campus Poetry",
            author: "Elena Cruz",
            section: "Literature",
            status: "Draft",
            date: "Oct 15, 2026"
        },
        {
            title: "First Semester Liquidation Report and Receipts Summary",
            author: "Finance Desk",
            section: "Transparency",
            status: "Approved",
            date: "Oct 14, 2026"
        }
    ];

    // D. Most Viewed Articles (Monthly with Eye & Share Icons)
    const MOST_VIEWED_DATA = [
        {
            rank: 1,
            title: "PUP Biñan Campus Holds Annual Student Council Elections",
            author: "Maria Santos",
            section: "News",
            views: "14,230",
            shares: "120"
        },
        {
            rank: 2,
            title: "Academic Freedom and Student Journalism in the Digital Era",
            author: "Juan Dela Cruz",
            section: "Opinion",
            views: "9,850",
            shares: "94"
        },
        {
            rank: 3,
            title: "Inside the New Laboratory Facility: What Students Can Expect",
            author: "Carlo Ramos",
            section: "Features",
            views: "6,410",
            shares: "68"
        }
    ];

    // E. Top 5 Journalists (Leaderboard)
    const TOP_JOURNALISTS_DATA = [
        { rank: 1, name: "Juan Dela Cruz", count: 15, avatar: "images/member-placeholder.svg" },
        { rank: 2, name: "Maria Santos", count: 12, avatar: "images/member-placeholder.svg" },
        { rank: 3, name: "Carlo Ramos", count: 10, avatar: "images/member-placeholder.svg" },
        { rank: 4, name: "Elena Cruz", count: 8, avatar: "images/member-placeholder.svg" },
        { rank: 5, name: "Andrei Bautista", count: 7, avatar: "images/member-placeholder.svg" }
    ];

    // -------------------------------------------------------------------------
    // Helper: Status Badge HTML Generator
    // -------------------------------------------------------------------------
    function getStatusBadgeHtml(status) {
        const lower = status.toLowerCase();
        if (lower === 'approved' || lower === 'published') {
            return `<span class="status-badge status-approved">Approved</span>`;
        }
        if (lower === 'in review' || lower === 'review') {
            return `<span class="status-badge status-review">In Review</span>`;
        }
        return `<span class="status-badge status-draft">Draft</span>`;
    }

    // -------------------------------------------------------------------------
    // Render Functions (Reusable & Clean)
    // -------------------------------------------------------------------------

    // 1. Render Metrics
    const metricsContainer = document.getElementById('metrics-grid');
    if (metricsContainer) {
        metricsContainer.innerHTML = METRICS_DATA.map(item => `
            <div class="metric-card animate-fade-in ${item.delayClass}">
                <div class="metric-header">
                    <span class="metric-label">${item.label}</span>
                    <div class="metric-icon-box">
                        <i class="${item.icon}"></i>
                    </div>
                </div>
                <div class="metric-value">${item.value}</div>
                <div class="metric-subtitle">${item.subtitle}</div>
            </div>
        `).join('');
    }

    // 2. Render Activity Log (Top 5 with Circular Profile Avatars)
    const activityContainer = document.getElementById('recent-activity-list');
    if (activityContainer) {
        activityContainer.innerHTML = ACTIVITY_LOG_DATA.map(item => `
            <div class="activity-item">
                <div class="activity-avatar">
                    <img src="${item.avatar}" alt="${item.user}">
                </div>
                <div class="activity-details">
                    <p class="activity-text">
                        <strong>${item.user}</strong> ${item.action} <em>${item.target}</em>
                    </p>
                    <span class="activity-time">${item.time}</span>
                </div>
            </div>
        `).join('');
    }

    // 3. Render Recent Submissions (Top 5 Table)
    const tableBody = document.getElementById('submissions-table-body');
    if (tableBody) {
        tableBody.innerHTML = SUBMISSIONS_DATA.map(row => `
            <tr>
                <td>
                    <a href="#manage-articles" class="table-article-link" title="${row.title}">
                        ${row.title}
                    </a>
                </td>
                <td><span class="table-author">${row.author}</span></td>
                <td class="hide-on-mobile"><span class="table-section-tag">${row.section}</span></td>
                <td>${getStatusBadgeHtml(row.status)}</td>
                <td class="hide-on-mobile"><span class="table-date">${row.date}</span></td>
            </tr>
        `).join('');
    }

    // 4. Render Most Viewed Articles (Monthly with Eye & Share Icons)
    const mostViewedContainer = document.getElementById('most-viewed-list');
    if (mostViewedContainer) {
        mostViewedContainer.innerHTML = MOST_VIEWED_DATA.map(item => `
            <div class="ranked-item">
                <span class="rank-number ${item.rank === 1 ? 'top-rank' : ''}">${item.rank}</span>
                <div class="ranked-content">
                    <a href="#manage-articles" class="ranked-title" title="${item.title}">
                        ${item.title}
                    </a>
                    <div class="ranked-meta-row">
                        <span class="ranked-author-category">${item.section} • ${item.author}</span>
                        <span class="ranked-stats">
                            <span class="stat-metric" title="Views"><i class="fa-regular fa-eye"></i> ${item.views}</span>
                            <span class="stat-sep">•</span>
                            <span class="stat-metric" title="Shares"><i class="fa-solid fa-share-nodes"></i> ${item.shares}</span>
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 5. Render Top 5 Journalists Leaderboard
    const topJournalistsContainer = document.getElementById('top-journalists-list');
    if (topJournalistsContainer) {
        topJournalistsContainer.innerHTML = TOP_JOURNALISTS_DATA.map(j => `
            <div class="journalist-item">
                <div class="journalist-left">
                    <span class="journalist-rank">${j.rank}.</span>
                    <div class="journalist-avatar">
                        <img src="${j.avatar}" alt="${j.name}">
                    </div>
                    <span class="journalist-name">${j.name}</span>
                </div>
                <span class="journalist-count-badge">${j.count} articles</span>
            </div>
        `).join('');
    }

    // =========================================================================
    // 6. NAVIGATION ACTIVE STATE HANDLER (Desktop & Mobile)
    // =========================================================================
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
