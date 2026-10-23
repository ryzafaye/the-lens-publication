/**
 * ============================================================================
 * THE LENS — SUBMIT ARTICLE LOGIC (SECTION HEAD PORTAL)
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
    const userRole = localStorage.getItem('sectionHeadRole') || localStorage.getItem('userRole') || 'News Head';
    const authorName = localStorage.getItem('sectionHeadName') || localStorage.getItem('userName') || 'Danilo C. Ramos';
    const currentSection = localStorage.getItem('sectionHeadSection') || 'News';

    if (authorNameDisplay) {
        authorNameDisplay.textContent = authorName;
    }

    if (categorySelect && currentSection) {
        for (let i = 0; i < categorySelect.options.length; i++) {
            if (categorySelect.options[i].value.toLowerCase().includes(currentSection.toLowerCase())) {
                categorySelect.selectedIndex = i;
                break;
            }
        }
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
    const DRAFTS_STORAGE_KEY = 'sectionHeadArticleDrafts';

    const defaultDrafts = [
        {
            id: 'sh-draft-01',
            title: `Draft Outline: Semester-End ${currentSection} Retrospective`,
            category: currentSection,
            excerpt: "Curated collection of the most consequential stories, investigative disclosures, and student assembly triumphs documented this term.",
            date: "Oct 22, 2026",
            rawDate: "2026-10-22",
            content: `<div>Preliminary notes and section breakdown for our publication's culminating printed folio and digital archival edition.</div>`
        }
    ];

    function getStoredDrafts() {
        try {
            const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.warn('Could not read sectionHeadArticleDrafts', e);
        }
        return defaultDrafts;
    }

    function saveStoredDrafts(drafts) {
        try {
            localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
        } catch (e) {
            console.warn('Could not save sectionHeadArticleDrafts', e);
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
            autoResizeTextarea(headlineInput);
            const count = headlineInput.value.length;
            if (headlineCharCount) {
                headlineCharCount.textContent = `${count} / 255`;
                headlineCharCount.classList.toggle('near-limit', count > 230);
            }
            if (headlineWrapper) {
                headlineWrapper.classList.remove('input-invalid');
            }
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
        const buttons = toolbar.querySelectorAll('.tool-btn');
        buttons.forEach(btn => {
            const cmd = btn.getAttribute('data-command');
            if (cmd && ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList'].includes(cmd)) {
                try {
                    const isActive = document.queryCommandState(cmd);
                    btn.classList.toggle('active', !!isActive);
                } catch (e) {}
            }
        });
    }

    document.addEventListener('selectionchange', () => {
        if (document.activeElement === editorContent) {
            updateActiveToolbarStates();
        }
    });

    // =========================================================================
    // 8. LIVE WRITING METRICS (Words & Characters)
    // =========================================================================
    function getPlainTextContent() {
        if (!editorContent) return '';
        return editorContent.innerText || editorContent.textContent || '';
    }

    function updateWritingMetrics() {
        const text = getPlainTextContent().trim();
        const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
        const chars = text.length;

        if (wordsCountEl) wordsCountEl.textContent = `${words.toLocaleString()} words`;
        if (charsCountEl) charsCountEl.textContent = `${chars.toLocaleString()} characters`;
    }

    if (editorContent) {
        editorContent.addEventListener('input', () => {
            updateWritingMetrics();
            if (editorWrapper) editorWrapper.classList.remove('input-invalid');
        });
    }

    // =========================================================================
    // 9. FORM RESET & LOAD DRAFT
    // =========================================================================
    function clearWritingCanvas() {
        if (headlineInput) {
            headlineInput.value = '';
            autoResizeTextarea(headlineInput);
            if (headlineCharCount) headlineCharCount.textContent = '0 / 255';
        }
        if (excerptInput) {
            excerptInput.value = '';
            autoResizeTextarea(excerptInput);
            if (excerptCharCount) excerptCharCount.textContent = '0 / 255';
        }
        if (editorContent) {
            editorContent.innerHTML = '';
            editorContent.style.textAlign = 'justify';
        }
        if (categorySelect && currentSection) {
            for (let i = 0; i < categorySelect.options.length; i++) {
                if (categorySelect.options[i].value.toLowerCase().includes(currentSection.toLowerCase())) {
                    categorySelect.selectedIndex = i;
                    break;
                }
            }
        }
        activeEditingDraftId = null;
        updateWritingMetrics();
    }

    function findArticleOrDraft(id) {
        if (!id) return null;
        let found = draftsList.find(d => String(d.id) === String(id));
        if (found) return found;

        try {
            const raw = localStorage.getItem('sectionHeadMyArticles_v1');
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list)) {
                    found = list.find(a => String(a.id) === String(id));
                    if (found) return found;
                }
            }
        } catch (e) {}

        found = defaultDrafts.find(d => String(d.id) === String(id));
        return found || null;
    }

    function loadDraftIntoCanvas(draftId) {
        const draft = findArticleOrDraft(draftId);
        if (!draft) return;

        activeEditingDraftId = draft.id;

        switchTab('write');

        if (headlineInput) {
            headlineInput.value = draft.title || '';
            autoResizeTextarea(headlineInput);
            if (headlineCharCount) headlineCharCount.textContent = `${draft.title.length} / 255`;
        }
        if (excerptInput) {
            excerptInput.value = draft.excerpt || '';
            excerptInput.style.textAlign = 'justify';
            autoResizeTextarea(excerptInput);
            if (excerptCharCount) excerptCharCount.textContent = `${draft.excerpt.length} / 255`;
        }
        if (categorySelect && draft.category) {
            categorySelect.value = draft.category;
        }
        if (editorContent) {
            let contentHtml = draft.content || draft.excerpt || '';
            if (!contentHtml.includes('<p>') && !contentHtml.includes('<div>')) {
                const paras = contentHtml.split(/\n\n+/).filter(p => p.trim());
                contentHtml = paras.map(p => `<div>${escapeHTML(p.trim())}</div>`).join('<div><br></div>');
            }
            editorContent.innerHTML = contentHtml;
            editorContent.style.textAlign = 'justify';
        }

        updateWritingMetrics();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('Article manuscript loaded into editor.', 'success');
    }

    // =========================================================================
    // 10. DRAFTS VIEW RENDERING (Exact Executive Draft Box Layout)
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
                        <span class="draft-box-category">${escapeHTML(draft.category || currentSection)}</span>
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

    // Event delegation on Drafts List Container (Matching Executive Parity)
    if (draftsListContainer) {
        draftsListContainer.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('[data-action="delete"]');
            if (deleteBtn) {
                e.stopPropagation();
                deleteDraft(deleteBtn.dataset.id);
                return;
            }

            const draftBox = e.target.closest('.draft-box');
            if (draftBox) {
                const id = draftBox.dataset.id;
                if (id) {
                    loadDraftIntoCanvas(id);
                }
            }
        });
    }

    function deleteDraft(id) {
        const box = document.getElementById(`draft-box-${id}`);
        if (box) box.classList.add('box-fade-out');

        setTimeout(() => {
            draftsList = draftsList.filter(d => d.id !== id);
            saveStoredDrafts(draftsList);

            // Also sync deletion with sectionHeadMyArticles_v1
            try {
                const raw = localStorage.getItem('sectionHeadMyArticles_v1');
                if (raw) {
                    let articles = JSON.parse(raw);
                    if (Array.isArray(articles)) {
                        articles = articles.filter(a => a.id !== id);
                        localStorage.setItem('sectionHeadMyArticles_v1', JSON.stringify(articles));
                    }
                }
            } catch (e) {}

            updateDraftsBadge();
            renderDraftsList();
            showToast('Draft deleted.', 'danger');
        }, 220);
    }

    // =========================================================================
    // 11. SAVE DRAFT ACTION
    // =========================================================================
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', () => {
            const headline = (headlineInput ? headlineInput.value.trim() : '');
            if (!headline) {
                if (headlineWrapper) headlineWrapper.classList.add('input-invalid');
                if (headlineInput) headlineInput.focus();
                showToast('Please provide a draft headline before saving.', 'warning');
                return;
            }

            const category = (categorySelect ? categorySelect.value : currentSection) || currentSection;
            const excerpt = (excerptInput ? excerptInput.value.trim() : '');
            const content = (editorContent ? editorContent.innerHTML : '');

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const rawDate = now.toISOString().split('T')[0];

            if (activeEditingDraftId) {
                // Update existing
                const index = draftsList.findIndex(d => d.id === activeEditingDraftId);
                if (index !== -1) {
                    draftsList[index] = {
                        ...draftsList[index],
                        title: headline,
                        category: category,
                        excerpt: excerpt,
                        content: content,
                        date: dateStr,
                        rawDate: rawDate
                    };
                }
            } else {
                // Create new draft
                const newDraft = {
                    id: 'sh-draft-' + Date.now(),
                    title: headline,
                    category: category,
                    excerpt: excerpt,
                    content: content,
                    date: dateStr,
                    rawDate: rawDate
                };
                draftsList.unshift(newDraft);
            }

            saveStoredDrafts(draftsList);

            // Sync with sectionHeadMyArticles_v1
            try {
                const raw = localStorage.getItem('sectionHeadMyArticles_v1');
                let articles = raw ? JSON.parse(raw) : [];
                const existingIdx = articles.findIndex(a => a.id === activeEditingDraftId);
                const draftObj = {
                    id: activeEditingDraftId || ('sec-art-draft-' + Date.now()),
                    author: authorName,
                    title: headline,
                    category: category,
                    excerpt: excerpt,
                    date: dateStr,
                    rawDate: rawDate,
                    status: 'Draft',
                    views: 0,
                    shares: 0,
                    remarks: '',
                    content: getPlainTextContent()
                };

                if (existingIdx !== -1) {
                    articles[existingIdx] = draftObj;
                } else {
                    articles.unshift(draftObj);
                }
                localStorage.setItem('sectionHeadMyArticles_v1', JSON.stringify(articles));
            } catch (e) {}

            updateDraftsBadge();
            clearWritingCanvas();
            switchTab('drafts');
            showToast('Draft saved successfully.', 'success');
        });
    }

    // =========================================================================
    // 12. SUBMIT ARTICLE ACTION
    // =========================================================================
    if (submitArticleBtn) {
        submitArticleBtn.addEventListener('click', () => {
            const headline = (headlineInput ? headlineInput.value.trim() : '');
            const category = (categorySelect ? categorySelect.value : '');
            const excerpt = (excerptInput ? excerptInput.value.trim() : '');
            const plainText = getPlainTextContent().trim();

            let hasError = false;

            if (!headline) {
                if (headlineWrapper) headlineWrapper.classList.add('input-invalid');
                hasError = true;
            }
            if (!category) {
                if (categorySelect) categorySelect.focus();
                hasError = true;
            }
            if (!excerpt) {
                if (excerptWrapper) excerptWrapper.classList.add('input-invalid');
                hasError = true;
            }
            if (!plainText) {
                if (editorWrapper) editorWrapper.classList.add('input-invalid');
                hasError = true;
            }

            if (hasError) {
                showToast('Please complete all required fields before submitting.', 'warning');
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

            // 1. Add to Section Head / Executive Pending Review Queue
            try {
                const rawQueue = localStorage.getItem('sectionHeadReviewQueue_v1');
                let queue = rawQueue ? JSON.parse(rawQueue) : [];
                queue.unshift(newSubmission);
                localStorage.setItem('sectionHeadReviewQueue_v1', JSON.stringify(queue));
            } catch (e) {}

            // 2. Add to Section Head's Personal Articles as "Pending Review"
            try {
                const rawMy = localStorage.getItem('sectionHeadMyArticles_v1');
                let myArticles = rawMy ? JSON.parse(rawMy) : [];
                myArticles.unshift({
                    id: 'sec-art-' + Date.now(),
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
                localStorage.setItem('sectionHeadMyArticles_v1', JSON.stringify(myArticles));
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
