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
    // Form & Upload Elements
    const form = document.getElementById('media-submission-form');
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

            // Prevent duplicate clicks
            const submitBtn = document.getElementById('btn-submit-media');
            if (submitBtn) {
                if (submitBtn.disabled) return;
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.7';
                submitBtn.style.pointerEvents = 'none';
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Submitting Photo...</span>';
            }

            // Media Team submissions are strictly for photos
            const selectedType = 'photo';

            // Derive clean title from file name
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

            const authorName = window.LARAVEL_USER_NAME || localStorage.getItem('mediaName') || localStorage.getItem('userName') || 'Media Team Member';
            const userRole = window.LARAVEL_USER_ROLE || localStorage.getItem('mediaRole') || 'Media & Communication';
            const userId = window.LARAVEL_USER_ID || localStorage.getItem('mediaUserId') || localStorage.getItem('userId') || '';
            const studentNum = window.LARAVEL_STUDENT_NUMBER || localStorage.getItem('mediaStudentNumber') || localStorage.getItem('studentNumber') || '';

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
                image: currentImageDataUrl,
                date: dateStr,
                rawDate: rawDateStr,
                fileSize: currentFileSize || '',
                status: 'Pending with Head',
                remarks: ''
            };

            // A. Push to Media Desk Review Queue (immediately available in M&PC Media Desk -> PHOTOS tab)
            try {
                let queue = [];
                const rawQueue = localStorage.getItem(QUEUE_KEY);
                if (rawQueue) queue = JSON.parse(rawQueue);
                if (!Array.isArray(queue)) queue = [];
                queue = queue.filter(item => String(item.id) !== String(newMediaItem.id));
                queue.unshift(newMediaItem);
                localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
            } catch (err) {
                console.warn('Queue storage warning:', err);
            }

            // B. Push to Personal Media Submissions (available in Manage Media)
            try {
                let userSubs = (typeof getMediaSubmissions === 'function') ? getMediaSubmissions(true) : [];
                userSubs = userSubs.filter(item => String(item.id) !== String(newMediaItem.id));
                userSubs.unshift(newMediaItem);
                if (typeof saveMediaSubmissions === 'function') {
                    saveMediaSubmissions(userSubs);
                } else {
                    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(userSubs));
                }
            } catch (err) {
                console.warn('Submissions storage warning:', err);
            }

            // C. Log Activity in Executive sentence format
            try {
                let logs = [];
                const rawLogs = localStorage.getItem(ACTLOG_KEY);
                if (rawLogs) logs = JSON.parse(rawLogs);
                if (!Array.isArray(logs)) logs = [];
                logs.unshift({
                    id: 'act-' + Date.now(),
                    causer: authorName,
                    causerRole: userRole,
                    action: 'submitted',
                    subjectType: 'Photo',
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

            // Backend sync to persist ArticleImage in database
            const formData = new FormData();
            if (fileInput && fileInput.files && fileInput.files[0]) {
                formData.append('media_file', fileInput.files[0]);
            }
            formData.append('image', currentImageDataUrl);
            formData.append('title', cleanTitle);
            formData.append('type', 'photo');

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                || document.querySelector('input[name="_token"]')?.value;

            const dispatchBackend = async () => {
                try {
                    if (csrfToken) {
                        const res = await fetch('/media/submit-media', {
                            method: 'POST',
                            headers: {
                                'X-CSRF-TOKEN': csrfToken,
                                'Accept': 'application/json'
                            },
                            body: formData
                        });
                        const data = await res.json();
                        if (data && data.media && data.media.id) {
                            newMediaItem.id = String(data.media.id);
                            if (data.media.image) newMediaItem.image = data.media.image;
                        }
                    }
                } catch (err) {
                    console.warn('Backend media sync warning:', err);
                } finally {
                    showToast('Photo submitted successfully to Media Desk!', 'success');
                    setTimeout(() => {
                        window.location.href = window.MEDIA_MANAGE_ROUTE || '/media/manage-media';
                    }, 800);
                }
            };

            dispatchBackend();
        });
    }

});
