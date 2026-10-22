/**
 * THE LENS — SUBMIT ARTICLE (SECTION HEAD PORTAL)
 * Clean, Reusable & Modular Implementation
 */

document.addEventListener('DOMContentLoaded', () => {

    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
        window.location.href = 'login.html';
        return;
    }

    const currentSection = localStorage.getItem('sectionHeadSection') || 'News';
    const authorName = localStorage.getItem('userName') || 'Danilo C. Ramos';

    // -------------------------------------------------------------------------
    // 1. DOM ELEMENTS
    // -------------------------------------------------------------------------
    const tabWriteBtn = document.getElementById('tab-write-btn');
    const tabDraftsBtn = document.getElementById('tab-drafts-btn');
    const writeView = document.getElementById('write-view');
    const draftsView = document.getElementById('drafts-view');
    const draftsCountBadge = document.getElementById('drafts-count-badge');
    const draftsStreamContainer = document.getElementById('drafts-stream-container');

    const headlineInput = document.getElementById('article-headline');
    const headlineCharCount = document.getElementById('headline-char-count');
    const categorySelect = document.getElementById('article-category');
    const authorNameDisplay = document.getElementById('author-name-display');
    const excerptInput = document.getElementById('article-excerpt');
    const excerptCharCount = document.getElementById('excerpt-char-count');
    const editorContent = document.getElementById('article-body-editor');

    const wordCountDisplay = document.getElementById('word-count-display');
    const readTimeDisplay = document.getElementById('read-time-display');
    const autoSaveStatus = document.getElementById('autosave-status');

    const btnSaveDraft = document.getElementById('btn-save-draft');
    const btnSubmit = document.getElementById('btn-submit-manuscript');
    const toastContainer = document.getElementById('toast-container');

    let activeEditingDraftId = null;

    // Set author name display and default section
    if (authorNameDisplay) authorNameDisplay.textContent = authorName;
    if (categorySelect && currentSection) {
        for (let i = 0; i < categorySelect.options.length; i++) {
            if (categorySelect.options[i].value.toLowerCase().includes(currentSection.toLowerCase())) {
                categorySelect.selectedIndex = i;
                break;
            }
        }
    }

    // -------------------------------------------------------------------------
    // 2. STORAGE KEYS & HELPERS
    // -------------------------------------------------------------------------
    const DRAFTS_KEY = 'sectionHeadArticleDrafts';
    const MY_ARTICLES_KEY = 'sectionHeadMyArticles_v1';

    function getDrafts() {
        try {
            const raw = localStorage.getItem(DRAFTS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {}
        return [];
    }

    function saveDrafts(list) {
        try {
            localStorage.setItem(DRAFTS_KEY, JSON.stringify(list));
        } catch (e) {}
    }

    let draftsList = getDrafts();

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
        toast.className = `toast-message ${type}`;
        toast.innerHTML = `<span class="toast-bullet-dot"></span><span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-dismissing');
            setTimeout(() => toast.remove(), 260);
        }, 3200);
    }

    // -------------------------------------------------------------------------
    // 3. EDIT METRICS & AUTO-RESIZE
    // -------------------------------------------------------------------------
    function autoResizeHeadline() {
        if (!headlineInput) return;
        headlineInput.style.height = 'auto';
        headlineInput.style.height = headlineInput.scrollHeight + 'px';
        if (headlineCharCount) {
            headlineCharCount.textContent = `${headlineInput.value.length} / 255`;
        }
    }

    if (headlineInput) {
        headlineInput.addEventListener('input', autoResizeHeadline);
    }

    if (excerptInput) {
        excerptInput.addEventListener('input', () => {
            if (excerptCharCount) {
                excerptCharCount.textContent = `${excerptInput.value.length} / 255`;
            }
        });
    }

    function updateEditorMetrics() {
        if (!editorContent) return;
        const text = editorContent.innerText.trim();
        const words = text ? text.split(/\s+/).length : 0;
        const minutes = Math.max(1, Math.ceil(words / 200));

        if (wordCountDisplay) wordCountDisplay.textContent = `${words} words`;
        if (readTimeDisplay) readTimeDisplay.textContent = `${minutes} min read`;
    }

    if (editorContent) {
        editorContent.addEventListener('input', updateEditorMetrics);
    }

    // -------------------------------------------------------------------------
    // 4. TAB CONTROLLER
    // -------------------------------------------------------------------------
    function switchTab(tab) {
        if (tab === 'write') {
            tabWriteBtn.classList.add('active');
            tabWriteBtn.setAttribute('aria-selected', 'true');
            tabDraftsBtn.classList.remove('active');
            tabDraftsBtn.setAttribute('aria-selected', 'false');

            writeView.classList.remove('hidden');
            draftsView.classList.add('hidden');
        } else {
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

    // -------------------------------------------------------------------------
    // 5. DRAFTS RENDERING
    // -------------------------------------------------------------------------
    function updateDraftsBadge() {
        if (draftsCountBadge) {
            draftsCountBadge.textContent = draftsList.length;
        }
    }

    function renderDraftsList() {
        if (!draftsStreamContainer) return;
        updateDraftsBadge();

        if (draftsList.length === 0) {
            draftsStreamContainer.innerHTML = `
                <div class="empty-drafts-notice">
                    <i class="fa-regular fa-folder-open"></i>
                    <span>No saved drafts found. When you save a draft while writing, it will appear here.</span>
                </div>
            `;
            return;
        }

        draftsStreamContainer.innerHTML = draftsList.map(draft => `
            <div class="draft-item-card" data-id="${draft.id}">
                <div class="draft-card-header">
                    <span class="draft-category-badge">${escapeHTML(draft.category || currentSection)}</span>
                    <span class="draft-save-time">${escapeHTML(draft.updatedAt || 'Recently')}</span>
                </div>
                <h3 class="draft-item-title">${escapeHTML(draft.headline || 'Untitled Draft')}</h3>
                ${draft.excerpt ? `<p class="draft-item-excerpt">${escapeHTML(draft.excerpt)}</p>` : ''}
                <div class="draft-card-actions">
                    <button type="button" class="btn-action-edit" onclick="loadDraft('${draft.id}')">
                        <i class="fa-solid fa-file-pen"></i>
                        <span>Load Draft</span>
                    </button>
                    <button type="button" class="btn-action-delete" onclick="deleteDraft('${draft.id}')">
                        <i class="fa-regular fa-trash-can"></i>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    window.loadDraft = function(id) {
        editDraftAction(id);
    };

    window.deleteDraft = function(id) {
        draftsList = draftsList.filter(d => d.id !== id);
        saveDrafts(draftsList);
        updateDraftsBadge();
        renderDraftsList();
        showToast('Draft removed.', 'info');
    };

    // -------------------------------------------------------------------------
    // 6. ARTICLE LOOKUP & PRE-LOADING
    // -------------------------------------------------------------------------
    function findArticleOrDraft(id) {
        if (!id) return null;
        const inDrafts = draftsList.find(d => String(d.id) === String(id));
        if (inDrafts) {
            return {
                id: inDrafts.id,
                headline: inDrafts.headline,
                category: inDrafts.category,
                excerpt: inDrafts.excerpt,
                content: inDrafts.content
            };
        }

        try {
            const rawMy = localStorage.getItem(MY_ARTICLES_KEY);
            if (rawMy) {
                const myArts = JSON.parse(rawMy);
                if (Array.isArray(myArts)) {
                    const match = myArts.find(a => String(a.id) === String(id));
                    if (match) {
                        return {
                            id: match.id,
                            headline: match.title,
                            category: match.category,
                            excerpt: match.excerpt,
                            content: match.content
                        };
                    }
                }
            }
        } catch (e) {}

        return null;
    }

    function editDraftAction(id) {
        const item = findArticleOrDraft(id);
        if (!item) return;

        switchTab('write');

        if (headlineInput) {
            headlineInput.value = item.headline || '';
            autoResizeHeadline();
        }

        if (categorySelect && item.category) {
            for (let i = 0; i < categorySelect.options.length; i++) {
                if (categorySelect.options[i].value.toLowerCase().includes(item.category.toLowerCase())) {
                    categorySelect.selectedIndex = i;
                    break;
                }
            }
        }

        if (excerptInput) {
            excerptInput.value = item.excerpt || '';
            if (excerptCharCount) excerptCharCount.textContent = `${item.excerpt ? item.excerpt.length : 0} / 255`;
        }

        if (editorContent) {
            let contentHtml = item.content || item.excerpt || '';
            if (!contentHtml.includes('<p>') && !contentHtml.includes('<div>')) {
                const paras = contentHtml.split(/\n\n+/).filter(p => p.trim());
                contentHtml = paras.map(p => `<div>${escapeHTML(p.trim())}</div>`).join('<div><br></div>');
            }
            editorContent.innerHTML = contentHtml || '<div>Start typing your manuscript here...</div>';
            updateEditorMetrics();
        }

        activeEditingDraftId = item.id;
        if (autoSaveStatus) {
            autoSaveStatus.textContent = 'Editing manuscript';
            autoSaveStatus.style.color = '#e27219';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('Article loaded into writing canvas.', 'success');
    }

    // -------------------------------------------------------------------------
    // 7. SAVE DRAFT & SUBMIT ACTIONS
    // -------------------------------------------------------------------------
    if (btnSaveDraft) {
        btnSaveDraft.addEventListener('click', () => {
            const headline = headlineInput ? headlineInput.value.trim() : '';
            const category = categorySelect ? categorySelect.value : currentSection;
            const excerpt = excerptInput ? excerptInput.value.trim() : '';
            const content = editorContent ? editorContent.innerText.trim() : '';

            if (!headline && !content) {
                showToast('Please enter at least a headline or some content before saving draft.', 'error');
                return;
            }

            const draftId = activeEditingDraftId || `draft-${Date.now()}`;
            const draftObj = {
                id: draftId,
                headline: headline || 'Untitled Draft',
                category: category,
                excerpt: excerpt,
                content: content,
                updatedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
            };

            const existingIdx = draftsList.findIndex(d => d.id === draftId);
            if (existingIdx !== -1) {
                draftsList[existingIdx] = draftObj;
            } else {
                draftsList.unshift(draftObj);
            }
            saveDrafts(draftsList);
            updateDraftsBadge();

            // Also synchronize with sectionHeadMyArticles_v1
            try {
                const rawMy = localStorage.getItem(MY_ARTICLES_KEY);
                if (rawMy) {
                    let myArts = JSON.parse(rawMy);
                    if (Array.isArray(myArts)) {
                        const mIdx = myArts.findIndex(a => String(a.id) === String(draftId));
                        if (mIdx !== -1) {
                            myArts[mIdx].title = headline || 'Untitled Draft';
                            myArts[mIdx].category = category;
                            myArts[mIdx].excerpt = excerpt;
                            myArts[mIdx].content = content;
                            localStorage.setItem(MY_ARTICLES_KEY, JSON.stringify(myArts));
                        }
                    }
                }
            } catch (e) {}

            activeEditingDraftId = draftId;
            showToast('Draft manuscript saved successfully.', 'success');
        });
    }

    if (btnSubmit) {
        btnSubmit.addEventListener('click', () => {
            const headline = headlineInput ? headlineInput.value.trim() : '';
            const category = categorySelect ? categorySelect.value : currentSection;
            const excerpt = excerptInput ? excerptInput.value.trim() : '';
            const content = editorContent ? editorContent.innerText.trim() : '';

            if (!headline) {
                showToast('Please provide an article headline before submitting.', 'error');
                if (headlineInput) headlineInput.focus();
                return;
            }

            if (!content || content.length < 20) {
                showToast('Please compose your manuscript story body before submitting.', 'error');
                if (editorContent) editorContent.focus();
                return;
            }

            const newArticle = {
                id: activeEditingDraftId || `sec-art-${Date.now()}`,
                title: headline,
                category: category,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                rawDate: new Date().toISOString().split('T')[0],
                status: 'Pending Review',
                views: 0,
                shares: 0,
                author: authorName,
                excerpt: excerpt,
                content: content
            };

            // Save to sectionHeadMyArticles_v1
            try {
                let myArts = [];
                const rawMy = localStorage.getItem(MY_ARTICLES_KEY);
                if (rawMy) myArts = JSON.parse(rawMy);
                if (!Array.isArray(myArts)) myArts = [];

                const mIdx = myArts.findIndex(a => String(a.id) === String(newArticle.id));
                if (mIdx !== -1) {
                    myArts[mIdx] = newArticle;
                } else {
                    myArts.unshift(newArticle);
                }
                localStorage.setItem(MY_ARTICLES_KEY, JSON.stringify(myArts));
            } catch (e) {}

            // Remove from drafts if it was a draft
            if (activeEditingDraftId) {
                draftsList = draftsList.filter(d => d.id !== activeEditingDraftId);
                saveDrafts(draftsList);
                updateDraftsBadge();
            }

            showToast('Manuscript submitted for review!', 'success');

            setTimeout(() => {
                window.location.href = 'section-head-manage-my-articles.html';
            }, 1200);
        });
    }

    // -------------------------------------------------------------------------
    // 8. INITIAL HYDRATION & URL QUERY PARAMETERS
    // -------------------------------------------------------------------------
    updateDraftsBadge();
    autoResizeHeadline();
    updateEditorMetrics();

    const urlParams = new URLSearchParams(window.location.search);
    const targetDraftId = urlParams.get('draftId') || urlParams.get('id') || urlParams.get('editId') || urlParams.get('articleId');
    if (targetDraftId) {
        editDraftAction(targetDraftId);
    }
});

