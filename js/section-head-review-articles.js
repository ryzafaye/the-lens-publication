/**
 * THE LENS — REVIEW ARTICLES (SECTION HEAD QUEUE)
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

    // -------------------------------------------------------------------------
    // 1. DATASET
    // -------------------------------------------------------------------------
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
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.warn('Could not read pending queue', e);
        }
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(defaultPendingArticles));
        return defaultPendingArticles;
    }

    function savePendingQueue(queue) {
        try {
            localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
        } catch (e) {
            console.warn('Could not save pending queue', e);
        }
    }

    let pendingArticles = getPendingQueue();
    let currentSort = 'newest';
    let currentReviewId = null;

    // Filter queue to this Section Head's section
    function getSectionQueue() {
        return pendingArticles.filter(item => {
            const cat = (item.category || '').toLowerCase();
            const sec = currentSection.toLowerCase();
            if (sec.includes('science') || sec.includes('tech')) return cat.includes('science') || cat.includes('tech');
            if (sec.includes('feature')) return cat.includes('feature');
            if (sec.includes('literature')) return cat.includes('liter');
            if (sec.includes('news')) return cat.includes('news');
            return cat.includes(sec);
        });
    }

    // -------------------------------------------------------------------------
    // 2. DOM ELEMENTS
    // -------------------------------------------------------------------------
    const listContainer = document.getElementById('review-list-container');
    const emptyState = document.getElementById('empty-queue-state');
    const sortSelect = document.getElementById('review-sort-select');

    const modal = document.getElementById('manuscript-modal');
    const closeBtn = document.getElementById('close-manuscript-btn');
    const modalSection = document.getElementById('modal-section');
    const modalDate = document.getElementById('modal-date');
    const modalHeadline = document.getElementById('modal-headline');
    const modalWriter = document.getElementById('modal-writer');
    const modalBody = document.getElementById('modal-body');
    const modalRemarks = document.getElementById('modal-remarks');
    const remarksError = document.getElementById('remarks-error-msg');
    const approveBtn = document.getElementById('modal-approve-btn');
    const revisionBtn = document.getElementById('modal-revision-btn');

    const toastContainer = document.getElementById('toast-container');

    // -------------------------------------------------------------------------
    // 3. UTILITIES
    // -------------------------------------------------------------------------
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
        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;
        toast.innerHTML = `<span class="toast-bullet-dot"></span><span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-dismissing');
            setTimeout(() => toast.remove(), 260);
        }, 3200);
    }

    // -------------------------------------------------------------------------
    // 4. RENDER REVIEW LIST
    // -------------------------------------------------------------------------
    function renderReviewList() {
        if (!listContainer) return;

        let queue = getSectionQueue();

        // If no section-specific items, fallback to all pending to keep demo lively
        if (queue.length === 0) {
            queue = [...pendingArticles];
        }

        // Sort items
        queue.sort((a, b) => {
            const dateA = new Date(a.rawDate || a.date);
            const dateB = new Date(b.rawDate || b.date);
            return currentSort === 'newest' ? dateB - dateA : dateA - dateB;
        });

        if (queue.length === 0) {
            listContainer.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        listContainer.innerHTML = queue.map(item => `
            <div class="review-box-card" data-id="${item.id}">
                <!-- Top Row: Category Pill & Submission Date -->
                <div class="review-box-top">
                    <span class="review-box-category">${escapeHTML(item.category || currentSection)}</span>
                    <span class="review-box-divider">&bull;</span>
                    <span class="review-box-date">${escapeHTML(item.date)}</span>
                </div>

                <!-- Middle: Headline -->
                <div class="review-box-middle">
                    <h3 class="review-box-title">${escapeHTML(item.title)}</h3>
                </div>

                <!-- Bottom Row: Author Byline & Review Button -->
                <div class="review-box-bottom">
                    <div class="review-box-author">
                        <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
                        <span>By <strong>${escapeHTML(item.author)}</strong></span>
                    </div>

                    <div class="review-box-actions">
                        <button type="button" class="btn-box-review" data-id="${item.id}" aria-label="Review manuscript: ${escapeHTML(item.title)}">
                            <i class="fa-solid fa-clipboard-check"></i>
                            <span>Review Manuscript</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Attach listeners
        listContainer.querySelectorAll('.btn-box-review').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                openReviewModal(id);
            });
        });

        listContainer.querySelectorAll('.review-box-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                const id = card.getAttribute('data-id');
                openReviewModal(id);
            });
        });
    }

    // -------------------------------------------------------------------------
    // 5. MODAL LOGIC
    // -------------------------------------------------------------------------
    function openReviewModal(id) {
        const item = pendingArticles.find(a => a.id === id);
        if (!item || !modal) return;

        currentReviewId = id;
        modalSection.textContent = item.category || currentSection;
        modalDate.textContent = item.date;
        modalHeadline.textContent = item.title;
        modalWriter.textContent = item.author;

        // Render clean paragraphs
        const paragraphs = (item.content || '').split(/\n\n+/).filter(p => p.trim());
        modalBody.innerHTML = paragraphs.map(p => `<p class="manuscript-paragraph">${escapeHTML(p.trim())}</p>`).join('');

        if (modalRemarks) modalRemarks.value = '';
        if (remarksError) remarksError.classList.add('hidden');

        modal.classList.remove('hidden');
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.add('hidden');
        currentReviewId = null;
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Approve
    if (approveBtn) {
        approveBtn.addEventListener('click', () => {
            if (!currentReviewId) return;
            const item = pendingArticles.find(a => a.id === currentReviewId);
            const title = item ? item.title : 'Manuscript';

            pendingArticles = pendingArticles.filter(a => a.id !== currentReviewId);
            savePendingQueue(pendingArticles);

            closeModal();
            renderReviewList();
            showToast(`Approved "${title}" for publication.`, 'success');
        });
    }

    // For Revision
    if (revisionBtn) {
        revisionBtn.addEventListener('click', () => {
            if (!currentReviewId) return;

            const remarksText = modalRemarks ? modalRemarks.value.trim() : '';
            if (!remarksText) {
                if (remarksError) remarksError.classList.remove('hidden');
                if (modalRemarks) modalRemarks.focus();
                return;
            }

            const item = pendingArticles.find(a => a.id === currentReviewId);
            const title = item ? item.title : 'Manuscript';

            pendingArticles = pendingArticles.filter(a => a.id !== currentReviewId);
            savePendingQueue(pendingArticles);

            closeModal();
            renderReviewList();
            showToast(`Returned "${title}" to writer for revisions with feedback.`, 'success');
        });
    }

    // Sort select
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderReviewList();
        });
    }

    // Initial render
    renderReviewList();
});

