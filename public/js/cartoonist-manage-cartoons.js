/**
 * ============================================================================
 * THE LENS — CARTOONIST MANAGE CARTOONS CONTROLLER
 * Full parity with Media Management:
 *   - Scoped to current cartoonist user account
 *   - "All Cartoons" tab excludes published items (dedicated queue)
 *   - "Pending with Head" / "Pending Approval" includes pending reviews
 *   - "Returned for Revision" shows remarks feedback
 *   - "EIC Approved" shows endorsed & approved cartoons
 *   - "Published" tab renders in public site archive "boxes style"
 *   - Frame-fitted images (never cut off)
 *   - Author in signature maroon (#5c0a18, bold)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. DOM Elements
    const gridEl = document.getElementById('cartoon-grid');
    const tabButtons = document.querySelectorAll('.manage-tab-btn');
    const searchInput = document.getElementById('cartoon-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const sortSelect = document.getElementById('cartoon-sort-select');

    // Counters
    const pillAll = document.getElementById('pill-count-all');
    const pillPending = document.getElementById('pill-count-pending');
    const pillReturned = document.getElementById('pill-count-returned');
    const pillEic = document.getElementById('pill-count-eic');
    const pillPublished = document.getElementById('pill-count-published');

    // Inspect Modal
    const inspectModal = document.getElementById('inspect-modal');
    const modalImg = document.getElementById('modal-inspect-img');
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
    let cartoonItems = [];

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
        const s = (status || '').toLowerCase().trim();
        if (s === 'published') {
            return {
                cssClass: 'published',
                label: 'Published',
                icon: '<i class="fa-solid fa-globe"></i>'
            };
        }
        if (s === 'eic approved' || s === 'approved' || s === 'approved_for_mpc') {
            return {
                cssClass: 'eic-approved',
                label: 'EIC Approved',
                icon: '<i class="fa-solid fa-shield-halved"></i>'
            };
        }
        if (s === 'pending eic review' || s === 'forwarded to eic' || s === 'submitted_to_eic') {
            return {
                cssClass: 'pending-eic-review',
                label: 'Pending EIC Review',
                icon: '<i class="fa-solid fa-clock"></i>'
            };
        }
        if (s.includes('return') || s.includes('revision')) {
            return {
                cssClass: 'returned-for-revision',
                label: 'Returned for Revision',
                icon: '<i class="fa-solid fa-triangle-exclamation"></i>'
            };
        }
        return {
            cssClass: 'pending-with-head',
            label: 'Pending with Head',
            icon: '<i class="fa-regular fa-clock"></i>'
        };
    }

    const userRole = window.LARAVEL_USER_ROLE || localStorage.getItem('cartoonistHeadRole') || localStorage.getItem('cartoonistRole') || localStorage.getItem('userRole') || 'Cartoonist';
    const isSectionHead = ['Cartoonist Head', 'Associate Cartoonist Head', 'Chief Cartoonist'].includes(userRole);
    const currentAuthorName = window.LARAVEL_USER_NAME || localStorage.getItem('cartoonistHeadName') || localStorage.getItem('cartoonistName') || localStorage.getItem('userName') || 'Cartoonist';

    // 4. Data Loading & Counters (Scoped to current Cartoonist)
    function loadCartoons() {
        if (typeof getCartoonSubmissions === 'function') {
            cartoonItems = getCartoonSubmissions(true);
        } else if (window.INITIAL_CARTOONS && Array.isArray(window.INITIAL_CARTOONS) && window.INITIAL_CARTOONS.length > 0) {
            cartoonItems = window.INITIAL_CARTOONS;
        } else if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA) && window.INITIAL_DATA.length > 0) {
            cartoonItems = window.INITIAL_DATA;
        } else {
            try {
                const raw = localStorage.getItem('cartoonistSubmissions_v1');
                cartoonItems = raw ? JSON.parse(raw) : [];
            } catch (e) {
                cartoonItems = [];
            }
        }

        // Deduplicate by ID
        const seen = new Set();
        const deduped = [];
        (cartoonItems || []).forEach(item => {
            if (!item || !item.id) return;
            const strId = String(item.id);
            if (!seen.has(strId)) {
                seen.add(strId);
                deduped.push(item);
            }
        });
        cartoonItems = deduped;

        updateCounters();
        renderGrid();
    }

    function updateCounters() {
        const queueCount = cartoonItems.filter(m => (m.status || '').toLowerCase() !== 'published').length;
        const pending = cartoonItems.filter(m => {
            const s = (m.status || '').toLowerCase();
            return s.includes('pending') || s.includes('forwarded') || s.includes('submitted');
        }).length;
        const returned = cartoonItems.filter(m => {
            const s = (m.status || '').toLowerCase();
            return s.includes('return') || s.includes('revision');
        }).length;
        const eic = cartoonItems.filter(m => {
            const s = (m.status || '').toLowerCase();
            return s === 'eic approved' || s === 'approved' || s === 'approved_for_mpc';
        }).length;
        const published = cartoonItems.filter(m => (m.status || '').toLowerCase() === 'published').length;

        if (pillAll) pillAll.textContent = String(queueCount);
        if (pillPending) pillPending.textContent = String(pending);
        if (pillReturned) pillReturned.textContent = String(returned);
        if (pillEic) pillEic.textContent = String(eic);
        if (pillPublished) pillPublished.textContent = String(published);
    }

    // 5. Filtering & Sorting Pipeline
    function getFilteredAndSortedCartoons() {
        let filtered = cartoonItems.filter(item => {
            const statusLower = (item.status || '').toLowerCase().trim();

            // "All Cartoons" tab excludes published items
            if (currentFilter === 'all' && statusLower === 'published') {
                return false;
            }
            if (currentFilter === 'pending' && !statusLower.includes('pending') && !statusLower.includes('forwarded') && !statusLower.includes('submitted')) {
                return false;
            }
            if (currentFilter === 'returned' && !statusLower.includes('return') && !statusLower.includes('revision')) {
                return false;
            }
            if (currentFilter === 'eic_approved' && statusLower !== 'eic approved' && statusLower !== 'approved' && statusLower !== 'approved_for_mpc') {
                return false;
            }
            if (currentFilter === 'published' && statusLower !== 'published') {
                return false;
            }

            // Search query filter
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchTitle = (item.title || '').toLowerCase().includes(q);
                const matchCat = (item.category || '').toLowerCase().includes(q);
                const matchArtist = (item.artist || '').toLowerCase().includes(q);
                const matchRemarks = (item.remarks || '').toLowerCase().includes(q);
                const matchArt = (item.connectedArticleTitle || '').toLowerCase().includes(q);
                const matchAuthor = (item.connectedArticleAuthor || '').toLowerCase().includes(q);
                if (!matchTitle && !matchCat && !matchArtist && !matchRemarks && !matchArt && !matchAuthor) {
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
        const filtered = getFilteredAndSortedCartoons();

        const isPublishedTab = (currentFilter === 'published');
        if (isPublishedTab) {
            gridEl.classList.add('published-archive-layout');
        } else {
            gridEl.classList.remove('published-archive-layout');
        }

        if (filtered.length === 0) {
            const isSearching = searchQuery && searchQuery.trim().length > 0;
            let iconClass = 'fa-solid fa-palette';
            let titleText = 'No cartoons yet';

            if (isSearching) {
                iconClass = 'fa-solid fa-magnifying-glass';
                titleText = 'No cartoons found';
            } else {
                if (currentFilter === 'published') {
                    iconClass = 'fa-solid fa-globe';
                    titleText = 'No published cartoons yet';
                } else if (currentFilter === 'pending') {
                    iconClass = 'fa-regular fa-clock';
                    titleText = 'No pending cartoons';
                } else if (currentFilter === 'returned') {
                    iconClass = 'fa-solid fa-triangle-exclamation';
                    titleText = 'No cartoons for revision';
                } else if (currentFilter === 'eic_approved') {
                    iconClass = 'fa-solid fa-shield-halved';
                    titleText = 'No EIC approved cartoons';
                } else {
                    iconClass = 'fa-solid fa-palette';
                    titleText = 'No cartoons yet';
                }
            }

            gridEl.innerHTML = `
                <div class="media-empty-state" style="grid-column: 1 / -1;">
                    <i class="${iconClass}"></i>
                    <h3>${titleText}</h3>
                </div>
            `;
            return;
        }

        // Render Cards
        gridEl.innerHTML = filtered.map(item => {
            // EXACT PUBLIC SITE ARCHIVE STYLE FOR PUBLISHED TAB
            if (isPublishedTab) {
                const articleUrl = item.connectedArticleUrl || `/article?id=${encodeURIComponent(item.connectedArticleId || '1')}`;
                const cleanFallback = (item.title && !item.title.match(/\.(png|jpe?g|svg|webp|gif)$/i)) ? item.title : 'Editorial Cartoon';
                const articleHeadline = item.connectedArticleTitle || cleanFallback;
                const articleExcerpt = item.connectedArticleExcerpt || cleanFallback;
                const articleCategory = item.connectedArticleCategory || item.category || 'Opinion';
                const articleAuthor = item.connectedArticleAuthor || currentAuthorName;
                const articleDate = item.connectedArticleDate || item.date || '';
                const articleViews = item.views !== undefined ? item.views : 0;
                const articleReadTime = item.readTime || '2 min read';
                const articleShares = item.shares !== undefined ? item.shares : 0;
                const safeImage = item.image || '';

                return `
                    <article class="archive-item">
                        <button type="button" class="archive-image-trigger" data-action="inspect" data-id="${item.id}" aria-label="Inspect cartoon: ${escapeHTML(item.title)}" title="Click to inspect cartoon">
                            <div class="archive-image" style="--image-color: #571525;">
                                ${safeImage ? `
                                    <img 
                                        src="${escapeHTML(safeImage)}" 
                                        alt="${escapeHTML(item.title)}" 
                                        loading="lazy" 
                                    >
                                ` : `
                                    <div class="media-card-placeholder" style="display: flex; align-items: center; justify-content: center; height: 100%; color: #cbd5e1;">
                                        <i class="fa-solid fa-palette" style="font-size: 2rem;"></i>
                                    </div>
                                `}
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
                                    <span>${formatNumber(articleViews)}</span> <span class="stat-label">views</span>
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
            const isReturned = (item.status || '').toLowerCase().includes('return') || (item.status || '').toLowerCase().includes('revision');
            const safeImage = item.image || '';

            return `
                <div class="manage-media-card" data-id="${item.id}">
                    <div class="media-card-preview-box" data-action="inspect" data-id="${item.id}">
                        ${safeImage ? `
                            <img 
                                src="${escapeHTML(safeImage)}" 
                                alt="${escapeHTML(item.title)}" 
                                class="media-card-img" 
                            >
                        ` : `
                            <div class="media-card-placeholder" style="display: flex; align-items: center; justify-content: center; height: 100%; min-height: 180px; background: #f8fafc; color: #94a3b8;">
                                <i class="fa-solid fa-palette" style="font-size: 2.2rem;"></i>
                            </div>
                        `}
                        <div class="media-card-badge-layer" style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; padding: 10px;">
                            <span class="cover-type-tag cartoon" style="font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.04em; background: rgba(15, 23, 42, 0.90); color: #f472b6; border: 1px solid rgba(244, 114, 182, 0.3);">
                                <i class="fa-solid fa-palette"></i> CARTOON
                            </span>
                            <span class="media-status-pill ${statusCfg.cssClass}">
                                ${statusCfg.icon} ${statusCfg.label}
                            </span>
                        </div>
                    </div>

                    <div class="media-card-body" style="padding: 14px 16px;">
                        <div class="media-card-meta" style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #64748b; margin-bottom: 12px;">
                            <span><i class="fa-regular fa-calendar"></i> ${escapeHTML(item.date || 'Recent')}</span>
                            <span>&bull;</span>
                            <span><i class="fa-solid fa-palette"></i> <strong>${escapeHTML(item.artist || currentAuthorName)}</strong></span>
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
                const item = cartoonItems.find(m => String(m.id) === String(id));
                if (item) openInspectModal(item);
            });
        });
    }

    // 7. Inspect Modal Logic
    function openInspectModal(item) {
        if (!inspectModal) return;

        const statusCfg = getStatusConfig(item.status);

        if (modalImg) {
            modalImg.onerror = null;
            if (item.image) {
                modalImg.src = item.image;
                modalImg.alt = item.title || 'Cartoon Preview';
                modalImg.style.display = '';
            } else {
                modalImg.src = '';
                modalImg.style.display = 'none';
            }
        }
        if (modalCategory) {
            modalCategory.style.display = 'none';
        }
        if (modalStatus) {
            modalStatus.className = `media-status-pill ${statusCfg.cssClass}`;
            modalStatus.innerHTML = `${statusCfg.icon} ${statusCfg.label}`;
        }
        if (modalDate) modalDate.textContent = item.date || '';

        if (modalRemarksBox && modalRemarksText) {
            const isReturned = (item.status || '').toLowerCase().includes('return') || (item.status || '').toLowerCase().includes('revision');
            if (isReturned && item.remarks) {
                modalRemarksText.textContent = item.remarks;
                modalRemarksBox.style.display = 'block';
            } else {
                modalRemarksBox.style.display = 'none';
            }
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

    // 8. Tabs Filter Binding
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

    // 9. Search Input Binding
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
                searchQuery = '';
                clearSearchBtn.classList.add('hidden');
                searchInput.focus();
                renderGrid();
            }
        });
    }

    // 10. Sort Select Binding
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderGrid();
        });
    }

    // Initial load
    loadCartoons();
});
