/**
 * THE LENS ΓÇö REVIEW ARTICLES (EDITOR-IN-CHIEF / EIC QUEUE)
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
    const defaultPendingArticles = [];

    // Helper to resolve the correct Section Head who approved the story based on category of submitted article
    function resolveEndorser(item) {
        if (!item) return 'Section Head';
        const cat = (item.category || '').trim();
        const catLower = cat.toLowerCase();

        // 1. Strictly resolve Section Head based on the submitted article's category
        const heads = window.__CATEGORY_HEADS__ || {};
        for (const [key, val] of Object.entries(heads)) {
            if (catLower.includes(key.toLowerCase()) || key.toLowerCase().includes(catLower)) {
                return val;
            }
        }
        const fallbackMap = {
            'news': 'News Head',
            'opinions': 'Opinion Head',
            'opinion': 'Opinion Head',
            'features': 'Feature Head',
            'feature': 'Feature Head',
            'science and technology': 'SciTech Head',
            'scitech': 'SciTech Head',
            'science & technology': 'SciTech Head',
            'literature': 'Literary Head',
            'literary': 'Literary Head'
        };
        if (fallbackMap[catLower]) {
            return fallbackMap[catLower];
        }
        for (const [fKey, fVal] of Object.entries(fallbackMap)) {
            if (catLower.includes(fKey) || fKey.includes(catLower)) {
                return fVal;
            }
        }

        // 2. Fallback to item.endorsedBy if category could not be resolved
        if (item.endorsedBy && item.endorsedBy !== 'Section Head') {
            return item.endorsedBy;
        }

        return 'Section Head';
    }

    // LocalStorage Queue Management
    function getStoredPendingQueue() {
        let list = [];
        if (window.__PENDING_ARTICLES__ && Array.isArray(window.__PENDING_ARTICLES__)) {
            list = window.__PENDING_ARTICLES__.map(item => ({
                id: item.id,
                title: item.title,
                author: item.author || 'Writer',
                category: item.category || 'News',
                content: item.content,
                excerpt: item.excerpt,
                image: item.featured_image,
                date: item.date || 'Just now',
                ...item,
                endorsedBy: resolveEndorser(item)
            }));
        } else {
            try {
                const raw = localStorage.getItem('eicPendingReviewQueue') || localStorage.getItem('executivePendingReviewQueue');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        list = parsed.map(item => ({
                            ...item,
                            endorsedBy: resolveEndorser(item)
                        }));
                    }
                }
            } catch (e) {
                console.warn('Could not read eicPendingReviewQueue', e);
            }
        }

        return list;
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
            // Injected as true HTML: do NOT pass through escapeHTML() so formatting and line breaks render correctly
            return content;
        }

        // 6. Plain-text fallback: split into paragraphs and map to paragraph elements
        const paragraphs = content
            .split(/\r?\n\r?\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        if (paragraphs.length === 0) {
            return '<p style="color: #667085; font-style: italic;">No manuscript text provided.</p>';
        }

        return paragraphs.map(p => `<p class="manuscript-paragraph">${escapeHTML(p).replace(/\r?\n/g, '<br>')}</p>`).join('');
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
        if (target === 'media') return cat.includes('media') || cat.includes('pubmat') || cat.includes('photo');
        if (target === 'cartoon' || target === 'cartoons') return cat.includes('cartoon');
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
                        <span class="review-box-endorsed"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Approved by <strong>${escapeHTML(resolveEndorser(item))}</strong></span>
                    </div>

                    <button type="button" class="review-box-title" data-action="edit" data-id="${item.id}" title="${escapeHTML(item.title)}">
                        ${escapeHTML(item.title)}
                    </button>
                    ${item.excerpt ? `<p class="review-box-excerpt" style="font-size: 0.85rem; color: #475467; margin: 4px 0 6px 0; line-height: 1.4;">${escapeHTML(item.excerpt)}</p>` : ''}

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
                    <button type="button" class="btn-box-approve" data-action="approve-mpc" data-id="${item.id}" title="Approve">
                        <i class="fa-solid fa-check"></i>
                        <span>Approve</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // =========================================================================
    // 6. ACTION HANDLERS (Without Page Refresh & No Browser Alert/Prompt)
    // =========================================================================
    function approveStoryForMPC(id) {
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

        setTimeout(() => {
            reviewList = reviewList.filter(a => String(a.id) !== String(id));
            savePendingQueue(reviewList);

            if (item.isMediaOrCartoon) {
                // Update in articleCoverReviewQueue_v1 to 'EIC Approved'
                try {
                    const rawQ = localStorage.getItem('articleCoverReviewQueue_v1');
                    if (rawQ) {
                        let queue = JSON.parse(rawQ);
                        if (Array.isArray(queue)) {
                            queue = queue.map(q => (q.id === item.id ? { ...q, status: 'EIC Approved', approvedBy: `${window.LARAVEL_USER_NAME || 'Editor-in-Chief'} (EIC)` } : q));
                            localStorage.setItem('articleCoverReviewQueue_v1', JSON.stringify(queue));
                        }
                    }
                } catch (e) {}

                // Add to approved pool for MPC posting
                try {
                    const rawPool = localStorage.getItem('mpcApprovedCoversPool_v1');
                    let pool = rawPool ? JSON.parse(rawPool) : [];
                    pool = pool.filter(p => p.id !== item.id);
                    pool.unshift({
                        id: item.id,
                        type: item.mediaType || 'pubmat',
                        title: item.title,
                        artist: item.author,
                        image: item.image,
                        status: 'EIC Approved',
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    });
                    localStorage.setItem('mpcApprovedCoversPool_v1', JSON.stringify(pool));
                    localStorage.setItem('mpc_approved_covers_v1', JSON.stringify(pool));
                } catch (e) {}

                // Sync to personal submissions
                try {
                    const subKey = (item.mediaType === 'cartoon') ? 'cartoonistSubmissions_v1' : 'mediaTeamSubmissions_v2';
                    const rawSub = localStorage.getItem(subKey);
                    if (rawSub) {
                        let subs = JSON.parse(rawSub);
                        if (Array.isArray(subs)) {
                            subs = subs.map(s => (s.id === item.id ? { ...s, status: 'EIC Approved' } : s));
                            localStorage.setItem(subKey, JSON.stringify(subs));
                        }
                    }
                } catch (e) {}

                renderReviewBoxes();
                showToast(`"${item.title}" approved and forwarded to M&PC for posting/library.`, 'success');
                return;
            }

            // Backend sync if running on Laravel
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                if (window.__APPROVE_URL__ && csrfToken) {
                    fetch(`${window.__APPROVE_URL__}/${id}/approve`, {
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
                    }).catch(err => console.error('Error approving article on backend:', err));
                }
            } catch (err) {}

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
                const approverName = window.LARAVEL_USER_NAME || localStorage.getItem('userName') || localStorage.getItem('eicName') || 'Editor-in-Chief';
                const approverRole = window.LARAVEL_USER_ROLE || localStorage.getItem('userRole') || localStorage.getItem('eicRole') || 'Editor-in-Chief';

                mpcList = mpcList.filter(a => a.id !== item.id);
                mpcList.unshift({
                    id: item.id,
                    title: item.title,
                    category: item.category,
                    categorySlug: (item.category || 'news').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    author: item.author,
                    sectionHead: resolveEndorser(item),
                    eicApprover: `${approverName} (${approverRole})`,
                    readTime: item.readTime || '3 min read',
                    dateApproved: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    rawDate: item.rawDate || new Date().toISOString().split('T')[0],
                    status: 'ready',
                    assignedCoverId: '',
                    excerpt: item.excerpt || '',
                    body: formatCleanArticleContent(item.content || '<p>Manuscript content approved.</p>')
                });
                localStorage.setItem('mpc_publish_articles_v2', JSON.stringify(mpcList));
            } catch (e) {
                console.error('Failed to forward to MPC publishing queue:', e);
            }

            // Also update writer's article in writer storage
            try {
                const approverRole = window.LARAVEL_USER_ROLE || localStorage.getItem('userRole') || localStorage.getItem('eicRole') || 'Editor-in-Chief';
                const rawWriter = localStorage.getItem('theLensWriterArticles_v3');
                if (rawWriter) {
                    let writerList = JSON.parse(rawWriter);
                    if (Array.isArray(writerList)) {
                        let updated = false;
                        writerList = writerList.map(w => {
                            if (w.id === item.id || w.title === item.title) {
                                updated = true;
                                return { ...w, status: 'Ready for Publishing', remarks: `Approved by ${approverRole}; awaiting cover & publication by M&PC.` };
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
        const item = reviewList.find(a => String(a.id) === String(id));
        if (!item) return;

        const box = document.getElementById(`box-${id}`);
        if (box) {
            box.classList.add('box-fade-out');
        }

        setTimeout(() => {
            reviewList = reviewList.filter(a => String(a.id) !== String(id));
            savePendingQueue(reviewList);

            if (item.isMediaOrCartoon) {
                const targetRecipient = (item.mediaType === 'cartoon') ? 'Cartoonist Head' : 'Media & Public Communications Head';

                // Sync backward status 'Returned for Revision' with remarks to review queue
                try {
                    const rawQ = localStorage.getItem('articleCoverReviewQueue_v1');
                    if (rawQ) {
                        let queue = JSON.parse(rawQ);
                        if (Array.isArray(queue)) {
                            queue = queue.map(q => (q.id === item.id ? { ...q, status: 'Returned for Revision', remarks: remarks } : q));
                            localStorage.setItem('articleCoverReviewQueue_v1', JSON.stringify(queue));
                        }
                    }
                } catch (e) {}

                // Sync to personal submissions
                try {
                    const subKey = (item.mediaType === 'cartoon') ? 'cartoonistSubmissions_v1' : 'mediaTeamSubmissions_v2';
                    const rawSub = localStorage.getItem(subKey);
                    if (rawSub) {
                        let subs = JSON.parse(rawSub);
                        if (Array.isArray(subs)) {
                            subs = subs.map(s => (s.id === item.id ? { ...s, status: 'Returned for Revision', remarks: remarks } : s));
                            localStorage.setItem(subKey, JSON.stringify(subs));
                        }
                    }
                } catch (e) {}

                renderReviewBoxes();
                showToast(`"${item.title}" returned backwards to ${targetRecipient} with remarks.`, 'warning');
                return;
            }

            // Backend sync if running on Laravel
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                if (window.__REVISION_URL__ && csrfToken) {
                    fetch(`${window.__REVISION_URL__}/${id}/revision`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ remarks: remarks })
                    }).catch(err => console.error('Error returning for revision on backend:', err));
                }
            } catch (err) {}

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
        const item = reviewList.find(a => String(a.id) === String(id));
        if (!item) return;

        currentActiveId = id;
        if (modalHeadline) modalHeadline.textContent = item.title || '';
        if (modalSection) modalSection.textContent = item.category;
        if (modalDate) modalDate.textContent = item.date;
        if (modalWriter) modalWriter.textContent = item.author;
        const modalEndorser = document.getElementById('modal-endorser');
        if (modalEndorser) modalEndorser.textContent = resolveEndorser(item);

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

            if (modalRemarks) {
                let cleanRemarks = (item.remarks || '').trim();
                if (/^(?:Endorsed to|Approved by)/i.test(cleanRemarks)) {
                    cleanRemarks = '';
                }
                modalRemarks.value = cleanRemarks;
                modalRemarks.classList.remove('input-invalid');
                modalRemarks.classList.remove('pulse-focus');
            }
            if (remarksErrorMsg) {
                remarksErrorMsg.classList.add('hidden');
            }

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

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const updateBaseUrl = window.__UPDATE_URL__ || '/eic/review-articles';

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

            if (action === 'edit' || action === 'read') {
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

