import { articleTitle, articleMeta, articleStats, articleByline, createImage } from "./article-templates.js";
import { articleMatchesDateFilter, escapeHTML, sortArticlesList, getPublicArticles } from "./article-utils.js";

export function displayArchives(category = "All", searchTerm = "", sortBy = "newest", dateType = "any", dateValue = "") {
    const container = document.getElementById("archive-articles");
    if (!container) return 0;
    const query = searchTerm.trim().toLowerCase();

    const publicArticles = getPublicArticles();
    let matches = publicArticles.filter(article => {
        const categoryMatches = category === "All" || article.category === category;
        const searchable = [article.title, article.excerpt, article.content, article.author, article.category, ...(article.tags || [])]
            .filter(Boolean).join(" ").toLowerCase();
        const queryMatches = !query || searchable.includes(query);
        return categoryMatches && queryMatches && articleMatchesDateFilter(article, dateType, dateValue);
    });
    matches = sortArticlesList(matches, sortBy);

    if (!matches.length) {
        container.innerHTML = `
            <div class="archive-empty-state">
                <i class="fa-regular fa-folder-open" aria-hidden="true"></i>
                <h3>No stories found</h3>
                <p>Try another keyword, author, category, or date range.</p>
            </div>`;
    } else {
        container.innerHTML = matches.map(article => `
            <article class="archive-item reveal-on-scroll">
                <button type="button" data-article-id="${article.id}" class="archive-image-trigger article-clickable" aria-label="Read article: ${escapeHTML(article.title)}">
                    ${createImage(article, "archive-image")}
                </button>
                <div class="archive-item-copy">
                    ${articleMeta(article)}
                    <h3>${articleTitle(article)}</h3>
                    <p class="archive-excerpt">${escapeHTML(article.excerpt)}</p>
                    ${articleByline(article)}
                    ${articleStats(article)}
                </div>
            </article>
        `).join("");
    }

    const count = document.getElementById("archive-count");
    if (count) count.textContent = `${matches.length} ${matches.length === 1 ? "article" : "articles"} found`;
    return matches.length;
}

export function initArchiveFilter() {
    const archiveFilter = document.getElementById("archive-filter");
    if (!archiveFilter || archiveFilter.dataset.filterBound === "true") return;
    archiveFilter.dataset.filterBound = "true";
    archiveFilter.addEventListener("change", () => {
        const categorySelect = document.getElementById("category-select");
        if (categorySelect) categorySelect.value = archiveFilter.value;
        document.getElementById("search-form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
}

export function renderArchivesPage() {
    if (!document.getElementById("archive-articles")) return;
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category") || "All";
    const query = params.get("q") || "";
    const sortBy = params.get("sort") || "newest";
    const dateType = params.get("dateType") || "any";
    const dateValue = params.get("dateValue") || "";

    const archiveFilter = document.getElementById("archive-filter");
    const categorySelect = document.getElementById("category-select");
    const searchInput = document.getElementById("search-input");
    const sortSelect = document.getElementById("sort-select");
    const dateTypeSelect = document.getElementById("date-filter-type");
    const dateValueInput = document.getElementById("date-filter-value");

    if (archiveFilter) archiveFilter.value = category;
    if (categorySelect) categorySelect.value = category;
    if (searchInput) searchInput.value = query;
    if (sortSelect) sortSelect.value = sortBy;
    if (dateTypeSelect) dateTypeSelect.value = dateType;

    // Dispatch change first because switching the input type can clear its previous value.
    if (dateTypeSelect) dateTypeSelect.dispatchEvent(new Event("change"));
    if (dateValueInput && dateValue) dateValueInput.value = dateValue;
    const count = displayArchives(category, query, sortBy, dateType, dateValue);
    const message = document.getElementById("search-message");
    if (message && (query || dateValue || category !== "All")) {
        const details = [];
        if (query) details.push(`“${query}”`);
        if (category !== "All") details.push(category);
        if (dateValue) details.push(dateValue);
        message.textContent = `${count} ${count === 1 ? "article" : "articles"} found${details.length ? ` for ${details.join(" · ")}` : ""}.`;
        message.classList.remove("hidden");
    }
}
