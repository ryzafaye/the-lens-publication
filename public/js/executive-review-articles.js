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
    function getEndorserForCategory(cat, item = null) {
        if (!cat) return 'Section Head';
        const catLower = cat.toLowerCase().trim();

        // 1. For Opinion, there is no Opinion Head -> Direct Submission
        if (catLower.includes('opinion')) {
            return 'Direct Submission (Opinion)';
        }

        // 2. Check if item has backend-provided endorsedBy
        if (item && item.endorsedBy && item.endorsedBy !== 'Section Head' && !item.endorsedBy.toLowerCase().includes('section editorial')) {
            return item.endorsedBy;
        }

        // 3. Strictly resolve based on category
        const heads = window.__CATEGORY_HEADS__ || {};
        for (const [key, val] of Object.entries(heads)) {
            if (catLower.includes(key.toLowerCase()) || key.toLowerCase().includes(catLower)) {
                return val;
            }
        }
        const fallbackMap = {
            'news': 'Arquero (News Head)',
            'opinions': 'Direct Submission (Opinion)',
            'opinion': 'Direct Submission (Opinion)',
            'features': 'Dela Cruz (Feature Head)',
            'feature': 'Dela Cruz (Feature Head)',
            'science and technology': 'Apilado (SciTech Head)',
            'scitech': 'Apilado (SciTech Head)',
            'science & technology': 'Apilado (SciTech Head)',
            'literature': 'Llandelar (Literary Head)',
            'literary': 'Llandelar (Literary Head)'
        };
        for (const [fKey, fVal] of Object.entries(fallbackMap)) {
            if (catLower.includes(fKey) || fKey.includes(catLower)) {
                return fVal;
            }
        }
        return 'Section Head';
    }

    function renderEndorsementBadge(item, isSectionHead) {
        if (isSectionHead) return '';
        const endorser = getEndorserForCategory(item.category, item);
        if (endorser.toLowerCase().includes('direct') || endorser.toLowerCase().includes('opinion')) {
            return `<span class="review-box-endorsed"><i class="fa-solid fa-feather-pointed" aria-hidden="true"></i> Direct Submission (Opinion)</span>`;
        }
        return `<span class="review-box-endorsed"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Approved by <strong>${escapeHTML(endorser)}</strong></span>`;
    }

    const defaultPendingArticles = [];

    // LocalStorage Queue Management
    function getStoredPendingQueue() {
        const isSectionHead = window.location.pathname.startsWith('/section-head');
        if (window.INITIAL_PENDING && Array.isArray(window.INITIAL_PENDING) && window.INITIAL_PENDING.length > 0) {
            return window.INITIAL_PENDING.map(item => ({
                ...item,
                endorsedBy: item.endorsedBy || getEndorserForCategory(item.category)
            }));
        }
        if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA) && window.INITIAL_DATA.length > 0) {
            return window.INITIAL_DATA.map(item => ({
                ...item,
                endorsedBy: item.endorsedBy || getEndorserForCategory(item.category)
            }));
        }
        try {
            if (isSectionHead) {
                const raw = localStorage.getItem('sectionHeadReviewQueue_v1');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed;
                    }
                }
            } else {
                const raw = localStorage.getItem('executivePendingReviewQueue') || localStorage.getItem('eicPendingReviewQueue');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed.map(item => ({
                            ...item,
                            endorsedBy: item.endorsedBy || getEndorserForCategory(item.category)
                        }));
                    }
                }
            }
        } catch (e) {
            console.warn('Could not read pending review queue', e);
        }
        return [];
    }

    function savePendingQueue(list) {
        const isSectionHead = window.location.pathname.startsWith('/section-head');
        try {
            if (isSectionHead) {
                localStorage.setItem('sectionHeadReviewQueue_v1', JSON.stringify(list));
            } else {
                localStorage.setItem('executivePendingReviewQueue', JSON.stringify(list));
                localStorage.setItem('eicPendingReviewQueue', JSON.stringify(list));
            }
        } catch (e) {
            console.warn('Could not save pending review queue', e);
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
                        ? 'No articles yet'
                        : 'No articles found';
                }
            }
            return;
        }

        if (emptyQueueState) emptyQueueState.style.display = 'none';

        const isSectionHead = window.location.pathname.startsWith('/section-head');
        const approveBtnText = isSectionHead ? 'Approve for EIC' : 'Approve for M&amp;PC';

        listContainer.innerHTML = sorted.map(item => `
            <div class="review-box" id="box-${item.id}" data-id="${item.id}">
                <!-- Left Stack: Meta Line, Bold Article Title, Author with Pen Nib Icon -->
                <div class="review-box-content">
                    <div class="review-box-meta">
                        <span class="review-box-category">${escapeHTML(item.category)}</span>
                        <span class="review-box-date"><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${escapeHTML(item.date)}</span>
                        ${renderEndorsementBadge(item, isSectionHead)}
                    </div>

                    <button type="button" class="review-box-title" data-action="edit" data-id="${item.id}" title="${escapeHTML(item.title)}">
                        ${escapeHTML(item.title)}
                    </button>

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
                    <button type="button" class="btn-box-approve" data-action="approve-mpc" data-id="${item.id}" title="${isSectionHead ? 'Approve and forward to EIC' : 'Approve for Media & Publication Committee'}">
                        <i class="fa-solid fa-check"></i>
                        <span>${approveBtnText}</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // =========================================================================
    // 6. ACTION HANDLERS (With Backend API Persistence & Smooth Toast)
    // =========================================================================
    function approveStoryForMPC(id) {
        const item = reviewList.find(a => String(a.id) === String(id));
        if (!item) return;

        const isSectionHead = window.location.pathname.startsWith('/section-head');
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const approveBaseUrl = window.__APPROVE_URL__ || (isSectionHead ? '/section-head/review-articles' : '/executive/review-articles');

        const modalHeadline = document.getElementById('modal-headline');
        const modalExcerpt = document.getElementById('modal-excerpt');
        const bodyEditor = document.getElementById('modal-body');
        const newTitle = modalHeadline && (modalHeadline.innerText || modalHeadline.textContent).trim() ? (modalHeadline.innerText || modalHeadline.textContent).trim() : item.title;
        const newExcerpt = modalExcerpt && modalExcerpt.style.display !== 'none' ? (modalExcerpt.innerText || modalExcerpt.textContent).trim() : (item.excerpt || '');
        const newContent = bodyEditor && bodyEditor.innerHTML.trim() ? bodyEditor.innerHTML.trim() : item.content;

        item.title = newTitle;
        item.excerpt = newExcerpt;
        item.content = newContent;

        // Persist to backend database
        fetch(`${approveBaseUrl}/${id}/approve`, {
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
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to approve article');
            return res.json();
        })
        .catch(err => console.error('Error approving article on backend:', err));

        const box = document.getElementById(`box-${id}`);
        if (box) {
            box.classList.add('box-fade-out');
        }

        setTimeout(() => {
            reviewList = reviewList.filter(a => String(a.id) !== String(id));
            savePendingQueue(reviewList);

            // Forward to MPC publishing queue if Executive
            if (!isSectionHead) {
                try {
                    let mpcList = [];
                    const rawMpc = localStorage.getItem('mpc_publish_articles_v2');
                    if (rawMpc) {
                        const parsed = JSON.parse(rawMpc);
                        if (Array.isArray(parsed)) mpcList = parsed;
                    }
                    mpcList = mpcList.filter(m => String(m.id) !== String(item.id) && m.title !== item.title);
                    mpcList.unshift({
                        id: item.id || `mpc-art-${Date.now()}`,
                        title: item.title,
                        category: item.category || 'News',
                        author: item.author || 'The Lens Staff',
                        dateApproved: item.date || 'Recent',
                        status: 'ready',
                        assignedCoverId: null,
                        assignedCover: null,
                        views: 0,
                        shares: 0,
                        excerpt: item.excerpt || '',
                        body: item.content ? item.content.split(/\n\n+/).map(p => `<p>${escapeHTML(p.trim())}</p>`).join('') : '<p>Manuscript content approved.</p>'
                    });
                    localStorage.setItem('mpc_publish_articles_v2', JSON.stringify(mpcList));
                } catch (e) {
                    console.error('Failed to forward to MPC publishing queue:', e);
                }
            }

            renderReviewBoxes();
            const successMsg = isSectionHead
                ? 'Article approved and forwarded to Editor-in-Chief (EIC).'
                : 'Article approved and forwarded to Media & Publication Committee (M&PC).';
            showToast(successMsg, 'success');
        }, 220);
    }

    function returnStoryForRevision(id, remarks) {
        const item = reviewList.find(a => String(a.id) === String(id));
        if (!item) return;

        const isSectionHead = window.location.pathname.startsWith('/section-head');
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const revisionBaseUrl = window.__REVISION_URL__ || (isSectionHead ? '/section-head/review-articles' : '/executive/review-articles');

        // Persist to backend database
        fetch(`${revisionBaseUrl}/${id}/revision`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ remarks: remarks })
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to return article for revision');
            return res.json();
        })
        .catch(err => console.error('Error returning for revision on backend:', err));

        const box = document.getElementById(`box-${id}`);
        if (box) {
            box.classList.add('box-fade-out');
        }

        setTimeout(() => {
            reviewList = reviewList.filter(a => String(a.id) !== String(id));
            savePendingQueue(reviewList);

            renderReviewBoxes();
            showToast('Article returned to writer for revision.', 'warning');
        }, 220);
    }

    // =========================================================================
    // 7. MANUSCRIPT MODAL VIEWER WITH DIRECT-TO-REMARKS & VALIDATION
    // =========================================================================
    function openManuscript(id, options = {}) {
        const item = reviewList.find(a => String(a.id) === String(id));
        if (!item) return;

        currentActiveId = item.id;
        if (modalHeadline) modalHeadline.textContent = item.title || '';
        if (modalSection) modalSection.textContent = item.category;
        if (modalDate) modalDate.textContent = item.date;
        if (modalWriter) modalWriter.textContent = item.author;

        const isSectionHead = window.location.pathname.startsWith('/section-head');
        const modalEndorserWrap = document.querySelector('.manuscript-byline-endorser');
        if (modalEndorserWrap) {
            modalEndorserWrap.style.display = isSectionHead ? 'none' : '';
            if (!isSectionHead) {
                const endorser = getEndorserForCategory(item.category, item);
                if (endorser.toLowerCase().includes('direct') || endorser.toLowerCase().includes('opinion')) {
                    modalEndorserWrap.innerHTML = `<i class="fa-solid fa-feather-pointed" aria-hidden="true"></i> <span>Direct Submission (Opinion)</span>`;
                } else {
                    modalEndorserWrap.innerHTML = `<i class="fa-solid fa-circle-check" aria-hidden="true"></i> <span>Approved by <strong id="modal-endorser">${escapeHTML(endorser)}</strong></span>`;
                }
            }
        }

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
            modalBody.innerHTML = formatCleanArticleContent(item.content);
        }

        // Toggle UI based on whether opening for Revision or Editing
        const modalSaveBtn = document.getElementById('modal-save-btn');
        if (options.focusRemarks) {
            // Revision mode
            if (remarksSection) remarksSection.style.display = 'block';
            if (modalRevisionBtn) modalRevisionBtn.style.display = 'inline-flex';
            if (modalApproveBtn) modalApproveBtn.style.display = 'none';
            if (modalSaveBtn) modalSaveBtn.style.display = 'none';

            // Reset remarks and validation state
            if (modalRemarks) {
                modalRemarks.value = item.remarks || '';
                modalRemarks.classList.remove('input-invalid');
                modalRemarks.classList.remove('pulse-focus');
            }
            if (remarksErrorMsg) remarksErrorMsg.classList.add('hidden');

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
            // Editing mode: Remove 'For Revision' and 'Approve for EIC' buttons, show maroon Save button only
            if (remarksSection) remarksSection.style.display = 'none';
            if (modalRevisionBtn) modalRevisionBtn.style.display = 'none';
            if (modalApproveBtn) modalApproveBtn.style.display = 'none';
            if (modalSaveBtn) modalSaveBtn.style.display = 'inline-flex';

            const bodyEl = document.querySelector('.manuscript-body');
            if (bodyEl) bodyEl.scrollTop = 0;
        }

        if (manuscriptModal) {
            manuscriptModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
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

        const isSectionHead = window.location.pathname.startsWith('/section-head');
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const updateBaseUrl = window.__UPDATE_URL__ || (isSectionHead ? '/section-head/review-articles' : '/executive/review-articles');

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

            if (action === 'edit' || action === 'read') {
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
    // 9. REAL-TIME CLOCK (Desktop) & DEEP-LINK AUTO-OPEN
    // =========================================================================
    // Initial render
    renderReviewBoxes();

    // Auto-open manuscript when navigated from Section Head dashboard with ?id=...
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const targetId = urlParams.get('id') || urlParams.get('article_id');
        if (targetId) {
            setTimeout(() => {
                openManuscript(targetId, { focusRemarks: false });
            }, 150);
        }
    } catch (e) {}
});
