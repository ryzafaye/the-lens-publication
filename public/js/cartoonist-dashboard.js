/**
 * ============================================================================
 * THE LENS — CARTOONIST DASHBOARD CONTROLLER
 * Dynamic Analytics, Recent Cartoon Submissions & Graphic Inspector
 * 
 * Official Cartoon Statuses:
 *   - 'Pending with Head'
 *   - 'Returned for Revision'
 *   - 'EIC Approved'
 *   - 'Published'
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // User & Role Resolution (Hydrated from dynamic Auth or localStorage fallback)
    const storedName = window.LARAVEL_USER_NAME || localStorage.getItem('cartoonistName') || localStorage.getItem('userName') || 'Cartoonist';
    const userRole = window.LARAVEL_USER_ROLE || localStorage.getItem('cartoonistHeadRole') || localStorage.getItem('cartoonistRole') || localStorage.getItem('userRole') || 'Cartoonist';
    const isSectionHead = ['Cartoonist Head', 'Associate Cartoonist Head', 'Chief Cartoonist'].includes(userRole);

    const firstName = storedName.split(' ')[0] || 'Cartoonist';
    const cartoonistNameEl = document.getElementById('cartoonist-name-display');
    if (cartoonistNameEl) cartoonistNameEl.textContent = firstName;

    // Update section title and manage link for Section Head
    const sectionTitleEl = document.getElementById('dashboard-cartoons-section-title');
    if (sectionTitleEl) {
        sectionTitleEl.textContent = isSectionHead ? 'Pending Approval' : 'My Recent Cartoons';
    }
    const manageLinkEl = document.getElementById('dashboard-manage-cartoons-link');
    if (manageLinkEl && isSectionHead) {
        manageLinkEl.href = window.CARTOONIST_DESK_ROUTE || '/cartoonist/cartoon-desk';
    }

    // 2. DOM Elements
    const statCartoonsPublished = document.getElementById('stat-cartoons-published');
    const statPendingApprovals = document.getElementById('stat-pending-approvals');
    const statCartoonsLibrary = document.getElementById('stat-cartoons-library');

    const cartoonRecentGrid = document.getElementById('cartoon-recent-grid');

    // Inspect Modal Elements (Cartoon Desk Parity with fallback)
    const inspectModal = document.getElementById('cover-inspect-modal') || document.getElementById('cartoon-inspect-modal');
    const modalImg = document.getElementById('inspect-image') || document.getElementById('modal-inspect-img');
    const modalCategory = document.getElementById('modal-inspect-category');
    const modalStatus = document.getElementById('modal-inspect-status');
    const modalDate = document.getElementById('modal-inspect-date');
    const modalRemarksBox = document.getElementById('modal-inspect-remarks-box');
    const modalRemarksText = document.getElementById('modal-inspect-remarks-text');
    const closeInspectModalBtn = document.getElementById('close-inspect-btn') || document.getElementById('close-inspect-modal-btn');

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
        if (num >= 1000) return Number(num).toLocaleString('en-US');
        return String(num || 0);
    }

    // =========================================================================
    // 3. LOAD DATA & CALCULATE METRICS (Backend Data Transition)
    // Controller hydration via window.INITIAL_DATA / window.INITIAL_CARTOONS
    // with graceful fallback to localStorage for backward compatibility
    // =========================================================================
    const cartoonList = (typeof getCartoonSubmissions === 'function')
        ? getCartoonSubmissions(true)
        : ((window.INITIAL_CARTOONS && Array.isArray(window.INITIAL_CARTOONS) && window.INITIAL_CARTOONS.length > 0)
            ? window.INITIAL_CARTOONS
            : ((window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA) && window.INITIAL_DATA.length > 0)
                ? window.INITIAL_DATA
                : (() => {
                    try {
                        const raw = localStorage.getItem('cartoonistSubmissions_v1');
                        return raw ? JSON.parse(raw) : [];
                    } catch (e) {
                        return [];
                    }
                })()));

    // Load display dataset according to role:
    // Cartoonist Head: shows all pending approval cartoons
    // Staff Cartoonist: shows user's own recent submissions
    let displayList = [];
    let pendingCount = 0;

    if (isSectionHead) {
        const allCartoons = (typeof getAllRawCartoonSubmissions === 'function')
            ? getAllRawCartoonSubmissions()
            : [];
        displayList = allCartoons.filter(c => {
            const s = (c.status || '').toLowerCase();
            return (s.includes('pending') && !s.includes('eic')) || s === 'pending with head' || s === 'submitted_to_mpc';
        });
        pendingCount = displayList.length;
    } else {
        displayList = cartoonList;
        pendingCount = cartoonList.filter(m => {
            const s = (m.status || '').toLowerCase();
            return s.includes('pending') || s.includes('forwarded') || s.includes('submitted');
        }).length;
    }

    // Metric Counters:
    const publishedCount = (typeof getAllRawCartoonSubmissions === 'function' ? getAllRawCartoonSubmissions() : cartoonList)
        .filter(m => (m.status || '').toLowerCase() === 'published').length;
    const libraryCount = (typeof getAllRawCartoonSubmissions === 'function' ? getAllRawCartoonSubmissions() : cartoonList)
        .filter(m => {
            const s = (m.status || '').toLowerCase();
            return s === 'published' || s === 'eic approved' || s === 'approved' || s === 'approved_for_mpc';
        }).length;

    if (statCartoonsPublished) statCartoonsPublished.textContent = formatNumber(publishedCount);
    if (statPendingApprovals) statPendingApprovals.textContent = formatNumber(pendingCount);
    if (statCartoonsLibrary) statCartoonsLibrary.textContent = formatNumber(libraryCount);

    // =========================================================================
    // 4. STATUS RESOLUTION HELPER
    // =========================================================================
    function getStatusConfig(status) {
        switch (status) {
            case 'Published':
                return {
                    cssClass: 'published',
                    label: 'Published',
                    icon: '<i class="fa-solid fa-globe"></i>'
                };
            case 'EIC Approved':
                return {
                    cssClass: 'eic-approved',
                    label: 'EIC Approved',
                    icon: '<i class="fa-solid fa-shield-halved"></i>'
                };
            case 'Pending EIC Review':
            case 'Forwarded to EIC':
                return {
                    cssClass: 'pending-eic-review',
                    label: 'Pending EIC Review',
                    icon: '<i class="fa-solid fa-clock"></i>'
                };
            case 'Returned for Revision':
                return {
                    cssClass: 'returned-for-revision',
                    label: 'Returned for Revision',
                    icon: '<i class="fa-solid fa-triangle-exclamation"></i>'
                };
            case 'Pending with Head':
            default:
                return {
                    cssClass: 'pending-with-head',
                    label: 'Pending with Head',
                    icon: '<i class="fa-regular fa-clock"></i>'
                };
        }
    }

    // Return Remarks Modal Elements
    const returnModal = document.getElementById('return-remarks-modal');
    const returnHeadName = document.getElementById('return-head-name');
    const returnRemarksText = document.getElementById('return-remarks-text');
    const returnRemarksError = document.getElementById('return-remarks-error');
    const closeReturnModalBtn = document.getElementById('close-return-modal-btn');
    const cancelReturnBtn = document.getElementById('cancel-return-btn');
    const confirmReturnBtn = document.getElementById('confirm-return-btn');

    const inspectReturnBtn = document.getElementById('inspect-return-btn');
    const inspectApproveBtn = document.getElementById('inspect-approve-btn');

    const ACTIVITY_KEY = 'cartoonistHeadActivityLogs_v1';
    const currentHeadName = window.LARAVEL_USER_NAME || localStorage.getItem('cartoonistHeadName') || storedName || 'Danilo Reyes';

    let activeInspectionItem = null;
    let activeReturnId = null;

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

    // =========================================================================
    // 5. RENDER RECENT CARTOONS / PENDING APPROVAL
    // =========================================================================
    function renderRecentCartoons() {
        if (!cartoonRecentGrid) return;

        if (displayList.length === 0) {
            cartoonRecentGrid.innerHTML = `
                <div class="media-empty-state" style="grid-column: 1 / -1;">
                    <i class="fa-solid fa-palette"></i>
                    <h3>${isSectionHead ? 'No Cartoons Pending Approval' : 'No Cartoons Found'}</h3>
                    <p>${isSectionHead ? 'All caught up on editorial cartoon reviews.' : 'You have not submitted any editorial cartoons yet.'}</p>
                </div>
            `;
            return;
        }

        // Show top 4 items
        const recents = displayList.slice(0, 4);

        cartoonRecentGrid.innerHTML = recents.map(item => {
            const statusCfg = getStatusConfig(item.status);
            const safeImage = (item.image && !item.image.includes('maroon.jpg'))
                ? item.image
                : 'images/covers/faculty-overload-cartoon.svg';

            if (isSectionHead) {
                return `
                    <div class="cover-card" id="card-${item.id}" data-id="${item.id}">
                        <!-- Clickable Artwork Thumbnail with Full Pic Display and Inspect Overlay -->
                        <div class="cover-thumb-container" data-action="inspect" data-id="${item.id}" title="Click to view artwork full size">
                            <img 
                                src="${escapeHTML(safeImage)}" 
                                alt="${escapeHTML(item.title || 'Cartoon Artwork')}" 
                                class="cover-thumb-img" 
                                loading="lazy" 
                                onerror="this.src='images/covers/faculty-overload-cartoon.svg';"
                            >
                            
                            <div class="cover-thumb-overlay">
                                <i class="fa-solid fa-magnifying-glass-plus"></i>
                                <span>Inspect Artwork</span>
                            </div>

                            <!-- Type Tag on Top-Left of the Picture -->
                            <div class="cover-thumb-badge-group" style="position: absolute; top: 10px; left: 10px; z-index: 2;">
                                <span class="cover-type-tag cartoon" style="font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.04em; background: rgba(15, 23, 42, 0.90); color: #f472b6; border: 1px solid rgba(244, 114, 182, 0.3); display: inline-flex; align-items: center; gap: 4px;">
                                    <i class="fa-solid fa-palette"></i> CARTOON
                                </span>
                            </div>

                            <!-- Status pinned on Top-Right of the Picture (Pending Approval) -->
                            <div class="cover-thumb-status-badge" style="position: absolute; top: 10px; right: 10px; z-index: 2;">
                                <span class="cover-status-tag pending" style="background: #ffedd5; color: #c2410c; border: 1px solid #fed7aa; font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; letter-spacing: 0.04em; text-transform: uppercase;">
                                    <i class="fa-regular fa-clock" style="color: #c2410c;"></i> PENDING APPROVAL
                                </span>
                            </div>

                        </div>

                        <!-- Below the pic: Date, Icon then Name only (No file name, no size) -->
                        <div class="cover-card-body" style="padding: 14px 16px;">
                            <div class="media-card-meta" style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #64748b; margin: 0;">
                                <span><i class="fa-regular fa-calendar"></i> ${escapeHTML(item.date || 'Recent')}</span>
                                <span>&bull;</span>
                                <span><i class="fa-solid fa-palette"></i> <strong>${escapeHTML(item.artist || 'Staff Cartoonist')}</strong></span>
                            </div>
                        </div>

                        <!-- Footer Actions: Balanced Padding (Not too long and short) -->
                        <div class="cover-card-footer" style="padding: 12px 16px; display: flex; align-items: center; gap: 8px;">
                            <button type="button" class="btn-cover-return" data-action="return" data-id="${item.id}" title="Return to Cartoonist for visual revisions" style="flex: 1; padding: 7px 12px; font-size: 0.80rem; font-weight: 600; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap;">
                                <i class="fa-solid fa-rotate-left"></i>
                                <span>Return for Revision</span>
                            </button>
                            <button type="button" class="btn-cover-approve" data-action="approve" data-id="${item.id}" title="Endorse to Editor-in-Chief for checking" style="flex: 1; padding: 7px 14px; font-size: 0.80rem; font-weight: 600; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap; background: var(--sidebar-maroon, #5c0a18); border-color: var(--sidebar-maroon, #5c0a18); color: #ffffff;">
                                <i class="fa-solid fa-check"></i>
                                <span>Endorse to EIC</span>
                            </button>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="manage-media-card" data-id="${item.id}">
                    <div class="media-card-preview-box" data-action="inspect" data-id="${item.id}" style="cursor: pointer;" title="Click to inspect artwork">
                        <img 
                            src="${escapeHTML(safeImage)}" 
                            alt="${escapeHTML(item.title)}" 
                            class="media-card-img" 
                            onerror="this.onerror=null; this.src='images/covers/faculty-overload-cartoon.svg'"
                        >
                        <div class="media-card-badge-layer" style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; padding: 10px;">
                            <span class="cover-type-tag cartoon" style="font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.04em; background: rgba(15, 23, 42, 0.90); color: #f472b6; border: 1px solid rgba(244, 114, 182, 0.3); display: inline-flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-palette"></i> CARTOON
                            </span>
                            <span class="media-status-pill ${statusCfg.cssClass}">
                                ${statusCfg.icon} ${statusCfg.label}
                            </span>
                        </div>
                    </div>

                    <!-- Below the pic: Date, Icon then Name only (No file name, no size) -->
                    <div class="media-card-body" style="padding: 14px 16px;">
                        <div class="media-card-meta" style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #64748b; margin-bottom: 12px;">
                            <span><i class="fa-regular fa-calendar"></i> ${escapeHTML(item.date || 'Recent')}</span>
                            <span>&bull;</span>
                            <span><i class="fa-solid fa-palette"></i> <strong>${escapeHTML(item.artist || storedName)}</strong></span>
                        </div>

                        <div class="media-card-actions" style="margin-top: 10px; display: flex; align-items: center; justify-content: flex-end;">
                            <button type="button" class="btn-media-inspect" data-action="inspect" data-id="${item.id}" style="width: auto; padding: 6px 14px;">
                                <i class="fa-regular fa-eye"></i>
                                <span>Inspect Cartoon</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach event delegation for all card action buttons and preview box inspect
        cartoonRecentGrid.querySelectorAll('[data-action]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = el.getAttribute('data-action');
                const id = el.getAttribute('data-id');
                if (!id) return;

                if (action === 'inspect') {
                    const found = displayList.find(c => String(c.id) === String(id)) || cartoonList.find(c => String(c.id) === String(id));
                    if (found) openInspectModal(found);
                } else if (action === 'approve') {
                    handleApprove(id);
                } else if (action === 'return') {
                    openReturnModal(id);
                }
            });
        });
    }

    // =========================================================================
    // 6. DASHBOARD REFRESH & SYNCHRONIZATION
    // =========================================================================
    function refreshDashboard() {
        let allCartoons = [];
        if (typeof getAllRawCartoonSubmissions === 'function') {
            allCartoons = getAllRawCartoonSubmissions();
        } else {
            try {
                const raw = localStorage.getItem('cartoonistSubmissions_v1');
                allCartoons = raw ? JSON.parse(raw) : [];
            } catch (e) {}
        }

        if (isSectionHead) {
            displayList = allCartoons.filter(c => {
                const s = (c.status || '').toLowerCase();
                return (s.includes('pending') && !s.includes('eic')) || s === 'pending with head' || s === 'submitted_to_mpc';
            });
            pendingCount = displayList.length;
        } else {
            displayList = (typeof getCartoonSubmissions === 'function') ? getCartoonSubmissions(true) : allCartoons;
            pendingCount = displayList.filter(m => {
                const s = (m.status || '').toLowerCase();
                return s.includes('pending') || s.includes('forwarded') || s.includes('submitted');
            }).length;
        }

        const publishedCount = allCartoons.filter(m => (m.status || '').toLowerCase() === 'published').length;
        const libraryCount = allCartoons.filter(m => {
            const s = (m.status || '').toLowerCase();
            return s === 'published' || s === 'eic approved' || s === 'approved' || s === 'approved_for_mpc';
        }).length;

        if (statCartoonsPublished) statCartoonsPublished.textContent = formatNumber(publishedCount);
        if (statPendingApprovals) statPendingApprovals.textContent = formatNumber(pendingCount);
        if (statCartoonsLibrary) statCartoonsLibrary.textContent = formatNumber(libraryCount);

        renderRecentCartoons();
    }

    // =========================================================================
    // 7. ENDORSE TO EIC & RETURN ACTIONS LOGIC
    // =========================================================================
    function handleApprove(id) {
        let all = [];
        try {
            const stored = localStorage.getItem('cartoonistSubmissions_v1');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) all = parsed;
            }
        } catch (e) {}

        const item = all.find(c => String(c.id) === String(id)) || displayList.find(c => String(c.id) === String(id));
        if (!item) return;

        item.status = 'Forwarded to EIC';
        item.endorsedBy = currentHeadName;
        item.endorsedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const existingIdx = all.findIndex(c => String(c.id) === String(id));
        if (existingIdx !== -1) {
            all[existingIdx] = item;
        } else {
            all.unshift(item);
        }

        try {
            localStorage.setItem('cartoonistSubmissions_v1', JSON.stringify(all));
        } catch (e) {}

        logActivity('endorsed', 'Editorial Cartoon to EIC', item.title || 'Cartoon');

        // Backend sync if running on Laravel
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (csrfToken && id) {
                fetch(`/cartoonist/cartoons/${id}/endorse`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json'
                    }
                }).catch(err => console.warn('Backend endorse sync failed:', err));
            }
        } catch (e) {}

        // Push to review queue for EIC review
        try {
            let queue = [];
            const rawQ = localStorage.getItem('articleCoverReviewQueue_v1');
            if (rawQ) {
                const parsedQ = JSON.parse(rawQ);
                if (Array.isArray(parsedQ)) queue = parsedQ;
            }
            const qIdx = queue.findIndex(q => String(q.id) === String(item.id));
            const queueItem = {
                id: item.id,
                type: 'cartoon',
                title: item.title,
                targetArticle: item.title,
                artist: item.artist || 'Staff Cartoonist',
                endorsedBy: `${currentHeadName} (Cartoonist Head)`,
                image: item.image,
                date: item.endorsedDate || item.date || 'Recent',
                status: 'Pending EIC Review'
            };
            if (qIdx !== -1) {
                queue[qIdx] = queueItem;
            } else {
                queue.unshift(queueItem);
            }
            localStorage.setItem('articleCoverReviewQueue_v1', JSON.stringify(queue));
        } catch (e) {}

        showToast(`"${item.title || 'Cartoon'}" successfully endorsed to Editor-in-Chief.`, 'success');
        refreshDashboard();
    }

    function openReturnModal(id) {
        const item = displayList.find(c => String(c.id) === String(id)) || cartoonList.find(c => String(c.id) === String(id));
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

            let all = [];
            try {
                const stored = localStorage.getItem('cartoonistSubmissions_v1');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) all = parsed;
                }
            } catch (e) {}

            const item = all.find(c => String(c.id) === String(activeReturnId)) || displayList.find(c => String(c.id) === String(activeReturnId));
            if (item) {
                item.status = 'Returned for Revision';
                item.remarks = remarks;

                const existingIdx = all.findIndex(c => String(c.id) === String(activeReturnId));
                if (existingIdx !== -1) {
                    all[existingIdx] = item;
                } else {
                    all.unshift(item);
                }

                try {
                    localStorage.setItem('cartoonistSubmissions_v1', JSON.stringify(all));
                } catch (e) {}

                logActivity('returned', 'Cartoon for Revision', item.title || 'Cartoon');

                // Backend sync if running on Laravel
                try {
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                    if (csrfToken && item.id) {
                        fetch(`/cartoonist/cartoons/${item.id}/revision`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken,
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({ remarks: remarks })
                        }).catch(err => console.warn('Backend return sync failed:', err));
                    }
                } catch (e) {}

                // Sync status to articleCoverReviewQueue_v1
                try {
                    const rawQ = localStorage.getItem('articleCoverReviewQueue_v1');
                    if (rawQ) {
                        let queue = JSON.parse(rawQ);
                        if (Array.isArray(queue)) {
                            queue = queue.map(q => {
                                if (String(q.id) === String(item.id)) {
                                    return { ...q, status: 'needs_revision', remarks: remarks };
                                }
                                return q;
                            });
                            localStorage.setItem('articleCoverReviewQueue_v1', JSON.stringify(queue));
                        }
                    }
                } catch (e) {}

                showToast(`"${item.title || 'Cartoon'}" returned to ${item.artist || 'Staff Cartoonist'} with revision remarks.`, 'success');
                closeReturnModal();
                refreshDashboard();
            }
        });
    }

    if (returnRemarksText) {
        returnRemarksText.addEventListener('input', () => {
            if (returnRemarksText.value.trim()) {
                returnRemarksText.classList.remove('input-invalid');
                if (returnRemarksError) returnRemarksError.classList.add('hidden');
            }
        });
    }

    // Inspect modal footer buttons (for Section Head inspect modal)
    if (inspectReturnBtn) {
        inspectReturnBtn.addEventListener('click', () => {
            const item = activeInspectionItem;
            closeInspectModal();
            if (item && item.id) openReturnModal(item.id);
        });
    }

    if (inspectApproveBtn) {
        inspectApproveBtn.addEventListener('click', () => {
            const item = activeInspectionItem;
            closeInspectModal();
            if (item && item.id) handleApprove(item.id);
        });
    }

    // =========================================================================
    // 8. INSPECT MODAL LOGIC (CARTOON DESK THEATER PARITY)
    // =========================================================================
    function openInspectModal(item) {
        if (!inspectModal) return;
        activeInspectionItem = item;

        const statusCfg = getStatusConfig(item.status);
        const safeImage = (item.image && !item.image.includes('maroon.jpg'))
            ? item.image
            : 'images/covers/faculty-overload-cartoon.svg';

        if (modalImg) {
            modalImg.src = safeImage;
            modalImg.alt = item.title || 'Cartoon Artwork';
        }
        if (modalCategory) {
            modalCategory.style.display = 'none';
        }
        if (modalStatus) {
            const statusLabel = (isSectionHead && (item.status === 'Pending with Head' || item.status === 'submitted_to_mpc'))
                ? 'Pending Approval'
                : statusCfg.label;
            modalStatus.className = `media-status-pill ${statusCfg.cssClass}`;
            modalStatus.innerHTML = `${statusCfg.icon} ${statusLabel}`;
        }
        if (modalDate) modalDate.textContent = item.date;

        const inspectArtistEl = document.getElementById('inspect-artist') || document.getElementById('modal-inspect-artist');
        if (inspectArtistEl) {
            inspectArtistEl.textContent = item.artist || (isSectionHead ? 'Staff Cartoonist' : storedName);
        }

        const inspectTypeTagEl = document.getElementById('inspect-type-tag');
        if (inspectTypeTagEl) {
            inspectTypeTagEl.className = 'cover-type-tag cartoon';
            inspectTypeTagEl.innerHTML = `<i class="fa-solid fa-palette"></i> CARTOON`;
        }

        if (modalRemarksBox && modalRemarksText) {
            if (item.status === 'Returned for Revision' && item.remarks) {
                modalRemarksText.textContent = item.remarks;
                modalRemarksBox.style.display = 'block';
            } else {
                modalRemarksBox.style.display = 'none';
            }
        }

        inspectModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeInspectModal() {
        if (!inspectModal) return;
        inspectModal.classList.add('hidden');
        document.body.style.overflow = '';
        activeInspectionItem = null;
    }

    if (closeInspectModalBtn) closeInspectModalBtn.addEventListener('click', closeInspectModal);
    if (inspectModal) {
        inspectModal.addEventListener('click', (e) => {
            if (e.target === inspectModal) closeInspectModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (inspectModal && !inspectModal.classList.contains('hidden')) {
                closeInspectModal();
            }
            if (returnModal && !returnModal.classList.contains('hidden')) {
                closeReturnModal();
            }
        }
    });

    renderRecentCartoons();
});

