/**
 * ============================================================================
 * THE LENS — SUBMIT MEDIA CONTROLLER (M&PC PORTAL)
 * Clean, distraction-free upload studio for publication materials.
 * Handles file drag & drop, snug preview, and queue dispatch.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 1. DOM REFERENCES
    // =========================================================================
    const form = document.getElementById('media-submission-form');

    // File Upload & Preview
    const dropzone = document.getElementById('media-dropzone');
    const fileInput = document.getElementById('media-file-input');
    const previewContainer = document.getElementById('media-preview-container');
    const previewImg = document.getElementById('media-preview-img');
    const removePreviewBtn = document.getElementById('btn-remove-preview');
    const fileInfoBar = document.getElementById('media-file-info-bar');
    const fileNameEl = document.getElementById('media-file-name');
    const fileSizeEl = document.getElementById('media-file-size');

    const toastContainer = document.getElementById('toast-container');

    let currentImageDataUrl = '';
    let currentFileName = '';
    let currentFileSize = '';

    const MEDIA_DESK_QUEUE_KEY = 'articleCoverReviewQueue_v1';
    const MY_SUBMISSIONS_KEY = 'mpcUserPubmatSubmissions_v1';
    const ACTIVITY_LOG_KEY = 'mpcActivityLogs_v1';

    // =========================================================================
    // 2. TOAST SYSTEM & UTILITIES
    // =========================================================================
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
        }, 3400);
    }

    function formatDateDisplay(d = new Date()) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }

    function formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 KB';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // =========================================================================
    // 3. FILE UPLOAD & PREVIEW LOGIC
    // =========================================================================
    function setPreviewImage(src, name = 'Media Artwork Asset', size = '') {
        currentImageDataUrl = src;
        currentFileName = name;
        currentFileSize = size;

        if (previewImg) previewImg.src = src;
        if (previewContainer) previewContainer.style.display = 'flex';
        if (dropzone) dropzone.style.display = 'none';

        if (fileInfoBar && fileNameEl) {
            fileNameEl.textContent = name;
            if (fileSizeEl) fileSizeEl.textContent = size ? `• ${size}` : '';
            fileInfoBar.style.display = 'flex';
        }
    }

    function clearPreviewImage() {
        currentImageDataUrl = '';
        currentFileName = '';
        currentFileSize = '';

        if (previewImg) previewImg.src = '';
        if (fileInput) fileInput.value = '';
        if (previewContainer) previewContainer.style.display = 'none';
        if (fileInfoBar) fileInfoBar.style.display = 'none';
        if (dropzone) dropzone.style.display = 'flex';
    }

    if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInput.click();
            }
        });

        // Drag & drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files[0]) {
                handleFile(fileInput.files[0]);
            }
        });
    }

    function handleFile(file) {
        if (!file.type.match(/^image\//)) {
            showToast('Please select a valid image file (SVG, PNG, JPG, WEBP).', 'error');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            showToast('File size exceeds the 10MB limit.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewImage(e.target.result, file.name, formatFileSize(file.size));
            showToast(`Loaded ${file.name}`);
        };
        reader.readAsDataURL(file);
    }

    if (removePreviewBtn) {
        removePreviewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearPreviewImage();
        });
    }

    // =========================================================================
    // 4. FORM SUBMISSION -> DISPATCH TO MEDIA DESK QUEUE
    // =========================================================================
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!currentImageDataUrl) {
                showToast('Please upload or select an image file first.', 'error');
                if (dropzone) dropzone.scrollIntoView({ behavior: 'smooth' });
                return;
            }

            // Derive title cleanly from the uploaded file name
            let cleanTitle = 'Publication Material Artwork';
            if (currentFileName) {
                cleanTitle = currentFileName
                    .replace(/\.[^/.]+$/, '')
                    .replace(/[-_]/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());
            }

            const now = new Date();
            const dateStr = formatDateDisplay(now);
            const rawDateStr = now.toISOString().split('T')[0];

            const userRole = localStorage.getItem('mpcRole') || localStorage.getItem('userRole') || 'M&PC Head';
            const authorName = localStorage.getItem('mpcName') || localStorage.getItem('userName') || (userRole.includes('Assoc') ? 'Samantha Cruz' : 'Julian Del Rosario');

            const newId = 'cov-' + Date.now();
            const newPubmatItem = {
                id: newId,
                type: 'pubmat',
                title: cleanTitle,
                targetArticle: cleanTitle,
                category: 'Features',
                artist: authorName,
                uploaderRole: userRole,
                image: currentImageDataUrl,
                date: dateStr,
                rawDate: rawDateStr,
                fileSize: currentFileSize || '380 KB',
                status: 'pending',
                remarks: ''
            };

            // 1. Prepend to Media Desk review queue
            try {
                const rawQueue = localStorage.getItem(MEDIA_DESK_QUEUE_KEY);
                let queue = rawQueue ? JSON.parse(rawQueue) : [];
                if (!Array.isArray(queue)) queue = [];
                queue.unshift(newPubmatItem);
                localStorage.setItem(MEDIA_DESK_QUEUE_KEY, JSON.stringify(queue));
            } catch (err) {
                console.warn('Failed saving to Media Desk queue', err);
            }

            // 2. Add to user's submissions
            try {
                const rawMine = localStorage.getItem(MY_SUBMISSIONS_KEY);
                let mine = rawMine ? JSON.parse(rawMine) : [];
                if (!Array.isArray(mine)) mine = [];
                mine.unshift(newPubmatItem);
                localStorage.setItem(MY_SUBMISSIONS_KEY, JSON.stringify(mine));
            } catch (err) {
                console.warn('Failed saving user submission', err);
            }

            // 3. Log to Activity Logs
            try {
                const rawLogs = localStorage.getItem(ACTIVITY_LOG_KEY);
                let logs = rawLogs ? JSON.parse(rawLogs) : [];
                if (!Array.isArray(logs)) logs = [];
                const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                logs.unshift({
                    id: 'mpc-act-' + Date.now(),
                    causer: authorName,
                    causerRole: userRole,
                    causerAvatar: 'images/member-placeholder.svg',
                    action: 'submitted',
                    subjectType: 'Publication Material',
                    subjectName: cleanTitle,
                    timestampText: 'Just now',
                    isoDate: now.toISOString(),
                    dateKey: rawDateStr,
                    formattedDate: `${dateStr} • ${timeStr}`,
                    dayGroup: 'Today'
                });
                localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs.slice(0, 40)));
            } catch (err) {
                console.warn('Failed logging activity', err);
            }

            // Reset form and preview
            clearPreviewImage();

            showToast('Media submitted successfully to Media Desk!', 'success');
        });
    }

});
