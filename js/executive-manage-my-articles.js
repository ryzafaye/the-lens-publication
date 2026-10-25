/**
 * ============================================================================
 * THE LENS — EXECUTIVE MANAGE MY ARTICLES CONTROLLER
 * Copies the Exact Style Format & Logic of Writer Dashboard Analytics Cards
 * and Writer Manage My Articles for the Executive Portal
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 0. ROLE GUARD: REDIRECT WRITERS TO DEDICATED WRITER MANAGE ARTICLES
    // =========================================================================
    const activeRole = localStorage.getItem('userRole') || '';
    if (activeRole === 'Writer' || activeRole.toLowerCase().includes('writer') || activeRole.toLowerCase().includes('contributor')) {
        window.location.replace('writer-manage-articles.html');
        return;
    }

    // Active executive details
    const executiveName = localStorage.getItem('executiveName') || localStorage.getItem('userName') || 'Juan Dela Cruz';
    const executiveRole = localStorage.getItem('executiveRole') || (activeRole !== 'Writer' ? activeRole : 'President');

    // DOM Elements - Personal Analytics Cards (Exact Writer Dashboard Format)
    const statTotalViews = document.getElementById('stat-total-views');
    const statPublishedCount = document.getElementById('stat-published-count');
    const statPendingCount = document.getElementById('stat-pending-count');
    const statDraftsCount = document.getElementById('stat-drafts-count');

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
    // 1. DATASET: SEEDED & PERSISTED EXECUTIVE ARTICLES
    // =========================================================================
    const DEFAULT_EXECUTIVE_ARTICLES = [
        {
            id: 'exec-art-01',
            author: executiveName,
            title: 'The Future of University Press Freedom: A Presidential Address',
            category: 'Opinion',
            excerpt: 'Why defending independent campus journalism and transparent administration disclosures remains essential in an era of digital misinformation.',
            date: 'Oct 19, 2026',
            rawDate: '2026-10-19',
            status: 'Published',
            views: 5120,
            shares: 86,
            remarks: '',
            content: `Student publications hold a unique mandate within democratic universities: to reflect the unvarnished realities of the student body without fear of administrative reprisal.\n\nOver the past academic cycle, our editorial staff has covered pivotal campus disputes, from facilities budget reallocations to faculty overload directives. Throughout each inquiry, our guiding philosophy has remained unwavering—freedom of expression is not an administrative privilege to be dispensed, but an institutional right won through decades of student advocacy.\n\nAs we inaugurate our new digital publishing systems, we reaffirm our commitment to ethical rigor, fact-checked reporting, and unwavering support for every campus beat reporter.`
        },
        {
            id: 'exec-art-02',
            author: executiveName,
            title: 'Modernizing Collegiate Newsrooms: The Lens Strategic Roadmap',
            category: 'Features',
            excerpt: 'A comprehensive operational overview of our publication’s transition to digital-first investigative cycles and archival digitization.',
            date: 'Sep 28, 2026',
            rawDate: '2026-09-28',
            status: 'Published',
            views: 3460,
            shares: 42,
            remarks: '',
            content: `In an era where news is consumed within seconds on mobile feeds, collegiate journalism must evolve without sacrificing depth. The Lens has spearheaded a systematic workflow modernization program designed to empower student writers and editors.\n\nBy unifying our editorial desk with modern draft revision queues and public transparency folios, we ensure that every story published meets international journalistic standards. Our upcoming initiatives include podcast audio digests and multimedia documentary fellowships for undergraduate contributors.`
        },
        {
            id: 'exec-art-03',
            author: executiveName,
            title: 'Midyear Operational Review & Editorial Guidelines 2025',
            category: 'Opinion',
            excerpt: 'A retrospective evaluation of print distribution quotas and digital engagement strategies across regional university branches.',
            date: 'Jul 22, 2025',
            rawDate: '2025-07-22',
            status: 'Published',
            views: 2840,
            shares: 14,
            remarks: '',
            content: `Looking back at the academic calendar of 2024–2025, our editorial staff conducted a comprehensive survey across the university student body regarding print vs digital readership preferences.\n\nResults demonstrated a notable 40% surge in web engagement via smartphone devices, prompting our pivot towards mobile-first newsroom publishing while maintaining high-quality archival print folios for university history.`
        },
        {
            id: 'exec-art-04',
            author: executiveName,
            title: 'State of the Student Body: University Welfare Analysis 2026',
            category: 'News',
            excerpt: 'An evidence-based survey analyzing commuter transit subsidies, dormitory occupancy rates, and student meal allowance purchasing power.',
            date: 'Oct 20, 2026',
            rawDate: '2026-10-20',
            status: 'Pending Review',
            views: 0,
            shares: 0,
            remarks: '',
            content: `Escalating living costs in the surrounding university district have placed renewed strain on undergraduate budgets. Surveying more than 1,200 dormitory residents and daily commuters, this investigation reveals key vulnerabilities in campus support systems.\n\nOver 68% of off-campus commuters report spending more than four hours daily in transit, while campus food concessionaires have raised average meal prices by 22% over the last twelve months. The editorial board is preparing recommendations for university welfare committee discussions next month.`
        },
        {
            id: 'exec-art-05',
            author: executiveName,
            title: 'Ethical Standards for Student Investigative Reporting in Digital Spaces',
            category: 'Opinion',
            excerpt: 'Addressing attribution requirements, source confidentiality protocols, and cybersecurity hygiene for collegiate journalists.',
            date: 'Oct 16, 2026',
            rawDate: '2026-10-16',
            status: 'For Revision',
            views: 0,
            shares: 0,
            remarks: 'Please expand Section 3 with citations from the Philippine Press Institute Code of Ethics before resubmission.',
            content: `When reporting on sensitive institutional matters, student journalists carry ethical responsibilities identical to those of seasoned professionals. Digital communication channels introduce both unprecedented research access and significant security vulnerabilities.\n\nEvery student journalist must adhere to rigorous source corroboration and encryption practices when handling whistleblower leaks or confidential financial records.`
        }
    ];

    const STORAGE_KEY = 'executiveMyArticles_v1';

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
            console.warn('Could not load executiveMyArticles_v1', e);
        }

        if (personalArticles.length === 0) {
            personalArticles = JSON.parse(JSON.stringify(DEFAULT_EXECUTIVE_ARTICLES));
        }

        // Incorporate drafts from executiveArticleDrafts
        try {
            const rawDrafts = localStorage.getItem('executiveArticleDrafts');
            if (rawDrafts) {
                const drafts = JSON.parse(rawDrafts);
                if (Array.isArray(drafts)) {
                    drafts.forEach(d => {
                        const exists = personalArticles.some(a => a.id === d.id);
                        if (!exists) {
                            personalArticles.push({
                                id: d.id,
                                author: executiveName,
                                title: d.title,
                                category: d.category || 'Features',
                                excerpt: d.excerpt || 'Draft manuscript in progress.',
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
            console.warn('Could not read executiveArticleDrafts', e);
        }

        return personalArticles;
    }

    function saveArticles(articles) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
        } catch (e) {
            console.warn('Could not persist executiveMyArticles_v1', e);
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
    // 3. ANALYTICS CARDS (EXACT WRITER DASHBOARD LOGIC) & TAB BADGES
    // =========================================================================
    function updateAnalyticsAndCounters() {
        const publishedArticles = allArticles.filter(a => a.status === 'Published');
        const pendingArticles = allArticles.filter(a => a.status === 'Pending Review');
        const revisionArticles = allArticles.filter(a => a.status === 'For Revision');
        const draftsArticles = allArticles.filter(a => a.status === 'Draft');

        const totalViewsCount = publishedArticles.reduce((sum, a) => sum + (Number(a.views) || 0), 0);

        // Update the 4 Dashboard Cards: Total Views, Published Articles, Pending Submissions, Drafts
        if (statTotalViews) statTotalViews.textContent = formatNumber(totalViewsCount);
        if (statPublishedCount) statPublishedCount.textContent = formatNumber(publishedArticles.length);
        if (statPendingCount) statPendingCount.textContent = formatNumber(pendingArticles.length);
        if (statDraftsCount) statDraftsCount.textContent = formatNumber(draftsArticles.length);

        // Update Tab Badges
        if (badgeAll) badgeAll.textContent = formatNumber(allArticles.length);
        if (badgePublished) badgePublished.textContent = formatNumber(publishedArticles.length);
        if (badgePending) badgePending.textContent = formatNumber(pendingArticles.length);
        if (badgeRevision) badgeRevision.textContent = formatNumber(revisionArticles.length);
        if (badgeDrafts) badgeDrafts.textContent = formatNumber(draftsArticles.length);
    }

    // =========================================================================
    // 4. RENDERING ARTICLES LIST (EXACT WRITER MANAGE ARTICLES STYLE & LOGIC)
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

            let categoryTagClass = 'tag-news';
            const catLower = (item.category || '').toLowerCase();
            if (catLower.includes('feature')) categoryTagClass = 'tag-features';
            else if (catLower.includes('opinion')) categoryTagClass = 'tag-opinion';
            else if (catLower.includes('science')) categoryTagClass = 'tag-science';
            else if (catLower.includes('literary') || catLower.includes('literature')) categoryTagClass = 'tag-literary';

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
                                <a href="executive-submit-article.html?draftId=${encodeURIComponent(item.id)}" class="btn-box-view" style="text-decoration: none;" title="Edit draft in editor" onclick="event.stopPropagation()">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                    <span>Edit</span>
                                </a>
                                <button type="button" class="btn-box-view btn-delete-draft" data-id="${item.id}" data-title="${escapeHTML(item.title)}" style="color: #b42318;" title="Delete draft" onclick="event.stopPropagation()">
                                    <i class="fa-regular fa-trash-can"></i>
                                    <span>Delete</span>
                                </button>
                            ` : ''}

                            ${item.status === 'For Revision' ? `
                                <a href="executive-submit-article.html?draftId=${encodeURIComponent(item.id)}" class="btn-box-view" style="text-decoration: none;" title="Edit and revise manuscript" onclick="event.stopPropagation()">
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
        const cards = articlesListContainer.querySelectorAll('.writer-article-card, .clickable-article-card');
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
        if (viewerAuthor) viewerAuthor.textContent = article.author || executiveName;

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

            // Also remove from executiveArticleDrafts if present
            try {
                const rawDrafts = localStorage.getItem('executiveArticleDrafts');
                if (rawDrafts) {
                    let drafts = JSON.parse(rawDrafts);
                    if (Array.isArray(drafts)) {
                        drafts = drafts.filter(d => d.id !== pendingDeleteId);
                        localStorage.setItem('executiveArticleDrafts', JSON.stringify(drafts));
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
                window.location.href = `executive-submit-article.html?draftId=${encodeURIComponent(activeRemarksArticleId)}`;
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
