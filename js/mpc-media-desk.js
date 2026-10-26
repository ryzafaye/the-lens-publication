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

    // =========================================================================
    // 1. DEFAULT DATASET (Publication Materials & Cartoons)
    // =========================================================================
    const defaultCoverQueue = [];

    // =========================================================================
    // 2. PERSISTENCE (LocalStorage sync across Exec, EIC, & M&PC)
    // =========================================================================
    const STORAGE_KEY = 'articleCoverReviewQueue_v1';

    function getCoverQueue() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.warn('Could not read cover review queue from localStorage', e);
        }
        return [];
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
    let currentTab = 'pubmat';
    let currentSort = 'newest';
    let activeInspectionId = null;
    let activeReturnId = null;

    const cardsGrid = document.getElementById('cover-cards-grid');
    const emptyState = document.getElementById('cover-empty-state');
    const badgePubmat = document.getElementById('badge-cover-pubmat');
    const badgePhoto = document.getElementById('badge-cover-photo');
    const badgeCartoon = document.getElementById('badge-cover-cartoon');
    const badgeLibrary = document.getElementById('badge-cover-library');
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
    const returnModal = document.getElementById('return-remarks-modal');
    const closeReturnModalBtn = document.getElementById('close-return-modal-btn');
    const cancelReturnBtn = document.getElementById('cancel-return-btn');
    const confirmReturnBtn = document.getElementById('confirm-return-btn');
    const returnHeadName = document.getElementById('return-head-name');
    const returnRemarksText = document.getElementById('return-remarks-text');
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
        return s === 'pending' || s === 'pending with head' || s === 'submitted_to_mpc' || s === 'under-review';
    }

    function updateBadges() {
        const pubmatCount = coverList.filter(item => item.type === 'pubmat' && isItemPending(item)).length;
        const photoCount = coverList.filter(item => item.type === 'photo' && isItemPending(item)).length;
        const cartoonCount = coverList.filter(item => item.type === 'cartoon' && isItemPending(item)).length;
        const libraryCount = coverList.filter(item => item.status === 'approved_for_mpc' || item.status === 'approved').length;

        if (badgePubmat) badgePubmat.textContent = pubmatCount;
        if (badgePhoto) badgePhoto.textContent = photoCount;
        if (badgeCartoon) badgeCartoon.textContent = cartoonCount;
        if (badgeLibrary) badgeLibrary.textContent = libraryCount;
    }

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

    // =========================================================================
    // 5. SORTING & FILTERING
    // =========================================================================
    function getFilteredList() {
        let filtered = [];
        if (currentTab === 'library') {
            filtered = coverList.filter(item => item.status === 'approved_for_mpc' || item.status === 'approved');
        } else {
            filtered = coverList.filter(item => item.type === currentTab && isItemPending(item));
        }

        return filtered.sort((a, b) => {
            const timeA = new Date(a.rawDate || a.date).getTime();
            const timeB = new Date(b.rawDate || b.date).getTime();
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
                const emptyTitle = emptyState.querySelector('h3');
                const emptyDesc = emptyState.querySelector('p');
                if (emptyTitle) {
                    if (currentTab === 'pubmat') {
                        emptyTitle.textContent = 'All Caught Up on PUBMAT Reviews';
                    } else if (currentTab === 'photo') {
                        emptyTitle.textContent = 'All Caught Up on Photojournalism Captures';
                    } else if (currentTab === 'cartoon') {
                        emptyTitle.textContent = 'All Caught Up on Editorial Cartoons';
                    } else {
                        emptyTitle.textContent = 'Media Library is Empty';
                    }
                }
                if (emptyDesc) {
                    if (currentTab === 'pubmat') {
                        emptyDesc.textContent = 'No publication materials are currently pending review.';
                    } else if (currentTab === 'photo') {
                        emptyDesc.textContent = 'No photojournalist captures are currently pending review.';
                    } else if (currentTab === 'cartoon') {
                        emptyDesc.textContent = 'No editorial cartoons are currently pending review.';
                    } else {
                        emptyDesc.textContent = 'No media assets have been approved for the library yet.';
                    }
                }
            }
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        cardsGrid.innerHTML = filtered.map(item => {
            const isApproved = (item.status === 'approved_for_mpc' || item.status === 'approved');

            return `
            <div class="cover-card" id="card-${item.id}" data-id="${item.id}">
                <!-- Clickable Artwork Thumbnail (Click to Inspect) -->
                <div class="cover-thumb-container" data-action="inspect" data-id="${item.id}" title="Click to view artwork full size">
                    <img src="${escapeHTML(item.image)}" alt="Artwork Preview" class="cover-thumb-img" loading="lazy">
                    
                    <div class="cover-thumb-overlay">
                        <i class="fa-solid fa-magnifying-glass-plus"></i>
                        <span>Inspect Artwork</span>
                    </div>

                    <div class="cover-thumb-badge-group">
                        <span class="cover-type-tag ${item.type}">${escapeHTML(item.type.toUpperCase())}</span>
                        ${isApproved ? '<span class="cover-status-tag approved"><i class="fa-solid fa-circle-check"></i> APPROVED</span>' : ''}
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
                            <i class="fa-solid fa-${item.type === 'photo' ? 'camera' : (item.type === 'cartoon' ? 'pen-nib' : 'paintbrush')}"></i>
                            <span>${item.type === 'photo' ? 'Photojournalist' : 'Artist'}: <strong>${escapeHTML(cleanArtistName(item.artist))}</strong></span>
                        </div>
                        <div class="cover-head-row">
                            <i class="fa-solid fa-circle-check"></i>
                            <span>Approved by: <strong>${escapeHTML(item.approvedBy)}</strong></span>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                ${isApproved ? `
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
                    <button type="button" class="btn-cover-return" data-action="return" data-id="${item.id}" title="Return to Head for revisions">
                        <i class="fa-solid fa-rotate-left"></i>
                        <span>Return to Head</span>
                    </button>
                    <button type="button" class="btn-cover-approve" data-action="approve" data-id="${item.id}" title="Approve for Library">
                        <i class="fa-solid fa-check"></i>
                        <span>Approve for Library</span>
                    </button>
                </div>
                `}
            </div>
            `;
        }).join('');
    }

    // =========================================================================
    // 7. INSPECTION MODAL (Theater Mode)
    // =========================================================================
    function openInspectModal(id) {
        const item = coverList.find(c => c.id === id);
        if (!item || !inspectModal) return;

        activeInspectionId = id;

        if (inspectArtist) inspectArtist.textContent = cleanArtistName(item.artist);
        if (inspectHead) inspectHead.textContent = item.approvedBy;
        if (inspectImage) {
            inspectImage.src = item.image;
            inspectImage.alt = `${item.type.toUpperCase()} by ${cleanArtistName(item.artist)}`;
        }

        if (inspectTypeTag) {
            inspectTypeTag.className = `cover-type-tag ${item.type}`;
            inspectTypeTag.textContent = item.type.toUpperCase();
        }

        const isApproved = (item.status === 'approved_for_mpc' || item.status === 'approved');
        const footerBtnGroup = document.querySelector('.inspect-footer-buttons');
        if (footerBtnGroup) {
            if (isApproved) {
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
                        <span>Return to Head</span>
                    </button>
                    <button type="button" id="inspect-approve-btn" class="btn-inspect-approve">
                        <i class="fa-solid fa-check"></i>
                        <span>Approve for Library</span>
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
        const item = coverList.find(c => c.id === id);
        if (!item || !returnModal) return;

        activeReturnId = id;

        if (returnHeadName) returnHeadName.textContent = item.approvedBy || 'Section Head';
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

            const itemIndex = coverList.findIndex(c => c.id === activeReturnId);
            if (itemIndex > -1) {
                const target = coverList[itemIndex];
                target.status = 'returned_for_revision';
                target.remarks = remarks;

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
                        causer: cleanArtistName(localStorage.getItem('mpcName') || ((localStorage.getItem('mpcRole') || '').includes('Assoc') ? 'Samantha Cruz' : 'Julian Del Rosario')),
                        causerRole: localStorage.getItem('mpcRole') || ((localStorage.getItem('userRole') || '').includes('Assoc') ? 'Assoc M&PC Head' : 'M&PC Head'),
                        causerAvatar: 'images/member-placeholder.svg',
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

                saveCoverQueue(coverList);

                closeReturnModal();
                renderCards();
                showToast(`Artwork returned to ${target.approvedBy} with revision remarks.`);
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
        const itemIndex = coverList.findIndex(c => c.id === id);
        if (itemIndex === -1) return;

        const target = coverList[itemIndex];
        target.status = 'approved_for_mpc';

        // Add to Approved Pool and Sync with Publish Article Covers
        try {
            const rawPool = localStorage.getItem('mpcApprovedCoversPool_v1');
            let pool = rawPool ? JSON.parse(rawPool) : [];
            if (!Array.isArray(pool)) pool = [];
            
            const existingIdx = pool.findIndex(p => p.id === target.id);
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
                if (!mpcCovers.some(c => c.id === target.id)) {
                    mpcCovers.unshift(target);
                    localStorage.setItem('mpc_approved_covers_v1', JSON.stringify(mpcCovers));
                }
            }
        } catch (e) {
            console.warn(e);
        }

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
                causer: cleanArtistName(localStorage.getItem('mpcName') || ((localStorage.getItem('mpcRole') || '').includes('Assoc') ? 'Samantha Cruz' : 'Julian Del Rosario')),
                causerRole: localStorage.getItem('mpcRole') || ((localStorage.getItem('userRole') || '').includes('Assoc') ? 'Assoc M&PC Head' : 'M&PC Head'),
                causerAvatar: 'images/member-placeholder.svg',
                action: 'approved',
                subjectType: `${target.type.toUpperCase()} Artwork`,
                subjectName: target.title || `${target.type.toUpperCase()} Asset`,
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

        showToast(`${target.type.toUpperCase()} approved and added to Media Library.`, 'success');
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

