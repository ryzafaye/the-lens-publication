/**
 * ============================================================================
 * THE LENS — MEDIA & PUBLIC COMMUNICATIONS (M&PC) PUBLISH ARTICLE CONTROLLER
 * Handles article cover assignment and releasing approved manuscripts to the public website
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    const STORAGE_KEY_ARTICLES = 'mpc_publish_articles_v2';
    const STORAGE_KEY_COVERS = 'mpc_approved_covers_v1';

    // -------------------------------------------------------------------------
    // 1. DATASETS (Approved Manuscripts & Approved Visual Covers)
    // -------------------------------------------------------------------------
    const defaultCovers = [
        {
            id: 'cov-01',
            type: 'pubmat',
            artist: 'Kirsten Diaz',
            approvedBy: 'Julian Del Rosario (Media Head)',
            image: 'images/covers/sc-audit-pubmat.svg',
            date: 'Oct 21, 2026'
        },
        {
            id: 'cov-02',
            type: 'pubmat',
            artist: 'Marco Valenzuela',
            approvedBy: 'Julian Del Rosario (Media Head)',
            image: 'images/covers/portal-pubmat.svg',
            date: 'Oct 20, 2026'
        },
        {
            id: 'cov-03',
            type: 'pubmat',
            artist: 'Hannah Cruz',
            approvedBy: 'Julian Del Rosario (Media Head)',
            image: 'images/covers/sanitation-pubmat.svg',
            date: 'Oct 19, 2026'
        },
        {
            id: 'cov-04',
            type: 'cartoon',
            artist: 'Danilo Reyes',
            approvedBy: 'Raphael Luna (Cartoonist Head)',
            image: 'images/covers/press-freedom-cartoon.svg',
            date: 'Oct 21, 2026'
        },
        {
            id: 'cov-05',
            type: 'cartoon',
            artist: 'Bea Soriano',
            approvedBy: 'Raphael Luna (Cartoonist Head)',
            image: 'images/covers/faculty-overload-cartoon.svg',
            date: 'Oct 18, 2026'
        },
        {
            id: 'cov-06',
            type: 'cartoon',
            artist: 'Carlo Santos',
            approvedBy: 'Raphael Luna (Cartoonist Head)',
            image: 'images/covers/midnight-study-cartoon.svg',
            date: 'Oct 17, 2026'
        }
    ];

    const defaultArticles = [
        {
            id: 'art-01',
            title: "Student council financial audit reveals ₱320,000 unallocated surplus",
            category: "News",
            categorySlug: "news",
            author: "Sofia M. Alcaraz",
            sectionHead: "Danilo C. Ramos (News Head)",
            eicApprover: "Victoria Reyes (Editor-in-Chief)",
            readTime: "4 min read",
            dateApproved: "Oct 22, 2026",
            rawDate: "2026-10-22",
            status: "ready", // 'ready' | 'published'
            assignedCoverId: 'cov-01',
            body: `<p>A comprehensive fiscal audit of the Central Student Council (CSC) accounts for the academic year 2025–2026 disclosed an unallocated surplus amounting to ₱320,000, prompting student organizations to petition for emergency allocations toward campus student services.</p>
            <p>The findings, presented during a joint legislative assembly of college councils, detail underspending across flagship semester events and delayed disbursement of project grants approved in late 2025.</p>
            <p>University officials stated that the audited funds remain fully protected in the council depository account, with an ad-hoc allocation committee scheduled to convene next week to finalize reallocation priorities.</p>`
        },
        {
            id: 'art-02',
            title: "Why the enrollment portal keeps timing out: A technical post-mortem",
            category: "Science and Technology",
            categorySlug: "scitech",
            author: "Marco L. Valderrama",
            sectionHead: "Dr. Elena M. Romero (SciTech Head)",
            eicApprover: "Marcus Vance (Assoc. Editor-in-Chief)",
            readTime: "6 min read",
            dateApproved: "Oct 21, 2026",
            rawDate: "2026-10-21",
            status: "ready",
            assignedCoverId: 'cov-02',
            body: `<p>Students attempting to enlist during the peak registration rush encountered repeated HTTP 504 Gateway Timeout errors. A technical analysis performed with IT department logs indicates that database connection pool exhaustion triggered cascading latency across student profile endpoints.</p>
            <p>The core bottleneck centered around concurrency limits on the legacy academic record database server, which peaked at over 14,000 simultaneous queries during the 9:00 AM server surge.</p>
            <p>The university IT director confirmed plans to deploy Redis-based session caching and dynamic load balancing prior to midterm subject adjustments.</p>`
        },
        {
            id: 'art-03',
            title: "The cost of compromise: Why student publication independence cannot be negotiated",
            category: "Opinion",
            categorySlug: "opinion",
            author: "Sofia M. Alcaraz",
            sectionHead: "Danilo C. Ramos (News Head)",
            eicApprover: "Victoria Reyes (Editor-in-Chief)",
            readTime: "5 min read",
            dateApproved: "Oct 21, 2026",
            rawDate: "2026-10-21",
            status: "ready",
            assignedCoverId: 'cov-04',
            body: `<p>Student journalism does not exist to flatter institutional hierarchies or deliver sanitized press releases. The historic mandate of campus presses has always been to document campus reality with unflinching honesty and unwavering adherence to student welfare.</p>
            <p>When administrative directives attempt to condition operational funding upon pre-publication censorship, it strikes at the very heart of the Campus Journalism Act of 1991.</p>
            <p>Independence is not a courtesy extended by administrative benevolence; it is an earned right preserved through rigorous ethics, meticulous verification, and collective solidarity.</p>`
        },
        {
            id: 'art-04',
            title: "Inside the 24-hour night shift of university sanitation workers",
            category: "Features",
            categorySlug: "features",
            author: "Camille Joy Perez",
            sectionHead: "Bianca Rose Flores (Feature Head)",
            eicApprover: "Victoria Reyes (Editor-in-Chief)",
            readTime: "5 min read",
            dateApproved: "Oct 20, 2026",
            rawDate: "2026-10-20",
            status: "ready",
            assignedCoverId: null, // Unassigned
            body: `<p>Long after classrooms empty and quadrangle spotlights dim, a quiet rotation of university maintenance and sanitation personnel begins. From sweeping leaf-strewn walkways to disinfecting multi-story laboratories, their tireless labor sustains daily university life.</p>
            <p>Interviews with senior crew members reveal systemic challenges regarding hazard compensation, protective gear procurement, and rising cost-of-living constraints.</p>
            <p>Their collective voice calls not for performative appreciation, but for institutional dignity and fair labor compensation.</p>`
        },
        {
            id: 'art-05',
            title: "Echoes from the Quadrangle: Verses from the Midnight Study Hall",
            category: "Literature",
            categorySlug: "literature",
            author: "Carlos Joaquin Luna",
            sectionHead: "Carlos Joaquin Luna (Literature Head)",
            eicApprover: "Marcus Vance (Assoc. Editor-in-Chief)",
            readTime: "3 min read",
            dateApproved: "Oct 19, 2026",
            rawDate: "2026-10-19",
            status: "ready",
            assignedCoverId: null, // Unassigned
            body: `<p>Under the fluorescent hum of midnight study cubicles, ink scratches out the silent exhaustion and resilient hopes of students racing against examination dawn.</p>
            <p>Between pages of worn textbooks and cooling paper cups of instant coffee, a community of quiet determination takes shape in the library's overnight wing.</p>`
        },
        {
            id: 'art-06',
            title: "University administration greenlights hybrid lab facility upgrades",
            category: "News",
            categorySlug: "news",
            author: "Sofia M. Alcaraz",
            sectionHead: "Danilo C. Ramos (News Head)",
            eicApprover: "Victoria Reyes (Editor-in-Chief)",
            readTime: "4 min read",
            dateApproved: "Oct 18, 2026",
            rawDate: "2026-10-18",
            status: "published",
            publishedAt: "Oct 22, 2026",
            assignedCoverId: 'cov-01',
            body: `<p>The Board of Regents approved a ₱4.2 million modernization grant dedicated to expanding digital laboratory hardware and remote experimentation modules across engineering and science institutes.</p>`
        },
        {
            id: 'art-07',
            title: "Campus transport cooperative proposes revised shuttle terminal routes",
            category: "News",
            categorySlug: "news",
            author: "Danilo C. Ramos",
            sectionHead: "Danilo C. Ramos (News Head)",
            eicApprover: "Victoria Reyes (Editor-in-Chief)",
            dateApproved: "Oct 17, 2026",
            rawDate: "2026-10-17",
            status: "unpublished",
            assignedCoverId: 'cov-03',
            body: `<p>A draft proposal by the campus shuttle transport group outlines modified terminal drop points aimed at reducing peak passenger congestion along the North Wing gates.</p>`
        }
    ];

    // -------------------------------------------------------------------------
    // 2. STORAGE READ / WRITE
    // -------------------------------------------------------------------------
    function loadArticles() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_ARTICLES) || localStorage.getItem('mpc_publish_articles_v1');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    defaultArticles.forEach(def => {
                        if (!parsed.some(p => p.id === def.id)) {
                            parsed.push(def);
                        }
                    });
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Storage read failed', e);
        }
        return JSON.parse(JSON.stringify(defaultArticles));
    }

    function saveArticles(list) {
        try {
            localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(list));
        } catch (e) {
            console.warn('Storage write failed', e);
        }
    }

    function loadCovers() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_COVERS);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('Storage read failed', e);
        }
        return JSON.parse(JSON.stringify(defaultCovers));
    }

    let articlesList = loadArticles();
    let coversList = loadCovers();

    let activeView = 'ready'; // 'ready' | 'published' | 'covers'
    let activeCategory = 'all'; // 'all' | 'news' | 'opinion' | 'features' | 'scitech' | 'literature'
    let currentSort = 'newest';
    let targetAssignArticleId = null;
    let selectedCoverIdInModal = null;
    let activeCoverFilterInModal = 'all';

    // DOM References
    const statsReady = document.getElementById('stat-ready-count');
    const statsCovers = document.getElementById('stat-covers-count');
    const statsPublished = document.getElementById('stat-published-count');

    const badgeTabReady = document.getElementById('badge-tab-ready');
    const badgeTabPublished = document.getElementById('badge-tab-published');
    const badgeTabUnpublished = document.getElementById('badge-tab-unpublished');
    const badgeTabCovers = document.getElementById('badge-tab-covers');

    const articlesGrid = document.getElementById('mpc-articles-grid');
    const emptyState = document.getElementById('mpc-empty-state');
    const coversLibraryView = document.getElementById('mpc-covers-library-view');
    const coversLibraryGrid = document.getElementById('mpc-covers-library-grid');

    const coverModal = document.getElementById('assign-cover-modal');
    const closeCoverModalBtn = document.getElementById('close-cover-modal-btn');
    const cancelCoverModalBtn = document.getElementById('cancel-cover-modal-btn');
    const confirmCoverModalBtn = document.getElementById('confirm-cover-modal-btn');
    const modalTargetArticleTitle = document.getElementById('modal-target-article-title');
    const modalCoverGallery = document.getElementById('modal-cover-gallery');

    const readerModal = document.getElementById('manuscript-viewer-modal');
    const closeReaderBtn = document.getElementById('close-reader-btn');
    const readerCategory = document.getElementById('reader-category');
    const readerTitle = document.getElementById('reader-title');
    const readerAuthor = document.getElementById('reader-author');
    const readerDate = document.getElementById('reader-date');
    const readerBody = document.getElementById('reader-body');

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
    // 4. STATS & BADGES
    // -------------------------------------------------------------------------
    function updateStats() {
        const readyCount = articlesList.filter(a => a.status === 'ready').length;
        const publishedCount = articlesList.filter(a => a.status === 'published').length;
        const unpublishedCount = articlesList.filter(a => a.status === 'unpublished').length;
        const coversCount = coversList.length;

        if (statsReady) statsReady.textContent = readyCount;
        if (statsPublished) statsPublished.textContent = publishedCount;
        if (statsCovers) statsCovers.textContent = coversCount;

        if (badgeTabReady) badgeTabReady.textContent = readyCount;
        if (badgeTabPublished) badgeTabPublished.textContent = publishedCount;
        if (badgeTabUnpublished) badgeTabUnpublished.textContent = unpublishedCount;
        if (badgeTabCovers) badgeTabCovers.textContent = coversCount;
    }

    // -------------------------------------------------------------------------
    // 5. VIEW TABS & CATEGORY FILTERS
    // -------------------------------------------------------------------------
    const viewTabBtns = document.querySelectorAll('.mpc-view-tab-btn[data-view]');
    viewTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeView = btn.dataset.view;
            render();
        });
    });

    const categoryPills = document.querySelectorAll('.mpc-category-pill[data-category]');
    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeCategory = pill.dataset.category;
            render();
        });
    });

    let searchQuery = '';
    const searchInput = document.getElementById('mpc-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            render();
        });
    }

    const sortSelect = document.getElementById('mpc-sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            render();
        });
    }

    // -------------------------------------------------------------------------
    // 6. CARD RENDERING
    // -------------------------------------------------------------------------
    function render() {
        updateStats();

        // 1. If viewing the Covers Library
        if (activeView === 'covers') {
            if (articlesGrid) articlesGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'none';
            if (coversLibraryView) coversLibraryView.style.display = 'block';
            renderCoversLibrary();
            return;
        }

        // 2. Otherwise viewing Ready to Publish or Published Articles
        if (coversLibraryView) coversLibraryView.style.display = 'none';
        if (articlesGrid) articlesGrid.style.display = 'flex';

        let list = articlesList.filter(a => a.status === activeView);

        if (activeCategory !== 'all') {
            list = list.filter(a => a.categorySlug === activeCategory);
        }

        if (searchQuery) {
            list = list.filter(a => 
                (a.title && a.title.toLowerCase().includes(searchQuery)) ||
                (a.author && a.author.toLowerCase().includes(searchQuery)) ||
                (a.category && a.category.toLowerCase().includes(searchQuery))
            );
        }

        // Sort by date (newest first or oldest first)
        list.sort((a, b) => {
            const timeA = new Date(a.rawDate || a.dateApproved || a.date).getTime();
            const timeB = new Date(b.rawDate || b.dateApproved || b.date).getTime();
            if (currentSort === 'oldest') {
                return timeA - timeB;
            }
            return timeB - timeA;
        });

        if (list.length === 0) {
            if (articlesGrid) articlesGrid.innerHTML = '';
            if (emptyState) {
                emptyState.style.display = 'block';
                const emptyTitle = emptyState.querySelector('h3');
                const emptyDesc = emptyState.querySelector('p');
                if (emptyTitle) {
                    if (activeView === 'ready') {
                        emptyTitle.textContent = 'No Articles Awaiting Publication';
                    } else if (activeView === 'published') {
                        emptyTitle.textContent = 'No Published Articles Found';
                    } else if (activeView === 'unpublished') {
                        emptyTitle.textContent = 'No Unpublished Articles';
                    }
                }
                if (emptyDesc) {
                    if (activeView === 'ready') {
                        emptyDesc.textContent = 'All approved manuscripts have been published with their covers.';
                    } else if (activeView === 'published') {
                        emptyDesc.textContent = 'Published articles will appear here after release to the public website.';
                    } else if (activeView === 'unpublished') {
                        emptyDesc.textContent = 'Articles taken down from live publication for editing or cover changes will appear here.';
                    }
                }
            }
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        articlesGrid.innerHTML = list.map(item => {
            const assignedCover = coversList.find(c => c.id === item.assignedCoverId);

            return `
                <div class="mpc-publish-card" id="card-${item.id}" data-id="${item.id}">
                    <div class="mpc-card-main-content">
                        
                        <!-- Left Cover Slot -->
                        <div class="mpc-cover-slot">
                            <div class="mpc-cover-preview-box" data-action="assign-cover" data-id="${item.id}" title="Click to assign or change cover">
                                ${assignedCover ? `
                                    <img src="${escapeHTML(assignedCover.image)}" alt="Cover Preview" class="mpc-cover-preview-img">
                                    <span class="mpc-cover-meta-badge">${escapeHTML(assignedCover.type.toUpperCase())}</span>
                                ` : `
                                    <div class="mpc-cover-empty">
                                        <i class="fa-regular fa-image"></i>
                                        <span>No Cover Assigned</span>
                                    </div>
                                `}
                            </div>
                            ${assignedCover ? `
                                <div class="mpc-cover-artist-note">
                                    <i class="fa-solid fa-paintbrush"></i>
                                    <span>Cover by: <strong>${escapeHTML(assignedCover.artist)}</strong></span>
                                </div>
                            ` : `
                                <div class="mpc-cover-artist-note" style="color: #b54708;">
                                    <i class="fa-solid fa-triangle-exclamation"></i>
                                    <span>Requires cover to publish</span>
                                </div>
                            `}
                        </div>

                        <!-- Right Text & Endorsement Stack -->
                        <div class="mpc-article-details">
                            <div class="mpc-meta-top-row">
                                <span class="mpc-category-tag">${escapeHTML(item.category)}</span>
                                <span style="color: #98a2b3;">&bull;</span>
                                <span style="color: #667085; font-weight: 500;"><i class="fa-regular fa-calendar"></i> Approved: ${escapeHTML(item.dateApproved)}</span>
                            </div>

                            <h2 class="mpc-article-headline">${escapeHTML(item.title)}</h2>

                            <div class="mpc-byline-row">
                                <i class="fa-solid fa-pen-nib"></i>
                                <span>Author: <strong>${escapeHTML(item.author)}</strong></span>
                            </div>

                            <!-- Endorsement History -->
                            <div class="mpc-endorsements-bar">
                                <span class="mpc-endorsement-badge">
                                    <i class="fa-solid fa-circle-check"></i>
                                    <span>${escapeHTML(item.sectionHead)}</span>
                                </span>
                                <span class="mpc-endorsement-badge eic">
                                    <i class="fa-solid fa-stamp"></i>
                                    <span>${escapeHTML(item.eicApprover)}</span>
                                </span>
                            </div>
                        </div>

                    </div>

                    <!-- Card Action Footer -->
                    <div class="mpc-card-footer">
                        <div>
                            ${item.status === 'published' ? `
                                <span class="mpc-status-live-indicator live">
                                    <span>Live on Public Website (Published ${escapeHTML(item.publishedAt || item.dateApproved)})</span>
                                </span>
                            ` : item.status === 'unpublished' ? `
                                <span class="mpc-status-live-indicator unpublished">
                                    <i class="fa-solid fa-box-archive"></i>
                                    <span>Unpublished &bull; Staged for Re-release</span>
                                </span>
                            ` : `
                                <span class="mpc-status-live-indicator pending">
                                    <i class="fa-solid fa-hourglass-half"></i>
                                    <span>Pending Release by M&amp;PC</span>
                                </span>
                            `}
                        </div>

                        <div class="mpc-footer-actions">
                            ${item.status === 'published' ? `
                                <button type="button" class="btn-mpc-unpublish" data-action="unpublish" data-id="${item.id}">
                                    <i class="fa-solid fa-arrow-rotate-left"></i>
                                    <span>Unpublish</span>
                                </button>
                            ` : `
                                <button type="button" class="btn-mpc-assign" data-action="assign-cover" data-id="${item.id}">
                                    <i class="fa-solid fa-palette"></i>
                                    <span>${assignedCover ? 'Change Cover' : 'Assign Cover'}</span>
                                </button>

                                <button type="button" class="btn-mpc-read" data-action="read" data-id="${item.id}">
                                    <i class="fa-regular fa-file-lines"></i>
                                    <span>Read Article</span>
                                </button>

                                <button type="button" class="btn-mpc-publish" data-action="publish" data-id="${item.id}">
                                    <i class="fa-solid fa-globe"></i>
                                    <span>Publish to Website</span>
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // -------------------------------------------------------------------------
    // 7. COVERS LIBRARY VIEW RENDERING
    // -------------------------------------------------------------------------
    function renderCoversLibrary() {
        if (!coversLibraryGrid) return;

        coversLibraryGrid.innerHTML = coversList.map(cover => `
            <div class="mpc-gallery-item" style="cursor: default;">
                <div class="mpc-gallery-thumb-wrap">
                    <img src="${escapeHTML(cover.image)}" alt="Artwork Cover" class="mpc-gallery-thumb-img">
                    <span class="mpc-cover-meta-badge">${escapeHTML(cover.type.toUpperCase())}</span>
                </div>
                <div class="mpc-gallery-item-body">
                    <div class="mpc-gallery-artist">
                        <i class="fa-solid fa-paintbrush"></i>
                        <span>${escapeHTML(cover.artist)}</span>
                    </div>
                    <div class="mpc-gallery-head">
                        <i class="fa-solid fa-circle-check"></i>
                        <span>${escapeHTML(cover.approvedBy)}</span>
                    </div>
                    <div style="font-size: 0.70rem; color: #667085; margin-top: 2px;">
                        <i class="fa-regular fa-calendar"></i> Approved: ${escapeHTML(cover.date)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // -------------------------------------------------------------------------
    // 8. COVER SELECTION MODAL LOGIC
    // -------------------------------------------------------------------------
    function openCoverModal(articleId) {
        const article = articlesList.find(a => a.id === articleId);
        if (!article) return;

        targetAssignArticleId = articleId;
        selectedCoverIdInModal = article.assignedCoverId || null;

        if (modalTargetArticleTitle) {
            modalTargetArticleTitle.textContent = article.title;
        }

        renderModalGallery();

        if (coverModal) {
            coverModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeCoverModal() {
        if (coverModal) {
            coverModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
        targetAssignArticleId = null;
        selectedCoverIdInModal = null;
    }

    function renderModalGallery() {
        if (!modalCoverGallery) return;

        let filtered = coversList;
        if (activeCoverFilterInModal !== 'all') {
            filtered = filtered.filter(c => c.type === activeCoverFilterInModal);
        }

        modalCoverGallery.innerHTML = filtered.map(cover => {
            const isSelected = (cover.id === selectedCoverIdInModal);
            return `
                <div class="mpc-gallery-item ${isSelected ? 'selected' : ''}" data-cover-id="${cover.id}">
                    <div class="mpc-gallery-thumb-wrap">
                        <img src="${escapeHTML(cover.image)}" alt="Cover Asset" class="mpc-gallery-thumb-img">
                        <span class="mpc-cover-meta-badge">${escapeHTML(cover.type.toUpperCase())}</span>
                    </div>
                    <div class="mpc-gallery-item-body">
                        <div class="mpc-gallery-artist">
                            <i class="fa-solid fa-paintbrush"></i>
                            <span>${escapeHTML(cover.artist)}</span>
                        </div>
                        <div class="mpc-gallery-head">
                            <i class="fa-solid fa-circle-check"></i>
                            <span>${escapeHTML(cover.approvedBy)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Cover gallery item selection
    if (modalCoverGallery) {
        modalCoverGallery.addEventListener('click', (e) => {
            const item = e.target.closest('.mpc-gallery-item');
            if (!item) return;

            const coverId = item.dataset.coverId;
            selectedCoverIdInModal = coverId;

            modalCoverGallery.querySelectorAll('.mpc-gallery-item').forEach(el => {
                el.classList.toggle('selected', el.dataset.coverId === coverId);
            });
        });
    }

    // Modal type filter pills (All / PUBMAT / CARTOON)
    const modalPills = document.querySelectorAll('.mpc-modal-pill[data-cover-type]');
    modalPills.forEach(pill => {
        pill.addEventListener('click', () => {
            modalPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeCoverFilterInModal = pill.dataset.coverType;
            renderModalGallery();
        });
    });

    if (closeCoverModalBtn) closeCoverModalBtn.addEventListener('click', closeCoverModal);
    if (cancelCoverModalBtn) cancelCoverModalBtn.addEventListener('click', closeCoverModal);

    if (confirmCoverModalBtn) {
        confirmCoverModalBtn.addEventListener('click', () => {
            if (!targetAssignArticleId) return;

            const article = articlesList.find(a => a.id === targetAssignArticleId);
            if (!article) return;

            article.assignedCoverId = selectedCoverIdInModal;
            saveArticles(articlesList);

            const chosenCover = coversList.find(c => c.id === selectedCoverIdInModal);
            closeCoverModal();
            render();

            if (chosenCover) {
                // Log activity (Executive sentence parity)
                try {
                    const rawLogs = localStorage.getItem('mpcActivityLogs_v1');
                    let logs = rawLogs ? JSON.parse(rawLogs) : [];
                    if (!Array.isArray(logs)) logs = [];
                    const now = new Date();
                    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    logs.unshift({
                        id: 'mpc-act-' + Date.now(),
                        causer: localStorage.getItem('mpcName') || 'Julian Del Rosario',
                        causerRole: localStorage.getItem('mpcRole') || 'M&PC Head',
                        causerAvatar: 'images/member-placeholder.svg',
                        action: 'assigned',
                        subjectType: `Cover ${chosenCover.type.toUpperCase()} to Article`,
                        subjectName: article.title,
                        timestampText: 'Just now',
                        isoDate: now.toISOString(),
                        dateKey: now.toISOString().split('T')[0],
                        formattedDate: `${dateStr} • ${timeStr}`,
                        dayGroup: 'Today'
                    });
                    localStorage.setItem('mpcActivityLogs_v1', JSON.stringify(logs.slice(0, 40)));
                } catch (e) {}

                showToast(`Attached ${chosenCover.type.toUpperCase()} by ${chosenCover.artist} to "${article.title.substring(0, 36)}...".`, 'success');
            } else {
                showToast(`Cover removed from "${article.title.substring(0, 36)}...".`, 'warning');
            }
        });
    }

    // -------------------------------------------------------------------------
    // 9. PUBLISH & UNPUBLISH WORKFLOWS
    // -------------------------------------------------------------------------
    function publishArticle(articleId) {
        const article = articlesList.find(a => a.id === articleId);
        if (!article) return;

        // Validation: Must have a cover assigned before publishing
        if (!article.assignedCoverId) {
            showToast('Cannot publish: Please assign an approved cover photo or artwork first.', 'warning');
            openCoverModal(articleId);
            return;
        }

        const card = document.getElementById(`card-${articleId}`);
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(-10px) scale(0.98)';
        }

        setTimeout(() => {
            article.status = 'published';
            article.publishedAt = new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            // Log activity (Executive sentence parity)
            try {
                const rawLogs = localStorage.getItem('mpcActivityLogs_v1');
                let logs = rawLogs ? JSON.parse(rawLogs) : [];
                if (!Array.isArray(logs)) logs = [];
                const now = new Date();
                const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                logs.unshift({
                    id: 'mpc-act-' + Date.now(),
                    causer: localStorage.getItem('mpcName') || 'Julian Del Rosario',
                    causerRole: localStorage.getItem('mpcRole') || 'M&PC Head',
                    causerAvatar: 'images/member-placeholder.svg',
                    action: 'published',
                    subjectType: 'Article',
                    subjectName: article.title,
                    timestampText: 'Just now',
                    isoDate: now.toISOString(),
                    dateKey: now.toISOString().split('T')[0],
                    formattedDate: `${dateStr} • ${timeStr}`,
                    dayGroup: 'Today'
                });
                localStorage.setItem('mpcActivityLogs_v1', JSON.stringify(logs.slice(0, 40)));
            } catch (e) {}

            saveArticles(articlesList);
            render();
            showToast(`Article successfully published to the public website!`, 'success');
        }, 240);
    }

    function unpublishArticle(articleId) {
        const article = articlesList.find(a => a.id === articleId);
        if (!article) return;

        article.status = 'unpublished';
        article.unpublishedAt = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Log activity (Executive sentence parity)
        try {
            const rawLogs = localStorage.getItem('mpcActivityLogs_v1');
            let logs = rawLogs ? JSON.parse(rawLogs) : [];
            if (!Array.isArray(logs)) logs = [];
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            logs.unshift({
                id: 'mpc-act-' + Date.now(),
                causer: localStorage.getItem('mpcName') || 'Julian Del Rosario',
                causerRole: localStorage.getItem('mpcRole') || 'M&PC Head',
                causerAvatar: 'images/member-placeholder.svg',
                action: 'unpublished',
                subjectType: 'Article',
                subjectName: article.title,
                timestampText: 'Just now',
                isoDate: now.toISOString(),
                dateKey: now.toISOString().split('T')[0],
                formattedDate: `${dateStr} • ${timeStr}`,
                dayGroup: 'Today'
            });
            localStorage.setItem('mpcActivityLogs_v1', JSON.stringify(logs.slice(0, 40)));
        } catch (e) {}

        saveArticles(articlesList);
        render();
        showToast(`Article unpublished and moved to the Unpublished tab.`, 'warning');
    }

    // -------------------------------------------------------------------------
    // 10. MANUSCRIPT VIEWER MODAL
    // -------------------------------------------------------------------------
    function openManuscriptModal(articleId) {
        const article = articlesList.find(a => a.id === articleId);
        if (!article) return;

        if (readerCategory) readerCategory.textContent = article.category.toUpperCase();
        if (readerTitle) readerTitle.textContent = article.title;
        if (readerAuthor) readerAuthor.textContent = article.author;
        if (readerDate) readerDate.textContent = `Approved: ${article.dateApproved}`;
        if (readerBody) readerBody.innerHTML = article.body;

        if (readerModal) {
            readerModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeManuscriptModal() {
        if (readerModal) {
            readerModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    const closeReaderFooterBtn = document.getElementById('close-reader-footer-btn');
    if (closeReaderBtn) closeReaderBtn.addEventListener('click', closeManuscriptModal);
    if (closeReaderFooterBtn) closeReaderFooterBtn.addEventListener('click', closeManuscriptModal);

    // Escape listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (coverModal && !coverModal.classList.contains('hidden')) closeCoverModal();
            if (readerModal && !readerModal.classList.contains('hidden')) closeManuscriptModal();
        }
    });

    // -------------------------------------------------------------------------
    // 11. EVENT DELEGATION ON ARTICLES GRID
    // -------------------------------------------------------------------------
    if (articlesGrid) {
        articlesGrid.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const id = target.dataset.id;
            if (!id) return;

            if (action === 'assign-cover') {
                openCoverModal(id);
            } else if (action === 'read') {
                openManuscriptModal(id);
            } else if (action === 'publish') {
                publishArticle(id);
            } else if (action === 'unpublish') {
                unpublishArticle(id);
            }
        });
    }

    // Initial load
    render();
});

