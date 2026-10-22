/**
 * ============================================================================
 * THE LENS — ACTIVITY LOGS LOGIC (EXECUTIVE PORTAL)
 * Clean, Minimalist, Distraction-Free Implementation
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
    const userRole = localStorage.getItem('userRole') || 'President';
    const userName = localStorage.getItem('userName') || 'Juan Dela Cruz';

    if (!localStorage.getItem('userRole')) {
        localStorage.setItem('userRole', 'President');
    }

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
    // 6. ACTIVITY LOG DATASET
    // =========================================================================
    const ACTIVITY_STORAGE_KEY = 'executiveActivityLogs_v1';

    const defaultActivities = [
        {
            id: 'act-101',
            causer: "Juan Dela Cruz",
            causerRole: "President",
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
            causerRole: "Editor-in-Chief",
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
            causer: "Juan Dela Cruz",
            causerRole: "President",
            causerAvatar: "images/member-placeholder.svg",
            action: "created",
            subjectType: "Account",
            subjectName: "Joshua Hernandez (BN-0)",
            timestampText: "2h ago",
            isoDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
            dateKey: new Date().toISOString().split('T')[0],
            formattedDate: "Oct 19, 2026 • 02:30 PM",
            dayGroup: "Today"
        },
        {
            id: 'act-104',
            causer: "Carlo Ramos",
            causerRole: "Photo Editor",
            causerAvatar: "images/member-placeholder.svg",
            action: "uploaded",
            subjectType: "Photo Asset",
            subjectName: "Central University Library Modernization Gallery",
            timestampText: "3h ago",
            isoDate: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
            dateKey: new Date().toISOString().split('T')[0],
            formattedDate: "Oct 19, 2026 • 01:10 PM",
            dayGroup: "Today"
        },
        {
            id: 'act-105',
            causer: "Finance Desk",
            causerRole: "Treasurer",
            causerAvatar: "images/member-placeholder.svg",
            action: "verified",
            subjectType: "Transparency Report",
            subjectName: "Q3 Publication Operating Budget Liquidation",
            timestampText: "5h ago",
            isoDate: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
            dateKey: new Date().toISOString().split('T')[0],
            formattedDate: "Oct 19, 2026 • 11:20 AM",
            dayGroup: "Today"
        },
        {
            id: 'act-106',
            causer: "Elena Cruz",
            causerRole: "Literary Editor",
            causerAvatar: "images/member-placeholder.svg",
            action: "revised",
            subjectType: "Literary Folio",
            subjectName: "Courtyard Poetry Volume IV (First Semester Edition)",
            timestampText: "Yesterday at 4:32 PM",
            isoDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 18, 2026 • 04:32 PM",
            dayGroup: "Yesterday"
        },
        {
            id: 'act-107',
            causer: "Juan Dela Cruz",
            causerRole: "President",
            causerAvatar: "images/member-placeholder.svg",
            action: "deactivated",
            subjectType: "Account",
            subjectName: "Patricia Reyes (BN-0)",
            timestampText: "Yesterday at 2:15 PM",
            isoDate: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 26 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 18, 2026 • 02:15 PM",
            dayGroup: "Yesterday"
        },
        {
            id: 'act-108',
            causer: "Mara Villanueva",
            causerRole: "Managing Editor",
            causerAvatar: "images/member-placeholder.svg",
            action: "restored",
            subjectType: "Article",
            subjectName: "Student council financial audit reveals ₱320,000 unallocated surplus",
            timestampText: "Yesterday at 10:05 AM",
            isoDate: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 30 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 18, 2026 • 10:05 AM",
            dayGroup: "Yesterday"
        },
        {
            id: 'act-109',
            causer: "Sophia Lim",
            causerRole: "Associate Editor",
            causerAvatar: "images/member-placeholder.svg",
            action: "archived",
            subjectType: "Article",
            subjectName: "Midterm Examination Room Assignments Advisory",
            timestampText: "2 days ago",
            isoDate: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 48 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 17, 2026 • 05:40 PM",
            dayGroup: "Earlier this Week"
        },
        {
            id: 'act-110',
            causer: "Juan Dela Cruz",
            causerRole: "President",
            causerAvatar: "images/member-placeholder.svg",
            action: "approved",
            subjectType: "Article",
            subjectName: "Investigation: The hidden costs of mandatory university uniforms",
            timestampText: "2 days ago",
            isoDate: new Date(Date.now() - 54 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 54 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 17, 2026 • 11:25 AM",
            dayGroup: "Earlier this Week"
        },
        {
            id: 'act-111',
            causer: "Gabriel Ocampo",
            causerRole: "Staff Writer",
            causerAvatar: "images/member-placeholder.svg",
            action: "submitted",
            subjectType: "Draft",
            subjectName: "Laboratory Safety Deficiencies Exposed in Senior Science Hubs",
            timestampText: "3 days ago",
            isoDate: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 72 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 16, 2026 • 03:18 PM",
            dayGroup: "Earlier this Week"
        },
        {
            id: 'act-112',
            causer: "Maria Santos",
            causerRole: "Editor-in-Chief",
            causerAvatar: "images/member-placeholder.svg",
            action: "updated",
            subjectType: "Article",
            subjectName: "State University Modernization Bill Passes First Congressional Hearing",
            timestampText: "3 days ago",
            isoDate: new Date(Date.now() - 78 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 78 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 16, 2026 • 09:45 AM",
            dayGroup: "Earlier this Week"
        },
        {
            id: 'act-113',
            causer: "Juan Dela Cruz",
            causerRole: "President",
            causerAvatar: "images/member-placeholder.svg",
            action: "created",
            subjectType: "Account",
            subjectName: "Bea Alonzo (BN-0)",
            timestampText: "4 days ago",
            isoDate: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
            dateKey: new Date(Date.now() - 96 * 3600 * 1000).toISOString().split('T')[0],
            formattedDate: "Oct 15, 2026 • 02:00 PM",
            dayGroup: "Earlier this Week"
        },
        {
            id: 'act-114',
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
            id: 'act-115',
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
    // 7. DOM ELEMENTS & CONTROLS
    // =========================================================================
    const searchInput = document.getElementById('activity-search-input');
    const searchClearBtn = document.getElementById('activity-search-clear');
    const dateFilterSelect = document.getElementById('date-filter-select');
    const specificDateWrapper = document.getElementById('specific-date-wrapper');
    const specificDatePicker = document.getElementById('specific-date-picker');
    const timelineStreamContainer = document.getElementById('activity-stream-timeline');
    const resultsCounterEl = document.getElementById('activity-results-counter');

    // =========================================================================
    // 8. FILTERING ENGINE
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
    // 9. RENDERING TIMELINE
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
                                <!-- Plain, same font color style sentence -->
                                <p class="activity-sentence-statement">
                                    <strong class="causer-name-token">${escapeHTML(item.causer)}</strong> ${escapeHTML(item.action)} the ${escapeHTML(item.subjectType)} <span class="subject-name-token">"${escapeHTML(item.subjectName)}"</span> <span class="timestamp-token">${escapeHTML(item.timestampText)}.</span>
                                </p>

                                <!-- Under it: Role and time only, no IDs -->
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
    // 10. EVENT LISTENERS
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
