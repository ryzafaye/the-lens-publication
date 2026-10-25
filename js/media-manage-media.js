/**
 * ============================================================================
 * THE LENS — MEDIA & COMMUNICATION MANAGE MEDIA CONTROLLER
 * Full Parity with Executive Architecture & Public Site Archive Boxes Style
 * Official Media Statuses:
 *   - 'Pending with Head'
 *   - 'Returned for Revision'
 *   - 'EIC Approved'
 *   - 'Published' (Public Site Archive Style: Media Graphic + Live Article)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. DOM References
    const gridEl = document.getElementById('manage-media-grid');
    const tabButtons = document.querySelectorAll('.manage-tab-btn');
    const searchInput = document.getElementById('media-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const sortSelect = document.getElementById('media-sort-select');

    // Tab Count Badges
    const pillAll = document.getElementById('pill-count-all');
    const pillPending = document.getElementById('pill-count-pending');
    const pillReturned = document.getElementById('pill-count-returned');
    const pillEic = document.getElementById('pill-count-eic');
    const pillPublished = document.getElementById('pill-count-published');

    // Inspect Modal
    const inspectModal = document.getElementById('media-inspect-modal');
    const modalImg = document.getElementById('modal-inspect-img');
    const modalTitle = document.getElementById('modal-inspect-title');
    const modalCategory = document.getElementById('modal-inspect-category');
    const modalStatus = document.getElementById('modal-inspect-status');
    const modalDate = document.getElementById('modal-inspect-date');
    const modalFilesize = document.getElementById('modal-inspect-filesize');
    const modalCaption = document.getElementById('modal-inspect-caption');
    const modalRemarksBox = document.getElementById('modal-inspect-remarks-box');
    const modalRemarksText = document.getElementById('modal-inspect-remarks-text');
    const closeInspectBtn = document.getElementById('close-inspect-modal-btn');
    const btnModalClose = document.getElementById('btn-modal-close');

    // Toast Container
    const toastContainer = document.getElementById('toast-container');

    // Active State
    let currentFilter = 'all';
    let searchQuery = '';
    let currentSort = 'newest';
    let mediaItems = [];

    // 2. Toast & Formatting System
    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatNumber(num) {
        if (num >= 1000) return Number(num).toLocaleString('en-US');
        return String(num || 0);
    }

    function showToast(message, type = 'success') {
        if (!toastContainer) return;
        const existingToasts = toastContainer.querySelectorAll('.toast-message');
        existingToasts.forEach(t => t.remove());

        const toast = document.createElement('div');
        const resolvedType = type === 'error' ? 'danger' : type;
        toast.className = `toast-message ${resolvedType}`;
        toast.innerHTML = `<span class="toast-bullet-dot"></span><span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-dismissing');
            setTimeout(() => toast.remove(), 260);
        }, 3200);
    }

    // 3. Status Configuration Helper
    function getStatusConfig(status) {
        switch (status) {
            case 'Published':
                return {
                    cssClass: 'published',
                    label: 'Published',
                    icon: '<i class="fa-solid fa-globe"></i>'
                };
            case 'EIC Approved':
                return {
                    cssClass: 'eic-approved',
                    label: 'EIC Approved',
                    icon: '<i class="fa-solid fa-shield-halved"></i>'
                };
            case 'Returned for Revision':
                return {
                    cssClass: 'returned-for-revision',
                    label: 'Returned for Revision',
                    icon: '<i class="fa-solid fa-triangle-exclamation"></i>'
                };
            case 'Pending with Head':
            default:
                return {
                    cssClass: 'pending-with-head',
                    label: 'Pending with Head',
                    icon: '<i class="fa-regular fa-clock"></i>'
                };
        }
    }

    // 4. Data Loading & Counters
    function loadMedia() {
        mediaItems = (typeof getMediaSubmissions === 'function') ? getMediaSubmissions() : [];
        updateCounters();
        renderGrid();
    }

    function updateCounters() {
        // "All Media" tab excludes published items per user request
        const queueCount = mediaItems.filter(m => m.status !== 'Published').length;
        const pending = mediaItems.filter(m => m.status === 'Pending with Head').length;
        const returned = mediaItems.filter(m => m.status === 'Returned for Revision').length;
        const eic = mediaItems.filter(m => m.status === 'EIC Approved').length;
        const published = mediaItems.filter(m => m.status === 'Published').length;

        if (pillAll) pillAll.textContent = String(queueCount);
        if (pillPending) pillPending.textContent = String(pending);
        if (pillReturned) pillReturned.textContent = String(returned);
        if (pillEic) pillEic.textContent = String(eic);
        if (pillPublished) pillPublished.textContent = String(published);
    }

    // 5. Filtering & Sorting Pipeline
    function getFilteredAndSortedMedia() {
        let filtered = mediaItems.filter(item => {
            // "All" tab: do NOT include published items per user request!
            if (currentFilter === 'all' && item.status === 'Published') return false;

            if (currentFilter === 'pending' && item.status !== 'Pending with Head') return false;
            if (currentFilter === 'returned' && item.status !== 'Returned for Revision') return false;
            if (currentFilter === 'eic_approved' && item.status !== 'EIC Approved') return false;
            if (currentFilter === 'published' && item.status !== 'Published') return false;

            // Search query filtering
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchTitle = (item.title || '').toLowerCase().includes(q);
                const matchCategory = (item.category || '').toLowerCase().includes(q);
                const matchRemarks = (item.remarks || '').toLowerCase().includes(q);
                const matchArticleTitle = (item.connectedArticleTitle || '').toLowerCase().includes(q);
                const matchArticleExcerpt = (item.connectedArticleExcerpt || '').toLowerCase().includes(q);
                const matchAuthor = (item.connectedArticleAuthor || '').toLowerCase().includes(q);
                const matchArtist = (item.artist || '').toLowerCase().includes(q);

                if (!matchTitle && !matchCategory && !matchRemarks && !matchArticleTitle && !matchArticleExcerpt && !matchAuthor && !matchArtist) {
                    return false;
                }
            }

            return true;
        });

        // Sorting
        filtered.sort((a, b) => {
            if (currentSort === 'az') {
                const titleA = a.connectedArticleTitle || a.title || '';
                const titleB = b.connectedArticleTitle || b.title || '';
                return titleA.localeCompare(titleB);
            }
            const dateA = new Date(a.rawDate || a.date || 0);
            const dateB = new Date(b.rawDate || b.date || 0);
            return currentSort === 'newest' ? (dateB - dateA) : (dateA - dateB);
        });

        return filtered;
    }

    // 6. Grid Rendering: Public Site Archive "Boxes Style" for Published Tab
    function renderGrid() {
        if (!gridEl) return;

        updateCounters();
        const filtered = getFilteredAndSortedMedia();

        const isPublishedTab = (currentFilter === 'published');
        if (isPublishedTab) {
            gridEl.classList.add('published-archive-layout');
        } else {
            gridEl.classList.remove('published-archive-layout');
        }

        if (filtered.length === 0) {
            gridEl.innerHTML = `
                <div class="media-empty-state" style="grid-column: 1 / -1;">
                    <i class="fa-solid fa-filter"></i>
                    <h3>No Media Assets Found</h3>
                    <p>No publication materials match your selected filter or search term.</p>
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <a href="media-submit-media.html" class="btn-primary-action">
                            <i class="fa-solid fa-cloud-arrow-up"></i>
                            <span>Submit Media</span>
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        // Render Cards
        gridEl.innerHTML = filtered.map(item => {
            // EXACT PUBLIC SITE ARCHIVE STYLE FOR PUBLISHED TAB
            if (isPublishedTab) {
                const articleUrl = item.connectedArticleUrl || `article.html?id=${encodeURIComponent(item.connectedArticleId || '1')}`;
                const articleHeadline = item.connectedArticleTitle || item.title;
                const articleExcerpt = item.connectedArticleExcerpt || item.title;
                const articleCategory = item.connectedArticleCategory || item.category || 'News';
                const articleAuthor = item.connectedArticleAuthor || 'Mara Villanueva';
                const articleDate = item.connectedArticleDate || item.date || 'Oct 12, 2026';
                const articleViews = item.views !== undefined ? item.views : 2150;
                const articleReadTime = item.readTime || '2 min read';
                const articleShares = item.shares !== undefined ? item.shares : 0;
                const safeImage = (item.image && !item.image.includes('maroon.jpg'))
                    ? item.image
                    : 'images/covers/portal-pubmat.svg';

                return `
                    <article class="archive-item">
                        <button type="button" class="archive-image-trigger" data-action="inspect" data-id="${item.id}" aria-label="Inspect graphic: ${escapeHTML(item.title)}" title="Click to inspect graphic">
                            <div class="archive-image" style="--image-color: #571525;">
                                <img 
                                    src="${escapeHTML(safeImage)}" 
                                    alt="${escapeHTML(item.title)}" 
                                    loading="lazy" 
                                    onerror="this.onerror=null; this.src='images/covers/portal-pubmat.svg'"
                                >
                            </div>
                        </button>
                        <div class="archive-item-copy">
                            <div class="article-meta">
                                <span class="article-category-label">${escapeHTML(articleCategory)}</span>
                                <span class="article-meta-separator" aria-hidden="true">&middot;</span>
                                <time>${escapeHTML(articleDate)}</time>
                            </div>
                            <h3>
                                <a href="${escapeHTML(articleUrl)}" target="_blank" class="archive-title-link" title="Open live story">
                                    ${escapeHTML(articleHeadline)}
                                </a>
                            </h3>
                            <p class="archive-excerpt">${escapeHTML(articleExcerpt)}</p>
                            <p class="article-byline">
                                <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
                                <span>By <a href="${escapeHTML(articleUrl)}" target="_blank" class="author-profile-link">${escapeHTML(articleAuthor)}</a></span>
                            </p>
                            <div class="article-stats" aria-label="Article engagement and reading time">
                                <span class="article-view-count" title="Views">
                                    <i class="fa-regular fa-eye" aria-hidden="true"></i>
                                    <span>${formatNumber(articleViews)} views</span>
                                </span>
                                <span class="article-read-time" title="Estimated reading time">
                                    <i class="fa-regular fa-clock" aria-hidden="true"></i>
                                    <span>${escapeHTML(articleReadTime)}</span>
                                </span>
                                <button type="button" class="article-share-button" title="Share count">
                                    <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
                                    <span>Share</span>
                                    <span class="share-count">${articleShares}</span>
                                </button>
                            </div>
                        </div>
                    </article>
                `;
            }

            // CLEAN CARD FOR QUEUE ITEMS (Pending with Head, Returned for Revision, EIC Approved)
            const statusCfg = getStatusConfig(item.status);
            const isReturned = (item.status === 'Returned for Revision');

            return `
                <div class="manage-media-card" data-id="${item.id}">
                    <div class="media-card-preview-box" data-action="inspect" data-id="${item.id}">
                        <img 
                            src="${escapeHTML(item.image)}" 
                            alt="${escapeHTML(item.title)}" 
                            class="media-card-img" 
                            onerror="this.onerror=null; this.src='images/covers/portal-pubmat.svg'"
                        >
                        <div class="media-card-badge-layer">
                            <span class="media-card-category-chip maroon-category">
                                <i class="fa-solid fa-tag"></i> ${escapeHTML(item.category || 'News')}
                            </span>
                            <span class="media-status-pill ${statusCfg.cssClass}">
                                ${statusCfg.icon} ${statusCfg.label}
                            </span>
                        </div>
                    </div>

                    <div class="media-card-body">
                        <h3 class="media-card-title">${escapeHTML(item.title)}</h3>
                        <div class="media-card-meta">
                            <span><i class="fa-regular fa-calendar"></i> ${escapeHTML(item.date)}</span>
                            <span>&bull;</span>
                            <span><i class="fa-solid fa-palette"></i> ${escapeHTML(item.artist || 'Alyssa Marie Dizon')}</span>
                            <span>&bull;</span>
                            <span>${escapeHTML(item.fileSize || 'Standard')}</span>
                        </div>

                        <div class="media-card-actions">
                            <button type="button" class="btn-media-inspect" data-action="inspect" data-id="${item.id}">
                                <i class="fa-regular fa-eye"></i>
                                <span>Inspect Graphic</span>
                            </button>

                            ${(isReturned && item.remarks) ? `
                                <button type="button" class="btn-media-remarks" data-action="remarks" data-id="${item.id}" title="View Revision Feedback">
                                    <i class="fa-solid fa-comment-dots"></i>
                                    <span>View Remarks</span>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach Inspect & Remarks Event Listeners
        gridEl.querySelectorAll('[data-action="inspect"], [data-action="remarks"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const item = mediaItems.find(m => m.id === id);
                if (item) openInspectModal(item);
            });
        });
    }

    // 7. Inspect Modal Handlers
    function openInspectModal(item) {
        if (!inspectModal) return;

        const statusCfg = getStatusConfig(item.status);

        if (modalImg) {
            modalImg.onerror = function() {
                this.onerror = null;
                this.src = 'images/covers/portal-pubmat.svg';
            };
            modalImg.src = item.image || 'images/covers/election-guidelines.svg';
            modalImg.alt = item.category || 'Graphic Preview';
        }
        if (modalTitle) modalTitle.textContent = item.title;
        if (modalCategory) {
            modalCategory.innerHTML = `<i class="fa-solid fa-tag"></i> ${escapeHTML(item.category || 'News')}`;
        }
        if (modalStatus) {
            modalStatus.className = `media-status-pill ${statusCfg.cssClass}`;
            modalStatus.innerHTML = `${statusCfg.icon} ${statusCfg.label}`;
        }
        if (modalDate) modalDate.textContent = item.date || 'Oct 24, 2026';
        if (modalFilesize) modalFilesize.textContent = item.fileSize || 'Standard';
        if (modalCaption) {
            modalCaption.textContent = item.connectedArticleTitle || item.targetArticle || item.caption || 'Publication Material Asset';
        }

        // Remarks Feedback Display
        if (item.status === 'Returned for Revision' && item.remarks) {
            if (modalRemarksText) modalRemarksText.textContent = item.remarks;
            if (modalRemarksBox) modalRemarksBox.style.display = 'block';
        } else {
            if (modalRemarksBox) modalRemarksBox.style.display = 'none';
        }

        inspectModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeInspectModal() {
        if (!inspectModal) return;
        inspectModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    if (closeInspectBtn) closeInspectBtn.addEventListener('click', closeInspectModal);
    if (btnModalClose) btnModalClose.addEventListener('click', closeInspectModal);

    if (inspectModal) {
        inspectModal.addEventListener('click', (e) => {
            if (e.target === inspectModal) closeInspectModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && inspectModal && !inspectModal.classList.contains('hidden')) {
            closeInspectModal();
        }
    });

    // 9. Filter Tab Navigation
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            currentFilter = btn.getAttribute('data-filter') || 'all';
            renderGrid();
        });
    });

    // 10. Search Input & Clear Button
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            if (clearSearchBtn) {
                clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
            }
            renderGrid();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
            }
            searchQuery = '';
            clearSearchBtn.classList.add('hidden');
            renderGrid();
            if (searchInput) searchInput.focus();
        });
    }

    // 11. Sort Dropdown
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderGrid();
        });
    }

    // 12. Deep-link inspection support from URL query (?inspect=ID)
    function checkUrlForInspection() {
        try {
            const params = new URLSearchParams(window.location.search);
            const inspectId = params.get('inspect');
            if (inspectId) {
                const item = mediaItems.find(m => m.id === inspectId);
                if (item) {
                    setTimeout(() => openInspectModal(item), 150);
                }
            }
        } catch (e) {
            console.warn(e);
        }
    }

    // Initial Execution
    loadMedia();
    checkUrlForInspection();
});
