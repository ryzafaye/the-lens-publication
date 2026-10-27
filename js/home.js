import { articleMeta, articleTitle, articleStats, articleByline, createImage } from "./article-templates.js";
import { escapeHTML, getNewestArticles, getPublicArticles } from "./article-utils.js";

function displayFeaturedArticle() {
    const container = document.getElementById("featured-article");
    if (!container) return;
    const publicArticles = getPublicArticles();
    if (!publicArticles.length) {
        container.innerHTML = `
            <div class="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl my-4">
                <i class="fa-regular fa-newspaper text-3xl mb-3 text-slate-300 block"></i>
                <h3 class="font-bold text-base text-slate-700">No Published Articles Yet</h3>
                <p class="text-xs text-slate-500 mt-1">Stories published by the editorial team will appear here.</p>
            </div>
        `;
        return;
    }
    const featured = getNewestArticles(publicArticles)[0];

    container.innerHTML = `
        <article class="featured-story reveal-on-scroll" data-article-id="${escapeHTML(featured.id)}" style="cursor: pointer;">
            <button type="button" data-article-id="${escapeHTML(featured.id)}" class="featured-image-trigger article-clickable" aria-label="Read article: ${escapeHTML(featured.title)}">
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
    const publicArticles = getPublicArticles();
    const latest = getNewestArticles(publicArticles).slice(1, 5);

    if (!latest.length) {
        container.innerHTML = '<p class="text-xs text-slate-400 py-3 italic">No recent releases yet.</p>';
        return;
    }

    container.innerHTML = latest.map(article => `
        <article class="latest-item reveal-on-scroll" data-article-id="${escapeHTML(article.id)}" style="cursor: pointer;">
            <div class="latest-item-copy">
                <p class="latest-category">${escapeHTML(article.category)}</p>
                <h3 class="latest-title">${articleTitle(article)}</h3>
                ${articleByline(article)}
                ${articleStats(article)}
            </div>
            <button type="button" data-article-id="${escapeHTML(article.id)}" class="latest-image-trigger article-clickable" aria-label="Read article: ${escapeHTML(article.title)}">
                ${createImage(article, "latest-image")}
            </button>
        </article>
    `).join("");
}

function displayMoreArticles() {
    const container = document.getElementById("more-articles");
    if (!container) return;
    const publicArticles = getPublicArticles();
    const more = getNewestArticles(publicArticles).slice(5, 8);

    if (!more.length) {
        container.innerHTML = '<p class="text-xs text-slate-400 py-3 italic col-span-full">No additional stories yet.</p>';
        return;
    }

    container.innerHTML = more.map(article => `
        <article class="story-card reveal-on-scroll" data-article-id="${escapeHTML(article.id)}" style="cursor: pointer;">
            <button type="button" data-article-id="${escapeHTML(article.id)}" class="story-card-image-trigger article-clickable" aria-label="Read article: ${escapeHTML(article.title)}">
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
        container.innerHTML = '<p class="empty-state text-xs text-slate-400 italic py-2">No articles available yet in this section.</p>';
        return;
    }

    container.innerHTML = matching.map(article => `
        <article class="category-card reveal-on-scroll" data-article-id="${escapeHTML(article.id)}" style="cursor: pointer;">
            <button type="button" data-article-id="${escapeHTML(article.id)}" class="category-image-trigger article-clickable" aria-label="Read article: ${escapeHTML(article.title)}">
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
