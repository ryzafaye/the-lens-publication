import { articleMeta, articleTitle, articleStats, articleByline, createImage } from "./article-templates.js";
import { escapeHTML, getNewestArticles, getPublicArticles } from "./article-utils.js";

function displayFeaturedArticle() {
    const container = document.getElementById("featured-article");
    const publicArticles = getPublicArticles();
    if (!container || !publicArticles.length) return;
    const featured = getNewestArticles(publicArticles)[0];

    container.innerHTML = `
        <article class="featured-story reveal-on-scroll">
            <button type="button" data-article-id="${featured.id}" class="featured-image-trigger article-clickable" aria-label="Read article: ${escapeHTML(featured.title)}">
                ${createImage(featured, "featured-image")}
            </button>
            ${articleMeta(featured)}
            <h2 class="featured-title">${articleTitle(featured, "featured-headline-button")}</h2>
            <div class="featured-divider"></div>
            <p class="featured-excerpt">${escapeHTML(featured.excerpt)}</p>
            ${articleByline(featured)}
            ${articleStats(featured)}
        </article>
    `;
}

function displayLatestArticles() {
    const container = document.getElementById("latest-articles");
    if (!container) return;
    const latest = getNewestArticles(getPublicArticles()).slice(1, 5);

    container.innerHTML = latest.map(article => `
        <article class="latest-item reveal-on-scroll">
            <div class="latest-item-copy">
                <p class="latest-category">${escapeHTML(article.category)}</p>
                <h3 class="latest-title">${articleTitle(article)}</h3>
                ${articleByline(article)}
                ${articleStats(article)}
            </div>
            <button type="button" data-article-id="${article.id}" class="latest-image-trigger article-clickable" aria-label="Read article: ${escapeHTML(article.title)}">
                ${createImage(article, "latest-image")}
            </button>
        </article>
    `).join("");
}

function displayMoreArticles() {
    const container = document.getElementById("more-articles");
    if (!container) return;
    const more = getNewestArticles(getPublicArticles()).slice(5, 8);

    container.innerHTML = more.map(article => `
        <article class="story-card reveal-on-scroll">
            <button type="button" data-article-id="${article.id}" class="story-card-image-trigger article-clickable" aria-label="Read article: ${escapeHTML(article.title)}">
                ${createImage(article, "story-card-image")}
            </button>
            ${articleMeta(article)}
            <h3 class="story-card-title">${articleTitle(article)}</h3>
            <p class="story-card-excerpt">${escapeHTML(article.excerpt)}</p>
            ${articleByline(article)}
            ${articleStats(article)}
        </article>
    `).join("");
}

function displayCategory(category, elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;
    const matching = getNewestArticles(getPublicArticles().filter(article => article.category === category)).slice(0, 3);
    if (!matching.length) {
        container.innerHTML = '<p class="empty-state">No articles available yet.</p>';
        return;
    }

    container.innerHTML = matching.map(article => `
        <article class="category-card reveal-on-scroll">
            <button type="button" data-article-id="${article.id}" class="category-image-trigger article-clickable" aria-label="Read article: ${escapeHTML(article.title)}">
                ${createImage(article, "small-image")}
            </button>
            <div class="category-card-copy">
                ${articleMeta(article)}
                <h3>${articleTitle(article)}</h3>
                <p class="category-card-excerpt">${escapeHTML(article.excerpt)}</p>
                ${articleByline(article)}
                ${articleStats(article)}
            </div>
        </article>
    `).join("");
}

export function renderHomePage() {
    if (document.getElementById("featured-article")) displayFeaturedArticle();
    if (document.getElementById("latest-articles")) displayLatestArticles();
    if (document.getElementById("more-articles")) displayMoreArticles();
    displayCategory("News", "news-articles");
    displayCategory("Features", "features-articles");
    displayCategory("Opinion", "opinion-articles");
    displayCategory("Science and Technology", "science-articles");
    displayCategory("Literature", "literature-articles");
}
