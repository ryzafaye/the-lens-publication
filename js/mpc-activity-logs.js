/**
 * ============================================================================
 * THE LENS — ACTIVITY LOGS LOGIC (MEDIA & PUBLIC COMMUNICATIONS / M&PC PORTAL)
 * Exact Parity with Executive Activity Logs Format, Design & Logic
 * 
 * Sentence Format:
 * [Causer Name] [action] the [Subject Type] "[Subject Name]" [timestamp].
 * Under it: Role and time only.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 1. ACTIVE M&PC OFFICER VERIFICATION
    // =========================================================================
    const userRole = localStorage.getItem('mpcRole') || localStorage.getItem('userRole') || 'M&PC Head';
    const userName = localStorage.getItem('mpcName') || localStorage.getItem('userName') || (userRole.includes('Assoc') ? 'Samantha Cruz' : 'Julian Del Rosario');

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
    // 3. DEFAULT M&PC ACTIVITY LOG DATASET
    // =========================================================================
    const ACTIVITY_STORAGE_KEY = 'mpcActivityLogs_v1';

    const defaultActivities = [];

    // =========================================================================
    // 4. SELF-HEALING ACTIVITY NORMALIZER (PREVENTS UNDEFINED FIELDS)
    // =========================================================================
    function normalizeActivity(raw) {
        if (!raw || typeof raw !== 'object') return null;

        const now = new Date();
        const iso = raw.isoDate || raw.timestamp || raw.timeISO || now.toISOString();
        let itemDate = new Date(iso);
        if (isNaN(itemDate.getTime())) itemDate = now;

        const dateKey = raw.dateKey || itemDate.toISOString().split('T')[0];
        const todayKey = now.toISOString().split('T')[0];
        const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);
        const yesterdayKey = yesterday.toISOString().split('T')[0];

        let dayGroup = raw.dayGroup;
        if (!dayGroup) {
            if (dateKey === todayKey) dayGroup = 'Today';
            else if (dateKey === yesterdayKey) dayGroup = 'Yesterday';
            else dayGroup = 'Earlier this Week';
        }

        const formattedDate = raw.formattedDate || `${itemDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${itemDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

        // Causer
        let causer = raw.causer || raw.user || raw.author || raw.name || userName;
        if (causer.includes('(')) {
            causer = causer.replace(/\s*\([^)]*\)/g, '').trim();
        }
        const causerRole = raw.causerRole || raw.role || userRole;
        const causerAvatar = raw.causerAvatar || raw.avatar || 'images/member-placeholder.svg';

        // Action, subjectType, subjectName
        let action = (raw.action || 'updated').toLowerCase();
        let subjectType = raw.subjectType || 'Article';
        let subjectName = raw.subjectName || raw.title || raw.details || raw.target || 'General Asset';

        // Clean up action if it was stored as a full sentence or legacy phrase
        if (action.includes('submitted pubmat')) {
            action = 'submitted';
            subjectType = 'PUBMAT Asset';
            if (raw.details && raw.details.includes('"')) {
                const match = raw.details.match(/"([^"]+)"/);
                if (match) subjectName = match[1];
            }
        } else if (action.includes('approved')) {
            action = 'approved';
            if (!raw.subjectType) {
                if (action.includes('photo')) subjectType = 'Photojournalist Capture';
                else if (action.includes('cartoon')) subjectType = 'Editorial Cartoon';
                else subjectType = 'PUBMAT Artwork';
            }
        } else if (action.includes('return')) {
            action = 'returned for revision';
            if (!raw.subjectType) subjectType = 'Artwork Asset';
        } else if (action.includes('publish') && !action.includes('unpublish')) {
            action = 'published';
            subjectType = 'Article';
        } else if (action.includes('unpublish')) {
            action = 'unpublished';
            subjectType = 'Article';
        }

        let timestampText = raw.timestampText || raw.time || 'Just now';

        return {
            id: raw.id || 'mpc-act-' + Math.random().toString(36).substr(2, 9),
            causer,
            causerRole,
            causerAvatar,
            action,
            subjectType,
            subjectName,
            timestampText,
            isoDate: itemDate.toISOString(),
            dateKey,
            formattedDate,
            dayGroup
        };
    }

    function loadActivities() {
        try {
            const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const normalized = parsed.map(normalizeActivity).filter(Boolean);
                    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(normalized));
                    return normalized;
                }
            }
        } catch (e) {
            console.warn('Could not read mpcActivityLogs_v1:', e);
        }
        return [];
    }

    let activitiesList = loadActivities();

    // =========================================================================
    // 5. DOM ELEMENTS & CONTROLS
    // =========================================================================
    const searchInput = document.getElementById('activity-search-input');
    const searchClearBtn = document.getElementById('activity-search-clear');
    const dateFilterSelect = document.getElementById('date-filter-select');
    const specificDateWrapper = document.getElementById('specific-date-wrapper');
    const specificDatePicker = document.getElementById('specific-date-picker');
    const timelineStreamContainer = document.getElementById('activity-stream-timeline');
    const resultsCounterEl = document.getElementById('activity-results-counter');

    // =========================================================================
    // 6. FILTERING ENGINE
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
    // 7. RENDERING TIMELINE (EXACT EXECUTIVE ARCHITECTURE)
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
    // 8. EVENT LISTENERS
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
