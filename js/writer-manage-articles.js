/**
 * ============================================================================
 * THE LENS — WRITER MANAGE ARTICLES CONTROLLER
 * Filter, Search, Sort & Manage Manuscripts Authored by the Active Writer
 * Clean Article Viewing (No visible <div> tags, Author Name & Photo Only,
 * Views/Shares on Published Only, Section Head Feedback)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. ACTIVE WRITER RESOLUTION
    // =========================================================================
    const activeWriterId = (typeof getActiveWriterId === 'function') 
        ? getActiveWriterId() 
        : (localStorage.getItem('writerId') || 'sofia-alcaraz');

    const storedName = localStorage.getItem('userName') || (activeWriterId === 'marco-valderrama' ? 'Marco L. Valderrama' : 'Sofia M. Alcaraz');

    // DOM Elements - Tabs & Badges
    const tabButtons = document.querySelectorAll('.manage-tab-btn');
    const badgeAll = document.getElementById('badge-count-all');
    const badgePublished = document.getElementById('badge-count-published');
    const badgePending = document.getElementById('badge-count-pending');
    const badgeRevision = document.getElementById('badge-count-revision');
    const badgeDrafts = document.getElementById('badge-count-drafts');

    // DOM Elements - Search & Sort
    const searchInput = document.getElementById('writer-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const sortSelect = document.getElementById('writer-sort-select');

    // DOM Elements - Containers & Empty State
    const articlesListContainer = document.getElementById('writer-manage-list');
    const emptyStateEl = document.getElementById('manage-empty-state');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    // DOM Elements - Executive Parity Article Viewer Modal
    const viewerModal = document.getElementById('article-viewer-modal');
    const viewerTitle = document.getElementById('viewer-title');
    const viewerCategory = document.getElementById('viewer-category');
    const viewerDate = document.getElementById('viewer-date');
    const viewerAuthor = document.getElementById('viewer-author');
    const viewerReadTime = document.getElementById('viewer-read-time');
    const viewerStatsBar = document.getElementById('viewer-stats-bar');
    const viewerViews = document.getElementById('viewer-views');
    const viewerShares = document.getElementById('viewer-shares');
    const viewerBannerWrap = document.getElementById('viewer-banner-wrap');
    const viewerBannerImg = document.getElementById('viewer-banner-img');
    const viewerContent = document.getElementById('viewer-content');
    const viewerRemarksWrap = document.getElementById('viewer-remarks-wrap');
    const viewerRemarksText = document.getElementById('viewer-remarks-text');
    const closeViewerBtn = document.getElementById('close-viewer-btn');

    // DOM Elements - Remarks Dedicated Modal
    const remarksModal = document.getElementById('remarks-modal');
    const remarksModalTitle = document.getElementById('remarks-modal-title');
    const remarksModalContent = document.getElementById('remarks-modal-content');
    const closeRemarksModalBtn = document.getElementById('close-remarks-modal-btn');
    const btnEditFromRemarks = document.getElementById('btn-edit-from-remarks');

    // DOM Elements - Delete Draft Confirmation Modal & Toast
    const deleteModal = document.getElementById('delete-modal');
    const deleteArticleTitle = document.getElementById('delete-article-title');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const toastContainer = document.getElementById('toast-container');
    let pendingDeleteId = null;

    // State Variables
    let currentTab = 'all';
    let searchQuery = '';
    let currentSort = 'newest';
    let activeRemarksArticleId = null;

    // =========================================================================
    // 2. UTILITY FUNCTIONS
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

    function formatNumber(num) {
        if (num >= 1000) {
            return Number(num).toLocaleString('en-US');
        }
        return String(num || 0);
    }

    function calculateReadTime(text) {
        if (!text) return '1 min read';
        const cleanText = text.replace(/<[^>]*>/g, '').trim();
        const words = cleanText ? cleanText.split(/\s+/).length : 0;
        const mins = Math.max(1, Math.ceil(words / 200));
        return `${mins} min read`;
    }

    function formatCleanArticleContent(rawContent) {
        if (!rawContent) {
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this manuscript.</p>';
        }

        // Clean out any raw HTML tags (div, br, p) and normalize to plain text paragraphs
        const stripped = rawContent
            .replace(/<div><br\s*\/?><\/div>/gi, '\n\n')
            .replace(/<\/?div[^>]*>/gi, '\n')
            .replace(/<\/?p[^>]*>/gi, '\n\n')
            .replace(/<br\s*\/?>/gi, '\n');

        const paragraphs = stripped
            .split(/\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        if (paragraphs.length === 0) {
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this manuscript.</p>';
        }

        return paragraphs.map(p => `<p class="viewer-paragraph">${escapeHTML(p)}</p>`).join('');
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'Published':
                return 'status-published';
            case 'Pending Review':
                return 'status-pending';
            case 'For Revision':
                return 'status-revision';
            case 'Draft':
            default:
                return 'status-draft';
        }
    }

    function showToast(message, type = 'success') {
        if (!toastContainer) return;

        const existing = toastContainer.querySelectorAll('.toast-message');
        existing.forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;
        toast.innerHTML = `<span class="toast-bullet-dot"></span><span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-dismissing');
            setTimeout(() => toast.remove(), 260);
        }, 3400);
    }

    // =========================================================================
    // 3. DATA FETCHING & TAB BADGES
    // =========================================================================
    function fetchMyArticles() {
        if (typeof getMyArticles === 'function') {
            return getMyArticles(activeWriterId);
        }
        return [];
    }

    function updateTabBadges(articles) {
        const total = articles.length;
        const published = articles.filter(a => a.status === 'Published').length;
        const pending = articles.filter(a => a.status === 'Pending Review').length;
        const revision = articles.filter(a => a.status === 'For Revision').length;
        const drafts = articles.filter(a => a.status === 'Draft').length;

        if (badgeAll) badgeAll.textContent = String(total);
        if (badgePublished) badgePublished.textContent = String(published);
        if (badgePending) badgePending.textContent = String(pending);
        if (badgeRevision) badgeRevision.textContent = String(revision);
        if (badgeDrafts) badgeDrafts.textContent = String(drafts);
    }

    // =========================================================================
    // 4. FILTERING & SORTING
    // =========================================================================
    function filterAndSortArticles() {
        const allMyArticles = fetchMyArticles();
        updateTabBadges(allMyArticles);

        // Filter by tab
        let filtered = allMyArticles.filter(item => {
            if (currentTab === 'published') return item.status === 'Published';
            if (currentTab === 'pending') return item.status === 'Pending Review';
            if (currentTab === 'revision') return item.status === 'For Revision';
            if (currentTab === 'drafts') return item.status === 'Draft';
            return true; // 'all'
        });

        // Filter by search query
        if (searchQuery.trim().length > 0) {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(item => {
                const title = (item.title || '').toLowerCase();
                const cat = (item.category || '').toLowerCase();
                const excerpt = (item.excerpt || '').toLowerCase();
                const content = (item.content || '').toLowerCase();
                return title.includes(q) || cat.includes(q) || excerpt.includes(q) || content.includes(q);
            });
        }

        // Sort items
        filtered.sort((a, b) => {
            const dateA = new Date(a.rawDate || a.date).getTime() || 0;
            const dateB = new Date(b.rawDate || b.date).getTime() || 0;

            if (currentSort === 'newest') {
                return dateB - dateA;
            } else if (currentSort === 'oldest') {
                return dateA - dateB;
            } else if (currentSort === 'popular') {
                return (Number(b.views) || 0) - (Number(a.views) || 0);
            } else if (currentSort === 'az') {
                return (a.title || '').localeCompare(b.title || '');
            }
            return dateB - dateA;
        });

        renderList(filtered);
    }

    // =========================================================================
    // 5. RENDER ARTICLES LIST (Click card to view, no redundant View button)
    // =========================================================================
    function renderList(articles) {
        if (!articlesListContainer) return;

        if (articles.length === 0) {
            articlesListContainer.innerHTML = '';
            if (emptyStateEl) emptyStateEl.classList.remove('hidden');
            return;
        }

        if (emptyStateEl) emptyStateEl.classList.add('hidden');

        articlesListContainer.innerHTML = articles.map(item => {
            const badgeClass = getStatusBadgeClass(item.status);

            return `
                <article class="writer-article-card" data-id="${item.id}" tabindex="0" role="button" aria-label="View article: ${escapeHTML(item.title)}">
                    <div class="article-card-header">
                        <div class="article-card-meta">
                            <span class="article-card-category">${escapeHTML(item.category || 'General')}</span>
                            <span class="meta-dot">&bull;</span>
                            <span class="article-card-date">
                                <i class="fa-regular fa-calendar"></i> ${escapeHTML(item.date)}
                            </span>
                            ${item.status === 'Published' && item.views !== undefined ? `
                                <span class="meta-dot">&bull;</span>
                                <span class="article-card-date">
                                    <i class="fa-regular fa-eye"></i> ${formatNumber(item.views)} views
                                </span>
                            ` : ''}
                            ${item.remarks ? `
                                <span class="meta-dot">&bull;</span>
                                <span style="color: #b42318; font-size: 0.74rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                                    <i class="fa-solid fa-comment-dots"></i> Feedback
                                </span>
                            ` : ''}
                        </div>
                        <div class="article-card-status-top">
                            <span class="status-badge ${badgeClass}">${escapeHTML(item.status)}</span>
                        </div>
                    </div>

                    <div class="article-card-body">
                        <h3 class="article-card-title">${escapeHTML(item.title)}</h3>
                        ${item.excerpt ? `
                            <p class="article-card-excerpt">
                                ${escapeHTML(item.excerpt)}
                            </p>
                        ` : ''}
                    </div>

                    ${(item.status === 'Draft' || item.status === 'For Revision') ? `
                        <div class="article-card-footer">
                            ${item.status === 'Draft' ? `
                                <a href="writer-submit-article.html?draftId=${encodeURIComponent(item.id)}" class="btn-box-view" style="text-decoration: none;" title="Edit draft in editor" onclick="event.stopPropagation()">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                    <span>Edit</span>
                                </a>
                                <button type="button" class="btn-box-view btn-delete-draft" data-id="${item.id}" data-title="${escapeHTML(item.title)}" style="color: #b42318;" title="Delete draft" onclick="event.stopPropagation()">
                                    <i class="fa-regular fa-trash-can"></i>
                                    <span>Delete</span>
                                </button>
                            ` : ''}

                            ${item.status === 'For Revision' ? `
                                <a href="writer-submit-article.html?draftId=${encodeURIComponent(item.id)}" class="btn-box-view" style="text-decoration: none;" title="Edit and revise manuscript" onclick="event.stopPropagation()">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                    <span>Revise</span>
                                </a>
                            ` : ''}
                        </div>
                    ` : ''}
                </article>
            `;
        }).join('');

        attachCardEventListeners();
    }

    function attachCardEventListeners() {
        if (!articlesListContainer) return;
        const deleteButtons = articlesListContainer.querySelectorAll('.btn-delete-draft');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                pendingDeleteId = btn.getAttribute('data-id');
                const title = btn.getAttribute('data-title') || 'this draft';
                if (deleteArticleTitle) deleteArticleTitle.textContent = `"${title}"`;
                if (deleteModal) deleteModal.classList.remove('hidden');
            });
        });
    }

    // =========================================================================
    // 6. ARTICLE VIEWER MODAL LOGIC (EXECUTIVE PARITY DESIGN)
    // =========================================================================
    function openArticleViewer(articleId) {
        if (!viewerModal) return;
        const myArticles = fetchMyArticles();
        const article = myArticles.find(a => a.id === articleId);
        if (!article) return;

        if (viewerTitle) viewerTitle.textContent = article.title;
        if (viewerCategory) viewerCategory.textContent = article.category || 'General';
        if (viewerDate) viewerDate.textContent = article.date;
        
        // Author attribution: Name and Avatar only (no role badge)
        if (viewerAuthor) viewerAuthor.textContent = article.author || storedName;

        if (viewerReadTime) {
            viewerReadTime.textContent = article.readTime || calculateReadTime(article.content || article.excerpt);
        }

        // Views and Shares Stats Bar: Visible ONLY if the article is Published
        if (viewerStatsBar) {
            if (article.status === 'Published') {
                if (viewerViews) viewerViews.textContent = `${formatNumber(article.views || 0)} views`;
                if (viewerShares) viewerShares.textContent = `${formatNumber(article.shares || Math.round((article.views || 0) * 0.08))} shares`;
                viewerStatsBar.style.display = 'flex';
            } else {
                viewerStatsBar.style.display = 'none';
            }
        }

        if (viewerBannerWrap && viewerBannerImg) {
            if (article.image) {
                viewerBannerImg.src = article.image;
                viewerBannerImg.alt = article.title;
                viewerBannerWrap.style.display = 'block';
            } else {
                viewerBannerWrap.style.display = 'none';
            }
        }

        // Clean paragraphs formatting (no visible <div> tags)
        if (viewerContent) {
            viewerContent.innerHTML = formatCleanArticleContent(article.content || article.excerpt);
        }

        // Remarks box: Section Head Feedback
        if (viewerRemarksWrap && viewerRemarksText) {
            if (article.remarks && article.remarks.trim().length > 0) {
                viewerRemarksText.textContent = article.remarks;
                viewerRemarksWrap.style.display = 'block';
            } else {
                viewerRemarksWrap.style.display = 'none';
            }
        }

        viewerModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeArticleViewer() {
        if (viewerModal) {
            viewerModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    function openRemarksModal(articleId) {
        if (!remarksModal) return;
        const myArticles = fetchMyArticles();
        const article = myArticles.find(a => a.id === articleId);
        if (!article) return;

        activeRemarksArticleId = article.id;
        if (remarksModalTitle) remarksModalTitle.textContent = article.title;
        if (remarksModalContent) remarksModalContent.textContent = article.remarks || 'No remarks provided by the section head.';

        remarksModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeRemarksModal() {
        if (remarksModal) {
            remarksModal.classList.add('hidden');
            document.body.style.overflow = '';
            activeRemarksArticleId = null;
        }
    }

    // =========================================================================
    // 7. EVENT LISTENERS
    // =========================================================================

    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            currentTab = btn.getAttribute('data-tab') || 'all';
            filterAndSortArticles();
        });
    });

    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchQuery = searchInput.value;
            if (clearSearchBtn) {
                if (searchQuery.length > 0) {
                    clearSearchBtn.classList.remove('hidden');
                } else {
                    clearSearchBtn.classList.add('hidden');
                }
            }
            filterAndSortArticles();
        });
    }

    // Clear search
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.classList.add('hidden');
            filterAndSortArticles();
            if (searchInput) searchInput.focus();
        });
    }

    // Sort select
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            filterAndSortArticles();
        });
    }

    // Reset filters
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            searchQuery = '';
            if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
            if (sortSelect) sortSelect.value = 'newest';
            currentSort = 'newest';

            tabButtons.forEach(b => {
                if (b.getAttribute('data-tab') === 'all') {
                    b.classList.add('active');
                    b.setAttribute('aria-selected', 'true');
                } else {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                }
            });
            currentTab = 'all';

            filterAndSortArticles();
        });
    }

    // Articles List delegation: click anywhere on card opens Executive Viewer
    if (articlesListContainer) {
        articlesListContainer.addEventListener('click', (e) => {
            const remarksBtn = e.target.closest('.btn-show-remarks');
            const card = e.target.closest('.writer-article-card');

            if (remarksBtn) {
                e.stopPropagation();
                const articleId = remarksBtn.getAttribute('data-id');
                if (articleId) openRemarksModal(articleId);
            } else if (card && card.dataset.id) {
                openArticleViewer(card.dataset.id);
            }
        });

        // Keyboard navigation
        articlesListContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const card = e.target.closest('.writer-article-card');
                if (card && card.dataset.id) {
                    e.preventDefault();
                    openArticleViewer(card.dataset.id);
                }
            }
        });
    }

    // Viewer modal close handlers
    if (closeViewerBtn) {
        closeViewerBtn.addEventListener('click', closeArticleViewer);
    }

    if (viewerModal) {
        viewerModal.addEventListener('click', (e) => {
            if (e.target === viewerModal) {
                closeArticleViewer();
            }
        });
    }

    // Remarks modal close handlers
    if (closeRemarksModalBtn) {
        closeRemarksModalBtn.addEventListener('click', closeRemarksModal);
    }

    if (remarksModal) {
        remarksModal.addEventListener('click', (e) => {
            if (e.target === remarksModal) {
                closeRemarksModal();
            }
        });
    }

    // Edit from remarks modal
    if (btnEditFromRemarks) {
        btnEditFromRemarks.addEventListener('click', () => {
            if (activeRemarksArticleId) {
                window.location.href = `writer-submit-article.html?draftId=${encodeURIComponent(activeRemarksArticleId)}`;
            }
        });
    }

    // Delete Draft Modal Handlers
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            pendingDeleteId = null;
            if (deleteModal) deleteModal.classList.add('hidden');
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (!pendingDeleteId) return;

            if (typeof loadAllWriterArticles === 'function' && typeof saveAllWriterArticles === 'function') {
                const all = loadAllWriterArticles();
                const filtered = all.filter(a => a.id !== pendingDeleteId);
                saveAllWriterArticles(filtered);
            }

            if (deleteModal) deleteModal.classList.add('hidden');
            pendingDeleteId = null;

            filterAndSortArticles();
            showToast('Draft manuscript deleted successfully.', 'success');
        });
    }

    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                pendingDeleteId = null;
                deleteModal.classList.add('hidden');
            }
        });
    }

    // Global ESC key listener to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeArticleViewer();
            closeRemarksModal();
            if (deleteModal && !deleteModal.classList.contains('hidden')) {
                pendingDeleteId = null;
                deleteModal.classList.add('hidden');
            }
        }
    });

    // Initial render
    filterAndSortArticles();
});
