/**
 * ============================================================================
 * THE LENS — SECTION HEAD MANAGE MY ARTICLES CONTROLLER
 * Copies the Exact Format, Style & Logic of Executive Manage My Articles
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 0. AUTHENTICATION & ROLE DETECTION
    // =========================================================================
    const activeRole = localStorage.getItem('userRole') || 'News Head';
    const authorName = localStorage.getItem('userName') || localStorage.getItem('sectionHeadName') || 'Danilo C. Ramos';
    const currentSection = localStorage.getItem('sectionHeadSection') || 'News';

    // DOM Elements - Header Total Views Metric Pill
    const statTotalViews = document.getElementById('stat-total-views');

    // DOM Elements - Tabs & Badges
    const tabButtons = document.querySelectorAll('.manage-tab-btn');
    const badgeAll = document.getElementById('badge-count-all');
    const badgePublished = document.getElementById('badge-count-published');
    const badgePending = document.getElementById('badge-count-pending');
    const badgeRevision = document.getElementById('badge-count-revision');
    const badgeDrafts = document.getElementById('badge-count-drafts');

    // DOM Elements - Search & Sort Toolbar
    const searchInput = document.getElementById('section-head-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const sortSelect = document.getElementById('section-head-sort-select');

    // DOM Elements - Articles List Container & Empty State
    const articlesListContainer = document.getElementById('section-head-manage-list');
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
    let activeRemarksArticleId = null;

    // =========================================================================
    // 1. DATASET: SEEDED & PERSISTED SECTION HEAD ARTICLES
    // =========================================================================
    const STORAGE_KEY = 'sectionHeadMyArticles_v1';

    const DEFAULT_SEED_ARTICLES = [];

    function getArticles() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('Could not parse articles from localStorage', e);
        }
        return [];
    }

    function saveArticles(articles) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
        } catch (e) {
            console.warn('Could not save articles to localStorage', e);
        }
    }

    let allArticles = getArticles();

    // =========================================================================
    // 2. HELPER FUNCTIONS
    // =========================================================================
    function formatNumber(num) {
        return (Number(num) || 0).toLocaleString();
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function calculateReadTime(text) {
        if (!text) return '1 min read';
        const words = String(text).trim().split(/\s+/).length;
        const minutes = Math.max(1, Math.ceil(words / 200));
        return `${minutes} min read`;
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

    function formatCleanArticleContent(raw) {
        if (!raw || typeof raw !== 'string') {
            return '<p class="viewer-paragraph"><em>No manuscript body provided.</em></p>';
        }

        let decoded = decodeCorruptedHtmlEntities(raw);

        // Aggressively strip any literal or encoded span tags and style attributes
        decoded = decoded
            .replace(/&lt;\/?span[^&>]*&gt;/gi, '')
            .replace(/<\/?span[^>]*>/gi, '')
            .replace(/\s*style="[^"]*"/gi, '')
            .replace(/\s*style='[^']*'/gi, '')
            .replace(/&lt;[^&>]+&gt;/gi, '');

        const stripped = decoded
            .replace(/<div><br\s*\/?><\/div>/gi, '\n\n')
            .replace(/<\/(?:div|p|blockquote|h[1-6])>/gi, '\n\n')
            .replace(/<\/?(?:div|p|blockquote|h[1-6])[^>]*>/gi, '\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '');

        const paragraphs = stripped
            .split(/\n\s*\n|\n/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        if (paragraphs.length === 0) {
            return '<p class="viewer-paragraph"><em>No manuscript body provided.</em></p>';
        }

        return paragraphs.map(p => `<p class="viewer-paragraph">${escapeHTML(p)}</p>`).join('');
    }

    function showToast(message, type = 'info') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;
        const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-circle-info';
        toast.innerHTML = `
            <i class="fa-solid ${iconClass}"></i>
            <span>${escapeHTML(message)}</span>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('visible'), 20);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    // =========================================================================
    // 3. ANALYTICS & TAB COUNTERS
    // =========================================================================
    function updateAnalyticsAndCounters() {
        const publishedArticles = allArticles.filter(a => a.status === 'Published');
        const pendingArticles = allArticles.filter(a => a.status === 'Pending Review');
        const revisionArticles = allArticles.filter(a => a.status === 'For Revision');
        const draftArticles = allArticles.filter(a => a.status === 'Draft');

        const totalViews = publishedArticles.reduce((sum, a) => sum + (Number(a.views) || 0), 0);

        // Header total views badge pill
        if (statTotalViews) statTotalViews.textContent = formatNumber(totalViews);

        // Tab count badges
        if (badgeAll) badgeAll.textContent = allArticles.length;
        if (badgePublished) badgePublished.textContent = publishedArticles.length;
        if (badgePending) badgePending.textContent = pendingArticles.length;
        if (badgeRevision) badgeRevision.textContent = revisionArticles.length;
        if (badgeDrafts) badgeDrafts.textContent = draftArticles.length;
    }

    // =========================================================================
    // 4. ARTICLE RENDERING & FILTERING (Exact Executive Parity)
    // =========================================================================
    function renderArticles() {
        if (!articlesListContainer) return;

        let filtered = [...allArticles];

        // Tab Filter
        if (currentTab === 'published') {
            filtered = filtered.filter(a => a.status === 'Published');
        } else if (currentTab === 'pending') {
            filtered = filtered.filter(a => a.status === 'Pending Review');
        } else if (currentTab === 'revision') {
            filtered = filtered.filter(a => a.status === 'For Revision');
        } else if (currentTab === 'drafts') {
            filtered = filtered.filter(a => a.status === 'Draft');
        }

        // Search Filter
        if (searchQuery.trim().length > 0) {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(a => {
                const titleMatch = (a.title || '').toLowerCase().includes(q);
                const categoryMatch = (a.category || '').toLowerCase().includes(q);
                const excerptMatch = (a.excerpt || '').toLowerCase().includes(q);
                return titleMatch || categoryMatch || excerptMatch;
            });
        }

        // Sort Filter
        if (currentSort === 'newest') {
            filtered.sort((a, b) => new Date(b.rawDate || b.date) - new Date(a.rawDate || a.date));
        } else if (currentSort === 'oldest') {
            filtered.sort((a, b) => new Date(a.rawDate || a.date) - new Date(b.rawDate || b.date));
        } else if (currentSort === 'popular') {
            filtered.sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
        } else if (currentSort === 'az') {
            filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        }

        // Empty State Check
        if (filtered.length === 0) {
            articlesListContainer.innerHTML = '';
            if (emptyStateEl) emptyStateEl.classList.remove('hidden');
            return;
        }

        if (emptyStateEl) emptyStateEl.classList.add('hidden');

        // Render Cards (Executive Markup: .writer-article-card)
        articlesListContainer.innerHTML = filtered.map(item => {
            let badgeClass = 'status-draft';
            if (item.status === 'Published') badgeClass = 'status-published';
            else if (item.status === 'Pending Review') badgeClass = 'status-pending';
            else if (item.status === 'For Revision') badgeClass = 'status-revision';

            return `
                <article class="writer-article-card animate-fade-in delay-1" data-id="${item.id}" tabindex="0" role="button" aria-label="View article: ${escapeHTML(item.title)}">
                    <div class="article-card-header">
                        <div class="article-card-meta">
                            <span class="article-card-category">${escapeHTML(item.category || currentSection)}</span>
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
                                <span class="btn-show-remarks" data-id="${item.id}" style="color: #b42318; font-size: 0.74rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;" title="View editorial feedback">
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
                                <a href="section-head-submit-article.html?draftId=${encodeURIComponent(item.id)}" class="btn-box-view" style="text-decoration: none;" title="Edit draft in editor" onclick="event.stopPropagation()">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                    <span>Edit</span>
                                </a>
                                <button type="button" class="btn-box-view btn-delete-draft" data-id="${item.id}" data-title="${escapeHTML(item.title)}" style="color: #b42318;" title="Delete draft" onclick="event.stopPropagation()">
                                    <i class="fa-regular fa-trash-can"></i>
                                    <span>Delete</span>
                                </button>
                            ` : ''}

                            ${item.status === 'For Revision' ? `
                                <a href="section-head-submit-article.html?draftId=${encodeURIComponent(item.id)}" class="btn-box-view" style="text-decoration: none;" title="Edit and revise manuscript" onclick="event.stopPropagation()">
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
            currentTab = btn.getAttribute('data-tab') || 'all';
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
            currentTab = 'all';
            searchQuery = '';
            currentSort = 'newest';

            if (searchInput) searchInput.value = '';
            if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
            if (sortSelect) sortSelect.value = 'newest';

            tabButtons.forEach(b => {
                const isAll = b.getAttribute('data-tab') === 'all';
                b.classList.toggle('active', isAll);
                b.setAttribute('aria-selected', isAll ? 'true' : 'false');
            });

            renderArticles();
        });
    }

    // =========================================================================
    // 6. CARD INTERACTIONS & MODAL PREVIEW
    // =========================================================================
    function openRemarksModal(articleId) {
        if (!remarksModal) return;
        const article = allArticles.find(a => a.id === articleId);
        if (!article) return;

        activeRemarksArticleId = article.id;
        if (remarksModalTitle) remarksModalTitle.textContent = article.title;
        if (remarksModalContent) remarksModalContent.textContent = article.remarks || 'No remarks provided.';
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
        if (viewerCategory) viewerCategory.textContent = article.category || currentSection;
        if (viewerDate) viewerDate.textContent = article.date;
        if (viewerAuthor) viewerAuthor.textContent = article.author || authorName;

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

    if (viewerModal) {
        viewerModal.addEventListener('click', (e) => {
            if (e.target === viewerModal) closeArticleViewer();
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

            // Also clean from sectionHeadArticleDrafts if present
            try {
                const rawDrafts = localStorage.getItem('sectionHeadArticleDrafts');
                if (rawDrafts) {
                    let drafts = JSON.parse(rawDrafts);
                    if (Array.isArray(drafts)) {
                        drafts = drafts.filter(d => d.id !== pendingDeleteId);
                        localStorage.setItem('sectionHeadArticleDrafts', JSON.stringify(drafts));
                    }
                }
            } catch (e) {
                // Ignore
            }

            if (deleteModal) deleteModal.classList.add('hidden');
            pendingDeleteId = null;

            updateAnalyticsAndCounters();
            renderArticles();
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

    if (closeRemarksModalBtn) {
        closeRemarksModalBtn.addEventListener('click', () => {
            if (remarksModal) remarksModal.classList.add('hidden');
        });
    }

    if (remarksModal) {
        remarksModal.addEventListener('click', (e) => {
            if (e.target === remarksModal) remarksModal.classList.add('hidden');
        });
    }

    if (btnEditFromRemarks) {
        btnEditFromRemarks.addEventListener('click', (e) => {
            e.preventDefault();
            if (activeRemarksArticleId) {
                window.location.href = `section-head-submit-article.html?draftId=${encodeURIComponent(activeRemarksArticleId)}`;
            }
        });
    }

    // Escape Key Handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeArticleViewer();
            if (remarksModal) remarksModal.classList.add('hidden');
            if (deleteModal && !deleteModal.classList.contains('hidden')) {
                pendingDeleteId = null;
                deleteModal.classList.add('hidden');
            }
        }
    });

    // =========================================================================
    // 7. INITIAL HYDRATION
    // =========================================================================
    updateAnalyticsAndCounters();
    renderArticles();
});
