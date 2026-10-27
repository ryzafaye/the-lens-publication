import { escapeHTML, getArticleReadingMinutes, getShareCount, getViewCount, getAuthorProfileURL } from "./article-utils.js";

// Compact category/date line shared by every article card.
export function articleMeta(article) {
    return `
        <div class="article-meta">
            <span class="article-category-label">${escapeHTML(article.category)}</span>
            <span class="article-meta-separator" aria-hidden="true">·</span>
            <time>${escapeHTML(article.date)}</time>
        </div>
    `;
}

// Headline styles are shared so all article titles stay consistent site-wide.
export function articleTitle(article, className = "") {
    return `
        <button type="button"
            class="article-title-button ${escapeHTML(className)}"
            data-article-id="${escapeHTML(article.id)}"
            aria-label="Read article: ${escapeHTML(article.title)}">
            ${escapeHTML(article.title)}
        </button>
    `;
}

export function articleByline(article) {
    const author = String(article.author || "The Lens Staff");
    const authorMarkup = article.author
        ? `<a class="author-profile-link" href="${getAuthorProfileURL(author)}" aria-label="View ${escapeHTML(author)}'s author profile">${escapeHTML(author)}</a>`
        : `<strong>${escapeHTML(author)}</strong>`;
    return `
        <p class="article-byline">
            <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
            <span>By ${authorMarkup}</span>
        </p>
    `;
}

// Views are seeded sample data in this static prototype. Copy-link counts persist
// in the current browser; a backend endpoint is needed for a site-wide count.
export function articleStats(article, { includeReadingTime = true } = {}) {
    const views = getViewCount(article.id, Number(article.views || 0)).toLocaleString();
    const shares = getShareCount(article.id);
    const readingMinutes = getArticleReadingMinutes(article);
    const readingTimeMarkup = includeReadingTime ? `<span class="article-read-time" title="Estimated reading time"><i class="fa-regular fa-clock" aria-hidden="true"></i><span>${readingMinutes} min read</span></span>` : "";
    return `
        <div class="article-stats" aria-label="Article engagement and reading time">
            <span class="article-view-count" title="Views">
                <i class="fa-regular fa-eye" aria-hidden="true"></i>
                <span data-view-count="${escapeHTML(article.id)}">${views}</span><span class="stat-label">views</span>
            </span>
            ${readingTimeMarkup}
            <button type="button" class="article-share-button" data-copy-article-id="${escapeHTML(article.id)}"
                aria-label="Copy link to ${escapeHTML(article.title)}; ${shares} copies recorded" title="Copy article link">
                <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
                <span>Share</span>
                <span class="share-count" data-share-count="${escapeHTML(article.id)}">${shares}</span>
            </button>
        </div>
    `;
}

// Display an article image or a colored placeholder.
export function createImage(article, imageClass = "") {
    const title = escapeHTML(article.title);
    const color = escapeHTML(article.color || "#571525");

    if (article.image) {
        return `
            <div class="article-image ${escapeHTML(imageClass)}" style="--image-color: ${color}">
                <img src="${escapeHTML(article.image)}" alt="${title}" loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="image-placeholder" style="display:none"><span>${title}</span></div>
            </div>
        `;
    }

    return `
        <div class="article-image ${escapeHTML(imageClass)}" style="--image-color: ${color}">
            <div class="image-placeholder"><span>${title}</span></div>
        </div>
    `;
}

// Shared list item on Latest and category pages.
export function categoryListItem(article) {
    return `
        <article class="category-list-card reveal-on-scroll" data-article-id="${escapeHTML(article.id)}" style="cursor: pointer;">
            <button type="button" class="category-list-image article-clickable" data-article-id="${escapeHTML(article.id)}"
                aria-label="Read article: ${escapeHTML(article.title)}">
                ${createImage(article, "category-list-thumb")}
            </button>
            <div class="category-list-copy">
                ${articleMeta(article)}
                <h3 class="category-list-title">${articleTitle(article)}</h3>
                <p class="category-list-excerpt">${escapeHTML(article.excerpt)}</p>
                ${articleByline(article)}
                ${articleStats(article)}
            </div>
        </article>
    `;
}
