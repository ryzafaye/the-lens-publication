/**
 * THE LENS — REVIEW ARTICLES (EXECUTIVE QUEUE)
 * Responsive Horizontal List Card (Box) Layout
 * Features:
 * 1. Direct-to-Remarks Revision Workflow (No browser alert/prompt popups)
 * 2. Mandatory Revision Remarks Validation
 * 3. Sort by Newest First and Oldest First
 * 4. Author Byline with Pen-Nib Icon ("By Author Name")
 * 5. Silky Smooth Toast Notifications (Zero Flash)
 * 6. Responsive Desktop Horizontal / Mobile Vertical Stacking
 */

document.addEventListener('DOMContentLoaded', () => {


    // =========================================================================
    // 2. DATASET (Articles Awaiting Executive / EIC Decision)
    // =========================================================================
    // Helper to determine Section Head who endorsed/approved the article
    function getEndorserForCategory(cat) {
        if (!cat) return 'Section Editorial Head';
        const c = cat.toLowerCase();
        if (c.includes('news')) return 'Elena Ramos (News Head)';
        if (c.includes('sci') || c.includes('tech')) return 'Dr. Aris Thorne (SciTech Head)';
        if (c.includes('feat')) return 'Sofia Alcantara (Feature Head)';
        if (c.includes('op')) return 'Patricia Gomez (Opinion Head)';
        if (c.includes('lit')) return 'Lucas Gabriel (Literature Head)';
        return 'Section Editorial Head';
    }

    const defaultPendingArticles = [
        {
            id: 'rev-01',
            title: "Student council financial audit reveals ₱320,000 unallocated surplus",
            category: "News",
            date: "Oct 18, 2026",
            rawDate: "2026-10-18",
            author: "Mara Villanueva",
            endorsedBy: "Elena Ramos (News Head)",
            status: "pending",
            remarks: "",
            content: `An independent financial audit of the Central Student Council (CSC) expenditures for the first quarter of Academic Year 2026–2027 has revealed an unallocated surplus of ₱320,450 from the student activity development fund.

The findings, presented during an extraordinary collegiate assembly, prompted student leaders from the College of Science and College of Engineering to question why emergency welfare assistance programs were stalled earlier this term due to cited budgetary deficits.

According to CSC Treasurer Julian Navarro, the surplus represents contingency reserves retained following the lower-than-projected costs of the University Welcoming Caravan. "Our intention was never to withhold assistance, but to establish a buffer against potential inflation in procurement for second-quarter initiatives," Navarro stated during the cross-examination.

However, student coalition leaders argue that fiscal transparency mandates immediate reallocation of dormant reserves to acute needs, including laboratory equipment repairs and commuter transport subsidies.`
        },
        {
            id: 'rev-02',
            title: "Why the enrollment portal keeps timing out: A technical post-mortem",
            category: "Science and Technology",
            date: "Oct 18, 2026",
            rawDate: "2026-10-18",
            author: "Noah Reyes",
            endorsedBy: "Dr. Aris Thorne (SciTech Head)",
            status: "pending",
            remarks: "",
            content: `Every enlistment cycle, tens of thousands of university students endure hours of connection timeouts, 504 Gateway errors, and lost subject slots. An in-depth technical examination of the campus enrollment infrastructure reveals that database locking bottlenecks, rather than network bandwidth, remain the root cause.

According to server log metrics obtained through a freedom of information request, the registration database executes single-row thread locking whenever students attempt to enlist in high-demand general education classes. When thousands of concurrent requests strike the database at 8:00 AM, the queue cascades into exponential latency.

The Management Information Systems (MIS) office has proposed a ₱2.4 million cloud migration architecture to containerize user sessions. If approved by the Board of Regents, the transition could reduce average latency from 45 seconds to under 400 milliseconds per transaction before the second semester.`
        },
        {
            id: 'rev-03',
            title: "Faculty union files formal grievance over proposed 24-unit overload directive",
            category: "News",
            date: "Oct 17, 2026",
            rawDate: "2026-10-17",
            author: "Rafael Ramos",
            endorsedBy: "Elena Ramos (News Head)",
            status: "pending",
            remarks: "",
            content: `The University Faculty Association (UFA) has formally submitted a dispute grievance to the Office of the Vice President for Academic Affairs following administrative directives requiring full-time instructors to absorb up to 24 class teaching units without proportional overtime compensation.

Union representatives warn that unmitigated faculty burnout directly compromises research output and pedagogical quality. In a joint manifesto signed by over 180 department faculty members, the union calls for immediate suspension of mandatory overloads and the emergency hiring of contractual lecturers.

"Quality tertiary education cannot be sustained on the backs of overworked mentors who must grade hundreds of papers until midnight," said UFA Chairperson Dr. Elizabeth Morales during an afternoon press conference.`
        },
        {
            id: 'rev-04',
            title: "The cost of compromise: Why student publication independence cannot be negotiated",
            category: "Opinion",
            date: "Oct 15, 2026",
            rawDate: "2026-10-15",
            author: "Paolo Santos",
            endorsedBy: "Patricia Gomez (Opinion Head)",
            status: "pending",
            remarks: "",
            content: `When institutional administrators propose prior editorial review under the guise of 'brand alignment', the sacred covenant of campus journalism is under direct siege.

For over four decades, The Lens has stood as an unvarnished mirror reflecting student triumphs, administrative shortcomings, and institutional accountability. The suggestion that student editorial boards must seek prior clearance from public affairs offices fundamentally misunderstands the purpose of the fourth estate.

True institutional excellence does not fear student scrutiny. A university that fosters critical thought within the lecture hall must not suppress that same inquiry when committed to print.`
        },
        {
            id: 'rev-05',
            title: "Inside the 24-hour night shift of university sanitation workers",
            category: "Features",
            date: "Oct 12, 2026",
            rawDate: "2026-10-12",
            author: "Lia Mendoza",
            endorsedBy: "Sofia Alcantara (Feature Head)",
            status: "pending",
            remarks: "",
            content: `At 11:30 PM, long after the last student leaves the library and lecture lights flick off, an army of twenty-two custodial workers steps onto the silent campus grounds.

Armed with industrial polishers, brooms, and sanitizing tanks, these workers restore hundreds of classrooms, laboratory benches, and restroom facilities before the 7:00 AM bell rings. Despite being the backbone of university operations, many work through third-party contracting agencies with minimal hazard pay.

Through the quiet corridors of the Science Pavilion, veteran custodian Mang Rodrigo sweeps the marble floors he has polished for eighteen years. "We keep the school standing, even if our names are never spoken during graduation ceremonies," he smiles quietly.`
        },
        {
            id: 'rev-06',
            title: "Echoes from the Quadrangle: Verses from the Midnight Study Hall",
            category: "Literature",
            date: "Oct 11, 2026",
            rawDate: "2026-10-11",
            author: "Camille Torres",
            endorsedBy: "Lucas Gabriel (Literature Head)",
            status: "pending",
            remarks: "",
            content: `The hum of fluorescent tubes,
the rustle of photocopied notes,
shadow stretching across tiled floorboards,
while the city sleeps in heavy coats.

We drink bitter instant coffee,
counting hours until dawn arrives,
hoping these equations and verses
give meaning to our restless lives.`
        }
    ];

    // LocalStorage Queue Management
    function getStoredPendingQueue() {
        try {
            const raw = localStorage.getItem('executivePendingReviewQueue');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.map(item => ({
                        ...item,
                        endorsedBy: item.endorsedBy || getEndorserForCategory(item.category)
                    }));
                }
            }
        } catch (e) {
            console.warn('Could not read executivePendingReviewQueue', e);
        }
        return JSON.parse(JSON.stringify(defaultPendingArticles));
    }

    function savePendingQueue(list) {
        try {
            localStorage.setItem('executivePendingReviewQueue', JSON.stringify(list));
        } catch (e) {
            console.warn('Could not save executivePendingReviewQueue', e);
        }
    }

    let reviewList = getStoredPendingQueue();
    let currentActiveId = null;
    let currentSort = 'newest'; // 'newest' | 'oldest'
    let currentCategory = 'all'; // 'all' | 'News' | 'Opinions' | 'Features' | 'Science and Technology' | 'Literature'

    // DOM Elements
    const listContainer = document.getElementById('review-list-container');
    const emptyQueueState = document.getElementById('empty-queue-state');
    const sortSelect = document.getElementById('review-sort-select');
    const toastContainer = document.getElementById('toast-container');

    // Manuscript Modal Elements
    const manuscriptModal = document.getElementById('manuscript-modal');
    const closeManuscriptBtn = document.getElementById('close-manuscript-btn');
    const modalCloseBottomBtn = document.getElementById('modal-close-bottom-btn');
    const modalHeadline = document.getElementById('modal-headline');
    const modalSection = document.getElementById('modal-section');
    const modalDate = document.getElementById('modal-date');
    const modalWriter = document.getElementById('modal-writer');
    const modalBody = document.getElementById('modal-body');
    const remarksSection = document.getElementById('manuscript-remarks-section');
    const modalRemarks = document.getElementById('modal-remarks');
    const remarksErrorMsg = document.getElementById('remarks-error-msg');
    const modalApproveBtn = document.getElementById('modal-approve-btn');
    const modalRevisionBtn = document.getElementById('modal-revision-btn');

    // =========================================================================
    // 3. HELPER UTILITIES: ESCAPE HTML & SMOOTH TOAST (ZERO FLASH)
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

        // Dismiss existing toast immediately to prevent stacking or flashing
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
    // 4. CATEGORY FILTERING & BADGES (Review Articles by Category)
    // =========================================================================
    function matchesCategory(itemCat, targetCat) {
        if (!itemCat || !targetCat || targetCat === 'all') return true;
        const cat = itemCat.toLowerCase().trim();
        const target = targetCat.toLowerCase().trim();
        if (target === 'news') return cat.includes('news');
        if (target === 'opinions' || target === 'opinion') return cat.includes('opinion');
        if (target === 'features' || target === 'feature') return cat.includes('feature');
        if (target.includes('sci') || target.includes('tech')) return cat.includes('sci') || cat.includes('tech');
        if (target.includes('lit')) return cat.includes('lit');
        return cat === target;
    }

    function updateCategoryBadges() {
        const allCount = reviewList.length;
        const newsCount = reviewList.filter(i => matchesCategory(i.category, 'News')).length;
        const opinionsCount = reviewList.filter(i => matchesCategory(i.category, 'Opinions')).length;
        const featuresCount = reviewList.filter(i => matchesCategory(i.category, 'Features')).length;
        const scitechCount = reviewList.filter(i => matchesCategory(i.category, 'Science and Technology')).length;
        const litCount = reviewList.filter(i => matchesCategory(i.category, 'Literature')).length;

        const bAll = document.getElementById('badge-review-all');
        const bNews = document.getElementById('badge-review-news');
        const bOpinions = document.getElementById('badge-review-opinions');
        const bFeatures = document.getElementById('badge-review-features');
        const bScitech = document.getElementById('badge-review-scitech');
        const bLit = document.getElementById('badge-review-literature');

        if (bAll) bAll.textContent = allCount;
        if (bNews) bNews.textContent = newsCount;
        if (bOpinions) bOpinions.textContent = opinionsCount;
        if (bFeatures) bFeatures.textContent = featuresCount;
        if (bScitech) bScitech.textContent = scitechCount;
        if (bLit) bLit.textContent = litCount;
    }

    // Category Tabs Event Listeners
    const categoryTabs = document.querySelectorAll('.review-tab-btn');
    categoryTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryTabs.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            currentCategory = btn.getAttribute('data-category') || 'all';
            renderReviewBoxes();
        });
    });

    // =========================================================================
    // 5. SORTING LOGIC (Newest First vs Oldest First - Silent, No Toast)
    // =========================================================================
    function getSortedList() {
        return [...reviewList]
            .filter(item => matchesCategory(item.category, currentCategory))
            .sort((a, b) => {
                const timeA = new Date(a.rawDate || a.date).getTime();
                const timeB = new Date(b.rawDate || b.date).getTime();
                if (currentSort === 'oldest') {
                    return timeA - timeB;
                }
                return timeB - timeA;
            });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderReviewBoxes();
            // Silent sort without toast notification per requirements
        });
    }

    // =========================================================================
    // 6. RENDERING RESPONSIVE HORIZONTAL BOX LIST
    // =========================================================================
    function renderReviewBoxes() {
        if (!listContainer) return;

        updateCategoryBadges();

        const sorted = getSortedList();

        if (sorted.length === 0) {
            listContainer.innerHTML = '';
            if (emptyQueueState) {
                emptyQueueState.style.display = 'block';
                const msgEl = emptyQueueState.querySelector('span');
                if (msgEl) {
                    msgEl.textContent = (currentCategory === 'all')
                        ? 'All caught up. No articles pending executive review.'
                        : `No pending articles in ${currentCategory}.`;
                }
            }
            return;
        }

        if (emptyQueueState) emptyQueueState.style.display = 'none';

        listContainer.innerHTML = sorted.map(item => `
            <div class="review-box" id="box-${item.id}" data-id="${item.id}">
                <!-- Left Stack: Meta Line, Bold Article Title, Author with Pen Nib Icon -->
                <div class="review-box-content">
                    <div class="review-box-meta">
                        <span class="review-box-category">${escapeHTML(item.category)}</span>
                        <span class="review-box-date"><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${escapeHTML(item.date)}</span>
                        <span class="review-box-endorsed"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Approved by <strong>${escapeHTML(item.endorsedBy || getEndorserForCategory(item.category))}</strong></span>
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
                    <button type="button" class="btn-box-approve" data-action="approve-mpc" data-id="${item.id}" title="Approve for Media & Publication Committee">
                        <i class="fa-solid fa-check"></i>
                        <span>Approve for M&amp;PC</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // =========================================================================
    // 6. ACTION HANDLERS (Without Page Refresh & No Browser Alert/Prompt)
    // =========================================================================
    function approveStoryForMPC(id) {
        const item = reviewList.find(a => a.id === id);
        if (!item) return;

        const box = document.getElementById(`box-${id}`);
        if (box) {
            box.classList.add('box-fade-out');
        }

        setTimeout(() => {
            reviewList = reviewList.filter(a => a.id !== id);
            savePendingQueue(reviewList);
            renderReviewBoxes();
            showToast('Article approved and forwarded to the Media & Publication Committee (M&PC).', 'success');
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
            renderReviewBoxes();
            showToast('Article returned to writer for revision.', 'warning');
        }, 220);
    }

    // =========================================================================
    // 7. MANUSCRIPT MODAL VIEWER WITH DIRECT-TO-REMARKS & VALIDATION
    // =========================================================================
    function openManuscript(id, options = {}) {
        const item = reviewList.find(a => a.id === id);
        if (!item) return;

        currentActiveId = id;
        if (modalHeadline) modalHeadline.textContent = item.title;
        if (modalSection) modalSection.textContent = item.category;
        if (modalDate) modalDate.textContent = item.date;
        if (modalWriter) modalWriter.textContent = item.author;
        const modalEndorser = document.getElementById('modal-endorser');
        if (modalEndorser) modalEndorser.textContent = item.endorsedBy || getEndorserForCategory(item.category);

        // Reset remarks and validation state
        if (modalRemarks) {
            modalRemarks.value = item.remarks || '';
            modalRemarks.classList.remove('input-invalid');
            modalRemarks.classList.remove('pulse-focus');
        }
        if (remarksErrorMsg) {
            remarksErrorMsg.classList.add('hidden');
        }

        if (modalBody) {
            const paragraphs = item.content ? item.content.split('\n\n') : [];
            modalBody.innerHTML = paragraphs.map(p => `<p>${escapeHTML(p.trim())}</p>`).join('');
        }

        if (manuscriptModal) {
            manuscriptModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        // Direct to Revision Remarks: smoothly scroll down and focus the textarea
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
            // Default: start at top of story
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
    if (modalCloseBottomBtn) modalCloseBottomBtn.addEventListener('click', closeManuscript);

    if (manuscriptModal) {
        manuscriptModal.addEventListener('click', (e) => {
            if (e.target === manuscriptModal) closeManuscript();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && manuscriptModal && !manuscriptModal.classList.contains('hidden')) {
            closeManuscript();
        }
    });

    // Real-time validation clearance on typing
    if (modalRemarks) {
        modalRemarks.addEventListener('input', () => {
            if (modalRemarks.value.trim().length > 0) {
                modalRemarks.classList.remove('input-invalid');
                if (remarksErrorMsg) remarksErrorMsg.classList.add('hidden');
            }
        });
    }

    // Modal Approve Button
    if (modalApproveBtn) {
        modalApproveBtn.addEventListener('click', () => {
            if (!currentActiveId) return;
            const targetId = currentActiveId;
            closeManuscript();
            approveStoryForMPC(targetId);
        });
    }

    // Modal Revision Button (Strict Validation: Remarks are mandatory)
    if (modalRevisionBtn) {
        modalRevisionBtn.addEventListener('click', () => {
            if (!currentActiveId) return;

            const remarks = modalRemarks ? modalRemarks.value.trim() : '';

            // Mandatory Validation: Cannot submit for revision without remarks!
            if (!remarks) {
                if (remarksErrorMsg) remarksErrorMsg.classList.remove('hidden');
                if (modalRemarks) {
                    modalRemarks.classList.add('input-invalid');
                    modalRemarks.focus();
                }
                if (remarksSection) {
                    remarksSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return; // Stop submission
            }

            const targetId = currentActiveId;
            closeManuscript();
            returnStoryForRevision(targetId, remarks);
        });
    }

    // =========================================================================
    // 8. LIST EVENT DELEGATION
    // =========================================================================
    if (listContainer) {
        listContainer.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const id = target.dataset.id;
            if (!id) return;

            if (action === 'read') {
                openManuscript(id, { focusRemarks: false });
            } else if (action === 'revision') {
                // Directly directs executive to the mandatory Revision Remarks section
                openManuscript(id, { focusRemarks: true });
            } else if (action === 'approve-mpc') {
                approveStoryForMPC(id);
            }
        });
    }

    // =========================================================================
    // 9. REAL-TIME CLOCK (Desktop)
    // =========================================================================    // Initial render
    renderReviewBoxes();
});
