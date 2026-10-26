/**
 * ============================================================================
 * THE LENS — CARTOONIST HEAD MANAGE MY ARTICLES CONTROLLER
 * Copies the Exact Style Format & Logic of Executive Manage My Articles
 * (1:1 Card Structure, Badges, Typography, Metadata, Counters & Modals)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Active Cartoonist Head details
    const headName = localStorage.getItem('cartoonistHeadName') || localStorage.getItem('userName') || 'Danilo Reyes';
    const headRole = 'Cartoonist Head';

    // DOM Elements - Personal Analytics Cards / Header Metric Pill
    const statTotalViews = document.getElementById('stat-total-views');

    // DOM Elements - Tabs & Badges
    const tabButtons = document.querySelectorAll('.manage-tab-btn');
    const badgeAll = document.getElementById('badge-count-all');
    const badgePublished = document.getElementById('badge-count-published');
    const badgePending = document.getElementById('badge-count-pending');
    const badgeRevision = document.getElementById('badge-count-revision');
    const badgeDrafts = document.getElementById('badge-count-drafts');

    // DOM Elements - Search & Sort Toolbar
    const searchInput = document.getElementById('executive-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const sortSelect = document.getElementById('executive-sort-select');

    // DOM Elements - Articles List Container & Empty State
    const articlesListContainer = document.getElementById('executive-manage-list');
    const emptyStateEl = document.getElementById('manage-empty-state');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    // DOM Elements - Article Viewer Modal
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

    // DOM Elements - Remarks Modal
    const remarksModal = document.getElementById('remarks-modal');
    const remarksModalTitle = document.getElementById('remarks-modal-title');
    const remarksModalContent = document.getElementById('remarks-modal-content');
    const closeRemarksModalBtn = document.getElementById('close-remarks-modal-btn');
    const btnEditFromRemarks = document.getElementById('btn-edit-from-remarks');

    // DOM Elements - Delete Modal
    const deleteModal = document.getElementById('delete-modal');
    const deleteArticleTitle = document.getElementById('delete-article-title');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    // Toast Container
    const toastContainer = document.getElementById('toast-container');

    // State
    let currentTab = 'all';
    let searchQuery = '';
    let currentSort = 'newest';
    let pendingDeleteId = null;

    // =========================================================================
    // 1. DATASET: SEEDED & PERSISTED CARTOONIST HEAD ARTICLES
    // =========================================================================
    const DEFAULT_HEAD_ARTICLES = [];

    const STORAGE_KEY = 'cartoonistHeadMyArticles_v1';
    let allArticles = [];

    function getArticles() {
        let personalArticles = [];
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    personalArticles = parsed;
                }
            }
        } catch (e) {
            console.warn('Could not load cartoonistHeadMyArticles_v1', e);
        }

        // Incorporate any drafts from cartoonistHeadArticleDrafts
        try {
            const rawDrafts = localStorage.getItem('cartoonistHeadArticleDrafts');
            if (rawDrafts) {
                const drafts = JSON.parse(rawDrafts);
                if (Array.isArray(drafts)) {
                    drafts.forEach(d => {
                        const exists = personalArticles.some(a => a.id === d.id);
                        if (!exists) {
                            personalArticles.push({
                                id: d.id,
                                author: headName,
                                title: d.title,
                                category: d.category || 'Features',
                                excerpt: d.excerpt || 'Draft manuscript in progress.',
                                date: d.date || 'Oct 25, 2026',
                                rawDate: d.rawDate || '2026-10-25',
                                status: 'Draft',
                                views: 0,
                                shares: 0,
                                remarks: '',
                                content: d.content || ''
                            });
                        }
                    });
                }
            }
        } catch (e) {
            console.warn('Could not parse drafts', e);
        }

        return personalArticles;
    }

    function saveArticles(articles) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
        } catch (e) {
            console.error('Failed to save cartoonist head articles', e);
        }
    }

    // =========================================================================
    // 2. HELPER FUNCTIONS
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
        return (Number(num) || 0).toLocaleString();
    }

    function calculateReadTime(text) {
        if (!text) return '1 min read';
        const words = text.trim().split(/\s+/).length;
        const mins = Math.max(1, Math.ceil(words / 200));
        return `${mins} min read`;
    }

    function decodeCorruptedHtmlEntities(str) {
        if (!str || typeof str !== 'string') return '';
        let decoded = str;
        let maxPasses = 5;
        while (maxPasses > 0 && (/&amp;lt;/i.test(decoded) || /&lt;/i.test(decoded) || /&amp;gt;/i.test(decoded) || /&gt;/i.test(decoded))) {
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
        if (!rawContent) {
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this manuscript.</p>';
        }

        let decoded = decodeCorruptedHtmlEntities(rawContent);

        // Aggressively strip any literal or encoded span tags and style attributes
        decoded = decoded
            .replace(/&lt;\/?span[^&>]*&gt;/gi, '')
            .replace(/<\/?span[^>]*>/gi, '')
            .replace(/\s*style="[^"]*"/gi, '')
            .replace(/\s*style='[^']*'/gi, '')
            .replace(/&lt;[^&>]+&gt;/gi, '');

        // Clean out all HTML tags cleanly and normalize into plain text paragraphs
        const stripped = decoded
            .replace(/<div><br\s*\/?><\/div>/gi, '\n\n')
            .replace(/<\/(?:div|p|blockquote|h[1-6])>/gi, '\n\n')
            .replace(/<\/?(?:div|p|blockquote|h[1-6])[^>]*>/gi, '\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '');

        const paragraphs = stripped
            .split(/\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        if (paragraphs.length === 0) {
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this manuscript.</p>';
        }

        return paragraphs.map(p => `<p class="viewer-paragraph">${escapeHTML(p)}</p>`).join('');
    }

    function showToast(message, type = 'success') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        const resolvedType = type === 'error' ? 'danger' : type;
        toast.className = `toast-message ${resolvedType}`;
        toast.innerHTML = `<span class="toast-bullet-dot"></span><span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-dismissing');
            setTimeout(() => toast.remove(), 260);
        }, 3400);
    }

    // =========================================================================
    // 3. STATS & BADGE COUNTERS (ALL TABS)
    // =========================================================================
    function updateMetricsAndBadges() {
        let countAll = allArticles.length;
        let countPublished = 0;
        let countPending = 0;
        let countRevision = 0;
        let countDrafts = 0;
        let totalViewsCount = 0;

        allArticles.forEach(item => {
            const s = (item.status || '').toLowerCase();
            if (s === 'published') {
                countPublished++;
                totalViewsCount += (parseInt(item.views, 10) || 0);
            } else if (s === 'pending review' || s === 'pending') {
                countPending++;
            } else if (s === 'for revision' || s === 'revision') {
                countRevision++;
            } else if (s === 'draft') {
                countDrafts++;
            }
        });

        if (statTotalViews) statTotalViews.textContent = formatNumber(totalViewsCount);
        if (badgeAll) badgeAll.textContent = countAll;
        if (badgePublished) badgePublished.textContent = countPublished;
        if (badgePending) badgePending.textContent = countPending;
        if (badgeRevision) badgeRevision.textContent = countRevision;
        if (badgeDrafts) badgeDrafts.textContent = countDrafts;
    }

    // =========================================================================
    // 4. ARTICLE RENDERING (EXACT EXECUTIVE WRITER-ARTICLE-CARD DESIGN)
    // =========================================================================
    function renderArticles() {
        if (!articlesListContainer) return;

        allArticles = getArticles();
        updateMetricsAndBadges();

        // Filter by Tab
        let filtered = allArticles.filter(item => {
            const s = (item.status || '').toLowerCase();
            if (currentTab === 'all') return true;
            if (currentTab === 'published') return s === 'published';
            if (currentTab === 'pending') return s === 'pending review' || s === 'pending';
            if (currentTab === 'revision') return s === 'for revision' || s === 'revision';
            if (currentTab === 'drafts') return s === 'draft';
            return true;
        });

        // Filter by Search Query
        if (searchQuery.trim().length > 0) {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(a =>
                (a.title && a.title.toLowerCase().includes(q)) ||
                (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
                (a.category && a.category.toLowerCase().includes(q))
            );
        }

        // Sort Control
        filtered.sort((a, b) => {
            if (currentSort === 'newest') {
                return (b.rawDate || '').localeCompare(a.rawDate || '');
            } else if (currentSort === 'oldest') {
                return (a.rawDate || '').localeCompare(b.rawDate || '');
            } else if (currentSort === 'popular') {
                return (Number(b.views) || 0) - (Number(a.views) || 0);
            } else if (currentSort === 'az') {
                return (a.title || '').localeCompare(b.title || '');
            }
            return 0;
        });

        // Empty State handling
        if (filtered.length === 0) {
            articlesListContainer.innerHTML = '';
            if (emptyStateEl) emptyStateEl.classList.remove('hidden');
            return;
        }

        if (emptyStateEl) emptyStateEl.classList.add('hidden');

        // Render articles with exact executive card layout
        articlesListContainer.innerHTML = filtered.map(item => {
            const s = (item.status || '').toLowerCase();
            let badgeClass = 'status-draft';
            let statusText = item.status || 'Draft';

            if (s === 'published') {
                badgeClass = 'status-published';
                statusText = 'Published';
            } else if (s === 'pending review' || s === 'pending') {
                badgeClass = 'status-pending';
                statusText = 'Pending Review';
            } else if (s === 'for revision' || s === 'revision') {
                badgeClass = 'status-revision';
                statusText = 'For Revision';
            } else if (s === 'draft') {
                badgeClass = 'status-draft';
                statusText = 'Draft';
            }

            const isPublished = s === 'published';
            const isDraft = s === 'draft';
            const isRevision = s === 'for revision' || s === 'revision';

            return `
                <article class="writer-article-card animate-fade-in delay-1" data-id="${item.id}" tabindex="0" role="button" aria-label="View article: ${escapeHTML(item.title)}">
                    <div class="article-card-header">
                        <div class="article-card-meta">
                            <span class="article-card-category">${escapeHTML(item.category || 'General')}</span>
                            <span class="meta-dot">&bull;</span>
                            <span class="article-card-date">
                                <i class="fa-regular fa-calendar"></i> ${escapeHTML(item.date)}
                            </span>
                            ${isPublished && item.views !== undefined ? `
                                <span class="meta-dot">&bull;</span>
                                <span class="article-card-date">
                                    <i class="fa-regular fa-eye"></i> ${formatNumber(item.views)} views
                                </span>
                            ` : ''}
                            ${item.remarks ? `
                                <span class="meta-dot">&bull;</span>
                                <span class="btn-show-remarks" data-id="${item.id}" style="color: #b42318; font-size: 0.74rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;" title="View editorial feedback">
                                    <i class="fa-solid fa-comment-dots"></i> Feedback
                                </span>
                            ` : ''}
                        </div>
                        <div class="article-card-status-top">
                            <span class="status-badge ${badgeClass}">${escapeHTML(statusText)}</span>
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

                    ${(isDraft || isRevision) ? `
                        <div class="article-card-footer">
                            ${isDraft ? `
                                <a href="cartoonist-head-submit-article.html?draftId=${encodeURIComponent(item.id)}" class="btn-box-view" style="text-decoration: none;" title="Edit draft in editor" onclick="event.stopPropagation()">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                    <span>Edit</span>
                                </a>
                                <button type="button" class="btn-box-view btn-delete-draft" data-id="${item.id}" data-title="${escapeHTML(item.title)}" style="color: #b42318;" title="Delete draft" onclick="event.stopPropagation()">
                                    <i class="fa-regular fa-trash-can"></i>
                                    <span>Delete</span>
                                </button>
                            ` : ''}

                            ${isRevision ? `
                                <a href="cartoonist-head-submit-article.html?draftId=${encodeURIComponent(item.id)}" class="btn-box-view" style="text-decoration: none;" title="Edit and revise manuscript" onclick="event.stopPropagation()">
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

    // =========================================================================
    // 5. EVENT LISTENERS: TABS, SEARCH, SORT
    // =========================================================================
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            currentTab = btn.getAttribute('data-tab');
            renderArticles();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            if (clearSearchBtn) {
                clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
            }
            renderArticles();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.classList.add('hidden');
            renderArticles();
            searchInput.focus();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderArticles();
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            searchQuery = '';
            if (searchInput) searchInput.value = '';
            if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
            currentSort = 'newest';
            if (sortSelect) sortSelect.value = 'newest';
            currentTab = 'all';

            tabButtons.forEach(b => {
                const isAll = b.getAttribute('data-tab') === 'all';
                b.classList.toggle('active', isAll);
                b.setAttribute('aria-selected', isAll ? 'true' : 'false');
            });

            renderArticles();
        });
    }

    // =========================================================================
    // 6. CARD INTERACTIONS & MODAL PREVIEWS
    // =========================================================================
    function openRemarksModal(articleId) {
        if (!remarksModal) return;
        const article = allArticles.find(a => a.id === articleId);
        if (!article) return;

        if (remarksModalTitle) remarksModalTitle.textContent = article.title;
        if (remarksModalContent) remarksModalContent.textContent = article.remarks || 'No remarks provided.';
        if (btnEditFromRemarks) {
            btnEditFromRemarks.href = `cartoonist-head-submit-article.html?draftId=${encodeURIComponent(article.id)}`;
        }
        remarksModal.classList.remove('hidden');
    }

    function attachCardEventListeners() {
        const cards = articlesListContainer.querySelectorAll('.writer-article-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const articleId = card.getAttribute('data-id');
                openArticleViewer(articleId);
            });
        });

        const remarksBadges = articlesListContainer.querySelectorAll('.btn-show-remarks');
        remarksBadges.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const articleId = btn.getAttribute('data-id');
                if (articleId) openRemarksModal(articleId);
            });
        });

        const deleteButtons = articlesListContainer.querySelectorAll('.btn-delete-draft');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                pendingDeleteId = btn.getAttribute('data-id');
                const title = btn.getAttribute('data-title');
                if (deleteArticleTitle) deleteArticleTitle.textContent = `"${title}"`;
                if (deleteModal) deleteModal.classList.remove('hidden');
            });
        });
    }

    function openArticleViewer(articleId) {
        if (!viewerModal) return;
        const article = allArticles.find(a => a.id === articleId);
        if (!article) return;

        if (viewerTitle) viewerTitle.textContent = article.title;
        if (viewerCategory) viewerCategory.textContent = article.category || 'General';
        if (viewerDate) viewerDate.textContent = article.date;
        if (viewerAuthor) viewerAuthor.textContent = article.author || headName;

        if (viewerReadTime) {
            viewerReadTime.textContent = calculateReadTime(article.content || article.excerpt);
        }

        // Stats Bar: Only on Published
        if (viewerStatsBar) {
            if (article.status === 'Published') {
                if (viewerViews) viewerViews.textContent = formatNumber(article.views || 0);
                if (viewerShares) viewerShares.textContent = formatNumber(article.shares || Math.round((article.views || 0) * 0.08));
                viewerStatsBar.style.display = 'flex';
            } else {
                viewerStatsBar.style.display = 'none';
            }
        }

        const viewerExcerpt = document.getElementById('viewer-excerpt');
        if (viewerExcerpt) {
            const rawExcerpt = article.excerpt || (item && item.excerpt) || '';
            if (rawExcerpt && rawExcerpt.trim()) {
                viewerExcerpt.textContent = rawExcerpt.trim();
                viewerExcerpt.style.display = 'block';
            } else {
                viewerExcerpt.style.display = 'none';
            }
        }

        if (viewerBannerWrap && viewerBannerImg) {
            if (article.banner || article.image) {
                viewerBannerImg.src = article.banner || article.image;
                viewerBannerImg.alt = article.title;
                viewerBannerWrap.style.display = 'block';
            } else {
                viewerBannerWrap.style.display = 'none';
            }
        }

        if (viewerContent) {
            viewerContent.innerHTML = formatCleanArticleContent(article.content || article.excerpt);
        }

        // Remarks in Viewer
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
        if (viewerModal) viewerModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    if (closeViewerBtn) {
        closeViewerBtn.addEventListener('click', closeArticleViewer);
    }

    if (closeRemarksModalBtn) {
        closeRemarksModalBtn.addEventListener('click', () => {
            if (remarksModal) remarksModal.classList.add('hidden');
        });
    }

    if (viewerModal) {
        viewerModal.addEventListener('click', (e) => {
            if (e.target === viewerModal) closeArticleViewer();
        });
    }

    if (remarksModal) {
        remarksModal.addEventListener('click', (e) => {
            if (e.target === remarksModal) remarksModal.classList.add('hidden');
        });
    }

    // Delete Draft Actions
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            pendingDeleteId = null;
            if (deleteModal) deleteModal.classList.add('hidden');
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (!pendingDeleteId) return;

            allArticles = allArticles.filter(a => a.id !== pendingDeleteId);
            saveArticles(allArticles);

            // Also remove from cartoonistHeadArticleDrafts if present
            try {
                const rawDrafts = localStorage.getItem('cartoonistHeadArticleDrafts');
                if (rawDrafts) {
                    let drafts = JSON.parse(rawDrafts);
                    if (Array.isArray(drafts)) {
                        drafts = drafts.filter(d => d.id !== pendingDeleteId);
                        localStorage.setItem('cartoonistHeadArticleDrafts', JSON.stringify(drafts));
                    }
                }
            } catch (e) {
                // Ignore
            }

            if (deleteModal) deleteModal.classList.add('hidden');
            renderArticles();
            showToast('Draft deleted successfully.', 'danger');
            pendingDeleteId = null;
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

    // =========================================================================
    // 7. INITIAL RENDER
    // =========================================================================
    renderArticles();
});
