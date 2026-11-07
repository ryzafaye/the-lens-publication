/**
 * ============================================================================
 * THE LENS — MEDIA DESK (EDITOR-IN-CHIEF / EIC PORTAL)
 * Handles review, endorsement, revision, and library approval of
 * PUBMAT, PHOTOS, and CARTOONS publication media assets.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    function cleanArtistName(name) {
        if (!name) return '';
        return name.replace(/\s*\([^)]*\)/g, '').trim();
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

    // =========================================================================
    // 1. PERSISTENCE & DATA
    // =========================================================================
    const STORAGE_KEY = 'articleCoverReviewQueue_v1';

    // One-time purge of all pics submitted by media team per user request
    try {
        const PURGE_MEDIA_PICS_FLAG = 'theLens_purge_all_media_pics_v20261107_final';
        if (localStorage.getItem(PURGE_MEDIA_PICS_FLAG) !== 'true') {
            localStorage.removeItem('mediaTeamSubmissions_v2');
            localStorage.removeItem('mediaTeamSubmissions_v1');
            const rawQueue = localStorage.getItem(STORAGE_KEY);
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
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
                    }
                } catch (err) {}
            }
            localStorage.setItem(PURGE_MEDIA_PICS_FLAG, 'true');
        }
    } catch (e) {}

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
                : []);

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

        return list;
    }

    function saveCoverQueue(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            console.warn('Could not save cover queue to localStorage', e);
        }
    }

    let coverList = getCoverQueue();
    let currentTab = 'photo'; // 'photo' | 'cartoon'
    let currentSort = 'newest'; // 'newest' | 'oldest'
    let activeInspectionId = null;
    let activeReturnId = null;

    // =========================================================================
    // 2. DOM REFERENCES
    // =========================================================================
    const cardsGrid = document.getElementById('cover-cards-grid');
    const emptyState = document.getElementById('cover-empty-state');
    const sortSelect = document.getElementById('cover-sort-select');

    // Tab Badges
    const badgePhoto = document.getElementById('badge-cover-photo');
    const badgeCartoon = document.getElementById('badge-cover-cartoon');

    // Modals
    const inspectModal = document.getElementById('cover-inspect-modal');
    const closeInspectBtn = document.getElementById('close-inspect-btn');
    const inspectTypeTag = document.getElementById('inspect-type-tag');
    const inspectArtist = document.getElementById('inspect-artist');
    const inspectHead = document.getElementById('inspect-head');
    const inspectImage = document.getElementById('inspect-image');
    const inspectReturnBtn = document.getElementById('inspect-return-btn');
    const inspectApproveBtn = document.getElementById('inspect-approve-btn');

    const returnModal = document.getElementById('cover-return-modal');
    const closeReturnModalBtn = document.getElementById('close-return-modal-btn');
    const returnHeadName = document.getElementById('return-head-name');
    const returnRemarksText = document.getElementById('return-remarks-input');
    const returnRemarksError = document.getElementById('return-remarks-error');
    const confirmReturnBtn = document.getElementById('confirm-return-btn');
    const cancelReturnBtn = document.getElementById('cancel-return-btn');

    const toastContainer = document.getElementById('toast-container');

    // =========================================================================
    // 3. TOAST SYSTEM
    // =========================================================================
    function showToast(message, type = 'success') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        const resolvedType = type === 'error' ? 'danger' : type;
        toast.className = `toast-message ${resolvedType}`;
        toast.innerHTML = `<span class="toast-bullet-dot"></span><span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-dismissing');
            setTimeout(() => toast.remove(), 260);
        }, 3400);
    }

    // =========================================================================
    // 4. ITEM HELPERS & BADGES
    // =========================================================================
    function isItemApproved(item) {
        if (!item) return false;
        const s = (item.status || '').toLowerCase().trim();
        return s === 'eic approved' || s === 'approved' || s === 'approved_for_mpc' || s === 'published';
    }

    function isItemPending(item) {
        if (!item) return false;
        const s = (item.status || '').toLowerCase().trim();
        return s === 'pending eic review' || s === 'pending eic' || s === 'forwarded to eic' || s === 'submitted_to_eic' || s === 'pending' || s === 'pending_head' || s === 'pending with head' || s === 'pending review';
    }

    function getItemType(item) {
        if (!item) return 'photo';
        const t = (item.type || '').toLowerCase().trim();
        if (t === 'cartoon' || t === 'cartoons') return 'cartoon';
        return 'photo';
    }

    function updateBadges() {
        const photoCount = coverList.filter(item => getItemType(item) === 'photo' && isItemPending(item)).length;
        const cartoonCount = coverList.filter(item => getItemType(item) === 'cartoon' && isItemPending(item)).length;

        if (badgePhoto) badgePhoto.textContent = photoCount;
        if (badgeCartoon) badgeCartoon.textContent = cartoonCount;
    }

    // Tab Switching
    const tabButtons = document.querySelectorAll('.cover-tabs-container .review-tab-btn');
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

    // Sort Switching
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderCards();
        });
    }

    // =========================================================================
    // 5. FILTERING & SORTING
    // =========================================================================
    function getFilteredList() {
        return coverList
            .filter(item => getItemType(item) === currentTab && isItemPending(item))
            .sort((a, b) => {
                const timeA = new Date(a.rawDate || a.date).getTime() || 0;
                const timeB = new Date(b.rawDate || b.date).getTime() || 0;
                if (currentSort === 'oldest') {
                    return timeA - timeB;
                }
                return timeB - timeA;
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
            const approved = isItemApproved(item);
            const itemType = getItemType(item);

            return `
            <div class="cover-card" id="card-${item.id}" data-id="${item.id}">
                <!-- Clickable Artwork Thumbnail -->
                <div class="cover-thumb-container" data-action="inspect" data-id="${item.id}" title="Click to view artwork full size">
                    <img src="${escapeHTML(item.image)}" alt="Artwork Preview" class="cover-thumb-img" loading="lazy">
                    
                    <div class="cover-thumb-overlay">
                        <i class="fa-solid fa-magnifying-glass-plus"></i>
                        <span>Inspect Artwork</span>
                    </div>

                    <div class="cover-thumb-badge-group">
                        <span class="cover-type-tag ${itemType}">${escapeHTML(itemType.toUpperCase())}</span>
                        ${approved ? '<span class="cover-status-tag approved"><i class="fa-solid fa-circle-check"></i> APPROVED</span>' : ''}
                    </div>

                    <span class="cover-thumb-date">
                        <i class="fa-regular fa-calendar"></i>
                        <span>${escapeHTML(item.date || 'Recent')}</span>
                    </span>
                </div>

                <!-- Card Body: Provenance -->
                <div class="cover-card-body">
                    <div class="cover-provenance-box">
                        <div class="cover-artist-row">
                            <i class="fa-solid fa-${itemType === 'photo' ? 'camera' : 'palette'}"></i>
                            <span>${itemType === 'photo' ? 'Photojournalist' : 'Cartoonist'}: <strong>${escapeHTML(cleanArtistName(item.artist || 'Media Team Member'))}</strong></span>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="cover-card-footer">
                    <button type="button" class="btn-cover-return" data-action="return" data-id="${item.id}" title="Return for revisions">
                        <i class="fa-solid fa-rotate-left"></i>
                        <span>Return for Revision</span>
                    </button>
                    <button type="button" class="btn-cover-approve" data-action="approve" data-id="${item.id}" title="Approve Artwork">
                        <i class="fa-solid fa-check"></i>
                        <span>Approve Pubmat</span>
                    </button>
                </div>
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
        if (inspectHead) inspectHead.textContent = item.approvedBy || item.endorsedBy || 'Section Head';
        if (inspectImage) {
            inspectImage.src = item.image;
            inspectImage.alt = `${(item.type || 'Media').toUpperCase()} by ${cleanArtistName(item.artist || '')}`;
        }

        const itemType = getItemType(item);
        if (inspectTypeTag) {
            inspectTypeTag.className = `cover-type-tag ${itemType}`;
            inspectTypeTag.textContent = itemType.toUpperCase();
        }

        const footerBtnGroup = document.querySelector('.inspect-footer-buttons');
        if (footerBtnGroup) {
            footerBtnGroup.innerHTML = `
                <button type="button" id="inspect-return-btn" class="btn-inspect-return">
                    <i class="fa-solid fa-rotate-left"></i>
                    <span>Return for Revision</span>
                </button>
                <button type="button" id="inspect-approve-btn" class="btn-inspect-approve">
                    <i class="fa-solid fa-check"></i>
                    <span>Approve Artwork</span>
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

    // =========================================================================
    // 8. MANDATORY RETURN TO HEAD MODAL
    // =========================================================================
    function openReturnModal(id) {
        const item = coverList.find(c => String(c.id) === String(id));
        if (!item || !returnModal) return;

        activeReturnId = id;

        if (returnHeadName) {
            const eicName = window.LARAVEL_USER_NAME || localStorage.getItem('eicName') || 'Editor-in-Chief';
            const eicRole = window.LARAVEL_USER_ROLE || localStorage.getItem('eicRole') || 'Editor-in-Chief';
            returnHeadName.textContent = `${eicName} (${eicRole})`;
        }
        if (returnRemarksText) {
            returnRemarksText.value = '';
            returnRemarksText.classList.remove('input-invalid');
        }
        if (returnRemarksError) returnRemarksError.classList.add('hidden');

        returnModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeReturnModal() {
        if (!returnModal) return;
        returnModal.classList.add('hidden');
        document.body.style.overflow = '';
        activeReturnId = null;
    }

    if (closeReturnModalBtn) closeReturnModalBtn.addEventListener('click', closeReturnModal);
    if (cancelReturnBtn) cancelReturnBtn.addEventListener('click', closeReturnModal);
    if (returnModal) {
        returnModal.addEventListener('click', (e) => {
            if (e.target === returnModal) closeReturnModal();
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

    if (confirmReturnBtn) {
        confirmReturnBtn.addEventListener('click', () => {
            if (!activeReturnId) return;
            const remarks = returnRemarksText ? returnRemarksText.value.trim() : '';
            if (!remarks) {
                if (returnRemarksText) returnRemarksText.classList.add('input-invalid');
                if (returnRemarksError) returnRemarksError.classList.remove('hidden');
                return;
            }

            const itemIndex = coverList.findIndex(c => String(c.id) === String(activeReturnId));
            if (itemIndex === -1) return;

            const target = coverList[itemIndex];
            target.status = 'Returned for Revision';
            target.remarks = remarks;
            target.returnedBy = cleanArtistName(window.LARAVEL_USER_NAME || localStorage.getItem('eicName') || 'Editor-in-Chief');

            saveCoverQueue(coverList);

            // Sync to personal submissions
            try {
                const isCartoon = (getItemType(target) === 'cartoon');
                const subKey = isCartoon ? 'cartoonistSubmissions_v1' : 'mediaTeamSubmissions_v2';
                const rawSub = localStorage.getItem(subKey);
                if (rawSub) {
                    let subs = JSON.parse(rawSub);
                    if (Array.isArray(subs)) {
                        subs = subs.map(s => (String(s.id) === String(target.id) ? { ...s, status: 'Returned for Revision', remarks: remarks } : s));
                        localStorage.setItem(subKey, JSON.stringify(subs));
                    }
                }
            } catch (e) {}

            // Activity Log
            try {
                const rawLogs = localStorage.getItem('eicActivityLogs_v1');
                let logs = rawLogs ? JSON.parse(rawLogs) : [];
                if (!Array.isArray(logs)) logs = [];
                const now = new Date();
                const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                logs.unshift({
                    id: 'eic-act-' + Date.now(),
                    causer: cleanArtistName(window.LARAVEL_USER_NAME || 'Editor-in-Chief'),
                    causerRole: window.LARAVEL_USER_ROLE || 'Editor-in-Chief',
                    action: 'returned for revision',
                    subjectType: `${getItemType(target).toUpperCase()} Artwork`,
                    subjectName: target.title || `${getItemType(target).toUpperCase()} Asset`,
                    timestampText: 'Just now',
                    isoDate: now.toISOString(),
                    formattedDate: `${dateStr} • ${timeStr}`,
                    dayGroup: 'Today'
                });
                localStorage.setItem('eicActivityLogs_v1', JSON.stringify(logs.slice(0, 40)));
            } catch (e) {}

            closeReturnModal();
            renderCards();
            showToast('Artwork returned for revision with feedback.', 'warning');

            // Backend sync if running on Laravel
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                if (csrfToken && target.id) {
                    fetch(`/eic/media/${target.id}/revision`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ remarks: remarks })
                    }).catch(err => console.warn('Backend EIC return sync failed:', err));
                }
            } catch (e) {}
        });
    }

    // =========================================================================
    // 9. APPROVAL ACTION
    // =========================================================================
    function handleApprove(id) {
        const itemIndex = coverList.findIndex(c => String(c.id) === String(id));
        if (itemIndex === -1) return;

        const target = coverList[itemIndex];
        const approverName = cleanArtistName(window.LARAVEL_USER_NAME || localStorage.getItem('eicName') || 'Editor-in-Chief');
        target.status = 'EIC Approved';
        target.approvedBy = `${approverName} (EIC)`;

        saveCoverQueue(coverList);

        // Sync status back to creator's personal submissions
        try {
            const isCartoon = (getItemType(target) === 'cartoon');
            const subKey = isCartoon ? 'cartoonistSubmissions_v1' : 'mediaTeamSubmissions_v2';
            const rawSub = localStorage.getItem(subKey);
            if (rawSub) {
                let subs = JSON.parse(rawSub);
                if (Array.isArray(subs)) {
                    subs = subs.map(s => (String(s.id) === String(target.id) ? { ...s, status: 'EIC Approved', approvedBy: target.approvedBy } : s));
                    localStorage.setItem(subKey, JSON.stringify(subs));
                }
            }
        } catch (e) {}

        // Add to Approved Pool and Sync with Publish Article Covers
        try {
            const rawPool = localStorage.getItem('mpcApprovedCoversPool_v1');
            let pool = rawPool ? JSON.parse(rawPool) : [];
            if (!Array.isArray(pool)) pool = [];
            
            const existingIdx = pool.findIndex(p => String(p.id) === String(target.id));
            if (existingIdx > -1) {
                pool[existingIdx] = target;
            } else {
                pool.unshift(target);
            }
            localStorage.setItem('mpcApprovedCoversPool_v1', JSON.stringify(pool));

            // Sync with mpc_approved_covers_v1
            const rawCovers = localStorage.getItem('mpc_approved_covers_v1');
            let mpcCovers = rawCovers ? JSON.parse(rawCovers) : [];
            if (Array.isArray(mpcCovers)) {
                if (!mpcCovers.some(c => String(c.id) === String(target.id))) {
                    mpcCovers.unshift(target);
                    localStorage.setItem('mpc_approved_covers_v1', JSON.stringify(mpcCovers));
                }
            }
        } catch (e) {
            console.warn(e);
        }

        // Activity Log
        try {
            const rawLogs = localStorage.getItem('eicActivityLogs_v1');
            let logs = rawLogs ? JSON.parse(rawLogs) : [];
            if (!Array.isArray(logs)) logs = [];
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            logs.unshift({
                id: 'eic-act-' + Date.now(),
                causer: approverName,
                causerRole: window.LARAVEL_USER_ROLE || 'Editor-in-Chief',
                action: 'approved',
                subjectType: `${getItemType(target).toUpperCase()} Artwork`,
                subjectName: target.title || `${getItemType(target).toUpperCase()} Asset`,
                timestampText: 'Just now',
                isoDate: now.toISOString(),
                formattedDate: `${dateStr} • ${timeStr}`,
                dayGroup: 'Today'
            });
            localStorage.setItem('eicActivityLogs_v1', JSON.stringify(logs.slice(0, 40)));
        } catch (e) {}

        // Backend sync if running on Laravel
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (csrfToken && target.id) {
                fetch(`/eic/media/${target.id}/approve`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json'
                    }
                }).catch(err => console.warn('Backend EIC approve sync failed:', err));
            }
        } catch (e) {}

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

        showToast('Artwork approved by EIC and returned to M&PC for posting.', 'success');
    }

    // =========================================================================
    // 10. GRID DELEGATED EVENT LISTENERS
    // =========================================================================
    if (cardsGrid) {
        cardsGrid.addEventListener('click', (e) => {
            // Inspect click
            const inspectTrigger = e.target.closest('[data-action="inspect"]');
            if (inspectTrigger) {
                const id = inspectTrigger.getAttribute('data-id');
                if (id) openInspectModal(id);
                return;
            }

            // Return click
            const returnBtn = e.target.closest('[data-action="return"]');
            if (returnBtn) {
                const id = returnBtn.getAttribute('data-id');
                if (id) openReturnModal(id);
                return;
            }

            // Approve click
            const approveBtn = e.target.closest('[data-action="approve"]');
            if (approveBtn) {
                const id = approveBtn.getAttribute('data-id');
                if (id) handleApprove(id);
                return;
            }
        });
    }

    // Initial render
    renderCards();
});

