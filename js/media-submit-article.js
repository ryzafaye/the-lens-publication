/**
 * ============================================================================
 * THE LENS — SUBMIT ARTICLE LOGIC (MEDIA & COMMUNICATION TEAM PORTAL)
 * Notion / Medium Style Writing Interface with Exact Executive & M&PC Parity
 * Complete Formatting, Design & Logic Port from Executive Submit Article
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Contenteditable default paragraph separator
    try {
        document.execCommand('defaultParagraphSeparator', false, 'div');
    } catch (e) {}

    // =========================================================================
    // 1. DOM ELEMENT REFERENCES
    // =========================================================================
    // Tabs Navigation
    const tabWriteBtn = document.getElementById('tab-write-btn');
    const tabDraftsBtn = document.getElementById('tab-drafts-btn');
    const writeView = document.getElementById('write-view');
    const draftsView = document.getElementById('drafts-view');
    const draftsCountBadge = document.getElementById('drafts-count-badge');

    // Write View Elements
    const headlineInput = document.getElementById('article-headline');
    const headlineWrapper = document.getElementById('headline-box-wrapper');
    const headlineCharCount = document.getElementById('headline-char-count');

    const categorySelect = document.getElementById('article-category');
    const categorySelectContainer = document.getElementById('category-select-container');
    const authorNameDisplay = document.getElementById('author-name-display');

    const excerptInput = document.getElementById('article-excerpt');
    const excerptWrapper = document.getElementById('excerpt-box-wrapper');
    const excerptCharCount = document.getElementById('excerpt-char-count');

    const editorContent = document.getElementById('editor-content');
    const editorWrapper = document.getElementById('editor-body-wrapper');
    const toolbar = document.getElementById('editor-toolbar');

    const wordsCountEl = document.getElementById('words-count');
    const charsCountEl = document.getElementById('chars-count');

    const saveDraftBtn = document.getElementById('btn-save-draft');
    const submitArticleBtn = document.getElementById('btn-submit-article');

    // Drafts View Elements
    const draftsListContainer = document.getElementById('drafts-list-container');
    const emptyDraftsState = document.getElementById('empty-drafts-state');

    // Toast Container
    const toastContainer = document.getElementById('toast-container');

    // Active state tracker for editing existing draft
    let activeEditingDraftId = null;

    // =========================================================================
    // 2. AUTHOR BYLINE & ROLE INITIALIZATION
    // =========================================================================
    const currentUserRole = localStorage.getItem('mediaRole') || localStorage.getItem('userRole') || 'Media & Communication';
    const currentUserName = localStorage.getItem('mediaName') || localStorage.getItem('userName') || 'Alyssa Marie Dizon';

    if (authorNameDisplay) {
        authorNameDisplay.textContent = currentUserName;
    }

    // =========================================================================
    // 3. TOAST NOTIFICATION HELPER (Executive Green Bullet Dot Style)
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

        // Dismiss existing toast immediately to prevent stacking or flashing
        const existingToasts = toastContainer.querySelectorAll('.toast-message');
        existingToasts.forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;

        // Default executive styling: bullet dot on dark pill
        toast.innerHTML = `<span class="toast-bullet-dot"></span><span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-dismissing');
            setTimeout(() => toast.remove(), 260);
        }, 3400);
    }

    // =========================================================================
    // 4. DRAFTS DATASET MANAGEMENT (localStorage)
    // =========================================================================
    const DRAFTS_STORAGE_KEY = 'mediaArticleDrafts_v1';

    const defaultDrafts = [
        {
            id: 'med-draft-01',
            title: "Investigation: The evolving dynamics of campus social graphics and news distribution",
            category: "Features",
            excerpt: "An inquiry into digital readership metrics, infographic retention, and print pickup points across campus libraries.",
            date: "Oct 22, 2026",
            rawDate: "2026-10-22",
            content: `<div>An inquiry into digital readership metrics, infographic retention, and print pickup points across campus libraries.</div><div><br></div><div>Student readership patterns demonstrate an increasing preference for verified bite-sized summaries paired with comprehensive digital investigation manuscripts.</div>`
        },
        {
            id: 'med-draft-02',
            title: "Digital divide persists as student WiFi coverage drops in outer laboratories",
            category: "Science and Technology",
            excerpt: "Bandwidth testing across student dormitories and satellite laboratories reveals stark regional disparities in high-speed access.",
            date: "Oct 19, 2026",
            rawDate: "2026-10-19",
            content: `<div>Bandwidth testing across student dormitories and satellite laboratories reveals stark regional disparities in high-speed access.</div><div><br></div><div>Technical testing conducted across engineering computer clusters revealed recurring network drops during peak evening hours.</div>`
        }
    ];

    function loadDraftsFromStorage() {
        try {
            const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.warn('Could not read mediaArticleDrafts from localStorage:', e);
        }
        return JSON.parse(JSON.stringify(defaultDrafts));
    }

    function saveDraftsToStorage(drafts) {
        try {
            localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
        } catch (e) {
            console.warn('Could not write mediaArticleDrafts to localStorage:', e);
        }
    }

    let draftsList = loadDraftsFromStorage();

    function updateDraftsBadge() {
        if (draftsCountBadge) {
            draftsCountBadge.textContent = draftsList.length;
        }
    }
    updateDraftsBadge();

    // =========================================================================
    // 5. TAB SWITCHING LOGIC ("Write Article" vs "Drafts")
    // =========================================================================
    function switchTab(targetTab) {
        if (targetTab === 'write') {
            if (tabWriteBtn) {
                tabWriteBtn.classList.add('active');
                tabWriteBtn.setAttribute('aria-selected', 'true');
            }
            if (tabDraftsBtn) {
                tabDraftsBtn.classList.remove('active');
                tabDraftsBtn.setAttribute('aria-selected', 'false');
            }
            if (writeView) writeView.classList.remove('hidden');
            if (draftsView) draftsView.classList.add('hidden');
        } else if (targetTab === 'drafts') {
            if (tabDraftsBtn) {
                tabDraftsBtn.classList.add('active');
                tabDraftsBtn.setAttribute('aria-selected', 'true');
            }
            if (tabWriteBtn) {
                tabWriteBtn.classList.remove('active');
                tabWriteBtn.setAttribute('aria-selected', 'false');
            }
            if (draftsView) draftsView.classList.remove('hidden');
            if (writeView) writeView.classList.add('hidden');

            renderDraftsList();
        }
    }

    if (tabWriteBtn) {
        tabWriteBtn.addEventListener('click', () => switchTab('write'));
    }
    if (tabDraftsBtn) {
        tabDraftsBtn.addEventListener('click', () => switchTab('drafts'));
    }

    // =========================================================================
    // 6. BIG BOX HEADLINE INPUT AUTO-GROW & CHAR COUNT (255 LIMIT)
    // Headline is enforced as a continuous single sentence (No Enter/Newlines)
    // =========================================================================
    function autoResizeHeadline() {
        if (!headlineInput) return;
        headlineInput.style.height = 'auto';
        const scrollH = headlineInput.scrollHeight;

        // Clamp between minimum 56px and maximum 180px
        const clampedHeight = Math.max(56, Math.min(scrollH, 180));
        headlineInput.style.height = `${clampedHeight}px`;

        if (scrollH > 180) {
            headlineInput.style.overflowY = 'auto';
        } else {
            headlineInput.style.overflowY = 'hidden';
        }

        const length = headlineInput.value.length;
        if (headlineCharCount) {
            headlineCharCount.textContent = `${length} / 255`;
            if (length > 230) {
                headlineCharCount.classList.add('near-limit');
            } else {
                headlineCharCount.classList.remove('near-limit');
            }
        }

        if (headlineInput.value.trim().length > 0 && headlineWrapper) {
            headlineWrapper.classList.remove('input-invalid');
        }
    }

    if (headlineWrapper && headlineInput) {
        headlineWrapper.addEventListener('click', () => {
            headlineInput.focus();
        });
    }

    if (headlineInput) {
        headlineInput.addEventListener('input', () => {
            if (/[\r\n]/.test(headlineInput.value)) {
                const caret = headlineInput.selectionStart;
                headlineInput.value = headlineInput.value.replace(/[\r\n]+/g, ' ');
                if (caret !== null) headlineInput.setSelectionRange(caret, caret);
            }
            autoResizeHeadline();
        });

        // Headline must be a continuous single line: prevent Enter from creating newlines
        headlineInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                showToast('Article headlines must be a single continuous sentence without line breaks.', 'warning');
                if (excerptInput) {
                    excerptInput.focus();
                } else if (editorContent) {
                    editorContent.focus();
                }
            }
        });

        // Flatten any pasted multi-line text into a single continuous sentence
        headlineInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text') || '';
            const cleanText = text.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ');
            const start = headlineInput.selectionStart || 0;
            const end = headlineInput.selectionEnd || 0;
            const currentVal = headlineInput.value || '';
            const max = parseInt(headlineInput.getAttribute('maxlength') || '255', 10);
            const combined = (currentVal.substring(0, start) + cleanText + currentVal.substring(end)).slice(0, max);
            headlineInput.value = combined;
            const newPos = Math.min(start + cleanText.length, combined.length);
            headlineInput.setSelectionRange(newPos, newPos);
            headlineInput.dispatchEvent(new Event('input'));
        });
    }

    // =========================================================================
    // 7. EXCERPT FIELD (255 LIMIT)
    // =========================================================================
    function handleExcerptInput() {
        if (!excerptInput) return;
        const length = excerptInput.value.length;
        if (excerptCharCount) {
            excerptCharCount.textContent = `${length} / 255`;
            if (length > 230) {
                excerptCharCount.classList.add('near-limit');
            } else {
                excerptCharCount.classList.remove('near-limit');
            }
        }

        excerptInput.style.height = 'auto';
        excerptInput.style.height = `${Math.max(68, excerptInput.scrollHeight)}px`;

        if (excerptInput.value.trim().length > 0 && excerptWrapper) {
            excerptWrapper.classList.remove('input-invalid');
        }
    }

    if (excerptInput) {
        excerptInput.addEventListener('input', handleExcerptInput);
        excerptInput.addEventListener('change', handleExcerptInput);
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            if (categorySelect.value) {
                categorySelect.classList.remove('input-invalid');
            }
        });
    }

    // =========================================================================
    // 8. NOTION / MEDIUM RICH TEXT FORMATTING TOOLBAR
    // =========================================================================
    let savedSelectionRange = null;

    function saveSelection() {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            savedSelectionRange = sel.getRangeAt(0).cloneRange();
        }
    }

    function restoreSelection() {
        if (!savedSelectionRange) return;
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedSelectionRange);
    }

    if (editorContent) {
        editorContent.addEventListener('keyup', saveSelection);
        editorContent.addEventListener('mouseup', saveSelection);
        editorContent.addEventListener('touchend', saveSelection);
    }

    if (toolbar) {
        toolbar.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Keep focus inside contenteditable
            });

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.getAttribute('data-command');
                const value = btn.getAttribute('data-value') || null;

                if (!editorContent) return;
                editorContent.focus();
                restoreSelection();

                if (command === 'createLink') {
                    const url = prompt('Enter hyperlink URL:', 'https://');
                    if (url && url !== 'https://') {
                        document.execCommand('createLink', false, url);
                    }
                } else if (command === 'formatBlock') {
                    const currentBlock = document.queryCommandValue('formatBlock');
                    if (currentBlock && currentBlock.toLowerCase() === value.replace(/[<>]/g, '').toLowerCase()) {
                        document.execCommand('formatBlock', false, '<div>');
                    } else {
                        document.execCommand('formatBlock', false, value);
                    }
                } else {
                    document.execCommand(command, false, value);
                }

                updateToolbarActiveStates();
                updateWordAndCharCount();
            });
        });
    }

    function updateToolbarActiveStates() {
        if (!toolbar) return;
        toolbar.querySelectorAll('.tool-btn').forEach(btn => {
            const command = btn.getAttribute('data-command');
            const value = btn.getAttribute('data-value');

            try {
                if (command === 'formatBlock' && value) {
                    const cur = document.queryCommandValue('formatBlock');
                    const cleanTarget = value.replace(/[<>]/g, '').toLowerCase();
                    const cleanCurrent = (cur || '').replace(/[<>]/g, '').toLowerCase();
                    btn.classList.toggle('active', cleanCurrent === cleanTarget);
                } else if (['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList'].includes(command)) {
                    const isActive = document.queryCommandState(command);
                    btn.classList.toggle('active', !!isActive);
                }
            } catch (err) {}
        });
    }

    if (editorContent) {
        ['keyup', 'mouseup', 'click'].forEach(evt => {
            editorContent.addEventListener(evt, updateToolbarActiveStates);
        });
    }

    // =========================================================================
    // 9. LIVE WORD & CHARACTER COUNT
    // =========================================================================
    function updateWordAndCharCount() {
        if (!editorContent) return;
        const text = editorContent.innerText || '';
        const cleanText = text.replace(/[\r\n]+/g, ' ').trim();
        const words = cleanText ? cleanText.split(/\s+/).length : 0;
        const chars = text.length;

        if (wordsCountEl) wordsCountEl.textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
        if (charsCountEl) charsCountEl.textContent = `${chars} ${chars === 1 ? 'character' : 'characters'}`;

        if (chars > 15 && editorWrapper) {
            editorWrapper.classList.remove('input-invalid');
        }
    }

    if (editorContent) {
        editorContent.addEventListener('input', updateWordAndCharCount);
    }

    // =========================================================================
    // 10. DRAFTS VIEW RENDERING (Exact Executive & M&PC Parity Layout)
    // =========================================================================
    function renderDraftsList() {
        if (!draftsListContainer) return;

        updateDraftsBadge();

        if (draftsList.length === 0) {
            draftsListContainer.innerHTML = '';
            if (emptyDraftsState) emptyDraftsState.classList.remove('hidden');
            return;
        }

        if (emptyDraftsState) emptyDraftsState.classList.add('hidden');

        draftsListContainer.innerHTML = draftsList.map(draft => `
            <div class="draft-box" id="draft-box-${draft.id}" data-id="${draft.id}">
                <!-- Left Stack: Meta (Category + Saved Date), Bold Title, Excerpt Teaser -->
                <div class="draft-box-content">
                    <div class="draft-box-meta">
                        <span class="draft-box-category">${escapeHTML(draft.category || 'Draft')}</span>
                        <span class="draft-box-date">
                            <i class="fa-regular fa-calendar" aria-hidden="true"></i> Saved ${escapeHTML(draft.date)}
                        </span>
                    </div>

                    <button type="button" class="draft-box-title" data-action="edit" data-id="${draft.id}" title="${escapeHTML(draft.title)}">
                        ${escapeHTML(draft.title)}
                    </button>

                    ${draft.excerpt ? `<p class="draft-box-excerpt">${escapeHTML(draft.excerpt)}</p>` : ''}
                </div>

                <!-- Right Actions: Edit Draft (Pencil) & Delete (Red Trash) -->
                <div class="draft-box-actions">
                    <button type="button" class="btn-draft-edit" data-action="edit" data-id="${draft.id}" title="Edit this draft">
                        <i class="fa-solid fa-pen"></i>
                        <span>Edit Draft</span>
                    </button>
                    <button type="button" class="btn-draft-delete" data-action="delete" data-id="${draft.id}" title="Delete draft">
                        <i class="fa-regular fa-trash-can"></i>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Event delegation on Drafts List (Clicking draft card or title or edit button loads it)
    if (draftsListContainer) {
        draftsListContainer.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('[data-action="delete"]');
            if (deleteBtn) {
                e.stopPropagation();
                deleteDraftAction(deleteBtn.dataset.id);
                return;
            }

            const draftBox = e.target.closest('.draft-box');
            if (draftBox) {
                const id = draftBox.dataset.id;
                if (id) {
                    editDraftAction(id);
                }
            }
        });
    }

    // =========================================================================
    // 11. DRAFT ACTIONS: SAVE DRAFT, EDIT DRAFT, DELETE DRAFT
    // =========================================================================
    function clearFormFields() {
        if (headlineInput) {
            headlineInput.value = '';
            autoResizeHeadline();
        }
        if (excerptInput) {
            excerptInput.value = '';
            handleExcerptInput();
        }
        if (categorySelect) {
            categorySelect.value = '';
            categorySelect.classList.remove('input-invalid');
        }
        if (editorContent) {
            editorContent.innerHTML = '';
            updateWordAndCharCount();
        }
        if (headlineWrapper) headlineWrapper.classList.remove('input-invalid');
        if (excerptWrapper) excerptWrapper.classList.remove('input-invalid');
        if (editorWrapper) editorWrapper.classList.remove('input-invalid');

        activeEditingDraftId = null;
    }

    function saveDraftAction() {
        const headline = headlineInput ? headlineInput.value.trim() : '';
        const excerpt = excerptInput ? excerptInput.value.trim() : '';
        const category = categorySelect ? categorySelect.value : '';
        const bodyHtml = editorContent ? editorContent.innerHTML : '';
        const bodyText = editorContent ? editorContent.innerText.trim() : '';

        // Validation for Draft: Require at least a Title or Content
        if (!headline && !bodyText) {
            if (headlineWrapper) {
                headlineWrapper.classList.add('input-invalid');
                headlineInput.focus();
            }
            showToast('Please provide at least a title or text to save as draft.', 'warning');
            return;
        }

        const currentDate = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const draftEntry = {
            id: activeEditingDraftId || `med-draft-${Date.now()}`,
            title: headline || 'Untitled Draft',
            category: category || 'News',
            excerpt: excerpt,
            date: currentDate,
            rawDate: new Date().toISOString().split('T')[0],
            content: bodyHtml
        };

        if (activeEditingDraftId) {
            const index = draftsList.findIndex(d => String(d.id) === String(activeEditingDraftId));
            if (index !== -1) {
                draftsList[index] = draftEntry;
            } else {
                draftsList.unshift(draftEntry);
            }
        } else {
            draftsList.unshift(draftEntry);
        }

        // Persist to localStorage
        saveDraftsToStorage(draftsList);
        updateDraftsBadge();

        // Show toast notification
        showToast('Draft saved successfully', 'success');

        // Clear form fields per Executive logic
        clearFormFields();

        // Update rendered list in Drafts tab
        renderDraftsList();
    }

    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', saveDraftAction);
    }

    // Keyboard shortcut Ctrl+S / Cmd+S
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveDraftAction();
        }
    });

    function findArticleOrDraft(id) {
        if (!id) return null;

        // 1. Check in draftsList (from mediaArticleDrafts_v1)
        let found = draftsList.find(d => String(d.id) === String(id));
        if (found) return found;

        // 2. Check in theLensMediaArticles_v1
        try {
            const raw = localStorage.getItem('theLensMediaArticles_v1');
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list)) {
                    found = list.find(a => String(a.id) === String(id));
                    if (found) return found;
                }
            }
        } catch (e) {}

        return null;
    }

    function editDraftAction(draftId) {
        const draft = findArticleOrDraft(draftId);
        if (!draft) return;

        activeEditingDraftId = draft.id;

        if (headlineInput) {
            headlineInput.value = draft.title || '';
            autoResizeHeadline();
        }
        if (excerptInput) {
            excerptInput.value = draft.excerpt || '';
            handleExcerptInput();
        }
        if (categorySelect) {
            categorySelect.value = draft.category || '';
            categorySelect.classList.remove('input-invalid');
        }
        if (editorContent) {
            editorContent.innerHTML = draft.content || '';
            updateWordAndCharCount();
        }

        switchTab('write');
        showToast('Draft loaded into writing canvas');
    }

    function deleteDraftAction(draftId) {
        if (!draftId) return;

        const draftBox = document.getElementById(`draft-box-${draftId}`);
        if (draftBox) {
            draftBox.classList.add('box-fade-out');
        }

        setTimeout(() => {
            draftsList = draftsList.filter(d => String(d.id) !== String(draftId));
            saveDraftsToStorage(draftsList);
            updateDraftsBadge();
            renderDraftsList();
            showToast('Draft deleted successfully', 'success');
        }, 220);
    }

    // =========================================================================
    // 12. FORM VALIDATION & ARTICLE SUBMISSION
    // =========================================================================
    function validateSubmitForm() {
        let isValid = true;
        let firstInvalidElement = null;

        const headline = headlineInput ? headlineInput.value.trim() : '';
        const category = categorySelect ? categorySelect.value : '';
        const excerpt = excerptInput ? excerptInput.value.trim() : '';
        const bodyText = editorContent ? editorContent.innerText.trim() : '';

        // 1. Headline Validation (min 5 chars)
        if (!headline || headline.length < 5) {
            isValid = false;
            if (headlineWrapper) {
                headlineWrapper.classList.add('input-invalid');
                if (!firstInvalidElement) firstInvalidElement = headlineInput;
            }
        } else if (headlineWrapper) {
            headlineWrapper.classList.remove('input-invalid');
        }

        // 2. Category Validation
        const validCategories = [
            'News',
            'Opinions',
            'Features',
            'Science and Technology',
            'Literature'
        ];

        if (!category || !validCategories.includes(category)) {
            isValid = false;
            if (categorySelect) {
                categorySelect.classList.add('input-invalid');
                if (!firstInvalidElement) firstInvalidElement = categorySelect;
            }
        } else if (categorySelect) {
            categorySelect.classList.remove('input-invalid');
        }

        // 3. Excerpt Validation (All fields required, min 5 chars)
        if (!excerpt || excerpt.length < 5) {
            isValid = false;
            if (excerptWrapper) {
                excerptWrapper.classList.add('input-invalid');
                if (!firstInvalidElement) firstInvalidElement = excerptInput;
            }
        } else if (excerptWrapper) {
            excerptWrapper.classList.remove('input-invalid');
        }

        // 4. Body Validation (min 20 chars)
        if (!bodyText || bodyText.length < 20) {
            isValid = false;
            if (editorWrapper) {
                editorWrapper.classList.add('input-invalid');
                if (!firstInvalidElement) firstInvalidElement = editorContent;
            }
        } else if (editorWrapper) {
            editorWrapper.classList.remove('input-invalid');
        }

        if (!isValid) {
            showToast('Please complete all required fields (Title, Section, Excerpt, and Body).', 'warning');
            if (firstInvalidElement) {
                firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalidElement.focus();
            }
        }

        return isValid;
    }

    function submitArticle() {
        if (!validateSubmitForm()) {
            return;
        }

        const headline = headlineInput.value.trim();
        const category = categorySelect.value;
        const excerpt = excerptInput ? excerptInput.value.trim() : '';
        const authorName = currentUserName;

        const newSubmissionId = `med-sub-${Date.now()}`;
        const currentDate = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        const currentIsoDate = new Date().toISOString().split('T')[0];

        const newSubmission = {
            id: newSubmissionId,
            writerId: 'alyssa-dizon',
            author: authorName,
            title: headline,
            category: category,
            excerpt: excerpt,
            date: currentDate,
            rawDate: currentIsoDate,
            status: 'Pending Review',
            views: 0,
            shares: 0,
            remarks: '',
            content: editorContent.innerText.trim()
        };

        try {
            // A. Push to Media Articles (theLensMediaArticles_v1)
            let mediaArticles = (typeof getMediaArticles === 'function') ? getMediaArticles() : [];
            mediaArticles.unshift(newSubmission);
            if (typeof saveMediaArticles === 'function') {
                saveMediaArticles(mediaArticles);
            } else {
                localStorage.setItem('theLensMediaArticles_v1', JSON.stringify(mediaArticles));
            }

            // B. Push to Executive / Section Head Review Queue
            let pendingQueue = [];
            const storedQueue = localStorage.getItem('executivePendingReviewQueue') || localStorage.getItem('eicPendingReviewQueue');
            if (storedQueue) {
                try {
                    const parsed = JSON.parse(storedQueue);
                    if (Array.isArray(parsed)) pendingQueue = parsed;
                } catch (e) {
                    pendingQueue = [];
                }
            }
            pendingQueue.unshift({
                ...newSubmission,
                status: 'pending'
            });
            localStorage.setItem('executivePendingReviewQueue', JSON.stringify(pendingQueue));
            localStorage.setItem('eicPendingReviewQueue', JSON.stringify(pendingQueue));

            // C. Sync to Writer Articles persistence
            try {
                const rawWriter = localStorage.getItem('theLensWriterArticles_v3');
                if (rawWriter) {
                    const wList = JSON.parse(rawWriter);
                    wList.unshift(newSubmission);
                    localStorage.setItem('theLensWriterArticles_v3', JSON.stringify(wList));
                }
            } catch (e) {}

            // D. Remove from drafts if this was loaded from a draft
            if (activeEditingDraftId) {
                draftsList = draftsList.filter(d => String(d.id) !== String(activeEditingDraftId));
                saveDraftsToStorage(draftsList);
                updateDraftsBadge();
            }

            // E. Activity Logging in Executive sentence format
            try {
                let logs = [];
                const rawLogs = localStorage.getItem('mpcActivityLogs_v1');
                if (rawLogs) logs = JSON.parse(rawLogs);
                logs.unshift({
                    id: 'act-' + Date.now(),
                    causer: authorName,
                    causerRole: currentUserRole,
                    action: 'submitted',
                    subjectType: 'Article',
                    subjectName: headline,
                    timestampText: 'Just now',
                    formattedDate: currentDate,
                    isoDate: new Date().toISOString(),
                    dayGroup: 'Today'
                });
                localStorage.setItem('mpcActivityLogs_v1', JSON.stringify(logs));
            } catch (err) {}

            // Disable button & give success feedback
            if (submitArticleBtn) {
                submitArticleBtn.disabled = true;
                submitArticleBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Submitting...</span>`;
            }

            showToast('Article successfully submitted to editorial review queue!', 'success');

            setTimeout(() => {
                window.location.href = 'media-manage-articles.html';
            }, 1000);

        } catch (err) {
            console.error('Submission error:', err);
            showToast('An unexpected error occurred while submitting your article.', 'error');
            if (submitArticleBtn) {
                submitArticleBtn.disabled = false;
                submitArticleBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> <span>Submit Article</span>`;
            }
        }
    }

    if (submitArticleBtn) {
        submitArticleBtn.addEventListener('click', submitArticle);
    }

    // =========================================================================
    // 13. URL PARAMETER HANDLING (?draftId=...)
    // =========================================================================
    const urlParams = new URLSearchParams(window.location.search);
    const draftIdParam = urlParams.get('draftId');
    if (draftIdParam) {
        editDraftAction(draftIdParam);
    }

    // Initial headline resize check
    autoResizeHeadline();
    renderDraftsList();
});
