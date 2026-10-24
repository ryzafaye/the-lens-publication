/**
 * ============================================================================
 * THE LENS — SUBMIT ARTICLE LOGIC (EXECUTIVE PORTAL)
 * Ultra-minimalist, distraction-free writing interface (Notion / Medium Style)
 * 
 * Features:
 * 1. Tabbed Navigation ("Write Article" & "Drafts")
 * 2. Big Box Headline Input (Auto-grow, 255 Character Limit)
 * 3. Section / Category Dropdown (News, Opinions, Features, Science and Technology, Literature)
 * 4. Excerpt (Short Summary) Teaser Field with Character Counter
 * 5. Author Byline with Pen-Nib Icon ("By Author Name")
 * 6. Notion-Style Rich Text Editor with Formatting Toolbar (execCommand + selection state)
 * 7. Live Writing Metrics (Words, Characters, Estimated Reading Time)
 * 8. Responsive Horizontal List Card Layout for Drafts (Exact Review Articles style)
 * 9. "Save Draft" clears form & moves to Drafts tab with Toast notification
 * 10. "Edit Draft" loads draft into editor & switches to Write tab
 * 11. "Delete Draft" removes draft with smooth fade-out
 * 12. Article Submission integrates with executive review queue in localStorage
 * 13. Default Executive Toast Notification with Green Bullet Indicator
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
    const readingTimeEl = document.getElementById('reading-time');
    const autoSaveStatusEl = document.getElementById('autosave-status');

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
    // 2. AUTHOR BYLINE & ROLE INITIALIZATION
    // =========================================================================
    const currentUserRole = localStorage.getItem('userRole') || 'President';
    const currentUserName = localStorage.getItem('userName') || 'Juan Dela Cruz';
    
    if (authorNameDisplay) {
        authorNameDisplay.textContent = currentUserName;
    }


    // =========================================================================
    // 3. TOAST NOTIFICATION HELPER (Default Green Bullet Dot Style)
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
    const DRAFTS_STORAGE_KEY = 'executiveArticleDrafts';

    const defaultDrafts = [
        {
            id: 'draft-01',
            title: "Investigation: The hidden costs of mandatory university uniforms",
            category: "Features",
            excerpt: "An inquiry into supplier monopolies, collegiate uniform fees, and student budget impact across multiple departments.",
            date: "Oct 18, 2026",
            rawDate: "2026-10-18",
            content: `<div>An inquiry into supplier monopolies, collegiate uniform fees, and student budget impact across campuses.</div><div><br></div><div>Students from multiple departments have voiced concerns over recurring price hikes without transparent vendor biddings.</div>`
        },
        {
            id: 'draft-02',
            title: "Digital divide persists as student WiFi coverage drops in outer colleges",
            category: "Science and Technology",
            excerpt: "Bandwidth testing across student dormitories and satellite laboratories reveals stark regional disparities in high-speed access.",
            date: "Oct 17, 2026",
            rawDate: "2026-10-17",
            content: `<div>Bandwidth testing across student dormitories and satellite laboratories reveals stark regional disparities in high-speed internet access.</div>`
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
            console.warn('Could not read executiveArticleDrafts', e);
        }
        return JSON.parse(JSON.stringify(defaultDrafts));
    }

    function saveDraftsToStorage(drafts) {
        try {
            localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
        } catch (e) {
            console.warn('Could not save executiveArticleDrafts', e);
        }
    }

    let draftsList = getStoredDrafts();

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

        editorContent.addEventListener('paste', () => {
            setTimeout(() => {
                updateEditorMetrics();
            }, 50);
        });
    }

    document.addEventListener('selectionchange', () => {
        if (document.activeElement === editorContent) {
            updateToolbarButtonStates();
        }
    });

    // =========================================================================
    // 10. LIVE WRITING METRICS (Words, Characters, Estimated Reading Time)
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
            id: activeEditingDraftId || `draft-${Date.now()}`,
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

            // Sync with executiveMyArticles_v1 if it originated there
            try {
                const rawMy = localStorage.getItem('executiveMyArticles_v1');
                if (rawMy) {
                    let myArts = JSON.parse(rawMy);
                    if (Array.isArray(myArts)) {
                        const mIndex = myArts.findIndex(a => String(a.id) === String(activeEditingDraftId));
                        if (mIndex !== -1) {
                            myArts[mIndex].title = draftEntry.title;
                            myArts[mIndex].category = draftEntry.category;
                            myArts[mIndex].excerpt = draftEntry.excerpt;
                            myArts[mIndex].content = draftEntry.content;
                            localStorage.setItem('executiveMyArticles_v1', JSON.stringify(myArts));
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

        // Clear the form fields per Task 4
        clearFormFields();

        // Also update the rendered list in Drafts tab
        renderDraftsList();
    }

    const DEFAULT_EXECUTIVE_SEED = [
        {
            id: 'exec-art-01',
            title: 'The Future of University Press Freedom: A Presidential Address',
            category: 'Opinion',
            excerpt: 'Why defending independent campus journalism and transparent administration disclosures remains essential in an era of digital misinformation.',
            content: `Student publications hold a unique mandate within democratic universities: to reflect the unvarnished realities of the student body without fear of administrative reprisal.\n\nOver the past academic cycle, our editorial staff has covered pivotal campus disputes, from facilities budget reallocations to faculty overload directives. Throughout each inquiry, our guiding philosophy has remained unwavering—freedom of expression is not an administrative privilege to be dispensed, but an institutional right won through decades of student advocacy.\n\nAs we inaugurate our new digital publishing systems, we reaffirm our commitment to ethical rigor, fact-checked reporting, and unwavering support for every campus beat reporter.`
        },
        {
            id: 'exec-art-02',
            title: 'Modernizing Collegiate Newsrooms: The Lens Strategic Roadmap',
            category: 'Features',
            excerpt: 'A comprehensive operational overview of our publication’s transition to digital-first investigative cycles and archival digitization.',
            content: `In an era where news is consumed within seconds on mobile feeds, collegiate journalism must evolve without sacrificing depth. The Lens has spearheaded a systematic workflow modernization program designed to empower student writers and editors.\n\nBy unifying our editorial desk with modern draft revision queues and public transparency folios, we ensure that every story published meets international journalistic standards. Our upcoming initiatives include podcast audio digests and multimedia documentary fellowships for undergraduate contributors.`
        },
        {
            id: 'exec-art-03',
            title: 'Midyear Operational Review & Editorial Guidelines 2025',
            category: 'Opinion',
            excerpt: 'A retrospective evaluation of print distribution quotas and digital engagement strategies across regional university branches.',
            content: `Looking back at the academic calendar of 2024–2025, our editorial staff conducted a comprehensive survey across the university student body regarding print vs digital readership preferences.\n\nResults demonstrated a notable 40% surge in web engagement via smartphone devices, prompting our pivot towards mobile-first newsroom publishing while maintaining high-quality archival print folios for university history.`
        },
        {
            id: 'exec-art-04',
            title: 'State of the Student Body: University Welfare Analysis 2026',
            category: 'News',
            excerpt: 'An evidence-based survey analyzing commuter transit subsidies, dormitory occupancy rates, and student meal allowance purchasing power.',
            content: `Escalating living costs in the surrounding university district have placed renewed strain on undergraduate budgets. Surveying more than 1,200 dormitory residents and daily commuters, this investigation reveals key vulnerabilities in campus support systems.\n\nOver 68% of off-campus commuters report spending more than four hours daily in transit, while campus food concessionaires have raised average meal prices by 22% over the last twelve months. The editorial board is preparing recommendations for university welfare committee discussions next month.`
        },
        {
            id: 'exec-art-05',
            title: 'Ethical Standards for Student Investigative Reporting in Digital Spaces',
            category: 'Opinion',
            excerpt: 'Addressing attribution requirements, source confidentiality protocols, and cybersecurity hygiene for collegiate journalists.',
            content: `When reporting on sensitive institutional matters, student journalists carry ethical responsibilities identical to those of seasoned professionals. Digital communication channels introduce both unprecedented research access and significant security vulnerabilities.\n\nEvery student journalist must adhere to rigorous source corroboration and encryption practices when handling whistleblower leaks or confidential financial records.`
        }
    ];

    function findArticleOrDraft(id) {
        if (!id) return null;

        // 1. Check in draftsList (from executiveArticleDrafts)
        let found = draftsList.find(d => String(d.id) === String(id));
        if (found) return found;

        // 2. Check in executiveMyArticles_v1 (personal articles for executive)
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

        // 3. Check in default seed
        found = DEFAULT_EXECUTIVE_SEED.find(d => String(d.id) === String(id));
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

        const newSubmissionId = `sub-${Date.now()}`;
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
            const storedQueue = localStorage.getItem('executivePendingReviewQueue');
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

            if (pendingQueue.length === 0) {
                pendingQueue = [
                    {
                        id: 'rev-01',
                        title: "Student council financial audit reveals ₱320,000 unallocated surplus",
                        category: "News",
                        date: "Oct 18, 2026",
                        rawDate: "2026-10-18",
                        author: "Mara Villanueva",
                        status: "pending",
                        remarks: "",
                        content: "An independent financial audit of the Central Student Council expenditures reveals unallocated surplus..."
                    },
                    {
                        id: 'rev-02',
                        title: "Why the enrollment portal keeps timing out: A technical post-mortem",
                        category: "Science and Technology",
                        date: "Oct 18, 2026",
                        rawDate: "2026-10-18",
                        author: "Noah Reyes",
                        status: "pending",
                        remarks: "",
                        content: "Every enlistment cycle, tens of thousands of university students endure connection timeouts..."
                    },
                    {
                        id: 'rev-03',
                        title: "Faculty union files formal grievance over proposed 24-unit overload directive",
                        category: "News",
                        date: "Oct 17, 2026",
                        rawDate: "2026-10-17",
                        author: "Rafael Ramos",
                        status: "pending",
                        remarks: "",
                        content: "The University Faculty Association has formally submitted a dispute grievance..."
                    }
                ];
            }

            pendingQueue.unshift(newSubmission);
            localStorage.setItem('executivePendingReviewQueue', JSON.stringify(pendingQueue));

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

            // If we were editing an existing draft or personal article, sync it!
            if (activeEditingDraftId) {
                try {
                    const rawMy = localStorage.getItem('executiveMyArticles_v1');
                    if (rawMy) {
                        let myArts = JSON.parse(rawMy);
                        if (Array.isArray(myArts)) {
                            const mIndex = myArts.findIndex(a => String(a.id) === String(activeEditingDraftId));
                            if (mIndex !== -1) {
                                myArts[mIndex].title = headline;
                                myArts[mIndex].category = category;
                                myArts[mIndex].excerpt = excerpt;
                                myArts[mIndex].content = editorContent.innerText.trim();
                                myArts[mIndex].status = 'Pending Review';
                                myArts[mIndex].remarks = '';
                                myArts[mIndex].date = currentDate;
                                localStorage.setItem('executiveMyArticles_v1', JSON.stringify(myArts));
                            }
                        }
                    }
                } catch (e) {}

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
                window.location.href = 'executive-manage-my-articles.html';
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

    // Check if URL has ?draftId=... or ?id=... or ?editId=...
    const urlParams = new URLSearchParams(window.location.search);
    const targetArticleId = urlParams.get('draftId') || urlParams.get('id') || urlParams.get('editId') || urlParams.get('articleId');
    if (targetArticleId) {
        editDraftAction(targetArticleId);
    }
});
