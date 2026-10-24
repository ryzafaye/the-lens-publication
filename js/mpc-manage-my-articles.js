/**
 * ============================================================================
 * THE LENS — MEDIA & PUBLIC COMMUNICATIONS (M&PC) MANAGE MY ARTICLES CONTROLLER
 * Copies the Exact Style Format & Logic of Executive Manage My Articles
 * (Identical Card Structure, Typography, Metadata, Status Badges & Modals)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 0. ACTIVE M&PC OFFICER DETAILS
    // =========================================================================
    const activeRole = localStorage.getItem('mpcRole') || localStorage.getItem('userRole') || 'M&PC Head';
    const mpcName = localStorage.getItem('mpcName') || localStorage.getItem('userName') || 'Julian Del Rosario';

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
    // 1. DATASET: SEEDED & PERSISTED M&PC ARTICLES
    // =========================================================================
    const DEFAULT_MPC_ARTICLES = [
        {
            id: 'mpc-art-01',
            author: mpcName,
            title: 'Expanding Digital Readership: The Lens Public Web Portal Redesign',
            category: 'News',
            excerpt: 'How our media and public communications desk modernized digital circulation metrics and accelerated open campus news distribution.',
            date: 'Oct 21, 2026',
            rawDate: '2026-10-21',
            status: 'Published',
            views: 5840,
            shares: 94,
            remarks: '',
            content: `Modern collegiate readership demands accessible, high-speed delivery across mobile devices and digital platforms.\n\nOver the past academic semester, the Media and Public Communications (M&PC) team worked in close coordination with section heads and technical editors to overhaul our publication site architecture. By synchronizing editorial cartoons, visual publication materials, and investigative manuscripts into unified release pipelines, readership metrics surged by 38%.\n\nOur commitment remains centered on providing every campus constituent with direct, reliable, and fact-verified journalism.`
        },
        {
            id: 'mpc-art-02',
            author: mpcName,
            title: 'Visual Journalism Ethics: Standards for Campus Photojournalists & Illustrators',
            category: 'Features',
            excerpt: 'Guidelines and verification procedures ensuring truth, context, and dignity in campus visual news reporting and social graphics.',
            date: 'Oct 14, 2026',
            rawDate: '2026-10-14',
            status: 'Published',
            views: 3920,
            shares: 62,
            remarks: '',
            content: `As visual storytelling takes center stage on university channels, the line between illustrative enhancement and photo manipulation requires clear ethical boundaries.\n\nThis guide establishes publication standards across photojournalism and graphic illustration desks: maintaining original contextual lighting, prohibiting altering of editorial subjects, and guaranteeing consent protocols for student vulnerability reporting.`
        },
        {
            id: 'mpc-art-03',
            author: mpcName,
            title: 'Cross-Platform Storytelling: Reaching the Modern Collegiate Audience',
            category: 'Opinion',
            excerpt: 'Analyzing how multimedia sidebars, graphic teasers, and print archival editions reinforce journalistic transparency.',
            date: 'Sep 29, 2026',
            rawDate: '2026-09-29',
            status: 'Published',
            views: 2470,
            shares: 38,
            remarks: '',
            content: `Print and digital need not compete; they complement each other. While digital publication guarantees immediate reach during breaking campus events, printed folios remain our tangible historical record.\n\nOur cross-platform strategy blends both mediums to serve both immediate information needs and long-term university historical archives.`
        },
        {
            id: 'mpc-art-04',
            author: mpcName,
            title: 'Campus Media Distribution: Print Archives vs Social Engagement Audit',
            category: 'News',
            excerpt: 'An evidence-based assessment of campus physical pickup kiosks, online engagement statistics, and newsletter subscriber analytics.',
            date: 'Oct 22, 2026',
            rawDate: '2026-10-22',
            status: 'Pending Review',
            views: 0,
            shares: 0,
            remarks: '',
            content: `Auditing circulation points across all five campus colleges provided pivotal insight into where student readership is most active.\n\nWhile kiosk pickups remain high near the College of Engineering and Liberal Arts library, over 65% of freshman and sophomore readers discover investigative scoops via social headlines and our web portal.`
        },
        {
            id: 'mpc-art-05',
            author: mpcName,
            title: 'Photo Desk Curation: Addressing Sensitive Imagery in Crisis Coverage',
            category: 'Opinion',
            excerpt: 'Editorial protocols when capturing and publishing photos during student demonstrations, medical emergencies, and campus strikes.',
            date: 'Oct 18, 2026',
            rawDate: '2026-10-18',
            status: 'For Revision',
            views: 0,
            shares: 0,
            remarks: 'Please update Section 2 with student privacy consent guidelines in accordance with the revised Editorial Board policy before resubmission.',
            content: `Documenting high-stress campus events tests the ethical compass of any student publication desk. Balancing the public interest against individual privacy and security must be resolved systematically before pressing publish.\n\nThis document outlines our recommended screening matrix for selecting hero cover imagery.`
        }
    ];

    const STORAGE_KEY = 'mpcMyArticles_v1';

    function getArticles() {
        let personalArticles = [];
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    personalArticles = parsed;
                }
            }
        } catch (e) {
            console.warn('Could not load mpcMyArticles_v1', e);
        }

        if (personalArticles.length === 0) {
            personalArticles = JSON.parse(JSON.stringify(DEFAULT_MPC_ARTICLES));
        }

        // Incorporate drafts from mpcArticleDrafts
        try {
            const rawDrafts = localStorage.getItem('mpcArticleDrafts');
            if (rawDrafts) {
                const drafts = JSON.parse(rawDrafts);
                if (Array.isArray(drafts)) {
                    drafts.forEach(d => {
                        const exists = personalArticles.some(a => a.id === d.id);
                        if (!exists) {
                            personalArticles.push({
                                id: d.id,
                                author: mpcName,
                                title: d.title,
                                category: d.category || 'Features',
                                excerpt: d.excerpt || 'Draft manuscript in progress.',
                                date: d.date || 'Oct 23, 2026',
                                rawDate: d.rawDate || '2026-10-23',
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
            console.warn('Could not read mpcArticleDrafts', e);
        }

        return personalArticles;
    }

    function saveArticles(articles) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
        } catch (e) {
            console.warn('Could not persist mpcMyArticles_v1', e);
        }
    }

    let allArticles = getArticles();

    // =========================================================================
    // 2. UTILITIES: NUMBER FORMATTING, READ TIME & TOASTS
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
        if (!text) return '2 min read';
        const clean = text.replace(/<[^>]*>/g, '').trim();
        const words = clean ? clean.split(/\s+/).length : 0;
        const mins = Math.max(1, Math.ceil(words / 200));
        return `${mins} min read`;
    }

    function formatCleanArticleContent(rawContent) {
        if (!rawContent) {
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this manuscript.</p>';
        }
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
        }, 3200);
    }

    // =========================================================================
    // 3. ANALYTICS (EXACT EXECUTIVE & WRITER FORMAT) & TAB BADGES
    // =========================================================================
    function updateAnalyticsAndCounters() {
        const publishedArticles = allArticles.filter(a => a.status === 'Published');
        const pendingArticles = allArticles.filter(a => a.status === 'Pending Review');
        const revisionArticles = allArticles.filter(a => a.status === 'For Revision');
        const draftsArticles = allArticles.filter(a => a.status === 'Draft');

        const totalViewsCount = publishedArticles.reduce((sum, a) => sum + (Number(a.views) || 0), 0);

        // Update Total Views Pill
        if (statTotalViews) statTotalViews.textContent = formatNumber(totalViewsCount);

        // Update Tab Badges
        if (badgeAll) badgeAll.textContent = formatNumber(allArticles.length);
        if (badgePublished) badgePublished.textContent = formatNumber(publishedArticles.length);
        if (badgePending) badgePending.textContent = formatNumber(pendingArticles.length);
        if (badgeRevision) badgeRevision.textContent = formatNumber(revisionArticles.length);
        if (badgeDrafts) badgeDrafts.textContent = formatNumber(draftsArticles.length);
    }

    // =========================================================================
    // 4. RENDERING ARTICLES LIST (EXACT EXECUTIVE CARD DESIGN & STRUCTURE)
    // =========================================================================
    function renderArticles() {
        if (!articlesListContainer) return;

        // Filter by Tab
        let filtered = allArticles.filter(a => {
            if (currentTab === 'published') return a.status === 'Published';
            if (currentTab === 'pending') return a.status === 'Pending Review';
            if (currentTab === 'revision') return a.status === 'For Revision';
            if (currentTab === 'drafts') return a.status === 'Draft';
            return true;
        });

        // Search Query Filter
        if (searchQuery.trim()) {
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

        articlesListContainer.innerHTML = filtered.map(item => {
            let badgeClass = 'status-draft';
            if (item.status === 'Published') badgeClass = 'status-published';
            if (item.status === 'Pending Review') badgeClass = 'status-pending';
            if (item.status === 'For Revision') badgeClass = 'status-revision';

            return `
                <article class="writer-article-card animate-fade-in delay-1" data-id="${item.id}" tabindex="0" role="button" aria-label="View article: ${escapeHTML(item.title)}">
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
                                <span class="btn-show-remarks" data-id="${item.id}" style="color: #b42318; font-size: 0.74rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;" title="View section head feedback">
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
                                <a href="mpc-submit-article.html?draftId=${encodeURIComponent(item.id)}" class="btn-box-view" style="text-decoration: none;" title="Edit draft in editor" onclick="event.stopPropagation()">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                    <span>Edit</span>
                                </a>
                                <button type="button" class="btn-box-view btn-delete-draft" data-id="${item.id}" data-title="${escapeHTML(item.title)}" style="color: #b42318;" title="Delete draft" onclick="event.stopPropagation()">
                                    <i class="fa-regular fa-trash-can"></i>
                                    <span>Delete</span>
                                </button>
                            ` : ''}

                            ${item.status === 'For Revision' ? `
                                <a href="mpc-submit-article.html?draftId=${encodeURIComponent(item.id)}" class="btn-box-view" style="text-decoration: none;" title="Edit and revise manuscript" onclick="event.stopPropagation()">
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
    let activeRemarksArticleId = null;

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
        if (viewerCategory) viewerCategory.textContent = article.category || 'General';
        if (viewerDate) viewerDate.textContent = article.date;
        if (viewerAuthor) viewerAuthor.textContent = article.author || mpcName;

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
    }

    function closeArticleViewer() {
        if (viewerModal) viewerModal.classList.add('hidden');
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

            // Also remove from mpcArticleDrafts if present
            try {
                const rawDrafts = localStorage.getItem('mpcArticleDrafts');
                if (rawDrafts) {
                    let drafts = JSON.parse(rawDrafts);
                    if (Array.isArray(drafts)) {
                        drafts = drafts.filter(d => d.id !== pendingDeleteId);
                        localStorage.setItem('mpcArticleDrafts', JSON.stringify(drafts));
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
                window.location.href = `mpc-submit-article.html?draftId=${encodeURIComponent(activeRemarksArticleId)}`;
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
