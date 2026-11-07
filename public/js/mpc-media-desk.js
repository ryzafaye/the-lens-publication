/**
 * ============================================================================
 * THE LENS — MEDIA DESK (MEDIA & PUBLIC COMMUNICATIONS / M&PC PORTAL)
 * Handles review and endorsement of PUBMAT and CARTOON publication assets
 * Features:
 * - PUBMAT & CARTOON tabs with dynamic live badge counts
 * - Artwork cards: no titles, no inspect button, no cut approval button
 * - Artwork inspection modal: full-size theater preview with polished action buttons
 * - Return to Head with clean revision notice and mandatory remarks validation
 * - Approve for Library workflow with smooth toast notification
 * - Artist Name only (no role in parentheses)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    function cleanArtistName(name) {
        if (!name) return '';
        return name.replace(/\s*\([^)]*\)/g, '').trim();
    }

    // One-time purge of all pics submitted by media team per user request
    try {
        const PURGE_MEDIA_PICS_FLAG = 'theLens_purge_all_media_pics_v20261107_final';
        if (localStorage.getItem(PURGE_MEDIA_PICS_FLAG) !== 'true') {
            localStorage.removeItem('mediaTeamSubmissions_v2');
            localStorage.removeItem('mediaTeamSubmissions_v1');
            const rawQueue = localStorage.getItem('articleCoverReviewQueue_v1');
            if (rawQueue) {
                try {
                    let queue = JSON.parse(rawQueue);
                    if (Array.isArray(queue)) {
                        queue = queue.filter(item => {
                            if (!item) return false;
                            const t = (item.type || '').toLowerCase();
                            const cat = (item.category || '').toLowerCase();
                            const role = (item.uploaderRole || '').toLowerCase();
                            return t !== 'photo' && cat !== 'photo' && !role.includes('media') && !role.includes('photojournalist');
                        });
                        localStorage.setItem('articleCoverReviewQueue_v1', JSON.stringify(queue));
                    }
                } catch (err) {}
            }
            localStorage.setItem(PURGE_MEDIA_PICS_FLAG, 'true');
        }
    } catch (e) {}

    // Purge any unendorsed cartoon submissions from M&PC review queue
    try {
        const rawQueue = localStorage.getItem('articleCoverReviewQueue_v1');
        if (rawQueue) {
            let queue = JSON.parse(rawQueue);
            if (Array.isArray(queue)) {
                const filtered = queue.filter(item => {
                    if (!item) return false;
                    const t = (item.type || '').toLowerCase();
                    const s = (item.status || '').toLowerCase();
                    return !(t === 'cartoon' && (s === 'submitted_to_mpc' || s === 'pending with head'));
                });
                if (filtered.length !== queue.length) {
                    localStorage.setItem('articleCoverReviewQueue_v1', JSON.stringify(filtered));
                }
            }
        }
    } catch (e) {}

    // =========================================================================
    // 1. DEFAULT DATASET (Publication Materials & Cartoons)
    // =========================================================================
    const defaultCoverQueue = [];

    // =========================================================================
    // 2. PERSISTENCE (LocalStorage sync across Exec, EIC, & M&PC)
    // =========================================================================
    const STORAGE_KEY = 'articleCoverReviewQueue_v1';

    function getCoverQueue() {
        let list = [];
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) list = parsed;
            }
        } catch (e) {
            console.warn('Could not read cover review queue from localStorage', e);
        }

        const initialList = (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA) && window.INITIAL_DATA.length > 0)
            ? window.INITIAL_DATA
            : ((window.INITIAL_COVERS && Array.isArray(window.INITIAL_COVERS) && window.INITIAL_COVERS.length > 0)
                ? window.INITIAL_COVERS
                : ((window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.covers) && window.INITIAL_DATA.covers.length > 0)
                    ? window.INITIAL_DATA.covers
                    : []));

        initialList.forEach(item => {
            if (!list.some(existing => String(existing.id) === String(item.id))) {
                list.push(item);
            }
        });

        // Also sync genuine submissions from Media Team submissions
        try {
            const rawSubs = localStorage.getItem('mediaTeamSubmissions_v2');
            if (rawSubs) {
                const subs = JSON.parse(rawSubs);
                if (Array.isArray(subs)) {
                    subs.forEach(sub => {
                        const existing = list.find(item => String(item.id) === String(sub.id));
                        if (existing) {
                            if (sub.status && !existing.status) existing.status = sub.status;
                            if (sub.remarks && !existing.remarks) existing.remarks = sub.remarks;
                        } else if (sub && sub.image) {
                            list.push(sub);
                        }
                    });
                }
            }
        } catch (e) {}

        // Filter out any mock/hardcoded items
        list = list.filter(item => {
            if (!item || !item.image) return false;
            const img = String(item.image).trim();
            if (img.includes('maroon.jpg') || img.includes('portal-pubmat') || img.includes('election-guidelines') || img.includes('faculty-overload') || img.includes('press-freedom')) {
                return false;
            }
            if (String(item.id).includes('mock') || String(item.id).includes('sample') || String(item.id).includes('seed') || String(item.id).includes('default')) {
                return false;
            }
            return img.startsWith('data:image/') || img.startsWith('/storage/') || img.startsWith('http') || img.startsWith('/uploads/') || img.startsWith('uploads/');
        });

        // Exclude all cartoons: cartoons submitted by cartoonists belong exclusively to the Cartoonist Head desk
        list = list.filter(item => {
            const t = (item.type || '').toLowerCase();
            const cat = (item.category || '').toLowerCase();
            const role = (item.uploaderRole || '').toLowerCase();
            return !(t === 'cartoon' || t === 'cartoons' || cat === 'cartoon' || cat === 'cartoons' || role.includes('cartoon'));
        });

        // Strict deduplication by ID
        const seenIds = new Set();
        list = list.filter(item => {
            if (!item || !item.id) return false;
            const strId = String(item.id);
            if (seenIds.has(strId)) return false;
            seenIds.add(strId);
            return true;
        });

        return list;
    }

    function saveCoverQueue(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            console.warn('Could not save cover review queue to localStorage', e);
        }
    }

    let coverList = getCoverQueue();

    // =========================================================================
    // 3. UI STATE & TOAST SYSTEM
    // =========================================================================
    let currentTab = 'photo';
    let currentSort = 'newest';
    let activeInspectionId = null;
    let activeReturnId = null;

    const cardsGrid = document.getElementById('cover-cards-grid');
    const emptyState = document.getElementById('cover-empty-state');
    const badgePhoto = document.getElementById('badge-cover-photo');
    const badgeCartoon = document.getElementById('badge-cover-cartoon');
    const sortSelect = document.getElementById('cover-sort-select');

    // Modals
    const inspectModal = document.getElementById('cover-inspect-modal');
    const closeInspectBtn = document.getElementById('close-inspect-btn');
    const inspectArtist = document.getElementById('inspect-artist');
    const inspectHead = document.getElementById('inspect-head');
    const inspectImage = document.getElementById('inspect-image');
    const inspectTypeTag = document.getElementById('inspect-type-tag');
    const inspectReturnBtn = document.getElementById('inspect-return-btn');
    const inspectApproveBtn = document.getElementById('inspect-approve-btn');

    // Return Modal
    const returnModal = document.getElementById('cover-return-modal') || document.getElementById('return-remarks-modal');
    const closeReturnModalBtn = document.getElementById('close-return-modal-btn');
    const cancelReturnBtn = document.getElementById('cancel-return-btn');
    const confirmReturnBtn = document.getElementById('confirm-return-btn');
    const returnHeadName = document.getElementById('return-head-name');
    const returnRemarksText = document.getElementById('return-remarks-input') || document.getElementById('return-remarks-text');
    const returnRemarksError = document.getElementById('return-remarks-error');

    const toastContainer = document.getElementById('toast-container');

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

    // =========================================================================
    // 4. TAB CONTROLS & BADGE COUNTS
    // =========================================================================
    function isItemPending(item) {
        if (!item) return false;
        const s = (item.status || '').toLowerCase().trim();
        return s === 'pending' || 
               s === 'pending with head' || 
               s === 'pending m&pc review' || 
               s === 'pending m&pc' || 
               s === 'pending review' || 
               s === 'submitted_to_mpc' || 
               s === 'under-review' ||
               (s.includes('pending') && !s.includes('eic'));
    }

    function getItemType(item) {
        if (!item) return 'pubmat';
        const t = (item.type || '').toLowerCase().trim();
        const cat = (item.category || '').toLowerCase().trim();
        const role = (item.uploaderRole || '').toLowerCase().trim();

        if (t === 'photo' || t === 'photos' || t === 'photojournalism' || cat === 'photo' || cat === 'photos' || role.includes('photo') || role.includes('media team')) {
            return 'photo';
        }
        if (t === 'cartoon' || t === 'cartoons' || cat === 'cartoon' || cat === 'cartoons' || role.includes('cartoon')) {
            return 'cartoon';
        }
        return 'pubmat';
    }

    function updateBadges() {
        const photoCount = coverList.filter(item => getItemType(item) === 'photo' && isItemPending(item)).length;
        const cartoonCount = coverList.filter(item => getItemType(item) === 'cartoon' && isItemPending(item)).length;

        if (badgePhoto) badgePhoto.textContent = photoCount;
        if (badgeCartoon) badgeCartoon.textContent = cartoonCount;
    }

    const tabButtons = document.querySelectorAll('.cover-tabs-container .review-tab-btn');

    // Auto-select tab if present in URL parameter (e.g. ?tab=cartoon)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam && ['photo', 'cartoon'].includes(tabParam)) {
            currentTab = tabParam;
            tabButtons.forEach(b => {
                const matches = b.getAttribute('data-tab') === currentTab;
                b.classList.toggle('active', matches);
                b.setAttribute('aria-selected', matches ? 'true' : 'false');
            });
        }
    } catch (e) {}

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            currentTab = btn.getAttribute('data-tab');
            renderCards();
        });
    });

    // =========================================================================
    // 5. SORTING & FILTERING
    // =========================================================================
    function getFilteredList() {
        let filtered = [];
        if (currentTab === 'cartoon') {
            filtered = coverList.filter(item => getItemType(item) === 'cartoon' && isItemPending(item));
        } else {
            filtered = coverList.filter(item => getItemType(item) === 'photo' && isItemPending(item));
        }

        return filtered.sort((a, b) => {
            const timeA = new Date(a.rawDate || a.date || 0).getTime() || 0;
            const timeB = new Date(b.rawDate || b.date || 0).getTime() || 0;
            if (currentSort === 'oldest') {
                return timeA - timeB;
            }
            return timeB - timeA;
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderCards();
        });
    }

    // =========================================================================
    // 6. CARD RENDERING
    // =========================================================================
    function renderCards() {
        if (!cardsGrid) return;

        updateBadges();

        const filtered = getFilteredList();

        if (filtered.length === 0) {
            cardsGrid.innerHTML = '';
            if (emptyState) {
                emptyState.style.display = 'block';
                const emptyTitle = document.getElementById('cover-empty-title') || emptyState.querySelector('h3');
                const emptyIcon = document.getElementById('cover-empty-icon') || emptyState.querySelector('i');
                const emptyDesc = emptyState.querySelector('p');
                if (emptyDesc) emptyDesc.remove();

                if (emptyTitle) {
                    if (currentTab === 'cartoon') {
                        emptyTitle.textContent = 'All Caught Up on Editorial Cartoons';
                    } else {
                        emptyTitle.textContent = 'All Caught Up on Photojournalism Captures';
                    }
                }
                if (emptyIcon) {
                    if (currentTab === 'cartoon') {
                        emptyIcon.className = 'fa-solid fa-palette';
                    } else {
                        emptyIcon.className = 'fa-solid fa-camera';
                    }
                }
            }
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        cardsGrid.innerHTML = filtered.map(item => {
            const isApproved = (item.status === 'approved_for_mpc' || item.status === 'approved' || item.status === 'EIC Approved' || item.status === 'Published');
            const isPublished = (item.status === 'Published');
            const isEicApproved = (item.status === 'EIC Approved');
            const itemType = getItemType(item);

            let statusBadgeHtml = '';
            if (isPublished) {
                statusBadgeHtml = '<span class="cover-status-tag published" style="background: var(--sidebar-maroon, #5c0a18); color: #fff;"><i class="fa-solid fa-globe"></i> PUBLISHED</span>';
            } else if (isEicApproved) {
                statusBadgeHtml = '<span class="cover-status-tag approved" style="background: #1e3a8a; color: #fff;"><i class="fa-solid fa-shield-halved"></i> EIC APPROVED</span>';
            } else if (isApproved) {
                statusBadgeHtml = '<span class="cover-status-tag approved"><i class="fa-solid fa-circle-check"></i> APPROVED</span>';
            } else {
                statusBadgeHtml = '<span class="cover-status-tag pending" style="background: #ffedd5; color: #c2410c; border: 1px solid #fed7aa; font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; letter-spacing: 0.04em; text-transform: uppercase;"><i class="fa-regular fa-clock" style="color: #c2410c;"></i> PENDING WITH HEAD</span>';
            }

            return `
            <div class="cover-card" id="card-${item.id}" data-id="${item.id}">
                <!-- Clickable Artwork Thumbnail (Click to Inspect) -->
                <div class="cover-thumb-container" data-action="inspect" data-id="${item.id}" title="Click to view artwork full size">
                    <img src="${escapeHTML(item.image)}" alt="Artwork Preview" class="cover-thumb-img" loading="lazy">
                    
                    <div class="cover-thumb-overlay">
                        <i class="fa-solid fa-magnifying-glass-plus"></i>
                        <span>Inspect Artwork</span>
                    </div>

                    <!-- Type Tag on Top-Left -->
                    <div class="cover-thumb-badge-group">
                        <span class="cover-type-tag ${itemType}">${escapeHTML(itemType.toUpperCase())}</span>
                    </div>

                    <!-- Status Badge on Top-Right -->
                    <div class="cover-thumb-status-badge" style="position: absolute; top: 10px; right: 10px; z-index: 2;">
                        ${statusBadgeHtml}
                    </div>

                    <span class="cover-thumb-date">
                        <i class="fa-regular fa-calendar"></i>
                        <span>${escapeHTML(item.date)}</span>
                    </span>
                </div>

                <!-- Card Body: Provenance Only -->
                <div class="cover-card-body">
                    <div class="cover-provenance-box">
                        <div class="cover-artist-row">
                            <i class="fa-solid fa-${itemType === 'photo' ? 'camera' : 'palette'}"></i>
                            <span>${itemType === 'photo' ? 'Photojournalist' : 'Cartoonist'}: <strong>${escapeHTML(cleanArtistName(item.artist || 'Media Team Member'))}</strong></span>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                ${isPublished ? `
                <div class="cover-card-footer library-card-footer" style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="library-card-status" style="color: var(--sidebar-maroon, #5c0a18); font-weight: 600; font-size: 0.82rem; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-circle-check"></i>
                        <span>Live on Publication</span>
                    </div>
                    <button type="button" class="btn-library-inspect" data-action="inspect" data-id="${item.id}" title="Inspect full size artwork">
                        <i class="fa-solid fa-eye"></i>
                        <span>Inspect</span>
                    </button>
                </div>
                ` : (isEicApproved ? `
                <div class="cover-card-footer library-card-footer" style="display: flex; gap: 8px; justify-content: space-between; align-items: center;">
                    <button type="button" class="btn-library-inspect" data-action="inspect" data-id="${item.id}" title="Inspect full size artwork" style="flex: 1;">
                        <i class="fa-solid fa-eye"></i>
                        <span>Inspect</span>
                    </button>
                    <button type="button" class="btn-cover-post" data-action="post-image" data-id="${item.id}" title="Post Image to Publication Website" style="flex: 1.2; background: var(--sidebar-maroon, #5c0a18); color: #fff; border: none; padding: 7px 12px; border-radius: 6px; font-weight: 600; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <span>Post Image</span>
                    </button>
                </div>
                ` : (isApproved ? `
                <div class="cover-card-footer library-card-footer">
                    <div class="library-card-status">
                        <i class="fa-solid fa-box-archive"></i>
                        <span>In Media Library</span>
                    </div>
                    <button type="button" class="btn-library-inspect" data-action="inspect" data-id="${item.id}" title="Inspect full size artwork">
                        <i class="fa-solid fa-eye"></i>
                        <span>Inspect</span>
                    </button>
                </div>
                ` : `
                <div class="cover-card-footer">
                    <button type="button" class="btn-cover-return" data-action="return" data-id="${item.id}" title="Return for revisions">
                        <i class="fa-solid fa-rotate-left"></i>
                        <span>Return for Revision</span>
                    </button>
                    <button type="button" class="btn-cover-approve" data-action="approve" data-id="${item.id}" title="Endorse to EIC">
                        <i class="fa-solid fa-check"></i>
                        <span>Endorse to EIC</span>
                    </button>
                </div>
                `))}
            </div>
            `;
        }).join('');
    }

    // =========================================================================
    // 7. INSPECTION MODAL (Theater Mode)
    // =========================================================================
    function openInspectModal(id) {
        const item = coverList.find(c => String(c.id) === String(id));
        if (!item || !inspectModal) return;

        activeInspectionId = id;

        if (inspectArtist) inspectArtist.textContent = cleanArtistName(item.artist || 'Media Team Member');
        if (inspectHead) inspectHead.textContent = '';
        if (inspectImage) {
            inspectImage.src = item.image;
            inspectImage.alt = `${(item.type || 'Media').toUpperCase()} by ${cleanArtistName(item.artist || '')}`;
        }

        if (inspectTypeTag) {
            const resolvedType = getItemType(item);
            inspectTypeTag.className = `cover-type-tag ${resolvedType}`;
            inspectTypeTag.textContent = resolvedType.toUpperCase();
        }

        const isApproved = (item.status === 'approved_for_mpc' || item.status === 'approved' || item.status === 'EIC Approved' || item.status === 'Published');
        const isPublished = (item.status === 'Published');
        const isEicApproved = (item.status === 'EIC Approved');
        const footerBtnGroup = document.querySelector('.inspect-footer-buttons');
        if (footerBtnGroup) {
            if (isPublished) {
                footerBtnGroup.innerHTML = `
                    <div class="inspect-library-status" style="color: var(--sidebar-maroon, #5c0a18); font-weight: 600;">
                        <i class="fa-solid fa-circle-check"></i>
                        <span>Live on Publication Website</span>
                    </div>
                    <button type="button" class="btn-inspect-close-lib" id="btn-lib-done">
                        <i class="fa-solid fa-check"></i>
                        <span>Done</span>
                    </button>
                `;
                const doneBtn = document.getElementById('btn-lib-done');
                if (doneBtn) doneBtn.addEventListener('click', closeInspectModal);
            } else if (isEicApproved) {
                footerBtnGroup.innerHTML = `
                    <div class="inspect-library-status" style="color: #1e3a8a; font-weight: 600;">
                        <i class="fa-solid fa-shield-halved"></i>
                        <span>Approved by EIC — Ready to Post</span>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button type="button" class="btn-modal-cancel" id="btn-lib-done" style="padding: 8px 16px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; cursor: pointer;">
                            <span>Close</span>
                        </button>
                        <button type="button" class="btn-inspect-approve" id="btn-inspect-post" style="background: var(--sidebar-maroon, #5c0a18); color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                            <i class="fa-solid fa-cloud-arrow-up"></i>
                            <span>Post Image</span>
                        </button>
                    </div>
                `;
                const doneBtn = document.getElementById('btn-lib-done');
                if (doneBtn) doneBtn.addEventListener('click', closeInspectModal);
                const postBtn = document.getElementById('btn-inspect-post');
                if (postBtn) {
                    postBtn.addEventListener('click', () => {
                        const targetId = activeInspectionId;
                        closeInspectModal();
                        if (targetId) handlePostImage(targetId);
                    });
                }
            } else if (isApproved) {
                footerBtnGroup.innerHTML = `
                    <div class="inspect-library-status">
                        <i class="fa-solid fa-circle-check"></i>
                        <span>In Media Library — Ready for Publishing</span>
                    </div>
                    <button type="button" class="btn-inspect-close-lib" id="btn-lib-done">
                        <i class="fa-solid fa-check"></i>
                        <span>Done</span>
                    </button>
                `;
                const doneBtn = document.getElementById('btn-lib-done');
                if (doneBtn) doneBtn.addEventListener('click', closeInspectModal);
            } else {
                footerBtnGroup.innerHTML = `
                    <button type="button" id="inspect-return-btn" class="btn-inspect-return">
                        <i class="fa-solid fa-rotate-left"></i>
                        <span>Return to Media Team</span>
                    </button>
                    <button type="button" id="inspect-approve-btn" class="btn-inspect-approve">
                        <i class="fa-solid fa-check"></i>
                        <span>Endorse to EIC</span>
                    </button>
                `;
                const rBtn = document.getElementById('inspect-return-btn');
                const aBtn = document.getElementById('inspect-approve-btn');
                if (rBtn) {
                    rBtn.addEventListener('click', () => {
                        const targetId = activeInspectionId;
                        closeInspectModal();
                        if (targetId) openReturnModal(targetId);
                    });
                }
                if (aBtn) {
                    aBtn.addEventListener('click', () => {
                        const targetId = activeInspectionId;
                        closeInspectModal();
                        if (targetId) handleApprove(targetId);
                    });
                }
            }
        }

        inspectModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeInspectModal() {
        if (!inspectModal) return;
        inspectModal.classList.add('hidden');
        document.body.style.overflow = '';
        activeInspectionId = null;
    }

    if (closeInspectBtn) closeInspectBtn.addEventListener('click', closeInspectModal);
    if (inspectModal) {
        inspectModal.addEventListener('click', (e) => {
            if (e.target === inspectModal) closeInspectModal();
        });
    }

    // Modal Actions
    if (inspectReturnBtn) {
        inspectReturnBtn.addEventListener('click', () => {
            const targetId = activeInspectionId;
            closeInspectModal();
            if (targetId) openReturnModal(targetId);
        });
    }

    if (inspectApproveBtn) {
        inspectApproveBtn.addEventListener('click', () => {
            const targetId = activeInspectionId;
            closeInspectModal();
            if (targetId) handleApprove(targetId);
        });
    }

    // =========================================================================
    // 8. MANDATORY RETURN TO HEAD MODAL
    // =========================================================================
    function openReturnModal(id) {
        const item = coverList.find(c => String(c.id) === String(id));
        if (!item || !returnModal) return;

        activeReturnId = id;

        if (returnHeadName) returnHeadName.textContent = item.approvedBy || item.artist || 'Media Team Member';
        if (returnRemarksText) {
            returnRemarksText.value = '';
            returnRemarksText.classList.remove('input-invalid');
        }
        if (returnRemarksError) returnRemarksError.classList.add('hidden');

        returnModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            if (returnRemarksText) returnRemarksText.focus();
        }, 100);
    }

    function closeReturnModal() {
        if (!returnModal) return;
        returnModal.classList.add('hidden');
        document.body.style.overflow = '';
        activeReturnId = null;
        if (returnRemarksError) returnRemarksError.classList.add('hidden');
    }

    if (closeReturnModalBtn) closeReturnModalBtn.addEventListener('click', closeReturnModal);
    if (cancelReturnBtn) cancelReturnBtn.addEventListener('click', closeReturnModal);
    if (returnModal) {
        returnModal.addEventListener('click', (e) => {
            if (e.target === returnModal) closeReturnModal();
        });
    }

    if (confirmReturnBtn) {
        confirmReturnBtn.addEventListener('click', () => {
            if (!activeReturnId) return;

            const remarks = returnRemarksText ? returnRemarksText.value.trim() : '';

            // Mandatory Validation Check
            if (!remarks) {
                if (returnRemarksText) returnRemarksText.classList.add('input-invalid');
                if (returnRemarksError) returnRemarksError.classList.remove('hidden');
                return;
            }

            const itemIndex = coverList.findIndex(c => String(c.id) === String(activeReturnId));
            if (itemIndex > -1) {
                const target = coverList[itemIndex];
                target.status = 'Returned for Revision';
                target.remarks = remarks;

                try {
                    const rawSub = localStorage.getItem('mediaTeamSubmissions_v2');
                    if (rawSub) {
                        let subs = JSON.parse(rawSub);
                        if (Array.isArray(subs)) {
                            subs = subs.map(s => (String(s.id) === String(target.id) ? { ...s, status: 'Returned for Revision', remarks: remarks } : s));
                            localStorage.setItem('mediaTeamSubmissions_v2', JSON.stringify(subs));
                        }
                    }
                } catch (e) {}

                try {
                    const rawCart = localStorage.getItem('cartoonistSubmissions_v1');
                    if (rawCart) {
                        let carts = JSON.parse(rawCart);
                        if (Array.isArray(carts)) {
                            carts = carts.map(s => (String(s.id) === String(target.id) ? { ...s, status: 'Returned for Revision', remarks: remarks } : s));
                            localStorage.setItem('cartoonistSubmissions_v1', JSON.stringify(carts));
                        }
                    }
                } catch (e) {}

                // Log to Activity Log (Executive sentence parity)
                try {
                    const rawLogs = localStorage.getItem('mpcActivityLogs_v1');
                    let logs = rawLogs ? JSON.parse(rawLogs) : [];
                    if (!Array.isArray(logs)) logs = [];
                    const now = new Date();
                    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    logs.unshift({
                        id: 'mpc-act-' + Date.now(),
                        causer: cleanArtistName(window.LARAVEL_USER_NAME || localStorage.getItem('mpcName') || 'M&PC Officer'),
                        causerRole: window.LARAVEL_USER_ROLE || localStorage.getItem('mpcRole') || 'M&PC Head',
                        causerAvatar: window.LARAVEL_USER_AVATAR || 'images/member-placeholder.svg',
                        action: 'returned for revision',
                        subjectType: `${target.type.toUpperCase()} Artwork`,
                        subjectName: target.title || `${target.type.toUpperCase()} Material`,
                        timestampText: 'Just now',
                        isoDate: now.toISOString(),
                        dateKey: now.toISOString().split('T')[0],
                        formattedDate: `${dateStr} • ${timeStr}`,
                        dayGroup: 'Today'
                    });
                    localStorage.setItem('mpcActivityLogs_v1', JSON.stringify(logs.slice(0, 40)));
                } catch (e) {
                    console.warn(e);
                }

                // Backend sync if running on Laravel
                try {
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                    if (csrfToken && target.id) {
                        fetch(`/mpc/media/${target.id}/revision`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken,
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({ remarks: remarks })
                        }).catch(err => console.warn('Backend MPC return sync failed:', err));
                    }
                } catch (e) {}

                saveCoverQueue(coverList);

                closeReturnModal();
                renderCards();
                const recipientName = target.approvedBy || target.artist || 'Media Team';
                showToast(`Artwork returned to ${recipientName} with revision remarks.`);
            }
        });
    }

    if (returnRemarksText) {
        returnRemarksText.addEventListener('input', () => {
            if (returnRemarksText.value.trim().length > 0) {
                returnRemarksText.classList.remove('input-invalid');
                if (returnRemarksError) returnRemarksError.classList.add('hidden');
            }
        });
    }

    // =========================================================================
    // 9. APPROVAL ACTION
    // =========================================================================
    function handleApprove(id) {
        const itemIndex = coverList.findIndex(c => String(c.id) === String(id));
        if (itemIndex === -1) return;

        const target = coverList[itemIndex];
        target.status = 'Pending EIC Review';
        target.endorsedBy = cleanArtistName(window.LARAVEL_USER_NAME || localStorage.getItem('mpcName') || 'M&PC Head');

        try {
            const rawSub = localStorage.getItem('mediaTeamSubmissions_v2');
            if (rawSub) {
                let subs = JSON.parse(rawSub);
                if (Array.isArray(subs)) {
                    subs = subs.map(s => (String(s.id) === String(target.id) ? { ...s, status: 'Pending EIC Review', endorsedBy: target.endorsedBy } : s));
                    localStorage.setItem('mediaTeamSubmissions_v2', JSON.stringify(subs));
                }
            }
        } catch (e) {}

        // Backend sync if running on Laravel
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (csrfToken && target.id) {
                fetch(`/mpc/media/${target.id}/endorse`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json'
                    }
                }).catch(err => console.warn('Backend MPC endorse sync failed:', err));
            }
        } catch (e) {}

        // Note: Item is endorsed to EIC and will ONLY enter Approved Covers Library after EIC approves it.

        // Log to Activity Log (Executive sentence parity)
        try {
            const rawLogs = localStorage.getItem('mpcActivityLogs_v1');
            let logs = rawLogs ? JSON.parse(rawLogs) : [];
            if (!Array.isArray(logs)) logs = [];
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            logs.unshift({
                id: 'mpc-act-' + Date.now(),
                causer: cleanArtistName(window.LARAVEL_USER_NAME || localStorage.getItem('mpcName') || 'M&PC Officer'),
                causerRole: window.LARAVEL_USER_ROLE || localStorage.getItem('mpcRole') || 'M&PC Head',
                causerAvatar: window.LARAVEL_USER_AVATAR || 'images/member-placeholder.svg',
                action: 'approved',
                subjectType: `${(target.type || 'Media').toUpperCase()} Artwork`,
                subjectName: target.title || `${(target.type || 'Media').toUpperCase()} Asset`,
                timestampText: 'Just now',
                isoDate: now.toISOString(),
                dateKey: now.toISOString().split('T')[0],
                formattedDate: `${dateStr} • ${timeStr}`,
                dayGroup: 'Today'
            });
            localStorage.setItem('mpcActivityLogs_v1', JSON.stringify(logs.slice(0, 40)));
        } catch (e) {
            console.warn(e);
        }

        saveCoverQueue(coverList);

        const cardEl = document.getElementById(`card-${id}`);
        if (cardEl) {
            cardEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            cardEl.style.opacity = '0';
            cardEl.style.transform = 'scale(0.95)';
            setTimeout(() => {
                renderCards();
            }, 250);
        } else {
            renderCards();
        }

        showToast(`${(target.type || 'Media').toUpperCase()} endorsed and forwarded to Editor-in-Chief.`, 'success');
    }

    // =========================================================================
    // 9.5 POST IMAGE ACTION (M&PC Head posts EIC Approved Media)
    // =========================================================================
    function handlePostImage(id) {
        const itemIndex = coverList.findIndex(c => String(c.id) === String(id));
        if (itemIndex === -1) return;

        const target = coverList[itemIndex];
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const mpcOfficer = cleanArtistName(window.LARAVEL_USER_NAME || localStorage.getItem('mpcName') || 'M&PC Head');

        target.status = 'Published';
        target.publishedAt = dateStr;
        target.postedBy = mpcOfficer;

        saveCoverQueue(coverList);

        // Sync status to Media Team Submissions (moves to Published tab in /media/manage-media)
        try {
            const rawSub = localStorage.getItem('mediaTeamSubmissions_v2');
            if (rawSub) {
                let subs = JSON.parse(rawSub);
                if (Array.isArray(subs)) {
                    subs = subs.map(s => (String(s.id) === String(target.id) ? { 
                        ...s, 
                        status: 'Published', 
                        publishedAt: dateStr,
                        postedBy: mpcOfficer,
                        views: s.views || 150, 
                        shares: s.shares || 12 
                    } : s));
                    localStorage.setItem('mediaTeamSubmissions_v2', JSON.stringify(subs));
                }
            }
        } catch (e) {}

        // If cartoon, sync to cartoonistSubmissions_v1
        try {
            const rawCart = localStorage.getItem('cartoonistSubmissions_v1');
            if (rawCart) {
                let carts = JSON.parse(rawCart);
                if (Array.isArray(carts)) {
                    carts = carts.map(s => (String(s.id) === String(target.id) ? { 
                        ...s, 
                        status: 'Published', 
                        publishedAt: dateStr,
                        postedBy: mpcOfficer
                    } : s));
                    localStorage.setItem('cartoonistSubmissions_v1', JSON.stringify(carts));
                }
            }
        } catch (e) {}

        // Sync to theLensPublishedArticles
        try {
            let pubList = [];
            const rawPub = localStorage.getItem('theLensPublishedArticles');
            if (rawPub) pubList = JSON.parse(rawPub);
            if (!Array.isArray(pubList)) pubList = [];
            if (!pubList.some(p => String(p.id) === String(target.id))) {
                pubList.unshift({
                    id: target.id,
                    title: target.title || 'Publication Graphic Asset',
                    category: target.type === 'cartoon' ? 'Cartoon' : 'Photo',
                    author: cleanArtistName(target.artist || 'Media Team Member'),
                    image: target.image,
                    date: target.date || dateStr,
                    publishedAt: dateStr,
                    status: 'Published',
                    views: 150,
                    shares: 12,
                    type: target.type || 'pubmat'
                });
                localStorage.setItem('theLensPublishedArticles', JSON.stringify(pubList));
            }
        } catch (e) {}

        // Log to Activity Log
        try {
            const rawLogs = localStorage.getItem('mpcActivityLogs_v1');
            let logs = rawLogs ? JSON.parse(rawLogs) : [];
            if (!Array.isArray(logs)) logs = [];
            logs.unshift({
                id: 'mpc-act-' + Date.now(),
                causer: mpcOfficer,
                causerRole: window.LARAVEL_USER_ROLE || localStorage.getItem('mpcRole') || 'M&PC Head',
                causerAvatar: window.LARAVEL_USER_AVATAR || 'images/member-placeholder.svg',
                action: 'posted',
                subjectType: `${(target.type || 'Media').toUpperCase()} Artwork`,
                subjectName: target.title || 'Publication Asset',
                timestampText: 'Just now',
                isoDate: now.toISOString(),
                dateKey: now.toISOString().split('T')[0],
                formattedDate: `${dateStr} • ${timeStr}`,
                dayGroup: 'Today'
            });
            localStorage.setItem('mpcActivityLogs_v1', JSON.stringify(logs.slice(0, 40)));
        } catch (e) {}

        renderCards();
        showToast('Image successfully posted to the publication website!', 'success');
    }

    // =========================================================================
    // 10. DELEGATED EVENT LISTENER FOR CARDS
    // =========================================================================
    document.addEventListener('click', (e) => {
        // Thumbnail Click -> Inspect
        const inspectTrigger = e.target.closest('[data-action="inspect"]');
        if (inspectTrigger) {
            const id = inspectTrigger.getAttribute('data-id');
            if (id) openInspectModal(id);
            return;
        }

        // Return Button Click -> Return Modal
        const returnBtn = e.target.closest('[data-action="return"]');
        if (returnBtn) {
            const id = returnBtn.getAttribute('data-id');
            if (id) openReturnModal(id);
            return;
        }

        // Approve Button Click -> Approve
        const approveBtn = e.target.closest('[data-action="approve"]');
        if (approveBtn) {
            const id = approveBtn.getAttribute('data-id');
            if (id) handleApprove(id);
            return;
        }

        // Post Image Click
        const postBtn = e.target.closest('[data-action="post-image"]');
        if (postBtn) {
            const id = postBtn.getAttribute('data-id');
            if (id) handlePostImage(id);
            return;
        }
    });

    // Keyboard ESC listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (returnModal && !returnModal.classList.contains('hidden')) {
                closeReturnModal();
            } else if (inspectModal && !inspectModal.classList.contains('hidden')) {
                closeInspectModal();
            }
        }
    });

    // Initial Render
    renderCards();

});
