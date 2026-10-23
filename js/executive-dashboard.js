/**
 * The Lens — Executive Dashboard Script
 * Clean, Reusable & Modular Implementation
 * 
 * Features:
 * 1. Auth Guard (Redirects to login if userRole is missing)
 * 2. Mobile Accordion Navigation (Hamburger toggle)
 * 3. Real-Time Clock on Left (Date | Time in PH: "Oct 18, 2026 | 1:15 PM")
 * 4. Data-Driven Hydration from Shared Dataset (localStorage / articles.js):
 *    - 4 Metrics Cards (Monthly Readership, Total Articles, etc.)
 *    - Activity Log with "View all"
 *    - Recent Submissions (Top 5 table with direct article viewer modal triggers)
 *    - Most Viewed Articles (Current Month badge, Category above title in maroon, Title in middle, Author below)
 *    - Top Performing Journalists Leaderboard
 * 5. In-Place Article Viewer Modal:
 *    - Opens full story overlay directly (no redirect to manage-articles.html)
 *    - Bottom actions: Edit Article, Move to Archive, Emergency Delete
 *    - Full synchronization with localStorage('executiveArticles')
 * 6. Logout Session Cleanup
 */

import { articles as defaultArticles } from './articles.js';

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. AUTHENTICATION & ROLE VERIFICATION
    // =========================================================================
    const userRole = localStorage.getItem('userRole');

    // Route Guard: If not signed in with a valid role, redirect to login
    if (!userRole) {
        window.location.href = 'login.html';
        return;
    }

    // =========================================================================
    // 2. HELPER UTILITIES: ESCAPE HTML & TOAST NOTIFICATIONS
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

    const toastContainer = document.getElementById('toast-container');
    function showToast(message, type = 'success') {
        if (!toastContainer) return;

        // Dismiss existing toast immediately to prevent stacking or flashing
        const existingToasts = toastContainer.querySelectorAll('.toast-message');
        existingToasts.forEach(t => t.remove());

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
    // 6. SHARED ARTICLES DATASET & PERSISTENCE
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
        return defaultArticles;
    }

    function saveArticles(list) {
        try {
            localStorage.setItem('executiveArticles', JSON.stringify(list));
        } catch (e) {
            console.warn('Could not persist executiveArticles to localStorage', e);
        }
    }

    let articles = getStoredArticles();

    // =========================================================================
    // 7. DYNAMIC MONTH & DATA HYDRATION
    // =========================================================================
    const now = new Date();
    const currentMonthName = now.toLocaleString('en-US', { month: 'long' });

    // Set dynamic month badge in Most Viewed Articles panel
    const mostViewedMonthBadge = document.getElementById('most-viewed-month-badge');
    if (mostViewedMonthBadge) {
        mostViewedMonthBadge.textContent = currentMonthName;
    }

    // Activity Log Static Entries (Top 5 Recent with avatars)
    const ACTIVITY_LOG_DATA = [
        {
            user: "Juan Dela Cruz",
            avatar: "images/member-placeholder.svg",
            action: "approved",
            subjectType: "Article",
            target: "Academic Freedom in the Digital Era",
            time: "12m ago"
        },
        {
            user: "Maria Santos",
            avatar: "images/member-placeholder.svg",
            action: "submitted",
            subjectType: "Article",
            target: "Digital divide persists as student WiFi coverage drops in outer colleges",
            time: "45m ago"
        },
        {
            user: "Juan Dela Cruz",
            avatar: "images/member-placeholder.svg",
            action: "created",
            subjectType: "Account",
            target: "Joshua Hernandez (BN-0)",
            time: "2h ago"
        },
        {
            user: "Carlo Ramos",
            avatar: "images/member-placeholder.svg",
            action: "uploaded",
            subjectType: "Photo Asset",
            target: "Central University Library Modernization Gallery",
            time: "3h ago"
        },
        {
            user: "Finance Desk",
            avatar: "images/member-placeholder.svg",
            action: "verified",
            subjectType: "Transparency Report",
            target: "Q3 Publication Operating Budget Liquidation",
            time: "5h ago"
        }
    ];

    function getStatusBadgeHtml(status) {
        const lower = (status || 'approved').toLowerCase();
        if (lower === 'approved' || lower === 'published') {
            return `<span class="status-badge status-approved">Approved</span>`;
        }
        if (lower === 'in review' || lower === 'review') {
            return `<span class="status-badge status-review">In Review</span>`;
        }
        return `<span class="status-badge status-draft">Draft</span>`;
    }

    // =========================================================================
    // 8. DASHBOARD RENDERING PIPELINE
    // =========================================================================
    function renderDashboard() {
        const activeArticles = articles.filter(a => !a.isArchived);
        const totalViews = activeArticles.reduce((sum, a) => sum + (Number(a.views) || 0), 0);

        // A. Metrics Cards (4 Cards)
        const metricsContainer = document.getElementById('metrics-grid');
        if (metricsContainer) {
            const metrics = [
                {
                    label: "Pending Approvals",
                    value: "7",
                    subtitle: "Awaiting EIC / Pres review",
                    icon: "fa-regular fa-clock",
                    delayClass: "delay-1"
                },
                {
                    label: "Monthly Readership",
                    value: totalViews.toLocaleString(),
                    subtitle: "Views across all desks",
                    icon: "fa-regular fa-eye",
                    delayClass: "delay-2"
                },
                {
                    label: "Active Members",
                    value: "28",
                    subtitle: "Staff & editorial roster",
                    icon: "fa-solid fa-users",
                    delayClass: "delay-3"
                },
                {
                    label: "Total Articles",
                    value: String(activeArticles.length),
                    subtitle: `Published this ${currentMonthName}`,
                    icon: "fa-regular fa-newspaper",
                    delayClass: "delay-4"
                }
            ];

            metricsContainer.innerHTML = metrics.map(item => `
                <div class="metric-card animate-fade-in ${item.delayClass}">
                    <div class="metric-header">
                        <span class="metric-label">${escapeHTML(item.label)}</span>
                        <div class="metric-icon-box">
                            <i class="${item.icon}"></i>
                        </div>
                    </div>
                    <div class="metric-value">${escapeHTML(item.value)}</div>
                    <div class="metric-subtitle">${escapeHTML(item.subtitle)}</div>
                </div>
            `).join('');
        }

        // B. Activity Log (Top 5 Recent with Causer Action Subject Format)
        const activityContainer = document.getElementById('recent-activity-list');
        if (activityContainer) {
            let logsToDisplay = ACTIVITY_LOG_DATA;
            try {
                const storedLogs = localStorage.getItem('executiveActivityLogs_v1');
                if (storedLogs) {
                    const parsed = JSON.parse(storedLogs);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        logsToDisplay = parsed.slice(0, 5).map(item => ({
                            user: item.causer,
                            avatar: item.causerAvatar || 'images/member-placeholder.svg',
                            action: item.action,
                            subjectType: item.subjectType || 'Article',
                            target: item.subjectName,
                            time: item.timestampText
                        }));
                    }
                }
            } catch (e) {
                // Fallback to default
            }

            activityContainer.innerHTML = logsToDisplay.map(item => `
                <div class="activity-item" onclick="window.location.href='activity-logs.html'" style="cursor: pointer;" title="Open Activity Log">
                    <div class="activity-avatar">
                        <img src="${item.avatar}" alt="${escapeHTML(item.user)}">
                    </div>
                    <div class="activity-details">
                        <p class="activity-text">
                            <strong>${escapeHTML(item.user)}</strong> ${escapeHTML(item.action)} the ${escapeHTML(item.subjectType || 'Article')} <em>"${escapeHTML(item.target)}"</em> <span style="color:#667085; font-size:0.75rem; margin-left:3px;">${escapeHTML(item.time)}.</span>
                        </p>
                        <span class="activity-time">${escapeHTML(item.time)}</span>
                    </div>
                </div>
            `).join('');
        }

        // C. Recent Submissions (Top 5 Table with Direct Modal View Trigger)
        const tableBody = document.getElementById('submissions-table-body');
        
        function formatSectionBadgeHtml(category) {
            if (!category) return '';
            const catStr = String(category).trim();
            // Put "Technology" on the next line for optimal editorial fit
            if (/^science\s+and\s+technology$/i.test(catStr)) {
                return `<span class="table-section-tag section-tag-multiline">Science and<br>Technology</span>`;
            }
            if (/^science\s+&\s+technology$/i.test(catStr)) {
                return `<span class="table-section-tag section-tag-multiline">Science &amp;<br>Technology</span>`;
            }
            return `<span class="table-section-tag">${escapeHTML(catStr)}</span>`;
        }

        if (tableBody) {
            const submissions = [...activeArticles]
                .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate))
                .slice(0, 5);

            tableBody.innerHTML = submissions.map(art => `
                <tr>
                    <td>
                        <button type="button" class="table-article-btn" data-action="view" data-id="${art.id}" title="${escapeHTML(art.title)}">
                            ${escapeHTML(art.title)}
                        </button>
                    </td>
                    <td><span class="table-author">${escapeHTML(art.author)}</span></td>
                    <td class="hide-on-mobile">${formatSectionBadgeHtml(art.category)}</td>
                    <td>${getStatusBadgeHtml('Approved')}</td>
                    <td class="hide-on-mobile"><span class="table-date">${escapeHTML(art.date)}</span></td>
                </tr>
            `).join('');
        }

        // D. Most Viewed Articles (Top 3 by Views: Category ABOVE title in maroon, Title in middle, Author below)
        const mostViewedContainer = document.getElementById('most-viewed-list');
        if (mostViewedContainer) {
            const mostViewed = [...activeArticles]
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 3);

            mostViewedContainer.innerHTML = mostViewed.map((art, idx) => `
                <div class="ranked-item" data-article-id="${art.id}">
                    <span class="rank-number ${idx === 0 ? 'top-rank' : ''}">${idx + 1}</span>
                    <div class="ranked-content">
                        <div class="ranked-category-tag">${escapeHTML(art.category)}</div>
                        <button type="button" class="ranked-title-btn" data-action="view" data-id="${art.id}" title="${escapeHTML(art.title)}">
                            ${escapeHTML(art.title)}
                        </button>
                        <div class="ranked-meta-row">
                            <span class="ranked-author"><i class="fa-solid fa-pen-nib" aria-hidden="true" style="font-size: 0.70rem; margin-right: 4px; color: var(--text-muted, #667085);"></i>${escapeHTML(art.author)}</span>
                            <span class="ranked-stats">
                                <span class="stat-metric" title="Views"><i class="fa-regular fa-eye"></i> ${Number(art.views || 0).toLocaleString()}</span>
                                <span class="stat-sep">•</span>
                                <span class="stat-metric" title="Shares"><i class="fa-solid fa-share-nodes"></i> ${Number(art.shares || 0).toLocaleString()}</span>
                            </span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // E. Top Performing Journalists (Table Layout: Name & Number Only)
        const topJournalistsTableBody = document.getElementById('top-journalists-table-body');
        const topJournalistsContainer = document.getElementById('top-journalists-list');

        const authorCounts = {};
        activeArticles.forEach(a => {
            if (a.author) {
                authorCounts[a.author] = (authorCounts[a.author] || 0) + 1;
            }
        });

        const topJournalists = Object.entries(authorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({
                name,
                count
            }));

        if (topJournalistsTableBody) {
            topJournalistsTableBody.innerHTML = topJournalists.map(j => `
                <tr>
                    <td class="col-author-name">${escapeHTML(j.name)}</td>
                    <td class="col-article-count">${j.count}</td>
                </tr>
            `).join('');
        } else if (topJournalistsContainer) {
            topJournalistsContainer.innerHTML = topJournalists.map(j => `
                <div class="journalist-item">
                    <span class="journalist-name">${escapeHTML(j.name)}</span>
                    <span class="journalist-count-badge">${j.count}</span>
                </div>
            `).join('');
        }
    }

    // Initial Dashboard Render
    renderDashboard();

    // =========================================================================
    // 9. MODALS SYSTEM: VIEWER, EDIT, & ACTION CONFIRMATION
    // =========================================================================
    let currentViewingArticleId = null;
    let pendingModalAction = null;

    // Modals DOM References
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

    // Edit Modal DOM References
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

    // Action Confirmation Modal DOM References
    const actionModal = document.getElementById('action-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalIconHeader = document.getElementById('modal-icon-header');
    const modalIcon = document.getElementById('modal-icon');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    // -------------------------------------------------------------------------
    // Article Viewer Modal Logic
    // -------------------------------------------------------------------------
    function openArticleViewer(id) {
        const article = articles.find(a => a.id === id);
        if (!article || !viewerModal) return;

        currentViewingArticleId = id;

        // Populate metadata
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

    // -------------------------------------------------------------------------
    // Action Confirmation Modal Logic
    // -------------------------------------------------------------------------
    function openActionModal(type, title, description, confirmText, onConfirm) {
        if (!actionModal) return;

        if (modalIconHeader) {
            modalIconHeader.className = `modal-icon-header ${type}`;
        }

        if (modalIcon) {
            if (type === 'danger') modalIcon.className = 'fa-solid fa-triangle-exclamation';
            else if (type === 'warning') modalIcon.className = 'fa-solid fa-box-archive';
            else modalIcon.className = 'fa-solid fa-arrow-rotate-left';
        }

        if (modalTitle) modalTitle.textContent = title;
        if (modalDescription) modalDescription.textContent = description;
        if (modalConfirmBtn) {
            modalConfirmBtn.textContent = confirmText;
            modalConfirmBtn.className = `modal-btn ${type === 'danger' ? 'modal-btn-confirm-danger' : 'modal-btn-confirm-primary'}`;
        }

        pendingModalAction = onConfirm;
        actionModal.classList.remove('hidden');
    }

    function closeActionModal() {
        if (!actionModal) return;
        actionModal.classList.add('hidden');
        pendingModalAction = null;
    }

    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener('click', () => {
            if (typeof pendingModalAction === 'function') {
                pendingModalAction();
            }
            closeActionModal();
        });
    }

    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeActionModal);
    if (actionModal) {
        actionModal.addEventListener('click', (e) => {
            if (e.target === actionModal) closeActionModal();
        });
    }

    // -------------------------------------------------------------------------
    // Viewer Bottom Actions: Edit, Move to Archive/Restore, Emergency Delete
    // -------------------------------------------------------------------------
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
                if (!art) return;
                closeViewerModal();

                if (art.isArchived) {
                    openActionModal(
                        'info',
                        'Restore Article',
                        `Restore "${art.title}" back to active editorial circulation?`,
                        'Restore Article',
                        () => {
                            art.isArchived = false;
                            saveArticles(articles);
                            renderDashboard();
                            showToast(`"${art.title}" restored to Active Articles.`, 'success');
                        }
                    );
                } else {
                    openActionModal(
                        'warning',
                        'Move Article to Archive',
                        `Are you sure you want to move "${art.title}" to the archived editions?`,
                        'Move to Archive',
                        () => {
                            art.isArchived = true;
                            saveArticles(articles);
                            renderDashboard();
                            showToast(`"${art.title}" moved to Archive.`, 'info');
                        }
                    );
                }
            }
        });
    }

    if (viewerActionDelete) {
        viewerActionDelete.addEventListener('click', () => {
            if (currentViewingArticleId) {
                const id = currentViewingArticleId;
                const art = articles.find(a => a.id === id);
                if (!art) return;
                closeViewerModal();

                openActionModal(
                    'danger',
                    'Emergency Delete Article',
                    `PERMANENT ACTION: Are you sure you want to permanently delete "${art.title}" by ${art.author}? This operation cannot be reversed.`,
                    'Emergency Delete',
                    () => {
                        articles = articles.filter(a => a.id !== id);
                        saveArticles(articles);
                        renderDashboard();
                        showToast(`Article permanently deleted.`, 'danger');
                    }
                );
            }
        });
    }

    // -------------------------------------------------------------------------
    // Edit Modal Logic & Form Handling
    // -------------------------------------------------------------------------
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
        if (editArticleForm) editArticleForm.reset();
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
            const targetIndex = articles.findIndex(a => a.id === id);

            if (targetIndex !== -1) {
                const updated = {
                    ...articles[targetIndex],
                    title: editTitleInput.value.trim(),
                    author: editAuthorInput.value.trim(),
                    category: editCategorySelect.value,
                    readTime: editReadtimeInput.value.trim() || '2 min read',
                    excerpt: editExcerptInput.value.trim()
                };

                articles[targetIndex] = updated;
                saveArticles(articles);
                renderDashboard();
                closeEditModal();
                showToast(`Article "${updated.title}" updated successfully!`, 'success');
            }
        });
    }

    // -------------------------------------------------------------------------
    // Event Delegation: Click on Article to View Full Story
    // -------------------------------------------------------------------------
    document.addEventListener('click', (e) => {
        // 1. Direct [data-action="view"] button or link
        const viewTrigger = e.target.closest('[data-action="view"]');
        if (viewTrigger) {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(viewTrigger.dataset.id, 10);
            if (!isNaN(id)) {
                openArticleViewer(id);
                return;
            }
        }

        // 2. Click anywhere inside a ranked item in Most Viewed Articles
        const rankedItem = e.target.closest('.ranked-item');
        if (rankedItem) {
            const id = parseInt(rankedItem.dataset.articleId, 10);
            if (!isNaN(id)) {
                openArticleViewer(id);
            }
        }
    });

    // Global Escape Key to close any active modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeViewerModal();
            closeEditModal();
            closeActionModal();
        }
    });

    // =========================================================================
    // 10. NAVIGATION ACTIVE STATE HANDLER (Desktop & Mobile)
    // =========================================================================
    const navItems = document.querySelectorAll('.sidebar-nav-item, .mobile-nav-link');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // On mobile screens, auto-close accordion dropdown upon selection
                if (mobileNavDropdown && mobileNavDropdown.classList.contains('open')) {
                    mobileNavDropdown.classList.remove('open');
                    if (mobileHamburgerBtn) mobileHamburgerBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

});
