/**
 * ============================================================================
 * THE LENS — MEDIA & COMMUNICATION DASHBOARD CONTROLLER
 * Dynamic Analytics, Recent Media Submissions & Graphic Inspector
 * 
 * Official Media Statuses:
 *   - 'Pending with Head'
 *   - 'Returned for Revision'
 *   - 'EIC Approved'
 *   - 'Published'
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. User Resolution
    const storedName = window.LARAVEL_USER_NAME || localStorage.getItem('mediaName') || localStorage.getItem('userName') || 'Media Team';
    const firstName = storedName.split(' ')[0] || 'Media';
    const mediaNameEl = document.getElementById('media-name-display');
    if (mediaNameEl) mediaNameEl.textContent = firstName;

    // 2. DOM Elements
    // Analytics Counters (Executive Metric Card Copy)
    const statPubmatsPublished = document.getElementById('stat-pubmats-published');
    const statPendingApprovals = document.getElementById('stat-pending-approvals');
    const statMediaLibrary = document.getElementById('stat-media-library');

    // Recent Media Grid
    const mediaRecentGrid = document.getElementById('media-recent-grid');

    // Inspect Modal Elements
    const inspectModal = document.getElementById('media-inspect-modal');
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
    // 3. LOAD DATA & CALCULATE METRICS (EXECUTIVE DESIGN)
    // =========================================================================
    const rawMedia = (typeof getMediaSubmissions === 'function') ? getMediaSubmissions() : [];
    const seenMedia = new Set();
    const mediaList = [];
    rawMedia.forEach(item => {
        if (!item || !item.id) return;
        const strId = String(item.id);
        if (!seenMedia.has(strId)) {
            seenMedia.add(strId);
            mediaList.push(item);
        }
    });

    // Official 4 Status Metric Counters:
    // 1. Total PUBMATs Published: status === 'Published'
    // 2. Total Pending Approvals: status === 'Pending with Head'
    // 3. Total in Media Library: status === 'Published' || status === 'EIC Approved'
    const publishedCount = mediaList.filter(m => m.status === 'Published').length;
    const pendingCount = mediaList.filter(m => m.status === 'Pending with Head').length;
    const libraryCount = mediaList.filter(m => m.status === 'Published' || m.status === 'EIC Approved').length;

    if (statPubmatsPublished) statPubmatsPublished.textContent = formatNumber(publishedCount);
    if (statPendingApprovals) statPendingApprovals.textContent = formatNumber(pendingCount);
    if (statMediaLibrary) statMediaLibrary.textContent = formatNumber(libraryCount);

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
                return {
                    cssClass: 'pending-eic-review',
                    label: 'Pending EIC Review',
                    icon: '<i class="fa-solid fa-user-tie"></i>'
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
    // 5. RENDER RECENT MEDIA (CLEAN, NO ARTICLE TITLE, NO REVISION MSG, NO PIC SIZE)
    // =========================================================================
    function renderRecentMedia() {
        if (!mediaRecentGrid) return;

        // Display top 3 most recent media assets
        const top3Media = mediaList.slice(0, 3);
        if (top3Media.length === 0) {
            mediaRecentGrid.innerHTML = `
                <div class="media-empty-state" style="grid-column: 1 / -1;">
                    <i class="fa-solid fa-camera"></i>
                    <h3>No Photos Uploaded Yet</h3>
                    <p>Click "Submit Photo" above to upload your first photojournalism capture.</p>
                </div>
            `;
            return;
        }

        mediaRecentGrid.innerHTML = top3Media.map(item => {
            const statusCfg = getStatusConfig(item.status);

            return `
                <div class="manage-media-card" data-id="${item.id}">
                    <div class="media-card-preview-box" data-action="inspect" data-id="${item.id}">
                        ${item.image ? `
                            <img src="${escapeHTML(item.image)}" 
                                 alt="${escapeHTML(item.title || 'Photo Asset')}" 
                                 class="media-card-img">
                        ` : `
                            <div class="media-card-placeholder" style="display: flex; align-items: center; justify-content: center; height: 100%; min-height: 180px; background: #f8fafc; color: #94a3b8;">
                                <i class="fa-solid fa-camera" style="font-size: 2.2rem;"></i>
                            </div>
                        `}
                        <div class="media-card-badge-layer">
                            <span class="media-status-pill ${statusCfg.cssClass}">
                                ${statusCfg.icon} ${statusCfg.label}
                            </span>
                        </div>
                    </div>
                    <div class="media-card-body" style="padding: 14px 16px;">
                        <div class="media-card-meta" style="margin-bottom: 12px;">
                            <span><i class="fa-regular fa-calendar"></i> ${escapeHTML(item.date)}</span>
                        </div>
                        <div class="media-card-actions">
                            <button type="button" class="btn-media-inspect" data-action="inspect" data-id="${item.id}" style="width: 100%; justify-content: center;">
                                <i class="fa-regular fa-eye"></i>
                                <span>Inspect Photo</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach inspect handlers to cards & buttons
        mediaRecentGrid.querySelectorAll('[data-action="inspect"]').forEach(elem => {
            elem.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = elem.getAttribute('data-id');
                const item = mediaList.find(m => m.id === id);
                if (item) openInspectModal(item);
            });
        });
    }

    // =========================================================================
    // 6. INSPECT GRAPHIC MODAL HANDLERS (DISMISSIBLE VIA X ICON)
    // =========================================================================
    function openInspectModal(item) {
        if (!inspectModal) return;

        const statusCfg = getStatusConfig(item.status);

        if (modalImg) {
            modalImg.onerror = null;
            if (item.image) {
                modalImg.src = item.image;
                modalImg.alt = item.title || 'Graphic Preview';
                modalImg.style.display = '';
            } else {
                modalImg.src = '';
                modalImg.alt = '';
                modalImg.style.display = 'none';
            }
        }
        if (modalCategory) {
            modalCategory.style.display = 'none';
        }
        if (modalStatus) {
            modalStatus.className = `media-status-pill ${statusCfg.cssClass}`;
            modalStatus.innerHTML = `${statusCfg.icon} ${statusCfg.label}`;
        }
        if (modalDate) {
            modalDate.textContent = item.date || '';
        }

        // Revision remarks (only shown when inspecting)
        if (item.status === 'Returned for Revision' && item.remarks) {
            if (modalRemarksText) modalRemarksText.textContent = item.remarks;
            if (modalRemarksBox) modalRemarksBox.style.display = 'block';
        } else {
            if (modalRemarksBox) modalRemarksBox.style.display = 'none';
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

    // Run Initial Render
    renderRecentMedia();
});
