/**
 * ============================================================================
 * THE LENS — CARTOONIST MANAGE MY ARTICLES CONTROLLER
 * Full Executive & M&PC Parity: View Remarks, Reset Filters, Filter Tabs, Modals
 * Clean Cards (Section Head inline message banner removed; opened via View Remarks)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 0. Active Cartoonist Details & DOM References (Hydrated from Auth / globals)
    const activeRole = window.LARAVEL_USER_ROLE || localStorage.getItem('cartoonistRole') || localStorage.getItem('userRole') || 'Cartoonist';
    const cartoonistName = window.LARAVEL_USER_NAME || localStorage.getItem('cartoonistName') || localStorage.getItem('userName') || 'Cartoonist';

    // DOM Elements - Personal Analytics Header Pill
    const statTotalViews = document.getElementById('stat-total-views');

    // DOM Elements - Tabs & Badges
    const tabButtons = document.querySelectorAll('.manage-tab-btn');
    const badgeAll = document.getElementById('badge-count-all');
    const badgePublished = document.getElementById('badge-count-published');
    const badgePending = document.getElementById('badge-count-pending');
    const badgeRevision = document.getElementById('badge-count-revision');
    const badgeDrafts = document.getElementById('badge-count-drafts');

    // DOM Elements - Search & Sort Toolbar
    const searchInput = document.getElementById('cartoonist-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const sortSelect = document.getElementById('cartoonist-sort-select');

    // DOM Elements - Articles List Container & Empty State
    const articlesListContainer = document.getElementById('cartoonist-manage-list');
    const emptyStateEl = document.getElementById('manage-empty-state');

    // DOM Elements - Article Viewer Modal
    const viewerModal = document.getElementById('article-viewer-modal');
    const viewerTitle = document.getElementById('viewer-title');
    const viewerCategory = document.getElementById('viewer-category');
    const viewerDate = document.getElementById('viewer-date');
    const viewerAuthor = document.getElementById('viewer-author');
    const viewerAuthorAvatarImg = document.getElementById('viewer-author-avatar-img');
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
    const viewerFooterClose = document.getElementById('viewer-footer-close');

    // DOM Elements - Remarks Modal
    const remarksModal = document.getElementById('remarks-modal');
    const remarksModalTitle = document.getElementById('remarks-modal-title');
    const remarksModalContent = document.getElementById('remarks-modal-content');
    const closeRemarksModalBtn = document.getElementById('close-remarks-modal-btn');
    const btnCloseRemarksModal = document.getElementById('btn-close-remarks-modal');
    const btnEditFromRemarks = document.getElementById('btn-edit-from-remarks');

    // DOM Elements - Delete Modal
    const deleteModal = document.getElementById('delete-modal');
    const deleteArticleTitle = document.getElementById('delete-article-title');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    // Toast Container
    const toastContainer = document.getElementById('toast-container');

    // Active State
    let currentTab = 'all';
    let searchQuery = '';
    let currentSort = 'newest';
    let pendingDeleteId = null;

    // =========================================================================
    // 1. DATASET: SEEDED & PERSISTED CARTOONIST ARTICLES (Backend Data Transition)
    // Controller hydration via window.INITIAL_ARTICLES / window.INITIAL_DATA
    // with graceful fallback to localStorage for backward compatibility
    // =========================================================================
    const CARTOONIST_ARTICLES_KEY = 'theLensCartoonistArticles_v1';
    const DRAFTS_KEY = 'cartoonistArticleDrafts_v1';

    function loadCartoonistArticles() {
        if (window.INITIAL_ARTICLES && Array.isArray(window.INITIAL_ARTICLES)) {
            return window.INITIAL_ARTICLES;
        }
        if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA)) {
            return window.INITIAL_DATA;
        }
        if (typeof getCartoonistArticles === 'function') {
            return getCartoonistArticles();
        }
        let list = [];
        try {
            const raw = localStorage.getItem(CARTOONIST_ARTICLES_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
            }
        } catch (e) {
            console.warn(e);
        }
        return list;
    }

    function saveCartoonistArticlesData(articles) {
        if (typeof saveCartoonistArticles === 'function') {
            saveCartoonistArticles(articles);
        } else {
            localStorage.setItem(CARTOONIST_ARTICLES_KEY, JSON.stringify(articles));
        }
    }

    let articlesData = loadCartoonistArticles();

    // =========================================================================
    // 2. TOAST SYSTEM & UTILITIES
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
        const existingToasts = toastContainer.querySelectorAll('.toast-message');
        existingToasts.forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;
        toast.innerHTML = `<span class="toast-bullet-dot"></span><span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-dismissing');
            setTimeout(() => toast.remove(), 260);
        }, 3400);
    }

    function formatNumber(num) {
        if (num >= 1000) return Number(num).toLocaleString('en-US');
        return String(num || 0);
    }

    function calculateReadTime(text) {
        if (!text) return '1 min read';
        const clean = text.replace(/<[^>]*>/g, '').trim();
        const words = clean ? clean.split(/\s+/).length : 0;
        const mins = Math.max(1, Math.ceil(words / 200));
        return `${mins} min read`;
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

    // =========================================================================
    // 3. STATS & BADGE COUNTERS
    // =========================================================================
    function updateStatsAndBadges() {
        articlesData = loadCartoonistArticles();

        const totalViews = articlesData
            .filter(a => a.status === 'Published')
            .reduce((sum, a) => sum + (Number(a.views) || 0), 0);

        if (statTotalViews) {
            statTotalViews.textContent = formatNumber(totalViews);
        }

        const allCount = articlesData.length;
        const pubCount = articlesData.filter(a => a.status === 'Published').length;
        const pendCount = articlesData.filter(a => a.status === 'Pending Review' || a.status === 'Pending').length;
        const revCount = articlesData.filter(a => a.status === 'For Revision').length;
        const draftCount = articlesData.filter(a => a.status === 'Draft').length;

        if (badgeAll) badgeAll.textContent = String(allCount);
        if (badgePublished) badgePublished.textContent = String(pubCount);
        if (badgePending) badgePending.textContent = String(pendCount);
        if (badgeRevision) badgeRevision.textContent = String(revCount);
        if (badgeDrafts) badgeDrafts.textContent = String(draftCount);
    }

    // =========================================================================
    // 4. FILTERING & SORTING PIPELINE
    // =========================================================================
    function getFilteredAndSortedArticles() {
        let filtered = articlesData.filter(item => {
            if (currentTab === 'published' && item.status !== 'Published') return false;
            if (currentTab === 'pending' && item.status !== 'Pending Review' && item.status !== 'Pending') return false;
            if (currentTab === 'revision' && item.status !== 'For Revision') return false;
            if (currentTab === 'drafts' && item.status !== 'Draft') return false;

            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const titleMatch = (item.title || '').toLowerCase().includes(q);
                const categoryMatch = (item.category || '').toLowerCase().includes(q);
                const excerptMatch = (item.excerpt || '').toLowerCase().includes(q);
                const contentMatch = (item.content || '').toLowerCase().includes(q);
                if (!titleMatch && !categoryMatch && !excerptMatch && !contentMatch) return false;
            }

            return true;
        });

        filtered.sort((a, b) => {
            if (currentSort === 'popular') return (b.views || 0) - (a.views || 0);
            if (currentSort === 'az') return (a.title || '').localeCompare(b.title || '');
            if (currentSort === 'oldest') return new Date(a.rawDate || a.date) - new Date(b.rawDate || b.date);
            return new Date(b.rawDate || b.date) - new Date(a.rawDate || a.date);
        });

        return filtered;
    }

    // =========================================================================
    // 5. RENDER ARTICLES CARDS & DIRECT EVENT BINDING
    // =========================================================================
    function renderArticlesList() {
        if (!articlesListContainer) return;

        updateStatsAndBadges();
        const articles = getFilteredAndSortedArticles();

        if (articles.length === 0) {
            articlesListContainer.innerHTML = '';
            articlesListContainer.style.display = 'none';
            if (emptyStateEl) {
                const emptyTitle = document.getElementById('manage-empty-title') || emptyStateEl.querySelector('.manage-empty-title') || emptyStateEl.querySelector('h3');
                const emptyIcon = document.getElementById('manage-empty-icon') || emptyStateEl.querySelector('.manage-empty-icon i');
                const emptyDesc = emptyStateEl.querySelector('.manage-empty-desc') || emptyStateEl.querySelector('p');
                if (emptyDesc) emptyDesc.remove();

                const isSearching = searchQuery.trim().length > 0;

                if (isSearching) {
                    // When searching: "No articles found" (no subtitles)
                    if (emptyIcon) emptyIcon.className = 'fa-solid fa-magnifying-glass';
                    if (emptyTitle) emptyTitle.textContent = 'No articles found';
                } else {
                    // When tab is empty: contextual empty message per tab (no subtitles)
                    let iconClass = 'fa-regular fa-newspaper';
                    let titleText = 'No articles yet';

                    if (currentTab === 'published') {
                        iconClass = 'fa-solid fa-circle-check';
                        titleText = 'No published articles yet';
                    } else if (currentTab === 'pending') {
                        iconClass = 'fa-regular fa-clock';
                        titleText = 'No pending articles';
                    } else if (currentTab === 'revision') {
                        iconClass = 'fa-solid fa-rotate-left';
                        titleText = 'No articles for revision';
                    } else if (currentTab === 'drafts') {
                        iconClass = 'fa-regular fa-folder-open';
                        titleText = 'No drafts yet';
                    }

                    if (emptyIcon) emptyIcon.className = iconClass;
                    if (emptyTitle) emptyTitle.textContent = titleText;
                }

                emptyStateEl.classList.remove('hidden');
            }
            return;
        }

        if (emptyStateEl) emptyStateEl.classList.add('hidden');
        articlesListContainer.style.display = 'flex';

        articlesListContainer.innerHTML = articles.map(item => {
            let statusBadgeClass = 'status-draft';
            let statusLabel = item.status || 'Draft';

            if (item.status === 'Published') {
                statusBadgeClass = 'status-published';
                statusLabel = 'Published';
            } else if (item.status === 'Pending Review' || item.status === 'Pending') {
                statusBadgeClass = 'status-pending';
                statusLabel = 'Pending Review';
            } else if (item.status === 'For Revision') {
                statusBadgeClass = 'status-revision';
                statusLabel = 'For Revision';
            }

            const isPublished = item.status === 'Published';
            const isRevision = item.status === 'For Revision';
            const isDraft = item.status === 'Draft';
            const hasRemarks = !!item.remarks && item.remarks.trim().length > 0;

            return `
                <article class="writer-article-card" data-id="${item.id}" tabindex="0" role="button" aria-label="View article: ${escapeHTML(item.title)}">
                    
                    <div class="article-card-header">
                        <div class="article-card-meta">
                            <span class="article-card-category">${escapeHTML(item.category || 'Opinion')}</span>
                            <span class="meta-dot">&bull;</span>
                            <span class="article-card-date"><i class="fa-regular fa-calendar"></i> ${escapeHTML(item.date)}</span>
                            ${isPublished && item.views !== undefined ? `
                                <span class="meta-dot">&bull;</span>
                                <span class="article-card-date"><i class="fa-regular fa-eye"></i> ${formatNumber(item.views)} views</span>
                            ` : ''}
                        </div>
                        <div class="article-card-status-top">
                            <span class="status-badge ${statusBadgeClass}">${escapeHTML(statusLabel)}</span>
                        </div>
                    </div>

                    <div class="article-card-body">
                        <h3 class="article-card-title">${escapeHTML(item.title)}</h3>
                        ${item.excerpt ? `<p class="article-card-excerpt">${escapeHTML(item.excerpt)}</p>` : ''}
                    </div>

                    <div class="article-card-footer">
                        <div class="footer-left-actions">
                            ${hasRemarks ? `
                                <button type="button" class="btn-box-remarks" data-action="remarks" data-id="${item.id}" title="View editorial remarks">
                                    <i class="fa-regular fa-comment-dots"></i>
                                    <span>View Remarks</span>
                                </button>
                            ` : ''}
                        </div>

                        <div class="footer-right-actions">
                            ${(isDraft || isRevision) ? `
                                <a href="cartoonist-submit-article.html?draftId=${encodeURIComponent(item.id)}" class="btn-box-edit" title="Edit manuscript">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                    <span>Edit</span>
                                </a>
                            ` : ''}

                            ${isDraft ? `
                                <button type="button" class="btn-box-delete" data-action="delete" data-id="${item.id}" data-title="${escapeHTML(item.title)}" title="Delete draft">
                                    <i class="fa-regular fa-trash-can"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>

                </article>
            `;
        }).join('');

        attachCardListeners();
    }

    // =========================================================================
    // 6. CARD INTERACTIONS: VIEW REMARKS, EDIT, DELETE, ARTICLE VIEWER
    // =========================================================================
    function attachCardListeners() {
        if (!articlesListContainer) return;

        // 1. Remarks Buttons
        const remarksElements = articlesListContainer.querySelectorAll('[data-action="remarks"], .btn-box-remarks');
        remarksElements.forEach(elem => {
            elem.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const id = elem.getAttribute('data-id');
                openRemarksModal(id);
            });
        });

        // 2. Delete Draft Buttons
        const deleteButtons = articlesListContainer.querySelectorAll('[data-action="delete"], .btn-box-delete');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                const article = articlesData.find(a => String(a.id) === String(id));
                if (article) openDeleteModal(article);
            });
        });

        // 3. Edit Links
        const editLinks = articlesListContainer.querySelectorAll('.btn-box-edit');
        editLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        // 4. Clicking Anywhere Else on the Card Opens the Full Article Viewer Modal
        const cardElements = articlesListContainer.querySelectorAll('.writer-article-card');
        cardElements.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('[data-action="remarks"]') ||
                    e.target.closest('[data-action="delete"]') ||
                    e.target.closest('.btn-box-remarks') ||
                    e.target.closest('.btn-box-delete') ||
                    e.target.closest('.btn-box-edit')) {
                    return;
                }
                const id = card.getAttribute('data-id');
                const article = articlesData.find(a => String(a.id) === String(id));
                if (article) openArticleViewer(article);
            });
        });
    }

    // =========================================================================
    // 7. ARTICLE VIEWER MODAL
    // =========================================================================
    function openArticleViewer(article) {
        if (!viewerModal) return;

        if (viewerTitle) viewerTitle.textContent = article.title;
        if (viewerCategory) viewerCategory.textContent = article.category || 'Opinion';
        if (viewerDate) viewerDate.textContent = article.date;
        if (viewerAuthor) viewerAuthor.textContent = article.author || cartoonistName;

        const readTime = article.readTime || calculateReadTime(article.content || article.excerpt);
        if (viewerReadTime) viewerReadTime.textContent = readTime;

        if (viewerAuthorAvatarImg) {
            viewerAuthorAvatarImg.src = 'images/member-placeholder.svg';
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

        if (viewerRemarksWrap && viewerRemarksText) {
            if (article.remarks && article.remarks.trim().length > 0) {
                viewerRemarksText.textContent = article.remarks;
                viewerRemarksWrap.style.display = 'block';
            } else {
                viewerRemarksWrap.style.display = 'none';
            }
        }

        if (viewerStatsBar) {
            if (article.status === 'Published') {
                viewerStatsBar.style.display = 'flex';
                if (viewerViews) viewerViews.textContent = formatNumber(article.views || 0);
                if (viewerShares) viewerShares.textContent = formatNumber(article.shares || Math.round((article.views || 0) * 0.08));
            } else {
                viewerStatsBar.style.display = 'none';
            }
        }

        viewerModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeArticleViewer() {
        if (!viewerModal) return;
        viewerModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    if (closeViewerBtn) closeViewerBtn.addEventListener('click', closeArticleViewer);
    if (viewerFooterClose) viewerFooterClose.addEventListener('click', closeArticleViewer);
    if (viewerModal) {
        viewerModal.addEventListener('click', (e) => {
            if (e.target === viewerModal) closeArticleViewer();
        });
    }

    // =========================================================================
    // 8. REMARKS MODAL
    // =========================================================================
    function openRemarksModal(articleOrId) {
        if (!remarksModal) return;

        const article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId
            : articlesData.find(a => String(a.id) === String(articleOrId));

        if (!article) return;

        if (remarksModalTitle) remarksModalTitle.textContent = article.title;
        if (remarksModalContent) remarksModalContent.textContent = article.remarks || 'No specific editorial notes provided.';
        if (btnEditFromRemarks) {
            btnEditFromRemarks.href = `cartoonist-submit-article.html?draftId=${encodeURIComponent(article.id)}`;
        }

        remarksModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeRemarksModal() {
        if (!remarksModal) return;
        remarksModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    if (closeRemarksModalBtn) closeRemarksModalBtn.addEventListener('click', closeRemarksModal);
    if (btnCloseRemarksModal) btnCloseRemarksModal.addEventListener('click', closeRemarksModal);
    if (remarksModal) {
        remarksModal.addEventListener('click', (e) => {
            if (e.target === remarksModal) closeRemarksModal();
        });
    }

    // =========================================================================
    // 9. DELETE DRAFT MODAL
    // =========================================================================
    function openDeleteModal(article) {
        if (!deleteModal) return;
        pendingDeleteId = article.id;
        if (deleteArticleTitle) deleteArticleTitle.textContent = `"${article.title}"`;
        deleteModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeDeleteModal() {
        if (!deleteModal) return;
        pendingDeleteId = null;
        deleteModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) closeDeleteModal();
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (!pendingDeleteId) return;

            const targetIndex = articlesData.findIndex(a => String(a.id) === String(pendingDeleteId));
            if (targetIndex !== -1) {
                const deletedTitle = articlesData[targetIndex].title;
                articlesData.splice(targetIndex, 1);
                saveCartoonistArticlesData(articlesData);

                showToast(`Draft "${deletedTitle}" deleted successfully.`, 'info');
            }

            closeDeleteModal();
            renderArticlesList();
        });
    }

    // Keyboard ESC key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (viewerModal && !viewerModal.classList.contains('hidden')) closeArticleViewer();
            if (remarksModal && !remarksModal.classList.contains('hidden')) closeRemarksModal();
            if (deleteModal && !deleteModal.classList.contains('hidden')) closeDeleteModal();
        }
    });

    // =========================================================================
    // 10. TABS NAVIGATION, SEARCH CONTROLS & RESET FILTERS
    // =========================================================================
    function resetAllFilters() {
        currentTab = 'all';
        searchQuery = '';
        currentSort = 'newest';

        tabButtons.forEach(b => {
            const isAll = b.getAttribute('data-tab') === 'all';
            b.classList.toggle('active', isAll);
            b.setAttribute('aria-selected', isAll ? 'true' : 'false');
        });

        if (searchInput) searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
        if (sortSelect) sortSelect.value = 'newest';

        renderArticlesList();
        showToast('All filters, search, and sorting reset to default.');
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            currentTab = btn.getAttribute('data-tab') || 'all';
            renderArticlesList();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            if (clearSearchBtn) {
                clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
            }
            renderArticlesList();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchQuery = '';
                clearSearchBtn.classList.add('hidden');
                searchInput.focus();
                renderArticlesList();
            }
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderArticlesList();
        });
    }

    // Escape Key Handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeArticleViewer();
            closeRemarksModal();
            closeDeleteModal();
        }
    });

    // Initial render
    renderArticlesList();
});

