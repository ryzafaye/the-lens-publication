/**
 * ============================================================================
 * THE LENS — CARTOON DESK CONTROLLER (CARTOONIST HEAD PORTAL)
 * Matches M&PC Media Desk design & formatting without tabs (pending approval only).
 * 
 * Workflow:
 *  1. Staff Cartoonist submits artwork ('Pending with Head')
 *  2. Cartoonist Head reviews in Cartoon Desk
 *  3. Actions:
 *     - "Endorse to EIC" -> Forwards artwork to Editor-in-Chief for checking
 *     - "Return to Cartoonist" -> Requires mandatory visual revision feedback
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const STORAGE_KEY = 'cartoonistSubmissions_v1';
    const ACTIVITY_KEY = 'cartoonistHeadActivityLogs_v1';

    // Auth & Role check
    const userRole = localStorage.getItem('cartoonistHeadRole') || localStorage.getItem('userRole');
    if (!userRole) {
        window.location.href = 'login.html';
        return;
    }

    const currentHeadName = localStorage.getItem('cartoonistHeadName') || 'Danilo Reyes';

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Default Seed Cartoons (Empty by default for clean workflow testing)
    const defaultSeedCartoons = [];

    // Read stored cartoons
    let cartoons = [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                cartoons = parsed;
            }
        }
    } catch (e) {
        console.warn('Could not read stored cartoons', e);
    }

    function saveCartoons() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cartoons));
        } catch (e) {
            console.error('Failed to save cartoons to localStorage', e);
        }
    }

    function logActivity(action, subjectType, subjectName) {
        try {
            const rawLogs = localStorage.getItem(ACTIVITY_KEY);
            let logs = rawLogs ? JSON.parse(rawLogs) : [];
            if (!Array.isArray(logs)) logs = [];

            const newLog = {
                id: 'c-act-' + Date.now(),
                causer: currentHeadName,
                causerRole: 'Cartoonist Head',
                causerAvatar: 'images/member-placeholder.svg',
                action: action,
                subjectType: subjectType,
                subjectName: subjectName,
                timestampText: 'Just now',
                formattedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                timestamp: Date.now()
            };

            logs.unshift(newLog);
            localStorage.setItem(ACTIVITY_KEY, JSON.stringify(logs));
        } catch (e) {
            console.warn('Failed to log activity', e);
        }
    }

    // -------------------------------------------------------------------------
    // DOM Elements
    // -------------------------------------------------------------------------
    const cardsGrid = document.getElementById('cover-cards-grid');
    const emptyState = document.getElementById('cover-empty-state');
    const sortSelect = document.getElementById('cover-sort-select');

    // Inspection Modal Elements
    const inspectModal = document.getElementById('cover-inspect-modal');
    const inspectImage = document.getElementById('inspect-image');
    const inspectArtist = document.getElementById('inspect-artist');
    const inspectTitle = document.getElementById('inspect-title');
    const inspectTypeTag = document.getElementById('inspect-type-tag');
    const closeInspectBtn = document.getElementById('close-inspect-btn');
    const inspectReturnBtn = document.getElementById('inspect-return-btn');
    const inspectApproveBtn = document.getElementById('inspect-approve-btn');

    // Return Remarks Modal Elements
    const returnModal = document.getElementById('return-remarks-modal');
    const returnHeadName = document.getElementById('return-head-name');
    const returnRemarksText = document.getElementById('return-remarks-text');
    const returnRemarksError = document.getElementById('return-remarks-error');
    const closeReturnModalBtn = document.getElementById('close-return-modal-btn');
    const cancelReturnBtn = document.getElementById('cancel-return-btn');
    const confirmReturnBtn = document.getElementById('confirm-return-btn');

    let activeInspectionId = null;
    let activeReturnId = null;

    // -------------------------------------------------------------------------
    // Toast Notification System
    // -------------------------------------------------------------------------
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type} animate-fade-in`;
        toast.innerHTML = `
            <i class="fa-solid fa-${type === 'success' ? 'circle-check' : 'circle-exclamation'}"></i>
            <span>${escapeHTML(message)}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(8px)';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    // -------------------------------------------------------------------------
    // Render Pending Cards (M&PC Media Desk Format without tabs)
    // -------------------------------------------------------------------------
    function renderCards() {
        if (!cardsGrid) return;

        // Strictly filter cartoons awaiting Cartoonist Head approval
        const pendingCartoons = cartoons.filter(c => {
            const s = (c.status || '').toLowerCase();
            return s.includes('pending') || s === 'pending with head';
        });

        // Apply Sorting
        const sortVal = sortSelect ? sortSelect.value : 'newest';
        pendingCartoons.sort((a, b) => {
            const dateA = new Date(a.rawDate || a.date || 0);
            const dateB = new Date(b.rawDate || b.date || 0);
            return sortVal === 'newest' ? (dateB - dateA) : (dateA - dateB);
        });

        if (pendingCartoons.length === 0) {
            cardsGrid.innerHTML = '';
            cardsGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        cardsGrid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';

        cardsGrid.innerHTML = pendingCartoons.map(item => `
            <div class="cover-card" id="card-${item.id}" data-id="${item.id}">
                
                <!-- Clickable Artwork Thumbnail with Inspect Overlay & Upper-Left Status -->
                <div class="cover-thumb-container" data-action="inspect" data-id="${item.id}" title="Click to view artwork full size">
                    <img 
                        src="${escapeHTML(item.image || 'images/covers/press-freedom-cartoon.svg')}" 
                        alt="${escapeHTML(item.title)}" 
                        class="cover-thumb-img" 
                        loading="lazy" 
                        onerror="this.src='images/covers/press-freedom-cartoon.svg';"
                    >
                    
                    <div class="cover-thumb-overlay">
                        <i class="fa-solid fa-magnifying-glass-plus"></i>
                        <span>Inspect Artwork</span>
                    </div>

                    <!-- Status pinned in Upper-Left of the Picture -->
                    <div class="cover-thumb-badge-group">
                        <span class="cover-status-tag pending">
                            <i class="fa-regular fa-clock"></i> ${escapeHTML(item.status || 'Pending with Head')}
                        </span>
                    </div>

                    <span class="cover-thumb-date">
                        <i class="fa-regular fa-calendar"></i>
                        <span>${escapeHTML(item.date || 'Recent')}</span>
                    </span>
                </div>

                <!-- Card Body: Provenance Box matching M&PC Media Desk -->
                <div class="cover-card-body">
                    <div class="cover-provenance-box">
                        <div class="cover-artist-row">
                            <i class="fa-solid fa-palette"></i>
                            <span>Cartoonist: <strong>${escapeHTML(item.artist || 'Staff Cartoonist')}</strong></span>
                        </div>
                        <div class="cover-head-row">
                            <i class="fa-solid fa-pen-nib"></i>
                            <span>Title: <strong>${escapeHTML(item.title)}</strong></span>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions: Return to Cartoonist & Endorse to EIC -->
                <div class="cover-card-footer">
                    <button type="button" class="btn-cover-return" data-action="return" data-id="${item.id}" title="Return to Cartoonist for visual revisions">
                        <i class="fa-solid fa-rotate-left"></i>
                        <span>Return to Cartoonist</span>
                    </button>
                    <button type="button" class="btn-cover-approve" data-action="approve" data-id="${item.id}" title="Endorse to Editor-in-Chief for checking">
                        <i class="fa-solid fa-check"></i>
                        <span>Endorse to EIC</span>
                    </button>
                </div>

            </div>
        `).join('');
    }

    // -------------------------------------------------------------------------
    // Event Delegation for Grid Card Buttons
    // -------------------------------------------------------------------------
    if (cardsGrid) {
        cardsGrid.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('[data-action]');
            if (!targetBtn) return;

            const action = targetBtn.dataset.action;
            const id = targetBtn.dataset.id;
            if (!id) return;

            if (action === 'inspect') {
                openInspectModal(id);
            } else if (action === 'approve') {
                handleApprove(id);
            } else if (action === 'return') {
                openReturnModal(id);
            }
        });
    }

    // -------------------------------------------------------------------------
    // Theater Artwork Inspection Modal Logic
    // -------------------------------------------------------------------------
    function openInspectModal(id) {
        const item = cartoons.find(c => c.id === id);
        if (!item || !inspectModal) return;

        activeInspectionId = id;

        if (inspectImage) {
            inspectImage.src = item.image || 'images/covers/press-freedom-cartoon.svg';
            inspectImage.alt = item.title;
        }
        if (inspectArtist) inspectArtist.textContent = item.artist || 'Staff Cartoonist';
        if (inspectTitle) inspectTitle.textContent = item.title;
        if (inspectTypeTag) inspectTypeTag.textContent = (item.type || 'CARTOON').toUpperCase();

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

    if (inspectReturnBtn) {
        inspectReturnBtn.addEventListener('click', () => {
            const id = activeInspectionId;
            closeInspectModal();
            if (id) openReturnModal(id);
        });
    }

    if (inspectApproveBtn) {
        inspectApproveBtn.addEventListener('click', () => {
            const id = activeInspectionId;
            closeInspectModal();
            if (id) handleApprove(id);
        });
    }

    // -------------------------------------------------------------------------
    // Approve & Endorse to EIC Logic
    // -------------------------------------------------------------------------
    function handleApprove(id) {
        const item = cartoons.find(c => c.id === id);
        if (!item) return;

        item.status = 'Forwarded to EIC';
        item.endorsedBy = currentHeadName;
        item.endorsedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        saveCartoons();
        logActivity('endorsed', 'Editorial Cartoon to EIC', item.title);

        // Also push approved artwork to mpc_approved_covers_v1 and articleCoverReviewQueue_v1
        try {
            let covers = [];
            const rawCovers = localStorage.getItem('mpc_approved_covers_v1');
            if (rawCovers) {
                const parsed = JSON.parse(rawCovers);
                if (Array.isArray(parsed)) covers = parsed;
            }
            covers = covers.filter(c => c.id !== item.id);
            covers.unshift({
                id: item.id,
                type: 'cartoon',
                artist: item.artist || 'Staff Cartoonist',
                approvedBy: `${currentHeadName} (Cartoonist Head)`,
                image: item.image,
                date: item.endorsedDate || item.date || 'Recent'
            });
            localStorage.setItem('mpc_approved_covers_v1', JSON.stringify(covers));
        } catch (e) {}

        try {
            let queue = [];
            const rawQ = localStorage.getItem('articleCoverReviewQueue_v1');
            if (rawQ) {
                const parsedQ = JSON.parse(rawQ);
                if (Array.isArray(parsedQ)) queue = parsedQ;
            }
            const existingIdx = queue.findIndex(q => q.id === item.id);
            if (existingIdx !== -1) {
                queue[existingIdx] = {
                    ...queue[existingIdx],
                    status: 'approved_for_mpc',
                    approvedBy: `${currentHeadName} (Cartoonist Head)`
                };
            } else {
                queue.unshift({
                    id: item.id,
                    type: 'cartoon',
                    title: item.title,
                    category: item.category || 'Opinion',
                    artist: item.artist || 'Staff Cartoonist',
                    approvedBy: `${currentHeadName} (Cartoonist Head)`,
                    image: item.image,
                    date: item.endorsedDate || item.date || 'Recent',
                    status: 'approved_for_mpc',
                    remarks: ''
                });
            }
            localStorage.setItem('articleCoverReviewQueue_v1', JSON.stringify(queue));
        } catch (e) {}

        showToast(`"${item.title}" successfully endorsed to Editor-in-Chief.`, 'success');
        renderCards();
    }

    // -------------------------------------------------------------------------
    // Mandatory Return Revision Modal Logic
    // -------------------------------------------------------------------------
    function openReturnModal(id) {
        const item = cartoons.find(c => c.id === id);
        if (!item || !returnModal) return;

        activeReturnId = id;

        if (returnHeadName) {
            returnHeadName.textContent = item.artist ? `${item.artist} (Staff Cartoonist)` : 'Staff Cartoonist';
        }
        if (returnRemarksText) {
            returnRemarksText.value = '';
            returnRemarksText.classList.remove('input-invalid');
        }
        if (returnRemarksError) returnRemarksError.classList.add('hidden');

        returnModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            if (returnRemarksText) returnRemarksText.focus();
        }, 120);
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

            const item = cartoons.find(c => c.id === activeReturnId);
            if (item) {
                item.status = 'Returned for Revision';
                item.remarks = remarks;

                saveCartoons();
                logActivity('returned', 'Cartoon for Revision', item.title);

                // Sync status to articleCoverReviewQueue_v1
                try {
                    const rawQ = localStorage.getItem('articleCoverReviewQueue_v1');
                    if (rawQ) {
                        let queue = JSON.parse(rawQ);
                        if (Array.isArray(queue)) {
                            queue = queue.map(q => {
                                if (q.id === item.id) {
                                    return { ...q, status: 'needs_revision', remarks: remarks };
                                }
                                return q;
                            });
                            localStorage.setItem('articleCoverReviewQueue_v1', JSON.stringify(queue));
                        }
                    }
                } catch (e) {}

                showToast(`"${item.title}" returned to ${item.artist} with revision remarks.`, 'success');
                closeReturnModal();
                renderCards();
            }
        });
    }

    // Remove validation error on user typing
    if (returnRemarksText) {
        returnRemarksText.addEventListener('input', () => {
            if (returnRemarksText.value.trim()) {
                returnRemarksText.classList.remove('input-invalid');
                if (returnRemarksError) returnRemarksError.classList.add('hidden');
            }
        });
    }

    // -------------------------------------------------------------------------
    // Sort Select Listener
    // -------------------------------------------------------------------------
    if (sortSelect) {
        sortSelect.addEventListener('change', renderCards);
    }

    // -------------------------------------------------------------------------
    // Global Escape Key Listener
    // -------------------------------------------------------------------------
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeInspectModal();
            closeReturnModal();
        }
    });

    // Initial Render
    renderCards();

});
