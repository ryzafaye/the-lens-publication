/**
 * ============================================================================
 * THE LENS — SUBMIT ARTICLE LOGIC (EDITOR-IN-CHIEF / EIC PORTAL)
 * Notion / Medium Style Writing Interface with Exact Executive Parity
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
    const userRole = localStorage.getItem('eicRole') || localStorage.getItem('userRole') || 'Editor-in-Chief';
    const authorName = localStorage.getItem('eicName') || localStorage.getItem('userName') || 'Victoria Reyes';

    if (authorNameDisplay) {
        authorNameDisplay.textContent = authorName;
    }

    // =========================================================================
    // 3. TOAST NOTIFICATION HELPER
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

        const existingToasts = toastContainer.querySelectorAll('.toast-message');
        existingToasts.forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;
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
    const DRAFTS_STORAGE_KEY = 'eicArticleDrafts';

    const defaultDrafts = [];

    function getStoredDrafts() {
        try {
            const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.warn('Could not read eicArticleDrafts', e);
        }
        return [];
    }

    function saveStoredDrafts(drafts) {
        try {
            localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
            // Keep mirrored drafts key in sync for Manage My Articles
            localStorage.setItem('eicDrafts_v1', JSON.stringify(drafts));
        } catch (e) {
            console.warn('Could not save eicArticleDrafts', e);
        }
    }

    let draftsList = getStoredDrafts();

    function updateDraftsBadge() {
        if (draftsCountBadge) {
            draftsCountBadge.textContent = draftsList.length;
        }
    }

    // =========================================================================
    // 5. TAB SWITCHING LOGIC
    // =========================================================================
    function switchTab(targetTab) {
        if (targetTab === 'write') {
            tabWriteBtn.classList.add('active');
            tabWriteBtn.setAttribute('aria-selected', 'true');
            tabDraftsBtn.classList.remove('active');
            tabDraftsBtn.setAttribute('aria-selected', 'false');

            writeView.classList.remove('hidden');
            draftsView.classList.add('hidden');
        } else if (targetTab === 'drafts') {
            tabDraftsBtn.classList.add('active');
            tabDraftsBtn.setAttribute('aria-selected', 'true');
            tabWriteBtn.classList.remove('active');
            tabWriteBtn.setAttribute('aria-selected', 'false');

            draftsView.classList.remove('hidden');
            writeView.classList.add('hidden');

            renderDraftsList();
        }
    }

    if (tabWriteBtn) tabWriteBtn.addEventListener('click', () => switchTab('write'));
    if (tabDraftsBtn) tabDraftsBtn.addEventListener('click', () => switchTab('drafts'));

    // =========================================================================
    // 6. HEADLINE & EXCERPT AUTO-RESIZE & CHARACTER COUNTERS
    // =========================================================================
    function autoResizeTextarea(el) {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    }

    if (headlineInput) {
        headlineInput.addEventListener('input', () => {
            if (/[\r\n]/.test(headlineInput.value)) {
                const caret = headlineInput.selectionStart;
                headlineInput.value = headlineInput.value.replace(/[\r\n]+/g, ' ');
                if (caret !== null) headlineInput.setSelectionRange(caret, caret);
            }
            autoResizeTextarea(headlineInput);
            const count = headlineInput.value.length;
            if (headlineCharCount) {
                headlineCharCount.textContent = ${count} / 255;
                headlineCharCount.classList.toggle('near-limit', count > 230);
            }
            if (headlineWrapper) {
                headlineWrapper.classList.remove('input-invalid');
            }
        });

        // Headline must be a continuous single line: prevent Enter from creating newlines
        headlineInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
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

    if (excerptInput) {
        excerptInput.addEventListener('input', () => {
            autoResizeTextarea(excerptInput);
            const count = excerptInput.value.length;
            if (excerptCharCount) {
                excerptCharCount.textContent = `${count} / 255`;
                excerptCharCount.classList.toggle('near-limit', count > 230);
            }
            if (excerptWrapper) {
                excerptWrapper.classList.remove('input-invalid');
            }
        });
    }

    // =========================================================================
    // 7. NOTION / MEDIUM RICH TEXT FORMATTING TOOLBAR
    // =========================================================================
    if (toolbar) {
        toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('.tool-btn');
            if (!btn) return;
            e.preventDefault();

            const cmd = btn.getAttribute('data-command');
            const val = btn.getAttribute('data-value') || null;

            if (cmd === 'createLink') {
                const url = prompt('Enter destination URL:', 'https://');
                if (url && url.trim().length > 0) {
                    document.execCommand(cmd, false, url.trim());
                }
            } else if (cmd === 'formatBlock') {
                document.execCommand(cmd, false, val);
            } else {
                document.execCommand(cmd, false, val);
            }

            if (editorContent) {
                editorContent.focus();
            }
            updateActiveToolbarStates();
            updateWritingMetrics();
        });
    }

    function updateActiveToolbarStates() {
        if (!toolbar) return;
        const buttons = toolbar.querySelectorAll('.tool-btn[data-command]');
        buttons.forEach(btn => {
            const cmd = btn.getAttribute('data-command');
            if (cmd && !['createLink', 'formatBlock'].includes(cmd)) {
                try {
                    const isActive = document.queryCommandState(cmd);
                    btn.classList.toggle('active', !!isActive);
                } catch (e) {}
            }
        });
    }

    // =========================================================================
    // 8. WORD & CHARACTER COUNT METRICS
    // =========================================================================
    function updateWritingMetrics() {
        if (!editorContent) return;
        const text = editorContent.innerText || '';
        const trimmed = text.trim();

        const words = trimmed.length > 0 ? trimmed.split(/\s+/).filter(Boolean).length : 0;
        const chars = text.length;

        if (wordsCountEl) wordsCountEl.textContent = words.toLocaleString();
        if (charsCountEl) charsCountEl.textContent = chars.toLocaleString();

        if (editorWrapper && words > 0) {
            editorWrapper.classList.remove('input-invalid');
        }
    }

    if (editorContent) {
        editorContent.addEventListener('input', () => {
            updateWritingMetrics();
            updateActiveToolbarStates();
        });
        editorContent.addEventListener('keyup', updateActiveToolbarStates);
        editorContent.addEventListener('mouseup', updateActiveToolbarStates);
        editorContent.addEventListener('paste', handleEditorPaste);
    }

    // =========================================================================
    // 9. DRAFTS VIEW: RESPONSIVE HORIZONTAL BOX RENDERING
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

        draftsListContainer.innerHTML = draftsList.map(item => `
            <div class="draft-box" id="draft-box-${item.id}" data-id="${item.id}">
                <div class="draft-box-content">
                    <div class="draft-box-meta">
                        <span class="draft-box-category">${escapeHTML(item.category || 'General')}</span>
                        <span class="draft-box-date"><i class="fa-regular fa-calendar" aria-hidden="true"></i> Saved: ${escapeHTML(item.date || 'Oct 2026')}</span>
                    </div>

                    <h3 class="draft-box-title" title="${escapeHTML(item.title)}">
                        ${escapeHTML(item.title || 'Untitled Draft')}
                    </h3>

                    <p class="draft-box-excerpt">
                        ${escapeHTML(item.excerpt || 'No excerpt summary recorded for this draft.')}
                    </p>
                </div>

                <div class="draft-box-actions">
                    <button type="button" class="btn-draft-edit" data-action="edit-draft" data-id="${item.id}" title="Open draft in writing canvas">
                        <i class="fa-regular fa-pen-to-square"></i>
                        <span>Edit Draft</span>
                    </button>
                    <button type="button" class="btn-draft-delete" data-action="delete-draft" data-id="${item.id}" title="Permanently delete draft">
                        <i class="fa-regular fa-trash-can"></i>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // =========================================================================
    // 10. DRAFTS ACTION HANDLERS: EDIT & DELETE
    // =========================================================================
    if (draftsListContainer) {
        draftsListContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.getAttribute('data-action');
            const id = btn.getAttribute('data-id');
            if (!id) return;

            if (action === 'edit-draft') {
                loadDraftIntoCanvas(id);
            } else if (action === 'delete-draft') {
                deleteDraft(id);
            }
        });
    }

    function findArticleOrDraft(id) {
        if (!id) return null;
        // 1. Check in draftsList
        let found = draftsList.find(d => String(d.id) === String(id));
        if (found) return found;

        // 2. Check in eicMyArticles_v1
        try {
            const raw = localStorage.getItem('eicMyArticles_v1');
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list)) {
                    found = list.find(a => String(a.id) === String(id));
                    if (found) return found;
                }
            }
        } catch (e) {}

        // 3. Check in executiveMyArticles_v1
        try {
            const raw = localStorage.getItem('executiveMyArticles_v1');
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list)) {
                    found = list.find(a => String(a.id) === String(id));
                    if (found) return found;
                }
            }
        } catch (e) {}

        // 4. Check in executiveArticles
        try {
            const raw = localStorage.getItem('executiveArticles');
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

        function decodeCorruptedHtmlEntities(str) {
        if (!str || typeof str !== 'string') return '';
        let decoded = str;
        let maxPasses = 5;
        while (maxPasses > 0 && (/&amp;lt;/i.test(decoded) || /&lt;/i.test(decoded) || /&amp;gt;/i.test(decoded) || /&gt;/i.test(decoded))) {
            const txt = document.createElement('textarea');
            txt.innerHTML = decoded;
            const newDecoded = txt.value;
            if (newDecoded === decoded) break;
            decoded = newDecoded;
            maxPasses--;
        }
        return decoded;
    }

    function sanitizeEditorHtmlForSave(raw) {
        if (!raw) return '';
        let cleaned = String(raw).trim();
        cleaned = decodeCorruptedHtmlEntities(cleaned);
        cleaned = cleaned
            .replace(/&lt;\/?span[^&>]*&gt;/gi, '')
            .replace(/<\/?span[^>]*>/gi, '')
            .replace(/\s*style="[^"]*"/gi, '')
            .replace(/\s*style='[^']*'/gi, '')
            .replace(/&lt;[^&>]+&gt;/gi, '');
        return cleaned;
    }

    function handleEditorPaste(e) {
        e.preventDefault();
        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;

        let html = clipboardData.getData('text/html');
        let text = clipboardData.getData('text/plain') || '';

        let cleanHtml = '';

        if (html) {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const removeEls = doc.body.querySelectorAll('script, style, meta, link, object, embed, iframe, font, xml, o\\:p');
                removeEls.forEach(el => el.remove());

                const spans = doc.body.querySelectorAll('span, font, o\\:p');
                spans.forEach(span => {
                    const parent = span.parentNode;
                    if (parent) {
                        while (span.firstChild) {
                            parent.insertBefore(span.firstChild, span);
                        }
                        parent.removeChild(span);
                    }
                });

                const allElements = doc.body.querySelectorAll('*');
                allElements.forEach(el => {
                    el.removeAttribute('style');
                    el.removeAttribute('class');
                    el.removeAttribute('id');
                    el.removeAttribute('dir');
                    el.removeAttribute('lang');
                    el.removeAttribute('face');
                    el.removeAttribute('size');
                    el.removeAttribute('color');
                    el.removeAttribute('align');
                });

                const pTags = doc.body.querySelectorAll('p');
                pTags.forEach(p => {
                    const div = doc.createElement('div');
                    while (p.firstChild) {
                        div.appendChild(p.firstChild);
                    }
                    if (p.parentNode) {
                        p.parentNode.replaceChild(div, p);
                    }
                });

                cleanHtml = doc.body.innerHTML.trim();
                cleanHtml = cleanHtml
                    .replace(/<\/?span[^>]*>/gi, '')
                    .replace(/\s+style="[^"]*"/gi, '')
                    .replace(/\s+class="[^"]*"/gi, '');
            } catch (err) {
                cleanHtml = '';
            }
        }

        if (!cleanHtml && text) {
            const paragraphs = text.split(/\r?\n\r?\n+/).map(p => p.trim()).filter(Boolean);
            if (paragraphs.length > 0) {
                cleanHtml = paragraphs.map(p => `<div>${escapeHTML(p)}</div>`).join('<div><br></div>');
            } else if (text.trim()) {
                cleanHtml = `<div>${escapeHTML(text.trim())}</div>`;
            }
        }

        if (cleanHtml) {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cleanHtml;
                const frag = document.createDocumentFragment();
                let node;
                let lastNode;
                while ((node = tempDiv.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);
                if (lastNode) {
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            } else {
                document.execCommand('insertHTML', false, cleanHtml);
            }
        }

        if (typeof updateEditorMetrics === 'function') updateEditorMetrics();
        if (typeof updateWordAndCharCount === 'function') updateWordAndCharCount();
        if (typeof updateWritingMetrics === 'function') updateWritingMetrics();
    }

    function sanitizeDraftContentForEditor(raw) {
        if (!raw) return '';
        let content = decodeCorruptedHtmlEntities(String(raw).trim());

        // Strip any literal or entity-encoded span tags and style attributes
        content = content
            .replace(/&lt;\/?span[^&>]*&gt;/gi, '')
            .replace(/<\/?span[^>]*>/gi, '')
            .replace(/\s*style="[^"]*"/gi, '')
            .replace(/\s*style='[^']*'/gi, '')
            .replace(/&lt;[^&>]+&gt;/gi, '');

        // Check if content contains any HTML tags (e.g. <div, <p, <b>, <i>, <br>, etc.)
        const hasHtmlTags = /<\/?(?:div|p|b|i|u|strong|em|h[1-6]|ul|ol|li|blockquote|br|a)[^>]*>/i.test(content);

        if (!hasHtmlTags) {
            const paras = content.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
            if (paras.length === 0) return '';
            return paras.map(p => `<div>${escapeHTML(p)}</div>`).join('<div><br></div>');
        }

        let normalized = content
            .replace(/<\/p>\s*<p[^>]*>/gi, '</div><div><br></div><div>')
            .replace(/<p[^>]*>/gi, '<div>')
            .replace(/<\/p>/gi, '</div>')
            .replace(/<\/?span[^>]*>/gi, '')
            .replace(/\s*style="[^"]*"/gi, '');

        return normalized;
    }

    function loadDraftIntoCanvas(id) {
        const draft = findArticleOrDraft(id);
        if (!draft) return;

        activeEditingDraftId = draft.id;

        // Switch to Write tab FIRST so elements are visible
        switchTab('write');

        if (headlineInput) {
            headlineInput.value = draft.title || '';
            autoResizeTextarea(headlineInput);
            if (headlineCharCount) {
                const count = headlineInput.value.length;
                headlineCharCount.textContent = `${count} / 255`;
            }
        }

        if (categorySelect && draft.category) {
            categorySelect.value = draft.category;
        }

        if (excerptInput) {
            excerptInput.value = draft.excerpt || '';
            autoResizeTextarea(excerptInput);
            if (excerptCharCount) {
                const count = excerptInput.value.length;
                excerptCharCount.textContent = `${count} / 255`;
            }
        }

        if (editorContent) {
            const cleanHtml = sanitizeDraftContentForEditor(draft.content || draft.excerpt || '');
            editorContent.innerHTML = cleanHtml || '<div>Start writing your manuscript here...</div>';
            updateWritingMetrics();

            if (draft.content && cleanHtml && draft.content !== cleanHtml) {
                draft.content = cleanHtml;
                saveDrafts(draftsList);
            }
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast(`Loaded article: "${draft.title || 'Untitled Draft'}"`, 'info');
    }

    function deleteDraft(id) {
        const draft = draftsList.find(d => d.id === id);
        if (!draft) return;

        const box = document.getElementById(`draft-box-${id}`);
        if (box) {
            box.style.opacity = '0';
            box.style.transform = 'translateY(8px)';
            box.style.transition = 'all 0.2s ease';
        }

        setTimeout(() => {
            draftsList = draftsList.filter(d => d.id !== id);
            saveStoredDrafts(draftsList);
            updateDraftsBadge();
            renderDraftsList();

            if (activeEditingDraftId === id) {
                activeEditingDraftId = null;
                clearWritingCanvas();
            }

            showToast('Draft removed successfully.', 'success');
        }, 220);
    }

    function clearWritingCanvas() {
        activeEditingDraftId = null;
        if (headlineInput) {
            headlineInput.value = '';
            headlineInput.style.height = 'auto';
            if (headlineCharCount) headlineCharCount.textContent = '0 / 255';
        }
        if (excerptInput) {
            excerptInput.value = '';
            excerptInput.style.height = 'auto';
            if (excerptCharCount) excerptCharCount.textContent = '0 / 255';
        }
        if (editorContent) {
            editorContent.innerHTML = '';
            updateWritingMetrics();
        }
    }

    // =========================================================================
    // 11. SAVE DRAFT ACTION
    // =========================================================================
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const headline = headlineInput ? headlineInput.value.trim() : '';
            const category = categorySelect ? categorySelect.value : 'Opinion';
            const excerpt = excerptInput ? excerptInput.value.trim() : '';
            const content = editorContent ? editorContent.innerHTML.trim() : '';

            if (!headline && !content) {
                showToast('Please enter a headline or article body before saving as draft.', 'warning');
                if (headlineInput) headlineInput.focus();
                return;
            }

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const rawDate = now.toISOString().split('T')[0];

            if (activeEditingDraftId) {
                const existing = draftsList.find(d => d.id === activeEditingDraftId);
                if (existing) {
                    existing.title = headline || 'Untitled Draft';
                    existing.category = category;
                    existing.excerpt = excerpt || (editorContent ? editorContent.innerText.substring(0, 140) + '...' : '');
                    existing.content = content;
                    existing.date = dateStr;
                    existing.rawDate = rawDate;
                }
            } else {
                const newDraft = {
                    id: 'eic-draft-' + Date.now(),
                    title: headline || 'Untitled Draft',
                    category: category,
                    excerpt: excerpt || (editorContent ? editorContent.innerText.substring(0, 140) + '...' : ''),
                    date: dateStr,
                    rawDate: rawDate,
                    content: content
                };
                draftsList.unshift(newDraft);
                activeEditingDraftId = newDraft.id;
            }

            saveStoredDrafts(draftsList);
            updateDraftsBadge();
            showToast('Draft manuscript saved successfully!', 'success');
        });
    }

    // =========================================================================
    // 12. SUBMIT ARTICLE VALIDATION & DISPATCH
    // =========================================================================
    if (submitArticleBtn) {
        submitArticleBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const headline = headlineInput ? headlineInput.value.trim() : '';
            const category = categorySelect ? categorySelect.value : 'Opinion';
            const excerpt = excerptInput ? excerptInput.value.trim() : '';
            const plainText = editorContent ? editorContent.innerText.trim() : '';

            let hasError = false;

            if (!headline) {
                if (headlineWrapper) headlineWrapper.classList.add('input-invalid');
                hasError = true;
            }

            if (!excerpt) {
                if (excerptWrapper) excerptWrapper.classList.add('input-invalid');
                hasError = true;
            }

            if (!plainText || plainText.length < 15) {
                if (editorWrapper) editorWrapper.classList.add('input-invalid');
                hasError = true;
            }

            if (hasError) {
                showToast('Please fill out all mandatory fields before submitting.', 'warning');
                return;
            }

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const rawDate = now.toISOString().split('T')[0];

            const newSubmission = {
                id: 'rev-' + Date.now(),
                title: headline,
                category: category,
                date: dateStr,
                rawDate: rawDate,
                author: authorName,
                status: 'pending',
                remarks: '',
                content: plainText,
                excerpt: excerpt
            };

            // 1. Add to EIC / Executive Pending Review Queue
            try {
                const rawQueue = localStorage.getItem('eicPendingReviewQueue') || localStorage.getItem('executivePendingReviewQueue');
                let queue = rawQueue ? JSON.parse(rawQueue) : [];
                queue.unshift(newSubmission);
                localStorage.setItem('eicPendingReviewQueue', JSON.stringify(queue));
                localStorage.setItem('executivePendingReviewQueue', JSON.stringify(queue));
            } catch (e) {}

            // 2. Add to EIC Personal Articles as "Pending Review"
            try {
                const rawMy = localStorage.getItem('eicMyArticles_v1');
                let myArticles = rawMy ? JSON.parse(rawMy) : [];
                myArticles.unshift({
                    id: 'eic-art-' + Date.now(),
                    author: authorName,
                    title: headline,
                    category: category,
                    excerpt: excerpt,
                    date: dateStr,
                    rawDate: rawDate,
                    status: 'Pending Review',
                    views: 0,
                    shares: 0,
                    remarks: '',
                    content: plainText
                });
                localStorage.setItem('eicMyArticles_v1', JSON.stringify(myArticles));
            } catch (e) {}

            // 3. Log publication-wide activity
            try {
                const rawLogs = localStorage.getItem('executiveActivityLogs_v1');
                let logs = rawLogs ? JSON.parse(rawLogs) : [];
                logs.unshift({
                    causer: authorName,
                    causerAvatar: 'images/member-placeholder.svg',
                    action: 'submitted',
                    subjectType: 'Manuscript',
                    subjectName: headline,
                    timestampText: 'Just now'
                });
                localStorage.setItem('executiveActivityLogs_v1', JSON.stringify(logs.slice(0, 30)));
            } catch (e) {}

            // 4. Remove from drafts if editing an existing draft
            if (activeEditingDraftId) {
                draftsList = draftsList.filter(d => d.id !== activeEditingDraftId);
                saveStoredDrafts(draftsList);
                updateDraftsBadge();
            }

            clearWritingCanvas();
            showToast(`Manuscript "${headline}" submitted for review!`, 'success');

            setTimeout(() => {
                window.location.href = 'eic-manage-my-articles.html';
            }, 1200);
        });
    }

    // =========================================================================
    // 13. URL PARAMETER HANDLING (?draftId=...)
    // =========================================================================
    function checkURLParameters() {
        try {
            const params = new URLSearchParams(window.location.search);
            const draftId = params.get('draftId');
            if (draftId) {
                loadDraftIntoCanvas(draftId);
            }
        } catch (e) {}
    }

    // Initial hydration
    updateDraftsBadge();
    checkURLParameters();
});

