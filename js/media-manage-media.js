/**
 * ============================================================================
 * THE LENS — MEDIA & COMMUNICATION MANAGE MEDIA CONTROLLER
 * Filter, Search, Inspect, and Manage Submitted Media Assets
 * Official Media Statuses:
 *   - 'Pending with Head'
 *   - 'Returned for Revision'
 *   - 'EIC Approved'
 *   - 'Published'
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. DOM Elements
    const gridEl = document.getElementById('manage-media-grid');
    const filterBtns = document.querySelectorAll('.media-filter-btn');
    const searchInput = document.getElementById('media-search-input');
    const sortSelect = document.getElementById('media-sort-select');

    // Summary Elements
    const sumTotalEl = document.getElementById('sum-total-media');
    const sumPendingEl = document.getElementById('sum-pending-media');
    const sumReturnedEl = document.getElementById('sum-returned-media');
    const sumEicEl = document.getElementById('sum-eic-media');
    const sumPublishedEl = document.getElementById('sum-published-media');

    // Pill Badges
    const pillAll = document.getElementById('pill-count-all');
    const pillPending = document.getElementById('pill-count-pending');
    const pillReturned = document.getElementById('pill-count-returned');
    const pillEic = document.getElementById('pill-count-eic');
    const pillPublished = document.getElementById('pill-count-published');

    // Inspect Modal
    const inspectModal = document.getElementById('media-inspect-modal');
    const modalImg = document.getElementById('modal-inspect-img');
    const modalTitle = document.getElementById('modal-inspect-title');
    const modalCategory = document.getElementById('modal-inspect-category');
    const modalStatus = document.getElementById('modal-inspect-status');
    const modalDate = document.getElementById('modal-inspect-date');
    const modalFilesize = document.getElementById('modal-inspect-filesize');
    const modalCaption = document.getElementById('modal-inspect-caption');
    const modalRemarksBox = document.getElementById('modal-inspect-remarks-box');
    const modalRemarksText = document.getElementById('modal-inspect-remarks-text');
    const closeInspectBtn = document.getElementById('close-inspect-modal-btn');
    const btnModalClose = document.getElementById('btn-modal-close');

    const toastContainer = document.getElementById('toast-container');

    let currentFilter = 'all';
    let searchQuery = '';
    let currentSort = 'newest';

    // 2. Toast System
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
        const resolvedType = type === 'error' ? 'danger' : type;
        toast.className = `toast-message ${resolvedType}`;
        toast.innerHTML = `<span class="toast-bullet-dot"></span><span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-dismissing');
            setTimeout(() => toast.remove(), 260);
        }, 3200);
    }

    // 3. Status Configuration Helper
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

    // 4. Data Loading & Refreshing
    let mediaItems = [];

    function loadMedia() {
        mediaItems = (typeof getMediaSubmissions === 'function') ? getMediaSubmissions() : [];
        updateCounters();
        renderGrid();
    }

    // 5. Update Summary Counters & Filter Badges
    function updateCounters() {
        const total = mediaItems.length;
        const pending = mediaItems.filter(m => m.status === 'Pending with Head').length;
        const returned = mediaItems.filter(m => m.status === 'Returned for Revision').length;
        const eic = mediaItems.filter(m => m.status === 'EIC Approved').length;
        const published = mediaItems.filter(m => m.status === 'Published').length;

        if (sumTotalEl) sumTotalEl.textContent = String(total);
        if (sumPendingEl) sumPendingEl.textContent = String(pending);
        if (sumReturnedEl) sumReturnedEl.textContent = String(returned);
        if (sumEicEl) sumEicEl.textContent = String(eic);
        if (sumPublishedEl) sumPublishedEl.textContent = String(published);

        if (pillAll) pillAll.textContent = String(total);
        if (pillPending) pillPending.textContent = String(pending);
        if (pillReturned) pillReturned.textContent = String(returned);
        if (pillEic) pillEic.textContent = String(eic);
        if (pillPublished) pillPublished.textContent = String(published);
    }

    // 6. Grid Rendering
    function renderGrid() {
        if (!gridEl) return;

        let filtered = mediaItems.filter(item => {
            if (currentFilter === 'pending' && item.status !== 'Pending with Head') return false;
            if (currentFilter === 'returned' && item.status !== 'Returned for Revision') return false;
            if (currentFilter === 'eic_approved' && item.status !== 'EIC Approved') return false;
            if (currentFilter === 'published' && item.status !== 'Published') return false;

            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchTitle = (item.title || '').toLowerCase().includes(q);
                const matchCategory = (item.category || '').toLowerCase().includes(q);
                const matchRemarks = (item.remarks || '').toLowerCase().includes(q);
                if (!matchTitle && !matchCategory && !matchRemarks) return false;
            }

            return true;
        });

        // Sorting
        filtered.sort((a, b) => {
            const dateA = new Date(a.rawDate || a.date || 0);
            const dateB = new Date(b.rawDate || b.date || 0);
            return currentSort === 'newest' ? (dateB - dateA) : (dateA - dateB);
        });

        if (filtered.length === 0) {
            gridEl.innerHTML = `
                <div class="media-empty-state" style="grid-column: 1 / -1;">
                    <i class="fa-solid fa-filter"></i>
                    <h3>No Media Found</h3>
                    <p>No publication materials match your selected filter or search term. Try switching filters or upload a new asset.</p>
                    <a href="media-submit-media.html" class="btn-media-inspect" style="display: inline-flex; text-decoration: none;">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <span>Submit PUBMAT</span>
                    </a>
                </div>
            `;
            return;
        }

        gridEl.innerHTML = filtered.map(item => {
            const statusCfg = getStatusConfig(item.status);
            const isReturned = item.status === 'Returned for Revision';

            return `
                <div class="manage-media-card" data-id="${item.id}">
                    <div class="media-card-preview-box" data-action="inspect" data-id="${item.id}">
                        <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title)}" class="media-card-img" onerror="this.onerror=null; this.src='images/covers/portal-pubmat.svg'">
                        <div class="media-card-badge-layer">
                            <span class="media-card-category-chip maroon-category">
                                <i class="fa-solid fa-tag"></i> ${escapeHTML(item.category || 'News')}
                            </span>
                            <span class="media-status-pill ${statusCfg.cssClass}">
                                ${statusCfg.icon} ${statusCfg.label}
                            </span>
                        </div>
                    </div>
                    <div class="media-card-body">
                        <h3 class="media-card-title">${escapeHTML(item.title)}</h3>
                        <div class="media-card-meta">
                            <span><i class="fa-regular fa-calendar"></i> ${escapeHTML(item.date)}</span>
                            <span>•</span>
                            <span><i class="fa-solid fa-user-pen"></i> ${escapeHTML(item.artist || 'Alyssa Marie Dizon')}</span>
                            <span>•</span>
                            <span>${escapeHTML(item.fileSize || 'Standard')}</span>
                        </div>

                        ${isReturned && item.remarks ? `
                            <div class="media-review-note-box">
                                <strong><i class="fa-solid fa-comment-dots"></i> Desk Revision Feedback:</strong>
                                ${escapeHTML(item.remarks)}
                            </div>
                        ` : ''}

                        <div class="media-card-actions">
                            <button type="button" class="btn-media-inspect" data-action="inspect" data-id="${item.id}">
                                <i class="fa-regular fa-eye"></i>
                                <span>Inspect Graphic</span>
                            </button>

                            <div class="media-action-secondary-group">
                                <button type="button" class="btn-media-icon delete" data-action="delete" data-id="${item.id}" title="Withdraw / Delete Asset">
                                    <i class="fa-regular fa-trash-can"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach action click handlers
        gridEl.querySelectorAll('[data-action="inspect"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const item = mediaItems.find(m => m.id === id);
                if (item) openInspectModal(item);
            });
        });

        gridEl.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                handleDelete(id);
            });
        });
    }

    // 7. Delete / Withdraw Handler
    function handleDelete(id) {
        const item = mediaItems.find(m => m.id === id);
        if (!item) return;

        const confirmed = confirm(`Are you sure you want to withdraw and remove "${item.title}"?`);
        if (!confirmed) return;

        mediaItems = mediaItems.filter(m => m.id !== id);
        if (typeof saveMediaSubmissions === 'function') {
            saveMediaSubmissions(mediaItems);
        } else {
            localStorage.setItem('mediaTeamSubmissions_v2', JSON.stringify(mediaItems));
        }

        // Also remove from review queue if still pending
        try {
            const rawQueue = localStorage.getItem('articleCoverReviewQueue_v1');
            if (rawQueue) {
                let queue = JSON.parse(rawQueue);
                queue = queue.filter(q => q.id !== id);
                localStorage.setItem('articleCoverReviewQueue_v1', JSON.stringify(queue));
            }
        } catch (e) {
            console.warn(e);
        }

        showToast(`Asset "${item.title}" removed.`, 'info');
        updateCounters();
        renderGrid();
    }

    // 8. Inspect Modal Handlers
    function openInspectModal(item) {
        if (!inspectModal) return;

        const statusCfg = getStatusConfig(item.status);

        if (modalImg) {
            modalImg.onerror = function() {
                this.onerror = null;
                this.src = 'images/covers/portal-pubmat.svg';
            };
            modalImg.src = item.image || 'images/covers/election-guidelines.svg';
            modalImg.alt = item.category || 'Graphic Preview';
        }
        if (modalTitle) modalTitle.textContent = item.title;
        if (modalCategory) {
            modalCategory.innerHTML = `<i class="fa-solid fa-tag"></i> ${escapeHTML(item.category || 'News')}`;
        }
        if (modalStatus) {
            modalStatus.className = `media-status-pill ${statusCfg.cssClass}`;
            modalStatus.innerHTML = `${statusCfg.icon} ${statusCfg.label}`;
        }
        if (modalDate) modalDate.textContent = item.date || 'Oct 24, 2026';
        if (modalFilesize) modalFilesize.textContent = item.fileSize || 'Standard';
        if (modalCaption) {
            modalCaption.textContent = item.targetArticle || item.caption || 'Publication Material Asset';
        }

        // Remarks
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

    if (closeInspectBtn) closeInspectBtn.addEventListener('click', closeInspectModal);
    if (btnModalClose) btnModalClose.addEventListener('click', closeInspectModal);

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

    // 9. Filter Button Clicks
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter') || 'all';
            renderGrid();
        });
    });

    // 10. Search & Sort Listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            renderGrid();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderGrid();
        });
    }

    // 11. Deep-link inspection support from URL query (?inspect=ID)
    function checkUrlForInspection() {
        try {
            const params = new URLSearchParams(window.location.search);
            const inspectId = params.get('inspect');
            if (inspectId) {
                const item = mediaItems.find(m => m.id === inspectId);
                if (item) {
                    setTimeout(() => openInspectModal(item), 150);
                }
            }
        } catch (e) {
            console.warn(e);
        }
    }

    // Initial Execution
    loadMedia();
    checkUrlForInspection();
});
