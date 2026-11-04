/**
 * The Lens — Public Articles Store
 * Dummy articles removed. Live articles are loaded dynamically from the publication workflow.
 */

export const articles = [];

// Page headings for the category pages. `name` must match article.category.
export const categories = [
    {
        "slug": "latest",
        "name": "Latest Releases",
        "page": "latest.html",
        "title": "Latest Releases",
    },
    {
        "slug": "news",
        "name": "News",
        "page": "news.html",
        "title": "News Articles",
    },
    {
        "slug": "features",
        "name": "Features",
        "page": "features.html",
        "title": "Feature Stories",
    },
    {
        "slug": "opinion",
        "name": "Opinion",
        "page": "opinion.html",
        "title": "Opinion Pieces",
    },
    {
        "slug": "science",
        "name": "Science and Technology",
        "page": "science.html",
        "title": "Science & Technology",
    },
    {
        "slug": "literature",
        "name": "Literature",
        "page": "literature.html",
        "title": "Literature",
    }
];

// Attach globally for dual ES module & classic script compatibility
if (typeof window !== "undefined") {
    window.lensArticles = articles;
    window.lensCategories = categories;
}
