/**
 * ============================================================================
 * THE LENS — SUBMIT ARTICLE LOGIC (WRITER PORTAL)
 * Ultra-minimalist, distraction-free writing interface (Notion / Medium Style).
 * Backend submission and drafts management handled natively by Laravel.
 * 
 * Features:
 * 1. Tabbed Navigation ("Write Article" & "Drafts")
 * 2. Big Box Headline Input (Auto-grow, 255 Character Limit, Single-line)
 * 3. Section / Category Dropdown Selection
 * 4. Excerpt (Short Summary) Teaser Field with Character Counter (255 Limit)
 * 5. Notion-Style Rich Text Editor with Formatting Toolbar (execCommand + selection state)
 * 6. Live Writing Metrics (Words, Characters)
 * 7. Clean Paste Handling & Typography Normalization:
 *    - Strips all foreign inline font-family, font-size, colors, classes, and span tags.
 *    - Enforces the publication's default typography.
 * 8. Draft Loading & Editing:
 *    - Decodes corrupted HTML entities (&amp;lt;, &lt;, etc.).
 *    - Strips any code-like span or style attributes.
 *    - Renders pristine, clean paragraphs ready for editing.
 * 9. Native Laravel Form Submission (Draft vs Pending Review).
 * ============================================================================
 */

/**
 * Normalizes Unicode Mathematical Alphanumeric Symbols (U+1D400–U+1D7FF)
 * and Letterlike Symbols back to standard basic Latin ASCII characters (A-Z, a-z, 0-9).
 */
function normalizeUnicodeText(str) {
    if (!str || typeof str !== 'string') return '';

    let normalized = str;
    try {
        normalized = normalized.normalize('NFKD');
    } catch (e) {
        // Fallback if normalize is unsupported
    }

    // Mathematical Alphanumeric Symbol Blocks (Upper start, Lower start)
    const mathBlocks = [
        [0x1D400, 0x1D41A], // Math Bold
        [0x1D434, 0x1D44E], // Math Italic
        [0x1D468, 0x1D482], // Math Bold Italic
        [0x1D49C, 0x1D4B6], // Math Script
        [0x1D4D0, 0x1D4EA], // Math Bold Script
        [0x1D504, 0x1D51E], // Math Fraktur
        [0x1D538, 0x1D552], // Math Double-Struck
        [0x1D56C, 0x1D586], // Math Bold Fraktur
        [0x1D5A0, 0x1D5BA], // Math Sans-Serif
        [0x1D5D4, 0x1D5EE], // Math Sans-Serif Bold
        [0x1D608, 0x1D622], // Math Sans-Serif Italic
        [0x1D63C, 0x1D656], // Math Sans-Serif Bold Italic
        [0x1D670, 0x1D68A], // Math Monospace
    ];

    // Letterlike symbols that substitute for Math characters in Unicode
    const letterlikeMap = {
        0x2102: 'C', 0x210A: 'g', 0x210B: 'H', 0x210C: 'H', 0x210D: 'H', 0x210E: 'h',
        0x210F: 'h', 0x2110: 'I', 0x2111: 'I', 0x2112: 'L', 0x2113: 'l', 0x2115: 'N',
        0x2118: 'P', 0x2119: 'P', 0x211A: 'Q', 0x211B: 'R', 0x211C: 'R', 0x211D: 'R',
        0x2124: 'Z', 0x2128: 'Z', 0x212C: 'B', 0x212D: 'C', 0x212E: 'e', 0x212F: 'e',
        0x2130: 'E', 0x2131: 'F', 0x2133: 'M', 0x2134: 'o'
    };

    let result = '';
    for (const char of normalized) {
        const cp = char.codePointAt(0);

        // Digits (U+1D7CE - U+1D7FF: Bold, Double-struck, Sans, Sans-bold, Monospace)
        if (cp >= 0x1D7CE && cp <= 0x1D7FF) {
            result += String.fromCharCode(48 + ((cp - 0x1D7CE) % 10));
            continue;
        }

        // Letterlike symbols
        if (letterlikeMap[cp]) {
            result += letterlikeMap[cp];
            continue;
        }

        // Math letter blocks (A-Z, a-z)
        let matched = false;
        for (let i = 0; i < mathBlocks.length; i++) {
            const upperStart = mathBlocks[i][0];
            const lowerStart = mathBlocks[i][1];
            if (cp >= upperStart && cp <= upperStart + 25) {
                result += String.fromCharCode(65 + (cp - upperStart));
                matched = true;
                break;
            }
            if (cp >= lowerStart && cp <= lowerStart + 25) {
                result += String.fromCharCode(97 + (cp - lowerStart));
                matched = true;
                break;
            }
        }

        if (!matched) {
            result += char;
        }
    }

    return result;
}

document.addEventListener('DOMContentLoaded', () => {

    // Ensure contenteditable uses <div> consistently on Enter across all Chromium browsers
    try {
        document.execCommand('defaultParagraphSeparator', false, 'div');
    } catch (e) {
        // Ignore if not supported in environment
    }

    // =========================================================================
    // 1. DOM ELEMENT REFERENCES
    // =========================================================================
    // Native Laravel Form & Hidden Inputs
    const laravelForm = document.getElementById('laravel-article-form');
    const hiddenArticleId = document.getElementById('hidden-article-id');
    const hiddenContent = document.getElementById('hidden-content');
    const hiddenStatus = document.getElementById('hidden-status');
    const deleteDraftForm = document.getElementById('delete-draft-form');

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

    // =========================================================================
    // 2. TOAST NOTIFICATION HELPER
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
    // 3. TAB SWITCHING LOGIC ("Write Article" vs "Drafts")
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
    // 4. HEADLINE AUTO-GROW & CHAR COUNT (255 LIMIT)
    // =========================================================================
    function autoResizeHeadline() {
        if (!headlineInput) return;
        headlineInput.style.height = 'auto';
        const scrollH = headlineInput.scrollHeight;

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
            headlineCharCount.style.color = length > 230 ? '#d92d20' : '#667085';
        }

        if (headlineInput.value.trim().length > 0 && headlineWrapper) {
            headlineWrapper.classList.remove('input-invalid');
        }
    }

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

        headlineInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const rawText = (e.clipboardData || window.clipboardData).getData('text') || '';
            const normalizedText = normalizeUnicodeText(rawText);
            const cleanText = normalizedText.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ');
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
    // 5. EXCERPT FIELD (255 LIMIT)
    // =========================================================================
    function handleExcerptInput() {
        if (!excerptInput) return;
        const length = excerptInput.value.length;
        if (excerptCharCount) {
            excerptCharCount.textContent = `${length} / 255`;
            excerptCharCount.style.color = length > 230 ? '#d92d20' : '#667085';
        }
        if (excerptInput.value.trim().length > 0 && excerptWrapper) {
            excerptWrapper.classList.remove('input-invalid');
        }
    }

    if (excerptInput) {
        excerptInput.addEventListener('input', handleExcerptInput);

        excerptInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const rawText = (e.clipboardData || window.clipboardData).getData('text') || '';
            const normalizedText = normalizeUnicodeText(rawText);
            const start = excerptInput.selectionStart || 0;
            const end = excerptInput.selectionEnd || 0;
            const currentVal = excerptInput.value || '';
            const max = parseInt(excerptInput.getAttribute('maxlength') || '255', 10);
            const combined = (currentVal.substring(0, start) + normalizedText + currentVal.substring(end)).slice(0, max);
            excerptInput.value = combined;
            const newPos = Math.min(start + normalizedText.length, combined.length);
            excerptInput.setSelectionRange(newPos, newPos);
            excerptInput.dispatchEvent(new Event('input'));
        });
    }

    // =========================================================================
    // 6. CATEGORY DROPDOWN
    // =========================================================================
    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            if (categorySelect.value) {
                categorySelect.classList.remove('input-invalid');
            }
        });
    }

    // =========================================================================
    // 7. RICH TEXT TOOLBAR CONTROLS
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
                } else if (['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'].includes(cmd)) {
                    isActive = document.queryCommandState(cmd);
                }

                if (isActive) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            } catch (e) {
                // Ignore queryCommand errors
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
                    if (saveDraftBtn) saveDraftBtn.click();
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

        editorContent.addEventListener('mouseup', updateToolbarButtonStates);
        editorContent.addEventListener('paste', handleEditorPaste);
    }

    document.addEventListener('selectionchange', () => {
        if (document.activeElement === editorContent) {
            updateToolbarButtonStates();
        }
    });

    // =========================================================================
    // 8. LIVE WRITING METRICS (Words & Characters)
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
    // 9. CLEAN PASTE & SANITIZATION ENGINE (Forces Default Font Styles)
    // =========================================================================
    function decodeCorruptedHtmlEntities(str) {
        if (!str || typeof str !== 'string') return '';
        let decoded = str;
        let maxPasses = 5;
        while (maxPasses > 0 && (/&amp;(?:lt|gt|quot|#39|amp);|&(?:lt|gt|quot);/i.test(decoded))) {
            const txt = document.createElement('textarea');
            txt.innerHTML = decoded;
            const newDecoded = txt.value;
            if (newDecoded === decoded) break;
            decoded = newDecoded;
            maxPasses--;
        }
        return decoded;
    }

    function sanitizeArticleContent(raw) {
        if (!raw) return '';
        // 1. Normalize Unicode mathematical alphanumeric symbols and decode recursive HTML entities
        let content = normalizeUnicodeText(decodeCorruptedHtmlEntities(String(raw).trim()));

        // 2. Remove all span and font tags (unwrap inner text)
        content = content
            .replace(/&lt;\/?(span|font|o:p)[^&>]*&gt;/gi, '')
            .replace(/<\/?(span|font|o:p)[^>]*>/gi, '')
            .replace(/\s*(style|class|id|dir|lang|face|size|color)=["'][^"']*["']/gi, '')
            .replace(/\s*(style|class|id|dir|lang|face|size|color)=\S+/gi, '')
            .replace(/&lt;[^&>]+&gt;/gi, '');

        // 3. Check if content has HTML markup
        const hasHtmlTags = /<\/?(?:div|p|b|i|u|strong|em|h[1-6]|ul|ol|li|blockquote|br|a)[^>]*>/i.test(content);
        if (!hasHtmlTags) {
            const paras = content.split(/\r?\n\r?\n+/).map(p => p.trim()).filter(Boolean);
            if (paras.length === 0) return '';
            return paras.map(p => `<div>${p}</div>`).join('<div><br></div>');
        }

        // Convert <p> to <div> for Notion-style editor
        content = content
            .replace(/<\/p>\s*<p[^>]*>/gi, '</div><div><br></div><div>')
            .replace(/<p[^>]*>/gi, '<div>')
            .replace(/<\/p>/gi, '</div>');

        return content;
    }

    function handleEditorPaste(e) {
        // 1. Ensure e.preventDefault() completely blocks browser default paste behavior
        e.preventDefault();

        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;

        // 2. Intercept both text/html and text/plain
        let text = clipboardData.getData('text/plain') || '';
        let html = clipboardData.getData('text/html') || '';

        // Normalize Unicode Mathematical Alphanumeric Symbols (U+1D400–U+1D7FF) to standard ASCII
        text = normalizeUnicodeText(text);
        if (html) {
            html = normalizeUnicodeText(html);
        }

        // 3. Plain Text Fallback: If it's a plain text paste (like Ctrl+Shift+V) or no HTML was provided
        if (e.shiftKey || !html.trim()) {
            if (text) {
                // Guarantee pure plain text insertion without wrapper tags that inherit rogue styles
                document.execCommand('insertText', false, text);
                updateEditorMetrics();
            }
            return;
        }

        // 4. Aggressive Sanitization on text/html
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // a. Remove non-content / dangerous elements completely
            doc.body.querySelectorAll('script, style, meta, link, object, embed, iframe, xml, title, noscript, applet').forEach(el => el.remove());

            // b. Tag Stripping: Completely unwrap and destroy all <span>, <font>, <o:p>, and <meta> tags, leaving only inner text
            let tagToUnwrap;
            while ((tagToUnwrap = doc.body.querySelector('span, font, o\\:p, meta'))) {
                const parent = tagToUnwrap.parentNode;
                if (parent) {
                    while (tagToUnwrap.firstChild) {
                        parent.insertBefore(tagToUnwrap.firstChild, tagToUnwrap);
                    }
                    parent.removeChild(tagToUnwrap);
                } else {
                    tagToUnwrap.remove();
                }
            }

            // c. Aggressively REMOVE all style, class, id, face, size, color, dir, and lang attributes from EVERY element
            const forbiddenAttrs = ['style', 'class', 'id', 'face', 'size', 'color', 'dir', 'lang', 'align', 'valign', 'bgcolor', 'border'];
            doc.body.querySelectorAll('*').forEach(el => {
                forbiddenAttrs.forEach(attr => el.removeAttribute(attr));
                Array.from(el.attributes).forEach(attr => {
                    const attrName = attr.name.toLowerCase();
                    if (attrName.startsWith('style') || attrName.startsWith('class') || attrName.startsWith('data-') || attrName.startsWith('mso-')) {
                        el.removeAttribute(attr.name);
                    } else if (el.tagName.toLowerCase() !== 'a' && el.tagName.toLowerCase() !== 'img') {
                        el.removeAttribute(attr.name);
                    }
                });
            });

            // d. Check if any formatting tags exist (bold, italic, underline, headings, lists, links, blockquote)
            const hasFormatting = doc.body.querySelector('b, strong, i, em, u, s, strike, h1, h2, h3, h4, h5, h6, blockquote, ul, ol, li, a');

            if (!hasFormatting) {
                // If the pasted HTML has no formatting, insert purely as clean text to inherit root typography
                if (text) {
                    document.execCommand('insertText', false, text);
                    updateEditorMetrics();
                    return;
                }
            }

            // e. Convert <p> and heading blocks into clean Notion-style blocks
            doc.body.querySelectorAll('p').forEach(p => {
                const div = doc.createElement('div');
                while (p.firstChild) {
                    div.appendChild(p.firstChild);
                }
                if (p.parentNode) {
                    p.parentNode.replaceChild(div, p);
                }
            });

            doc.body.querySelectorAll('h1').forEach(h1 => {
                const h2 = doc.createElement('h2');
                while (h1.firstChild) {
                    h2.appendChild(h1.firstChild);
                }
                if (h1.parentNode) h1.parentNode.replaceChild(h2, h1);
            });

            doc.body.querySelectorAll('h4, h5, h6').forEach(h => {
                const h3 = doc.createElement('h3');
                while (h.firstChild) {
                    h3.appendChild(h.firstChild);
                }
                if (h.parentNode) h.parentNode.replaceChild(h3, h);
            });

            let cleanHtml = sanitizeArticleContent(doc.body.innerHTML.trim());

            if (cleanHtml) {
                document.execCommand('insertHTML', false, cleanHtml);
            } else if (text) {
                document.execCommand('insertText', false, text);
            }
        } catch (err) {
            // Fallback to pure plain text if parsing fails
            if (text) {
                document.execCommand('insertText', false, text);
            }
        }

        updateEditorMetrics();
    }

    // =========================================================================
    // 10. DRAFTS LOADING & MANAGEMENT
    // =========================================================================
    function loadDraftIntoEditor(draft) {
        if (!draft) return;

        // Switch to Write tab FIRST so metrics and layout recalculate accurately
        switchTab('write');

        if (headlineInput) {
            headlineInput.value = normalizeUnicodeText(draft.title || '');
            autoResizeHeadline();
        }
        if (categorySelect) {
            categorySelect.value = draft.category_id || '';
            categorySelect.classList.remove('input-invalid');
        }
        if (excerptInput) {
            excerptInput.value = normalizeUnicodeText(draft.excerpt || '');
            handleExcerptInput();
        }
        if (hiddenArticleId) {
            hiddenArticleId.value = draft.id || '';
        }
        if (editorContent) {
            // Thoroughly decode any corrupted entities and strip span/style codes
            const cleanContent = sanitizeArticleContent(draft.content || '');
            editorContent.innerHTML = cleanContent;
            editorContent.style.textAlign = 'justify';
            updateEditorMetrics();
        }

        activeEditingDraftId = draft.id;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('Draft loaded into editor.', 'success');
    }

    function renderDraftsList() {
        if (!draftsListContainer) return;
        const draftBoxes = draftsListContainer.querySelectorAll('.draft-box');
        if (draftBoxes.length === 0 && emptyDraftsState) {
            emptyDraftsState.classList.remove('hidden');
            emptyDraftsState.style.display = 'block';
        } else if (emptyDraftsState) {
            emptyDraftsState.classList.add('hidden');
            emptyDraftsState.style.display = 'none';
        }
        if (draftsCountBadge) {
            draftsCountBadge.textContent = draftBoxes.length;
        }
    }

    // Event delegation on drafts list
    if (draftsListContainer) {
        draftsListContainer.addEventListener('click', (e) => {
            // Delete Draft Action
            const deleteBtn = e.target.closest('[data-action="delete"]');
            if (deleteBtn) {
                e.stopPropagation();
                const id = deleteBtn.dataset.id;
                if (id && confirm('Are you sure you want to delete this draft?')) {
                    if (deleteDraftForm) {
                        const basePath = window.location.pathname.startsWith('/section-head') ? '/section-head' : '/writer';
                        deleteDraftForm.action = `${basePath}/drafts/${id}`;
                        deleteDraftForm.submit();
                    }
                }
                return;
            }

            // Edit Draft Action (Clicking edit button or title or card)
            const editBtn = e.target.closest('[data-action="edit"]');
            const draftBox = e.target.closest('.draft-box');
            if (editBtn || draftBox) {
                const box = draftBox || editBtn.closest('.draft-box');
                if (box && box.dataset.draft) {
                    try {
                        const draftData = JSON.parse(box.dataset.draft);
                        loadDraftIntoEditor(draftData);
                    } catch (err) {
                        console.error('Error reading draft JSON:', err);
                    }
                }
            }
        });
    }

    // =========================================================================
    // 11. FORM SUBMISSION (Save Draft vs Submit Article)
    // =========================================================================
    function handleFormSubmit(status) {
        const activeForm = document.getElementById('laravel-article-form') || document.querySelector('form');
        if (!activeForm) {
            console.error("Form not found!");
            return;
        }

        const headline = headlineInput ? headlineInput.value.trim() : '';
        const category = categorySelect ? categorySelect.value : '';
        const excerpt = excerptInput ? excerptInput.value.trim() : '';
        const contentText = editorContent ? editorContent.innerText.trim() : '';

        if (status === 'Pending Review') {
            let hasError = false;
            if (!headline) {
                if (headlineWrapper) headlineWrapper.classList.add('input-invalid');
                hasError = true;
            }
            if (!category) {
                if (categorySelect) categorySelect.classList.add('input-invalid');
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
                showToast('Please fill in all required fields before submitting.', 'error');
                return;
            }
        } else {
            // Saving as Draft: require at least title or content, and category
            if (!headline && !contentText) {
                showToast('Please enter at least a headline or some content to save as draft.', 'error');
                return;
            }
            if (!category) {
                if (categorySelect) categorySelect.classList.add('input-invalid');
                showToast('Please select a section category before saving.', 'error');
                return;
            }
        }

        // Clean and sanitize the editor content before sending to Laravel
        const cleanContent = sanitizeArticleContent(editorContent.innerHTML);

        // Make sure hidden inputs actually exist before assigning
        if (!hiddenContent) {
            const hc = document.createElement('input');
            hc.type = 'hidden'; hc.name = 'content'; hc.id = 'hidden-content';
            hc.value = cleanContent;
            activeForm.appendChild(hc);
        } else {
            hiddenContent.value = cleanContent;
        }

        if (!hiddenStatus) {
            const hs = document.createElement('input');
            hs.type = 'hidden'; hs.name = 'status'; hs.id = 'hidden-status';
            hs.value = status;
            activeForm.appendChild(hs);
        } else {
            hiddenStatus.value = status;
        }

        activeForm.submit();
    }

    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleFormSubmit('Draft');
        });
    }

    if (submitArticleBtn) {
        submitArticleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleFormSubmit('Pending Review');
        });
    }

    // =========================================================================
    // 12. INITIAL RENDER & PRELOAD CHECK
    // =========================================================================
    autoResizeHeadline();
    handleExcerptInput();
    updateEditorMetrics();
    updateToolbarButtonStates();
    renderDraftsList();

    // Display session flash messages as sleek toast notifications
    if (window.__SESSION_SUCCESS__) {
        showToast(window.__SESSION_SUCCESS__, 'success');
    }
    if (window.__SESSION_ERROR__) {
        showToast(window.__SESSION_ERROR__, 'danger');
    }

    // Check if an editing draft was passed via server variable or URL query param
    if (window.__INITIAL_EDITING_DRAFT__) {
        loadDraftIntoEditor(window.__INITIAL_EDITING_DRAFT__);
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        const targetId = urlParams.get('draft_id') || urlParams.get('draftId') || urlParams.get('id');
        if (targetId && draftsListContainer) {
            const targetBox = draftsListContainer.querySelector(`.draft-box[data-id="${targetId}"]`);
            if (targetBox && targetBox.dataset.draft) {
                try {
                    loadDraftIntoEditor(JSON.parse(targetBox.dataset.draft));
                } catch (e) {}
            }
        } else if (urlParams.get('tab') === 'drafts') {
            switchTab('drafts');
        }
    }
});
