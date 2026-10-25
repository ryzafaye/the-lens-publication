/**
 * ============================================================================
 * THE LENS — MEDIA & COMMUNICATION MANAGE MY ARTICLES CONTROLLER
 * Full Executive & M&PC Parity: View Remarks, Reset Filters, Filter Tabs, Modals
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 0. ACTIVE MEDIA OFFICER DETAILS & DOM REFERENCES
    // =========================================================================
    const activeRole = localStorage.getItem('mediaRole') || localStorage.getItem('userRole') || 'Media & Communication';
    const mediaName = localStorage.getItem('mediaName') || localStorage.getItem('userName') || 'Alyssa Marie Dizon';

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
    const searchInput = document.getElementById('executive-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const sortSelect = document.getElementById('executive-sort-select');
    const toolbarResetBtn = document.getElementById('toolbar-reset-filters-btn');

    // DOM Elements - Articles List Container & Empty State
    const articlesListContainer = document.getElementById('executive-manage-list');
    const emptyStateEl = document.getElementById('manage-empty-state');
    const emptyStateResetBtn = document.getElementById('reset-filters-btn');

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
    // 1. DATASET: SEEDED & PERSISTED MEDIA ARTICLES
    // =========================================================================
    const DEFAULT_MEDIA_ARTICLES = [
        {
            id: 'med-art-01',
            author: mediaName,
            title: 'Framing the Narrative: Visual Storytelling & Infographic Ethics in Campus Journalism',
            category: 'Features',
            excerpt: 'How student newsrooms leverage data visualization, color psychology, and rigorous statistical verification to communicate complex university issues.',
            date: 'Oct 22, 2026',
            rawDate: '2026-10-22',
            status: 'Published',
            views: 4210,
            shares: 112,
            remarks: '',
            content: `In an era of rapid information consumption, visual journalism serves as both a hook and an anchor for investigative reporting. When complex university budget allocations or tuition restructuring plans are unveiled, walls of text can often obscure critical insights.\n\nThrough rigorous data visualization and intentional typography, publication materials (PUBMAT) distill intricate administrative figures into accessible civic knowledge. However, designers must adhere to stringent ethical standards: chart scales must remain uncompressed, source citations must be transparent, and aesthetic flair must never supersede factual accuracy.\n\n"A well-crafted infographic does not merely decorate an article; it functions as an autonomous piece of journalism that holds power to account," notes the media board editorial guidelines.`
        },
        {
            id: 'med-art-02',
            author: mediaName,
            title: 'Digital Canvas: Evaluating Modern Graphic Design Tools for Student Publications',
            category: 'Science and Technology',
            excerpt: 'A comprehensive comparative breakdown of open-source vector software versus industry-standard creative suites for campus media teams.',
            date: 'Oct 23, 2026',
            rawDate: '2026-10-23',
            status: 'Pending Review',
            views: 0,
            shares: 0,
            remarks: '',
            content: `As student publications navigate fluctuating operating budgets, creative desks face recurring software licensing dilemmas. Transitioning between proprietary suites and open-source alternatives involves assessing collaborative workflows, typography rendering engines, and prepress CMYK compatibility.\n\nThis review benchmarks leading vector illustration software on real-world newsroom turnaround times, highlighting how cloud-based real-time co-editing is revolutionizing overnight layout deadlines.`
        },
        {
            id: 'med-art-03',
            author: mediaName,
            title: 'The Power of Visual Hierarchy in Headline Typography',
            category: 'Features',
            excerpt: 'Why headline placement, weight contrast, and leading dictate reader retention across print tabloids and digital social cards.',
            date: 'Oct 20, 2026',
            rawDate: '2026-10-20',
            status: 'For Revision',
            views: 0,
            shares: 0,
            remarks: 'Please add practical visual examples comparing serif vs sans-serif headers in print banners before final approval.',
            content: `Visual hierarchy is the invisible architecture of journalism. When a reader opens a newspaper or scrolls past a digital pubmat, their eye is directed not by accident, but by conscious typographic orchestration.\n\nBalancing primary headlines with clear contextual decks ensures that essential news reaches readers even during a brief three-second glance.`
        }
    ];

    const MEDIA_ARTICLES_KEY = 'theLensMediaArticles_v1';
    const DRAFTS_KEY = 'mediaArticleDrafts_v1';

    function loadMediaArticles() {
        let list = [];
        try {
            const raw = localStorage.getItem(MEDIA_ARTICLES_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    list = parsed;
                }
            }
        } catch (e) {
            console.warn(e);
        }

        if (list.length === 0) {
            list = JSON.parse(JSON.stringify(DEFAULT_MEDIA_ARTICLES));
            localStorage.setItem(MEDIA_ARTICLES_KEY, JSON.stringify(list));
        }

        // Also merge any standalone drafts from mediaArticleDrafts_v1 so Drafts tab shows everything
        try {
            const rawDrafts = localStorage.getItem(DRAFTS_KEY);
            if (rawDrafts) {
                const drafts = JSON.parse(rawDrafts);
                if (Array.isArray(drafts)) {
                    drafts.forEach(d => {
                        if (!list.some(a => String(a.id) === String(d.id))) {
                            list.push({
                                id: d.id,
                                author: mediaName,
                                title: d.title || 'Untitled Draft',
                                category: d.category || 'General',
                                excerpt: d.excerpt || '',
                                date: d.date || 'Recent',
                                rawDate: d.rawDate || new Date().toISOString().split('T')[0],
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
            console.warn(e);
        }

        return list;
    }

    function saveMediaArticles(articles) {
        try {
            localStorage.setItem(MEDIA_ARTICLES_KEY, JSON.stringify(articles));
        } catch (e) {
            console.warn(e);
        }
    }

    let articlesData = loadMediaArticles();

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

    function formatCleanArticleContent(rawContent) {
        if (!rawContent) return '<p style="color: #98a2b3; font-style: italic;">No content provided.</p>';
        const stripped = rawContent
            .replace(/<div><br\s*\/?><\/div>/gi, '\n\n')
            .replace(/<\/?div[^>]*>/gi, '\n')
            .replace(/<\/?p[^>]*>/gi, '\n\n')
            .replace(/<br\s*\/?>/gi, '\n');

        const paragraphs = stripped.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0);
        if (paragraphs.length === 0) return '<p style="color: #98a2b3; font-style: italic;">No content provided.</p>';
        return paragraphs.map(p => `<p class="viewer-paragraph">${escapeHTML(p)}</p>`).join('');
    }

    // =========================================================================
    // 3. STATS & BADGE COUNTERS
    // =========================================================================
    function updateStatsAndBadges() {
        articlesData = loadMediaArticles();

        // Total views across published articles
        const totalViews = articlesData
            .filter(a => a.status === 'Published')
            .reduce((sum, a) => sum + (Number(a.views) || 0), 0);

        if (statTotalViews) {
            statTotalViews.textContent = formatNumber(totalViews);
        }

        // Count per status category
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
            // Tab filtering
            if (currentTab === 'published' && item.status !== 'Published') return false;
            if (currentTab === 'pending' && item.status !== 'Pending Review' && item.status !== 'Pending') return false;
            if (currentTab === 'revision' && item.status !== 'For Revision') return false;
            if (currentTab === 'drafts' && item.status !== 'Draft') return false;

            // Search query filtering
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

        // Sorting
        filtered.sort((a, b) => {
            if (currentSort === 'popular') {
                return (b.views || 0) - (a.views || 0);
            }
            if (currentSort === 'az') {
                return (a.title || '').localeCompare(b.title || '');
            }
            if (currentSort === 'oldest') {
                return new Date(a.rawDate || a.date) - new Date(b.rawDate || b.date);
            }
            // Default: newest first
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
            if (emptyStateEl) emptyStateEl.classList.remove('hidden');
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
                            <span class="article-card-category">${escapeHTML(item.category || 'General')}</span>
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
                                <a href="media-submit-article.html?draftId=${encodeURIComponent(item.id)}" class="btn-box-edit" title="Edit manuscript">
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

        // Attach specific event handlers to newly rendered cards
        attachCardListeners();
    }

    // =========================================================================
    // 6. CARD INTERACTIONS: VIEW REMARKS, EDIT, DELETE, ARTICLE VIEWER
    // =========================================================================
    function attachCardListeners() {
        if (!articlesListContainer) return;

        // 1. Remarks Buttons & Remarks Banners (View Remarks)
        const remarksElements = articlesListContainer.querySelectorAll('[data-action="remarks"], .btn-box-remarks, .article-card-remarks');
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

        // 3. Edit Links (Stop bubbling so it doesn't open article viewer modal)
        const editLinks = articlesListContainer.querySelectorAll('.btn-box-edit');
        editLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        // 4. Whole Card Click (Opens Full Article Viewer)
        const cardElements = articlesListContainer.querySelectorAll('.writer-article-card');
        cardElements.forEach(card => {
            card.addEventListener('click', (e) => {
                // If clicked element was an action button or link, don't open viewer
                if (e.target.closest('[data-action="remarks"]') || 
                    e.target.closest('[data-action="delete"]') || 
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
        if (viewerCategory) viewerCategory.textContent = article.category || 'General';
        if (viewerDate) viewerDate.textContent = article.date;
        if (viewerAuthor) viewerAuthor.textContent = article.author || mediaName;
        if (viewerReadTime) viewerReadTime.textContent = calculateReadTime(article.content || article.excerpt);

        const viewerAuthorAvatarImg = document.getElementById('viewer-author-avatar-img');
        if (viewerAuthorAvatarImg) {
            viewerAuthorAvatarImg.src = 'images/member-placeholder.svg';
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

        if (article.status === 'Published' && viewerStatsBar) {
            viewerStatsBar.style.display = 'flex';
            if (viewerViews) viewerViews.textContent = formatNumber(article.views || 0);
            if (viewerShares) viewerShares.textContent = formatNumber(article.shares || Math.round((article.views || 0) * 0.08));
        } else if (viewerStatsBar) {
            viewerStatsBar.style.display = 'none';
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
    if (viewerModal) {
        viewerModal.addEventListener('click', (e) => {
            if (e.target === viewerModal) closeArticleViewer();
        });
    }

    // =========================================================================
    // 8. REMARKS MODAL (View Remarks Fix)
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
            btnEditFromRemarks.href = `media-submit-article.html?draftId=${encodeURIComponent(article.id)}`;
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
                saveMediaArticles(articlesData);

                // Also delete from mediaArticleDrafts_v1 if present
                try {
                    const rawDrafts = localStorage.getItem(DRAFTS_KEY);
                    if (rawDrafts) {
                        let drafts = JSON.parse(rawDrafts);
                        drafts = drafts.filter(d => String(d.id) !== String(pendingDeleteId));
                        localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
                    }
                } catch (e) {}

                showToast(`Draft "${deletedTitle}" deleted successfully.`, 'info');
            }

            closeDeleteModal();
            renderArticlesList();
        });
    }

    // Keyboard ESC key handler for all modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (viewerModal && !viewerModal.classList.contains('hidden')) closeArticleViewer();
            if (remarksModal && !remarksModal.classList.contains('hidden')) closeRemarksModal();
            if (deleteModal && !deleteModal.classList.contains('hidden')) closeDeleteModal();
        }
    });

    // =========================================================================
    // 10. TABS NAVIGATION, SEARCH CONTROLS & RESET FILTERS FIX
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

        if (searchInput) {
            searchInput.value = '';
        }
        if (clearSearchBtn) {
            clearSearchBtn.classList.add('hidden');
        }
        if (sortSelect) {
            sortSelect.value = 'newest';
        }

        renderArticlesList();
        showToast('All filters, search, and sorting reset to default.');
    }

    // Attach Reset Filters to both Empty State button and Toolbar button
    if (emptyStateResetBtn) {
        emptyStateResetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetAllFilters();
        });
    }

    if (toolbarResetBtn) {
        toolbarResetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetAllFilters();
        });
    }

    // Tab buttons
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

    // Search bar input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            if (clearSearchBtn) {
                clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
            }
            renderArticlesList();
        });
    }

    // Clear search button (X inside input)
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

    // Sort dropdown
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderArticlesList();
        });
    }

    // Initial render
    renderArticlesList();
});
