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

    const defaultActivities = [];

    function loadActivities() {
        try {
            const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.warn('Could not read executiveActivityLogs_v1:', e);
        }
        return [];
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
