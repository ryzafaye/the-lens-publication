/**
 * ============================================================================
 * THE LENS — MEDIA & PUBLIC COMMUNICATIONS (M&PC) PUBLISH ARTICLE CONTROLLER
 * Handles article cover assignment and releasing approved manuscripts to the public website
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    const STORAGE_KEY_ARTICLES = 'mpc_publish_articles_v2';
    const STORAGE_KEY_COVERS = 'mpc_approved_covers_v1';

    // -------------------------------------------------------------------------
    // 0. CLEAN WORKFLOW PURGE (Zero mock / hardcoded covers or manuscripts)
    // -------------------------------------------------------------------------
    try {
        const PURGE_FLAG = 'theLens_clean_workflow_zero_mock_v20';
        if (localStorage.getItem(PURGE_FLAG) !== 'true') {
            localStorage.removeItem(STORAGE_KEY_COVERS);
            localStorage.removeItem('mpcApprovedCoversPool_v1');
            localStorage.setItem(STORAGE_KEY_COVERS, JSON.stringify([]));
            localStorage.setItem('mpcApprovedCoversPool_v1', JSON.stringify([]));
            // Also clean assigned covers from stored articles
            const rawA = localStorage.getItem(STORAGE_KEY_ARTICLES);
            if (rawA) {
                try {
                    const parsedA = JSON.parse(rawA);
                    if (Array.isArray(parsedA)) {
                        const cleanedA = parsedA.map(a => ({ ...a, assignedCoverId: '', image: '', banner: '', coverImage: '' }));
                        localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(cleanedA));
                    }
                } catch (err) {}
            }
            localStorage.setItem(PURGE_FLAG, 'true');
        }
    } catch (e) {}

    // -------------------------------------------------------------------------
    // 1. DATASETS (Clean Workflow: Zero Hardcoded Manuscripts & Covers)
    // -------------------------------------------------------------------------
    const defaultCovers = [];
    const defaultArticles = [];

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
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this manuscript.</p>';
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
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this manuscript.</p>';
        }

        return paragraphs.map(p => `<p class="viewer-paragraph">${escapeHTML(p).replace(/\r?\n/g, '<br>')}</p>`).join('');
    }

    // -------------------------------------------------------------------------
    // 2. ARTICLE NORMALIZATION & STORAGE (Supports DB EIC Approvals & LocalStorage)
    // -------------------------------------------------------------------------
    function normalizeArticle(item) {
        if (!item || typeof item !== 'object') return null;

        // Raw status detection
        let rawStatus = String(item.status || item.db_status || '').toLowerCase().trim();
        let normalizedStatus = 'ready';
        if (rawStatus === 'published') {
            normalizedStatus = 'published';
        } else if (rawStatus === 'unpublished') {
            normalizedStatus = 'unpublished';
        } else {
            // 'approved', 'ready', 'ready to publish', 'pending approval', etc.
            normalizedStatus = 'ready';
        }

        // Category
        let cat = 'General';
        if (typeof item.category === 'object' && item.category !== null) {
            cat = item.category.name || 'General';
        } else if (typeof item.category === 'string' && item.category.trim()) {
            cat = item.category.trim();
        }

        // Category slug
        let catSlug = item.categorySlug;
        if (!catSlug) {
            const lowerCat = cat.toLowerCase();
            if (lowerCat.includes('news')) catSlug = 'news';
            else if (lowerCat.includes('opinion')) catSlug = 'opinion';
            else if (lowerCat.includes('feature')) catSlug = 'features';
            else if (lowerCat.includes('sci') || lowerCat.includes('tech')) catSlug = 'scitech';
            else if (lowerCat.includes('liter')) catSlug = 'literature';
            else catSlug = 'news';
        }

        // Author
        let author = item.author;
        if (!author && item.user) {
            author = typeof item.user === 'object' ? (item.user.full_name || 'Staff Writer') : String(item.user);
        }
        if (!author) author = 'Staff Writer';

        // Endorser / Section Head
        let sectionHead = item.sectionHead;
        if (!sectionHead) {
            if (item.endorser) {
                sectionHead = `Approved by ${item.endorser}`;
            } else if (item.endorsedBy) {
                sectionHead = `Approved by ${item.endorsedBy}`;
            } else {
                sectionHead = 'Endorsed by Section Head';
            }
        }

        // Date Approved
        let dateApproved = item.dateApproved || item.date || item.updated_at || item.created_at;
        if (dateApproved && typeof dateApproved === 'string' && dateApproved.includes('T')) {
            try {
                dateApproved = new Date(dateApproved).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            } catch (e) {}
        }
        if (!dateApproved) {
            dateApproved = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        let rawDate = item.rawDate || item.updated_at || item.created_at || new Date().toISOString();

        // Body / Content (Check item, then fallback to theLensWriterArticles_v3 for complete manuscript)
        let bodyText = item.body || item.content || '';
        if (!bodyText || bodyText === '<p>Manuscript content approved.</p>') {
            try {
                const rawWriter = localStorage.getItem('theLensWriterArticles_v3');
                if (rawWriter) {
                    const writerList = JSON.parse(rawWriter);
                    if (Array.isArray(writerList)) {
                        const match = writerList.find(w => String(w.id) === String(item.id) || (w.title && item.title && w.title.trim().toLowerCase() === item.title.trim().toLowerCase()));
                        if (match && (match.body || match.content)) {
                            bodyText = match.body || match.content;
                        }
                    }
                }
            } catch (e) {}
        }
        let body = formatCleanArticleContent(bodyText || '<p>Manuscript content approved.</p>');

        return {
            id: item.id,
            title: item.title || 'Untitled Manuscript',
            category: cat,
            categorySlug: catSlug,
            author: author,
            sectionHead: sectionHead,
            eicApprover: item.eicApprover || 'Approved by Editor-in-Chief',
            readTime: item.readTime || '3 min read',
            dateApproved: dateApproved,
            rawDate: rawDate,
            status: normalizedStatus,
            assignedCoverId: item.assignedCoverId || '',
            excerpt: item.excerpt || '',
            body: body,
            publishedAt: item.publishedAt || null
        };
    }

    function loadArticles() {
        let list = [];
        let sourceList = null;

        if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA)) {
            sourceList = window.INITIAL_DATA;
        } else if (window.INITIAL_ARTICLES && Array.isArray(window.INITIAL_ARTICLES)) {
            sourceList = window.INITIAL_ARTICLES;
        } else if (window.LARAVEL_ARTICLES && Array.isArray(window.LARAVEL_ARTICLES)) {
            sourceList = window.LARAVEL_ARTICLES;
        }

        if (sourceList && sourceList.length > 0) {
            list = sourceList.map(normalizeArticle).filter(Boolean);
        }

        // Merge with localStorage articles (from EIC review or prior local actions)
        try {
            const raw = localStorage.getItem(STORAGE_KEY_ARTICLES);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    parsed.forEach(stored => {
                        const normalizedStored = normalizeArticle(stored);
                        if (!normalizedStored) return;
                        const existingIdx = list.findIndex(a => String(a.id) === String(normalizedStored.id));
                        if (existingIdx >= 0) {
                            if (stored.assignedCoverId && !list[existingIdx].assignedCoverId) {
                                list[existingIdx].assignedCoverId = stored.assignedCoverId;
                            }
                            if (stored.status === 'published' && list[existingIdx].status !== 'published') {
                                list[existingIdx].status = stored.status;
                                list[existingIdx].publishedAt = stored.publishedAt;
                            }
                        } else {
                            list.push(normalizedStored);
                        }
                    });
                }
            }
        } catch (e) {
            console.warn('Storage read failed', e);
        }

        return list;
    }

    function saveArticles(list) {
        try {
            localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(list));
        } catch (e) {
            console.warn('Storage write failed', e);
        }
    }

    function cleanArtistName(name) {
        if (!name) return '';
        return String(name).replace(/\s*\([^)]*\)/g, '').trim();
    }

    function loadCovers() {
        let covers = [];
        const seenIds = new Set();

        function addCover(item) {
            if (!item || !item.id || !item.image) return;

            // Strictly require EIC approval or Published status
            const s = (item.status || '').toLowerCase().trim();
            if (s !== 'eic approved' && s !== 'approved' && s !== 'approved_for_mpc' && s !== 'published') {
                return;
            }

            // Reject any hardcoded or mock image paths
            if (typeof item.image === 'string') {
                const img = item.image.trim();
                if (img.includes('images/') || img.includes('covers/') || img.includes('maroon.jpg') || img.includes('portal-pubmat') || img.includes('election-guidelines') || img.includes('faculty-overload') || img.includes('press-freedom')) {
                    return;
                }
                if (!img.startsWith('data:image/') && !img.startsWith('/storage/') && !img.startsWith('http')) {
                    return;
                }
            }

            const idStr = String(item.id);
            if (idStr.includes('mock') || idStr.includes('sample') || idStr.includes('seed') || idStr.includes('default')) {
                return;
            }

            if (seenIds.has(idStr)) {
                const existing = covers.find(c => String(c.id) === idStr);
                if (existing) {
                    if (!existing.image && item.image) existing.image = item.image;
                    if (!existing.artist && item.artist) existing.artist = cleanArtistName(item.artist);
                    if (!existing.approvedBy && (item.approvedBy || item.endorsedBy)) {
                        existing.approvedBy = item.approvedBy || item.endorsedBy;
                    }
                    if (!existing.type && item.type) existing.type = item.type.toLowerCase();
                }
                return;
            }
            seenIds.add(idStr);
            covers.push({
                id: idStr,
                type: (item.type || 'pubmat').toLowerCase(),
                title: item.title || 'Approved Visual Asset',
                artist: cleanArtistName(item.artist || 'Media Team Member'),
                approvedBy: item.approvedBy || item.endorsedBy || 'Editor-in-Chief (EIC)',
                image: item.image,
                date: item.date || 'Recent',
                status: item.status || 'EIC Approved'
            });
        }

        // 1. Live Article Review Queue (where M&PC and EIC review and approve media)
        try {
            const rawReview = localStorage.getItem('articleCoverReviewQueue_v1');
            if (rawReview) {
                const parsedReview = JSON.parse(rawReview);
                if (Array.isArray(parsedReview)) {
                    parsedReview.forEach(r => {
                        const s = (r.status || '').toLowerCase().trim();
                        if (s === 'eic approved' || s === 'approved' || s === 'approved_for_mpc' || s === 'published') {
                            addCover(r);
                        }
                    });
                }
            }
        } catch (e) {}

        // 2. M&PC Approved Covers Storage (only genuine EIC approved covers)
        try {
            const raw = localStorage.getItem(STORAGE_KEY_COVERS);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    parsed.forEach(c => {
                        const s = (c.status || '').toLowerCase().trim();
                        if (s === 'eic approved' || s === 'approved' || s === 'approved_for_mpc' || s === 'published') {
                            addCover(c);
                        }
                    });
                }
            }
        } catch (e) {}

        // 3. M&PC Approved Covers Pool (only genuine EIC approved covers)
        try {
            const rawPool = localStorage.getItem('mpcApprovedCoversPool_v1');
            if (rawPool) {
                const parsed = JSON.parse(rawPool);
                if (Array.isArray(parsed)) {
                    parsed.forEach(p => {
                        const s = (p.status || '').toLowerCase().trim();
                        if (s === 'eic approved' || s === 'approved' || s === 'approved_for_mpc' || s === 'published') {
                            addCover(p);
                        }
                    });
                }
            }
        } catch (e) {}

        // 4. Media Team Submissions (Approved / Published)
        try {
            const rawMedia = localStorage.getItem('mediaTeamSubmissions_v2');
            if (rawMedia) {
                const parsed = JSON.parse(rawMedia);
                if (Array.isArray(parsed)) {
                    parsed.forEach(m => {
                        const s = (m.status || '').toLowerCase().trim();
                        if (s === 'eic approved' || s === 'published') {
                            addCover(m);
                        }
                    });
                }
            }
        } catch (e) {}

        // 5. Cartoonist Submissions (Approved / Published)
        try {
            const rawCart = localStorage.getItem('cartoonistSubmissions_v1');
            if (rawCart) {
                const parsed = JSON.parse(rawCart);
                if (Array.isArray(parsed)) {
                    parsed.forEach(c => {
                        const s = (c.status || '').toLowerCase().trim();
                        if (s === 'eic approved' || s === 'published') {
                            addCover(c);
                        }
                    });
                }
            }
        } catch (e) {}

        // 6. Window initial covers
        if (window.INITIAL_COVERS && Array.isArray(window.INITIAL_COVERS)) {
            window.INITIAL_COVERS.forEach(addCover);
        }

        return covers;
    }

    let coversList = loadCovers();
    let articlesList = loadArticles();

    // Validate assigned covers: clear any phantom or non-existent cover references
    articlesList.forEach(a => {
        if (a.assignedCoverId && !coversList.some(c => String(c.id) === String(a.assignedCoverId))) {
            a.assignedCoverId = '';
            a.image = '';
            a.coverImage = '';
            a.banner = '';
        }
    });

    let activeView = 'ready'; // 'ready' | 'published' | 'unpublished' | 'covers'
    let activeCategory = 'all'; // 'all' | 'news' | 'opinion' | 'features' | 'scitech' | 'literature'
    let currentSort = 'newest';
    let targetAssignArticleId = null;
    let selectedCoverIdInModal = null;
    let activeCoverFilterInModal = 'all';

    // DOM References
    const statsReady = document.getElementById('stat-ready-count');
    const statsPublished = document.getElementById('stat-published-count');

    const badgeTabReady = document.getElementById('badge-tab-ready');
    const badgeTabPublished = document.getElementById('badge-tab-published');
    const badgeTabUnpublished = document.getElementById('badge-tab-unpublished');
    const badgeTabCovers = document.getElementById('badge-tab-covers');

    const articlesGrid = document.getElementById('mpc-articles-grid');
    const coversLibraryView = document.getElementById('mpc-covers-library-view');
    const coversLibraryGrid = document.getElementById('mpc-covers-library-grid');

    const coverModal = document.getElementById('assign-cover-modal');
    const closeCoverModalBtn = document.getElementById('close-cover-modal-btn');
    const cancelCoverModalBtn = document.getElementById('cancel-cover-modal-btn');
    const confirmCoverModalBtn = document.getElementById('confirm-cover-modal-btn');
    const modalTargetArticleTitle = document.getElementById('modal-target-article-title');
    const modalCoverGallery = document.getElementById('modal-cover-gallery');

    const readerModal = document.getElementById('manuscript-viewer-modal');
    const closeReaderBtn = document.getElementById('close-reader-btn');
    const closeReaderFooterBtn = document.getElementById('close-reader-footer-btn');
    const readerCategory = document.getElementById('reader-category');
    const readerTitle = document.getElementById('reader-title');
    const readerAuthor = document.getElementById('reader-author');
    const readerAuthorAvatar = document.getElementById('reader-author-avatar');
    const readerDate = document.getElementById('reader-date');
    const readerReadTime = document.getElementById('reader-read-time');
    const readerEndorsements = document.getElementById('reader-endorsements');
    const readerExcerpt = document.getElementById('reader-excerpt');
    const readerCoverWrap = document.getElementById('reader-cover-wrap');
    const readerCoverImg = document.getElementById('reader-cover-img');
    const readerCoverBadge = document.getElementById('reader-cover-badge');
    const readerBody = document.getElementById('reader-body');
    const readerAssignBtn = document.getElementById('reader-action-assign');
    const readerAssignLabel = document.getElementById('reader-assign-label');
    const readerPublishBtn = document.getElementById('reader-action-publish');
    const readerPublishLabel = document.getElementById('reader-publish-label');

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
    // 4. STATS & BADGES
    // -------------------------------------------------------------------------
    function updateStats() {
        const readyCount = articlesList.filter(a => a.status === 'ready').length;
        const publishedCount = articlesList.filter(a => a.status === 'published').length;
        const unpublishedCount = articlesList.filter(a => a.status === 'unpublished').length;
        const coversCount = coversList ? coversList.length : 0;

        if (statsReady) statsReady.textContent = readyCount;
        if (statsPublished) statsPublished.textContent = publishedCount;

        if (badgeTabReady) badgeTabReady.textContent = readyCount;
        if (badgeTabPublished) badgeTabPublished.textContent = publishedCount;
        if (badgeTabUnpublished) badgeTabUnpublished.textContent = unpublishedCount;
        if (badgeTabCovers) badgeTabCovers.textContent = coversCount;
    }

    // -------------------------------------------------------------------------
    // 5. VIEW TABS & CATEGORY FILTERS
    // -------------------------------------------------------------------------
    const viewTabBtns = document.querySelectorAll('.mpc-view-tab-btn[data-view]');
    viewTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewTabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            activeView = btn.dataset.view;
            render();
        });
    });

    const categoryPills = document.querySelectorAll('.mpc-category-pill[data-category]');
    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeCategory = pill.dataset.category;
            render();
        });
    });

    let searchQuery = '';
    const searchInput = document.getElementById('mpc-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            render();
        });
    }

    const sortSelect = document.getElementById('mpc-sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            render();
        });
    }

    // -------------------------------------------------------------------------
    // 6. CARD RENDERING
    // -------------------------------------------------------------------------
    function render() {
        coversList = loadCovers();
        updateStats();

        // 1. If viewing the Covers Library
        if (activeView === 'covers') {
            if (articlesGrid) articlesGrid.style.display = 'none';
            if (coversLibraryView) coversLibraryView.style.display = 'block';
            renderCoversLibrary();
            return;
        }

        // 2. Otherwise viewing Ready to Publish, Published, or Unpublished Articles
        if (coversLibraryView) coversLibraryView.style.display = 'none';
        if (articlesGrid) articlesGrid.style.display = 'flex';

        let list = articlesList.filter(a => a.status === activeView);

        if (activeCategory !== 'all') {
            list = list.filter(a => a.categorySlug === activeCategory);
        }

        if (searchQuery) {
            list = list.filter(a => 
                (a.title && a.title.toLowerCase().includes(searchQuery)) ||
                (a.author && a.author.toLowerCase().includes(searchQuery)) ||
                (a.category && a.category.toLowerCase().includes(searchQuery))
            );
        }

        // Sort by date (newest first or oldest first)
        list.sort((a, b) => {
            const timeA = new Date(a.rawDate || a.dateApproved || a.date).getTime();
            const timeB = new Date(b.rawDate || b.dateApproved || b.date).getTime();
            if (currentSort === 'oldest') {
                return timeA - timeB;
            }
            return timeB - timeA;
        });

        if (list.length === 0) {
            let iconClass = 'fa-solid fa-feather-pointed';
            let emptyTitleText = 'No Articles Awaiting Publication';

            if (searchQuery || activeCategory !== 'all') {
                iconClass = 'fa-solid fa-magnifying-glass';
                emptyTitleText = 'No Matching Articles Found';
            } else if (activeView === 'published') {
                iconClass = 'fa-solid fa-globe';
                emptyTitleText = 'No Published Articles';
            } else if (activeView === 'unpublished') {
                iconClass = 'fa-solid fa-box-archive';
                emptyTitleText = 'No Unpublished Articles';
            }

            if (articlesGrid) {
                articlesGrid.innerHTML = `
                    <div class="mpc-tab-empty-state" style="width: 100%; text-align: center; padding: 56px 20px; background: #ffffff; border: 1px dashed var(--border-subtle, #eaecf0); border-radius: 12px; margin-top: 10px;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: #fdf2f4; color: var(--sidebar-maroon, #5c0a18); display: inline-flex; align-items: center; justify-content: center; font-size: 1.25rem; margin-bottom: 14px;">
                            <i class="${iconClass}"></i>
                        </div>
                        <h3 style="font-family: var(--font-heading, 'Newsreader', serif); font-size: 1.15rem; font-weight: 700; color: #101828; margin: 0;">${emptyTitleText}</h3>
                    </div>
                `;
            }
            return;
        }

        articlesGrid.innerHTML = list.map(item => {
            const assignedCover = coversList.find(c => String(c.id) === String(item.assignedCoverId)) || (item.image ? { image: item.image, artist: item.coverArtist || 'Media Team Member', type: item.coverType || 'pubmat' } : null);

            return `
                <div class="mpc-publish-card" id="card-${item.id}" data-id="${item.id}">
                    <div class="mpc-card-main-content">
                        
                        <!-- Left Cover Slot -->
                        <div class="mpc-cover-slot">
                            <div class="mpc-cover-preview-box" data-action="assign-cover" data-id="${item.id}" title="Click to assign or change cover">
                                ${assignedCover ? `
                                    <img src="${escapeHTML(assignedCover.image)}" alt="Cover Preview" class="mpc-cover-preview-img">
                                    <span class="mpc-cover-meta-badge">${escapeHTML(assignedCover.type.toUpperCase())}</span>
                                ` : `
                                    <div class="mpc-cover-empty">
                                        <i class="fa-regular fa-image"></i>
                                        <span>No Cover Assigned</span>
                                    </div>
                                `}
                            </div>
                            ${assignedCover ? `
                                <div class="mpc-cover-artist-note">
                                    <i class="fa-solid fa-paintbrush"></i>
                                    <span>Cover by: <strong>${escapeHTML(assignedCover.artist)}</strong></span>
                                </div>
                            ` : `
                                <div class="mpc-cover-artist-note" style="color: #b54708;">
                                    <i class="fa-solid fa-triangle-exclamation"></i>
                                    <span>Requires cover to publish</span>
                                </div>
                            `}
                        </div>

                        <!-- Right Text & Endorsement Stack -->
                        <div class="mpc-article-details">
                            <div class="mpc-meta-top-row">
                                <span class="mpc-category-tag">${escapeHTML(item.category)}</span>
                                <span style="color: #98a2b3;">&bull;</span>
                                <span style="color: #667085; font-weight: 500;"><i class="fa-regular fa-calendar"></i> Approved: ${escapeHTML(item.dateApproved)}</span>
                            </div>

                            <h2 class="mpc-article-headline" data-action="read" data-id="${item.id}" style="cursor: pointer;" title="Click to read manuscript">${escapeHTML(item.title)}</h2>

                            <div class="mpc-byline-row">
                                <i class="fa-solid fa-pen-nib"></i>
                                <span>Author: <strong>${escapeHTML(item.author)}</strong></span>
                            </div>

                            <!-- Endorsement History -->
                            <div class="mpc-endorsements-bar">
                                <span class="mpc-endorsement-badge">
                                    <i class="fa-solid fa-circle-check"></i>
                                    <span>${escapeHTML(item.sectionHead)}</span>
                                </span>
                                <span class="mpc-endorsement-badge eic">
                                    <i class="fa-solid fa-stamp"></i>
                                    <span>${escapeHTML(item.eicApprover)}</span>
                                </span>
                            </div>
                        </div>

                    </div>

                    <!-- Card Action Footer -->
                    <div class="mpc-card-footer">
                        <div>
                            ${item.status === 'published' ? `
                                <span class="mpc-status-live-indicator live">
                                    <span>Live on Public Website (Published ${escapeHTML(item.publishedAt || item.dateApproved)})</span>
                                </span>
                            ` : item.status === 'unpublished' ? `
                                <span class="mpc-status-live-indicator unpublished">
                                    <i class="fa-solid fa-box-archive"></i>
                                    <span>Unpublished &bull; Staged for Re-release</span>
                                </span>
                            ` : `
                                <span class="mpc-status-live-indicator pending">
                                    <i class="fa-solid fa-hourglass-half"></i>
                                    <span>Pending Release by M&amp;PC</span>
                                </span>
                            `}
                        </div>

                        <div class="mpc-footer-actions">
                            ${item.status === 'published' ? `
                                <button type="button" class="btn-mpc-read" data-action="read" data-id="${item.id}">
                                    <i class="fa-regular fa-file-lines"></i>
                                    <span>Read Article</span>
                                </button>
                                <button type="button" class="btn-mpc-unpublish" data-action="unpublish" data-id="${item.id}">
                                    <i class="fa-solid fa-arrow-rotate-left"></i>
                                    <span>Unpublish</span>
                                </button>
                            ` : item.status === 'unpublished' ? `
                                <button type="button" class="btn-mpc-read" data-action="read" data-id="${item.id}">
                                    <i class="fa-regular fa-file-lines"></i>
                                    <span>Read Article</span>
                                </button>
                                <button type="button" class="btn-mpc-assign" data-action="assign-cover" data-id="${item.id}">
                                    <i class="fa-solid fa-palette"></i>
                                    <span>${assignedCover ? 'Change Cover' : 'Assign Cover'}</span>
                                </button>
                                <button type="button" class="btn-mpc-publish" data-action="publish" data-id="${item.id}">
                                    <i class="fa-solid fa-globe"></i>
                                    <span>Republish</span>
                                </button>
                            ` : `
                                <button type="button" class="btn-mpc-read" data-action="read" data-id="${item.id}">
                                    <i class="fa-regular fa-file-lines"></i>
                                    <span>Read Article</span>
                                </button>

                                <button type="button" class="btn-mpc-assign" data-action="assign-cover" data-id="${item.id}">
                                    <i class="fa-solid fa-palette"></i>
                                    <span>${assignedCover ? 'Change Cover' : 'Assign Cover'}</span>
                                </button>

                                <button type="button" class="btn-mpc-return" data-action="return-revision" data-id="${item.id}" style="padding: 7px 14px; font-size: 0.8rem; font-weight: 600; border-radius: 8px; border: 1px solid #fecdca; background: #fff5f5; color: #b42318; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                                    <i class="fa-solid fa-rotate-left"></i>
                                    <span>For Revision</span>
                                </button>

                                <button type="button" class="btn-mpc-publish" data-action="publish" data-id="${item.id}">
                                    <i class="fa-solid fa-globe"></i>
                                    <span>Publish to Website</span>
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // -------------------------------------------------------------------------
    // 7. COVERS LIBRARY VIEW RENDERING
    // -------------------------------------------------------------------------
    function renderCoversLibrary() {
        if (!coversLibraryGrid) return;

        if (!coversList || coversList.length === 0) {
            coversLibraryGrid.innerHTML = `
                <div class="mpc-tab-empty-state" style="grid-column: 1 / -1; width: 100%; text-align: center; padding: 56px 20px; background: #ffffff; border: 1px dashed var(--border-subtle, #eaecf0); border-radius: 12px; margin-top: 10px;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: #fdf2f4; color: var(--sidebar-maroon, #5c0a18); display: inline-flex; align-items: center; justify-content: center; font-size: 1.25rem; margin-bottom: 14px;">
                        <i class="fa-regular fa-image"></i>
                    </div>
                    <h3 style="font-family: var(--font-heading, 'Newsreader', serif); font-size: 1.15rem; font-weight: 700; color: #101828; margin: 0;">No Approved Artwork Available</h3>
                </div>
            `;
            return;
        }

        coversLibraryGrid.innerHTML = coversList.map(cover => `
            <div class="mpc-gallery-item" style="cursor: default;">
                <div class="mpc-gallery-thumb-wrap">
                    <img src="${escapeHTML(cover.image)}" alt="Artwork Cover" class="mpc-gallery-thumb-img">
                    <span class="mpc-cover-meta-badge">${escapeHTML(cover.type.toUpperCase())}</span>
                </div>
                <div class="mpc-gallery-item-body">
                    <div class="mpc-gallery-artist">
                        <i class="fa-solid fa-paintbrush"></i>
                        <span>${escapeHTML(cover.artist)}</span>
                    </div>
                    <div class="mpc-gallery-head">
                        <i class="fa-solid fa-circle-check"></i>
                        <span>${escapeHTML(cover.approvedBy)}</span>
                    </div>
                    <div style="font-size: 0.70rem; color: #667085; margin-top: 2px;">
                        <i class="fa-regular fa-calendar"></i> Approved: ${escapeHTML(cover.date)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // -------------------------------------------------------------------------
    // 8. COVER SELECTION MODAL LOGIC
    // -------------------------------------------------------------------------
    function openCoverModal(articleId) {
        coversList = loadCovers();
        updateStats();

        const article = articlesList.find(a => String(a.id) === String(articleId));
        if (!article) return;

        targetAssignArticleId = articleId;
        selectedCoverIdInModal = article.assignedCoverId ? String(article.assignedCoverId) : null;

        if (modalTargetArticleTitle) {
            modalTargetArticleTitle.textContent = article.title;
        }

        renderModalGallery();

        if (coverModal) {
            coverModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeCoverModal() {
        if (coverModal) {
            coverModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
        targetAssignArticleId = null;
        selectedCoverIdInModal = null;
    }

    function renderModalGallery() {
        if (!modalCoverGallery) return;

        let filtered = coversList;
        if (activeCoverFilterInModal !== 'all') {
            if (activeCoverFilterInModal === 'cartoon') {
                filtered = filtered.filter(c => c.type === 'cartoon' || c.type === 'cartoons');
            } else if (activeCoverFilterInModal === 'photo') {
                filtered = filtered.filter(c => c.type === 'photo' || c.type === 'photos' || c.type === 'pubmat');
            } else if (activeCoverFilterInModal === 'pubmat') {
                filtered = filtered.filter(c => c.type === 'pubmat' || c.type === 'photo' || c.type === 'photos');
            } else {
                filtered = filtered.filter(c => c.type === activeCoverFilterInModal);
            }
        }

        if (!filtered || filtered.length === 0) {
            modalCoverGallery.innerHTML = `
                <div class="empty-state-cell" style="grid-column: 1 / -1; text-align: center; color: #667085; padding: 36px 16px;">
                    <i class="fa-regular fa-image" style="font-size: 1.8rem; color: #98a2b3; margin-bottom: 8px; display: block;"></i>
                    <p style="font-size: 0.85rem; color: #667085; margin: 0;">No approved visual covers available in this format yet.</p>
                </div>
            `;
            return;
        }

        modalCoverGallery.innerHTML = filtered.map(cover => {
            const isSelected = (String(cover.id) === String(selectedCoverIdInModal));
            return `
                <div class="mpc-gallery-item ${isSelected ? 'selected' : ''}" data-cover-id="${cover.id}">
                    <div class="mpc-gallery-thumb-wrap">
                        <img src="${escapeHTML(cover.image)}" alt="Cover Asset" class="mpc-gallery-thumb-img">
                        <span class="mpc-cover-meta-badge">${escapeHTML((cover.type || 'pubmat').toUpperCase())}</span>
                    </div>
                    <div class="mpc-gallery-item-body">
                        <div class="mpc-gallery-artist">
                            <i class="fa-solid fa-paintbrush"></i>
                            <span>${escapeHTML(cover.artist)}</span>
                        </div>
                        <div class="mpc-gallery-head">
                            <i class="fa-solid fa-circle-check"></i>
                            <span>${escapeHTML(cover.approvedBy)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Cover gallery item selection
    if (modalCoverGallery) {
        modalCoverGallery.addEventListener('click', (e) => {
            const item = e.target.closest('.mpc-gallery-item');
            if (!item) return;

            const coverId = item.dataset.coverId;
            selectedCoverIdInModal = coverId;

            modalCoverGallery.querySelectorAll('.mpc-gallery-item').forEach(el => {
                el.classList.toggle('selected', String(el.dataset.coverId) === String(coverId));
            });
        });
    }

    // Modal type filter pills (All / PUBMAT / PHOTOS / CARTOON)
    const modalPills = document.querySelectorAll('.mpc-modal-pill[data-cover-type]');
    modalPills.forEach(pill => {
        pill.addEventListener('click', () => {
            modalPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeCoverFilterInModal = pill.dataset.coverType;
            renderModalGallery();
        });
    });

    if (closeCoverModalBtn) closeCoverModalBtn.addEventListener('click', closeCoverModal);
    if (cancelCoverModalBtn) cancelCoverModalBtn.addEventListener('click', closeCoverModal);

    if (confirmCoverModalBtn) {
        confirmCoverModalBtn.addEventListener('click', () => {
            if (!targetAssignArticleId) return;

            const article = articlesList.find(a => String(a.id) === String(targetAssignArticleId));
            if (!article) return;

            const chosenCover = coversList.find(c => String(c.id) === String(selectedCoverIdInModal));

            if (chosenCover) {
                article.assignedCoverId = String(chosenCover.id);
                article.image = chosenCover.image;
                article.coverImage = chosenCover.image;
                article.banner = chosenCover.image;
                article.coverArtist = chosenCover.artist;
                article.coverType = chosenCover.type;
            } else {
                article.assignedCoverId = '';
                article.image = '';
                article.coverImage = '';
                article.banner = '';
                article.coverArtist = '';
                article.coverType = '';
            }

            saveArticles(articlesList);
            closeCoverModal();
            render();

            if (chosenCover) {
                // Log activity (Executive sentence parity)
                try {
                    const rawLogs = localStorage.getItem('mpcActivityLogs_v1');
                    let logs = rawLogs ? JSON.parse(rawLogs) : [];
                    if (!Array.isArray(logs)) logs = [];
                    const now = new Date();
                    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    logs.unshift({
                        id: 'mpc-act-' + Date.now(),
                        causer: window.LARAVEL_USER_NAME || localStorage.getItem('mpcName') || 'M&PC Officer',
                        causerRole: window.LARAVEL_USER_ROLE || localStorage.getItem('mpcRole') || 'M&PC Head',
                        causerAvatar: window.LARAVEL_USER_AVATAR || 'images/member-placeholder.svg',
                        action: 'assigned',
                        subjectType: `Cover ${(chosenCover.type || 'pubmat').toUpperCase()} to Article`,
                        subjectName: article.title,
                        timestampText: 'Just now',
                        isoDate: now.toISOString(),
                        dateKey: now.toISOString().split('T')[0],
                        formattedDate: `${dateStr} • ${timeStr}`,
                        dayGroup: 'Today'
                    });
                    localStorage.setItem('mpcActivityLogs_v1', JSON.stringify(logs.slice(0, 40)));
                } catch (e) {}

                showToast(`Attached ${(chosenCover.type || 'pubmat').toUpperCase()} by ${chosenCover.artist} to "${article.title.substring(0, 36)}...".`, 'success');
            } else {
                showToast(`Cover removed from "${article.title.substring(0, 36)}...".`, 'warning');
            }
        });
    }

    // -------------------------------------------------------------------------
    // 9. PUBLISH & UNPUBLISH WORKFLOWS
    // -------------------------------------------------------------------------
    function publishArticle(articleId) {
        const article = articlesList.find(a => String(a.id) === String(articleId));
        if (!article) return;

        // Validation: If covers exist in the library, require one to be assigned before publishing
        if (!article.assignedCoverId && coversList.length > 0) {
            showToast('Cannot publish: Please assign an approved cover photo or artwork first.', 'warning');
            openCoverModal(articleId);
            return;
        }

        const card = document.getElementById(`card-${articleId}`);
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(-10px) scale(0.98)';
        }

        setTimeout(() => {
            article.status = 'published';
            article.isArchived = false;
            article.archived = false;
            article.publishedAt = new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            // Attach actual cover image from coversList
            const chosenCover = coversList.find(c => String(c.id) === String(article.assignedCoverId));
            if (chosenCover && chosenCover.image) {
                article.image = chosenCover.image;
                article.coverImage = chosenCover.image;
                article.banner = chosenCover.image;
                article.coverArtist = chosenCover.artist;
                article.coverType = chosenCover.type;
            }

            // Sync to theLensPublishedArticles so public site immediately displays it!
            try {
                let pubList = [];
                const rawPub = localStorage.getItem('theLensPublishedArticles');
                if (rawPub) {
                    const parsed = JSON.parse(rawPub);
                    if (Array.isArray(parsed)) pubList = parsed;
                }
                pubList = pubList.filter(p => p.id !== article.id);
                pubList.unshift({
                    ...article,
                    status: 'published',
                    isArchived: false,
                    archived: false,
                    image: article.image || '',
                    content: article.body || article.content || ''
                });
                localStorage.setItem('theLensPublishedArticles', JSON.stringify(pubList));
            } catch (e) {}

            // Update writer's article in writer storage to 'Published'
            try {
                const rawWriter = localStorage.getItem('theLensWriterArticles_v3');
                if (rawWriter) {
                    let writerList = JSON.parse(rawWriter);
                    if (Array.isArray(writerList)) {
                        let updated = false;
                        writerList = writerList.map(w => {
                            if (w.id === article.id || w.title === article.title) {
                                updated = true;
                                return { ...w, status: 'Published', views: w.views || 0, remarks: '' };
                            }
                            return w;
                        });
                        if (updated) localStorage.setItem('theLensWriterArticles_v3', JSON.stringify(writerList));
                    }
                }
            } catch (e) {}

            // Log activity (Executive sentence parity)
            try {
                const rawLogs = localStorage.getItem('mpcActivityLogs_v1');
                let logs = rawLogs ? JSON.parse(rawLogs) : [];
                if (!Array.isArray(logs)) logs = [];
                const now = new Date();
                const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                logs.unshift({
                    id: 'mpc-act-' + Date.now(),
                    causer: window.LARAVEL_USER_NAME || localStorage.getItem('mpcName') || 'M&PC Officer',
                    causerRole: window.LARAVEL_USER_ROLE || localStorage.getItem('mpcRole') || 'M&PC Head',
                    causerAvatar: window.LARAVEL_USER_AVATAR || 'images/member-placeholder.svg',
                    action: 'published',
                    subjectType: 'Article',
                    subjectName: article.title,
                    timestampText: 'Just now',
                    isoDate: now.toISOString(),
                    dateKey: now.toISOString().split('T')[0],
                    formattedDate: `${dateStr} • ${timeStr}`,
                    dayGroup: 'Today'
                });
                localStorage.setItem('mpcActivityLogs_v1', JSON.stringify(logs.slice(0, 40)));
            } catch (e) {}

            // Backend sync if running on Laravel
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                if (csrfToken && article.id) {
                    fetch(`/mpc/articles/${article.id}/publish`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            cover_id: article.assignedCoverId || null
                        })
                    }).catch(err => console.warn('Backend publish sync failed:', err));
                }
            } catch (err) {}

            saveArticles(articlesList);
            render();
            showToast(`Article successfully published to the public website!`, 'success');
        }, 240);
    }

    function unpublishArticle(articleId) {
        const article = articlesList.find(a => a.id === articleId);
        if (!article) return;

        article.status = 'unpublished';
        article.unpublishedAt = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Sync to theLensPublishedArticles (remove from public list)
        try {
            let pubList = [];
            const rawPub = localStorage.getItem('theLensPublishedArticles');
            if (rawPub) {
                const parsed = JSON.parse(rawPub);
                if (Array.isArray(parsed)) {
                    pubList = parsed.filter(p => p.id !== article.id);
                    localStorage.setItem('theLensPublishedArticles', JSON.stringify(pubList));
                }
            }
        } catch (e) {}

        // Update writer's article in writer storage
        try {
            const rawWriter = localStorage.getItem('theLensWriterArticles_v3');
            if (rawWriter) {
                let writerList = JSON.parse(rawWriter);
                if (Array.isArray(writerList)) {
                    let updated = false;
                    writerList = writerList.map(w => {
                        if (w.id === article.id || w.title === article.title) {
                            updated = true;
                            return { ...w, status: 'Ready for Publishing' };
                        }
                        return w;
                    });
                    if (updated) localStorage.setItem('theLensWriterArticles_v3', JSON.stringify(writerList));
                }
            }
        } catch (e) {}

        // Log activity (Executive sentence parity)
        try {
            const rawLogs = localStorage.getItem('mpcActivityLogs_v1');
            let logs = rawLogs ? JSON.parse(rawLogs) : [];
            if (!Array.isArray(logs)) logs = [];
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            logs.unshift({
                id: 'mpc-act-' + Date.now(),
                causer: window.LARAVEL_USER_NAME || localStorage.getItem('mpcName') || 'M&PC Officer',
                causerRole: window.LARAVEL_USER_ROLE || localStorage.getItem('mpcRole') || 'M&PC Head',
                causerAvatar: window.LARAVEL_USER_AVATAR || 'images/member-placeholder.svg',
                action: 'unpublished',
                subjectType: 'Article',
                subjectName: article.title,
                timestampText: 'Just now',
                isoDate: now.toISOString(),
                dateKey: now.toISOString().split('T')[0],
                formattedDate: `${dateStr} • ${timeStr}`,
                dayGroup: 'Today'
            });
            localStorage.setItem('mpcActivityLogs_v1', JSON.stringify(logs.slice(0, 40)));
        } catch (e) {}

        // Backend sync if running on Laravel
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (csrfToken && article.id) {
                fetch(`/mpc/articles/${article.id}/unpublish`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json'
                    }
                }).catch(err => console.warn('Backend unpublish sync failed:', err));
            }
        } catch (err) {}

        saveArticles(articlesList);
        render();
        showToast(`Article unpublished and moved to the Unpublished tab.`, 'warning');
    }

    // -------------------------------------------------------------------------
    // 10. MANUSCRIPT VIEWER MODAL
    // -------------------------------------------------------------------------
    let activeReadingArticleId = null;

    function openManuscriptModal(articleId) {
        const article = articlesList.find(a => String(a.id) === String(articleId));
        if (!article) return;

        activeReadingArticleId = String(article.id);

        if (readerCategory) readerCategory.textContent = (article.category || 'General').toUpperCase();
        if (readerTitle) readerTitle.textContent = article.title || 'Untitled Manuscript';
        if (readerAuthor) readerAuthor.textContent = article.author || 'Staff Writer';
        if (readerDate) readerDate.textContent = `Approved: ${article.dateApproved || 'Recently'}`;
        if (readerReadTime) readerReadTime.textContent = article.readTime || '3 min read';

        if (readerEndorsements) {
            readerEndorsements.textContent = `${article.sectionHead || 'Approved by Section Head'} • ${article.eicApprover || 'Approved by EIC'}`;
        }

        // Excerpt
        if (readerExcerpt) {
            if (article.excerpt && article.excerpt.trim()) {
                readerExcerpt.textContent = article.excerpt;
                readerExcerpt.style.display = 'block';
            } else {
                readerExcerpt.style.display = 'none';
            }
        }

        // Assigned cover preview
        coversList = loadCovers();
        const assignedCover = coversList.find(c => String(c.id) === String(article.assignedCoverId)) || 
                             (article.image ? { image: article.image, artist: article.coverArtist || 'Media Team Member', type: article.coverType || 'pubmat' } : null);

        if (readerCoverWrap && readerCoverImg) {
            if (assignedCover && assignedCover.image) {
                readerCoverImg.src = assignedCover.image;
                if (readerCoverBadge) {
                    readerCoverBadge.textContent = `${(assignedCover.type || 'pubmat').toUpperCase()} BY ${assignedCover.artist || 'Media Team'}`;
                }
                readerCoverWrap.style.display = 'block';
            } else {
                readerCoverWrap.style.display = 'none';
            }
        }

        // Clean manuscript body
        if (readerBody) {
            readerBody.innerHTML = formatCleanArticleContent(article.body || article.content);
        }

        // Update button states
        if (readerAssignBtn && readerAssignLabel) {
            readerAssignLabel.textContent = assignedCover ? 'Change Cover' : 'Assign Cover';
            readerAssignBtn.style.display = (article.status === 'published') ? 'none' : 'inline-flex';
        }

        if (readerPublishBtn && readerPublishLabel) {
            if (article.status === 'published') {
                readerPublishLabel.textContent = 'Unpublish Article';
                readerPublishBtn.className = 'btn-mpc-unpublish';
                readerPublishBtn.innerHTML = '<i class="fa-solid fa-arrow-rotate-left"></i> <span>Unpublish Article</span>';
            } else if (article.status === 'unpublished') {
                readerPublishLabel.textContent = 'Republish to Website';
                readerPublishBtn.className = 'btn-mpc-publish';
                readerPublishBtn.innerHTML = '<i class="fa-solid fa-globe"></i> <span>Republish to Website</span>';
            } else {
                readerPublishLabel.textContent = 'Publish to Website';
                readerPublishBtn.className = 'btn-mpc-publish';
                readerPublishBtn.innerHTML = '<i class="fa-solid fa-globe"></i> <span>Publish to Website</span>';
            }
        }

        if (readerModal) {
            readerModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeManuscriptModal() {
        if (readerModal) {
            readerModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
        activeReadingArticleId = null;
    }

    if (closeReaderBtn) closeReaderBtn.addEventListener('click', closeManuscriptModal);
    if (closeReaderFooterBtn) closeReaderFooterBtn.addEventListener('click', closeManuscriptModal);

    if (readerModal) {
        readerModal.addEventListener('click', (e) => {
            if (e.target === readerModal) closeManuscriptModal();
        });
    }

    if (coverModal) {
        coverModal.addEventListener('click', (e) => {
            if (e.target === coverModal) closeCoverModal();
        });
    }

    if (readerAssignBtn) {
        readerAssignBtn.addEventListener('click', () => {
            if (!activeReadingArticleId) return;
            const targetId = activeReadingArticleId;
            closeManuscriptModal();
            openCoverModal(targetId);
        });
    }

    if (readerPublishBtn) {
        readerPublishBtn.addEventListener('click', () => {
            if (!activeReadingArticleId) return;
            const targetId = activeReadingArticleId;
            const article = articlesList.find(a => String(a.id) === String(targetId));
            if (!article) return;

            closeManuscriptModal();

            if (article.status === 'published') {
                unpublishArticle(targetId);
            } else {
                publishArticle(targetId);
            }
        });
    }

    // Escape listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (coverModal && !coverModal.classList.contains('hidden')) closeCoverModal();
            if (readerModal && !readerModal.classList.contains('hidden')) closeManuscriptModal();
            if (returnArticleModal && !returnArticleModal.classList.contains('hidden')) closeReturnArticleModal();
        }
    });

    // -------------------------------------------------------------------------
    // 11. EVENT DELEGATION ON ARTICLES GRID
    // -------------------------------------------------------------------------
    if (articlesGrid) {
        articlesGrid.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const id = target.dataset.id;
            if (!id) return;

            if (action === 'assign-cover') {
                openCoverModal(id);
            } else if (action === 'read') {
                openManuscriptModal(id);
            } else if (action === 'publish') {
                publishArticle(id);
            } else if (action === 'unpublish') {
                unpublishArticle(id);
            } else if (action === 'return-revision') {
                openReturnArticleModal(id);
            }
        });
    }

    // -------------------------------------------------------------------------
    // 12. RETURN ARTICLE FOR REVISION MODAL LOGIC
    // -------------------------------------------------------------------------
    const returnArticleModal = document.getElementById('mpc-return-article-modal');
    const closeMpcReturnBtn = document.getElementById('close-mpc-return-modal-btn');
    const cancelMpcReturnBtn = document.getElementById('cancel-mpc-return-btn');
    const confirmMpcReturnBtn = document.getElementById('confirm-mpc-return-btn');
    const returnRemarksInput = document.getElementById('mpc-return-remarks');
    const returnRemarksError = document.getElementById('mpc-return-error');
    const returnArticleTitle = document.getElementById('mpc-return-article-title');
    let activeReturnArticleId = null;

    function openReturnArticleModal(id) {
        const article = articlesList.find(a => String(a.id) === String(id));
        if (!article || !returnArticleModal) return;

        activeReturnArticleId = id;
        if (returnArticleTitle) returnArticleTitle.textContent = article.title;
        if (returnRemarksInput) {
            returnRemarksInput.value = '';
            returnRemarksInput.classList.remove('input-invalid');
        }
        if (returnRemarksError) returnRemarksError.classList.add('hidden');

        returnArticleModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            if (returnRemarksInput) returnRemarksInput.focus();
        }, 120);
    }

    function closeReturnArticleModal() {
        if (!returnArticleModal) return;
        returnArticleModal.classList.add('hidden');
        document.body.style.overflow = '';
        activeReturnArticleId = null;
    }

    if (closeMpcReturnBtn) closeMpcReturnBtn.addEventListener('click', closeReturnArticleModal);
    if (cancelMpcReturnBtn) cancelMpcReturnBtn.addEventListener('click', closeReturnArticleModal);
    if (returnArticleModal) {
        returnArticleModal.addEventListener('click', (e) => {
            if (e.target === returnArticleModal) closeReturnArticleModal();
        });
    }

    if (returnRemarksInput) {
        returnRemarksInput.addEventListener('input', () => {
            if (returnRemarksInput.value.trim()) {
                returnRemarksInput.classList.remove('input-invalid');
                if (returnRemarksError) returnRemarksError.classList.add('hidden');
            }
        });
    }

    if (confirmMpcReturnBtn) {
        confirmMpcReturnBtn.addEventListener('click', () => {
            if (!activeReturnArticleId) return;

            const remarks = returnRemarksInput ? returnRemarksInput.value.trim() : '';
            if (!remarks) {
                if (returnRemarksInput) returnRemarksInput.classList.add('input-invalid');
                if (returnRemarksError) returnRemarksError.classList.remove('hidden');
                return;
            }

            const targetId = activeReturnArticleId;
            const targetArticle = articlesList.find(a => String(a.id) === String(targetId));

            // Backend sync
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (csrfToken) {
                fetch(`/mpc/articles/${targetId}/revision`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ remarks: remarks })
                }).catch(err => console.error('Error returning article for revision:', err));
            }

            // Remove from articlesList
            articlesList = articlesList.filter(a => String(a.id) !== String(targetId));
            saveArticles(articlesList);

            closeReturnArticleModal();
            updateStats();
            render();
            showToast(`Article "${targetArticle ? targetArticle.title : 'Story'}" returned to Editor-in-Chief with remarks.`, 'warning');
        });
    }

    // Initial load
    render();
});
