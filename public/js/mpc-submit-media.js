/**
 * ============================================================================
 * THE LENS — SUBMIT MEDIA CONTROLLER (M&PC PORTAL)
 * Clean, distraction-free upload studio for publication materials.
 * Handles file drag & drop, snug preview, canvas compression,
 * and immediate dispatch to EIC / AEIC Media Desk for review.
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
    const MEDIA_SUBMISSIONS_KEY = 'mediaTeamSubmissions_v2';
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
    // 3. FILE UPLOAD & PREVIEW LOGIC (WITH CANVAS COMPRESSION)
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

    function compressImageFile(file, callback) {
        if (file.type === 'image/svg+xml') {
            const reader = new FileReader();
            reader.onload = (e) => callback(e.target.result);
            reader.readAsDataURL(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const maxDim = 1200;
                let width = img.width;
                let height = img.height;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
                callback(compressedDataUrl);
            };
            img.onerror = () => callback(e.target.result);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function handleFile(file) {
        if (!file.type.match(/^image\//)) {
            showToast('Please select a valid image file (SVG, PNG, JPG, WEBP).', 'error');
            return;
        }
        if (file.size > 15 * 1024 * 1024) {
            showToast('File size exceeds the 15MB limit.', 'error');
            return;
        }

        compressImageFile(file, (compressedDataUrl) => {
            setPreviewImage(compressedDataUrl, file.name, formatFileSize(file.size));
            showToast(`Loaded ${file.name}`);
        });
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

    if (removePreviewBtn) {
        removePreviewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearPreviewImage();
        });
    }

    // =========================================================================
    // 4. FORM SUBMISSION -> DISPATCH TO EIC / AEIC MEDIA DESK QUEUE
    // =========================================================================
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!currentImageDataUrl) {
                showToast('Please upload or select an image file first.', 'error');
                if (dropzone) dropzone.scrollIntoView({ behavior: 'smooth' });
                return;
            }

            // Prevent duplicate clicks
            const submitBtn = document.getElementById('btn-submit-media');
            if (submitBtn) {
                if (submitBtn.disabled) return;
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.7';
                submitBtn.style.pointerEvents = 'none';
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Submitting to EIC...</span>';
            }

            // Clean title derived from uploaded file name
            let cleanTitle = 'Photojournalism Capture';
            if (currentFileName) {
                cleanTitle = currentFileName
                    .replace(/\.[^/.]+$/, '')
                    .replace(/[-_]/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());
            }

            const now = new Date();
            const dateStr = formatDateDisplay(now);
            const rawDateStr = now.toISOString().split('T')[0];

            const userRole = window.LARAVEL_USER_ROLE || localStorage.getItem('mpcRole') || localStorage.getItem('userRole') || 'Media and Public Communications Head';
            const authorName = window.LARAVEL_USER_NAME || localStorage.getItem('mpcName') || localStorage.getItem('userName') || 'M&PC Head';
            const userId = window.LARAVEL_USER_ID || localStorage.getItem('userId') || '';
            const studentNum = window.LARAVEL_STUDENT_NUMBER || localStorage.getItem('studentNumber') || '';

            const newId = 'cov-' + Date.now();
            const newMediaItem = {
                id: newId,
                type: 'photo',
                title: cleanTitle,
                targetArticle: cleanTitle,
                category: 'Photo',
                artist: authorName,
                author: authorName,
                userId: String(userId || '').trim(),
                userStudentNumber: String(studentNum || '').trim(),
                studentNumber: String(studentNum || '').trim(),
                uploaderRole: userRole,
                endorsedBy: authorName,
                approvedBy: authorName,
                image: currentImageDataUrl,
                date: dateStr,
                rawDate: rawDateStr,
                fileSize: currentFileSize || 'Standard',
                status: 'Pending EIC Review',
                remarks: ''
            };

            // 1. Dispatch directly to EIC / AEIC Media Desk queue (shows under PHOTOS tab with pending badge)
            try {
                let queue = [];
                const rawQueue = localStorage.getItem(MEDIA_DESK_QUEUE_KEY);
                if (rawQueue) queue = JSON.parse(rawQueue);
                if (!Array.isArray(queue)) queue = [];
                queue = queue.filter(item => String(item.id) !== String(newMediaItem.id));
                queue.unshift(newMediaItem);
                localStorage.setItem(MEDIA_DESK_QUEUE_KEY, JSON.stringify(queue));
            } catch (err) {
                console.warn('Cover review queue storage warning:', err);
            }

            // 2. Dispatch to Media Submissions (for M&PC Manage Media view)
            try {
                let userSubs = [];
                const rawSubs = localStorage.getItem(MEDIA_SUBMISSIONS_KEY);
                if (rawSubs) userSubs = JSON.parse(rawSubs);
                if (!Array.isArray(userSubs)) userSubs = [];
                userSubs = userSubs.filter(item => String(item.id) !== String(newMediaItem.id));
                userSubs.unshift(newMediaItem);
                localStorage.setItem(MEDIA_SUBMISSIONS_KEY, JSON.stringify(userSubs));
            } catch (err) {
                console.warn('Submissions storage warning:', err);
            }

            // 3. User's personal publication material submissions backup
            try {
                let mine = [];
                const rawMine = localStorage.getItem(MY_SUBMISSIONS_KEY);
                if (rawMine) mine = JSON.parse(rawMine);
                if (!Array.isArray(mine)) mine = [];
                mine = mine.filter(item => String(item.id) !== String(newMediaItem.id));
                mine.unshift(newMediaItem);
                localStorage.setItem(MY_SUBMISSIONS_KEY, JSON.stringify(mine));
            } catch (err) {
                console.warn('User pubmat storage warning:', err);
            }

            // 4. Log Activity in Executive sentence format
            try {
                let logs = [];
                const rawLogs = localStorage.getItem(ACTIVITY_LOG_KEY);
                if (rawLogs) logs = JSON.parse(rawLogs);
                if (!Array.isArray(logs)) logs = [];
                const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                logs.unshift({
                    id: 'mpc-act-' + Date.now(),
                    causer: authorName,
                    causerRole: userRole,
                    causerAvatar: 'images/member-placeholder.svg',
                    action: 'submitted',
                    subjectType: 'Photo',
                    subjectName: cleanTitle,
                    timestampText: 'Just now',
                    isoDate: now.toISOString(),
                    dateKey: rawDateStr,
                    formattedDate: `${dateStr} • ${timeStr}`,
                    dayGroup: 'Today'
                });
                localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs.slice(0, 40)));
            } catch (err) {
                console.warn('Log activity error:', err);
            }

            // 5. Success toast and redirect to Manage Media
            clearPreviewImage();
            showToast('Photo submitted successfully! Forwarded to EIC for review.', 'success');

            setTimeout(() => {
                window.location.href = window.MPC_MANAGE_ROUTE || '/mpc/manage-media';
            }, 800);
        });
    }

});
