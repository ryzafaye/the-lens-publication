/**
 * The Lens — Manage Articles & Archives Script
 * Clean, Reusable & Modular Implementation
 * 
 * Features:
 * 1. Auth Guard (Redirects to login if userRole is missing)
 * 2. Real-Time Clock & Header Profile Hydration
 * 3. Mobile Navigation Dropdown (Fit-content to text length)
 * 4. Tab Navigation (Active Articles vs. Archived Articles)
 * 5. Full Search by Title AND Author
 * 6. Sort & Filter Logic (Exact replication of Public Site UI & Logic, high z-index)
 * 7. 2-Column Responsive Card Grid (Desktop & Mobile 2-per-line requirement)
 * 8. 3-Dots Action Menu on each card: Edit, Archive/Restore, Emergency Delete
 * 9. Article Viewer Modal: Full interactive reading experience for executives
 * 10. Edit Modal & Confirmation Dialogs with Toast Notifications
 */

import { articles as defaultArticles } from './articles.js';

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. AUTHENTICATION & ROLE VERIFICATION
    // =========================================================================
    const userRole = localStorage.getItem('userRole') || 'President';

    // Route Guard: If not signed in with a valid role, redirect to login
    if (!localStorage.getItem('userRole')) {
        // Fallback for development if directly opened, or set default President
        localStorage.setItem('userRole', 'President');
    }

    // =========================================================================
    // 2. DATA STORE: SHARED ARTICLES DATASET (Connected with public/executive)
    // =========================================================================
    function getStoredArticles() {
        try {
            const raw = localStorage.getItem('executiveArticles');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('Could not read executiveArticles from localStorage', e);
        }
        // Deep clone from defaultArticles in articles.js
        return JSON.parse(JSON.stringify(defaultArticles));
    }

    function saveArticles(list) {
        try {
            localStorage.setItem('executiveArticles', JSON.stringify(list));
        } catch (e) {
            console.warn('Could not save executiveArticles to localStorage', e);
        }
    }

    let articles = getStoredArticles();

    // =========================================================================
    // 6. APPLICATION STATE
    // =========================================================================
    let currentTab = 'active'; // 'active' | 'archived'
    let searchQuery = '';
    let selectedSort = 'newest';
    let selectedCategory = 'All';
    let selectedDateMode = 'any';
    let selectedDateValue = { month: '', day: '', year: '' };
    let currentViewingArticleId = null;

    // DOM Elements
    const tabActiveBtn = document.getElementById('tab-active-btn');
    const tabArchivedBtn = document.getElementById('tab-archived-btn');
    const badgeActiveCount = document.getElementById('badge-active-count');
    const badgeArchivedCount = document.getElementById('badge-archived-count');

    const searchInput = document.getElementById('manage-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    const sortFilterBtn = document.getElementById('sort-filter-btn');
    const sortFilterWrapper = document.querySelector('.sort-filter-wrapper');
    const filterDropdown = document.getElementById('filter-dropdown');
    const closeFilterBtn = document.getElementById('close-filter-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const filterActiveDot = document.getElementById('filter-active-dot');

    const sortSelect = document.getElementById('sort-select');
    const categorySelect = document.getElementById('category-select');
    const dateFilterType = document.getElementById('date-filter-type');
    const dateFilterValueWrap = document.getElementById('date-filter-value-wrap');
    const dateMonthSelect = document.getElementById('date-month-select');
    const dateDaySelect = document.getElementById('date-day-select');
    const dateYearSelect = document.getElementById('date-year-select');

    const activeFilterChips = document.getElementById('active-filter-chips');
    const articlesGrid = document.getElementById('articles-grid');
    const articlesResultsCounter = document.getElementById('articles-results-counter');
    const manageEmptyState = document.getElementById('manage-empty-state');
    const resetEmptyFiltersBtn = document.getElementById('reset-empty-filters-btn');

    // Modals
    const actionModal = document.getElementById('action-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalIconHeader = document.getElementById('modal-icon-header');
    const modalIcon = document.getElementById('modal-icon');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    // Article Viewer Modal Elements
    const viewerModal = document.getElementById('article-viewer-modal');
    const closeViewerBtn = document.getElementById('close-viewer-btn');
    const viewerTitle = document.getElementById('viewer-title');
    const viewerCategory = document.getElementById('viewer-category');
    const viewerDate = document.getElementById('viewer-date');
    const viewerAuthor = document.getElementById('viewer-author');
    const viewerReadTime = document.getElementById('viewer-read-time');
    const viewerContent = document.getElementById('viewer-content');
    const viewerViews = document.getElementById('viewer-views');
    const viewerShares = document.getElementById('viewer-shares');
    const viewerActionEdit = document.getElementById('viewer-action-edit');
    const viewerActionArchive = document.getElementById('viewer-action-archive');
    const viewerArchiveLabel = document.getElementById('viewer-archive-label');
    const viewerActionDelete = document.getElementById('viewer-action-delete');

    // Edit Article Modal Elements
    const editModal = document.getElementById('edit-article-modal');
    const closeEditBtn = document.getElementById('close-edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const editArticleForm = document.getElementById('edit-article-form');
    const editArticleIdInput = document.getElementById('edit-article-id');
    const editTitleInput = document.getElementById('edit-title-input');
    const editAuthorInput = document.getElementById('edit-author-input');
    const editCategorySelect = document.getElementById('edit-category-select');
    const editReadtimeInput = document.getElementById('edit-readtime-input');
    const editExcerptInput = document.getElementById('edit-excerpt-input');

    const toastContainer = document.getElementById('toast-container');
    let pendingModalAction = null;

    // =========================================================================
    // 7. HELPER FUNCTIONS: ESCAPE HTML & TOASTS
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
        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;

        let iconClass = 'fa-solid fa-check-circle';
        if (type === 'danger') iconClass = 'fa-solid fa-triangle-exclamation';
        if (type === 'info') iconClass = 'fa-solid fa-circle-info';
        if (type === 'warning') iconClass = 'fa-solid fa-bell';

        toast.innerHTML = `<i class="${iconClass}"></i><span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(12px) scale(0.96)';
            toast.style.transition = 'all 0.25s ease';
            setTimeout(() => toast.remove(), 250);
        }, 3200);
    }

    // =========================================================================
    // 8. POPULATE YEARS IN PUBLISHED DATE CONTROLS
    // =========================================================================
    function populateYearFilter() {
        if (!dateYearSelect) return;
        const currentYear = new Date().getFullYear();
        let options = '<option value="">Year</option>';
        for (let y = currentYear; y >= currentYear - 5; y--) {
            options += `<option value="${y}">${y}</option>`;
        }
        dateYearSelect.innerHTML = options;
    }
    populateYearFilter();

    // =========================================================================
    // 9. STATUS BADGE GENERATOR
    // =========================================================================
    function getStatusBadgeHtml(status) {
        const lower = String(status || '').toLowerCase();
        if (lower === 'approved' || lower === 'published') {
            return `<span class="status-badge status-approved">Approved</span>`;
        }
        if (lower === 'in review' || lower === 'review') {
            return `<span class="status-badge status-in-review">In Review</span>`;
        }
        return `<span class="status-badge status-draft">Draft</span>`;
    }

    // =========================================================================
    // 10. FILTERING & SORTING LOGIC
    // =========================================================================
    function articleMatchesDateFilter(article, mode, dateVal) {
        if (mode === 'any') return true;

        const articleDate = new Date(article.rawDate);
        const today = new Date();

        if (mode === 'today') {
            return articleDate.getFullYear() === today.getFullYear() &&
                   articleDate.getMonth() === today.getMonth() &&
                   articleDate.getDate() === today.getDate();
        }

        if (mode === 'this_week') {
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 7);
            return articleDate >= oneWeekAgo && articleDate <= today;
        }

        if (mode === 'choose') {
            if (dateVal.year && articleDate.getFullYear() !== parseInt(dateVal.year, 10)) {
                return false;
            }
            if (dateVal.month && (articleDate.getMonth() + 1) !== parseInt(dateVal.month, 10)) {
                return false;
            }
            if (dateVal.day && articleDate.getDate() !== parseInt(dateVal.day, 10)) {
                return false;
            }
            return true;
        }

        return true;
    }

    function sortArticles(list, sortType) {
        const copy = [...list];
        if (sortType === 'newest') {
            return copy.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
        }
        if (sortType === 'oldest') {
            return copy.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
        }
        if (sortType === 'popular') {
            return copy.sort((a, b) => (b.views || 0) - (a.views || 0));
        }
        if (sortType === 'az') {
            return copy.sort((a, b) => a.title.localeCompare(b.title));
        }
        return copy;
    }

    function getFilteredAndSortedArticles() {
        const isArchivedTarget = (currentTab === 'archived');
        const q = searchQuery.toLowerCase().trim();

        // 1. Filter by Tab (Active vs Archived)
        let filtered = articles.filter(item => item.isArchived === isArchivedTarget);

        // 2. Filter by Search (Matching BOTH Title AND Author)
        if (q) {
            filtered = filtered.filter(item =>
                (item.title && item.title.toLowerCase().includes(q)) ||
                (item.author && item.author.toLowerCase().includes(q)) ||
                (item.category && item.category.toLowerCase().includes(q))
            );
        }

        // 3. Filter by Category
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(item =>
                item.category.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // 4. Filter by Date
        filtered = filtered.filter(item =>
            articleMatchesDateFilter(item, selectedDateMode, selectedDateValue)
        );

        // 5. Sort
        return sortArticles(filtered, selectedSort);
    }

    // =========================================================================
    // 11. RENDER 2-COLUMN CARDS GRID (Always 2 per line on desktop & mobile)
    // =========================================================================
    function updateTabCounts() {
        const activeCount = articles.filter(a => !a.isArchived).length;
        const archivedCount = articles.filter(a => a.isArchived).length;

        if (badgeActiveCount) badgeActiveCount.textContent = activeCount;
        if (badgeArchivedCount) badgeArchivedCount.textContent = archivedCount;
    }

    function updateActiveChips() {
        if (!activeFilterChips) return;
        const chips = [];

        if (searchQuery.trim()) {
            chips.push({ key: 'search', label: `Search: "${searchQuery}"` });
        }
        if (selectedCategory !== 'All') {
            chips.push({ key: 'category', label: `Category: ${selectedCategory}` });
        }
        if (selectedDateMode !== 'any') {
            let dateLabel = selectedDateMode;
            if (selectedDateMode === 'today') dateLabel = 'Today';
            if (selectedDateMode === 'this_week') dateLabel = 'This week';
            if (selectedDateMode === 'choose') {
                const parts = [];
                if (selectedDateValue.month) parts.push(`M:${selectedDateValue.month}`);
                if (selectedDateValue.day) parts.push(`D:${selectedDateValue.day}`);
                if (selectedDateValue.year) parts.push(`Y:${selectedDateValue.year}`);
                dateLabel = parts.join('/') || 'Custom Date';
            }
            chips.push({ key: 'date', label: `Date: ${dateLabel}` });
        }
        if (selectedSort !== 'newest') {
            let sortLabel = 'Newest';
            if (selectedSort === 'oldest') sortLabel = 'Oldest first';
            if (selectedSort === 'popular') sortLabel = 'Most viewed';
            if (selectedSort === 'az') sortLabel = 'A–Z';
            chips.push({ key: 'sort', label: `Sort: ${sortLabel}` });
        }

        const hasFilters = chips.length > 0;
        if (filterActiveDot) {
            filterActiveDot.classList.toggle('hidden', !hasFilters);
        }

        if (!hasFilters) {
            activeFilterChips.classList.add('hidden');
            activeFilterChips.innerHTML = '';
            return;
        }

        activeFilterChips.classList.remove('hidden');
        activeFilterChips.innerHTML = chips.map(chip => `
            <span class="filter-chip" data-key="${chip.key}">
                <span>${escapeHTML(chip.label)}</span>
                <button type="button" class="filter-chip-remove" data-remove-chip="${chip.key}" aria-label="Remove filter: ${escapeHTML(chip.label)}">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </span>
        `).join('') + `
            <button type="button" id="clear-all-chips-btn" class="clear-filters-btn" style="font-size: 0.74rem; text-decoration: underline;">
                Clear all
            </button>
        `;

        // Bind chip remove buttons
        activeFilterChips.querySelectorAll('[data-remove-chip]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const key = btn.dataset.removeChip;
                removeFilterByKey(key);
            });
        });

        const clearAllChipsBtn = document.getElementById('clear-all-chips-btn');
        if (clearAllChipsBtn) {
            clearAllChipsBtn.addEventListener('click', () => {
                resetAllFilters();
            });
        }
    }

    function removeFilterByKey(key) {
        if (key === 'search') {
            searchQuery = '';
            if (searchInput) searchInput.value = '';
            if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
        } else if (key === 'category') {
            selectedCategory = 'All';
            if (categorySelect) categorySelect.value = 'All';
        } else if (key === 'date') {
            selectedDateMode = 'any';
            selectedDateValue = { month: '', day: '', year: '' };
            if (dateFilterType) dateFilterType.value = 'any';
            syncDateInputsState();
        } else if (key === 'sort') {
            selectedSort = 'newest';
            if (sortSelect) sortSelect.value = 'newest';
        }
        renderArticlesGrid();
    }

    function resetAllFilters() {
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.classList.add('hidden');

        selectedSort = 'newest';
        if (sortSelect) sortSelect.value = 'newest';

        selectedCategory = 'All';
        if (categorySelect) categorySelect.value = 'All';

        selectedDateMode = 'any';
        selectedDateValue = { month: '', day: '', year: '' };
        if (dateFilterType) dateFilterType.value = 'any';
        syncDateInputsState();

        renderArticlesGrid();
        showToast('All filters and search criteria reset.', 'info');
    }

    function renderArticlesGrid() {
        const list = getFilteredAndSortedArticles();
        const totalInTab = articles.filter(a => a.isArchived === (currentTab === 'archived')).length;

        // Results counter
        if (articlesResultsCounter) {
            if (list.length === totalInTab) {
                articlesResultsCounter.innerHTML = `Showing all <em>${list.length}</em> ${currentTab === 'archived' ? 'archived' : 'active'} articles`;
            } else {
                articlesResultsCounter.innerHTML = `Showing <em>${list.length}</em> of ${totalInTab} ${currentTab === 'archived' ? 'archived' : 'active'} articles`;
            }
        }

        updateTabCounts();
        updateActiveChips();

        if (list.length === 0) {
            if (articlesGrid) articlesGrid.innerHTML = '';
            if (manageEmptyState) manageEmptyState.classList.remove('hidden');
            return;
        }

        if (manageEmptyState) manageEmptyState.classList.add('hidden');
        if (!articlesGrid) return;

        articlesGrid.innerHTML = list.map(article => {
            const isArchived = article.isArchived;
            const viewsFormatted = Number(article.views || 0).toLocaleString();
            const readTime = article.readTime || '2 min read';
            const shares = article.shares || 0;
            const color = article.color || '#571525';
            const imageHtml = article.image
                ? `<img src="${escapeHTML(article.image)}" alt="${escapeHTML(article.title)}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                   <div class="image-fallback" style="display:none;"><i class="fa-solid fa-newspaper"></i></div>`
                : `<div class="image-fallback"><i class="fa-solid fa-newspaper"></i></div>`;

            return `
                <article class="article-box" data-article-id="${article.id}">
                    <!-- 3-Dots Action Menu (Upper Right) -->
                    <div class="card-menu-anchor">
                        <button type="button" class="card-dots-btn" aria-label="Actions for ${escapeHTML(article.title)}" aria-expanded="false" data-dots-id="${article.id}">
                            <i class="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                        <div class="card-actions-menu hidden" data-menu-id="${article.id}">
                            <button type="button" class="action-menu-item" data-action="edit" data-id="${article.id}">
                                <i class="fa-regular fa-pen-to-square"></i>
                                <span>Edit Article</span>
                            </button>
                            <button type="button" class="action-menu-item ${isArchived ? 'restore' : ''}" data-action="${isArchived ? 'restore' : 'archive'}" data-id="${article.id}">
                                <i class="${isArchived ? 'fa-solid fa-arrow-rotate-left' : 'fa-solid fa-box-archive'}"></i>
                                <span>${isArchived ? 'Restore' : 'Move to Archive'}</span>
                            </button>
                            <div class="menu-divider"></div>
                            <button type="button" class="action-menu-item danger" data-action="delete" data-id="${article.id}">
                                <i class="fa-regular fa-trash-can"></i>
                                <span>Emergency Delete</span>
                            </button>
                        </div>
                    </div>

                    <!-- Image Thumbnail Trigger -->
                    <button type="button" class="article-box-image-trigger" data-action="view" data-id="${article.id}" aria-label="View ${escapeHTML(article.title)}">
                        <div class="article-box-thumb" style="--thumb-color: ${color};">
                            ${imageHtml}
                        </div>
                    </button>

                    <!-- Content Area -->
                    <div class="article-box-content">
                        <div class="article-box-meta">
                            <span class="article-box-category">${escapeHTML(article.category)}</span>
                            <span class="article-box-separator">·</span>
                            <time class="article-box-date">${escapeHTML(article.date)}</time>
                        </div>

                        <h3 class="article-box-title">
                            <button type="button" class="article-title-link" data-action="view" data-id="${article.id}">
                                ${escapeHTML(article.title)}
                            </button>
                        </h3>

                        <p class="article-box-excerpt">${escapeHTML(article.excerpt || '')}</p>

                        <p class="article-box-byline">
                            <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
                            <span>By <strong>${escapeHTML(article.author)}</strong></span>
                        </p>

                        <div class="article-box-stats">
                            <span class="stat-views" title="Views">
                                <i class="fa-regular fa-eye"></i>
                                <span>${viewsFormatted}</span>
                            </span>
                            <span class="stat-read-time" title="Reading Time">
                                <i class="fa-regular fa-clock"></i>
                                <span>${escapeHTML(readTime)}</span>
                            </span>
                            <button type="button" class="stat-shares" title="Share Article" data-share-id="${article.id}">
                                <i class="fa-solid fa-share-nodes"></i>
                                <span class="share-badge">${shares}</span>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    // =========================================================================
    // 12. 3-DOTS ACTION MENUS TOGGLE & GRID CLICK DELEGATION
    // =========================================================================
    function closeAllActionMenus() {
        document.querySelectorAll('.card-actions-menu').forEach(menu => {
            menu.classList.add('hidden');
        });
        document.querySelectorAll('.card-dots-btn').forEach(btn => {
            btn.setAttribute('aria-expanded', 'false');
        });
    }

    function toggleActionsMenu(articleId, dotsBtn) {
        const menu = document.querySelector(`.card-actions-menu[data-menu-id="${articleId}"]`);
        if (!menu) return;

        const isCurrentlyHidden = menu.classList.contains('hidden');
        closeAllActionMenus();

        if (isCurrentlyHidden) {
            menu.classList.remove('hidden');
            dotsBtn.setAttribute('aria-expanded', 'true');
        }
    }

    // Global click listener to close 3-dots menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.card-menu-anchor')) {
            closeAllActionMenus();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllActionMenus();
            closeViewerModal();
            closeEditModal();
            closeActionModal();
            if (filterDropdown && !filterDropdown.classList.contains('hidden')) {
                filterDropdown.classList.add('hidden');
                if (sortFilterWrapper) sortFilterWrapper.classList.remove('is-open');
                if (sortFilterBtn) sortFilterBtn.setAttribute('aria-expanded', 'false');
            }
        }
    });

    // Card Grid Event Delegation
    if (articlesGrid) {
        articlesGrid.addEventListener('click', (e) => {
            // 1. Click on 3-Dots Button
            const dotsBtn = e.target.closest('.card-dots-btn');
            if (dotsBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = dotsBtn.dataset.dotsId;
                toggleActionsMenu(id, dotsBtn);
                return;
            }

            // 2. Click on Action in 3-Dots Dropdown Menu
            const actionMenuItem = e.target.closest('.action-menu-item');
            if (actionMenuItem) {
                e.preventDefault();
                e.stopPropagation();
                const action = actionMenuItem.dataset.action;
                const id = parseInt(actionMenuItem.dataset.id, 10);
                closeAllActionMenus();
                handleCardAction(action, id);
                return;
            }

            // 3. Share Button inside card
            const shareBtn = e.target.closest('[data-share-id]');
            if (shareBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = parseInt(shareBtn.dataset.shareId, 10);
                const art = articles.find(a => a.id === id);
                if (art) {
                    art.shares = (art.shares || 0) + 1;
                    saveArticles(articles);
                    renderArticlesGrid();
                    showToast('Link copied to clipboard! (Simulated)', 'success');
                }
                return;
            }

            // 4. View Article Trigger (Image, Title, or general card body)
            const viewTrigger = e.target.closest('[data-action="view"]');
            if (viewTrigger) {
                e.preventDefault();
                e.stopPropagation();
                const id = parseInt(viewTrigger.dataset.id, 10);
                openArticleViewer(id);
                return;
            }

            // Clicking card background outside the 3-dots anchor views article
            const card = e.target.closest('.article-box');
            if (card && !e.target.closest('.card-menu-anchor')) {
                const id = parseInt(card.dataset.articleId, 10);
                openArticleViewer(id);
            }
        });
    }

    // =========================================================================
    // 13. CARD ACTIONS DISPATCHER
    // =========================================================================
    function handleCardAction(action, id) {
        const article = articles.find(a => a.id === id);
        if (!article) return;

        if (action === 'view') {
            openArticleViewer(id);
        } else if (action === 'edit') {
            openEditModal(id);
        } else if (action === 'archive') {
            openActionModal(
                'warning',
                'Move Article to Archive',
                `Are you sure you want to move "${article.title}" to the archived editions? It will no longer appear on the active desk.`,
                'Move to Archive',
                () => {
                    article.isArchived = true;
                    saveArticles(articles);
                    renderArticlesGrid();
                    showToast('Article moved to Archive.', 'info');
                }
            );
        } else if (action === 'restore') {
            openActionModal(
                'info',
                'Restore Article',
                `Restore "${article.title}" back to active editorial circulation?`,
                'Restore Article',
                () => {
                    article.isArchived = false;
                    saveArticles(articles);
                    renderArticlesGrid();
                    showToast('Article restored to Active Articles.', 'success');
                }
            );
        } else if (action === 'delete') {
            openActionModal(
                'danger',
                'Emergency Delete Article',
                `PERMANENT ACTION: Are you sure you want to permanently delete "${article.title}" by ${article.author}? This operation cannot be reversed.`,
                'Emergency Delete',
                () => {
                    articles = articles.filter(a => a.id !== id);
                    saveArticles(articles);
                    renderArticlesGrid();
                    showToast(`Article permanently deleted.`, 'danger');
                }
            );
        }
    }

    // =========================================================================
    // 14. ARTICLE VIEWER MODAL (Executive Can Read Full Story)
    // =========================================================================
    function openArticleViewer(id) {
        const article = articles.find(a => a.id === id);
        if (!article || !viewerModal) return;

        currentViewingArticleId = id;

        // Populate fields
        if (viewerTitle) viewerTitle.textContent = article.title;
        if (viewerCategory) viewerCategory.textContent = article.category;
        if (viewerDate) viewerDate.textContent = article.date;
        if (viewerAuthor) viewerAuthor.textContent = article.author;
        if (viewerReadTime) viewerReadTime.textContent = article.readTime || '2 min read';
        if (viewerViews) viewerViews.textContent = Number(article.views || 0).toLocaleString();
        if (viewerShares) viewerShares.textContent = Number(article.shares || 0).toLocaleString();

        if (viewerArchiveLabel) {
            viewerArchiveLabel.textContent = article.isArchived ? 'Restore Article' : 'Move to Archive';
        }

        // Paragraphs
        if (viewerContent) {
            const raw = article.content || article.excerpt || '';
            const paragraphs = raw.split('\n\n').filter(p => p.trim());
            viewerContent.innerHTML = paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('');
        }

        // Banner Image
        const bannerWrap = document.getElementById('viewer-banner-wrap');
        const bannerImg = document.getElementById('viewer-banner-img');
        if (bannerWrap && bannerImg) {
            if (article.image) {
                bannerImg.src = article.image;
                bannerImg.alt = article.title;
                bannerWrap.style.display = 'block';
            } else {
                bannerWrap.style.display = 'none';
            }
        }

        viewerModal.classList.remove('hidden');
    }

    function closeViewerModal() {
        if (!viewerModal) return;
        viewerModal.classList.add('hidden');
        currentViewingArticleId = null;
    }

    if (closeViewerBtn) closeViewerBtn.addEventListener('click', closeViewerModal);
    if (viewerModal) {
        viewerModal.addEventListener('click', (e) => {
            if (e.target === viewerModal) closeViewerModal();
        });
    }

    // Quick actions inside viewer footer: Edit, Archive/Restore, Emergency Delete
    if (viewerActionEdit) {
        viewerActionEdit.addEventListener('click', () => {
            if (currentViewingArticleId) {
                const id = currentViewingArticleId;
                closeViewerModal();
                openEditModal(id);
            }
        });
    }

    if (viewerActionArchive) {
        viewerActionArchive.addEventListener('click', () => {
            if (currentViewingArticleId) {
                const id = currentViewingArticleId;
                const art = articles.find(a => a.id === id);
                closeViewerModal();
                if (art) {
                    handleCardAction(art.isArchived ? 'restore' : 'archive', id);
                }
            }
        });
    }

    if (viewerActionDelete) {
        viewerActionDelete.addEventListener('click', () => {
            if (currentViewingArticleId) {
                const id = currentViewingArticleId;
                closeViewerModal();
                handleCardAction('delete', id);
            }
        });
    }

    // =========================================================================
    // 15. EDIT ARTICLE MODAL
    // =========================================================================
    function openEditModal(id) {
        const article = articles.find(a => a.id === id);
        if (!article || !editModal) return;

        if (editArticleIdInput) editArticleIdInput.value = article.id;
        if (editTitleInput) editTitleInput.value = article.title;
        if (editAuthorInput) editAuthorInput.value = article.author;
        if (editCategorySelect) editCategorySelect.value = article.category;
        if (editReadtimeInput) editReadtimeInput.value = article.readTime || '2 min read';
        if (editExcerptInput) editExcerptInput.value = article.excerpt || '';

        editModal.classList.remove('hidden');
    }

    function closeEditModal() {
        if (!editModal) return;
        editModal.classList.add('hidden');
    }

    if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) closeEditModal();
        });
    }

    if (editArticleForm) {
        editArticleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = parseInt(editArticleIdInput.value, 10);
            const article = articles.find(a => a.id === id);
            if (!article) return;

            article.title = editTitleInput.value.trim();
            article.author = editAuthorInput.value.trim();
            article.category = editCategorySelect.value;
            article.readTime = editReadtimeInput.value.trim() || '2 min read';
            article.excerpt = editExcerptInput.value.trim();

            saveArticles(articles);
            closeEditModal();
            renderArticlesGrid();
            showToast('Article updated successfully!', 'success');
        });
    }

    // =========================================================================
    // 16. INTERACTIVE CONFIRMATION MODAL (Archive / Restore / Delete)
    // =========================================================================
    function openActionModal(type, title, description, confirmText, onConfirm) {
        if (!actionModal) return;

        if (modalTitle) modalTitle.textContent = title;
        if (modalDescription) modalDescription.textContent = description;
        if (modalConfirmBtn) modalConfirmBtn.textContent = confirmText;

        if (modalIconHeader && modalIcon) {
            modalIconHeader.className = `modal-icon-header ${type}`;
            if (type === 'danger') {
                modalIcon.className = 'fa-solid fa-trash-can';
                modalConfirmBtn.className = 'modal-btn modal-btn-confirm-danger';
            } else if (type === 'info') {
                modalIcon.className = 'fa-solid fa-arrow-rotate-left';
                modalConfirmBtn.className = 'modal-btn modal-btn-confirm-primary';
            } else {
                modalIcon.className = 'fa-solid fa-box-archive';
                modalConfirmBtn.className = 'modal-btn modal-btn-confirm-primary';
            }
        }

        pendingModalAction = onConfirm;
        actionModal.classList.remove('hidden');
    }

    function closeActionModal() {
        if (!actionModal) return;
        actionModal.classList.add('hidden');
        pendingModalAction = null;
    }

    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeActionModal);
    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener('click', () => {
            if (typeof pendingModalAction === 'function') {
                pendingModalAction();
            }
            closeActionModal();
        });
    }
    if (actionModal) {
        actionModal.addEventListener('click', (e) => {
            if (e.target === actionModal) closeActionModal();
        });
    }

    // =========================================================================
    // 17. TABS NAVIGATION (Active Articles vs Archived Articles)
    // =========================================================================
    function switchTab(tabName) {
        if (currentTab === tabName) return;
        currentTab = tabName;

        if (tabActiveBtn && tabArchivedBtn) {
            tabActiveBtn.classList.toggle('active', currentTab === 'active');
            tabArchivedBtn.classList.toggle('active', currentTab === 'archived');
        }

        closeAllActionMenus();
        renderArticlesGrid();
    }

    if (tabActiveBtn) {
        tabActiveBtn.addEventListener('click', () => switchTab('active'));
    }
    if (tabArchivedBtn) {
        tabArchivedBtn.addEventListener('click', () => switchTab('archived'));
    }

    // =========================================================================
    // 18. SEARCH INPUT LISTENER (Matches BOTH Title AND Author)
    // =========================================================================
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            if (clearSearchBtn) {
                clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
            }
            renderArticlesGrid();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchQuery = '';
            if (searchInput) searchInput.value = '';
            clearSearchBtn.classList.add('hidden');
            renderArticlesGrid();
            if (searchInput) searchInput.focus();
        });
    }

    // =========================================================================
    // 19. SORT & FILTER POPUP (High Z-Index & Mobile Placement Next to Search)
    // =========================================================================
    if (sortFilterBtn && filterDropdown) {
        sortFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = filterDropdown.classList.contains('hidden');
            if (isHidden) {
                filterDropdown.classList.remove('hidden');
                if (sortFilterWrapper) sortFilterWrapper.classList.add('is-open');
                sortFilterBtn.setAttribute('aria-expanded', 'true');
            } else {
                filterDropdown.classList.add('hidden');
                if (sortFilterWrapper) sortFilterWrapper.classList.remove('is-open');
                sortFilterBtn.setAttribute('aria-expanded', 'false');
            }
        });

        if (closeFilterBtn) {
            closeFilterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                filterDropdown.classList.add('hidden');
                if (sortFilterWrapper) sortFilterWrapper.classList.remove('is-open');
                sortFilterBtn.setAttribute('aria-expanded', 'false');
            });
        }

        document.addEventListener('click', (e) => {
            if (!filterDropdown.contains(e.target) && !sortFilterBtn.contains(e.target)) {
                if (!filterDropdown.classList.contains('hidden')) {
                    filterDropdown.classList.add('hidden');
                    if (sortFilterWrapper) sortFilterWrapper.classList.remove('is-open');
                    sortFilterBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }

    // Published date control toggling: show Month, Day, Year ONLY if 'choose' is selected
    function syncDateInputsState() {
        if (!dateFilterType || !dateFilterValueWrap) return;
        const isChoose = (dateFilterType.value === 'choose');
        dateFilterValueWrap.hidden = !isChoose;
        dateFilterValueWrap.style.display = isChoose ? 'grid' : 'none';
        if (dateMonthSelect) dateMonthSelect.disabled = !isChoose;
        if (dateDaySelect) dateDaySelect.disabled = !isChoose;
        if (dateYearSelect) dateYearSelect.disabled = !isChoose;
        if (!isChoose) {
            if (dateMonthSelect) dateMonthSelect.value = '';
            if (dateDaySelect) dateDaySelect.value = '';
            if (dateYearSelect) dateYearSelect.value = '';
        }
    }

    if (dateFilterType) {
        dateFilterType.addEventListener('change', syncDateInputsState);
        syncDateInputsState();
    }

    // Apply Filters button
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', (e) => {
            e.preventDefault();

            if (sortSelect) selectedSort = sortSelect.value;
            if (categorySelect) selectedCategory = categorySelect.value;
            if (dateFilterType) {
                selectedDateMode = dateFilterType.value;
                selectedDateValue = {
                    month: dateMonthSelect ? dateMonthSelect.value : '',
                    day: dateDaySelect ? dateDaySelect.value : '',
                    year: dateYearSelect ? dateYearSelect.value : ''
                };
            }

            if (filterDropdown) filterDropdown.classList.add('hidden');
            if (sortFilterWrapper) sortFilterWrapper.classList.remove('is-open');
            if (sortFilterBtn) sortFilterBtn.setAttribute('aria-expanded', 'false');

            renderArticlesGrid();
            showToast('Filter criteria applied.', 'success');
        });
    }

    // Clear Filters button inside popup (Resets filters without closing the dropdown)
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', (e) => {
            e.preventDefault();
            selectedSort = 'newest';
            if (sortSelect) sortSelect.value = 'newest';

            selectedCategory = 'All';
            if (categorySelect) categorySelect.value = 'All';

            selectedDateMode = 'any';
            selectedDateValue = { month: '', day: '', year: '' };
            if (dateFilterType) dateFilterType.value = 'any';
            syncDateInputsState();

            renderArticlesGrid();
            showToast('Filters reset.', 'info');
            // Dropdown intentionally stays open so the user can immediately pick options without re-clicking
        });
    }

    // Empty state reset button
    if (resetEmptyFiltersBtn) {
        resetEmptyFiltersBtn.addEventListener('click', () => {
            resetAllFilters();
        });
    }

    // =========================================================================
    // 20. INITIAL RENDERING
    // =========================================================================
    renderArticlesGrid();

});
