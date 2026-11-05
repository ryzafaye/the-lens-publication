/**
 * ============================================================================
 * THE LENS — FEEDBACK INBOX LOGIC (EXECUTIVE PORTAL)
 * Receiving Area for Feedback Form Submissions
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
    // 2. TOAST NOTIFICATIONS
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
    // 6. FEEDBACK DATASET MANAGEMENT
    // =========================================================================
    // Purge any stale mock/hardcoded items from previous sessions
    try {
        localStorage.removeItem('executiveFeedbackInbox_v1');
        sessionStorage.removeItem('theLensFeedbackDemoSubmissions');
    } catch (e) {}

    function loadFeedbacks() {
        if (window.INITIAL_DATA !== undefined && Array.isArray(window.INITIAL_DATA)) {
            return window.INITIAL_DATA.map(item => ({
                id: String(item.id),
                name: item.name || '',
                email: item.email || '',
                subject: item.subject || 'Reader Feedback',
                message: item.message || '',
                date: item.date || 'Recently',
                fullDate: item.fullDate || '',
                timestamp: item.timestamp || Date.now(),
                isRead: Boolean(item.isRead)
            }));
        }

        if (window.INITIAL_FEEDBACK !== undefined && Array.isArray(window.INITIAL_FEEDBACK)) {
            return window.INITIAL_FEEDBACK.map(item => ({
                id: String(item.id),
                name: item.name || '',
                email: item.email || '',
                subject: item.subject || 'Reader Feedback',
                message: item.message || '',
                date: item.date || 'Recently',
                fullDate: item.fullDate || '',
                timestamp: item.timestamp || Date.now(),
                isRead: Boolean(item.isRead)
            }));
        }

        return [];
    }

    function saveFeedbacks(list) {
        try {
            localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            console.error('Failed saving feedbacks:', e);
        }
    }

    let feedbackList = loadFeedbacks();
    let currentTab = 'all'; // 'all' | 'unread'
    let currentSort = 'newest'; // 'newest' | 'oldest'
    let activeMessageId = feedbackList.length > 0 ? feedbackList[0].id : null;

    // =========================================================================
    // 7. DOM REFERENCES
    // =========================================================================
    const searchInput = document.getElementById('feedback-search-input');
    const searchClearBtn = document.getElementById('feedback-search-clear');
    const filterTabs = document.getElementById('feedback-filter-tabs');
    const scrollList = document.getElementById('inbox-scroll-list');
    const detailPane = document.getElementById('inbox-detail-pane');

    // =========================================================================
    // 8. FILTER & BADGE ENGINE
    // =========================================================================
    function updateBadges() {
        const unreadCount = feedbackList.filter(f => !f.isRead).length;
        const countAll = feedbackList.length;

        const pillAll = document.getElementById('count-tab-all');
        const pillUnread = document.getElementById('count-tab-unread');

        if (pillAll) pillAll.textContent = countAll;
        if (pillUnread) pillUnread.textContent = unreadCount;
    }

    function getFilteredList() {
        const q = searchInput ? searchInput.value.trim().toLowerCase() : '';

        const filtered = feedbackList.filter(item => {
            // Tab filter
            if (currentTab === 'unread' && item.isRead) return false;

            // Search query
            if (q) {
                const nameStr = (item.name || 'Anonymous Reader').toLowerCase();
                const subjStr = (item.subject || '').toLowerCase();
                const msgStr = (item.message || '').toLowerCase();
                return nameStr.includes(q) || subjStr.includes(q) || msgStr.includes(q);
            }

            return true;
        });

        // Apply sort
        filtered.sort((a, b) => {
            const timeA = a.timestamp || 0;
            const timeB = b.timestamp || 0;
            return currentSort === 'newest' ? (timeB - timeA) : (timeA - timeB);
        });

        return filtered;
    }

    // =========================================================================
    // 9. RENDERING
    // =========================================================================
    function renderList() {
        const emptyState = document.getElementById('feedback-empty-state');
        const controlsBar = document.getElementById('feedback-controls-bar');
        const splitGrid = document.getElementById('inbox-split-grid');

        // If the inbox is completely empty: show empty message card, DO NOT show the boxes
        if (feedbackList.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            if (controlsBar) controlsBar.classList.add('hidden');
            if (splitGrid) splitGrid.classList.add('hidden');
            updateBadges();
            return;
        }

        // If inbox has feedback: ensure boxes & controls are shown, hide empty message card
        if (emptyState) emptyState.classList.add('hidden');
        if (controlsBar) controlsBar.classList.remove('hidden');
        if (splitGrid) splitGrid.classList.remove('hidden');

        updateBadges();
        const q = searchInput ? searchInput.value.trim() : '';
        const filtered = getFilteredList();

        if (!scrollList) return;

        if (filtered.length === 0) {
            const isSearching = !!q;
            scrollList.innerHTML = `
                <div class="inbox-empty-box">
                    <i class="fa-regular ${isSearching ? 'fa-magnifying-glass' : 'fa-folder-open'}"></i>
                    <p style="font-size: 0.95rem; font-weight: 600; color: #475467; margin: 0;">${isSearching ? 'No feedback found' : 'No feedback yet'}</p>
                </div>
            `;
            renderDetail(null);
            const grid = document.querySelector('.inbox-split-grid');
            if (grid) grid.classList.remove('mobile-viewing-message');
            return;
        }

        // If activeMessageId is not in filtered list, set it to the first filtered item
        if (!filtered.some(f => f.id === activeMessageId)) {
            activeMessageId = filtered[0].id;
        }

        scrollList.innerHTML = filtered.map(item => {
            const isAnon = !item.name || item.name.trim() === '';
            const displayName = isAnon ? 'Anonymous Reader' : item.name;
            const initials = isAnon ? '<i class="fa-regular fa-user"></i>' : item.name.split(' ').map(n => n[0]).join('').substring(0, 2);
            const isActive = (item.id === activeMessageId);
            const isUnread = !item.isRead;

            return `
                <div class="inbox-item-card ${isActive ? 'active' : ''} ${isUnread ? 'unread' : ''}" data-id="${item.id}">
                    <div class="item-top-row">
                        <div class="item-sender-wrap">
                            <div class="item-sender-avatar ${isAnon ? 'anonymous' : ''}">
                                ${initials}
                            </div>
                            <span class="item-sender-name" title="${escapeHTML(displayName)}">${escapeHTML(displayName)}</span>
                            ${isAnon ? '<span class="item-anon-badge">Anon</span>' : ''}
                        </div>
                        <span class="item-time">${escapeHTML(item.date)}</span>
                    </div>

                    <div class="item-subject" title="${escapeHTML(item.subject)}">${escapeHTML(item.subject)}</div>
                    <p class="item-snippet">${escapeHTML(item.message)}</p>
                </div>
            `;
        }).join('');

        const activeItem = feedbackList.find(f => f.id === activeMessageId);
        renderDetail(activeItem);
    }

    function renderDetail(item) {
        if (!detailPane) return;

        if (!item) {
            detailPane.innerHTML = `
                <div class="detail-placeholder">
                    <i class="fa-regular fa-envelope-open"></i>
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: #344054; margin: 0;">No message selected</h3>
                </div>
            `;
            return;
        }

        const isAnon = !item.name || item.name.trim() === '';
        const displayName = isAnon ? 'Anonymous Reader' : item.name;
        const initials = isAnon ? '<i class="fa-regular fa-user"></i>' : item.name.split(' ').map(n => n[0]).join('').substring(0, 2);

        detailPane.innerHTML = `
            <!-- Mobile Back Button (Gmail style) -->
            <button type="button" class="btn-back-to-list" id="btn-back-to-list">
                <i class="fa-solid fa-arrow-left"></i>
                <span>Back to Submissions</span>
            </button>

            <div class="detail-header">
                <h2 class="detail-subject-title">${escapeHTML(item.subject)}</h2>

                <div class="detail-sender-row">
                    <div class="detail-sender-info">
                        <div class="detail-avatar-large">
                            ${initials}
                        </div>
                        <div class="detail-sender-names">
                            <span class="detail-name-text">${escapeHTML(displayName)}</span>
                            <span class="detail-meta-text">${escapeHTML(item.fullDate)}</span>
                        </div>
                    </div>

                    <div class="detail-actions-group">
                        <button type="button" class="btn-detail-action" id="btn-toggle-read" title="${item.isRead ? 'Mark as unread' : 'Mark as read'}">
                            <i class="${item.isRead ? 'fa-regular fa-envelope' : 'fa-regular fa-envelope-open'}"></i>
                            <span>${item.isRead ? 'Mark Unread' : 'Mark Read'}</span>
                        </button>
                        <button type="button" class="btn-detail-action" id="btn-copy-msg" title="Copy message text">
                            <i class="fa-regular fa-copy"></i>
                            <span>Copy</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Full Message Body Content -->
            <div class="detail-message-body">
                ${escapeHTML(item.message)}
            </div>
        `;

        const msgBody = detailPane.querySelector('.detail-message-body');
        if (msgBody) msgBody.scrollTop = 0;

        // Attach action handlers
        const btnBack = document.getElementById('btn-back-to-list');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                const grid = document.querySelector('.inbox-split-grid');
                if (grid) grid.classList.remove('mobile-viewing-message');
            });
        }

        const btnToggle = document.getElementById('btn-toggle-read');
        if (btnToggle) {
            btnToggle.addEventListener('click', () => {
                item.isRead = !item.isRead;
                saveFeedbacks(feedbackList);
                renderList();
                showToast(item.isRead ? 'Message marked as read.' : 'Message marked as unread.');
            });
        }

        const btnCopy = document.getElementById('btn-copy-msg');
        if (btnCopy) {
            btnCopy.addEventListener('click', () => {
                const text = `From: ${displayName}\nSubject: ${item.subject}\nDate: ${item.fullDate}\n\n${item.message}`;
                navigator.clipboard.writeText(text).then(() => {
                    showToast('Feedback message copied to clipboard.');
                });
            });
        }
    }

    // =========================================================================
    // 10. EVENT LISTENERS
    // =========================================================================
    // Select message in list (Gmail-style view toggle on mobile)
    if (scrollList) {
        scrollList.addEventListener('click', (e) => {
            const card = e.target.closest('.inbox-item-card');
            if (!card) return;

            const id = card.dataset.id;
            if (!id) return;

            activeMessageId = id;
            const target = feedbackList.find(f => f.id === id);
            if (target && !target.isRead) {
                target.isRead = true;
                saveFeedbacks(feedbackList);
            }

            // Gmail mobile style: show detail pane full screen on small views
            const grid = document.querySelector('.inbox-split-grid');
            if (grid) grid.classList.add('mobile-viewing-message');

            renderList();
        });
    }

    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (searchClearBtn) {
                searchClearBtn.style.display = searchInput.value.length > 0 ? 'block' : 'none';
            }
            renderList();
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchClearBtn.style.display = 'none';
            searchInput.focus();
            renderList();
        });
    }

    // Filter tabs
    if (filterTabs) {
        filterTabs.addEventListener('click', (e) => {
            const btn = e.target.closest('.tab-filter-btn');
            if (!btn) return;

            const tab = btn.dataset.tab;
            if (!tab) return;

            currentTab = tab;
            filterTabs.querySelectorAll('.tab-filter-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.tab === tab);
            });

            renderList();
        });
    }

    // Sort dropdown (Newest / Oldest)
    const sortSelect = document.getElementById('feedback-sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            renderList();
        });
    }

    // Initial render
    renderList();
});
