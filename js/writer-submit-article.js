/**
 * ============================================================================
 * THE LENS — SUBMIT ARTICLE LOGIC (WRITER PORTAL)
 * Exact design, formatting, and logic parity with the Executive Submit Article.
 * Ultra-minimalist, distraction-free writing interface (Notion / Medium Style).
 * 
 * Features:
 * 1. Tabbed Navigation ("Write Article" & "Drafts")
 * 2. Big Box Headline Input (Auto-grow, 255 Character Limit)
 * 3. Section / Category Dropdown (News, Opinions, Features, Science and Technology, Literature)
 * 4. Excerpt (Short Summary) Teaser Field with Character Counter (255 Character Limit)
 * 5. Author Byline with Pen-Nib Icon ("By Author Name")
 * 6. Notion-Style Rich Text Editor with Formatting Toolbar (execCommand + selection state)
 * 7. Live Writing Metrics (Words, Characters)
 * 8. Responsive Horizontal List Card Layout for Drafts (Exact parity layout)
 * 9. "Save Draft" saves to writer storage, clears form & updates Drafts tab with Toast
 * 10. "Edit Draft" loads draft into editor & switches to Write tab
 * 11. "Delete Draft" removes draft with smooth fade-out animation
 * 12. Article Submission integrates with writer dataset & executive review queue
 * 13. Executive Toast Notification with Green Bullet Indicator
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // Ensure contenteditable uses <div> consistently on Enter across all Chromium browsers
    try {
        document.execCommand('defaultParagraphSeparator', false, 'div');
    } catch (e) {
        // Ignore if not supported in environment
    }

    // =========================================================================
    // 1. ACTIVE WRITER RESOLUTION & IDENTITY
    // =========================================================================
    const activeWriterId = (typeof getActiveWriterId === 'function') 
        ? getActiveWriterId() 
        : (localStorage.getItem('writerId') || 'sofia-alcaraz');

    const currentUserName = localStorage.getItem('userName') || 
        (activeWriterId === 'marco-valderrama' ? 'Marco L. Valderrama' : 'Sofia M. Alcaraz');

    // =========================================================================
    // 2. DOM ELEMENT REFERENCES
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

    // Notifications
    const toastContainer = document.getElementById('toast-container');

    // Active state tracker for editing existing draft
    let activeEditingDraftId = null;

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
    // 4. DATASET RESOLUTION (Writer storage & drafts)
    // =========================================================================
    function getAllArticles() {
        if (typeof loadAllWriterArticles === 'function') {
            return loadAllWriterArticles();
        }
        try {
            const raw = localStorage.getItem('theLensWriterArticles_v3');
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return [];
    }

    function saveArticles(articles) {
        if (typeof saveAllWriterArticles === 'function') {
            saveAllWriterArticles(articles);
        } else {
            try {
                localStorage.setItem('theLensWriterArticles_v3', JSON.stringify(articles));
            } catch (e) {}
        }
    }

    function getMyDrafts() {
        const all = getAllArticles();
        return all.filter(a => {
            const matchesWriter = (a.writerId === activeWriterId) || 
                (a.author && a.author.toLowerCase() === currentUserName.toLowerCase());
            const isDraft = a.status && a.status.toLowerCase() === 'draft';
            return matchesWriter && isDraft;
        });
    }

    function updateDraftsBadge() {
        const drafts = getMyDrafts();
        if (draftsCountBadge) {
            draftsCountBadge.textContent = drafts.length;
        }
    }

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
            requestAnimationFrame(() => {
                autoResizeHeadline();
            });
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
    // =========================================================================
    function autoResizeHeadline() {
        if (!headlineInput) return;
        headlineInput.style.height = 'auto';
        const scrollH = headlineInput.scrollHeight;

        // Dynamically compute responsive bounds based on viewport width
        const width = window.innerWidth;
        const minH = width <= 480 ? 34 : (width <= 768 ? 38 : 44);
        const maxH = width <= 480 ? 100 : (width <= 768 ? 115 : 160);

        const calculatedHeight = Math.max(minH, scrollH);
        const clampedHeight = Math.min(maxH, calculatedHeight);
        headlineInput.style.height = `${clampedHeight}px`;

        if (scrollH > maxH) {
            headlineInput.style.overflowY = 'auto';
        } else {
            headlineInput.style.overflowY = 'hidden';
        }

        const length = headlineInput.value.length;
        if (headlineCharCount) {
            headlineCharCount.textContent = `${length} / 255`;
            if (length > 230) {
                headlineCharCount.style.color = '#d92d20';
            } else {
                headlineCharCount.style.color = '#667085';
            }
        }

        if (headlineInput.value.trim().length > 0 && headlineWrapper) {
            headlineWrapper.classList.remove('input-invalid');
        }
    }

    // Recalculate on screen resize or device orientation change
    window.addEventListener('resize', autoResizeHeadline);

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
                excerptCharCount.style.color = '#d92d20';
            } else {
                excerptCharCount.style.color = '#667085';
            }
        }
        if (excerptInput.value.trim().length > 0 && excerptWrapper) {
            excerptWrapper.classList.remove('input-invalid');
        }
    }

    if (excerptInput) {
        excerptInput.addEventListener('input', handleExcerptInput);
    }

    // =========================================================================
    // 8. CATEGORY DROPDOWN
    // =========================================================================
    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            if (categorySelect.value) {
                categorySelect.classList.remove('input-invalid');
            }
        });
    }

    // =========================================================================
    // 9. NOTION / MEDIUM RICH TEXT TOOLBAR CONTROLS
    // =========================================================================
    function executeFormatCommand(command, value = null) {
        if (!editorContent) return;
        editorContent.focus();

        if (command === 'createLink') {
            const url = prompt('Enter link URL (e.g., https://example.com):');
            if (url && url.trim().length > 0) {
                const formattedUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
                document.execCommand('createLink', false, formattedUrl);
            }
        } else if (command === 'formatBlock') {
            const currentTag = document.queryCommandValue('formatBlock').toLowerCase();
            const targetTag = value.replace(/<|>/g, '').toLowerCase();

            if (currentTag === targetTag) {
                document.execCommand('formatBlock', false, '<p>');
            } else {
                document.execCommand('formatBlock', false, value);
            }
        } else {
            document.execCommand(command, false, value);
        }

        updateToolbarButtonStates();
        updateEditorMetrics();
    }

    function updateToolbarButtonStates() {
        if (!toolbar) return;
        const toolButtons = toolbar.querySelectorAll('.tool-btn[data-command]');

        toolButtons.forEach(btn => {
            const cmd = btn.getAttribute('data-command');
            const value = btn.getAttribute('data-value');

            try {
                let isActive = false;
                if (cmd === 'formatBlock' && value) {
                    const blockValue = document.queryCommandValue('formatBlock').toLowerCase();
                    const targetValue = value.replace(/<|>/g, '').toLowerCase();
                    isActive = blockValue === targetValue;
                } else if (['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList'].includes(cmd)) {
                    isActive = document.queryCommandState(cmd);
                }

                if (isActive) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            } catch (e) {
                // Ignore queryCommand errors on unsupported elements
            }
        });
    }

    if (toolbar) {
        toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('.tool-btn');
            if (!btn) return;

            e.preventDefault();
            const command = btn.getAttribute('data-command');
            const value = btn.getAttribute('data-value') || null;

            if (command) {
                executeFormatCommand(command, value);
            }
        });
    }

    if (editorContent) {
        editorContent.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey)) {
                if (e.key === 'b' || e.key === 'B') {
                    e.preventDefault();
                    executeFormatCommand('bold');
                } else if (e.key === 'i' || e.key === 'I') {
                    e.preventDefault();
                    executeFormatCommand('italic');
                } else if (e.key === 'u' || e.key === 'U') {
                    e.preventDefault();
                    executeFormatCommand('underline');
                } else if (e.key === 's' || e.key === 'S') {
                    e.preventDefault();
                    saveDraftAction();
                }
            }
        });

        editorContent.addEventListener('keyup', () => {
            updateToolbarButtonStates();
            updateEditorMetrics();

            if (editorContent.innerText.trim().length > 0 && editorWrapper) {
                editorWrapper.classList.remove('input-invalid');
            }
        });

        editorContent.addEventListener('mouseup', () => {
            updateToolbarButtonStates();
        });

        editorContent.addEventListener('paste', handleEditorPaste);
    }

    document.addEventListener('selectionchange', () => {
        if (document.activeElement === editorContent) {
            updateToolbarButtonStates();
        }
    });

    // =========================================================================
    // 10. LIVE WRITING METRICS (Words, Characters)
    // =========================================================================
    function updateEditorMetrics() {
        if (!editorContent) return;

        const text = editorContent.innerText || '';
        const trimmed = text.trim();

        let wordCount = 0;
        if (trimmed.length > 0) {
            const words = trimmed.match(/\b[\w'-]+\b/g);
            wordCount = words ? words.length : 0;
        }

        const charCount = text.length;

        if (wordsCountEl) {
            wordsCountEl.textContent = `${wordCount} ${wordCount === 1 ? 'word' : 'words'}`;
        }
        if (charsCountEl) {
            charsCountEl.textContent = `${charCount} characters`;
        }
    }

    // =========================================================================
    // 11. DRAFTS VIEW RENDERING (Exact Executive Review Articles Card Layout)
    // =========================================================================
    function renderDraftsList() {
        if (!draftsListContainer) return;

        updateDraftsBadge();
        const draftsList = getMyDrafts();

        if (draftsList.length === 0) {
            draftsListContainer.innerHTML = '';
            if (emptyDraftsState) {
                emptyDraftsState.classList.remove('hidden');
                emptyDraftsState.style.display = 'block';
            }
            return;
        }

        if (emptyDraftsState) {
            emptyDraftsState.classList.add('hidden');
            emptyDraftsState.style.display = 'none';
        }

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
    // 12. DRAFT ACTIONS: SAVE DRAFT, EDIT DRAFT, DELETE DRAFT
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
            editorContent.style.textAlign = 'justify';
            updateEditorMetrics();
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
        const bodyHtml = sanitizeEditorHtmlForSave(editorContent ? editorContent.innerHTML : '');
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
        const currentIsoDate = new Date().toISOString().split('T')[0];

        const allArticles = getAllArticles();

        if (activeEditingDraftId) {
            // Update existing draft or article
            const index = allArticles.findIndex(d => d.id === activeEditingDraftId);
            if (index !== -1) {
                allArticles[index].title = headline || 'Untitled Draft';
                allArticles[index].category = category || 'News';
                allArticles[index].excerpt = excerpt;
                allArticles[index].date = currentDate;
                allArticles[index].rawDate = currentIsoDate;
                allArticles[index].content = bodyHtml;
                allArticles[index].status = 'Draft';
            } else {
                allArticles.unshift({
                    id: activeEditingDraftId,
                    writerId: activeWriterId,
                    author: currentUserName,
                    title: headline || 'Untitled Draft',
                    category: category || 'News',
                    excerpt: excerpt,
                    date: currentDate,
                    rawDate: currentIsoDate,
                    content: bodyHtml,
                    status: 'Draft',
                    views: 0,
                    shares: 0,
                    remarks: ''
                });
            }
        } else {
            // Prepend new draft
            const draftEntry = {
                id: `draft-${Date.now()}`,
                writerId: activeWriterId,
                author: currentUserName,
                title: headline || 'Untitled Draft',
                category: category || 'News',
                excerpt: excerpt,
                date: currentDate,
                rawDate: currentIsoDate,
                content: bodyHtml,
                status: 'Draft',
                views: 0,
                shares: 0,
                remarks: ''
            };
            allArticles.unshift(draftEntry);
        }

        // Persist to writer storage
        saveArticles(allArticles);
        updateDraftsBadge();

        // Show toast notification
        showToast('Draft saved successfully', 'success');

        // Clear the form fields
        clearFormFields();

        // Also update the rendered list in Drafts tab
        renderDraftsList();
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

                // 1. Remove dangerous or non-content tags
                const removeEls = doc.body.querySelectorAll('script, style, meta, link, object, embed, iframe, font, xml, o\\:p');
                removeEls.forEach(el => el.remove());

                // 2. Unwrap all span tags and font tags (preserving text)
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

                // 3. Strip all style, class, id, and foreign typography attributes
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

                // 4. Convert <p> tags into <div> tags to maintain Notion-style block rhythm
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

        updateEditorMetrics();
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
            // Truly plain text without any HTML tags: split by double newlines into clean div paragraphs
            const paras = content.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
            if (paras.length === 0) return '';
            return paras.map(p => `<div>${escapeHTML(p)}</div>`).join('<div><br></div>');
        }

        // If it's already HTML:
        // Convert any <p> tags into <div> for Notion-style editor
        let normalized = content
            .replace(/<\/p>\s*<p[^>]*>/gi, '</div><div><br></div><div>')
            .replace(/<p[^>]*>/gi, '<div>')
            .replace(/<\/p>/gi, '</div>')
            .replace(/<\/?span[^>]*>/gi, '')
            .replace(/\s*style="[^"]*"/gi, '');

        return normalized;
    }

    function editDraftAction(id) {
        const allArticles = getAllArticles();
        const draft = allArticles.find(d => d.id === id);
        if (!draft) return;

        // Switch to Write Article tab FIRST so elements are visible and layout dimensions exist
        switchTab('write');

        // Load draft data into form fields with identical layout & spacing
        if (headlineInput) {
            headlineInput.value = draft.title || '';
            headlineInput.style.height = 'auto';
            requestAnimationFrame(() => {
                autoResizeHeadline();
            });
            setTimeout(autoResizeHeadline, 40);
            setTimeout(autoResizeHeadline, 120);
        }
        if (categorySelect) {
            categorySelect.value = draft.category || '';
            categorySelect.classList.remove('input-invalid');
        }
        if (excerptInput) {
            excerptInput.value = draft.excerpt || '';
            excerptInput.style.textAlign = 'justify';
            handleExcerptInput();
        }
        if (editorContent) {
            const cleanHtml = sanitizeDraftContentForEditor(draft.content || '');
            editorContent.innerHTML = cleanHtml;
            editorContent.style.textAlign = 'justify';
            updateEditorMetrics();

            // Self-heal this draft in storage if it was corrupted
            if (draft.content && cleanHtml && draft.content !== cleanHtml) {
                draft.content = cleanHtml;
                saveArticles(allArticles);
            }
        }

        activeEditingDraftId = draft.id;

        // Scroll smoothly to top of writing canvas
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('Draft loaded into editor.', 'success');
    }

    function deleteDraftAction(id) {
        const allArticles = getAllArticles();
        const draftIndex = allArticles.findIndex(d => d.id === id);
        if (draftIndex === -1) return;

        const draftBox = document.getElementById(`draft-box-${id}`);
        if (draftBox) {
            draftBox.classList.add('box-fade-out');
        }

        setTimeout(() => {
            allArticles.splice(draftIndex, 1);
            saveArticles(allArticles);
            renderDraftsList();
            showToast('Draft deleted.', 'danger');
        }, 220);
    }

    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', (e) => {
            e.preventDefault();
            saveDraftAction();
        });
    }

    // =========================================================================
    // 13. FORM VALIDATION & FINAL ARTICLE SUBMISSION
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
        const bodyHtml = sanitizeEditorHtmlForSave(editorContent.innerHTML);
        const bodyText = editorContent.innerText.trim();

        const newSubmissionId = activeEditingDraftId || `art-sub-${Date.now()}`;
        const currentDate = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        const currentIsoDate = new Date().toISOString().split('T')[0];

        const allArticles = getAllArticles();

        if (activeEditingDraftId) {
            const index = allArticles.findIndex(a => a.id === activeEditingDraftId);
            if (index !== -1) {
                allArticles[index].title = headline;
                allArticles[index].category = category;
                allArticles[index].excerpt = excerpt;
                allArticles[index].content = bodyHtml;
                allArticles[index].date = currentDate;
                allArticles[index].rawDate = currentIsoDate;
                allArticles[index].status = 'Pending Review';
                allArticles[index].remarks = ''; // Reset revision remarks upon resubmitting
            } else {
                allArticles.unshift({
                    id: newSubmissionId,
                    writerId: activeWriterId,
                    author: currentUserName,
                    title: headline,
                    category: category,
                    excerpt: excerpt,
                    content: bodyHtml,
                    date: currentDate,
                    rawDate: currentIsoDate,
                    status: 'Pending Review',
                    views: 0,
                    shares: 0,
                    remarks: ''
                });
            }
        } else {
            allArticles.unshift({
                id: newSubmissionId,
                writerId: activeWriterId,
                author: currentUserName,
                title: headline,
                category: category,
                excerpt: excerpt,
                content: bodyHtml,
                date: currentDate,
                rawDate: currentIsoDate,
                status: 'Pending Review',
                views: 0,
                shares: 0,
                remarks: ''
            });
        }

        saveArticles(allArticles);

        // Synchronize with section head review queue in localStorage
        try {
            let sectionQueue = [];
            const rawSecQueue = localStorage.getItem('sectionHeadReviewQueue_v1');
            if (rawSecQueue) {
                try {
                    const parsed = JSON.parse(rawSecQueue);
                    if (Array.isArray(parsed)) sectionQueue = parsed;
                } catch (e) {}
            }
            sectionQueue = sectionQueue.filter(q => q.id !== newSubmissionId);
            sectionQueue.unshift({
                id: newSubmissionId,
                title: headline,
                category: category,
                excerpt: excerpt,
                date: currentDate,
                rawDate: currentIsoDate,
                author: currentUserName,
                status: 'pending',
                remarks: '',
                content: bodyText
            });
            localStorage.setItem('sectionHeadReviewQueue_v1', JSON.stringify(sectionQueue));
        } catch (e) {
            console.error('Failed to sync to section head queue:', e);
        }

        // Synchronize with executive review queue in localStorage so executive review works
        try {
            let pendingQueue = [];
            const rawQueue = localStorage.getItem('executivePendingReviewQueue');
            if (rawQueue) {
                try {
                    const parsed = JSON.parse(rawQueue);
                    if (Array.isArray(parsed)) pendingQueue = parsed;
                } catch (e) {}
            }

            // Remove previous queue entry if editing/resubmitting
            pendingQueue = pendingQueue.filter(q => q.id !== newSubmissionId);

            pendingQueue.unshift({
                id: newSubmissionId,
                title: headline,
                category: category,
                excerpt: excerpt,
                date: currentDate,
                rawDate: currentIsoDate,
                author: currentUserName,
                status: 'pending',
                remarks: '',
                content: bodyText
            });

            localStorage.setItem('executivePendingReviewQueue', JSON.stringify(pendingQueue));
        } catch (e) {
            console.error('Failed to sync to executive queue:', e);
        }

        // Display success toast notification
        showToast('Article submitted successfully to the review queue.', 'success');

        // Clear form fields
        clearFormFields();

        // Redirect to Manage My Articles after brief pause
        setTimeout(() => {
            window.location.href = 'writer-manage-articles.html';
        }, 1400);
    }

    if (submitArticleBtn) {
        submitArticleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            submitArticle();
        });
    }

    // =========================================================================
    // 14. INITIAL RENDER & URL PARAM CHECK
    // =========================================================================
    autoResizeHeadline();
    handleExcerptInput();
    updateEditorMetrics();
    updateToolbarButtonStates();
    renderDraftsList();

    // Check if URL has ?draftId=... or ?id=... or ?editId=...
    const urlParams = new URLSearchParams(window.location.search);
    const targetArticleId = urlParams.get('draftId') || urlParams.get('id') || urlParams.get('editId');
    if (targetArticleId) {
        editDraftAction(targetArticleId);
    }
});
