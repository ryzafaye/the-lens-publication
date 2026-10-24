/**
 * ============================================================================
 * THE LENS — EDITOR-IN-CHIEF (EIC) MANAGE MY ARTICLES CONTROLLER
 * Full Design, Formatting, & Logic Parity with Executive Manage My Articles
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 0. ROLE GUARD & ACTIVE EIC DETAILS
    // =========================================================================
    const activeRole = localStorage.getItem('eicRole') || localStorage.getItem('userRole') || 'Editor-in-Chief';
    const eicName = localStorage.getItem('eicName') || localStorage.getItem('userName') || 'Victoria Reyes';

    // DOM Elements - Personal Analytics Pill in Header
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
    // 1. DATASET: SEEDED & PERSISTED EIC ARTICLES
    // =========================================================================
    const DEFAULT_EIC_ARTICLES = [
        {
            id: 'eic-art-01',
            author: eicName,
            title: 'The Sacred Covenant of the Fourth Estate: An Editorial Manifesto',
            category: 'Opinion',
            excerpt: 'Why uncompromised campus journalism remains the moral compass of democratic university life in an age of administrative PR.',
            date: 'Oct 19, 2026',
            rawDate: '2026-10-19',
            status: 'Published',
            views: 6420,
            shares: 112,
            remarks: '',
            content: `Student publications hold a unique mandate within democratic universities: to reflect the unvarnished realities of the student body without fear of administrative reprisal.\n\nOver the past academic cycle, our editorial staff has covered pivotal campus disputes, from facilities budget reallocations to faculty overload directives. Throughout each inquiry, our guiding philosophy has remained unwavering—freedom of expression is not an administrative privilege to be dispensed, but an institutional right won through decades of student advocacy.\n\nAs we inaugurate our new digital publishing systems, we reaffirm our commitment to ethical rigor, fact-checked reporting, and unwavering support for every campus beat reporter.`
        },
        {
            id: 'eic-art-02',
            author: eicName,
            title: 'Modernizing Collegiate Newsrooms: The Lens Strategic Roadmap',
            category: 'Features',
            excerpt: 'A comprehensive operational overview of our publication’s transition to digital-first investigative cycles and archival digitization.',
            date: 'Sep 28, 2026',
            rawDate: '2026-09-28',
            status: 'Published',
            views: 4180,
            shares: 64,
            remarks: '',
            content: `In an era where news is consumed within seconds on mobile feeds, collegiate journalism must evolve without sacrificing depth. The Lens has spearheaded a systematic workflow modernization program designed to empower student writers and editors.\n\nBy unifying our editorial desk with modern draft revision queues and public transparency folios, we ensure that every story published meets international journalistic standards. Our upcoming initiatives include podcast audio digests and multimedia documentary fellowships for undergraduate contributors.`
        },
        {
            id: 'eic-art-03',
            author: eicName,
            title: 'State of the Student Body: University Welfare Analysis 2026',
            category: 'News',
            excerpt: 'An evidence-based survey analyzing commuter transit subsidies, dormitory occupancy rates, and student meal allowance purchasing power.',
            date: 'Oct 20, 2026',
            rawDate: '2026-10-20',
            status: 'Pending Review',
            views: 0,
            shares: 0,
            remarks: '',
            content: `A comprehensive university-wide survey conducted across eight constituent colleges indicates that 68% of off-campus student commuters spend upwards of four hours daily traversing transit routes.\n\nThe findings, scheduled for collegiate assembly presentation next week, advocate for an immediate 20% expansion of university shuttle services and temporary parking exemptions for motorized transport carpools.`
        },
        {
            id: 'eic-art-04',
            author: eicName,
            title: 'Campus Laboratory Infrastructure & Science Funding Disparities',
            category: 'Science and Technology',
            excerpt: 'Investigating grant distribution inequities across tertiary STEM research programs and undergraduate equipment quotas.',
            date: 'Oct 16, 2026',
            rawDate: '2026-10-16',
            status: 'For Revision',
            views: 0,
            shares: 0,
            remarks: 'Please integrate the latest response statement from the Vice President for Research and Development regarding laboratory equipment procurement cycles before publication.',
            content: `While headline institutional allocations showcase rising investments in artificial intelligence and bioinformatics, undergraduate teaching laboratories in physical chemistry continue to grapple with decade-old spectrophotometers.\n\nInterviews with senior thesis candidates reveal recurring delays in scheduled capstone experiments due to single-instrument bottlenecks in shared facilities.`
        },
        {
            id: 'eic-art-05',
            author: eicName,
            title: 'Midnight in the Pressroom: Four Decades of Print Archiving',
            category: 'Literature',
            excerpt: 'A lyrical retrospective on the smell of cold offset ink, lead type drawers, and the midnight coffee that fueled student revolutions.',
            date: 'Oct 14, 2026',
            rawDate: '2026-10-14',
            status: 'Draft',
            views: 0,
            shares: 0,
            remarks: '',
            content: `In the quiet corners of the basement pressroom, the mechanical cadence of the linotype machine once sounded like a mechanical heartbeat.\n\nDecades have passed, moving from hot metal and bromides to modern pixels and cloud databases. Yet the fundamental impulse remains unaltered: to record our collective history before the ink of today fades into tomorrow's memories.`
        }
    ];

    const STORAGE_KEY = 'eicMyArticles_v1';

    function getArticles() {
        let personalArticles = [];
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    personalArticles = parsed;
                }
            }
        } catch (e) {
            console.warn('Could not read eicMyArticles_v1', e);
        }

        if (personalArticles.length === 0) {
            personalArticles = JSON.parse(JSON.stringify(DEFAULT_EIC_ARTICLES));
            saveArticles(personalArticles);
        }

        // Synchronize with eicArticleDrafts from editor
        try {
            const rawDrafts = localStorage.getItem('eicArticleDrafts') || localStorage.getItem('executiveArticleDrafts');
            if (rawDrafts) {
                const parsedDrafts = JSON.parse(rawDrafts);
                if (Array.isArray(parsedDrafts)) {
                    parsedDrafts.forEach(d => {
                        const exists = personalArticles.some(a => String(a.id) === String(d.id));
                        if (!exists && d.title) {
                            personalArticles.unshift({
                                id: d.id,
                                author: eicName,
                                title: d.title || 'Untitled Draft',
                                category: d.category || 'News',
                                excerpt: d.excerpt || '',
                                date: d.date || 'Oct 22, 2026',
                                rawDate: d.rawDate || '2026-10-22',
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
            console.warn('Could not read eicArticleDrafts', e);
        }

        return personalArticles;
    }

    function saveArticles(articles) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
        } catch (e) {
            console.warn('Could not persist eicMyArticles_v1', e);
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
    // 3. ANALYTICS & TAB COUNTERS
    // =========================================================================
    function updateAnalyticsAndCounters() {
        const publishedArticles = allArticles.filter(a => a.status === 'Published');
        const pendingArticles = allArticles.filter(a => a.status === 'Pending Review');
        const revisionArticles = allArticles.filter(a => a.status === 'For Revision');
        const draftsArticles = allArticles.filter(a => a.status === 'Draft');

        const totalViewsCount = publishedArticles.reduce((sum, a) => sum + (Number(a.views) || 0), 0);

        // Header Views Pill
        if (statTotalViews) statTotalViews.textContent = formatNumber(totalViewsCount);

        // Tab Badges
        if (badgeAll) badgeAll.textContent = formatNumber(allArticles.length);
        if (badgePublished) badgePublished.textContent = formatNumber(publishedArticles.length);
        if (badgePending) badgePending.textContent = formatNumber(pendingArticles.length);
        if (badgeRevision) badgeRevision.textContent = formatNumber(revisionArticles.length);
        if (badgeDrafts) badgeDrafts.textContent = formatNumber(draftsArticles.length);
    }

    // =========================================================================
    // 4. RENDERING ARTICLES LIST (Matching Executive Design Exact Formats)
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
                                <a href="eic-submit-article.html?draftId=${encodeURIComponent(item.id)}" class="btn-box-view" style="text-decoration: none;" title="Edit draft in editor" onclick="event.stopPropagation()">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                    <span>Edit</span>
                                </a>
                                <button type="button" class="btn-box-view btn-delete-draft" data-id="${item.id}" data-title="${escapeHTML(item.title)}" style="color: #b42318;" title="Delete draft" onclick="event.stopPropagation()">
                                    <i class="fa-regular fa-trash-can"></i>
                                    <span>Delete</span>
                                </button>
                            ` : ''}

                            ${item.status === 'For Revision' ? `
                                <a href="eic-submit-article.html?draftId=${encodeURIComponent(item.id)}" class="btn-box-view" style="text-decoration: none;" title="Edit and revise manuscript" onclick="event.stopPropagation()">
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
        searchInput.addEventListener('input', () => {
            searchQuery = searchInput.value;
            if (clearSearchBtn) {
                if (searchQuery.length > 0) {
                    clearSearchBtn.classList.remove('hidden');
                } else {
                    clearSearchBtn.classList.add('hidden');
                }
            }
            renderArticles();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchQuery = '';
                clearSearchBtn.classList.add('hidden');
                searchInput.focus();
                renderArticles();
            }
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            renderArticles();
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            currentTab = 'all';
            tabButtons.forEach(b => {
                const isAll = b.getAttribute('data-tab') === 'all';
                b.classList.toggle('active', isAll);
                b.setAttribute('aria-selected', isAll ? 'true' : 'false');
            });

            if (searchInput) {
                searchInput.value = '';
                searchQuery = '';
            }
            if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
            if (sortSelect) {
                sortSelect.value = 'newest';
                currentSort = 'newest';
            }
            renderArticles();
        });
    }

    // =========================================================================
    // 6. CARD INTERACTIONS & MODAL TRIGGERS
    // =========================================================================
    function attachCardEventListeners() {
        const cards = articlesListContainer.querySelectorAll('.writer-article-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const articleId = card.getAttribute('data-id');
                if (articleId) openArticleViewer(articleId);
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const articleId = card.getAttribute('data-id');
                    if (articleId) openArticleViewer(articleId);
                }
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
        const article = allArticles.find(a => String(a.id) === String(articleId));
        if (!article) return;

        if (viewerTitle) viewerTitle.textContent = article.title;
        if (viewerCategory) viewerCategory.textContent = article.category || 'General';
        if (viewerDate) viewerDate.textContent = article.date;
        if (viewerAuthor) viewerAuthor.textContent = article.author || eicName;

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

            allArticles = allArticles.filter(a => String(a.id) !== String(pendingDeleteId));
            saveArticles(allArticles);

            // Also remove from eicArticleDrafts if present
            try {
                const rawDrafts = localStorage.getItem('eicArticleDrafts');
                if (rawDrafts) {
                    let drafts = JSON.parse(rawDrafts);
                    if (Array.isArray(drafts)) {
                        drafts = drafts.filter(d => String(d.id) !== String(pendingDeleteId));
                        localStorage.setItem('eicArticleDrafts', JSON.stringify(drafts));
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

    function openRemarksModal(articleId) {
        const article = allArticles.find(a => String(a.id) === String(articleId));
        if (!article || !remarksModal) return;

        if (remarksModalTitle) remarksModalTitle.textContent = article.title;
        if (remarksModalContent) remarksModalContent.textContent = article.remarks || 'No remarks recorded.';

        if (btnEditFromRemarks) {
            btnEditFromRemarks.href = `eic-submit-article.html?draftId=${encodeURIComponent(article.id)}`;
        }

        remarksModal.classList.remove('hidden');
    }

    // Global Escape Key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeArticleViewer();
            if (remarksModal) remarksModal.classList.add('hidden');
            if (deleteModal) deleteModal.classList.add('hidden');
        }
    });

    // =========================================================================
    // 7. INITIAL HYDRATION
    // =========================================================================
    updateAnalyticsAndCounters();
    renderArticles();
});
