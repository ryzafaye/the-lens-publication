/**
 * ============================================================================
 * THE LENS — CARTOONIST SUBMIT CARTOON LOGIC
 * Clean Upload Studio for Editorial Cartoons
 * Pushes to Cartoonist Submissions & Review Queue (Status: 'Pending with Head')
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. User & Persona Details
    const cartoonistName = localStorage.getItem('cartoonistName') || localStorage.getItem('userName') || 'Raphael Luna';
    const cartoonistRole = localStorage.getItem('cartoonistRole') || 'Cartoonist';

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
        if (bytes < 1024) return `${bytes} B`;
        const kb = bytes / 1024;
        if (kb < 1024) return `${Math.round(kb)} KB`;
        const mb = kb / 1024;
        return `${mb.toFixed(1)} MB`;
    }

    // =========================================================================
    // 4. DRAG AND DROP & FILE SELECTION
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

        // Supported formats
        const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(svg|png|jpe?g|webp)$/i)) {
            showToast('Unsupported format. Please upload SVG, PNG, JPG, or WEBP illustration.', 'error');
            return;
        }

        // 10MB limit
        if (file.size > 10 * 1024 * 1024) {
            showToast('File size exceeds the 10MB limit. Please upload a smaller graphic.', 'error');
            return;
        }

        selectedFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            selectedImageDataUrl = e.target.result;
            showFilePreview(file.name, file.size, selectedImageDataUrl);
        };
        reader.readAsDataURL(file);
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
    // 5. FORM SUBMISSION
    // =========================================================================
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!selectedFile || !selectedImageDataUrl) {
                showToast('Please select or drag an editorial cartoon graphic first.', 'error');
                return;
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

            const newCartoon = {
                id: 'cart-' + Date.now(),
                type: 'cartoon',
                title: cleanTitle,
                category: 'Opinion',
                artist: cartoonistName,
                uploaderRole: cartoonistRole,
                image: selectedImageDataUrl,
                date: dateStr,
                rawDate: rawDateStr,
                fileSize: formatFileSize(selectedFile.size),
                status: 'Pending with Head',
                remarks: '',
                connectedArticleId: '',
                connectedArticleTitle: '',
                connectedArticleExcerpt: '',
                connectedArticleAuthor: '',
                connectedArticleCategory: 'Opinion',
                connectedArticleDate: dateStr,
                connectedArticleUrl: '',
                views: 0,
                readTime: '1 min read',
                shares: 0
            };

            // Save to cartoonistSubmissions_v1
            let submissions = (typeof getCartoonSubmissions === 'function') ? getCartoonSubmissions() : [];
            submissions.unshift(newCartoon);
            if (typeof saveCartoonSubmissions === 'function') {
                saveCartoonSubmissions(submissions);
            } else {
                localStorage.setItem('cartoonistSubmissions_v1', JSON.stringify(submissions));
            }

            // Also push to review queue (articleCoverReviewQueue_v1)
            try {
                let queue = [];
                const rawQueue = localStorage.getItem('articleCoverReviewQueue_v1');
                if (rawQueue) {
                    const parsed = JSON.parse(rawQueue);
                    if (Array.isArray(parsed)) queue = parsed;
                }
                queue.unshift({
                    id: newCartoon.id,
                    type: 'cartoon',
                    title: newCartoon.title,
                    category: newCartoon.category,
                    artist: cartoonistName,
                    uploaderRole: cartoonistRole,
                    image: newCartoon.image,
                    date: dateStr,
                    rawDate: rawDateStr,
                    fileSize: newCartoon.fileSize,
                    status: 'submitted_to_mpc',
                    remarks: ''
                });
                localStorage.setItem('articleCoverReviewQueue_v1', JSON.stringify(queue));
            } catch (err) {
                console.warn('Error syncing to review queue:', err);
            }

            // Disable submit button and provide feedback
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting...`;
            }

            showToast('Cartoon illustration submitted successfully to the editorial desk!', 'success');

            setTimeout(() => {
                window.location.href = 'cartoonist-manage-cartoons.html';
            }, 1200);
        });
    }

});

