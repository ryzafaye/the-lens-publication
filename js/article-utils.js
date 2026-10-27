import { articles } from "./articles.js";

// One-time automatic workflow purge to guarantee zero-mock state for testing
try {
    const CLEAR_FLAG = 'theLens_workflow_v4_purged';
    if (localStorage.getItem(CLEAR_FLAG) !== 'true') {
        const keysToRemove = [
            'theLensWriterArticles_v3',
            'theLensWriterArticles_v2',
            'theLensWriterArticles_v1',
            'sectionHeadReviewQueue_v1',
            'eicPendingReviewQueue',
            'executivePendingReviewQueue',
            'mpc_publish_articles_v2',
            'mpc_publish_articles_v1',
            'mpc_approved_covers_v1',
            'theLensPublishedArticles',
            'executiveArticles',
            'theLensArticles',
            'theLensCartoonistArticles_v1',
            'cartoonistSubmissions_v1',
            'articleCoverReviewQueue_v1',
            'theLensMediaArticles_v1',
            'mediaTeamSubmissions_v2',
            'mediaTeamSubmissions_v1',
            'sectionHeadMyArticles_v1',
            'eicMyArticles_v1',
            'executiveMyArticles_v1',
            'mpcMyArticles_v1',
            'cartoonistHeadMyArticles_v1',
            'sectionHeadArticleDrafts',
            'eicArticleDrafts',
            'executiveArticleDrafts',
            'mpcArticleDrafts',
            'cartoonistHeadArticleDrafts',
            'mediaArticleDrafts_v1',
            'cartoonistArticleDrafts_v1',
            'executiveActivityLogs_v1',
            'mpcActivityLogs_v1',
            'cartoonistHeadActivityLogs_v1',
            'eicActivityLogs_v1',
            'sectionHeadActivityLogs_v1'
        ];
        keysToRemove.forEach(k => localStorage.removeItem(k));
        localStorage.setItem(CLEAR_FLAG, 'true');
    }
} catch (e) {}

export function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
}

export function isArchivedArticle(article) {
    const status = String(article?.status || article?.publicationStatus || "").toLowerCase();
    return article?.archived === true || article?.isArchived === true || article?.is_archived === true
        || article?.archive === true || status === "archived" || status === "archive";
}

export function getPublicArticles() {
    let storageArticles = [];
    try {
        const raw = localStorage.getItem('theLensPublishedArticles') || localStorage.getItem('mpc_publish_articles_v2');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                storageArticles = parsed
                    .filter(a => (a.status === 'published' || a.status === 'Published') && !isArchivedArticle(a))
                    .map(item => ({
                        id: item.id,
                        category: item.category || 'News',
                        date: item.publishedAt || item.date || item.dateApproved || 'Oct 26, 2026',
                        rawDate: item.rawDate || new Date().toISOString().split('T')[0],
                        views: Number(item.views) || 0,
                        readTime: item.readTime || '2 min read',
                        shares: Number(item.shares) || 0,
                        isArchived: false,
                        title: item.title,
                        excerpt: item.excerpt || (item.body ? item.body.replace(/<[^>]*>/g, '').slice(0, 160) + '...' : ''),
                        author: item.author || 'The Lens Staff',
                        image: item.image || item.coverImage || 'images/maroon.jpg',
                        color: item.color || '#571525',
                        tags: item.tags || [item.category ? item.category.toLowerCase() : 'campus'],
                        content: item.body || item.content || ''
                    }));
            }
        }
    } catch (e) {}

    const staticList = (articles || []).filter(article => !isArchivedArticle(article));
    const combined = [...storageArticles];
    staticList.forEach(s => {
        if (!combined.some(c => String(c.id) === String(s.id))) {
            combined.push(s);
        }
    });

    return combined.filter(article => !isArchivedArticle(article));
}

export function getArchivedArticles() {
    let storageArticles = [];
    try {
        const raw = localStorage.getItem('theLensPublishedArticles') || localStorage.getItem('mpc_publish_articles_v2');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                storageArticles = parsed
                    .filter(a => isArchivedArticle(a))
                    .map(item => ({
                        id: item.id,
                        category: item.category || 'News',
                        date: item.publishedAt || item.date || item.dateApproved || 'Oct 26, 2026',
                        rawDate: item.rawDate || new Date().toISOString().split('T')[0],
                        views: Number(item.views) || 0,
                        readTime: item.readTime || '2 min read',
                        shares: Number(item.shares) || 0,
                        isArchived: true,
                        title: item.title,
                        excerpt: item.excerpt || (item.body ? item.body.replace(/<[^>]*>/g, '').slice(0, 160) + '...' : ''),
                        author: item.author || 'The Lens Staff',
                        image: item.image || item.coverImage || 'images/maroon.jpg',
                        color: item.color || '#571525',
                        tags: item.tags || [item.category ? item.category.toLowerCase() : 'campus'],
                        content: item.body || item.content || ''
                    }));
            }
        }
    } catch (e) {}

    const staticList = (articles || []).filter(article => isArchivedArticle(article));
    const combined = [...storageArticles];
    staticList.forEach(s => {
        if (!combined.some(c => String(c.id) === String(s.id))) {
            combined.push(s);
        }
    });

    return combined;
}

export function getArticle(id) {
    if (!id) return undefined;
    const cleanId = String(id).trim();
    const list = [...getPublicArticles(), ...getArchivedArticles()];
    return list.find(article => String(article.id).trim() === cleanId);
}

export function getAuthorProfileURL(authorName) {
    return `author.html?name=${encodeURIComponent(String(authorName || "The Lens Staff"))}`;
}

export function getNewestArticles(list) {
    return [...list].sort((a, b) => parseArticleDate(b.date) - parseArticleDate(a.date));
}

/** Estimate reading time from the full article body (200 words/minute). */
export function getArticleReadingMinutes(article, wordsPerMinute = 200) {
    const text = String(article?.content || article?.excerpt || article?.title || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    const wordCount = text ? text.split(" ").filter(Boolean).length : 0;
    return Math.max(1, Math.ceil(wordCount / Math.max(1, Number(wordsPerMinute) || 200)));
}

export function parseArticleDate(value) {
    // Prefer a strict local-date parse for ISO dates and let Date handle strings like "Oct 12, 2026".
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
        const [year, month, day] = String(value).split("-").map(Number);
        return new Date(year, month - 1, day);
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

export function sortArticlesList(list, sortBy = "newest") {
    const sorted = [...list];
    if (sortBy === "oldest") return sorted.sort((a, b) => parseArticleDate(a.date) - parseArticleDate(b.date));
    if (sortBy === "popular" || sortBy === "most-viewed") return sorted.sort((a, b) => getViewCount(b.id, Number(b.views || 0)) - getViewCount(a.id, Number(a.views || 0)));
    if (sortBy === "az" || sortBy === "a-z") return sorted.sort((a, b) => String(a.title).localeCompare(String(b.title), "en", { sensitivity: "base" }));
    return sorted.sort((a, b) => parseArticleDate(b.date) - parseArticleDate(a.date));
}

function manilaDateParts(date) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(date);
    const values = Object.fromEntries(parts.filter(part => part.type !== "literal").map(part => [part.type, part.value]));
    return { year: Number(values.year), month: Number(values.month), day: Number(values.day) };
}

function articleDateParts(article) {
    const value = parseArticleDate(article?.date);
    if (!value || Number.isNaN(value.getTime())) return null;
    return manilaDateParts(value);
}

function validDateParts(year, month = null, day = null) {
    if (!Number.isInteger(year) || year < 1900 || year > 2200) return false;
    if (month !== null && (!Number.isInteger(month) || month < 1 || month > 12)) return false;
    if (day !== null) {
        if (month === null || !Number.isInteger(day) || day < 1 || day > 31) return false;
        const check = new Date(Date.UTC(year, month - 1, day));
        if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return false;
    }
    return true;
}

/**
 * Accept optional year, year-month, year-month-day, month/year, or month/day/year.
 * Returns null for empty input, { valid: false } for an invalid value, or date parts.
 */
export function parseOptionalDateFilter(value = "") {
    const text = String(value).trim();
    if (!text) return null;

    let match = text.match(/^(\d{4})$/);
    if (match) {
        const year = Number(match[1]);
        return validDateParts(year) ? { valid: true, year } : { valid: false };
    }

    match = text.match(/^(\d{4})-(\d{1,2})$/);
    if (match) {
        const year = Number(match[1]), month = Number(match[2]);
        return validDateParts(year, month) ? { valid: true, year, month } : { valid: false };
    }

    match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) {
        const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
        return validDateParts(year, month, day) ? { valid: true, year, month, day } : { valid: false };
    }

    match = text.match(/^(\d{1,2})\/(\d{4})$/);
    if (match) {
        const month = Number(match[1]), year = Number(match[2]);
        return validDateParts(year, month) ? { valid: true, year, month } : { valid: false };
    }

    match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
        const month = Number(match[1]), day = Number(match[2]), year = Number(match[3]);
        return validDateParts(year, month, day) ? { valid: true, year, month, day } : { valid: false };
    }

    return { valid: false };
}

/** Date-filter logic shared by public search and the archive listing. */
export function articleMatchesDateFilter(article, mode = "any", value = "") {
    if (!mode || mode === "any" || mode === "none") return true;
    const articleParts = articleDateParts(article);
    if (!articleParts) return false;
    const today = manilaDateParts(new Date());

    if (mode === "today") {
        return articleParts.year === today.year && articleParts.month === today.month && articleParts.day === today.day;
    }

    if (mode === "this_week") {
        const dayMs = 24 * 60 * 60 * 1000;
        const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
        const weekday = new Date(todayUtc).getUTCDay();
        const weekStart = todayUtc - ((weekday + 6) % 7) * dayMs; // Monday
        const weekEnd = weekStart + 6 * dayMs; // Sunday
        const articleUtc = Date.UTC(articleParts.year, articleParts.month - 1, articleParts.day);
        return articleUtc >= weekStart && articleUtc <= weekEnd;
    }

    if (mode === "choose") {
        if (String(value).includes("|")) {
            const [yearText = "", monthText = "", dayText = ""] = String(value).split("|");
            const year = yearText ? Number(yearText) : null;
            const month = monthText ? Number(monthText) : null;
            const day = dayText ? Number(dayText) : null;
            if (year === null && month === null && day === null) return true;
            if (year !== null && articleParts.year !== year) return false;
            if (month !== null && articleParts.month !== month) return false;
            if (day !== null && articleParts.day !== day) return false;
            return true;
        }
        const custom = parseOptionalDateFilter(value);
        if (!custom) return true;
        if (!custom.valid) return false;
        if (articleParts.year !== custom.year) return false;
        if (custom.month !== undefined && articleParts.month !== custom.month) return false;
        if (custom.day !== undefined && articleParts.day !== custom.day) return false;
        return true;
    }

    if (mode === "date") {
        const custom = parseOptionalDateFilter(value);
        return Boolean(custom?.valid && custom.year === articleParts.year && custom.month === articleParts.month && custom.day === articleParts.day);
    }
    if (mode === "month") {
        const custom = parseOptionalDateFilter(value);
        return Boolean(custom?.valid && custom.year === articleParts.year && custom.month === articleParts.month);
    }
    if (mode === "year") return String(articleParts.year) === String(value);
    return true;
}

const SHARE_COUNT_PREFIX = "thelens_article_share_count_";
const EXTRA_VIEW_PREFIX = "thelens_article_extra_view_count_";
const VIEWED_SESSION_PREFIX = "thelens_article_viewed_session_";

export function getViewCount(articleId, seededViews = 0) {
    try {
        return Number(seededViews || 0) + Number(localStorage.getItem(`${EXTRA_VIEW_PREFIX}${String(articleId)}`) || 0);
    } catch {
        return Number(seededViews || 0);
    }
}

export function recordArticleView(articleId, seededViews = 0) {
    const id = String(articleId);
    try {
        const sessionKey = `${VIEWED_SESSION_PREFIX}${id}`;
        if (sessionStorage.getItem(sessionKey)) return getViewCount(id, seededViews);
        sessionStorage.setItem(sessionKey, "1");
        const key = `${EXTRA_VIEW_PREFIX}${id}`;
        const nextExtra = Number(localStorage.getItem(key) || 0) + 1;
        localStorage.setItem(key, String(nextExtra));
        const total = Number(seededViews || 0) + nextExtra;
        document.querySelectorAll(`[data-view-count="${id}"]`).forEach(node => {
            node.textContent = total.toLocaleString();
        });
        return total;
    } catch {
        return Number(seededViews || 0);
    }
}

export function getShareCount(articleId) {
    try {
        return Number(localStorage.getItem(`${SHARE_COUNT_PREFIX}${String(articleId)}`) || 0);
    } catch {
        return 0;
    }
}

export function recordShareCopy(articleId) {
    const id = String(articleId);
    const nextCount = getShareCount(id) + 1;
    try {
        localStorage.setItem(`${SHARE_COUNT_PREFIX}${id}`, String(nextCount));
    } catch (error) {
        console.warn("Could not save local share count:", error);
    }
    document.querySelectorAll(`[data-share-count="${id}"]`).forEach(node => {
        node.textContent = nextCount.toLocaleString();
    });
    document.querySelectorAll(`[data-copy-article-id="${id}"]`).forEach(button => {
        const article = getArticle(id);
        if (article) button.setAttribute("aria-label", `Copy link to ${article.title}; ${nextCount} copies recorded`);
    });
    return nextCount;
}

export function getArticleURL(articleId) {
    const url = new URL("index.html", document.baseURI);
    url.hash = `article-${String(articleId)}`;
    return url.href;
}
