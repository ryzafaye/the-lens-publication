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
    const defaultPendingArticles = [];

    const QUEUE_STORAGE_KEY = 'sectionHeadReviewQueue_v1';

    function getPendingQueue() {
        try {
            const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.warn('Could not read pending queue from localStorage', e);
        }
        return [];
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
        if (!currentSection || currentSection === 'All') return reviewList;
        const sec = currentSection.toLowerCase();
        return reviewList.filter(item => {
            const cat = (item.category || '').toLowerCase();
            if (sec.includes('science') || sec.includes('tech')) return cat.includes('science') || cat.includes('tech');
            if (sec.includes('feature')) return cat.includes('feature');
            if (sec.includes('literature')) return cat.includes('liter');
            if (sec.includes('news')) return cat.includes('news');
            return cat.includes(sec);
        });
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
            logActivity('approved and endorsed to EIC', item.title);

            // Forward to EIC Review Queue & Executive Review Queue
            try {
                let eicQueue = [];
                const rawEic = localStorage.getItem('eicPendingReviewQueue') || localStorage.getItem('executivePendingReviewQueue');
                if (rawEic) {
                    try {
                        const parsed = JSON.parse(rawEic);
                        if (Array.isArray(parsed)) eicQueue = parsed;
                    } catch (e) {}
                }
                eicQueue = eicQueue.filter(q => q.id !== item.id);
                eicQueue.unshift({
                    ...item,
                    endorsedBy: `${sectionHeadName} (${currentSection} Head)`,
                    endorsedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    status: 'pending'
                });
                localStorage.setItem('eicPendingReviewQueue', JSON.stringify(eicQueue));
                localStorage.setItem('executivePendingReviewQueue', JSON.stringify(eicQueue));
            } catch (e) {
                console.error('Failed to forward manuscript to EIC queue', e);
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
                                return { ...w, status: 'Pending Review', remarks: `Endorsed to EIC by ${sectionHeadName}` };
                            }
                            return w;
                        });
                        if (updated) localStorage.setItem('theLensWriterArticles_v3', JSON.stringify(writerList));
                    }
                }
            } catch (e) {}

            renderReviewBoxes();
            showToast(`Approved "${item.title}" and forwarded to Editor-in-Chief.`, 'success');
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

            // Remove from EIC queue if present
            try {
                let eicQueue = [];
                const rawEic = localStorage.getItem('eicPendingReviewQueue');
                if (rawEic) {
                    const parsed = JSON.parse(rawEic);
                    if (Array.isArray(parsed)) {
                        eicQueue = parsed.filter(q => q.id !== item.id);
                        localStorage.setItem('eicPendingReviewQueue', JSON.stringify(eicQueue));
                        localStorage.setItem('executivePendingReviewQueue', JSON.stringify(eicQueue));
                    }
                }
            } catch (e) {}

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
                                return { ...w, status: 'For Revision', remarks: remarks || 'Please revise according to section feedback.' };
                            }
                            return w;
                        });
                        if (updated) localStorage.setItem('theLensWriterArticles_v3', JSON.stringify(writerList));
                    }
                }
            } catch (e) {}

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
            const modalExcerpt = document.getElementById('modal-excerpt');
            if (modalExcerpt) {
                if (item.excerpt && item.excerpt.trim()) {
                    modalExcerpt.textContent = item.excerpt.trim();
                    modalExcerpt.style.display = 'block';
                } else {
                    modalExcerpt.style.display = 'none';
                }
            }

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
