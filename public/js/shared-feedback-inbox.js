/**
 * ============================================================================
 * THE LENS — SHARED FEEDBACK INBOX LOGIC
 * Master-Detail Split Inbox Layout Matching Executives & Editorial Roles
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. AUTHENTICATION & ROLE VERIFICATION
    // =========================================================================
    const userRole = window.LARAVEL_USER_ROLE || localStorage.getItem('userRole') || localStorage.getItem('eicRole') || 'Executive';
    const userName = window.LARAVEL_USER_NAME || localStorage.getItem('userName') || localStorage.getItem('eicName') || 'Executive Officer';

    // =========================================================================
    // 2. TOAST NOTIFICATIONS & UTILITIES
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
    // 3. SHARED FEEDBACK DATASET MANAGEMENT
    // =========================================================================
    const INBOX_STORAGE_KEY = 'executiveFeedbackInbox_v1';

    function loadFeedbacks() {
        if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA) && window.INITIAL_DATA.length > 0) {
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

        let stored = [];
        try {
            const raw = localStorage.getItem(INBOX_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    stored = parsed;
                }
            }
        } catch (e) {
            console.warn('Could not read executiveFeedbackInbox_v1', e);
        }

        // Also check if any submissions were made via public feedback form (sessionStorage)
        try {
            const pubRaw = sessionStorage.getItem('theLensFeedbackDemoSubmissions');
            if (pubRaw) {
                const pubParsed = JSON.parse(pubRaw);
                if (Array.isArray(pubParsed) && pubParsed.length > 0) {
                    pubParsed.forEach(item => {
                        if (!stored.some(s => s.id === item.id)) {
                            const savedTime = item.savedAt ? new Date(item.savedAt).getTime() : Date.now();
                            stored.unshift({
                                id: item.id || `fb-${Date.now()}`,
                                name: item.name || '',
                                subject: item.subject || 'Reader Feedback',
                                message: item.message || '',
                                date: 'Just now',
                                fullDate: new Date(savedTime).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                }),
                                timestamp: savedTime,
                                isRead: false
                            });
                        }
                    });
                }
            }
        } catch (e) {
            // Ignore
        }

        return stored;
    }

        // Ensure each item has a numeric timestamp
        stored.forEach((item, index) => {
            if (!item.timestamp) {
                item.timestamp = Date.now() - index * 60 * 60 * 1000;
            }
        });

        return stored;
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
    // 4. DOM REFERENCES
    // =========================================================================
    const searchInput = document.getElementById('feedback-search-input');
    const searchClearBtn = document.getElementById('feedback-search-clear');
    const filterTabs = document.getElementById('feedback-filter-tabs');
    const sortSelect = document.getElementById('feedback-sort-select');
    const scrollList = document.getElementById('inbox-scroll-list');
    const detailPane = document.getElementById('inbox-detail-pane');

    // =========================================================================
    // 5. FILTER & BADGE ENGINE
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
    // 6. RENDERING
    // =========================================================================
    function renderList() {
        updateBadges();
        const filtered = getFilteredList();

        if (!scrollList) return;

        if (filtered.length === 0) {
            scrollList.innerHTML = `
                <div class="inbox-empty-box">
                    <i class="fa-regular fa-folder-open"></i>
                    <p style="font-size: 0.85rem; font-weight: 600; color: #475467; margin: 0 0 4px 0;">No Messages Found</p>
                    <p style="font-size: 0.76rem; color: #98a2b3; margin: 0;">Try adjusting your search query or filter tab.</p>
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
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: #344054; margin: 0 0 4px 0;">No Message Selected</h3>
                    <p style="font-size: 0.82rem; color: #98a2b3; margin: 0;">Select a feedback message from the left to read its full content.</p>
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
        if (msgBody) {
            msgBody.style.whiteSpace = 'pre-line';
        }

        // Attach action handlers in detail pane
        const toggleReadBtn = document.getElementById('btn-toggle-read');
        if (toggleReadBtn) {
            toggleReadBtn.addEventListener('click', () => {
                item.isRead = !item.isRead;
                saveFeedbacks(feedbackList);
                renderList();
                showToast(item.isRead ? 'Message marked as read.' : 'Message marked as unread.', 'info');
            });
        }

        const copyBtn = document.getElementById('btn-copy-msg');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(item.message).then(() => {
                        showToast('Message text copied to clipboard.', 'success');
                    }).catch(() => {
                        showToast('Failed to copy message.', 'danger');
                    });
                } else {
                    showToast('Clipboard not supported in this browser.', 'danger');
                }
            });
        }

        const backBtn = document.getElementById('btn-back-to-list');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                const grid = document.querySelector('.inbox-split-grid');
                if (grid) grid.classList.remove('mobile-viewing-message');
            });
        }
    }

    // =========================================================================
    // 7. EVENT LISTENERS
    // =========================================================================
    if (scrollList) {
        scrollList.addEventListener('click', (e) => {
            const card = e.target.closest('.inbox-item-card');
            if (card) {
                const id = card.dataset.id;
                if (id) {
                    activeMessageId = id;

                    // Automatically mark message as read upon opening
                    const target = feedbackList.find(f => f.id === id);
                    if (target && !target.isRead) {
                        target.isRead = true;
                        saveFeedbacks(feedbackList);
                    }

                    renderList();

                    // Switch view on mobile screens
                    const grid = document.querySelector('.inbox-split-grid');
                    if (grid) grid.classList.add('mobile-viewing-message');
                }
            }
        });
    }

    if (filterTabs) {
        filterTabs.addEventListener('click', (e) => {
            const btn = e.target.closest('.tab-filter-btn');
            if (btn) {
                filterTabs.querySelectorAll('.tab-filter-btn').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                currentTab = btn.dataset.tab;
                renderList();
            }
        });
    }

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

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            renderList();
        });
    }

    // Initial render
    renderList();
});

