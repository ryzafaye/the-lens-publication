/**
 * THE LENS — ACTIVITY LOGS (SECTION HEAD PORTAL)
 * Clean, Reusable & Modular Implementation
 */

document.addEventListener('DOMContentLoaded', () => {

    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
        window.location.href = 'login.html';
        return;
    }

    const currentSection = localStorage.getItem('sectionHeadSection') || 'News';
    const sectionHeadName = localStorage.getItem('userName') || 'Danilo C. Ramos';

    const INITIAL_ACTIVITIES = [
        {
            id: 'act-01',
            causer: sectionHeadName,
            causerRole: userRole,
            action: 'approved',
            subjectType: 'manuscript',
            subjectName: `Student Council Financial Surplus Investigation`,
            rawTimestamp: new Date().toISOString(),
            timestampText: '2 hours ago',
            categoryTag: 'Approval'
        },
        {
            id: 'act-02',
            causer: 'Sofia M. Alcaraz',
            causerRole: 'Writer',
            action: 'submitted',
            subjectType: 'draft to',
            subjectName: `${currentSection} Editorial Desk`,
            rawTimestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
            timestampText: '4 hours ago',
            categoryTag: 'Submission'
        },
        {
            id: 'act-03',
            causer: sectionHeadName,
            causerRole: userRole,
            action: 'requested revisions on',
            subjectType: 'manuscript',
            subjectName: `Faculty Union Overload Grievance`,
            rawTimestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            timestampText: 'Yesterday at 3:15 PM',
            categoryTag: 'Revision'
        },
        {
            id: 'act-04',
            causer: 'Marco L. Valderrama',
            causerRole: 'Writer',
            action: 'updated',
            subjectType: 'manuscript',
            subjectName: `Collegiate Transit Subsidies Survey`,
            rawTimestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
            timestampText: 'Oct 20, 2026',
            categoryTag: 'Draft'
        },
        {
            id: 'act-05',
            causer: sectionHeadName,
            causerRole: userRole,
            action: 'published personal article',
            subjectType: 'manuscript',
            subjectName: `Resource Allocation in Modern Universities`,
            rawTimestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
            timestampText: 'Oct 19, 2026',
            categoryTag: 'Publication'
        }
    ];

    const timelineContainer = document.getElementById('activity-stream-timeline');
    const searchInput = document.getElementById('activity-search-input');
    const searchClear = document.getElementById('activity-search-clear');
    const dateSelect = document.getElementById('date-filter-select');
    const resultsCounter = document.getElementById('activity-results-counter');

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderActivities() {
        if (!timelineContainer) return;

        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const dateFilter = dateSelect ? dateSelect.value : 'all';

        let filtered = INITIAL_ACTIVITIES.filter(item => {
            const matchesQuery = !query || 
                item.causer.toLowerCase().includes(query) || 
                item.action.toLowerCase().includes(query) || 
                item.subjectName.toLowerCase().includes(query) ||
                item.causerRole.toLowerCase().includes(query);

            if (!matchesQuery) return false;

            if (dateFilter === 'today') {
                const itemDate = new Date(item.rawTimestamp).toDateString();
                const today = new Date().toDateString();
                return itemDate === today;
            } else if (dateFilter === '7days') {
                const diffTime = Math.abs(new Date() - new Date(item.rawTimestamp));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
            } else if (dateFilter === '30days') {
                const diffTime = Math.abs(new Date() - new Date(item.rawTimestamp));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 30;
            }

            return true;
        });

        if (resultsCounter) {
            resultsCounter.innerHTML = `Showing <em>${filtered.length}</em> logged events`;
        }

        if (filtered.length === 0) {
            timelineContainer.innerHTML = `
                <div class="empty-state-card">
                    <i class="fa-regular fa-folder-open"></i>
                    <h3>No activity records match your criteria</h3>
                    <p>Try clearing your search query or choosing another date range filter.</p>
                </div>
            `;
            return;
        }

        timelineContainer.innerHTML = filtered.map(item => `
            <div class="activity-timeline-card">
                <div class="activity-card-left">
                    <div class="activity-icon-wrapper">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                    </div>
                </div>
                <div class="activity-card-body">
                    <div class="activity-card-headline">
                        <strong class="activity-actor">${escapeHTML(item.causer)}</strong>
                        <span class="activity-role-pill">${escapeHTML(item.causerRole)}</span>
                        <span class="activity-action-verb">${escapeHTML(item.action)}</span>
                        <span class="activity-target-desc">${escapeHTML(item.subjectType)}</span>
                        <strong class="activity-subject-title">"${escapeHTML(item.subjectName)}"</strong>
                    </div>
                    <div class="activity-card-meta">
                        <span class="activity-timestamp">${escapeHTML(item.timestampText)}</span>
                        <span class="activity-meta-dot">&bull;</span>
                        <span class="activity-category-tag">${escapeHTML(item.categoryTag)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (searchClear) {
                searchClear.style.display = searchInput.value ? 'block' : 'none';
            }
            renderActivities();
        });
    }

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            searchClear.style.display = 'none';
            renderActivities();
        });
    }

    if (dateSelect) {
        dateSelect.addEventListener('change', renderActivities);
    }

    renderActivities();
});

