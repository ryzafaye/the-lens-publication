/**
 * ============================================================================
 * THE LENS — CARTOONIST DATA MANAGEMENT
 * Shared Articles & Editorial Cartoons Management for Cartoonist Portal
 * Official Cartoon Statuses:
 *   - 'Pending with Head'
 *   - 'Returned for Revision'
 *   - 'EIC Approved'
 *   - 'Published'
 * ============================================================================
 */

const CARTOONIST_ARTICLES_STORAGE_KEY = 'theLensCartoonistArticles_v1';
const CARTOONIST_SUBMISSIONS_STORAGE_KEY = 'cartoonistSubmissions_v1';
const REVIEW_QUEUE_KEY = 'articleCoverReviewQueue_v1';

// Seed Articles (Empty by default for clean workflow testing)
const DEFAULT_CARTOONIST_ARTICLES = [];

// Seed Cartoon Submissions (Empty by default for clean workflow testing)
const DEFAULT_CARTOON_SUBMISSIONS = [];

/**
 * Standardize any status value to the 4 official statuses:
 * 1. 'Pending with Head'
 * 2. 'Returned for Revision'
 * 3. 'EIC Approved'
 * 4. 'Published'
 */
function normalizeCartoonStatus(rawStatus) {
    if (!rawStatus) return 'Pending with Head';
    const s = String(rawStatus).trim();

    if (s === 'Published' || s === 'published' || s === 'approved') {
        return 'Published';
    }
    if (s === 'EIC Approved' || s === 'eic_approved' || s === 'approved_for_mpc' || s === 'Forwarded to EIC') {
        return 'EIC Approved';
    }
    if (s === 'Returned for Revision' || s === 'returned' || s === 'needs_revision' || s === 'For Revision') {
        return 'Returned for Revision';
    }
    if (s === 'Pending with Head' || s === 'pending' || s === 'submitted_to_mpc' || s === 'under-review') {
        return 'Pending with Head';
    }
    return s;
}

// =============================================================================
// ARTICLE DATA METHODS
// =============================================================================
function getCartoonistArticles() {
    try {
        const raw = localStorage.getItem(CARTOONIST_ARTICLES_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (e) {
        console.warn('Error reading cartoonist articles:', e);
    }
    return [];
}

function saveCartoonistArticles(articles) {
    try {
        localStorage.setItem(CARTOONIST_ARTICLES_STORAGE_KEY, JSON.stringify(articles));
    } catch (e) {
        console.warn('Error saving cartoonist articles:', e);
    }
}

// =============================================================================
// CARTOON SUBMISSIONS METHODS
// =============================================================================
function getCartoonSubmissions() {
    try {
        let list = [];
        const raw = localStorage.getItem(CARTOONIST_SUBMISSIONS_STORAGE_KEY);
        if (raw) {
            list = JSON.parse(raw);
            if (!Array.isArray(list)) list = [];
        }

        // Normalize status
        list = list.map(item => ({
            ...item,
            status: normalizeCartoonStatus(item.status)
        }));

        // Check review queue for any status/remarks updates
        const reviewRaw = localStorage.getItem(REVIEW_QUEUE_KEY);
        if (reviewRaw) {
            const reviewQueue = JSON.parse(reviewRaw);
            if (Array.isArray(reviewQueue)) {
                list = list.map(item => {
                    const match = reviewQueue.find(q => q.id === item.id);
                    if (match) {
                        return { 
                            ...item, 
                            status: normalizeCartoonStatus(match.status), 
                            remarks: match.remarks !== undefined ? match.remarks : item.remarks 
                        };
                    }
                    return item;
                });
            }
        }

        return list;
    } catch (e) {
        console.warn('Error reading cartoon submissions:', e);
        return [];
    }
}

function saveCartoonSubmissions(submissions) {
    try {
        const normalized = (submissions || []).map(item => ({
            ...item,
            status: normalizeCartoonStatus(item.status)
        }));
        localStorage.setItem(CARTOONIST_SUBMISSIONS_STORAGE_KEY, JSON.stringify(normalized));
    } catch (e) {
        console.warn('Error saving cartoon submissions:', e);
    }
}
