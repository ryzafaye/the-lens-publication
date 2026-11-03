/**
 * ============================================================================
 * THE LENS PUBLICATION — ARTICLES DATASET & TAXONOMY
 * Clean Workflow State: Hardcoded mock articles removed for end-to-end testing.
 * Published stories are dynamically populated from editorial workflow.
 * ============================================================================
 */

export const articles = [];

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
