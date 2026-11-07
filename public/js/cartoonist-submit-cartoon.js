/**
 * ============================================================================
 * THE LENS — CARTOONIST SUBMIT CARTOON LOGIC
 * Clean Upload Studio for Editorial Cartoons
 * Handles drag-drop, canvas compression, and queue dispatch.
 * Pushes to Cartoonist Submissions & Review Queue (Status: 'Pending with Head')
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. User & Persona Details (Hydrated dynamically from Auth)
    const cartoonistName = window.LARAVEL_USER_NAME || localStorage.getItem('cartoonistName') || localStorage.getItem('userName') || 'Cartoonist';
    const cartoonistRole = window.LARAVEL_USER_ROLE || localStorage.getItem('cartoonistRole') || 'Cartoonist';
    const cartoonistUserId = window.LARAVEL_USER_ID || localStorage.getItem('cartoonistUserId') || localStorage.getItem('userId') || '';
    const cartoonistStudentNum = window.LARAVEL_STUDENT_NUMBER || localStorage.getItem('cartoonistStudentNumber') || localStorage.getItem('studentNumber') || '';

    // 2. DOM Elements
    const form = document.getElementById('cartoon-submission-form');
    const dropzone = document.getElementById('cartoon-dropzone');
    const fileInput = document.getElementById('cartoon-file-input');
    const previewContainer = document.getElementById('cartoon-preview-container');
    const previewImg = document.getElementById('cartoon-preview-img');
    const btnRemovePreview = document.getElementById('btn-remove-preview');

    const fileInfoBar = document.getElementById('cartoon-file-info-bar');
    const fileNameEl = document.getElementById('cartoon-file-name');
    const fileSizeEl = document.getElementById('cartoon-file-size');

    const btnSubmit = document.getElementById('btn-submit-cartoon');
    const toastContainer = document.getElementById('toast-container');

    // State
    let selectedFile = null;
    let selectedImageDataUrl = '';

    // =========================================================================
    // 3. TOAST NOTIFICATION UTILITY
    // =========================================================================
    function showToast(message, type = 'success') {
        if (!toastContainer) return;
        const existingToasts = toastContainer.querySelectorAll('.toast-message');
        existingToasts.forEach(t => t.remove());

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

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 KB';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // =========================================================================
    // 4. IMAGE CANVAS COMPRESSION
    // =========================================================================
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

    // =========================================================================
    // 5. DRAG AND DROP & FILE SELECTION
    // =========================================================================
    if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());

        dropzone.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInput.click();
            }
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('dragover');
            });
        });

        dropzone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                handleFileChosen(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFileChosen(e.target.files[0]);
            }
        });
    }

    function handleFileChosen(file) {
        if (!file) return;

        const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(svg|png|jpe?g|webp)$/i)) {
            showToast('Unsupported format. Please upload SVG, PNG, JPG, or WEBP illustration.', 'error');
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            showToast('File size exceeds 15MB limit.', 'error');
            return;
        }

        selectedFile = file;

        compressImageFile(file, (compressedDataUrl) => {
            selectedImageDataUrl = compressedDataUrl;
            showFilePreview(file.name, file.size, selectedImageDataUrl);
            showToast(`Loaded ${file.name}`);
        });
    }

    function showFilePreview(fileName, fileSize, dataUrl) {
        if (previewImg) previewImg.src = dataUrl;
        if (previewContainer) previewContainer.style.display = 'flex';
        if (dropzone) dropzone.style.display = 'none';

        if (fileInfoBar) {
            fileInfoBar.style.display = 'flex';
            if (fileNameEl) fileNameEl.textContent = fileName;
            if (fileSizeEl) fileSizeEl.textContent = `• ${formatFileSize(fileSize)}`;
        }
    }

    function removePreview() {
        selectedFile = null;
        selectedImageDataUrl = '';
        if (fileInput) fileInput.value = '';
        if (previewImg) previewImg.src = '';
        if (previewContainer) previewContainer.style.display = 'none';
        if (fileInfoBar) fileInfoBar.style.display = 'none';
        if (dropzone) dropzone.style.display = 'flex';
    }

    if (btnRemovePreview) {
        btnRemovePreview.addEventListener('click', (e) => {
            e.stopPropagation();
            removePreview();
        });
    }

    // =========================================================================
    // 6. FORM SUBMISSION
    // =========================================================================
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!selectedFile || !selectedImageDataUrl) {
                showToast('Please select or drag an editorial cartoon graphic first.', 'error');
                return;
            }

            // Prevent double submission
            if (btnSubmit) {
                if (btnSubmit.disabled) return;
                btnSubmit.disabled = true;
                btnSubmit.style.opacity = '0.7';
                btnSubmit.style.pointerEvents = 'none';
                btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Submitting Cartoon...</span>`;
            }

            // Generate clean title from filename
            const cleanTitle = selectedFile.name
                .replace(/\.[^/.]+$/, '')
                .replace(/[-_]+/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            const rawDateStr = now.toISOString().split('T')[0];

            const isSectionHead = ['Cartoonist Head', 'Associate Cartoonist Head', 'Chief Cartoonist'].includes(cartoonistRole);

            const newCartoon = {
                id: 'cart-' + Date.now(),
                type: 'cartoon',
                title: cleanTitle,
                category: '',
                artist: cartoonistName,
                author: cartoonistName,
                userId: String(cartoonistUserId || '').trim(),
                userStudentNumber: String(cartoonistStudentNum || '').trim(),
                studentNumber: String(cartoonistStudentNum || '').trim(),
                uploaderRole: cartoonistRole,
                image: selectedImageDataUrl,
                date: dateStr,
                rawDate: rawDateStr,
                fileSize: formatFileSize(selectedFile.size),
                status: isSectionHead ? 'Pending EIC Review' : 'Pending with Head',
                endorsedBy: isSectionHead ? `${cartoonistName} (${cartoonistRole})` : '',
                endorsedDate: isSectionHead ? dateStr : '',
                remarks: '',
                connectedArticleId: '',
                connectedArticleTitle: '',
                connectedArticleExcerpt: '',
                connectedArticleAuthor: '',
                connectedArticleCategory: '',
                connectedArticleDate: dateStr,
                connectedArticleUrl: '',
                views: 0,
                readTime: '1 min read',
                shares: 0
            };

            // Save to cartoonistSubmissions_v1
            try {
                let submissions = (typeof getAllRawCartoonSubmissions === 'function') 
                    ? getAllRawCartoonSubmissions() 
                    : [];
                if (submissions.length === 0) {
                    const raw = localStorage.getItem('cartoonistSubmissions_v1');
                    if (raw) {
                        try { submissions = JSON.parse(raw); } catch (err) {}
                    }
                }
                submissions = submissions.filter(item => String(item.id) !== String(newCartoon.id));
                submissions.unshift(newCartoon);
                localStorage.setItem('cartoonistSubmissions_v1', JSON.stringify(submissions));
            } catch (err) {
                console.warn('Error saving to cartoonistSubmissions_v1', err);
            }

            // When submitted by Section Head, dispatch directly to EIC review queue
            if (isSectionHead) {
                try {
                    let queue = [];
                    const rawQueue = localStorage.getItem('articleCoverReviewQueue_v1');
                    if (rawQueue) {
                        const parsed = JSON.parse(rawQueue);
                        if (Array.isArray(parsed)) queue = parsed;
                    }
                    queue = queue.filter(item => String(item.id) !== String(newCartoon.id));
                    queue.unshift({
                        id: newCartoon.id,
                        type: 'cartoon',
                        title: newCartoon.title,
                        artist: cartoonistName,
                        author: cartoonistName,
                        userId: newCartoon.userId,
                        userStudentNumber: newCartoon.userStudentNumber,
                        uploaderRole: cartoonistRole,
                        endorsedBy: `${cartoonistName} (${cartoonistRole})`,
                        image: newCartoon.image,
                        date: dateStr,
                        rawDate: rawDateStr,
                        fileSize: newCartoon.fileSize,
                        status: 'Pending EIC Review',
                        remarks: ''
                    });
                    localStorage.setItem('articleCoverReviewQueue_v1', JSON.stringify(queue));
                } catch (err) {
                    console.warn('Error syncing to EIC review queue:', err);
                }
            }

            // Backend sync to persist ArticleImage in database
            const formData = new FormData();
            if (selectedFile) {
                formData.append('cartoon_file', selectedFile);
            }
            formData.append('image', selectedImageDataUrl);
            formData.append('title', cleanTitle);

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                || document.querySelector('input[name="_token"]')?.value;

            const dispatchBackend = async () => {
                try {
                    if (csrfToken) {
                        const res = await fetch('/cartoonist/submit-cartoon', {
                            method: 'POST',
                            headers: {
                                'X-CSRF-TOKEN': csrfToken,
                                'Accept': 'application/json'
                            },
                            body: formData
                        });
                        const data = await res.json();
                        if (data && data.cartoon && data.cartoon.id) {
                            newCartoon.id = String(data.cartoon.id);
                            if (data.cartoon.image) newCartoon.image = data.cartoon.image;
                            try {
                                let subs = JSON.parse(localStorage.getItem('cartoonistSubmissions_v1') || '[]');
                                subs = subs.map(s => s.id === ('cart-' + Date.now()) ? newCartoon : s);
                                localStorage.setItem('cartoonistSubmissions_v1', JSON.stringify(subs));
                            } catch (e) {}
                        }
                    }
                } catch (err) {
                    console.warn('Backend cartoon sync warning:', err);
                } finally {
                    const successMsg = isSectionHead
                        ? 'Cartoon illustration submitted successfully! Forwarded directly to Editor-in-Chief.'
                        : 'Cartoon illustration submitted successfully to the Cartoonist Head!';

                    showToast(successMsg, 'success');

                    setTimeout(() => {
                        window.location.href = window.CARTOONIST_MANAGE_CARTOONS_ROUTE || '/cartoonist/manage-cartoons';
                    }, 800);
                }
            };

            dispatchBackend();
        });
    }

});
