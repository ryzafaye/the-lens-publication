/**
 * ============================================================================
 * THE LENS — SUBMIT CARTOON CONTROLLER (CARTOONIST HEAD PORTAL)
 * Clean, distraction-free upload studio for editorial cartoons.
 * Matches M&PC submit media design format and interaction logic 1:1.
 * Handles drag & drop, snug bounded preview, auto-title, and queue dispatch.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 1. DOM REFERENCES
    // =========================================================================
    const form = document.getElementById('cartoon-submission-form');
    const dropzone = document.getElementById('media-dropzone');
    const fileInput = document.getElementById('media-file-input');
    const previewContainer = document.getElementById('media-preview-container');
    const previewImg = document.getElementById('media-preview-img');
    const btnRemovePreview = document.getElementById('btn-remove-preview');
    const fileInfoBar = document.getElementById('media-file-info-bar');
    const fileNameEl = document.getElementById('media-file-name');
    const fileSizeEl = document.getElementById('media-file-size');
    const btnSubmit = document.getElementById('btn-submit-media');
    const toastContainer = document.getElementById('toast-container');

    let currentImageDataUrl = '';
    let currentFileName = '';
    let currentFileSize = '';

    const CARTOON_SUBMISSIONS_KEY = 'cartoonistSubmissions_v1';
    const ACTIVITY_LOG_KEY = 'cartoonistHeadActivityLogs_v1';

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
    function setPreviewImage(src, name = 'Cartoon Illustration', size = '') {
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

        // Drag & drop handlers
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
        const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(svg|png|jpe?g|webp)$/i)) {
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

    if (btnRemovePreview) {
        btnRemovePreview.addEventListener('click', (e) => {
            e.stopPropagation();
            clearPreviewImage();
        });
    }

    // =========================================================================
    // 4. FORM SUBMISSION -> DISPATCH TO CARTOON DESK
    // =========================================================================
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!currentImageDataUrl) {
                showToast('Please upload or select an editorial cartoon first.', 'error');
                if (dropzone) dropzone.scrollIntoView({ behavior: 'smooth' });
                return;
            }

            // Derive title cleanly from the uploaded file name
            let cleanTitle = 'Editorial Cartoon Illustration';
            if (currentFileName) {
                cleanTitle = currentFileName
                    .replace(/\.[^/.]+$/, '')
                    .replace(/[-_]/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());
            }

            const now = new Date();
            const dateStr = formatDateDisplay(now);
            const rawDateStr = now.toISOString().split('T')[0];

            const authorName = localStorage.getItem('cartoonistHeadName') || 'Danilo Reyes';
            const userRole = 'Cartoonist Head';

            const newId = 'cart-' + Date.now();
            const newCartoonItem = {
                id: newId,
                type: 'cartoon',
                title: cleanTitle,
                category: 'Opinion',
                artist: authorName,
                uploaderRole: userRole,
                image: currentImageDataUrl,
                date: dateStr,
                rawDate: rawDateStr,
                fileSize: currentFileSize || '420 KB',
                status: 'Pending with Head',
                remarks: '',
                views: 0,
                readTime: '1 min read',
                shares: 0
            };

            // 1. Prepend to cartoonist submissions queue
            try {
                const rawQueue = localStorage.getItem(CARTOON_SUBMISSIONS_KEY);
                let queue = rawQueue ? JSON.parse(rawQueue) : [];
                if (!Array.isArray(queue)) queue = [];
                queue.unshift(newCartoonItem);
                localStorage.setItem(CARTOON_SUBMISSIONS_KEY, JSON.stringify(queue));
            } catch (err) {
                console.warn('Failed saving to cartoonist submissions queue', err);
            }

            // 2. Also prepend to articleCoverReviewQueue_v1 for global consistency
            try {
                const rawReview = localStorage.getItem('articleCoverReviewQueue_v1');
                let reviewQueue = rawReview ? JSON.parse(rawReview) : [];
                if (!Array.isArray(reviewQueue)) reviewQueue = [];
                reviewQueue.unshift({
                    id: newCartoonItem.id,
                    type: 'cartoon',
                    title: newCartoonItem.title,
                    category: newCartoonItem.category,
                    artist: authorName,
                    uploaderRole: userRole,
                    image: newCartoonItem.image,
                    date: dateStr,
                    rawDate: rawDateStr,
                    fileSize: newCartoonItem.fileSize,
                    status: 'Pending with Head',
                    remarks: ''
                });
                localStorage.setItem('articleCoverReviewQueue_v1', JSON.stringify(reviewQueue));
            } catch (err) {
                console.warn('Failed syncing to article cover review queue', err);
            }

            // 3. Log to Activity Logs
            try {
                const rawLogs = localStorage.getItem(ACTIVITY_LOG_KEY);
                let logs = rawLogs ? JSON.parse(rawLogs) : [];
                if (!Array.isArray(logs)) logs = [];
                const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                logs.unshift({
                    id: 'act-ch-' + Date.now(),
                    causer: authorName,
                    causerRole: userRole,
                    causerAvatar: 'images/member-placeholder.svg',
                    action: 'submitted',
                    subjectType: 'Editorial Cartoon',
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

            showToast('Cartoon submitted successfully to Cartoon Desk!', 'success');
        });
    }

});
