/**
 * ============================================================================
 * THE LENS — REVIEW ARTICLES (SECTION HEAD PORTAL)
 * Exact Executive Queue Layout, Styling & Workflow Parity
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 1. AUTHENTICATION & SESSION
    // =========================================================================
    const userRole = localStorage.getItem('sectionHeadRole') || localStorage.getItem('userRole') || 'News Head';
    const currentSection = localStorage.getItem('sectionHeadSection') || 'News';
    const sectionHeadName = localStorage.getItem('sectionHeadName') || localStorage.getItem('userName') || 'Danilo C. Ramos';

    // =========================================================================
    // 2. DATASET (Pending Manuscripts Queue)
    // =========================================================================
    const defaultPendingArticles = [
        {
            id: 'rev-01',
            title: "Student council financial audit reveals ₱320,000 unallocated surplus",
            category: "News",
            date: "Oct 18, 2026",
            rawDate: "2026-10-18",
            author: "Mara Villanueva",
            status: "pending",
            remarks: "",
            content: `An independent financial audit of the Central Student Council (CSC) expenditures for the first quarter of Academic Year 2026–2027 has revealed an unallocated surplus of ₱320,450 from the student activity development fund.\n\nThe findings, presented during an extraordinary collegiate assembly, prompted student leaders from the College of Science and College of Engineering to question why emergency welfare assistance programs were stalled earlier this term due to cited budgetary deficits.\n\nAccording to CSC Treasurer Julian Navarro, the surplus represents contingency reserves retained following the lower-than-projected costs of the University Welcoming Caravan. "Our intention was never to withhold assistance, but to establish a buffer against potential inflation in procurement for second-quarter initiatives," Navarro stated during the cross-examination.\n\nHowever, student coalition leaders argue that fiscal transparency mandates immediate reallocation of dormant reserves to acute needs, including laboratory equipment repairs and commuter transport subsidies.`
        },
        {
            id: 'rev-02',
            title: "Why the enrollment portal keeps timing out: A technical post-mortem",
            category: "Science and Technology",
            date: "Oct 18, 2026",
            rawDate: "2026-10-18",
            author: "Noah Reyes",
            status: "pending",
            remarks: "",
            content: `Every enlistment cycle, tens of thousands of university students endure hours of connection timeouts, 504 Gateway errors, and lost subject slots. An in-depth technical examination of the campus enrollment infrastructure reveals that database locking bottlenecks, rather than network bandwidth, remain the root cause.\n\nAccording to server log metrics obtained through a freedom of information request, the registration database executes single-row thread locking whenever students attempt to enlist in high-demand general education classes. When thousands of concurrent requests strike the database at 8:00 AM, the queue cascades into exponential latency.\n\nThe Management Information Systems (MIS) office has proposed a ₱2.4 million cloud migration architecture to containerize user sessions. If approved by the Board of Regents, the transition could reduce average latency from 45 seconds to under 400 milliseconds per transaction before the second semester.`
        },
        {
            id: 'rev-03',
            title: "Faculty union files formal grievance over proposed 24-unit overload directive",
            category: "News",
            date: "Oct 17, 2026",
            rawDate: "2026-10-17",
            author: "Rafael Ramos",
            status: "pending",
            remarks: "",
            content: `The University Faculty Association (UFA) has formally submitted a dispute grievance to the Office of the Vice President for Academic Affairs following administrative directives requiring full-time instructors to absorb up to 24 class teaching units without proportional overtime compensation.\n\nUnion representatives warn that unmitigated faculty burnout directly compromises research output and pedagogical quality. In a joint manifesto signed by over 180 department faculty members, the union calls for immediate suspension of mandatory overloads and the emergency hiring of contractual lecturers.\n\n"Quality tertiary education cannot be sustained on the backs of overworked mentors who must grade hundreds of papers until midnight," said UFA Chairperson Dr. Elizabeth Morales during an afternoon press conference.`
        },
        {
            id: 'rev-04',
            title: "Inside the 24-hour night shift of university sanitation workers",
            category: "Features",
            date: "Oct 12, 2026",
            rawDate: "2026-10-12",
            author: "Lia Mendoza",
            status: "pending",
            remarks: "",
            content: `At 11:30 PM, long after the last student leaves the library and lecture lights flick off, an army of twenty-two custodial workers steps onto the silent campus grounds.\n\nArmed with industrial polishers, brooms, and sanitizing tanks, these workers restore hundreds of classrooms, laboratory benches, and restroom facilities before the 7:00 AM bell rings. Despite being the backbone of university operations, many work through third-party contracting agencies with minimal hazard pay.\n\nThrough the quiet corridors of the Science Pavilion, veteran custodian Mang Rodrigo sweeps the marble floors he has polished for eighteen years. "We keep the school standing, even if our names are never spoken during graduation ceremonies," he smiles quietly.`
        },
        {
            id: 'rev-05',
            title: "Echoes of the Quadrangle: Anthology of New Student Poetry",
            category: "Literature",
            date: "Oct 21, 2026",
            rawDate: "2026-10-21",
            author: "Camille Joy Perez",
            status: "pending",
            remarks: "",
            content: `Under the shadows of the century-old Acacia trees, student poets observe the shifting cadence of university life.\n\nThis anthology gathers twelve original works exploring the silent rituals of early morning jeepney rides, the anxiety of finals week in the university library, and the shared solidarity of the student movement.`
        }
    ];

    const QUEUE_STORAGE_KEY = 'sectionHeadReviewQueue_v1';

    function getPendingQueue() {
        try {
            const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('Could not read pending queue from localStorage', e);
        }
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(defaultPendingArticles));
        return defaultPendingArticles;
    }

    function savePendingQueue(queue) {
        try {
            localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
        } catch (e) {
            console.warn('Could not save pending queue to localStorage', e);
        }
    }

    let reviewList = getPendingQueue();
    let currentSort = 'newest';
    let currentActiveId = null;

    // Filter queue matching this Section Head's desk
    function getSectionQueue() {
        const sec = currentSection.toLowerCase();
        const filtered = reviewList.filter(item => {
            const cat = (item.category || '').toLowerCase();
            if (sec.includes('science') || sec.includes('tech')) return cat.includes('science') || cat.includes('tech');
            if (sec.includes('feature')) return cat.includes('feature');
            if (sec.includes('literature')) return cat.includes('liter');
            if (sec.includes('news')) return cat.includes('news');
            return cat.includes(sec);
        });

        // Fallback to all items if desk has no articles to keep interactive demo active
        return filtered.length > 0 ? filtered : reviewList;
    }

    // =========================================================================
    // 3. DOM ELEMENTS
    // =========================================================================
    const listContainer = document.getElementById('review-list-container');
    const emptyQueueState = document.getElementById('empty-queue-state');
    const sortSelect = document.getElementById('review-sort-select');

    // Manuscript Modal Elements
    const manuscriptModal = document.getElementById('manuscript-modal');
    const closeManuscriptBtn = document.getElementById('close-manuscript-btn');
    const modalHeadline = document.getElementById('modal-headline');
    const modalSection = document.getElementById('modal-section');
    const modalDate = document.getElementById('modal-date');
    const modalWriter = document.getElementById('modal-writer');
    const modalBody = document.getElementById('modal-body');

    // Remarks Section Elements
    const remarksSection = document.getElementById('manuscript-remarks-section');
    const modalRemarks = document.getElementById('modal-remarks');
    const remarksErrorMsg = document.getElementById('remarks-error-msg');

    // Modal Actions
    const modalApproveBtn = document.getElementById('modal-approve-btn');
    const modalRevisionBtn = document.getElementById('modal-revision-btn');

    // Notification Toast Container
    const toastContainer = document.getElementById('toast-container');

    // =========================================================================
    // 4. UTILITIES & TOASTS
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
        }, 3400);
    }

    function logActivity(action, target) {
        try {
            const raw = localStorage.getItem('executiveActivityLogs_v1');
            let logs = raw ? JSON.parse(raw) : [];
            logs.unshift({
                causer: sectionHeadName,
                causerAvatar: 'images/member-placeholder.svg',
                action: action,
                subjectType: 'Manuscript',
                subjectName: target,
                timestampText: 'Just now'
            });
            localStorage.setItem('executiveActivityLogs_v1', JSON.stringify(logs.slice(0, 30)));
        } catch (e) {}
    }

    // =========================================================================
    // 5. RENDERING RESPONSIVE HORIZONTAL BOX LIST (Executive Parity)
    // =========================================================================
    function getSortedList() {
        const pool = [...getSectionQueue()];
        return pool.sort((a, b) => {
            const dateA = new Date(a.rawDate || a.date);
            const dateB = new Date(b.rawDate || b.date);
            return currentSort === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }

    function renderReviewBoxes() {
        if (!listContainer) return;

        const sorted = getSortedList();

        if (sorted.length === 0) {
            listContainer.innerHTML = '';
            if (emptyQueueState) emptyQueueState.style.display = 'block';
            return;
        }

        if (emptyQueueState) emptyQueueState.style.display = 'none';

        listContainer.innerHTML = sorted.map(item => `
            <div class="review-box" id="box-${item.id}" data-id="${item.id}">
                <!-- Left Stack: Meta Line, Bold Article Title, Author with Pen Nib Icon -->
                <div class="review-box-content">
                    <div class="review-box-meta">
                        <span class="review-box-category">${escapeHTML(item.category || currentSection)}</span>
                        <span class="review-box-date"><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${escapeHTML(item.date)}</span>
                    </div>

                    <button type="button" class="review-box-title" data-action="read" data-id="${item.id}" title="${escapeHTML(item.title)}">
                        ${escapeHTML(item.title)}
                    </button>

                    <p class="review-box-author">
                        <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
                        <span>By <strong>${escapeHTML(item.author)}</strong></span>
                    </p>
                </div>

                <!-- Right Actions: 3 small buttons in a row -->
                <div class="review-box-actions">
                    <button type="button" class="btn-box-read" data-action="read" data-id="${item.id}" title="Read full manuscript">
                        <i class="fa-regular fa-eye"></i>
                        <span>Read</span>
                    </button>
                    <button type="button" class="btn-box-revision" data-action="revision" data-id="${item.id}" title="Direct to revision remarks">
                        <i class="fa-solid fa-rotate-left"></i>
                        <span>For Revision</span>
                    </button>
                    <button type="button" class="btn-box-approve" data-action="approve" data-id="${item.id}" title="Approve manuscript">
                        <i class="fa-solid fa-check"></i>
                        <span>Approve Story</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // =========================================================================
    // 6. ACTION HANDLERS
    // =========================================================================
    function approveStory(id) {
        const item = reviewList.find(a => a.id === id);
        if (!item) return;

        const box = document.getElementById(`box-${id}`);
        if (box) {
            box.classList.add('box-fade-out');
        }

        setTimeout(() => {
            reviewList = reviewList.filter(a => a.id !== id);
            savePendingQueue(reviewList);
            logActivity('approved', item.title);
            renderReviewBoxes();
            showToast(`Approved "${item.title}" for publication.`, 'success');
        }, 220);
    }

    function returnStoryForRevision(id, remarks) {
        const item = reviewList.find(a => a.id === id);
        if (!item) return;

        const box = document.getElementById(`box-${id}`);
        if (box) {
            box.classList.add('box-fade-out');
        }

        setTimeout(() => {
            reviewList = reviewList.filter(a => a.id !== id);
            savePendingQueue(reviewList);
            logActivity('requested revision on', item.title);
            renderReviewBoxes();
            showToast(`Returned "${item.title}" to writer with revision remarks.`, 'warning');
        }, 220);
    }

    // =========================================================================
    // 7. MANUSCRIPT MODAL VIEWER
    // =========================================================================
    function openManuscript(id, options = {}) {
        const item = reviewList.find(a => a.id === id);
        if (!item || !manuscriptModal) return;

        currentActiveId = id;
        if (modalHeadline) modalHeadline.textContent = item.title;
        if (modalSection) modalSection.textContent = item.category || currentSection;
        if (modalDate) modalDate.textContent = item.date;
        if (modalWriter) modalWriter.textContent = item.author;

        // Reset remarks
        if (modalRemarks) {
            modalRemarks.value = item.remarks || '';
            modalRemarks.classList.remove('input-invalid');
            modalRemarks.classList.remove('pulse-focus');
        }
        if (remarksErrorMsg) remarksErrorMsg.classList.add('hidden');

        if (modalBody) {
            const raw = item.content || item.excerpt || 'No manuscript body content.';
            const paragraphs = raw.split(/\n\n+/).filter(p => p.trim());
            modalBody.innerHTML = paragraphs.map(p => `<p class="manuscript-paragraph">${escapeHTML(p.trim())}</p>`).join('');
        }

        manuscriptModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Direct-to-Remarks flow
        if (options.focusRemarks) {
            setTimeout(() => {
                if (remarksSection) {
                    remarksSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                if (modalRemarks) {
                    modalRemarks.focus();
                    modalRemarks.classList.add('pulse-focus');
                    setTimeout(() => modalRemarks.classList.remove('pulse-focus'), 1200);
                }
            }, 180);
        } else {
            const bodyEl = document.querySelector('.manuscript-body');
            if (bodyEl) bodyEl.scrollTop = 0;
        }
    }

    function closeManuscript() {
        if (manuscriptModal) {
            manuscriptModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
        if (modalRemarks) {
            modalRemarks.classList.remove('input-invalid');
            modalRemarks.classList.remove('pulse-focus');
        }
        if (remarksErrorMsg) {
            remarksErrorMsg.classList.add('hidden');
        }
        currentActiveId = null;
    }

    if (closeManuscriptBtn) closeManuscriptBtn.addEventListener('click', closeManuscript);
    if (manuscriptModal) {
        manuscriptModal.addEventListener('click', (e) => {
            if (e.target === manuscriptModal) closeManuscript();
        });
    }

    // Modal Button Listeners
    if (modalApproveBtn) {
        modalApproveBtn.addEventListener('click', () => {
            if (!currentActiveId) return;
            const targetId = currentActiveId;
            closeManuscript();
            approveStory(targetId);
        });
    }

    if (modalRevisionBtn) {
        modalRevisionBtn.addEventListener('click', () => {
            if (!currentActiveId) return;

            const remarks = modalRemarks ? modalRemarks.value.trim() : '';
            if (!remarks) {
                if (modalRemarks) {
                    modalRemarks.classList.add('input-invalid');
                    modalRemarks.focus();
                }
                if (remarksErrorMsg) remarksErrorMsg.classList.remove('hidden');
                return;
            }

            const targetId = currentActiveId;
            closeManuscript();
            returnStoryForRevision(targetId, remarks);
        });
    }

    // Realtime remarks error clearing
    if (modalRemarks) {
        modalRemarks.addEventListener('input', () => {
            if (modalRemarks.value.trim().length > 0) {
                modalRemarks.classList.remove('input-invalid');
                if (remarksErrorMsg) remarksErrorMsg.classList.add('hidden');
            }
        });
    }

    // Delegated click handler on review list
    if (listContainer) {
        listContainer.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (!actionBtn) return;

            const action = actionBtn.getAttribute('data-action');
            const id = actionBtn.getAttribute('data-id');
            if (!id) return;

            if (action === 'read') {
                openManuscript(id, { focusRemarks: false });
            } else if (action === 'revision') {
                openManuscript(id, { focusRemarks: true });
            } else if (action === 'approve') {
                approveStory(id);
            }
        });
    }

    // Sort select
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderReviewBoxes();
        });
    }

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeManuscript();
        }
    });

    // Initial render
    renderReviewBoxes();
});
