import { categories } from "./articles.js";
import { getNewestArticles, getPublicArticles } from "./article-utils.js";
import { categoryListItem } from "./article-templates.js";

const LATEST_LIMIT = 12;

export function renderCategoryPage() {
    const main = document.querySelector('main[data-page="category"]');
    if (!main) return;
    const config = categories.find(category => category.slug === main.dataset.category);
    if (!config) return;

    const publicArticles = getPublicArticles();
    const list = config.slug === "latest"
        ? getNewestArticles(publicArticles).slice(0, LATEST_LIMIT)
        : getNewestArticles(publicArticles.filter(article => article.category === config.name));

    main.innerHTML = `
        <section class="page-intro">
            <p class="eyebrow">THE LENS COLLECTION</p>
            <h1>${config.title}</h1>
        </section>
        <div class="category-list-grid">
            ${list.length ? list.map(categoryListItem).join("") : '<p class="empty-state">No articles available yet.</p>'}
        </div>
    `;
}
