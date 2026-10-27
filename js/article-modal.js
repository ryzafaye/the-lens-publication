import { createImage, articleStats } from "./article-templates.js";
import { escapeHTML, getArticle, getArticleURL, getArticleReadingMinutes, getNewestArticles, getPublicArticles, getShareCount, recordArticleView, recordShareCopy, getAuthorProfileURL } from "./article-utils.js";

let pageScrollLockState = null;

function lockPageScroll() {
    if (pageScrollLockState) return;
    pageScrollLockState = {
        htmlOverflow: document.documentElement.style.overflow,
        bodyOverflow: document.body.style.overflow
    };
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("article-reading-active");
}

function unlockPageScroll() {
    if (!pageScrollLockState) return;
    document.documentElement.style.overflow = pageScrollLockState.htmlOverflow;
    document.body.style.overflow = pageScrollLockState.bodyOverflow;
    document.documentElement.classList.remove("article-reading-active");
    pageScrollLockState = null;
}

function getArticleModal() {
    let modal = document.getElementById("article-modal");
    if (!modal) {
        modal = document.createElement("dialog");
        modal.id = "article-modal";
        modal.className = "article-modal";
        document.body.appendChild(modal);
    }
    if (!modal.querySelector(".modal-scroll-container") || !modal.querySelector(".modal-topbar") || !modal.querySelector("#article-details")) {
        modal.innerHTML = `
            <div class="modal-scroll-container" tabindex="0" aria-label="Article reader">
                <div class="modal-topbar">
                    <span class="modal-topbar-brand"><i class="fa-solid fa-newspaper" aria-hidden="true"></i> The Lens</span>
                    <button type="button" id="close-article" class="modal-topbar-close" aria-label="Close article"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
                </div>
                <div id="article-details" class="modal-reader"></div>
            </div>
        `;
    }
    if (modal.dataset.cancelBound !== "true") {
        modal.dataset.cancelBound = "true";
        modal.addEventListener("cancel", event => {
            event.preventDefault();
            closeArticle();
        });
        modal.addEventListener("close", unlockPageScroll);
    }
    return modal;
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

function renderArticleContentHTML(raw) {
    if (!raw) return '<p>No content available.</p>';
    let decoded = decodeCorruptedHtmlEntities(raw);

    // Aggressively remove any span tags and style attributes
    decoded = decoded
        .replace(/&lt;\/?span[^&>]*&gt;/gi, '')
        .replace(/<\/?span[^>]*>/gi, '')
        .replace(/\s*style="[^"]*"/gi, '')
        .replace(/\s*style='[^']*'/gi, '')
        .replace(/&lt;[^&>]+&gt;/gi, '');

    const hasHtmlTags = /<\/?(?:div|p|b|i|u|strong|em|h[1-6]|ul|ol|li|blockquote|br|a)[^>]*>/i.test(decoded);
    if (hasHtmlTags) {
        let clean = decoded
            .replace(/<\/?(?:script|iframe|object|embed|style|span|font)[^>]*>/gi, '')
            .replace(/<div><br\s*\/?><\/div>/gi, '</p><p>')
            .replace(/<\/?div[^>]*>/gi, '</p><p>')
            .replace(/<\/p>\s*<p>/gi, '</p><p>');
        if (!clean.startsWith('<p>') && !clean.startsWith('<h') && !clean.startsWith('<blockquote')) {
            clean = `<p>${clean}</p>`;
        }
        return clean;
    }
    return decoded
        .split(/\n\s*\n/)
        .map(paragraph => `<p>${escapeHTML(paragraph.trim()).replace(/\n/g, '<br>')}</p>`)
        .join('');
}

function openArticle(articleId) {
    const article = getArticle(articleId);
    if (!article) return;
    recordArticleView(article.id, Number(article.views || 0));

    const modal = getArticleModal();
    const details = modal.querySelector("#article-details");
    if (!details) return;

    const paragraphs = renderArticleContentHTML(article.content || article.excerpt || "");
    const readingTime = getArticleReadingMinutes(article);
    const relatedArticles = getRelatedArticles(article, 3);

    details.innerHTML = `
      <div class="modal-reading-content">
        <div class="modal-category-row">
            <span class="modal-category"><i class="fa-solid fa-layer-group" aria-hidden="true"></i> ${escapeHTML(article.category || "The Lens")}</span>
            <span class="modal-reading-time"><i class="fa-regular fa-clock" aria-hidden="true"></i> ${readingTime} min read</span>
        </div>
        <h1 class="modal-title">${escapeHTML(article.title)}</h1>
        <div class="modal-byline">
            <span><i class="fa-solid fa-pen-nib" aria-hidden="true"></i> By ${article.author ? `<a class="author-profile-link" href="${getAuthorProfileURL(article.author)}">${escapeHTML(article.author)}</a>` : `<strong>The Lens Staff</strong>`}</span>
            <span>Published ${escapeHTML(article.date)}</span>
        </div>
        ${article.excerpt ? `<p class="modal-lead-excerpt">${escapeHTML(article.excerpt)}</p>` : ''}
        <figure class="modal-figure">
            ${createImage(article, "modal-image")}
            <figcaption class="modal-caption"><i class="fa-solid fa-camera" aria-hidden="true"></i> ${escapeHTML(article.title)} <span>The Lens / Cover Media</span></figcaption>
        </figure>
        <div class="modal-body">${paragraphs}</div>
        <div class="modal-engagement-row">${articleStats(article, { includeReadingTime: false })}</div>
        <section class="continue-reading" aria-labelledby="continue-reading-title">
            <div class="continue-reading-heading">
                <p class="continue-reading-eyebrow">MORE FROM THE LENS</p>
                <h2 id="continue-reading-title">Continue reading</h2>
                <p>Explore more campus stories selected for you.</p>
            </div>
            <div class="continue-reading-grid">
                ${relatedArticles.map(renderRelatedArticle).join("")}
            </div>
        </section>
      </div>
    `;

    if (!modal.open) modal.showModal();
    lockPageScroll();
    const scrollContainer = modal.querySelector(".modal-scroll-container");
    if (scrollContainer) scrollContainer.scrollTop = 0;
    history.replaceState(null, "", `#article-${encodeURIComponent(article.id)}`);
}

function getRelatedArticles(article, limit = 3) {
    const remaining = getPublicArticles().filter(item => String(item.id) !== String(article.id));
    const newest = getNewestArticles(remaining);
    newest.sort((a, b) => {
        const sameCategoryA = a.category === article.category ? 1 : 0;
        const sameCategoryB = b.category === article.category ? 1 : 0;
        if (sameCategoryA !== sameCategoryB) return sameCategoryB - sameCategoryA;
        return 0;
    });
    return newest.slice(0, limit);
}

function renderRelatedArticle(article) {
    const minutes = getArticleReadingMinutes(article);
    return `
        <article class="continue-story-card" data-article-id="${escapeHTML(article.id)}" style="cursor: pointer;">
            <button type="button" class="continue-story-image article-clickable" data-article-id="${escapeHTML(article.id)}" aria-label="Read article: ${escapeHTML(article.title)}">
                ${createImage(article, "continue-story-thumb")}
            </button>
            <div class="continue-story-copy">
                <p class="continue-story-category">${escapeHTML(article.category || "The Lens")}</p>
                <h3><button type="button" class="article-title-button continue-story-title" data-article-id="${escapeHTML(article.id)}">${escapeHTML(article.title)}</button></h3>
                <p class="continue-story-excerpt">${escapeHTML(article.excerpt || "Read more from The Lens.")}</p>
                <p class="continue-story-byline">By ${article.author ? `<a class="author-profile-link" href="${getAuthorProfileURL(article.author)}">${escapeHTML(article.author)}</a>` : `<strong>The Lens Staff</strong>`}</p>
                <p class="continue-story-meta"><span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${minutes} min read</span><span>${escapeHTML(article.date || "")}</span></p>
            </div>
        </article>
    `;
}

function closeArticle() {
    const modal = document.getElementById("article-modal");
    if (modal?.open) modal.close();
    unlockPageScroll();
    history.replaceState(null, "", location.pathname + location.search);
}

async function copyArticleLink(button, articleId) {
    const article = getArticle(articleId);
    if (!article) return;
    const url = getArticleURL(articleId);
    const originalHTML = button.innerHTML;
    try {
        await navigator.clipboard.writeText(url);
        const copies = recordShareCopy(articleId);
        button.innerHTML = `<i class="fa-solid fa-check" aria-hidden="true"></i><span>Link copied</span><span class="share-count" data-share-count="${escapeHTML(articleId)}">${copies}</span>`;
        window.setTimeout(() => {
            if (!button.isConnected) return;
            button.innerHTML = originalHTML;
            const countNode = button.querySelector("[data-share-count]");
            if (countNode) countNode.textContent = getShareCount(articleId).toLocaleString();
        }, 1800);
    } catch {
        const result = window.prompt("Copy this article link:", url);
        if (result !== null) {
            const copies = recordShareCopy(articleId);
            button.innerHTML = `<i class="fa-solid fa-check" aria-hidden="true"></i><span>Link copied</span><span class="share-count" data-share-count="${escapeHTML(articleId)}">${copies}</span>`;
            window.setTimeout(() => {
                if (!button.isConnected) return;
                button.innerHTML = originalHTML;
                const countNode = button.querySelector("[data-share-count]");
                if (countNode) countNode.textContent = getShareCount(articleId).toLocaleString();
            }, 1800);
        }
    }
}

// Article buttons and cards are rendered from data, so delegation supports every page.
document.addEventListener("click", event => {
    const copyButton = event.target.closest("[data-copy-article-id]");
    if (copyButton) {
        event.preventDefault();
        event.stopPropagation();
        copyArticleLink(copyButton, copyButton.dataset.copyArticleId);
        return;
    }

    // Do not intercept author profile links so readers can view author pages
    if (event.target.closest(".author-profile-link") || event.target.closest("a[href*='author.html']")) {
        return;
    }

    const closeBtn = event.target.closest("#close-article") || event.target.closest(".close-modal") || event.target.closest(".close-article") || event.target.closest(".modal-topbar-close");
    if (closeBtn) {
        closeArticle();
        return;
    }

    const trigger = event.target.closest("[data-article-id]");
    if (trigger) {
        const id = trigger.dataset.articleId;
        if (id && id !== "NaN" && id !== "undefined") {
            openArticle(id);
        }
    }
});

document.addEventListener("keydown", event => {
    const trigger = event.target.closest('[role="button"][data-article-id]');
    if (trigger && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        const id = trigger.dataset.articleId;
        if (id && id !== "NaN" && id !== "undefined") {
            openArticle(id);
        }
    }
});

// Do not close the full-screen dialog by clicking its surface. The reader uses a
// dedicated scroll container; readers close the article with the sticky close button
// or Escape so interacting with the native scrollbar never dismisses the article.

function openArticleFromHash() {
    const match = window.location.hash.match(/^#article-(.+)$/);
    if (match && match[1]) openArticle(decodeURIComponent(match[1]));
}
window.addEventListener("hashchange", openArticleFromHash);
if (window.location.hash) window.setTimeout(openArticleFromHash, 0);
