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
    const INBOX_STORAGE_KEY = 'executiveFeedbackInbox_v1';

    const defaultFeedbacks = [
        {
            id: 'fb-01',
            name: "Maria Clara Reyes",
            subject: "Commendation for Campus Wi-Fi Investigation",
            message: "Good day, Editorial Board!\n\nI would like to extend my heartfelt commendation to the writers of the recent investigative report on outer laboratory Wi-Fi bottlenecks. As a senior chemistry student, our lab research sessions in the North Wing have suffered from chronic disconnects for two semesters.\n\nYour article brought urgent attention to this matter, and our department chair confirmed that university IT has already started surveying routers in the area. Please continue publishing brave, data-driven campus stories!",
            date: "25m ago",
            fullDate: "Oct 19, 2026 • 04:45 PM",
            timestamp: Date.now() - 25 * 60 * 1000,
            isRead: false
        },
        {
            id: 'fb-02',
            name: "", // Anonymous sender
            subject: "Typo in Science & Tech Article Headline",
            message: "Hello editors! Found a quick typographical error in the 3rd paragraph of the Laboratory Safety report: 'reagent containment protocals' should be spelled 'protocols'. Just wanted to help keep your publication pristine. Kudos on the great reporting!",
            date: "2h ago",
            fullDate: "Oct 19, 2026 • 02:30 PM",
            timestamp: Date.now() - 2 * 60 * 60 * 1000,
            isRead: false
        },
        {
            id: 'fb-03',
            name: "Joshua D. Santos",
            subject: "Suggestion for Student Organization Coverage",
            message: "Greetings, The Lens!\n\nOur campus debate society recently qualified for the National Inter-Collegiate Parliamentary Tournament in Iloilo this coming December. We are one of the few regional teams representing the university.\n\nWould it be possible to pitch a feature story about our preparation and the student delegates competing? We would love to share our journey with the university community. Thank you very much!",
            date: "5h ago",
            fullDate: "Oct 19, 2026 • 11:15 AM",
            timestamp: Date.now() - 5 * 60 * 60 * 1000,
            isRead: false
        },
        {
            id: 'fb-04',
            name: "", // Anonymous sender
            subject: "Question on Uniform Fee Transparency",
            message: "To the Editor-in-Chief,\n\nRegarding your investigation into mandatory college uniforms: will there be a follow-up coverage regarding supplier contracts and vendor bidding documents? Many freshmen students are still being pressured to purchase complete sets even when existing department uniforms are identical.\n\nThank you for championing student consumer rights.",
            date: "Yesterday",
            fullDate: "Oct 18, 2026 • 03:20 PM",
            timestamp: Date.now() - 24 * 60 * 60 * 1000,
            isRead: true
        },
        {
            id: 'fb-05',
            name: "Prof. Alberto Mendoza",
            subject: "Literary Folio Submission Inquiries",
            message: "Dear Editorial Staff,\n\nI am writing to inquire if faculty members and alumni are also welcome to submit poetry and critical essays for the upcoming Courtyard Literary Folio, or if submissions are strictly reserved for undergraduate students.\n\nKindly advise on the deadline and formatting guidelines. Best regards.",
            date: "2 days ago",
            fullDate: "Oct 17, 2026 • 09:10 AM",
            timestamp: Date.now() - 48 * 60 * 60 * 1000,
            isRead: true
        }
    ];

    function loadFeedbacks() {
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

        if (stored.length === 0) {
            stored = JSON.parse(JSON.stringify(defaultFeedbacks));
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
