import { articles } from "./articles.js";
import { escapeHTML, getArticleReadingMinutes, getViewCount } from "./article-utils.js";
import { articleMeta, articleTitle, createImage } from "./article-templates.js";

const roleByCategory = Object.freeze({
    "News": "News Contributor",
    "Features": "Features Writer",
    "Opinion": "Opinion Columnist",
    "Science and Technology": "Science & Technology Contributor",
    "Literature": "Literary Contributor"
});

function getRoleForAuthor(authorArticles) {
    const counts = new Map();
    authorArticles.forEach(article => counts.set(article.category, (counts.get(article.category) || 0) + 1));
    const primaryCategory = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    return roleByCategory[primaryCategory] || "Contributing Writer";
}

function renderAuthorArticle(article) {
    return `
        <article class="author-article-card">
            <button class="author-article-image article-clickable" type="button" data-article-id="${Number(article.id)}" aria-label="Read article: ${escapeHTML(article.title)}">
                ${createImage(article, "author-card-image")}
            </button>
            <div class="author-article-copy">
                ${articleMeta(article)}
                <h2>${articleTitle(article, "author-article-title")}</h2>
                <p class="author-article-excerpt">${escapeHTML(article.excerpt || "Read this story from The Lens.")}</p>
                <div class="author-article-footer">
                    <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${getArticleReadingMinutes(article)} min read</span>
                    <span><i class="fa-regular fa-eye" aria-hidden="true"></i> ${getViewCount(article.id, Number(article.views || 0)).toLocaleString()} views</span>
                </div>
            </div>
        </article>`;
}

export function initAuthorPage() {
    const container = document.getElementById("author-profile-content");
    if (!container) return;

    const requestedName = (new URLSearchParams(window.location.search).get("name") || "").trim();
    const authorArticles = articles.filter(article => String(article.author || "").trim().toLocaleLowerCase() === requestedName.toLocaleLowerCase());
    const authorName = authorArticles[0]?.author || requestedName;

    if (!authorName || !authorArticles.length) {
        container.innerHTML = `
            <section class="author-not-found">
                <span><i class="fa-regular fa-user" aria-hidden="true"></i></span>
                <h1>Author not found</h1>
                <p>We couldn't find a public article under that author name.</p>
                <a href="latest.html" class="author-primary-link">Explore latest articles <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
            </section>`;
        document.title = "Author Not Found | The Lens Publication";
        return;
    }

    const role = getRoleForAuthor(authorArticles);
    document.title = `${authorName} | The Lens Author Profile`;
    container.innerHTML = `
        <section class="author-profile-hero" aria-labelledby="author-name">
            <div class="author-avatar-wrap"><img src="images/member-placeholder.svg" alt="${escapeHTML(authorName)} profile placeholder" class="author-avatar"></div>
            <div class="author-identity">
                <p class="author-profile-eyebrow">AUTHOR PROFILE</p>
                <h1 id="author-name">${escapeHTML(authorName)}</h1>
                <p class="author-role"><i class="fa-solid fa-pen-nib" aria-hidden="true"></i> ${escapeHTML(role)}</p>
                <p class="author-profile-summary">Explore the stories and perspectives published under this byline.</p>
            </div>
            <div class="author-article-count"><strong>${authorArticles.length}</strong><span>${authorArticles.length === 1 ? "Published article" : "Published articles"}</span></div>
        </section>
        <section class="author-articles-section" aria-labelledby="articles-by-author-title">
            <div class="author-articles-heading"><div><p class="author-profile-eyebrow">BYLINE ARCHIVE</p><h2 id="articles-by-author-title">Articles by ${escapeHTML(authorName)}</h2></div><span class="author-count-chip">${authorArticles.length} ${authorArticles.length === 1 ? "story" : "stories"}</span></div>
            <div class="author-articles-grid">${authorArticles.map(renderAuthorArticle).join("")}</div>
        </section>`;
}
