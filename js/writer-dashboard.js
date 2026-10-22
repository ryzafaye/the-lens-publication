/**
 * ============================================================================
 * THE LENS — WRITER DASHBOARD JAVASCRIPT LOGIC
 * Dynamic Analytics & Clickable Top 7 Recent Articles for the Logged-In Writer
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
    const firstName = storedName.split(' ')[0] || 'Writer';

    // DOM Elements - Header & Analytics
    const writerNameEl = document.getElementById('writer-name');
    const statViewsEl = document.getElementById('stat-total-views');
    const statPublishedEl = document.getElementById('stat-published-count');
    const statPendingEl = document.getElementById('stat-pending-count');
    const statDraftsEl = document.getElementById('stat-drafts-count');
    const articlesListEl = document.getElementById('writer-articles-list');

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
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this article.</p>';
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
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this article.</p>';
        }

        return paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('');
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

    // =========================================================================
    // 3. DASHBOARD RENDERING
    // =========================================================================
    function renderDashboard() {
        // Set clean greeting
        if (writerNameEl) {
            writerNameEl.textContent = firstName;
        }

        // Fetch articles authored by this specific logged-in writer
        const myArticles = (typeof getMyArticles === 'function') 
            ? getMyArticles(activeWriterId)
            : [];

        // Sort by rawDate (newest first)
        myArticles.sort((a, b) => new Date(b.rawDate || b.date) - new Date(a.rawDate || a.date));

        // Calculate Analytics Metrics
        const totalViews = myArticles
            .filter(a => a.status === 'Published')
            .reduce((sum, a) => sum + (Number(a.views) || 0), 0);

        const publishedCount = myArticles.filter(a => a.status === 'Published').length;
        const pendingCount = myArticles.filter(a => a.status === 'Pending Review').length;
        const draftsCount = myArticles.filter(a => a.status === 'Draft').length;

        if (statViewsEl) statViewsEl.textContent = formatNumber(totalViews);
        if (statPublishedEl) statPublishedEl.textContent = String(publishedCount);
        if (statPendingEl) statPendingEl.textContent = String(pendingCount);
        if (statDraftsEl) statDraftsEl.textContent = String(draftsCount);

        // Limit to Top 7 Recent Articles for Dashboard view
        const top7Articles = myArticles.slice(0, 7);

        if (!articlesListEl) return;

        if (top7Articles.length === 0) {
            articlesListEl.innerHTML = `
                <div class="writer-empty-state">
                    <i class="fa-regular fa-folder-open"></i>
                    <p class="empty-title">No Articles Yet</p>
                    <p class="empty-subtitle">You have not submitted or drafted any articles yet. Click "New Article" above to begin.</p>
                </div>
            `;
            return;
        }

        // Render Top 7 Horizontal Cards (Click entire card to view, no redundant View button)
        articlesListEl.innerHTML = top7Articles.map(item => {
            const badgeClass = getStatusBadgeClass(item.status);

            return `
                <article class="writer-article-card" data-id="${item.id}" tabindex="0" role="button" aria-label="View article: ${escapeHTML(item.title)}">
                    <div class="article-card-main">
                        <div class="article-card-meta">
                            <span class="article-card-category">${escapeHTML(item.category || 'General')}</span>
                            <span class="meta-dot">&bull;</span>
                            <span class="article-card-date"><i class="fa-regular fa-calendar"></i> ${escapeHTML(item.date)}</span>
                            ${item.status === 'Published' && item.views !== undefined ? `
                                <span class="meta-dot">&bull;</span>
                                <span class="article-card-date"><i class="fa-regular fa-eye"></i> ${formatNumber(item.views)} views</span>
                            ` : ''}
                        </div>
                        <h3 class="article-card-title">${escapeHTML(item.title)}</h3>
                    </div>
                    <div class="article-card-actions">
                        <span class="status-badge ${badgeClass}">${escapeHTML(item.status)}</span>
                        ${(item.status !== 'Published' && item.status !== 'Pending Review') ? `
                            <a href="writer-submit-article.html?draftId=${encodeURIComponent(item.id)}" class="btn-box-edit" onclick="event.stopPropagation()" title="Edit manuscript" aria-label="Edit article ${escapeHTML(item.title)}">
                                <i class="fa-solid fa-pen-to-square"></i>
                                <span>Edit</span>
                            </a>
                        ` : ''}
                    </div>
                </article>
            `;
        }).join('');
    }

    // =========================================================================
    // 4. ARTICLE VIEWER MODAL LOGIC (EXECUTIVE PARITY DESIGN)
    // =========================================================================
    function openArticleViewer(articleId) {
        if (!viewerModal) return;

        const myArticles = (typeof getMyArticles === 'function') 
            ? getMyArticles(activeWriterId)
            : [];
        const article = myArticles.find(a => a.id === articleId);
        if (!article) return;

        // Populate metadata
        if (viewerTitle) viewerTitle.textContent = article.title;
        if (viewerCategory) viewerCategory.textContent = article.category || 'General';
        if (viewerDate) viewerDate.textContent = article.date;
        
        // Author Attribution: Name and Profile Pic Only (no role badge)
        if (viewerAuthor) viewerAuthor.textContent = article.author || storedName;

        // Reading time
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

        // Banner Image
        if (viewerBannerWrap && viewerBannerImg) {
            if (article.image) {
                viewerBannerImg.src = article.image;
                viewerBannerImg.alt = article.title;
                viewerBannerWrap.style.display = 'block';
            } else {
                viewerBannerWrap.style.display = 'none';
            }
        }

        if (viewerContent) {
            viewerContent.innerHTML = formatCleanArticleContent(article.content || article.excerpt);
        }

        // Remarks box: Section Head Feedback (shown if remarks exist)
        if (viewerRemarksWrap && viewerRemarksText) {
            if (article.remarks && article.remarks.trim()) {
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
        if (!viewerModal) return;
        viewerModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Modal close triggers
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

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && viewerModal && !viewerModal.classList.contains('hidden')) {
            closeArticleViewer();
        }
    });

    // Delegate Click & Keyboard Event on Recent Articles List
    if (articlesListEl) {
        // Click on entire card opens viewer (unless clicking the edit button)
        articlesListEl.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.btn-box-edit');
            if (editBtn) return; // Allow link navigation to edit page

            const card = e.target.closest('.writer-article-card');
            if (card && card.dataset.id) {
                openArticleViewer(card.dataset.id);
            }
        });

        // Enter or Space key on focused card opens viewer
        articlesListEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const card = e.target.closest('.writer-article-card');
                if (card && card.dataset.id) {
                    e.preventDefault();
                    openArticleViewer(card.dataset.id);
                }
            }
        });
    }

    // Initial Execution
    renderDashboard();
});
