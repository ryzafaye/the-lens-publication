/**
 * ============================================================================
 * THE LENS — SUBMIT MEDIA CONTROLLER (MEDIA & COMMUNICATION PORTAL)
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

    const QUEUE_KEY = 'articleCoverReviewQueue_v1';
    const SUBMISSIONS_KEY = 'mediaTeamSubmissions_v2';
    const ACTLOG_KEY = 'mpcActivityLogs_v1';

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

    function formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 KB';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function formatDateDisplay(d = new Date()) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
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

            // Derive clean title from file name
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

            const authorName = localStorage.getItem('mediaName') || localStorage.getItem('userName') || 'Alyssa Marie Dizon';
            const userRole = localStorage.getItem('mediaRole') || 'Media & Communication';

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
                status: 'Pending with Head',
                remarks: ''
            };

            // A. Push to Media Desk Review Queue
            try {
                let queue = [];
                const rawQueue = localStorage.getItem(QUEUE_KEY);
                if (rawQueue) queue = JSON.parse(rawQueue);
                queue.unshift(newPubmatItem);
                localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
            } catch (err) {
                console.warn('Queue storage warning:', err);
            }

            // B. Push to Personal Media Submissions
            try {
                let submissions = (typeof getMediaSubmissions === 'function') ? getMediaSubmissions() : [];
                submissions.unshift(newPubmatItem);
                if (typeof saveMediaSubmissions === 'function') {
                    saveMediaSubmissions(submissions);
                } else {
                    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
                }
            } catch (err) {
                console.warn('Submissions storage warning:', err);
            }

            // C. Log Activity in Executive sentence format
            try {
                let logs = [];
                const rawLogs = localStorage.getItem(ACTLOG_KEY);
                if (rawLogs) logs = JSON.parse(rawLogs);
                logs.unshift({
                    id: 'act-' + Date.now(),
                    causer: authorName,
                    causerRole: userRole,
                    action: 'submitted',
                    subjectType: 'Publication Material',
                    subjectName: cleanTitle,
                    timestampText: 'Just now',
                    formattedDate: dateStr,
                    isoDate: now.toISOString(),
                    dayGroup: 'Today'
                });
                localStorage.setItem(ACTLOG_KEY, JSON.stringify(logs));
            } catch (err) {
                console.warn('Log activity error:', err);
            }

            // D. Show success toast and redirect
            showToast('Media submitted successfully to Media Desk!', 'success');
            setTimeout(() => {
                window.location.href = 'media-manage-media.html';
            }, 1000);
        });
    }

});
