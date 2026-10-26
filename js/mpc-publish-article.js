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
    // 1. DATASETS (Approved Manuscripts & Approved Visual Covers)
    // -------------------------------------------------------------------------
    // 1. DATASETS (Approved Manuscripts & Approved Visual Covers)
    // -------------------------------------------------------------------------
    const defaultCovers = [];
    const defaultArticles = [];

    // -------------------------------------------------------------------------
    // 2. STORAGE READ / WRITE
    // -------------------------------------------------------------------------
    function loadArticles() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_ARTICLES);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.warn('Storage read failed', e);
        }
        return [];
    }

    function saveArticles(list) {
        try {
            localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(list));
        } catch (e) {
            console.warn('Storage write failed', e);
        }
    }

    function loadCovers() {
        let list = [];
        try {
            const raw = localStorage.getItem(STORAGE_KEY_COVERS);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) list = parsed;
            }
        } catch (e) {}

        // Also merge any approved cartoons/pubmats from articleCoverReviewQueue_v1
        try {
            const rawReview = localStorage.getItem('articleCoverReviewQueue_v1');
            if (rawReview) {
                const parsedReview = JSON.parse(rawReview);
                if (Array.isArray(parsedReview)) {
                    parsedReview.forEach(r => {
                        if (r.status === 'approved' || r.status === 'approved_for_mpc' || r.status === 'Published' || r.status === 'EIC Approved') {
                            if (!list.some(c => c.id === r.id)) {
                                list.push({
                                    id: r.id,
                                    type: r.type || 'cartoon',
                                    artist: r.artist || 'Staff Artist',
                                    approvedBy: r.approvedBy || r.endorsedBy || 'Editorial Head',
                                    image: r.image || 'images/covers/press-freedom-cartoon.svg',
                                    date: r.date || 'Recent'
                                });
                            }
                        }
                    });
                }
            }
        } catch (e) {}

        return list;
    }

    let articlesList = loadArticles();
    let coversList = loadCovers();

    let activeView = 'ready'; // 'ready' | 'published' | 'covers'
    let activeCategory = 'all'; // 'all' | 'news' | 'opinion' | 'features' | 'scitech' | 'literature'
    let currentSort = 'newest';
    let targetAssignArticleId = null;
    let selectedCoverIdInModal = null;
    let activeCoverFilterInModal = 'all';

    // DOM References
    const statsReady = document.getElementById('stat-ready-count');
    const statsCovers = document.getElementById('stat-covers-count');
    const statsPublished = document.getElementById('stat-published-count');

    const badgeTabReady = document.getElementById('badge-tab-ready');
    const badgeTabPublished = document.getElementById('badge-tab-published');
    const badgeTabUnpublished = document.getElementById('badge-tab-unpublished');
    const badgeTabCovers = document.getElementById('badge-tab-covers');

    const articlesGrid = document.getElementById('mpc-articles-grid');
    const emptyState = document.getElementById('mpc-empty-state');
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
    const readerCategory = document.getElementById('reader-category');
    const readerTitle = document.getElementById('reader-title');
    const readerAuthor = document.getElementById('reader-author');
    const readerDate = document.getElementById('reader-date');
    const readerBody = document.getElementById('reader-body');

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
        const coversCount = coversList.length;

        if (statsReady) statsReady.textContent = readyCount;
        if (statsPublished) statsPublished.textContent = publishedCount;
        if (statsCovers) statsCovers.textContent = coversCount;

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
            viewTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
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
        updateStats();

        // 1. If viewing the Covers Library
        if (activeView === 'covers') {
            if (articlesGrid) articlesGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'none';
            if (coversLibraryView) coversLibraryView.style.display = 'block';
            renderCoversLibrary();
            return;
        }

        // 2. Otherwise viewing Ready to Publish or Published Articles
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
            if (articlesGrid) articlesGrid.innerHTML = '';
            if (emptyState) {
                emptyState.style.display = 'block';
                const emptyTitle = emptyState.querySelector('h3');
                const emptyDesc = emptyState.querySelector('p');
                if (emptyTitle) {
                    if (activeView === 'ready') {
                        emptyTitle.textContent = 'No Articles Awaiting Publication';
                    } else if (activeView === 'published') {
                        emptyTitle.textContent = 'No Published Articles Found';
                    } else if (activeView === 'unpublished') {
                        emptyTitle.textContent = 'No Unpublished Articles';
                    }
                }
                if (emptyDesc) {
                    if (activeView === 'ready') {
                        emptyDesc.textContent = 'All approved manuscripts have been published with their covers.';
                    } else if (activeView === 'published') {
                        emptyDesc.textContent = 'Published articles will appear here after release to the public website.';
                    } else if (activeView === 'unpublished') {
                        emptyDesc.textContent = 'Articles taken down from live publication for editing or cover changes will appear here.';
                    }
                }
            }
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        articlesGrid.innerHTML = list.map(item => {
            const assignedCover = coversList.find(c => c.id === item.assignedCoverId);

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

                            <h2 class="mpc-article-headline">${escapeHTML(item.title)}</h2>

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
                                <button type="button" class="btn-mpc-unpublish" data-action="unpublish" data-id="${item.id}">
                                    <i class="fa-solid fa-arrow-rotate-left"></i>
                                    <span>Unpublish</span>
                                </button>
                            ` : `
                                <button type="button" class="btn-mpc-assign" data-action="assign-cover" data-id="${item.id}">
                                    <i class="fa-solid fa-palette"></i>
                                    <span>${assignedCover ? 'Change Cover' : 'Assign Cover'}</span>
                                </button>

                                <button type="button" class="btn-mpc-read" data-action="read" data-id="${item.id}">
                                    <i class="fa-regular fa-file-lines"></i>
                                    <span>Read Article</span>
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
        const article = articlesList.find(a => a.id === articleId);
        if (!article) return;

        targetAssignArticleId = articleId;
        selectedCoverIdInModal = article.assignedCoverId || null;

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
            filtered = filtered.filter(c => c.type === activeCoverFilterInModal);
        }

        modalCoverGallery.innerHTML = filtered.map(cover => {
            const isSelected = (cover.id === selectedCoverIdInModal);
            return `
                <div class="mpc-gallery-item ${isSelected ? 'selected' : ''}" data-cover-id="${cover.id}">
                    <div class="mpc-gallery-thumb-wrap">
                        <img src="${escapeHTML(cover.image)}" alt="Cover Asset" class="mpc-gallery-thumb-img">
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
                el.classList.toggle('selected', el.dataset.coverId === coverId);
            });
        });
    }

    // Modal type filter pills (All / PUBMAT / CARTOON)
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

            const article = articlesList.find(a => a.id === targetAssignArticleId);
            if (!article) return;

            article.assignedCoverId = selectedCoverIdInModal;
            saveArticles(articlesList);

            const chosenCover = coversList.find(c => c.id === selectedCoverIdInModal);
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
                        causer: localStorage.getItem('mpcName') || ((localStorage.getItem('mpcRole') || '').includes('Assoc') ? 'Samantha Cruz' : 'Julian Del Rosario'),
                        causerRole: localStorage.getItem('mpcRole') || ((localStorage.getItem('userRole') || '').includes('Assoc') ? 'Assoc M&PC Head' : 'M&PC Head'),
                        causerAvatar: 'images/member-placeholder.svg',
                        action: 'assigned',
                        subjectType: `Cover ${chosenCover.type.toUpperCase()} to Article`,
                        subjectName: article.title,
                        timestampText: 'Just now',
                        isoDate: now.toISOString(),
                        dateKey: now.toISOString().split('T')[0],
                        formattedDate: `${dateStr} • ${timeStr}`,
                        dayGroup: 'Today'
                    });
                    localStorage.setItem('mpcActivityLogs_v1', JSON.stringify(logs.slice(0, 40)));
                } catch (e) {}

                showToast(`Attached ${chosenCover.type.toUpperCase()} by ${chosenCover.artist} to "${article.title.substring(0, 36)}...".`, 'success');
            } else {
                showToast(`Cover removed from "${article.title.substring(0, 36)}...".`, 'warning');
            }
        });
    }

    // -------------------------------------------------------------------------
    // 9. PUBLISH & UNPUBLISH WORKFLOWS
    // -------------------------------------------------------------------------
    function publishArticle(articleId) {
        const article = articlesList.find(a => a.id === articleId);
        if (!article) return;

        // Validation: Must have a cover assigned before publishing
        if (!article.assignedCoverId) {
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
            article.publishedAt = new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            // Attach actual cover image from coversList
            const chosenCover = coversList.find(c => c.id === article.assignedCoverId);
            if (chosenCover && chosenCover.image) {
                article.image = chosenCover.image;
                article.coverImage = chosenCover.image;
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
                    image: article.image || 'images/maroon.jpg',
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
                    causer: localStorage.getItem('mpcName') || ((localStorage.getItem('mpcRole') || '').includes('Assoc') ? 'Samantha Cruz' : 'Julian Del Rosario'),
                    causerRole: localStorage.getItem('mpcRole') || ((localStorage.getItem('userRole') || '').includes('Assoc') ? 'Assoc M&PC Head' : 'M&PC Head'),
                    causerAvatar: 'images/member-placeholder.svg',
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
                causer: localStorage.getItem('mpcName') || ((localStorage.getItem('mpcRole') || '').includes('Assoc') ? 'Samantha Cruz' : 'Julian Del Rosario'),
                causerRole: localStorage.getItem('mpcRole') || ((localStorage.getItem('userRole') || '').includes('Assoc') ? 'Assoc M&PC Head' : 'M&PC Head'),
                causerAvatar: 'images/member-placeholder.svg',
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

        saveArticles(articlesList);
        render();
        showToast(`Article unpublished and moved to the Unpublished tab.`, 'warning');
    }

    // -------------------------------------------------------------------------
    // 10. MANUSCRIPT VIEWER MODAL
    // -------------------------------------------------------------------------
    function openManuscriptModal(articleId) {
        const article = articlesList.find(a => a.id === articleId);
        if (!article) return;

        if (readerCategory) readerCategory.textContent = article.category.toUpperCase();
        if (readerTitle) readerTitle.textContent = article.title;
        if (readerAuthor) readerAuthor.textContent = article.author;
        if (readerDate) readerDate.textContent = `Approved: ${article.dateApproved}`;
        if (readerBody) readerBody.innerHTML = article.body;

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
    }

    const closeReaderFooterBtn = document.getElementById('close-reader-footer-btn');
    if (closeReaderBtn) closeReaderBtn.addEventListener('click', closeManuscriptModal);
    if (closeReaderFooterBtn) closeReaderFooterBtn.addEventListener('click', closeManuscriptModal);

    // Escape listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (coverModal && !coverModal.classList.contains('hidden')) closeCoverModal();
            if (readerModal && !readerModal.classList.contains('hidden')) closeManuscriptModal();
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
            }
        });
    }

    // Initial load
    render();
});

