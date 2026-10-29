/**
 * The Lens — Executive Dashboard Script (Laravel Refactored)
 * Handles UI Interactivity, Modals, and Toasts. Data logic is moved to Backend.
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. HELPER UTILITIES
    // =========================================================================
    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function decodeHtmlEntities(str) {
        if (!str) return '';
        let decoded = String(str);
        let passes = 5;
        while (passes > 0 && /&amp;(?:lt|gt|quot|#39|amp);|&(?:lt|gt|quot);/i.test(decoded)) {
            const txt = document.createElement('textarea');
            txt.innerHTML = decoded;
            if (txt.value === decoded) break;
            decoded = txt.value;
            passes--;
        }
        return decoded;
    }

    function formatCleanArticleContent(rawContent) {
        if (!rawContent) return '<p style="color: #98a2b3; font-style: italic;">No content available.</p>';
        
        let cleaned = decodeHtmlEntities(rawContent);
        // Strip any residual literal &lt;span...&gt; or <span...>
        cleaned = cleaned
            .replace(/&lt;\/?(?:span|font|o:p)[^&>]*&gt;/gi, '')
            .replace(/<\/?(?:span|font|o:p)[^>]*>/gi, '')
            .replace(/\s*(?:style|class|id|dir|lang)=["'][^"']*["']/gi, '')
            .replace(/&lt;[^&>]+&gt;/gi, '');

        const stripped = cleaned.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n').trim();
        const paragraphs = stripped.split('\n').map(p => p.trim()).filter(p => p.length > 0);
        if (paragraphs.length === 0) return '<p style="color: #98a2b3; font-style: italic;">No content available.</p>';
        return paragraphs.map(p => `<p class="viewer-paragraph">${escapeHTML(p)}</p>`).join('');
    }

    const toastContainer = document.getElementById('toast-container');
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
        }, 3200);
    }

    // =========================================================================
    // 2. MODALS DOM REFERENCES & LOGIC
    // =========================================================================
    const viewerModal = document.getElementById('article-viewer-modal');
    const closeViewerBtn = document.getElementById('close-viewer-btn');

    function openArticleViewer(article) {
        if (!article || !viewerModal) return;

        document.getElementById('viewer-title').textContent = article.title;
        document.getElementById('viewer-category').textContent = article.category;
        document.getElementById('viewer-date').textContent = article.date;
        document.getElementById('viewer-author').textContent = article.author;
        document.getElementById('viewer-content').innerHTML = formatCleanArticleContent(article.content || article.excerpt);

        viewerModal.classList.remove('hidden');
    }

    function closeViewerModal() {
        if (!viewerModal) return;
        viewerModal.classList.add('hidden');
    }

    if (closeViewerBtn) closeViewerBtn.addEventListener('click', closeViewerModal);
    if (viewerModal) {
        viewerModal.addEventListener('click', (e) => {
            if (e.target === viewerModal) closeViewerModal();
        });
    }

    // =========================================================================
    // 3. EVENT DELEGATION FOR MODALS
    // =========================================================================
    document.addEventListener('click', (e) => {
        // Trigger Viewer Modal
        const viewTrigger = e.target.closest('[data-action="view"]');
        if (viewTrigger && viewTrigger.dataset.article) {
            e.preventDefault();
            e.stopPropagation();
            try {
                const articleData = JSON.parse(viewTrigger.dataset.article);
                openArticleViewer(articleData);
            } catch (err) {
                console.error("Error parsing article data", err);
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeViewerModal();
    });

});