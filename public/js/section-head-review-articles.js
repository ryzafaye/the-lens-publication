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
    const userRole = localStorage.getItem('sectionHeadRole') || localStorage.getItem('userRole') || (document.getElementById('topbar-user-role')?.textContent?.trim()) || 'Section Head';
    const currentSection = localStorage.getItem('sectionHeadSection') || (document.querySelector('.dynamic-section-name')?.textContent?.trim()) || 'News';
    const sectionHeadName = localStorage.getItem('sectionHeadName') || localStorage.getItem('userName') || (document.getElementById('mobile-user-name')?.textContent?.trim()) || 'Section Head';

    // =========================================================================
    // 2. DATASET (Pending Manuscripts Queue)
    // =========================================================================
    const defaultPendingArticles = [];

    const QUEUE_STORAGE_KEY = 'sectionHeadReviewQueue_v1';

    function getPendingQueue() {
        if (window.__PENDING_ARTICLES__ && Array.isArray(window.__PENDING_ARTICLES__)) {
            return window.__PENDING_ARTICLES__;
        }
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
        const isSectionHead = /head/i.test(userRole);
        if (!isSectionHead || !currentSection || currentSection === 'All') return reviewList;
        const sec = currentSection.toLowerCase();
        return reviewList.filter(item => {
            const cat = (item.category || '').toLowerCase();
            if (sec.includes('science') || sec.includes('tech')) return cat.includes('science') || cat.includes('tech');
            if (sec.includes('feature')) return cat.includes('feature');
            if (sec.includes('liter')) return cat.includes('liter');
            if (sec.includes('news')) return cat.includes('news');
            if (sec.includes('opinion')) return cat.includes('opinion');
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

    function decodeCorruptedHtmlEntities(str) {
        if (!str || typeof str !== 'string') return '';
        let decoded = str;
        let maxPasses = 5;
        while (maxPasses > 0 && (/&amp;(?:lt|gt|quot|#39|amp);/i.test(decoded) || /&(?:lt|gt);/i.test(decoded))) {
            const txt = document.createElement('textarea');
            txt.innerHTML = decoded;
            const newDecoded = txt.value;
            if (newDecoded === decoded) break;
            decoded = newDecoded;
            maxPasses--;
        }
        return decoded;
    }

    function formatCleanArticleContent(rawContent) {
        if (!rawContent || !String(rawContent).trim()) {
            return '<p style="color: #667085; font-style: italic;">No manuscript text provided.</p>';
        }

        // 1. Decode any corrupted or double-encoded HTML entities so tags are real HTML
        let content = decodeCorruptedHtmlEntities(String(rawContent).trim());

        // 2. Strip dangerous script/iframe tags and inline event handlers
        content = content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

        // 3. Unwrap unnecessary span tags while keeping their text intact
        content = content
            .replace(/<\/?span[^>]*>/gi, '')
            .replace(/\s*style="[^"]*"/gi, '')
            .replace(/\s*style='[^']*'/gi, '');

        // 4. Normalize any broken <div><br><div> constructs to standard <div><br></div>
        content = content
            .replace(/<div><br\s*\/?><div>/gi, '<div><br></div>');

        // 5. Check if the content contains HTML structural tags
        const hasHtmlTags = /<\/?(?:div|p|br|h[1-6]|blockquote|ul|ol|li|strong|b|em|i|u|s|a|hr)[^>]*>/i.test(content);

        if (hasHtmlTags) {
            // Convert <p> tags to <div> with canonical <div><br></div> paragraph separators
            content = content
                .replace(/<\/p>\s*<p[^>]*>/gi, '</div><div><br></div><div>')
                .replace(/<p[^>]*>/gi, '<div>')
                .replace(/<\/p>/gi, '</div>');

            // Collapse multiple consecutive blank line divs into a single standard break
            content = content.replace(/(?:<div>\s*(?:<br\s*\/?>)?\s*<\/div>\s*){2,}/gi, '<div><br></div>');

            // Remove leading and trailing empty lines
            content = content
                .replace(/^(?:<div>\s*(?:<br\s*\/?>)?\s*<\/div>\s*)+/gi, '')
                .replace(/(?:<div>\s*(?:<br\s*\/?>)?\s*<\/div>\s*)+$/gi, '');

            return content;
        }

        // 6. Plain-text fallback: split into paragraphs and map to canonical block elements
        const paragraphs = content
            .split(/\r?\n\r?\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        if (paragraphs.length === 0) {
            return '<p style="color: #667085; font-style: italic;">No manuscript text provided.</p>';
        }

        return paragraphs.map(p => `<div>${escapeHTML(p).replace(/\r?\n/g, '<br>')}</div>`).join('<div><br></div>');
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
                <!-- Left Stack: Meta Line, Bold Article Title, Excerpt, Author with Pen Nib Icon -->
                <div class="review-box-content">
                    <div class="review-box-meta">
                        <span class="review-box-category">${escapeHTML(item.category || currentSection)}</span>
                        <span class="review-box-date"><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${escapeHTML(item.date)}</span>
                    </div>

                    <button type="button" class="review-box-title" data-action="edit" data-id="${item.id}" title="${escapeHTML(item.title)}">
                        ${escapeHTML(item.title)}
                    </button>

                    ${item.excerpt ? `<p class="review-box-excerpt">${escapeHTML(item.excerpt)}</p>` : ''}

                    <p class="review-box-author">
                        <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
                        <span>By <strong>${escapeHTML(item.author)}</strong></span>
                    </p>
                </div>

                <!-- Right Actions: 3 small buttons in a row -->
                <div class="review-box-actions">
                    <button type="button" class="btn-box-read btn-box-edit" data-action="edit" data-id="${item.id}" title="Edit writer's manuscript">
                        <i class="fa-solid fa-pen-to-square"></i>
                        <span>Edit</span>
                    </button>
                    <button type="button" class="btn-box-revision" data-action="revision" data-id="${item.id}" title="Direct to revision remarks">
                        <i class="fa-solid fa-rotate-left"></i>
                        <span>For Revision</span>
                    </button>
                    <button type="button" class="btn-box-approve" data-action="approve" data-id="${item.id}" title="Approve manuscript">
                        <i class="fa-solid fa-check"></i>
                        <span>Approve</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // =========================================================================
    // 6. ACTION HANDLERS
    // =========================================================================
    function approveStory(id) {
        const item = reviewList.find(a => String(a.id) === String(id));
        if (!item) return;

        const modalHeadline = document.getElementById('modal-headline');
        const modalExcerpt = document.getElementById('modal-excerpt');
        const bodyEditor = document.getElementById('modal-body');
        const newTitle = modalHeadline && (modalHeadline.innerText || modalHeadline.textContent).trim() ? (modalHeadline.innerText || modalHeadline.textContent).trim() : item.title;
        const newExcerpt = modalExcerpt && modalExcerpt.style.display !== 'none' ? (modalExcerpt.innerText || modalExcerpt.textContent).trim() : (item.excerpt || '');
        const newContent = bodyEditor && bodyEditor.innerHTML.trim() ? bodyEditor.innerHTML.trim() : item.content;

        item.title = newTitle;
        item.excerpt = newExcerpt;
        item.content = newContent;

        const box = document.getElementById(`box-${id}`);
        if (box) {
            box.classList.add('box-fade-out');
        }

        // Trigger Laravel backend approval to update the database
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const basePath = window.__APPROVE_URL__ || (window.location.pathname.startsWith('/section-head') ? '/section-head/review-articles' : '/executive/review-articles');

        fetch(`${basePath}/${id}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                title: newTitle,
                excerpt: newExcerpt,
                content: newContent
            })
        }).catch(err => console.warn('Backend approve call failed:', err));

        setTimeout(() => {
            reviewList = reviewList.filter(a => String(a.id) !== String(id));
            if (window.__PENDING_ARTICLES__) {
                window.__PENDING_ARTICLES__ = window.__PENDING_ARTICLES__.filter(a => String(a.id) !== String(id));
            }
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
                eicQueue = eicQueue.filter(q => String(q.id) !== String(item.id));
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
                            if (String(w.id) === String(item.id) || w.title === item.title) {
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
        const item = reviewList.find(a => String(a.id) === String(id));
        if (!item) return;

        const box = document.getElementById(`box-${id}`);
        if (box) {
            box.classList.add('box-fade-out');
        }

        // Trigger Laravel backend revision to update the database
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const basePath = window.__REVISION_URL__ || (window.location.pathname.startsWith('/section-head') ? '/section-head/review-articles' : '/executive/review-articles');

        fetch(`${basePath}/${id}/revision`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ remarks: remarks })
        }).catch(err => console.warn('Backend revision call failed:', err));

        setTimeout(() => {
            reviewList = reviewList.filter(a => String(a.id) !== String(id));
            if (window.__PENDING_ARTICLES__) {
                window.__PENDING_ARTICLES__ = window.__PENDING_ARTICLES__.filter(a => String(a.id) !== String(id));
            }
            savePendingQueue(reviewList);
            logActivity('requested revision on', item.title);

            // Remove from EIC queue if present
            try {
                let eicQueue = [];
                const rawEic = localStorage.getItem('eicPendingReviewQueue');
                if (rawEic) {
                    const parsed = JSON.parse(rawEic);
                    if (Array.isArray(parsed)) {
                        eicQueue = parsed.filter(q => String(q.id) !== String(item.id));
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
                            if (String(w.id) === String(item.id) || w.title === item.title) {
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
        const item = reviewList.find(a => String(a.id) === String(id));
        if (!item || !manuscriptModal) return;

        currentActiveId = id;
        if (modalHeadline) modalHeadline.textContent = item.title || '';
        if (modalSection) modalSection.textContent = item.category || currentSection;
        if (modalDate) modalDate.textContent = item.date;
        if (modalWriter) modalWriter.textContent = item.author;

        const modalExcerpt = document.getElementById('modal-excerpt');
        if (modalExcerpt) {
            if (item.excerpt && item.excerpt.trim()) {
                modalExcerpt.textContent = item.excerpt.trim();
                modalExcerpt.style.display = 'block';
            } else {
                modalExcerpt.textContent = '';
                modalExcerpt.style.display = 'none';
            }
        }

        if (modalBody) {
            modalBody.innerHTML = formatCleanArticleContent(item.content || item.excerpt);
        }

        // Toggle UI based on whether opening for Revision or Editing
        const modalSaveBtn = document.getElementById('modal-save-btn');
        if (options.focusRemarks) {
            // Revision mode
            if (remarksSection) remarksSection.style.display = 'block';
            if (modalRevisionBtn) modalRevisionBtn.style.display = 'inline-flex';
            if (modalApproveBtn) modalApproveBtn.style.display = 'none';
            if (modalSaveBtn) modalSaveBtn.style.display = 'none';

            // Reset remarks
            if (modalRemarks) {
                let cleanRemarks = (item.remarks || '').trim();
                if (/^(?:Endorsed to|Approved by)/i.test(cleanRemarks)) {
                    cleanRemarks = '';
                }
                modalRemarks.value = cleanRemarks;
                modalRemarks.classList.remove('input-invalid');
                modalRemarks.classList.remove('pulse-focus');
            }
            if (remarksErrorMsg) remarksErrorMsg.classList.add('hidden');

            setTimeout(() => {
                const bodyEl = document.querySelector('.manuscript-body');
                if (bodyEl && remarksSection) {
                    bodyEl.scrollTo({ top: remarksSection.offsetTop - 30, behavior: 'smooth' });
                }
                if (modalRemarks) {
                    modalRemarks.focus();
                    modalRemarks.classList.add('pulse-focus');
                    setTimeout(() => modalRemarks.classList.remove('pulse-focus'), 1200);
                }
            }, 180);
        } else {
            // Editing mode: Remove 'For Revision' and 'Approve for EIC' buttons, show maroon Save button only
            if (remarksSection) remarksSection.style.display = 'none';
            if (modalRevisionBtn) modalRevisionBtn.style.display = 'none';
            if (modalApproveBtn) modalApproveBtn.style.display = 'none';
            if (modalSaveBtn) modalSaveBtn.style.display = 'inline-flex';

            const bodyEl = document.querySelector('.manuscript-body');
            if (bodyEl) bodyEl.scrollTop = 0;
        }

        manuscriptModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
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

    if (modalHeadline) {
        modalHeadline.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const modalExcerpt = document.getElementById('modal-excerpt');
                if (modalExcerpt && modalExcerpt.style.display !== 'none') {
                    modalExcerpt.focus();
                } else if (modalBody) {
                    modalBody.focus();
                }
            }
        });
    }

    // Save Changes Action Handler
    async function saveArticleEdits(id) {
        const item = reviewList.find(a => String(a.id) === String(id));
        if (!item) return;

        const modalHeadline = document.getElementById('modal-headline');
        const modalExcerpt = document.getElementById('modal-excerpt');
        const bodyEditor = document.getElementById('modal-body');

        const newTitle = modalHeadline ? (modalHeadline.innerText || modalHeadline.textContent).trim() : item.title;
        const newExcerpt = modalExcerpt && modalExcerpt.style.display !== 'none' ? (modalExcerpt.innerText || modalExcerpt.textContent).trim() : (item.excerpt || '');
        const newContent = bodyEditor ? bodyEditor.innerHTML.trim() : item.content;

        if (!newTitle) {
            showToast('Please enter an article headline.', 'danger');
            if (modalHeadline) modalHeadline.focus();
            return;
        }

        const saveBtn = document.getElementById('modal-save-btn');
        const origHtml = saveBtn ? saveBtn.innerHTML : '';
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Saving...</span>';
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const updateBaseUrl = window.__UPDATE_URL__ || '/section-head/review-articles';

        try {
            const res = await fetch(`${updateBaseUrl}/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    title: newTitle,
                    excerpt: newExcerpt,
                    content: newContent
                })
            });

            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success !== false) {
                item.title = newTitle;
                item.excerpt = newExcerpt;
                item.content = newContent;
                savePendingQueue(reviewList);
                renderReviewBoxes();
                showToast('Article changes saved successfully.', 'success');
            } else {
                showToast(data.message || 'Failed to save changes.', 'danger');
            }
        } catch (err) {
            console.error('Error saving article:', err);
            item.title = newTitle;
            item.excerpt = newExcerpt;
            item.content = newContent;
            savePendingQueue(reviewList);
            renderReviewBoxes();
            showToast('Article changes saved locally.', 'success');
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = origHtml;
            }
        }
    }

    // Modal Save Changes Button
    const modalSaveBtn = document.getElementById('modal-save-btn');
    if (modalSaveBtn) {
        modalSaveBtn.addEventListener('click', () => {
            if (!currentActiveId) return;
            saveArticleEdits(currentActiveId);
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

            if (action === 'edit' || action === 'read') {
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

