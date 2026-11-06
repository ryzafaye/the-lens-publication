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

    // 1. User Resolution (Hydrated from dynamic Auth or localStorage fallback)
    const storedName = window.LARAVEL_USER_NAME || localStorage.getItem('cartoonistName') || localStorage.getItem('userName') || 'Cartoonist';
    const firstName = storedName.split(' ')[0] || 'Cartoonist';
    const cartoonistNameEl = document.getElementById('cartoonist-name-display');
    if (cartoonistNameEl) cartoonistNameEl.textContent = firstName;

    // 2. DOM Elements
    const statCartoonsPublished = document.getElementById('stat-cartoons-published');
    const statPendingApprovals = document.getElementById('stat-pending-approvals');
    const statCartoonsLibrary = document.getElementById('stat-cartoons-library');

    const cartoonRecentGrid = document.getElementById('cartoon-recent-grid');

    // Inspect Modal Elements
    const inspectModal = document.getElementById('cartoon-inspect-modal');
    const modalImg = document.getElementById('modal-inspect-img');
    const modalCategory = document.getElementById('modal-inspect-category');
    const modalStatus = document.getElementById('modal-inspect-status');
    const modalDate = document.getElementById('modal-inspect-date');
    const modalRemarksBox = document.getElementById('modal-inspect-remarks-box');
    const modalRemarksText = document.getElementById('modal-inspect-remarks-text');
    const closeInspectModalBtn = document.getElementById('close-inspect-modal-btn');

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
    // with graceful fallback & sync to localStorage for backward compatibility
    // =========================================================================
    let serverList = [];
    if (window.INITIAL_CARTOONS && Array.isArray(window.INITIAL_CARTOONS)) {
        serverList = window.INITIAL_CARTOONS;
    } else if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA)) {
        serverList = window.INITIAL_DATA;
    }

    let localList = [];
    try {
        const raw = localStorage.getItem('cartoonistSubmissions_v1');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) localList = parsed;
        }
    } catch (e) {
        localList = [];
    }

    const combinedList = [...serverList];
    localList.forEach(localItem => {
        const exists = combinedList.some(s => String(s.id) === String(localItem.id) || (s.title && s.title === localItem.title));
        if (!exists) {
            combinedList.push(localItem);
        }
    });

    const cartoonList = combinedList;

    // Official 4 Status Metric Counters:
    // 1. Total Cartoons Published: status === 'Published'
    // 2. Total Pending Approvals: status === 'Pending with Head'
    // 3. Total in Cartoon Library: status === 'Published' || status === 'EIC Approved'
    const publishedCount = cartoonList.filter(m => m.status === 'Published').length;
    const pendingCount = cartoonList.filter(m => {
        const s = (m.status || '').toLowerCase();
        return s === 'pending with head' || s.includes('pending');
    }).length;
    const libraryCount = cartoonList.filter(m => m.status === 'Published' || m.status === 'EIC Approved' || m.status === 'Forwarded to EIC').length;

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

    // =========================================================================
    // 5. RENDER MY RECENT CARTOONS
    // =========================================================================
    function renderRecentCartoons() {
        if (!cartoonRecentGrid) return;

        if (cartoonList.length === 0) {
            cartoonRecentGrid.innerHTML = `
                <div class="media-empty-state" style="grid-column: 1 / -1;">
                    <i class="fa-solid fa-paintbrush"></i>
                    <h3>No Cartoons Found</h3>
                    <p>You have not submitted any editorial cartoons yet.</p>
                </div>
            `;
            return;
        }

        // Show top 4 most recent
        const recents = cartoonList.slice(0, 4);

        cartoonRecentGrid.innerHTML = recents.map(item => {
            const statusCfg = getStatusConfig(item.status);
            const isReturned = (item.status === 'Returned for Revision');
            const safeImage = (item.image && !item.image.includes('maroon.jpg'))
                ? item.image
                : 'images/covers/faculty-overload-cartoon.svg';

            return `
                <div class="manage-media-card" data-id="${item.id}">
                    <div class="media-card-preview-box" data-action="inspect" data-id="${item.id}" style="cursor: pointer;">
                        <img 
                            src="${escapeHTML(safeImage)}" 
                            alt="${escapeHTML(item.title)}" 
                            class="media-card-img" 
                            onerror="this.onerror=null; this.src='images/covers/faculty-overload-cartoon.svg'"
                        >
                        <div class="media-card-badge-layer">
                            <span class="media-card-category-chip maroon-category">
                                <i class="fa-solid fa-tag"></i> ${escapeHTML(item.category || 'Opinion')}
                            </span>
                            <span class="media-status-pill ${statusCfg.cssClass}">
                                ${statusCfg.icon} ${statusCfg.label}
                            </span>
                        </div>
                    </div>

                    <div class="media-card-body">
                        <div class="media-card-meta" style="margin-bottom: 8px;">
                            <span><i class="fa-regular fa-calendar"></i> ${escapeHTML(item.date)}</span>
                            <span>&bull;</span>
                            <span><i class="fa-solid fa-palette"></i> ${escapeHTML(item.artist || storedName)}</span>
                        </div>

                        <div class="media-card-actions" style="margin-top: 12px; display: flex; align-items: center; justify-content: flex-end;">
                            <button type="button" class="btn-media-inspect" data-action="inspect" data-id="${item.id}" style="width: auto; padding: 6px 14px;">
                                <i class="fa-regular fa-eye"></i>
                                <span>Inspect Cartoon</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach event listeners for inspect buttons and cards
        cartoonRecentGrid.querySelectorAll('[data-action="inspect"]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = el.getAttribute('data-id');
                const found = cartoonList.find(c => String(c.id) === String(id));
                if (found) openInspectModal(found);
            });
        });
    }

    // =========================================================================
    // 6. INSPECT MODAL LOGIC
    // =========================================================================
    function openInspectModal(item) {
        if (!inspectModal) return;

        const statusCfg = getStatusConfig(item.status);
        const safeImage = (item.image && !item.image.includes('maroon.jpg'))
            ? item.image
            : 'images/covers/faculty-overload-cartoon.svg';

        if (modalImg) modalImg.src = safeImage;
        if (modalCategory) {
            modalCategory.innerHTML = `<i class="fa-solid fa-tag"></i> ${escapeHTML(item.category || 'Opinion')}`;
        }
        if (modalStatus) {
            modalStatus.className = `media-status-pill ${statusCfg.cssClass}`;
            modalStatus.innerHTML = `${statusCfg.icon} ${statusCfg.label}`;
        }
        if (modalDate) modalDate.textContent = item.date;

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
    }

    if (closeInspectModalBtn) closeInspectModalBtn.addEventListener('click', closeInspectModal);
    if (inspectModal) {
        inspectModal.addEventListener('click', (e) => {
            if (e.target === inspectModal) closeInspectModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && inspectModal && !inspectModal.classList.contains('hidden')) {
            closeInspectModal();
        }
    });

    renderRecentCartoons();
});

