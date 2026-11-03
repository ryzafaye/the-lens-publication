/**
 * ============================================================================
 * THE LENS — SUBMIT ARTICLE CONTROLLER (CARTOONIST HEAD PORTAL)
 * Notion / Medium Style Writing Interface with Exact Executive Parity
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
    const headName = localStorage.getItem('cartoonistHeadName') || localStorage.getItem('userName') || 'Danilo Reyes';
    const headRole = 'Cartoonist Head';

    if (authorNameDisplay) {
        authorNameDisplay.textContent = headName;
    }

    // =========================================================================
    // 3. STORAGE & DRAFTS MANAGEMENT
    // =========================================================================
    const DRAFTS_KEY = 'cartoonistHeadArticleDrafts';
    const ARTICLES_KEY = 'cartoonistHeadMyArticles_v1';
    const ACTIVITY_KEY = 'cartoonistHeadActivityLogs_v1';

    const DEFAULT_HEAD_DRAFTS = [];
    const DEFAULT_SEED_ARTICLES = [];

    function getSavedDrafts() {
        let drafts = [];
        try {
            const raw = localStorage.getItem(DRAFTS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) drafts = parsed;
            }
        } catch (e) {
            console.warn('Could not parse drafts', e);
        }

        // Include any draft or revision articles stored in ARTICLES_KEY (Manage My Articles storage)
        try {
            const rawArts = localStorage.getItem(ARTICLES_KEY);
            if (rawArts) {
                const arts = JSON.parse(rawArts);
                if (Array.isArray(arts)) {
                    arts.forEach(art => {
                        if (art.status === 'Draft' || art.status === 'For Revision') {
                            const exists = drafts.some(d => String(d.id).trim() === String(art.id).trim());
                            if (!exists) {
                                drafts.push({
                                    id: art.id,
                                    title: art.title,
                                    category: art.category || 'Features',
                                    excerpt: art.excerpt || '',
                                    content: art.content || '',
                                    date: art.date || 'Oct 25, 2026',
                                    rawDate: art.rawDate || '2026-10-25',
                                    status: art.status
                                });
                            }
                        }
                    });
                }
            } else {
                // If ARTICLES_KEY not yet set, include chead-art-05 from seed
                const exists05 = drafts.some(d => d.id === 'chead-art-05');
                if (!exists05) {
                    const art05 = DEFAULT_SEED_ARTICLES.find(a => a.id === 'chead-art-05');
                    if (art05) drafts.push({ ...art05 });
                }
            }
        } catch (e) {}

        return drafts;
    }

    function saveDraftsList(drafts) {
        try {
            localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
        } catch (e) {
            console.error('Failed to save drafts', e);
        }
        updateDraftsCountBadge();
    }

    function updateDraftsCountBadge() {
        const drafts = getSavedDrafts();
        if (draftsCountBadge) {
            draftsCountBadge.textContent = drafts.length;
        }
    }

    // =========================================================================
    // 4. TAB SWITCHING (WRITE vs DRAFTS)
    // =========================================================================
    function switchTab(target) {
        if (target === 'write') {
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
        } else if (target === 'drafts') {
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

    if (tabWriteBtn) tabWriteBtn.addEventListener('click', () => switchTab('write'));
    if (tabDraftsBtn) tabDraftsBtn.addEventListener('click', () => switchTab('drafts'));

    // =========================================================================
    // 5. HELPER UTILITIES
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

    // =========================================================================
    // 6. HEADLINE INPUT AUTO-GROW & CONTINUOUS SENTENCE ENFORCEMENT
    // Headlines are strictly continuous: prevent Enter from inserting newlines!
    // =========================================================================
    function autoResizeHeadline() {
        if (!headlineInput) return;
        headlineInput.style.height = 'auto';
        headlineInput.style.height = `${headlineInput.scrollHeight}px`;
        const count = headlineInput.value.length;
        if (headlineCharCount) headlineCharCount.textContent = `${count} / 255`;
    }

    if (headlineInput) {
        // Prevent Enter key from breaking title into multiple lines
        headlineInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                showToast('Article headlines must be a single continuous sentence without line breaks.', 'warning');
                if (categorySelect) {
                    categorySelect.focus();
                } else if (excerptInput) {
                    excerptInput.focus();
                } else if (editorContent) {
                    editorContent.focus();
                }
            }
        });

        // Strip any pasted carriage returns or newlines immediately
        headlineInput.addEventListener('input', () => {
            if (/[\r\n]/.test(headlineInput.value)) {
                const caret = headlineInput.selectionStart;
                headlineInput.value = headlineInput.value.replace(/[\r\n]+/g, ' ');
                if (caret !== null) headlineInput.setSelectionRange(caret, caret);
            }
            autoResizeHeadline();
            if (headlineWrapper) headlineWrapper.classList.remove('input-invalid');
        });
    }

    if (excerptInput) {
        excerptInput.addEventListener('input', () => {
            const count = excerptInput.value.length;
            if (excerptCharCount) excerptCharCount.textContent = `${count} / 255`;
            if (excerptWrapper) excerptWrapper.classList.remove('input-invalid');
        });
    }

    function updateWordAndCharCount() {
        const text = editorContent ? (editorContent.innerText || '').trim() : '';
        const words = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
        const chars = text ? text.length : 0;

        if (wordsCountEl) wordsCountEl.textContent = `${words} word${words === 1 ? '' : 's'}`;
        if (charsCountEl) charsCountEl.textContent = `${chars} character${chars === 1 ? '' : 's'}`;
    }

    // =========================================================================
    // 7. WYSIWYG FORMATTING TOOLBAR
    // =========================================================================
    function executeFormatCommand(command, value = null) {
        if (!editorContent) return;
        editorContent.focus();

        if (command === 'createLink') {
            const url = prompt('Enter the destination hyperlink URL (https://...):', 'https://');
            if (url && url !== 'https://') {
                document.execCommand('createLink', false, url);
            }
        } else {
            document.execCommand(command, false, value);
        }

        updateWordAndCharCount();
    }

    if (toolbar) {
        toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('.tool-btn');
            if (!btn) return;
            e.preventDefault();
            const command = btn.getAttribute('data-command');
            const value = btn.getAttribute('data-value') || null;
            if (command) executeFormatCommand(command, value);
        });
    }

    if (editorContent) {
        editorContent.addEventListener('input', updateWordAndCharCount);
        editorContent.addEventListener('keyup', updateWordAndCharCount);
        editorContent.addEventListener('paste', handleEditorPaste);
    }

    // =========================================================================
    // 8. DRAFTS SEARCH & UNIFIED LOOKUP (FINDS DRAFTS, ARTICLES & SEEDS)
    // =========================================================================
    function findArticleOrDraft(id) {
        if (!id) return null;
        const targetId = String(id).trim();

        // 1. Check in unified getSavedDrafts()
        const drafts = getSavedDrafts();
        let found = drafts.find(d => String(d.id).trim() === targetId);
        if (found) return found;

        // 2. Check in ARTICLES_KEY (Manage My Articles local storage)
        try {
            const rawArts = localStorage.getItem(ARTICLES_KEY);
            if (rawArts) {
                const arts = JSON.parse(rawArts);
                if (Array.isArray(arts)) {
                    found = arts.find(a => String(a.id).trim() === targetId);
                    if (found) return found;
                }
            }
        } catch (e) {}

        // 3. Check DEFAULT_SEED_ARTICLES (chead-art-05, chead-art-04, etc.)
        found = DEFAULT_SEED_ARTICLES.find(a => String(a.id).trim() === targetId);
        if (found) return found;

        // 4. Check DEFAULT_HEAD_DRAFTS
        found = DEFAULT_HEAD_DRAFTS.find(d => String(d.id).trim() === targetId);
        if (found) return found;

        return null;
    }

    // =========================================================================
    // 9. DRAFTS RENDERING & LOADING (EXACT EXECUTIVE DRAFT-BOX DESIGN)
    // =========================================================================
    function renderDraftsList() {
        if (!draftsListContainer) return;
        const drafts = getSavedDrafts();
        updateDraftsCountBadge();

        if (drafts.length === 0) {
            draftsListContainer.innerHTML = '';
            if (emptyDraftsState) emptyDraftsState.classList.remove('hidden');
            return;
        }

        if (emptyDraftsState) emptyDraftsState.classList.add('hidden');

        draftsListContainer.innerHTML = drafts.map(draft => `
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

        // Event delegation on Drafts List
        draftsListContainer.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                loadDraftIntoEditor(id);
            });
        });

        draftsListContainer.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                deleteDraft(id);
            });
        });
    }

    function deleteDraft(draftId) {
        let drafts = getSavedDrafts();
        drafts = drafts.filter(d => String(d.id).trim() !== String(draftId).trim());
        saveDraftsList(drafts);

        // Also remove from cartoonistHeadMyArticles_v1 if it was a draft there
        try {
            const raw = localStorage.getItem(ARTICLES_KEY);
            if (raw) {
                let arts = JSON.parse(raw);
                if (Array.isArray(arts)) {
                    arts = arts.filter(a => String(a.id).trim() !== String(draftId).trim());
                    localStorage.setItem(ARTICLES_KEY, JSON.stringify(arts));
                }
            }
        } catch (e) {}

        renderDraftsList();
        showToast('Draft removed successfully.', 'danger');
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

        if (typeof updateWordAndCharCount === 'function') updateWordAndCharCount();
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

    function loadDraftIntoEditor(draftId) {
        const draft = findArticleOrDraft(draftId);
        if (!draft) {
            console.warn('Could not find draft or article with ID:', draftId);
            return;
        }

        activeEditingDraftId = draft.id;

        // Switch to Write tab FIRST so form elements are visible and properly dimensioned
        switchTab('write');

        if (headlineInput) {
            headlineInput.value = draft.title || '';
            headlineInput.style.height = 'auto';
            requestAnimationFrame(() => {
                autoResizeHeadline();
            });
            setTimeout(autoResizeHeadline, 40);
            setTimeout(autoResizeHeadline, 120);
        }

        if (categorySelect && draft.category) {
            categorySelect.value = draft.category;
            if (categorySelectContainer) categorySelectContainer.classList.remove('input-invalid');
        }

        if (excerptInput) {
            excerptInput.value = draft.excerpt || '';
            const count = excerptInput.value.length;
            if (excerptCharCount) excerptCharCount.textContent = `${count} / 255`;
            if (excerptWrapper) excerptWrapper.classList.remove('input-invalid');
        }

        if (editorContent) {
            const cleanHtml = sanitizeDraftContentForEditor(draft.content || draft.excerpt || '');
            editorContent.innerHTML = cleanHtml || '<div>Start writing your manuscript here...</div>';

            if (draft.content && cleanHtml && draft.content !== cleanHtml) {
                draft.content = cleanHtml;
                saveArticles(articles);
            }
            if (editorWrapper) editorWrapper.classList.remove('input-invalid');
        }

        updateWordAndCharCount();
        showToast(`Loaded draft: "${draft.title}"`, 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // =========================================================================
    // 10. SAVE DRAFT ACTION
    // =========================================================================
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', () => {
            const headline = (headlineInput ? headlineInput.value.trim() : '');
            if (!headline) {
                if (headlineWrapper) headlineWrapper.classList.add('input-invalid');
                headlineInput.focus();
                showToast('Please provide a working title for the draft.', 'error');
                return;
            }

            const drafts = getSavedDrafts();
            const now = new Date();
            const dateStr = formatDateDisplay(now);
            const rawDateStr = now.toISOString().split('T')[0];

            const draftObj = {
                id: activeEditingDraftId || ('chead-draft-' + Date.now()),
                title: headline,
                category: categorySelect ? categorySelect.value || 'Features' : 'Features',
                excerpt: excerptInput ? excerptInput.value.trim() : '',
                content: editorContent ? editorContent.innerHTML : '',
                date: dateStr,
                rawDate: rawDateStr,
                status: 'Draft'
            };

            const existingIndex = drafts.findIndex(d => String(d.id).trim() === String(draftObj.id).trim());
            if (existingIndex >= 0) {
                drafts[existingIndex] = draftObj;
            } else {
                drafts.unshift(draftObj);
            }
            saveDraftsList(drafts);

            // Also synchronize with cartoonistHeadMyArticles_v1 so it appears in Manage My Articles
            try {
                const raw = localStorage.getItem(ARTICLES_KEY);
                let arts = raw ? JSON.parse(raw) : [];
                if (!Array.isArray(arts)) arts = [];
                const artIndex = arts.findIndex(a => String(a.id).trim() === String(draftObj.id).trim());
                const artObj = {
                    id: draftObj.id,
                    author: headName,
                    title: draftObj.title,
                    category: draftObj.category,
                    excerpt: draftObj.excerpt,
                    date: dateStr,
                    rawDate: rawDateStr,
                    status: 'Draft',
                    views: 0,
                    shares: 0,
                    remarks: '',
                    content: editorContent ? editorContent.innerText : ''
                };
                if (artIndex >= 0) {
                    arts[artIndex] = { ...arts[artIndex], ...artObj };
                } else {
                    arts.unshift(artObj);
                }
                localStorage.setItem(ARTICLES_KEY, JSON.stringify(arts));
            } catch (e) {}

            activeEditingDraftId = draftObj.id;
            showToast('Draft saved successfully!');
        });
    }

    // =========================================================================
    // 11. SUBMIT ARTICLE ACTION
    // =========================================================================
    if (submitArticleBtn) {
        submitArticleBtn.addEventListener('click', () => {
            const headline = headlineInput ? headlineInput.value.trim() : '';
            const category = categorySelect ? categorySelect.value : '';
            const excerpt = excerptInput ? excerptInput.value.trim() : '';
            const contentText = editorContent ? (editorContent.innerText || '').trim() : '';

            let hasError = false;

            if (!headline) {
                if (headlineWrapper) headlineWrapper.classList.add('input-invalid');
                hasError = true;
            }
            if (!category) {
                if (categorySelectContainer) categorySelectContainer.classList.add('input-invalid');
                hasError = true;
            }
            if (!excerpt) {
                if (excerptWrapper) excerptWrapper.classList.add('input-invalid');
                hasError = true;
            }
            if (!contentText) {
                if (editorWrapper) editorWrapper.classList.add('input-invalid');
                hasError = true;
            }

            if (hasError) {
                showToast('Please fill out all required article fields before submitting.', 'error');
                return;
            }

            const now = new Date();
            const dateStr = formatDateDisplay(now);
            const rawDateStr = now.toISOString().split('T')[0];

            const newArticle = {
                id: activeEditingDraftId || ('chead-art-' + Date.now()),
                author: headName,
                title: headline,
                category: category,
                excerpt: excerpt,
                content: editorContent ? editorContent.innerHTML : '',
                date: dateStr,
                rawDate: rawDateStr,
                status: 'Pending Review',
                views: 0,
                shares: 0,
                remarks: ''
            };

            // Save to cartoonistHeadMyArticles_v1
            try {
                const raw = localStorage.getItem(ARTICLES_KEY);
                let arts = raw ? JSON.parse(raw) : [];
                if (!Array.isArray(arts)) arts = [];
                const existIdx = arts.findIndex(a => String(a.id).trim() === String(newArticle.id).trim());
                if (existIdx >= 0) {
                    arts[existIdx] = { ...arts[existIdx], ...newArticle };
                } else {
                    arts.unshift(newArticle);
                }
                localStorage.setItem(ARTICLES_KEY, JSON.stringify(arts));
            } catch (e) {}

            // Remove from drafts if was a draft
            if (activeEditingDraftId) {
                let drafts = getSavedDrafts();
                drafts = drafts.filter(d => String(d.id).trim() !== String(activeEditingDraftId).trim());
                saveDraftsList(drafts);
            }

            // Log activity
            try {
                const rawLogs = localStorage.getItem(ACTIVITY_KEY);
                let logs = rawLogs ? JSON.parse(rawLogs) : [];
                if (!Array.isArray(logs)) logs = [];
                const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                logs.unshift({
                    id: 'act-chead-' + Date.now(),
                    causer: headName,
                    causerRole: headRole,
                    causerAvatar: 'images/member-placeholder.svg',
                    action: 'submitted',
                    subjectType: 'Article',
                    subjectName: headline,
                    timestampText: 'Just now',
                    isoDate: now.toISOString(),
                    dateKey: rawDateStr,
                    formattedDate: `${dateStr} • ${timeStr}`,
                    dayGroup: 'Today'
                });
                localStorage.setItem(ACTIVITY_KEY, JSON.stringify(logs.slice(0, 40)));
            } catch (e) {}

            // Reset form
            if (headlineInput) headlineInput.value = '';
            if (excerptInput) excerptInput.value = '';
            if (categorySelect) categorySelect.value = '';
            if (editorContent) editorContent.innerHTML = '';
            activeEditingDraftId = null;
            autoResizeHeadline();
            updateWordAndCharCount();

            showToast('Article submitted successfully to editorial review queue!');
            setTimeout(() => {
                window.location.href = 'cartoonist-head-manage-my-articles.html';
            }, 1200);
        });
    }

    // =========================================================================
    // 12. INITIALIZATION & URL PARAMS CHECK (?draftId=...)
    // =========================================================================
    autoResizeHeadline();
    updateWordAndCharCount();
    updateDraftsCountBadge();
    renderDraftsList();

    const urlParams = new URLSearchParams(window.location.search);
    const draftParam = urlParams.get('draftId') || urlParams.get('id') || urlParams.get('editId') || urlParams.get('articleId');
    if (draftParam) {
        loadDraftIntoEditor(draftParam);
    }
});
