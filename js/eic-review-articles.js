/**
 * THE LENS — REVIEW ARTICLES (EDITOR-IN-CHIEF / EIC QUEUE)
 * Responsive Horizontal List Card (Box) Layout with Category Tabs
 * Features:
 * 1. Category Tabs: All, News, Opinions, Features, SciTech, Literature with dynamic badges
 * 2. Direct-to-Remarks Revision Workflow (No browser alert/prompt popups)
 * 3. Mandatory Revision Remarks Validation
 * 4. Sort by Newest First and Oldest First
 * 5. Author Byline with Pen-Nib Icon ("By Author Name")
 * 6. Silky Smooth Toast Notifications (Zero Flash)
 * 7. Responsive Desktop Horizontal / Mobile Vertical Stacking
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. DATASET (Articles Awaiting EIC / Editorial Decision)
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

    const defaultPendingArticles = [];

    // LocalStorage Queue Management
    function getStoredPendingQueue() {
        try {
            const raw = localStorage.getItem('eicPendingReviewQueue') || localStorage.getItem('executivePendingReviewQueue');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    return parsed.map(item => ({
                        ...item,
                        endorsedBy: item.endorsedBy || getEndorserForCategory(item.category)
                    }));
                }
            }
        } catch (e) {
            console.warn('Could not read eicPendingReviewQueue', e);
        }
        return [];
    }

    function savePendingQueue(list) {
        try {
            localStorage.setItem('eicPendingReviewQueue', JSON.stringify(list));
            // Keep executive queue in sync
            localStorage.setItem('executivePendingReviewQueue', JSON.stringify(list));
        } catch (e) {
            console.warn('Could not save eicPendingReviewQueue', e);
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
    // 2. HELPER UTILITIES: ESCAPE HTML & SMOOTH TOAST
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
        }, 3200);
    }

    // =========================================================================
    // 3. CATEGORY FILTERING & BADGES (Review Articles by Category)
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
    // 4. SORTING LOGIC (Newest First vs Oldest First - Silent, No Toast)
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
        });
    }

    // =========================================================================
    // 5. RENDERING RESPONSIVE HORIZONTAL BOX LIST
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
                        ? 'All caught up. No articles pending editorial review.'
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

            // Forward to M&PC publishing queue
            try {
                let mpcList = [];
                const rawMpc = localStorage.getItem('mpc_publish_articles_v2');
                if (rawMpc) {
                    try {
                        const parsed = JSON.parse(rawMpc);
                        if (Array.isArray(parsed)) mpcList = parsed;
                    } catch (e) {}
                }
                mpcList = mpcList.filter(a => a.id !== item.id);
                mpcList.unshift({
                    id: item.id,
                    title: item.title,
                    category: item.category,
                    categorySlug: (item.category || 'news').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    author: item.author,
                    sectionHead: item.endorsedBy || 'Section Head',
                    eicApprover: 'Victoria Reyes (Editor-in-Chief)',
                    readTime: item.readTime || '3 min read',
                    dateApproved: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    rawDate: item.rawDate || new Date().toISOString().split('T')[0],
                    status: 'ready',
                    assignedCoverId: '',
                    excerpt: item.excerpt || '',
                    body: item.content ? item.content.split(/\n\n+/).map(p => `<p>${escapeHTML(p.trim())}</p>`).join('') : '<p>Manuscript content approved.</p>'
                });
                localStorage.setItem('mpc_publish_articles_v2', JSON.stringify(mpcList));
            } catch (e) {
                console.error('Failed to forward to MPC publishing queue:', e);
            }

            // Also update writer's article in writer storage
            try {
                const rawWriter = localStorage.getItem('theLensWriterArticles_v3');
                if (rawWriter) {
                    let writerList = JSON.parse(rawWriter);
                    if (Array.isArray(writerList)) {
                        let updated = false;
                        writerList = writerList.map(w => {
                            if (w.id === item.id || w.title === item.title) {
                                updated = true;
                                return { ...w, status: 'Ready for Publishing', remarks: 'Approved by Editor-in-Chief; awaiting cover & publication by M&PC.' };
                            }
                            return w;
                        });
                        if (updated) localStorage.setItem('theLensWriterArticles_v3', JSON.stringify(writerList));
                    }
                }
            } catch (e) {}

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

            // Update writer's article with status: 'For Revision' and remarks
            try {
                const rawWriter = localStorage.getItem('theLensWriterArticles_v3');
                if (rawWriter) {
                    let writerList = JSON.parse(rawWriter);
                    if (Array.isArray(writerList)) {
                        let updated = false;
                        writerList = writerList.map(w => {
                            if (w.id === item.id || w.title === item.title) {
                                updated = true;
                                return { ...w, status: 'For Revision', remarks: remarks || 'Please revise according to EIC feedback.' };
                            }
                            return w;
                        });
                        if (updated) localStorage.setItem('theLensWriterArticles_v3', JSON.stringify(writerList));
                    }
                }
            } catch (e) {}

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
            const modalExcerpt = document.getElementById('modal-excerpt');
            if (modalExcerpt) {
                if (item.excerpt && item.excerpt.trim()) {
                    modalExcerpt.textContent = item.excerpt.trim();
                    modalExcerpt.style.display = 'block';
                } else {
                    modalExcerpt.style.display = 'none';
                }
            }

            modalBody.innerHTML = paragraphs.map(p => `<p>${escapeHTML(p.trim())}</p>`).join('');
        }

        if (manuscriptModal) {
            manuscriptModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

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

    if (modalRemarks) {
        modalRemarks.addEventListener('input', () => {
            if (modalRemarks.value.trim().length > 0) {
                modalRemarks.classList.remove('input-invalid');
                if (remarksErrorMsg) remarksErrorMsg.classList.add('hidden');
            }
        });
    }

    if (modalApproveBtn) {
        modalApproveBtn.addEventListener('click', () => {
            if (!currentActiveId) return;
            const targetId = currentActiveId;
            closeManuscript();
            approveStoryForMPC(targetId);
        });
    }

    if (modalRevisionBtn) {
        modalRevisionBtn.addEventListener('click', () => {
            if (!currentActiveId) return;

            const remarks = modalRemarks ? modalRemarks.value.trim() : '';

            if (!remarks) {
                if (remarksErrorMsg) remarksErrorMsg.classList.remove('hidden');
                if (modalRemarks) {
                    modalRemarks.classList.add('input-invalid');
                    modalRemarks.focus();
                }
                if (remarksSection) {
                    remarksSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
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
                openManuscript(id, { focusRemarks: true });
            } else if (action === 'approve-mpc') {
                approveStoryForMPC(id);
            }
        });
    }

    // Initial render
    renderReviewBoxes();
});

