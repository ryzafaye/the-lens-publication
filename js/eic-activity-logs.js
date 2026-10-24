/**
 * ============================================================================
 * THE LENS — ACTIVITY LOGS LOGIC (EDITOR-IN-CHIEF PORTAL)
 * Clean, Minimalist, Distraction-Free Implementation Matching Executives
 * 
 * Sentence Format:
 * [Causer Name] [action] the [Subject Type] "[Subject Name]" [timestamp].
 * Under it: Role and time only.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. AUTHENTICATION & ROLE VERIFICATION
    // =========================================================================
    const userRole = localStorage.getItem('eicRole') || localStorage.getItem('userRole') || 'Editor-in-Chief';
    const userName = localStorage.getItem('eicName') || localStorage.getItem('userName') || 'Victoria Reyes';

    // =========================================================================
    // 2. ESCAPE HTML HELPER
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

    // =========================================================================
    // 3. ACTIVITY LOG DATASET
    // =========================================================================
    const ACTIVITY_STORAGE_KEY = 'executiveActivityLogs_v1';

    const defaultActivities = [
        {
            id: 'act-101',
            causer: "Victoria Reyes",
            causerRole: "Editor-in-Chief",
            causerAvatar: "images/member-placeholder.svg",
            action: "approved",
            subjectType: "Article",
            subjectName: "Academic Freedom in the Digital Era",
            timestampText: "12m ago",
            isoDate: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
            dateKey: new Date().toISOString().split('T')[0],
            formattedDate: "Oct 19, 2026 • 04:15 PM",
            dayGroup: "Today"
        },
        {
            id: 'act-102',
            causer: "Maria Santos",
            causerRole: "News Editor",
            causerAvatar: "images/member-placeholder.svg",
            action: "submitted",
            subjectType: "Article",
            subjectName: "Digital divide persists as student WiFi coverage drops in outer colleges",
            timestampText: "45m ago",
            isoDate: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            dateKey: new Date().toISOString().split('T')[0],
            formattedDate: "Oct 19, 2026 • 03:42 PM",
            dayGroup: "Today"
        },
        {
            id: 'act-103',
            causer: "Marcus Vance",
            causerRole: "Associate Editor-in-Chief",
            causerAvatar: "images/member-placeholder.svg",
            action: "reviewed",
            subjectType: "Article",
            subjectName: "The cost of compromise: Why student publication independence cannot be negotiated",
            timestampText: "1h ago",
            isoDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            dateKey: new Date().toISOString().split('T')[0],
            formattedDate: "Oct 19, 2026 • 03:27 PM",
            dayGroup: "Today"
        },
        {
            id: 'act-104',
            causer: "Victoria Reyes",
            causerRole: "Editor-in-Chief",
            causerAvatar: "images/member-placeholder.svg",
            action: "created",
            subjectType: "Account",
            subjectName: "Joshua Hernandez (BN-0)",
            timestampText: "2h ago",
            isoDate: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
            dateKey: new Date().toISOString().split('T')[0],
            formattedDate: "Oct 19, 2026 • 02:27 PM",
            dayGroup: "Today"
        },
        {
            id: 'act-105',
            causer: "Carlo Ramos",
            causerRole: "Photo Editor",
            causerAvatar: "images/member-placeholder.svg",
            action: "uploaded",
            subjectType: "Photo Asset",
            subjectName: "Central University Library Modernization Gallery",
            timestampText: "3h ago",
            isoDate: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
            dateKey: new Date().toISOString().split('T')[0],
            formattedDate: "Oct 19, 2026 • 01:27 PM",
            dayGroup: "Today"
        },
        {
            id: 'act-106',
            causer: "Finance Desk",
            causerRole: "Treasurer",
            causerAvatar: "images/member-placeholder.svg",
            action: "verified",
            subjectType: "Transparency Report",
            subjectName: "Q3 Publication Operating Budget Liquidation",
            timestampText: "5h ago",
            isoDate: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
            dateKey: new Date().toISOString().split('T')[0],
            formattedDate: "Oct 19, 2026 • 11:27 AM",
            dayGroup: "Today"
        },
        {
            id: 'act-107',
            causer: "Victoria Reyes",
            causerRole: "Editor-in-Chief",
            causerAvatar: "images/member-placeholder.svg",
            action: "published",
            subjectType: "Editorial",
            subjectName: "The Sacred Covenant of the Fourth Estate: An Editorial Manifesto",
            timestampText: "Yesterday",
            isoDate: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 26 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 18, 2026 • 05:10 PM",
            dayGroup: "Yesterday"
        },
        {
            id: 'act-108',
            causer: "Marcus Vance",
            causerRole: "Associate Editor-in-Chief",
            causerAvatar: "images/member-placeholder.svg",
            action: "requested revision for",
            subjectType: "Article",
            subjectName: "Campus Laboratory Infrastructure & Science Funding Disparities",
            timestampText: "Yesterday",
            isoDate: new Date(Date.now() - 29 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 29 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 18, 2026 • 02:40 PM",
            dayGroup: "Yesterday"
        },
        {
            id: 'act-109',
            causer: "David Kim",
            causerRole: "Staff Writer",
            causerAvatar: "images/member-placeholder.svg",
            action: "submitted",
            subjectType: "Article",
            subjectName: "Student Council debates emergency tuition freeze resolution",
            timestampText: "Yesterday",
            isoDate: new Date(Date.now() - 32 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 32 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 18, 2026 • 11:15 AM",
            dayGroup: "Yesterday"
        },
        {
            id: 'act-110',
            causer: "Victoria Reyes",
            causerRole: "Editor-in-Chief",
            causerAvatar: "images/member-placeholder.svg",
            action: "approved",
            subjectType: "Article",
            subjectName: "Behind the Scenes of the University Theater Guild Revival",
            timestampText: "3 days ago",
            isoDate: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 72 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 16, 2026 • 03:30 PM",
            dayGroup: "Earlier this Week"
        },
        {
            id: 'act-111',
            causer: "Marcus Vance",
            causerRole: "Associate Editor-in-Chief",
            causerAvatar: "images/member-placeholder.svg",
            action: "updated",
            subjectType: "Editorial Guidelines",
            subjectName: "Autumn Semester Verification & Source Attribution Protocol",
            timestampText: "4 days ago",
            isoDate: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 96 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 15, 2026 • 02:00 PM",
            dayGroup: "Earlier this Week"
        },
        {
            id: 'act-112',
            causer: "Carlo Ramos",
            causerRole: "Photo Editor",
            causerAvatar: "images/member-placeholder.svg",
            action: "archived",
            subjectType: "Photo Asset",
            subjectName: "Alumni Homecoming 2025 Draft Banners",
            timestampText: "5 days ago",
            isoDate: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 120 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 14, 2026 • 04:22 PM",
            dayGroup: "Earlier this Week"
        },
        {
            id: 'act-113',
            causer: "Finance Desk",
            causerRole: "Treasurer",
            causerAvatar: "images/member-placeholder.svg",
            action: "published",
            subjectType: "Transparency Report",
            subjectName: "Annual Printing & Press Equipment Audit 2026",
            timestampText: "6 days ago",
            isoDate: new Date(Date.now() - 144 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 144 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 13, 2026 • 10:30 AM",
            dayGroup: "Earlier this Week"
        }
    ];

    function loadActivities() {
        try {
            const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('Could not read executiveActivityLogs_v1:', e);
        }
        return JSON.parse(JSON.stringify(defaultActivities));
    }

    let activitiesList = loadActivities();

    // =========================================================================
    // 4. DOM ELEMENTS & CONTROLS
    // =========================================================================
    const searchInput = document.getElementById('activity-search-input');
    const searchClearBtn = document.getElementById('activity-search-clear');
    const dateFilterSelect = document.getElementById('date-filter-select');
    const specificDateWrapper = document.getElementById('specific-date-wrapper');
    const specificDatePicker = document.getElementById('specific-date-picker');
    const timelineStreamContainer = document.getElementById('activity-stream-timeline');
    const resultsCounterEl = document.getElementById('activity-results-counter');

    // =========================================================================
    // 5. FILTERING ENGINE
    // =========================================================================
    function getFilteredActivities() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const dateFilter = dateFilterSelect ? dateFilterSelect.value : 'all';
        const specificDate = specificDatePicker ? specificDatePicker.value : '';

        const now = Date.now();
        const oneDayMs = 24 * 3600 * 1000;
        const sevenDaysMs = 7 * oneDayMs;
        const thirtyDaysMs = 30 * oneDayMs;

        return activitiesList.filter(item => {
            // Date Filter: today, 7days, 30days, specific
            if (dateFilter !== 'all') {
                const itemTime = new Date(item.isoDate).getTime();
                const diff = now - itemTime;

                if (dateFilter === 'today') {
                    if (diff > oneDayMs && item.dayGroup !== 'Today') return false;
                } else if (dateFilter === '7days') {
                    if (diff > sevenDaysMs) return false;
                } else if (dateFilter === '30days') {
                    if (diff > thirtyDaysMs) return false;
                } else if (dateFilter === 'specific') {
                    if (!specificDate) return true;
                    if (item.dateKey !== specificDate) return false;
                }
            }

            // Search query filter
            if (query) {
                const haystack = `${item.causer} ${item.causerRole} ${item.action} ${item.subjectType} ${item.subjectName}`.toLowerCase();
                if (!haystack.includes(query)) return false;
            }

            return true;
        });
    }

    // =========================================================================
    // 6. TIMELINE RENDERING
    // =========================================================================
    function renderActivities() {
        if (!timelineStreamContainer) return;

        const filtered = getFilteredActivities();

        // Update results counter
        if (resultsCounterEl) {
            if (filtered.length === activitiesList.length) {
                resultsCounterEl.innerHTML = `Showing all <em>${filtered.length}</em> logged events`;
            } else {
                resultsCounterEl.innerHTML = `Showing <em>${filtered.length}</em> of ${activitiesList.length} logged events`;
            }
        }

        if (filtered.length === 0) {
            timelineStreamContainer.innerHTML = `
                <div class="activity-empty-state">
                    <div class="activity-empty-icon">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                    </div>
                    <h3 class="activity-empty-title">No activity logs found</h3>
                    <p class="activity-empty-text">No activity records match your current search or date filter. Try clearing the filter to see all events.</p>
                </div>
            `;
            return;
        }

        // Group filtered activities by dayGroup
        const groups = {};
        filtered.forEach(item => {
            const groupKey = item.dayGroup || 'Earlier';
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(item);
        });

        let html = '';

        for (const [day, items] of Object.entries(groups)) {
            html += `
                <div class="timeline-day-divider">
                    <span class="timeline-day-pill">${escapeHTML(day)}</span>
                    <span class="timeline-day-line"></span>
                </div>
            `;

            items.forEach(item => {
                html += `
                    <div class="activity-event-card">
                        <div class="activity-event-node"></div>

                        <div class="activity-card-inner">
                            <div class="activity-avatar-wrap">
                                <img src="${escapeHTML(item.causerAvatar || 'images/member-placeholder.svg')}" alt="${escapeHTML(item.causer)}" class="activity-avatar-img">
                            </div>

                            <div class="activity-content-col">
                                <!-- Sentence Format Statement -->
                                <p class="activity-sentence-statement">
                                    <strong class="causer-name-token">${escapeHTML(item.causer)}</strong> ${escapeHTML(item.action)} the ${escapeHTML(item.subjectType)} <span class="subject-name-token">"${escapeHTML(item.subjectName)}"</span> <span class="timestamp-token">${escapeHTML(item.timestampText)}.</span>
                                </p>

                                <!-- Under it: Role and time only -->
                                <div class="activity-subrow">
                                    <span class="activity-role-text">${escapeHTML(item.causerRole)}</span>
                                    <span class="activity-subrow-dot">•</span>
                                    <span class="activity-exact-time">${escapeHTML(item.formattedDate)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        timelineStreamContainer.innerHTML = html;
    }

    // =========================================================================
    // 7. EVENT LISTENERS
    // =========================================================================
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (searchClearBtn) {
                searchClearBtn.style.display = searchInput.value.length > 0 ? 'block' : 'none';
            }
            renderActivities();
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchClearBtn.style.display = 'none';
                searchInput.focus();
                renderActivities();
            }
        });
    }

    if (dateFilterSelect) {
        dateFilterSelect.addEventListener('change', () => {
            const isSpecific = (dateFilterSelect.value === 'specific');
            if (specificDateWrapper) {
                specificDateWrapper.classList.toggle('hidden', !isSpecific);
                if (isSpecific && specificDatePicker) {
                    specificDatePicker.focus();
                }
            }
            renderActivities();
        });
    }

    if (specificDatePicker) {
        specificDatePicker.addEventListener('change', () => {
            renderActivities();
        });
    }

    // Initial Render
    renderActivities();
});

