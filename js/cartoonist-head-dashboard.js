/**
 * ============================================================================
 * THE LENS — CARTOONIST HEAD DASHBOARD SCRIPT
 * Manages Cartoonist Head metrics, pending cartoon queues, activity logs,
 * and leaderboard analytics matching Executive & Media Desk design parity.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Auth & Role check
    const userRole = localStorage.getItem('cartoonistHeadRole') || localStorage.getItem('userRole');
    if (!userRole) {
        window.location.href = 'login.html';
        return;
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
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this work.</p>';
        }

        let decoded = decodeCorruptedHtmlEntities(rawContent);

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
            .split(/\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        if (paragraphs.length === 0) {
            return '<p style="color: #98a2b3; font-style: italic;">No content available for this work.</p>';
        }

        return paragraphs.map(p => `<p class="viewer-paragraph">${escapeHTML(p)}</p>`).join('');
    }

    // Set dynamic current month badge in Most Viewed Cartoons
    const now = new Date();
    const currentMonthName = now.toLocaleString('en-US', { month: 'long' });
    const monthBadge = document.getElementById('most-viewed-month-badge');
    if (monthBadge) monthBadge.textContent = currentMonthName;

    // Read stored submissions from cartoonist queue
    let cartoonQueue = [];
    try {
        const stored = localStorage.getItem('cartoonistSubmissions_v1');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                cartoonQueue = parsed;
            }
        }
    } catch (e) {
        console.warn('Could not read cartoonistSubmissions_v1', e);
    }

    // -------------------------------------------------------------------------
    // 1. CARD ANALYTICS (4 CARDS WITH MAROON ICONS)
    //    Total Cartoons Published, Pending Team Artworks, Total Cartoon Views, Active Cartoonists
    // -------------------------------------------------------------------------
    const publishedArtworks = cartoonQueue.filter(c => (c.status || '').toLowerCase() === 'published');
    const pendingArtworks = cartoonQueue.filter(c => {
        const s = (c.status || '').toLowerCase();
        return s.includes('pending') || s === 'pending with head';
    });

    const totalPublishedCount = publishedArtworks.length;
    const totalPendingCount = pendingArtworks.length;

    // Calculate total cartoon views across all items
    const totalViewsCount = cartoonQueue.reduce((acc, c) => acc + (Number(c.views) || 0), 0);

    // Calculate active cartoonist count from artists in queue
    const activeCartoonistsSet = new Set(cartoonQueue.map(c => c.artist).filter(Boolean));
    const totalActiveCartoonists = activeCartoonistsSet.size;

    const metricsGrid = document.getElementById('metrics-grid');
    if (metricsGrid) {
        metricsGrid.innerHTML = `
            <!-- Card 1: Total Cartoons Published -->
            <div class="metric-card animate-fade-in delay-1">
                <div class="metric-header">
                    <span class="metric-label">Total Cartoons Published</span>
                    <div class="metric-icon-box" style="background: #fdf2f4; border: 1px solid #f9d8de; color: #5c0a18;">
                        <i class="fa-solid fa-palette" style="color: #5c0a18;"></i>
                    </div>
                </div>
                <div class="metric-value" id="stat-cartoons-published">${totalPublishedCount}</div>
                <div class="metric-subtitle">Live across digital &amp; print issues</div>
            </div>

            <!-- Card 2: Pending Team Artworks -->
            <div class="metric-card animate-fade-in delay-2">
                <div class="metric-header">
                    <span class="metric-label">Pending Team Artworks</span>
                    <div class="metric-icon-box" style="background: #fdf2f4; border: 1px solid #f9d8de; color: #5c0a18;">
                        <i class="fa-regular fa-clock" style="color: #5c0a18;"></i>
                    </div>
                </div>
                <div class="metric-value" id="stat-pending-artworks">${totalPendingCount}</div>
                <div class="metric-subtitle">Awaiting your editorial review</div>
            </div>

            <!-- Card 3: Total Cartoon Views -->
            <div class="metric-card animate-fade-in delay-3">
                <div class="metric-header">
                    <span class="metric-label">Total Cartoon Views</span>
                    <div class="metric-icon-box" style="background: #fdf2f4; border: 1px solid #f9d8de; color: #5c0a18;">
                        <i class="fa-regular fa-eye" style="color: #5c0a18;"></i>
                    </div>
                </div>
                <div class="metric-value" id="stat-total-views">${totalViewsCount.toLocaleString()}</div>
                <div class="metric-subtitle">Cumulative student readership</div>
            </div>

            <!-- Card 4: Active Cartoonist Count -->
            <div class="metric-card animate-fade-in delay-4">
                <div class="metric-header">
                    <span class="metric-label">Active Cartoonists</span>
                    <div class="metric-icon-box" style="background: #fdf2f4; border: 1px solid #f9d8de; color: #5c0a18;">
                        <i class="fa-solid fa-user-pen" style="color: #5c0a18;"></i>
                    </div>
                </div>
                <div class="metric-value" id="stat-active-cartoonists">${totalActiveCartoonists}</div>
                <div class="metric-subtitle">Staff artists contributing</div>
            </div>
        `;
    }

    // -------------------------------------------------------------------------
    // 2. PENDING APPROVAL (STATUS IN UPPER LEFT OF PIC, MEDIA DESK PICTURE & CARD DESIGN)
    // -------------------------------------------------------------------------
    const pendingGrid = document.getElementById('pending-cartoons-grid');
    const pendingEmptyState = document.getElementById('pending-empty-state');

    const topPendingArtworks = pendingArtworks.slice(0, 4);

    if (pendingGrid) {
        if (topPendingArtworks.length === 0) {
            pendingGrid.style.display = 'none';
            if (pendingEmptyState) pendingEmptyState.style.display = 'block';
        } else {
            pendingGrid.style.display = 'grid';
            if (pendingEmptyState) pendingEmptyState.style.display = 'none';

            pendingGrid.innerHTML = topPendingArtworks.map(art => `
                <article class="cover-card animate-fade-in" data-id="${art.id}">
                    <!-- Picture & Overlay: STATUS in upper-left of the picture -->
                    <div class="cover-thumb-container" onclick="window.inspectCartoon('${art.id}')" title="Inspect artwork">
                        <img 
                            src="${art.image || 'images/covers/press-freedom-cartoon.svg'}" 
                            alt="${escapeHTML(art.title)}" 
                            class="cover-thumb-img" 
                            onerror="this.src='images/covers/press-freedom-cartoon.svg';"
                        >
                        <div class="cover-thumb-overlay">
                            <i class="fa-solid fa-eye"></i>
                            <span>Inspect</span>
                        </div>
                        
                        <!-- UPPER-LEFT STATUS BADGE ON THE PICTURE -->
                        <div class="cover-thumb-badge-group">
                            <span class="cover-status-tag pending">
                                <i class="fa-regular fa-clock"></i> ${escapeHTML(art.status || 'Pending with Head')}
                            </span>
                        </div>

                        <!-- Bottom-right Date -->
                        <span class="cover-thumb-date"><i class="fa-regular fa-calendar"></i> ${escapeHTML(art.date || 'Recent')}</span>
                    </div>

                    <!-- Card Body -->
                    <div class="cover-card-body">
                        <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: var(--sidebar-maroon, #5c0a18); letter-spacing: 0.5px; line-height: 1.2;">
                            ${escapeHTML(art.category || 'Opinion')}
                        </div>
                        <h3 style="font-family: var(--font-heading, 'Playfair Display', serif); font-size: 0.95rem; font-weight: 700; color: #101828; margin: 4px 0 8px 0; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; cursor: pointer;" onclick="window.inspectCartoon('${art.id}')" title="${escapeHTML(art.title)}">
                            ${escapeHTML(art.title)}
                        </h3>

                        <!-- Provenance Box with Artist -->
                        <div class="cover-provenance-box">
                            <div class="cover-artist-row">
                                <i class="fa-solid fa-paintbrush" style="color: #5c0a18;"></i>
                                <span>Artist: <strong>${escapeHTML(art.artist || 'Staff Cartoonist')}</strong></span>
                            </div>
                        </div>
                    </div>

                    <!-- Card Footer Actions -->
                    <div class="cover-card-footer" style="padding: 10px 16px; background-color: #fafbfc; border-top: 1px solid #eaecf0; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                        <button type="button" class="btn-inspect-trigger" onclick="window.inspectCartoon('${art.id}')" style="background: none; border: none; padding: 0; color: #5c0a18; font-size: 0.78rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                            <i class="fa-solid fa-eye"></i> Inspect
                        </button>
                        <a href="cartoonist-head-media-desk.html" class="table-manage-btn" style="text-decoration: none; padding: 5px 12px; font-size: 0.76rem;">
                            Review in Desk &rarr;
                        </a>
                    </div>
                </article>
            `).join('');
        }
    }

    // -------------------------------------------------------------------------
    // 3. MOST VIEWED CARTOONS (EXACT EXECUTIVES' MOST VIEWED ARTICLES DESIGN)
    //    Clicking opens the Full Viewer Modal with identical executive formatting!
    // -------------------------------------------------------------------------
    const mostViewedContainer = document.getElementById('most-viewed-list');
    if (mostViewedContainer) {
        // Sort cartoons by views descending (Top 3)
        const sortedByViews = [...cartoonQueue]
            .filter(c => (c.status || '').toLowerCase() === 'published' || (Number(c.views) || 0) > 0)
            .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
            .slice(0, 3);

        if (sortedByViews.length === 0) {
            mostViewedContainer.innerHTML = `
                <div style="padding: 24px; text-align: center; color: var(--text-muted, #667085); font-size: 0.88rem;">
                    No published cartoons available yet.
                </div>
            `;
        } else {
            mostViewedContainer.innerHTML = sortedByViews.map((c, idx) => `
                <div class="ranked-item" data-id="${c.id}" onclick="window.openCartoonViewer('${c.id}')" style="cursor: pointer;" title="View cartoon">
                    <span class="rank-number ${idx === 0 ? 'top-rank' : ''}">${idx + 1}</span>
                    <div class="ranked-content">
                        <div class="ranked-category-tag">${escapeHTML(c.category || 'Opinion')}</div>
                        <button type="button" class="ranked-title-btn" onclick="event.stopPropagation(); window.openCartoonViewer('${c.id}')" title="${escapeHTML(c.title)}">
                            ${escapeHTML(c.title)}
                        </button>
                        <div class="ranked-meta-row">
                            <span class="ranked-author">
                                <i class="fa-solid fa-pen-nib" aria-hidden="true" style="font-size: 0.70rem; margin-right: 4px; color: var(--text-muted, #667085);"></i>${escapeHTML(c.artist || 'Cartoonist')}
                            </span>
                            <span class="ranked-stats">
                                <span class="stat-metric" title="Views">
                                    <i class="fa-regular fa-eye"></i> ${Number(c.views || 0).toLocaleString()}
                                </span>
                                <span class="stat-sep">•</span>
                                <span class="stat-metric" title="Shares">
                                    <i class="fa-solid fa-share-nodes"></i> ${Number(c.shares || 0).toLocaleString()}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // -------------------------------------------------------------------------
    // 4. ACTIVITY LOG (EXACT EXECUTIVES' ACTIVITY LOG DESIGN)
    //    Sentence Format: [Causer] [action] the [Subject Type] "[Subject Name]" [time]
    // -------------------------------------------------------------------------
    const activityContainer = document.getElementById('recent-activity-list');
    if (activityContainer) {
        let logsToDisplay = [];

        try {
            const storedLogs = localStorage.getItem('cartoonistHeadActivityLogs_v1');
            if (storedLogs) {
                const parsed = JSON.parse(storedLogs);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    logsToDisplay = parsed.slice(0, 5).map(item => ({
                        user: item.causer,
                        avatar: item.causerAvatar || 'images/member-placeholder.svg',
                        action: item.action,
                        subjectType: item.subjectType || 'Cartoon',
                        target: item.subjectName,
                        time: item.timestampText || item.formattedDate || 'Recent'
                    }));
                }
            }
        } catch (e) {
            console.warn('Could not parse activity logs', e);
        }

        if (logsToDisplay.length === 0) {
            activityContainer.innerHTML = `
                <div style="padding: 24px; text-align: center; color: var(--text-muted, #667085); font-size: 0.85rem;">
                    No recent cartoonist activities logged yet.
                </div>
            `;
        } else {
            activityContainer.innerHTML = logsToDisplay.map(item => `
                <div class="activity-item" onclick="window.location.href='cartoonist-head-activity-logs.html'" style="cursor: pointer;" title="Open Activity Log">
                    <div class="activity-avatar">
                        <img src="${item.avatar}" alt="${escapeHTML(item.user)}">
                    </div>
                    <div class="activity-details">
                        <p class="activity-text">
                            <strong>${escapeHTML(item.user)}</strong> ${escapeHTML(item.action)} the ${escapeHTML(item.subjectType || 'Cartoon')} <em>"${escapeHTML(item.target)}"</em> <span style="color:#667085; font-size:0.75rem; margin-left:3px;">${escapeHTML(item.time)}.</span>
                        </p>
                        <span class="activity-time">${escapeHTML(item.time)}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // -------------------------------------------------------------------------
    // 5. TOP PERFORMING CARTOONISTS (EXACT EXECUTIVES' LEADERBOARD TABLE DESIGN)
    // -------------------------------------------------------------------------
    const topCartoonistsTableBody = document.getElementById('top-cartoonists-table-body');
    if (topCartoonistsTableBody) {
        // Aggregate artwork count per artist
        const artistCounts = {};
        cartoonQueue.forEach(c => {
            if (c.artist) {
                const artistName = c.artist;
                artistCounts[artistName] = (artistCounts[artistName] || 0) + 1;
            }
        });

        const leaderboard = Object.entries(artistCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        if (leaderboard.length === 0) {
            topCartoonistsTableBody.innerHTML = `
                <tr>
                    <td colspan="2" style="text-align: center; padding: 24px; color: var(--text-muted, #667085); font-size: 0.85rem;">
                        No active cartoonists recorded yet.
                    </td>
                </tr>
            `;
        } else {
            topCartoonistsTableBody.innerHTML = leaderboard.map(j => `
                <tr>
                    <td class="col-author-name">${escapeHTML(j.name)}</td>
                    <td class="col-article-count">${j.count}</td>
                </tr>
            `).join('');
        }
    }

    // -------------------------------------------------------------------------
    // 6. THEATER ARTWORK INSPECTION MODAL
    // -------------------------------------------------------------------------
    const inspectModal = document.getElementById('cover-inspect-modal');
    const inspectImg = document.getElementById('inspect-img');
    const inspectTitle = document.getElementById('inspect-title');
    const inspectCategory = document.getElementById('inspect-category');
    const inspectArtist = document.getElementById('inspect-artist');
    const inspectDate = document.getElementById('inspect-date');
    const inspectSubmitter = document.getElementById('inspect-submitter');
    const inspectStatus = document.getElementById('inspect-status');
    const closeInspectBtn = document.getElementById('close-inspect-btn');
    const btnModalClose = document.getElementById('btn-modal-close');

    window.inspectCartoon = function(id) {
        const item = cartoonQueue.find(c => c.id === id);
        if (!item || !inspectModal) return;

        if (inspectImg) inspectImg.src = item.image || 'images/covers/press-freedom-cartoon.svg';
        if (inspectTitle) inspectTitle.textContent = item.title;
        if (inspectCategory) inspectCategory.textContent = item.category || 'Opinion';
        if (inspectArtist) inspectArtist.textContent = item.artist || 'Cartoonist';
        if (inspectDate) inspectDate.textContent = item.date || 'Recent';
        if (inspectSubmitter) inspectSubmitter.textContent = item.artist || 'Cartoonist';
        if (inspectStatus) inspectStatus.textContent = item.status || 'Pending with Head';

        inspectModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    function closeInspectModal() {
        if (!inspectModal) return;
        inspectModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    if (closeInspectBtn) closeInspectBtn.addEventListener('click', closeInspectModal);
    if (btnModalClose) btnModalClose.addEventListener('click', closeInspectModal);

    if (inspectModal) {
        inspectModal.addEventListener('click', (e) => {
            if (e.target === inspectModal) closeInspectModal();
        });
    }

    // -------------------------------------------------------------------------
    // 7. ARTICLE/CARTOON VIEWER MODAL (EXACT EXECUTIVES' ARTICLE VIEWER PARITY)
    // -------------------------------------------------------------------------
    const viewerModal = document.getElementById('article-viewer-modal');
    const viewerTitle = document.getElementById('viewer-title');
    const viewerCategory = document.getElementById('viewer-category');
    const viewerDate = document.getElementById('viewer-date');
    const viewerAuthor = document.getElementById('viewer-author');
    const viewerBannerImg = document.getElementById('viewer-banner-img');
    const viewerContent = document.getElementById('viewer-content');
    const viewerViews = document.getElementById('viewer-views');
    const viewerShares = document.getElementById('viewer-shares');
    const closeViewerBtn = document.getElementById('close-viewer-btn');
    const viewerCloseBtnFooter = document.getElementById('viewer-close-btn-footer');

    window.openCartoonViewer = function(id) {
        const item = cartoonQueue.find(c => c.id === id);
        if (!item || !viewerModal) return;

        if (viewerTitle) viewerTitle.textContent = item.title;
        if (viewerCategory) viewerCategory.textContent = item.category || 'Opinion';
        if (viewerDate) viewerDate.textContent = item.date || 'Recent';
        if (viewerAuthor) viewerAuthor.textContent = item.artist || 'Cartoonist';
        if (viewerViews) viewerViews.textContent = item.views !== undefined ? Number(item.views).toLocaleString() : '0';
        if (viewerShares) viewerShares.textContent = item.shares !== undefined ? Number(item.shares).toLocaleString() : '0';

        const viewerExcerpt = document.getElementById('viewer-excerpt');
        if (viewerExcerpt) {
            const rawExcerpt = item.excerpt || item.description || '';
            if (rawExcerpt && rawExcerpt.trim()) {
                viewerExcerpt.textContent = rawExcerpt.trim();
                viewerExcerpt.style.display = 'block';
            } else {
                viewerExcerpt.style.display = 'none';
            }
        }

        if (viewerBannerImg) {
            viewerBannerImg.src = item.image || 'images/covers/press-freedom-cartoon.svg';
            viewerBannerImg.alt = item.title;
        }

        if (viewerContent) {
            const rawContent = item.content || item.description || 
                `An editorial cartoon published under ${item.category || 'Opinion'} desk, illustrating contemporary campus and societal discourse through visual satire and symbolism.\n\nCrafted with hand-drawn pen-and-ink detailing and digital color grading, this piece is one of the highest-circulated works produced by The Lens editorial art team this term.`;
            viewerContent.innerHTML = formatCleanArticleContent(rawContent);
        }

        viewerModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    function closeViewerModal() {
        if (!viewerModal) return;
        viewerModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    if (closeViewerBtn) closeViewerBtn.addEventListener('click', closeViewerModal);
    if (viewerCloseBtnFooter) viewerCloseBtnFooter.addEventListener('click', closeViewerModal);

    if (viewerModal) {
        viewerModal.addEventListener('click', (e) => {
            if (e.target === viewerModal) closeViewerModal();
        });
    }

    // Global escape key to close active modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeViewerModal();
            closeInspectModal();
        }
    });

});
