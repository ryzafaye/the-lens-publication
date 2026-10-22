/**
 * THE LENS — MANAGE MY ARTICLES (SECTION HEAD PORTAL)
 * Clean, Reusable & Modular Implementation
 */

document.addEventListener('DOMContentLoaded', () => {

    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
        window.location.href = 'login.html';
        return;
    }

    const currentSection = localStorage.getItem('sectionHeadSection') || 'News';
    const authorName = localStorage.getItem('userName') || 'Danilo C. Ramos';

    // -------------------------------------------------------------------------
    // 1. DATASET MANAGEMENT
    // -------------------------------------------------------------------------
    const STORAGE_KEY = 'sectionHeadMyArticles_v1';

    const DEFAULT_SEED = [
        {
            id: 'sec-art-01',
            title: `Investigating University Resource Allocation: The ${currentSection} Perspective`,
            category: currentSection,
            date: "Oct 19, 2026",
            rawDate: "2026-10-19",
            status: "Published",
            views: 3840,
            shares: 64,
            author: authorName,
            excerpt: "An in-depth analysis of capital expenditure distributions, departmental facility grants, and laboratory modernisation timetables.",
            content: `Collegiate budget disclosures provide invaluable insights into institutional priorities. Across our campus departments, funding for equipment maintenance and instructional supplies directly impacts undergraduate research capacity.\n\nOver the past academic cycle, discretionary reserves allocated to student-facing facilities increased by 12%, though significant disparities remain between laboratory-heavy curricula and humanities programs.\n\nOur editorial investigation examines procurement audit documents and interviews academic deans to assess how equitably resource allocations meet student educational requirements.`
        },
        {
            id: 'sec-art-02',
            title: `Editorial Guidelines for Collegiate ${currentSection} Coverage in 2026`,
            category: currentSection,
            date: "Oct 21, 2026",
            rawDate: "2026-10-21",
            status: "Pending Review",
            views: 0,
            shares: 0,
            author: authorName,
            excerpt: "Establishing ethical attribution standards, primary document verification methods, and balanced source quotas for desk reporters.",
            content: `As campus reporting accelerates into multi-platform delivery, desk editors must uphold uncompromising standards of factual accuracy and contextual fairness.\n\nThis manuscript codifies updated guidelines for corroborating leaked administrative memorandums, conducting on-the-record interviews, and protecting source confidentiality under the Republic Act 10173.`
        },
        {
            id: 'sec-art-03',
            title: `Voices from the Faculty Lounge: Academic Autonomy in Modern Universities`,
            category: currentSection,
            date: "Oct 17, 2026",
            rawDate: "2026-10-17",
            status: "For Revision",
            views: 0,
            shares: 0,
            author: authorName,
            remarks: "Please incorporate faculty union survey responses regarding overload pay before final approval.",
            excerpt: "A qualitative survey exploring how instructional directives impact curriculum flexibility and tenure-track research productivity.",
            content: `Tenure-track educators increasingly report balancing heavy teaching loads against administrative compliance requirements, leaving diminishing hours for original scholarship.\n\nThis feature explores the delicate balance between university standardized assessment protocols and the individual professor's intellectual freedom in the lecture hall.`
        },
        {
            id: 'sec-art-draft-01',
            title: `Draft Outline: Semester-End ${currentSection} Retrospective`,
            category: currentSection,
            date: "Oct 22, 2026",
            rawDate: "2026-10-22",
            status: "Draft",
            views: 0,
            shares: 0,
            author: authorName,
            excerpt: "Curated collection of the most consequential stories, investigative disclosures, and student assembly triumphs documented this term.",
            content: `Preliminary notes and section breakdown for our publication's culminating printed folio and digital archival edition.`
        }
    ];

    function getArticles() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('Error reading from localStorage', e);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED));
        return DEFAULT_SEED;
    }

    function saveArticles(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            console.warn('Error saving to localStorage', e);
        }
    }

    let articlesList = getArticles();
    let currentTab = 'all';
    let pendingDeleteDraftId = null;

    // -------------------------------------------------------------------------
    // 2. DOM ELEMENTS
    // -------------------------------------------------------------------------
    const articlesContainer = document.getElementById('articles-list-container');
    const statTotalViews = document.getElementById('stat-total-views');

    const badgeAll = document.getElementById('badge-all');
    const badgePublished = document.getElementById('badge-published');
    const badgePending = document.getElementById('badge-pending');
    const badgeRevision = document.getElementById('badge-revision');
    const badgeDrafts = document.getElementById('badge-drafts');

    const tabButtons = document.querySelectorAll('.manage-tab-btn');

    // Modals
    const viewerModal = document.getElementById('article-viewer-modal');
    const closeViewerBtn = document.getElementById('close-viewer-btn');
    const viewerCategory = document.getElementById('viewer-category');
    const viewerDate = document.getElementById('viewer-date');
    const viewerReadTime = document.getElementById('viewer-read-time');
    const viewerTitle = document.getElementById('viewer-title');
    const viewerAuthor = document.getElementById('viewer-author');
    const viewerAuthorRole = document.getElementById('viewer-author-role');
    const viewerContent = document.getElementById('viewer-content');
    const viewerRemarksWrap = document.getElementById('viewer-remarks-wrap');
    const viewerRemarksText = document.getElementById('viewer-remarks-text');
    const viewerStatsBar = document.getElementById('viewer-stats-bar');
    const viewerViews = document.getElementById('viewer-views');
    const viewerShares = document.getElementById('viewer-shares');

    const remarksModal = document.getElementById('remarks-modal');
    const closeRemarksBtn = document.getElementById('close-remarks-btn');
    const remarksArticleTitle = document.getElementById('remarks-article-title');
    const remarksBodyText = document.getElementById('remarks-body-text');
    const btnEditFromRemarks = document.getElementById('btn-edit-from-remarks');
    let activeRemarksArticleId = null;

    const deleteModal = document.getElementById('delete-draft-modal');
    const deleteDraftName = document.getElementById('delete-draft-name');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    const toastContainer = document.getElementById('toast-container');

    // -------------------------------------------------------------------------
    // 3. UTILITIES
    // -------------------------------------------------------------------------
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
        toast.innerHTML = `<span class="toast-bullet-dot"></span><span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-dismissing');
            setTimeout(() => toast.remove(), 260);
        }, 3200);
    }

    // -------------------------------------------------------------------------
    // 4. METRICS & BADGES UPDATE
    // -------------------------------------------------------------------------
    function updateMetricsAndBadges() {
        const published = articlesList.filter(a => a.status === 'Published');
        const pending = articlesList.filter(a => a.status === 'Pending Review');
        const revision = articlesList.filter(a => a.status === 'For Revision');
        const drafts = articlesList.filter(a => a.status === 'Draft');

        const totalViews = published.reduce((sum, a) => sum + (a.views || 0), 0);
        if (statTotalViews) statTotalViews.textContent = totalViews.toLocaleString();

        if (badgeAll) badgeAll.textContent = articlesList.length;
        if (badgePublished) badgePublished.textContent = published.length;
        if (badgePending) badgePending.textContent = pending.length;
        if (badgeRevision) badgeRevision.textContent = revision.length;
        if (badgeDrafts) badgeDrafts.textContent = drafts.length;
    }

    // -------------------------------------------------------------------------
    // 5. RENDER ARTICLES STREAM
    // -------------------------------------------------------------------------
    function renderArticles() {
        if (!articlesContainer) return;

        let filtered = [...articlesList];
        if (currentTab === 'published') filtered = filtered.filter(a => a.status === 'Published');
        else if (currentTab === 'pending') filtered = filtered.filter(a => a.status === 'Pending Review');
        else if (currentTab === 'revision') filtered = filtered.filter(a => a.status === 'For Revision');
        else if (currentTab === 'drafts') filtered = filtered.filter(a => a.status === 'Draft');

        if (filtered.length === 0) {
            articlesContainer.innerHTML = `
                <div class="articles-empty-state">
                    <div class="empty-icon-circle">
                        <i class="fa-regular fa-folder-open"></i>
                    </div>
                    <h3 class="empty-title">No manuscripts in this section</h3>
                    <p class="empty-subtitle">There are currently no items under the selected filter.</p>
                </div>
            `;
            return;
        }

        articlesContainer.innerHTML = filtered.map(item => {
            let badgeClass = 'badge-draft';
            let badgeDotColor = 'bg-slate-500';

            if (item.status === 'Published') {
                badgeClass = 'badge-published';
                badgeDotColor = 'bg-emerald-600';
            } else if (item.status === 'Pending Review') {
                badgeClass = 'badge-pending';
                badgeDotColor = 'bg-amber-600';
            } else if (item.status === 'For Revision') {
                badgeClass = 'badge-revision';
                badgeDotColor = 'bg-red-600';
            }

            const isDraft = (item.status === 'Draft');
            const isRevision = (item.status === 'For Revision');

            return `
                <article class="article-manage-card" data-id="${item.id}" tabindex="0">
                    <!-- Header: Category & Date on Left, Status Badge on UPPER RIGHT -->
                    <div class="article-card-header">
                        <div class="article-card-meta">
                            <span class="meta-category">${escapeHTML(item.category || currentSection)}</span>
                            <span class="meta-dot">&bull;</span>
                            <span class="meta-date">${escapeHTML(item.date)}</span>
                            ${item.status === 'Published' && item.views !== undefined ? `
                                <span class="meta-dot">&bull;</span>
                                <span class="meta-views"><i class="fa-regular fa-eye"></i> ${item.views.toLocaleString()} views</span>
                            ` : ''}
                        </div>

                        <!-- Pinned UPPER-RIGHT Status Badge -->
                        <div class="article-status-container">
                            <span class="status-badge-pill ${badgeClass}">
                                <span class="status-dot ${badgeDotColor}"></span>
                                <span>${escapeHTML(item.status)}</span>
                            </span>
                        </div>
                    </div>

                    <!-- Body: Headline & Excerpt -->
                    <div class="article-card-body">
                        <h2 class="article-card-title">${escapeHTML(item.title)}</h2>
                        ${item.excerpt ? `
                            <p class="article-card-excerpt">${escapeHTML(item.excerpt)}</p>
                        ` : ''}
                    </div>

                    <!-- Footer Actions -->
                    ${(isDraft || isRevision) ? `
                        <div class="article-card-actions">
                            ${isDraft ? `
                                <button type="button" class="btn-action-edit btn-edit-draft" data-id="${item.id}" title="Edit draft in Write Article canvas">
                                    <i class="fa-solid fa-file-pen"></i>
                                    <span>Edit</span>
                                </button>
                                <!-- DELETE BUTTON STRICTLY ON DRAFTS ONLY -->
                                <button type="button" class="btn-action-delete btn-delete-draft" data-id="${item.id}" data-title="${escapeHTML(item.title)}" title="Delete draft">
                                    <i class="fa-regular fa-trash-can"></i>
                                    <span>Delete</span>
                                </button>
                            ` : ''}

                            ${isRevision ? `
                                <button type="button" class="btn-action-remarks btn-show-remarks" data-id="${item.id}" title="View editorial remarks">
                                    <i class="fa-regular fa-comment-dots"></i>
                                    <span>Remarks</span>
                                </button>
                                <button type="button" class="btn-action-revise btn-revise-draft" data-id="${item.id}" title="Revise manuscript">
                                    <i class="fa-solid fa-feather-pointed"></i>
                                    <span>Revise</span>
                                </button>
                            ` : ''}
                        </div>
                    ` : ''}
                </article>
            `;
        }).join('');

        attachCardEventListeners();
    }

    // -------------------------------------------------------------------------
    // 6. CARD ACTION LISTENERS
    // -------------------------------------------------------------------------
    function attachCardEventListeners() {
        // Click on card body to open story viewer
        articlesContainer.querySelectorAll('.article-manage-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('button') || e.target.closest('a')) return;
                const id = card.getAttribute('data-id');
                openArticleViewer(id);
            });
        });

        // Edit draft
        articlesContainer.querySelectorAll('.btn-edit-draft').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                window.location.href = `section-head-submit-article.html?draftId=${encodeURIComponent(id)}`;
            });
        });

        // Revise draft
        articlesContainer.querySelectorAll('.btn-revise-draft').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                window.location.href = `section-head-submit-article.html?draftId=${encodeURIComponent(id)}`;
            });
        });

        // Delete draft (Drafts only)
        articlesContainer.querySelectorAll('.btn-delete-draft').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const title = btn.getAttribute('data-title') || 'this draft';
                pendingDeleteDraftId = id;
                if (deleteDraftName) deleteDraftName.textContent = `"${title}"`;
                if (deleteModal) deleteModal.classList.remove('hidden');
            });
        });

        // Show Remarks
        articlesContainer.querySelectorAll('.btn-show-remarks').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                openRemarksModal(id);
            });
        });
    }

    // -------------------------------------------------------------------------
    // 7. VIEWER MODAL LOGIC
    // -------------------------------------------------------------------------
    function openArticleViewer(id) {
        const item = articlesList.find(a => a.id === id);
        if (!item || !viewerModal) return;

        viewerCategory.textContent = item.category || currentSection;
        viewerDate.textContent = item.date;
        viewerTitle.textContent = item.title;
        viewerAuthor.textContent = item.author || authorName;
        viewerAuthorRole.textContent = userRole || `${currentSection} Head`;

        // Calculate read time
        const fullText = item.content || item.excerpt || '';
        const wordCount = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;
        const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
        viewerReadTime.textContent = `${readTimeMinutes} min read`;

        // Clean paragraph structure
        if (viewerContent) {
            const paragraphs = fullText.split(/\n\n+/).filter(p => p.trim());
            if (paragraphs.length > 0) {
                viewerContent.innerHTML = paragraphs.map(p => `<p class="viewer-paragraph">${escapeHTML(p.trim())}</p>`).join('');
            } else {
                viewerContent.innerHTML = `<p class="viewer-paragraph">${escapeHTML(item.excerpt || 'No full content.')}</p>`;
            }
        }

        // Remarks
        if (item.status === 'For Revision' && item.remarks) {
            viewerRemarksText.textContent = item.remarks;
            viewerRemarksWrap.style.display = 'block';
        } else {
            viewerRemarksWrap.style.display = 'none';
        }

        // Stats
        if (item.status === 'Published') {
            viewerViews.textContent = `${(item.views || 0).toLocaleString()} views`;
            viewerShares.textContent = `${item.shares || 0} shares`;
            viewerStatsBar.style.display = 'flex';
        } else {
            viewerStatsBar.style.display = 'none';
        }

        viewerModal.classList.remove('hidden');
    }

    if (closeViewerBtn && viewerModal) {
        closeViewerBtn.addEventListener('click', () => viewerModal.classList.add('hidden'));
        viewerModal.addEventListener('click', (e) => {
            if (e.target === viewerModal) viewerModal.classList.add('hidden');
        });
    }

    // -------------------------------------------------------------------------
    // 8. REMARKS MODAL LOGIC
    // -------------------------------------------------------------------------
    function openRemarksModal(id) {
        const item = articlesList.find(a => a.id === id);
        if (!item || !remarksModal) return;

        activeRemarksArticleId = id;
        remarksArticleTitle.textContent = item.title;
        remarksBodyText.textContent = item.remarks || "Please review the editorial instructions and update your manuscript accordingly.";
        remarksModal.classList.remove('hidden');
    }

    if (closeRemarksBtn && remarksModal) {
        closeRemarksBtn.addEventListener('click', () => remarksModal.classList.add('hidden'));
        remarksModal.addEventListener('click', (e) => {
            if (e.target === remarksModal) remarksModal.classList.add('hidden');
        });
    }

    if (btnEditFromRemarks) {
        btnEditFromRemarks.addEventListener('click', () => {
            if (activeRemarksArticleId) {
                window.location.href = `section-head-submit-article.html?draftId=${encodeURIComponent(activeRemarksArticleId)}`;
            }
        });
    }

    // -------------------------------------------------------------------------
    // 9. DELETE DRAFT MODAL ACTIONS
    // -------------------------------------------------------------------------
    if (cancelDeleteBtn && deleteModal) {
        cancelDeleteBtn.addEventListener('click', () => {
            pendingDeleteDraftId = null;
            deleteModal.classList.add('hidden');
        });
    }

    if (confirmDeleteBtn && deleteModal) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (!pendingDeleteDraftId) return;

            articlesList = articlesList.filter(a => a.id !== pendingDeleteDraftId);
            saveArticles(articlesList);

            deleteModal.classList.add('hidden');
            pendingDeleteDraftId = null;

            updateMetricsAndBadges();
            renderArticles();
            showToast('Draft manuscript deleted successfully.', 'success');
        });
    }

    // -------------------------------------------------------------------------
    // 10. TABS CONTROLLER
    // -------------------------------------------------------------------------
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

    // Initial Hydration
    updateMetricsAndBadges();
    renderArticles();
});

