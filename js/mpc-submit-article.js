/**
 * ============================================================================
 * THE LENS — SUBMIT ARTICLE LOGIC (MEDIA & PUBLIC COMMUNICATIONS / M&PC PORTAL)
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
    const autoSaveStatusEl = document.getElementById('auto-save-status');

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
    const currentUserRole = localStorage.getItem('mpcRole') || localStorage.getItem('userRole') || 'M&PC Head';
    const currentUserName = localStorage.getItem('mpcName') || localStorage.getItem('userName') || 'Julian Del Rosario';

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
    const DRAFTS_STORAGE_KEY = 'mpcArticleDrafts';

    const defaultDrafts = [
        {
            id: 'mpc-draft-01',
            title: "Investigation: The evolving dynamics of campus social graphics and news distribution",
            category: "Features",
            excerpt: "An inquiry into digital readership metrics, infographic retention, and print pickup points across campus libraries.",
            date: "Oct 22, 2026",
            rawDate: "2026-10-22",
            content: `<div>An inquiry into digital readership metrics, infographic retention, and print pickup points across campus libraries.</div><div><br></div><div>Student readership patterns demonstrate an increasing preference for verified bite-sized summaries paired with comprehensive digital investigation manuscripts.</div>`
        },
        {
            id: 'mpc-draft-02',
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
            console.warn('Could not read mpcArticleDrafts from localStorage:', e);
        }
        return JSON.parse(JSON.stringify(defaultDrafts));
    }

    function saveDraftsToStorage(drafts) {
        try {
            localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
        } catch (e) {
            console.warn('Could not write mpcArticleDrafts to localStorage:', e);
        }
    }

    let draftsList = loadDraftsFromStorage();

    function updateDraftsBadge() {
        if (draftsCountBadge) {
            draftsCountBadge.textContent = draftsList.length;
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
            const currentSelection = window.getSelection();
            const selectedText = currentSelection ? currentSelection.toString() : '';
            const url = prompt('Enter link URL (e.g., https://example.com):', 'https://');
            if (url && url.trim() !== '' && url !== 'https://') {
                document.execCommand('createLink', false, url.trim());
            }
            updateToolbarButtonStates();
            return;
        }

        if (command === 'formatBlock') {
            document.execCommand('formatBlock', false, value);
            updateToolbarButtonStates();
            return;
        }

        document.execCommand(command, false, value);
        updateToolbarButtonStates();
    }

    if (toolbar) {
        toolbar.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Retain editor focus/selection
                const command = btn.dataset.command;
                const value = btn.dataset.value || null;
                if (command) {
                    executeFormatCommand(command, value);
                }
            });
        });
    }

    // Keyboard shortcuts inside editor (Ctrl+B, Ctrl+I, Ctrl+U)
    if (editorContent) {
        editorContent.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                const key = e.key.toLowerCase();
                if (key === 'b') {
                    e.preventDefault();
                    executeFormatCommand('bold');
                } else if (key === 'i') {
                    e.preventDefault();
                    executeFormatCommand('italic');
                } else if (key === 'u') {
                    e.preventDefault();
                    executeFormatCommand('underline');
                }
            }
        });

        // Clear error style on input
        editorContent.addEventListener('input', () => {
            updateEditorMetrics();
            if (editorWrapper && editorContent.innerText.trim().length > 0) {
                editorWrapper.classList.remove('input-invalid');
            }
        });

        // Active state update on caret movement
        editorContent.addEventListener('keyup', () => {
            updateToolbarButtonStates();
        });
        editorContent.addEventListener('mouseup', () => {
            updateToolbarButtonStates();
        });
        editorContent.addEventListener('focus', () => {
            updateToolbarButtonStates();
        });
    }

    // Active state highlighting for toolbar buttons
    function updateToolbarButtonStates() {
        if (!toolbar) return;

        const isBold = document.queryCommandState('bold');
        const isItalic = document.queryCommandState('italic');
        const isUnderline = document.queryCommandState('underline');
        const isStrike = document.queryCommandState('strikeThrough');
        const isUList = document.queryCommandState('insertUnorderedList');
        const isOList = document.queryCommandState('insertOrderedList');

        const blockValue = (document.queryCommandValue('formatBlock') || '').toLowerCase();

        toolbar.querySelectorAll('.tool-btn').forEach(btn => {
            const cmd = btn.dataset.command;
            const val = (btn.dataset.value || '').toLowerCase();

            btn.classList.remove('active');

            if (cmd === 'bold' && isBold) btn.classList.add('active');
            if (cmd === 'italic' && isItalic) btn.classList.add('active');
            if (cmd === 'underline' && isUnderline) btn.classList.add('active');
            if (cmd === 'strikeThrough' && isStrike) btn.classList.add('active');
            if (cmd === 'insertUnorderedList' && isUList) btn.classList.add('active');
            if (cmd === 'insertOrderedList' && isOList) btn.classList.add('active');

            if (cmd === 'formatBlock') {
                if (val === '<h2>' && (blockValue === 'h2' || blockValue.includes('h2'))) btn.classList.add('active');
                if (val === '<h3>' && (blockValue === 'h3' || blockValue.includes('h3'))) btn.classList.add('active');
                if (val === '<blockquote>' && (blockValue === 'blockquote' || blockValue.includes('blockquote'))) btn.classList.add('active');
            }
        });
    }

    // =========================================================================
    // 10. LIVE WRITING METRICS (Words, Characters, Estimated Reading Time)
    // =========================================================================
    function updateEditorMetrics() {
        if (!editorContent) return;

        const rawText = editorContent.innerText || '';
        const cleanText = rawText.trim();

        // Calculate Words
        const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
        // Calculate Characters (excluding carriage returns)
        const characters = rawText.replace(/[\r\n]/g, '').length;

        if (wordsCountEl) {
            wordsCountEl.textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
        }

        if (charsCountEl) {
            charsCountEl.textContent = `${characters} ${characters === 1 ? 'character' : 'characters'}`;
        }
    }

    // =========================================================================
    // 11. DRAFTS VIEW RENDERING (Review Articles Card Layout)
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

        if (autoSaveStatusEl) {
            autoSaveStatusEl.textContent = 'Draft ready';
            autoSaveStatusEl.style.color = '#667085';
        }
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
            id: activeEditingDraftId || `mpc-draft-${Date.now()}`,
            title: headline || 'Untitled Draft',
            category: category || 'News',
            excerpt: excerpt,
            date: currentDate,
            rawDate: new Date().toISOString().split('T')[0],
            content: bodyHtml
        };

        if (activeEditingDraftId) {
            // Update existing draft
            const index = draftsList.findIndex(d => d.id === activeEditingDraftId);
            if (index !== -1) {
                draftsList[index] = draftEntry;
            } else {
                draftsList.unshift(draftEntry);
            }

            // Sync with mpcMyArticles_v1 if it originated there
            try {
                const rawMy = localStorage.getItem('mpcMyArticles_v1');
                if (rawMy) {
                    let myArts = JSON.parse(rawMy);
                    if (Array.isArray(myArts)) {
                        const mIndex = myArts.findIndex(a => String(a.id) === String(activeEditingDraftId));
                        if (mIndex !== -1) {
                            myArts[mIndex].title = draftEntry.title;
                            myArts[mIndex].category = draftEntry.category;
                            myArts[mIndex].excerpt = draftEntry.excerpt;
                            myArts[mIndex].content = draftEntry.content;
                            localStorage.setItem('mpcMyArticles_v1', JSON.stringify(myArts));
                        }
                    }
                }
            } catch (e) {}
        } else {
            // Prepend new draft
            draftsList.unshift(draftEntry);
        }

        // Persist to localStorage
        saveDraftsToStorage(draftsList);
        updateDraftsBadge();

        // Show toast notification
        showToast('Draft saved successfully', 'success');

        // Clear the form fields per Executive logic
        clearFormFields();

        // Also update the rendered list in Drafts tab
        renderDraftsList();
    }

    const DEFAULT_MPC_SEED = [
        {
            id: 'mpc-art-01',
            title: 'Expanding Digital Readership: The Lens Public Web Portal Redesign',
            category: 'News',
            excerpt: 'How our media and public communications desk modernized digital circulation metrics and accelerated open campus news distribution.',
            content: `Modern collegiate readership demands accessible, high-speed delivery across mobile devices and digital platforms.\n\nOver the past academic semester, the Media and Public Communications (M&PC) team worked in close coordination with section heads and technical editors to overhaul our publication site architecture. By synchronizing editorial cartoons, visual publication materials, and investigative manuscripts into unified release pipelines, readership metrics surged by 38%.\n\nOur commitment remains centered on providing every campus constituent with direct, reliable, and fact-verified journalism.`
        },
        {
            id: 'mpc-art-02',
            title: 'Visual Journalism Ethics: Standards for Campus Photojournalists & Illustrators',
            category: 'Features',
            excerpt: 'Guidelines and verification procedures ensuring truth, context, and dignity in campus visual news reporting and social graphics.',
            content: `As visual storytelling takes center stage on university channels, the line between illustrative enhancement and photo manipulation requires clear ethical boundaries.\n\nThis guide establishes publication standards across photojournalism and graphic illustration desks: maintaining original contextual lighting, prohibiting altering of editorial subjects, and guaranteeing consent protocols for student vulnerability reporting.`
        },
        {
            id: 'mpc-art-03',
            title: 'Cross-Platform Storytelling: Reaching the Modern Collegiate Audience',
            category: 'Opinion',
            excerpt: 'Analyzing how multimedia sidebars, graphic teasers, and print archival editions reinforce journalistic transparency.',
            content: `Print and digital need not compete; they complement each other. While digital publication guarantees immediate reach during breaking campus events, printed folios remain our tangible historical record.\n\nOur cross-platform strategy blends both mediums to serve both immediate information needs and long-term university historical archives.`
        },
        {
            id: 'mpc-art-04',
            title: 'Campus Media Distribution: Print Archives vs Social Engagement Audit',
            category: 'News',
            excerpt: 'An evidence-based assessment of campus physical pickup kiosks, online engagement statistics, and newsletter subscriber analytics.',
            content: `Auditing circulation points across all five campus colleges provided pivotal insight into where student readership is most active.\n\nWhile kiosk pickups remain high near the College of Engineering and Liberal Arts library, over 65% of freshman and sophomore readers discover investigative scoops via social headlines and our web portal.`
        },
        {
            id: 'mpc-art-05',
            title: 'Photo Desk Curation: Addressing Sensitive Imagery in Crisis Coverage',
            category: 'Opinion',
            excerpt: 'Editorial protocols when capturing and publishing photos during student demonstrations, medical emergencies, and campus strikes.',
            content: `Documenting high-stress campus events tests the ethical compass of any student publication desk. Balancing the public interest against individual privacy and security must be resolved systematically before pressing publish.\n\nThis document outlines our recommended screening matrix for selecting hero cover imagery.`
        }
    ];

    function findArticleOrDraft(id) {
        if (!id) return null;

        // 1. Check in draftsList (from mpcArticleDrafts)
        let found = draftsList.find(d => String(d.id) === String(id));
        if (found) return found;

        // 2. Check in mpcMyArticles_v1 (personal articles for M&PC)
        try {
            const raw = localStorage.getItem('mpcMyArticles_v1');
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list)) {
                    found = list.find(a => String(a.id) === String(id));
                    if (found) return found;
                }
            }
        } catch (e) {}

        // 3. Check in default M&PC seed
        found = DEFAULT_MPC_SEED.find(d => String(d.id) === String(id));
        if (found) return found;

        // 4. Check executiveArticles / theLensArticles
        try {
            const raw = localStorage.getItem('executiveArticles') || localStorage.getItem('theLensArticles');
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

    function editDraftAction(id) {
        const draft = findArticleOrDraft(id);
        if (!draft) {
            console.warn('Could not find draft or article with ID:', id);
            return;
        }

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
            let contentHtml = draft.content || draft.excerpt || '';
            // If raw text with newlines and without HTML tags, convert to paragraphs/divs
            if (!contentHtml.includes('<p>') && !contentHtml.includes('<div>')) {
                const paras = contentHtml.split(/\n\n+/).filter(p => p.trim());
                contentHtml = paras.map(p => `<div>${escapeHTML(p.trim())}</div>`).join('<div><br></div>');
            } else if (contentHtml.includes('<p>') || contentHtml.includes('<p ') || contentHtml.includes('</p>')) {
                contentHtml = contentHtml
                    .replace(/<\/p>\s*<p[^>]*>/gi, '</div><div><br></div><div>')
                    .replace(/<p[^>]*>/gi, '<div>')
                    .replace(/<\/p>/gi, '</div>');
            }
            editorContent.innerHTML = contentHtml || '<div>Start writing your manuscript here...</div>';
            editorContent.style.textAlign = 'justify';
            updateEditorMetrics();
        }

        activeEditingDraftId = draft.id;

        if (autoSaveStatusEl) {
            autoSaveStatusEl.textContent = 'Editing manuscript';
            autoSaveStatusEl.style.color = '#e27219';
        }

        // Scroll smoothly to top of writing canvas
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('Article manuscript loaded into editor.', 'success');
    }

    function deleteDraftAction(id) {
        const draftIndex = draftsList.findIndex(d => d.id === id);
        if (draftIndex === -1) return;

        const draftBox = document.getElementById(`draft-box-${id}`);
        if (draftBox) {
            draftBox.classList.add('box-fade-out');
        }

        setTimeout(() => {
            draftsList.splice(draftIndex, 1);
            saveDraftsToStorage(draftsList);
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
        const authorName = currentUserName;

        const newSubmissionId = `mpc-sub-${Date.now()}`;
        const currentDate = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        const currentIsoDate = new Date().toISOString().split('T')[0];

        const newSubmission = {
            id: newSubmissionId,
            title: headline,
            category: category,
            excerpt: excerpt,
            date: currentDate,
            rawDate: currentIsoDate,
            author: authorName,
            status: 'pending',
            remarks: '',
            content: editorContent.innerText.trim()
        };

        try {
            // Read or initialize queue
            let pendingQueue = [];
            const storedQueue = localStorage.getItem('executivePendingReviewQueue') || localStorage.getItem('eicPendingReviewQueue');
            if (storedQueue) {
                try {
                    const parsed = JSON.parse(storedQueue);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        pendingQueue = parsed;
                    }
                } catch (e) {
                    pendingQueue = [];
                }
            }

            pendingQueue.unshift(newSubmission);
            localStorage.setItem('executivePendingReviewQueue', JSON.stringify(pendingQueue));
            localStorage.setItem('eicPendingReviewQueue', JSON.stringify(pendingQueue));

            // Synchronize with Manage Articles table
            let executiveArticles = [];
            const storedArticles = localStorage.getItem('executiveArticles');
            if (storedArticles) {
                try {
                    executiveArticles = JSON.parse(storedArticles);
                    executiveArticles.unshift({
                        id: newSubmissionId,
                        title: headline,
                        category: category,
                        author: authorName,
                        date: currentDate,
                        status: 'Pending',
                        views: 0,
                        featured: false,
                        content: editorContent.innerText.trim()
                    });
                    localStorage.setItem('executiveArticles', JSON.stringify(executiveArticles));
                } catch (e) {
                    // Ignore parse error
                }
            }

            // Synchronize with M&PC Personal Articles (mpcMyArticles_v1)
            let mpcArticles = [];
            try {
                const rawMy = localStorage.getItem('mpcMyArticles_v1');
                if (rawMy) {
                    const parsedMy = JSON.parse(rawMy);
                    if (Array.isArray(parsedMy)) mpcArticles = parsedMy;
                }
            } catch (e) {}

            if (activeEditingDraftId) {
                const mIndex = mpcArticles.findIndex(a => String(a.id) === String(activeEditingDraftId));
                if (mIndex !== -1) {
                    mpcArticles[mIndex].title = headline;
                    mpcArticles[mIndex].category = category;
                    mpcArticles[mIndex].excerpt = excerpt;
                    mpcArticles[mIndex].content = editorContent.innerText.trim();
                    mpcArticles[mIndex].status = 'Pending Review';
                    mpcArticles[mIndex].remarks = '';
                    mpcArticles[mIndex].date = currentDate;
                } else {
                    mpcArticles.unshift({
                        id: activeEditingDraftId,
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
                    });
                }
            } else {
                mpcArticles.unshift({
                    id: newSubmissionId,
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
                });
            }
            localStorage.setItem('mpcMyArticles_v1', JSON.stringify(mpcArticles));

            // Log activity to mpcActivityLogs_v1 and executiveActivityLogs_v1
            try {
                const rawLogs = localStorage.getItem('mpcActivityLogs_v1');
                let logs = rawLogs ? JSON.parse(rawLogs) : [];
                logs.unshift({
                    id: `mpc-act-${Date.now()}`,
                    causer: authorName,
                    causerRole: currentUserRole,
                    causerAvatar: 'images/member-placeholder.svg',
                    action: 'submitted',
                    subjectType: 'Article',
                    subjectName: headline,
                    timestampText: 'Just now',
                    isoDate: new Date().toISOString(),
                    dateKey: currentIsoDate,
                    formattedDate: `${currentDate} • Just now`,
                    dayGroup: 'Today'
                });
                localStorage.setItem('mpcActivityLogs_v1', JSON.stringify(logs.slice(0, 30)));
            } catch (e) {}

            // Remove from drafts if editing an existing draft
            if (activeEditingDraftId) {
                draftsList = draftsList.filter(d => d.id !== activeEditingDraftId);
                saveDraftsToStorage(draftsList);
                updateDraftsBadge();
            }

            // Display success toast notification
            showToast('Article submitted successfully to the review queue.', 'success');

            // Clear form fields
            clearFormFields();

            // Redirect smoothly to manage my articles queue after brief pause
            setTimeout(() => {
                window.location.href = 'mpc-manage-my-articles.html';
            }, 1400);

        } catch (err) {
            console.error('Failed to submit article:', err);
            showToast('An error occurred while submitting your article.', 'error');
        }
    }

    if (submitArticleBtn) {
        submitArticleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            submitArticle();
        });
    }

    // =========================================================================
    // 14. INITIAL RENDER & URL PARAMETER HANDLING
    // =========================================================================
    autoResizeHeadline();
    handleExcerptInput();
    updateEditorMetrics();
    updateToolbarButtonStates();
    renderDraftsList();

    // Check if URL has ?draftId=... or ?id=... or ?editId=... or ?articleId=...
    const urlParams = new URLSearchParams(window.location.search);
    const targetArticleId = urlParams.get('draftId') || urlParams.get('id') || urlParams.get('editId') || urlParams.get('articleId');
    if (targetArticleId) {
        editDraftAction(targetArticleId);
    }
});
