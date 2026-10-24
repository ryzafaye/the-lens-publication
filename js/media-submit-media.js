/**
 * ============================================================================
 * THE LENS — MEDIA & COMMUNICATION SUBMIT PUBMAT CONTROLLER
 * Handles submission of PUBMAT graphics to Media Desk review queue
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. DOM Elements
    const form = document.getElementById('media-submission-form');
    const dropzone = document.getElementById('media-dropzone');
    const fileInput = document.getElementById('media-file-input');
    const previewContainer = document.getElementById('media-preview-container');
    const previewImg = document.getElementById('media-preview-img');
    const removePreviewBtn = document.getElementById('btn-remove-preview');
    const fileInfoBar = document.getElementById('media-file-info-bar');
    const fileNameEl = document.getElementById('media-file-name');
    const fileSizeEl = document.getElementById('media-file-size');

    const titleInput = document.getElementById('pubmat-title');
    const categorySelect = document.getElementById('pubmat-category');
    const captionInput = document.getElementById('pubmat-caption');

    const btnSaveDraft = document.getElementById('btn-save-draft');
    const toastContainer = document.getElementById('toast-container');

    let currentImageDataUrl = '';
    let currentFileName = '';
    let currentFileSize = '';

    const DRAFT_KEY = 'mediaTeamPubmatDraft_v1';
    const QUEUE_KEY = 'articleCoverReviewQueue_v1';
    const SUBMISSIONS_KEY = 'mediaTeamSubmissions_v1';
    const ACTLOG_KEY = 'mpcActivityLogs_v1';

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

    // 3. File Upload & Preview
    function setPreviewImage(src, name = 'PUBMAT Graphic Asset', size = '') {
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

        // Auto-fill title if empty
        if (titleInput && !titleInput.value.trim() && name) {
            const cleanTitle = name
                .replace(/\.[^/.]+$/, '')
                .replace(/[-_]/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            titleInput.value = cleanTitle;
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
            showToast('Please select a valid graphic file (SVG, PNG, JPG, WEBP).', 'error');
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

    // 5. Drafts Logic
    function saveDraft() {
        if (!currentImageDataUrl && (!titleInput || !titleInput.value.trim())) {
            showToast('Please upload a graphic or enter a title to save a draft.', 'error');
            return;
        }

        const draft = {
            title: titleInput ? titleInput.value.trim() : '',
            category: categorySelect ? categorySelect.value : 'Features',
            caption: captionInput ? captionInput.value.trim() : '',
            image: currentImageDataUrl,
            fileName: currentFileName,
            fileSize: currentFileSize,
            savedAt: new Date().toISOString()
        };

        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            showToast('PUBMAT submission draft saved successfully!');
        } catch (e) {
            console.warn(e);
            showToast('Could not save draft (local storage limit).', 'error');
        }
    }

    function loadDraft() {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw) return;
            const draft = JSON.parse(raw);
            if (draft.title && titleInput) titleInput.value = draft.title;
            if (draft.category && categorySelect) categorySelect.value = draft.category;
            if (draft.caption && captionInput) captionInput.value = draft.caption;
            if (draft.image) {
                setPreviewImage(draft.image, draft.fileName || 'Draft Graphic', draft.fileSize || '');
            }
        } catch (e) {
            console.warn(e);
        }
    }
    loadDraft();

    if (btnSaveDraft) btnSaveDraft.addEventListener('click', saveDraft);

    // 6. Form Submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!currentImageDataUrl) {
                showToast('Please upload a PUBMAT graphic file first.', 'error');
                if (dropzone) dropzone.scrollIntoView({ behavior: 'smooth' });
                return;
            }

            const title = titleInput ? titleInput.value.trim() : '';
            if (!title) {
                showToast('Please enter a graphic title or campaign name.', 'error');
                if (titleInput) titleInput.focus();
                return;
            }

            const category = categorySelect ? categorySelect.value : 'Features';
            const caption = captionInput ? captionInput.value.trim() : '';
            const now = new Date();
            const dateStr = formatDateDisplay(now);
            const rawDateStr = now.toISOString().split('T')[0];

            const authorName = localStorage.getItem('mediaName') || localStorage.getItem('userName') || 'Alyssa Marie Dizon';
            const userRole = localStorage.getItem('mediaRole') || 'Media & Communication';

            const newId = 'cov-' + Date.now();
            const newPubmatItem = {
                id: newId,
                type: 'pubmat',
                title: title,
                targetArticle: caption || 'Publication Material Graphic Spread',
                category: category,
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
                    subjectType: 'PUBMAT Asset',
                    subjectName: title,
                    timestampText: 'Just now',
                    formattedDate: dateStr,
                    isoDate: now.toISOString(),
                    dayGroup: 'Today'
                });
                localStorage.setItem(ACTLOG_KEY, JSON.stringify(logs));
            } catch (err) {
                console.warn('Log activity error:', err);
            }

            // D. Clear draft
            localStorage.removeItem(DRAFT_KEY);

            // E. Show success toast and redirect
            showToast('PUBMAT graphic successfully submitted to Media Desk!', 'success');
            setTimeout(() => {
                window.location.href = 'media-manage-media.html';
            }, 1000);
        });
    }

});

