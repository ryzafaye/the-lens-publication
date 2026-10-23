/**
 * ============================================================================
 * THE LENS — ACTIVITY LOGS LOGIC (SECTION HEAD PORTAL)
 * Clean, Minimalist, Distraction-Free Implementation
 * Identical Design, Format & Logic to Executive Portal
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
    const userRole = localStorage.getItem('userRole') || localStorage.getItem('sectionHeadRole') || 'News Head';
    const userName = localStorage.getItem('userName') || localStorage.getItem('sectionHeadName') || 'Danilo C. Ramos';

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
    // 3. ACTIVITY LOG DATASET (Shared with Executive Portal)
    // =========================================================================
    const ACTIVITY_STORAGE_KEY = 'executiveActivityLogs_v1';

    const defaultActivities = [
        {
            id: 'act-101',
            causer: "Danilo C. Ramos",
            causerRole: "News Head",
            causerAvatar: "images/member-placeholder.svg",
            action: "approved",
            subjectType: "Manuscript",
            subjectName: "Student Council financial audit reveals ₱320,000 unallocated surplus",
            timestampText: "15m ago",
            isoDate: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            dateKey: new Date().toISOString().split('T')[0],
            formattedDate: "Oct 22, 2026 • 04:15 PM",
            dayGroup: "Today"
        },
        {
            id: 'act-102',
            causer: "Maria Santos",
            causerRole: "Editor-in-Chief",
            causerAvatar: "images/member-placeholder.svg",
            action: "published",
            subjectType: "Article",
            subjectName: "Academic Freedom in the Digital Era",
            timestampText: "45m ago",
            isoDate: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            dateKey: new Date().toISOString().split('T')[0],
            formattedDate: "Oct 22, 2026 • 03:42 PM",
            dayGroup: "Today"
        },
        {
            id: 'act-103',
            causer: "Dr. Elena M. Romero",
            causerRole: "Science and Technology Head",
            causerAvatar: "images/member-placeholder.svg",
            action: "returned for revision",
            subjectType: "Manuscript",
            subjectName: "Why the enrollment portal keeps timing out: A technical post-mortem",
            timestampText: "2h ago",
            isoDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
            dateKey: new Date().toISOString().split('T')[0],
            formattedDate: "Oct 22, 2026 • 02:30 PM",
            dayGroup: "Today"
        },
        {
            id: 'act-104',
            causer: "Bianca Rose Flores",
            causerRole: "Feature Head",
            causerAvatar: "images/member-placeholder.svg",
            action: "reviewed",
            subjectType: "Manuscript",
            subjectName: "Inside the 24-hour night shift of university sanitation workers",
            timestampText: "3h ago",
            isoDate: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
            dateKey: new Date().toISOString().split('T')[0],
            formattedDate: "Oct 22, 2026 • 01:10 PM",
            dayGroup: "Today"
        },
        {
            id: 'act-105',
            causer: "Juan Dela Cruz",
            causerRole: "President",
            causerAvatar: "images/member-placeholder.svg",
            action: "published",
            subjectType: "Executive Bulletin",
            subjectName: "The Lens Editorial Charter 2026",
            timestampText: "5h ago",
            isoDate: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
            dateKey: new Date().toISOString().split('T')[0],
            formattedDate: "Oct 22, 2026 • 11:15 AM",
            dayGroup: "Today"
        },
        {
            id: 'act-106',
            causer: "Carlos Joaquin Luna",
            causerRole: "Literature Head",
            causerAvatar: "images/member-placeholder.svg",
            action: "approved",
            subjectType: "Literary Submission",
            subjectName: "Echoes of the Quadrangle: Anthology of New Student Poetry",
            timestampText: "Yesterday at 4:32 PM",
            isoDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 21, 2026 • 04:32 PM",
            dayGroup: "Yesterday"
        },
        {
            id: 'act-107',
            causer: "Sofia M. Alcaraz",
            causerRole: "Writer",
            causerAvatar: "images/member-placeholder.svg",
            action: "submitted",
            subjectType: "Article",
            subjectName: "The Commuter Odyssey: Transit Diaries from Regional Campuses",
            timestampText: "Yesterday at 2:15 PM",
            isoDate: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 26 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 21, 2026 • 02:15 PM",
            dayGroup: "Yesterday"
        },
        {
            id: 'act-108',
            causer: "Finance Desk",
            causerRole: "Treasurer",
            causerAvatar: "images/member-placeholder.svg",
            action: "verified",
            subjectType: "Transparency Report",
            subjectName: "Q3 Publication Operating Budget Liquidation",
            timestampText: "Yesterday at 10:05 AM",
            isoDate: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 30 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 21, 2026 • 10:05 AM",
            dayGroup: "Yesterday"
        },
        {
            id: 'act-109',
            causer: "Danilo C. Ramos",
            causerRole: "News Head",
            causerAvatar: "images/member-placeholder.svg",
            action: "returned for revision",
            subjectType: "Manuscript",
            subjectName: "Faculty union files formal grievance over proposed 24-unit overload",
            timestampText: "2 days ago",
            isoDate: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 48 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 20, 2026 • 03:10 PM",
            dayGroup: "Earlier this Week"
        },
        {
            id: 'act-110',
            causer: "Victoria Reyes",
            causerRole: "Managing Editor",
            causerAvatar: "images/member-placeholder.svg",
            action: "reviewed",
            subjectType: "Transparency Disclosure",
            subjectName: "Student Council Allocation Report",
            timestampText: "3 days ago",
            isoDate: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 72 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 19, 2026 • 01:25 PM",
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
    // 5. FILTERING ENGINE (Exact Executive Logic)
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
                    if (item.dayGroup !== 'Today' && diff > oneDayMs) return false;
                } else if (dateFilter === '7days') {
                    if (diff > sevenDaysMs) return false;
                } else if (dateFilter === '30days') {
                    if (diff > thirtyDaysMs) return false;
                } else if (dateFilter === 'specific' && specificDate) {
                    if (item.dateKey !== specificDate) return false;
                }
            }

            // Search query matching causer, action, subject, or role
            if (query) {
                const fullSentence = `${item.causer} ${item.action} the ${item.subjectType} "${item.subjectName}" ${item.timestampText} ${item.causerRole}`.toLowerCase();
                return fullSentence.includes(query);
            }

            return true;
        });
    }

    // =========================================================================
    // 6. RENDERING TIMELINE (Exact Executive Format & Day Dividers)
    // =========================================================================
    function renderActivities() {
        if (!timelineStreamContainer) return;

        const filtered = getFilteredActivities();

        if (resultsCounterEl) {
            resultsCounterEl.innerHTML = `Showing <em>${filtered.length}</em> of ${activitiesList.length} logged events`;
        }

        if (filtered.length === 0) {
            timelineStreamContainer.innerHTML = `
                <div class="activity-empty-state">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                    <h4 class="empty-state-title">No Activity Logs Found</h4>
                    <p class="empty-state-desc">No events match your current search and date criteria.</p>
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
                                <p class="activity-sentence-statement">
                                    <strong class="causer-name-token">${escapeHTML(item.causer)}</strong> ${escapeHTML(item.action)} the ${escapeHTML(item.subjectType)} <span class="subject-name-token">"${escapeHTML(item.subjectName)}"</span> <span class="timestamp-token">${escapeHTML(item.timestampText)}.</span>
                                </p>

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
        specificDatePicker.addEventListener('change', renderActivities);
    }

    // Initial render
    renderActivities();
});
