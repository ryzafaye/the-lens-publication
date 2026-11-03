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
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this article.</p>';
        }

        // Thoroughly decode corrupted entities
        let decoded = decodeCorruptedHtmlEntities(rawContent);

        // Aggressively strip any literal or encoded span tags and style attributes
        decoded = decoded
            .replace(/&lt;\/?span[^&>]*&gt;/gi, '')
            .replace(/<\/?span[^>]*>/gi, '')
            .replace(/\s*style="[^"]*"/gi, '')
            .replace(/\s*style='[^']*'/gi, '')
            .replace(/&lt;[^&>]+&gt;/gi, '');

        // Clean out any raw HTML tags (div, br, p) and normalize to plain text paragraphs
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
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this article.</p>';
        }

        return paragraphs.map(p => `<p class="viewer-paragraph">${escapeHTML(p)}</p>`).join('');
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
        const pendingRevisionCount = myArticles.filter(a => 
            a.status === 'For Revision' || a.status === 'Pending Revision' || a.status === 'Revision'
        ).length;
        const draftsCount = myArticles.filter(a => a.status === 'Draft').length;

        if (statViewsEl) statViewsEl.textContent = formatNumber(totalViews);
        if (statPublishedEl) statPublishedEl.textContent = String(publishedCount);
        if (statPendingEl) statPendingEl.textContent = String(pendingRevisionCount);
        if (statDraftsEl) statDraftsEl.textContent = String(draftsCount);

        // Render Top Performing Articles by active writer account
        const topPerformingContainer = document.getElementById('writer-top-performing-list');
        if (topPerformingContainer) {
            const topArticles = myArticles
                .filter(a => a.status === 'Published')
                .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
                .slice(0, 5);

            if (topArticles.length === 0) {
                topPerformingContainer.innerHTML = `
                    <div class="writer-empty-state-card" style="padding: 28px 16px; text-align: center; color: var(--text-muted, #667085); font-size: 0.88rem;">
                        <i class="fa-solid fa-chart-line" style="font-size: 1.6rem; color: #d0d5dd; margin-bottom: 10px; display: block;"></i>
                        <p style="margin: 0; font-weight: 600; color: #344054;">No published articles yet</p>
                        <p style="margin: 4px 0 0; font-size: 0.78rem; color: #98a2b3;">Your top performing stories sorted by view count will appear here.</p>
                    </div>
                `;
            } else {
                topPerformingContainer.innerHTML = topArticles.map((art, idx) => `
                    <div class="ranked-item" data-article-id="${art.id}" role="button" tabindex="0" title="View article: ${escapeHTML(art.title)}">
                        <span class="rank-number ${idx === 0 ? 'top-rank' : ''}">${idx + 1}</span>
                        <div class="ranked-content">
                            <div class="ranked-category-tag">${escapeHTML(art.category || 'General')}</div>
                            <button type="button" class="ranked-title-btn" data-action="view" data-id="${art.id}">
                                ${escapeHTML(art.title)}
                            </button>
                            <div class="ranked-meta-row">
                                <span class="ranked-author"><i class="fa-solid fa-pen-nib" aria-hidden="true" style="font-size: 0.70rem; margin-right: 4px; color: var(--text-muted, #667085);"></i>${escapeHTML(art.author || storedName)}</span>
                                <span class="ranked-stats">
                                    <span class="stat-metric" title="Views"><i class="fa-regular fa-eye"></i> ${formatNumber(art.views || 0)} views</span>
                                    <span class="stat-sep">â€¢</span>
                                    <span class="stat-metric" title="Shares"><i class="fa-solid fa-share-nodes"></i> ${formatNumber(art.shares || Math.round((art.views || 0) * 0.08))} shares</span>
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('');

                topPerformingContainer.querySelectorAll('.ranked-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const id = item.getAttribute('data-article-id');
                        if (id) openArticleViewer(id);
                    });
                    item.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            const id = item.getAttribute('data-article-id');
                            if (id) openArticleViewer(id);
                        }
                    });
                });
            }
        }

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

        // Render Top 7 Horizontal Cards (Status badge on upper right)
        articlesListEl.innerHTML = top7Articles.map(item => {
            const badgeClass = getStatusBadgeClass(item.status);

            return `
                <article class="writer-article-card" data-id="${item.id}" tabindex="0" role="button" aria-label="View article: ${escapeHTML(item.title)}">
                    <div class="article-card-header">
                        <div class="article-card-meta">
                            <span class="article-card-category">${escapeHTML(item.category || 'General')}</span>
                            <span class="meta-dot">&bull;</span>
                            <span class="article-card-date"><i class="fa-regular fa-calendar"></i> ${escapeHTML(item.date)}</span>
                            ${item.status === 'Published' && item.views !== undefined ? `
                                <span class="meta-dot">&bull;</span>
                                <span class="article-card-date"><i class="fa-regular fa-eye"></i> ${formatNumber(item.views)} views</span>
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
                    ${(item.status !== 'Published' && item.status !== 'Pending Review') ? `
                        <div class="article-card-footer">
                            <a href="writer-submit-article.html?draftId=${encodeURIComponent(item.id)}" class="btn-box-edit" onclick="event.stopPropagation()" title="Edit manuscript" aria-label="Edit article ${escapeHTML(item.title)}">
                                <i class="fa-solid fa-pen-to-square"></i>
                                <span>Edit</span>
                            </a>
                        </div>
                    ` : ''}
                </article>
            `;
        }).join('');
    }

    // =========================================================================
    // 4. ARTICLE VIEWER MODAL LOGIC (EXECUTIVE PARITY DESIGN)
    // =========================================================================
    function openArticleViewer(articleId) {
        if (!viewerModal) return;

        let myArticles = (typeof getMyArticles === 'function') 
            ? getMyArticles(activeWriterId)
            : [];
        let article = myArticles.find(a => a.id === articleId);
        if (!article) {
            try {
                const stored = JSON.parse(localStorage.getItem('articles') || '[]');
                article = stored.find(a => a.id === articleId);
            } catch (err) {}
        }
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
        const viewerExcerpt = document.getElementById('viewer-excerpt');
        if (viewerExcerpt) {
            const rawExcerpt = article.excerpt || '';
            if (rawExcerpt && rawExcerpt.trim()) {
                viewerExcerpt.textContent = rawExcerpt.trim();
                viewerExcerpt.style.display = 'block';
            } else {
                viewerExcerpt.style.display = 'none';
            }
        }

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
