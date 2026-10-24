/**
 * ============================================================================
 * THE LENS — SUBMIT PUBMAT CONTROLLER (M&PC PORTAL)
 * Exclusively handles submission of PUBMAT (Publication Materials) for M&PC
 * Features:
 * - Dedicated PUBMAT upload studio
 * - Drag & drop file upload with live image preview & file details info bar
 * - One-click sample preset (CSC Audit Infographic)
 * - Sync to articleCoverReviewQueue_v1 (Media Desk queue under PUBMAT tab)
 * - Activity log sync to mpcActivityLogs_v1
 * - Draft saving & My Submissions review list
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

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

    // Buttons & Tabs
    const btnSaveDraft = document.getElementById('btn-save-draft');
    const tabUpload = document.getElementById('tab-upload-media');
    const tabMySubmissions = document.getElementById('tab-my-media');
    const viewUpload = document.getElementById('view-upload-media');
    const viewSubmissions = document.getElementById('view-my-submissions');
    const submissionsGrid = document.getElementById('submissions-grid');
    const submissionsEmpty = document.getElementById('submissions-empty');
    const badgeCount = document.getElementById('badge-my-media-count');
    const toastContainer = document.getElementById('toast-container');

    let currentImageDataUrl = '';
    let currentFileName = '';
    let currentFileSize = '';

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
    // 3. FILE UPLOAD & PREVIEW LOGIC (PUBMAT ONLY)
    // =========================================================================
    function setPreviewImage(src, name = 'Pubmat Graphic Asset', size = '') {
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
            showToast('File size exceeds 10MB limit.', 'error');
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
    // 4. DRAFTS PERSISTENCE
    // =========================================================================
    const DRAFT_KEY = 'mpcPubmatSubmissionDraft_v1';

    function saveDraft() {
        if (!currentImageDataUrl) {
            showToast('Please upload or load a PUBMAT graphic first.', 'error');
            return;
        }
        const draft = {
            type: 'pubmat',
            fileName: currentFileName || 'pubmat-draft.svg',
            fileSize: currentFileSize || '',
            image: currentImageDataUrl,
            savedAt: new Date().toISOString()
        };
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            showToast('PUBMAT draft saved successfully!');
        } catch (e) {
            console.warn(e);
            showToast('Could not save draft (storage limit).', 'error');
        }
    }

    function loadDraft() {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw) return;
            const draft = JSON.parse(raw);
            if (draft.image) {
                setPreviewImage(draft.image, draft.fileName || 'Saved Pubmat Draft', draft.fileSize || '');
            }
        } catch (e) {
            console.warn(e);
        }
    }

    if (btnSaveDraft) {
        btnSaveDraft.addEventListener('click', saveDraft);
    }

    // =========================================================================
    // 5. FORM SUBMISSION -> DISPATCH PUBMAT TO MEDIA DESK QUEUE
    // =========================================================================
    const MEDIA_DESK_QUEUE_KEY = 'articleCoverReviewQueue_v1';
    const MY_SUBMISSIONS_KEY = 'mpcUserPubmatSubmissions_v1';
    const ACTIVITY_LOG_KEY = 'mpcActivityLogs_v1';

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!currentImageDataUrl) {
                showToast('Please upload or select a PUBMAT file first.', 'error');
                if (dropzone) dropzone.scrollIntoView({ behavior: 'smooth' });
                return;
            }

            const now = new Date();
            const dateStr = formatDateDisplay(now);
            const rawDateStr = now.toISOString().split('T')[0];

            // Generate clean title from file name
            let cleanTitle = 'Publication Material Banner';
            if (currentFileName) {
                cleanTitle = currentFileName
                    .replace(/\.[^/.]+$/, '')
                    .replace(/[-_]/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());
            }

            const newPubmatItem = {
                id: 'cov-' + Date.now(),
                type: 'pubmat',
                title: cleanTitle,
                targetArticle: cleanTitle,
                category: 'News',
                artist: 'Julian Del Rosario',
                approvedBy: 'Media & Public Communications Head',
                image: currentImageDataUrl,
                date: dateStr,
                rawDate: rawDateStr,
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

            // 3. Log to Activity Logs (Executive sentence parity)
            try {
                const rawLogs = localStorage.getItem(ACTIVITY_LOG_KEY);
                let logs = rawLogs ? JSON.parse(rawLogs) : [];
                if (!Array.isArray(logs)) logs = [];
                const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                logs.unshift({
                    id: 'mpc-act-' + Date.now(),
                    causer: localStorage.getItem('mpcName') || 'Julian Del Rosario',
                    causerRole: localStorage.getItem('mpcRole') || 'M&PC Head',
                    causerAvatar: 'images/member-placeholder.svg',
                    action: 'submitted',
                    subjectType: 'PUBMAT Asset',
                    subjectName: cleanTitle,
                    timestampText: 'Just now',
                    isoDate: now.toISOString(),
                    dateKey: now.toISOString().split('T')[0],
                    formattedDate: `${dateStr} • ${timeStr}`,
                    dayGroup: 'Today'
                });
                localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs.slice(0, 40)));
            } catch (err) {
                console.warn('Failed logging activity', err);
            }

            // Clear draft
            localStorage.removeItem(DRAFT_KEY);

            // Reset form
            clearPreviewImage();

            showToast('PUBMAT submitted successfully to Media Desk!');

            // Switch to My Submissions tab
            renderSubmissions();
            switchToTab('submissions');
        });
    }

    // =========================================================================
    // 6. MY SUBMISSIONS RENDERING & TABS
    // =========================================================================
    function getMySubmissions() {
        try {
            const raw = localStorage.getItem(MY_SUBMISSIONS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.warn(e);
        }
        return [];
    }

    function renderSubmissions() {
        if (!submissionsGrid) return;
        const list = getMySubmissions();

        if (badgeCount) badgeCount.textContent = list.length;

        if (list.length === 0) {
            submissionsGrid.innerHTML = '';
            if (submissionsEmpty) {
                submissionsEmpty.style.display = 'block';
                const emptyTitle = submissionsEmpty.querySelector('h3');
                const emptyDesc = submissionsEmpty.querySelector('p');
                if (emptyTitle) emptyTitle.textContent = 'No PUBMAT Submissions Yet';
                if (emptyDesc) emptyDesc.textContent = 'Any publication materials submitted through this desk will appear here.';
            }
            return;
        }

        if (submissionsEmpty) submissionsEmpty.style.display = 'none';

        submissionsGrid.innerHTML = list.map(item => `
            <div class="sub-card">
                <div class="sub-card-thumb">
                    <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title)} Preview" loading="lazy">
                    <div style="position: absolute; top: 8px; left: 8px;">
                        <span class="cover-type-tag pubmat"><i class="fa-solid fa-palette"></i> PUBMAT</span>
                    </div>
                </div>
                <div class="sub-card-body">
                    <div class="sub-card-title">${escapeHTML(item.title)}</div>
                    <div class="sub-card-meta">
                        <i class="fa-regular fa-calendar"></i>
                        <span>Submitted: ${escapeHTML(item.date)}</span>
                    </div>
                    <div class="sub-card-meta">
                        <i class="fa-solid fa-paintbrush"></i>
                        <span>Contributor: <strong>${escapeHTML(item.artist)}</strong></span>
                    </div>
                </div>
                <div class="sub-card-footer">
                    <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 0.76rem; font-weight: 700; color: #b54708; background: #fffaeb; border: 1px solid #fedf89; padding: 2px 8px; border-radius: 10px;">
                        <i class="fa-regular fa-clock"></i>
                        <span>Pending Desk Review</span>
                    </span>
                    <a href="mpc-media-desk.html" style="font-size: 0.78rem; font-weight: 700; color: var(--sidebar-maroon, #5c0a18); text-decoration: none;">
                        <span>View in Desk</span>
                        <i class="fa-solid fa-arrow-right" style="margin-left: 4px; font-size: 0.7rem;"></i>
                    </a>
                </div>
            </div>
        `).join('');
    }

    function switchToTab(viewName) {
        if (viewName === 'upload') {
            tabUpload.classList.add('active');
            tabUpload.setAttribute('aria-selected', 'true');
            tabMySubmissions.classList.remove('active');
            tabMySubmissions.setAttribute('aria-selected', 'false');
            viewUpload.style.display = 'block';
            viewSubmissions.style.display = 'none';
        } else {
            tabMySubmissions.classList.add('active');
            tabMySubmissions.setAttribute('aria-selected', 'true');
            tabUpload.classList.remove('active');
            tabUpload.setAttribute('aria-selected', 'false');
            viewUpload.style.display = 'none';
            viewSubmissions.style.display = 'block';
            renderSubmissions();
        }
    }

    if (tabUpload) {
        tabUpload.addEventListener('click', () => switchToTab('upload'));
    }
    if (tabMySubmissions) {
        tabMySubmissions.addEventListener('click', () => switchToTab('submissions'));
    }

    // Initial setup
    loadDraft();
    renderSubmissions();

});
