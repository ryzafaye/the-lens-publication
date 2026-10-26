/**
 * ============================================================================
 * THE LENS — MEDIA & COMMUNICATION DATA MANAGEMENT
 * Shared Articles & Media Assets Management for Media & Communication Team
 * Official Media Statuses:
 *   - 'Pending with Head'
 *   - 'Returned for Revision'
 *   - 'EIC Approved'
 *   - 'Published'
 * ============================================================================
 */

const MEDIA_ARTICLES_STORAGE_KEY = 'theLensMediaArticles_v1';
const MEDIA_SUBMISSIONS_STORAGE_KEY = 'mediaTeamSubmissions_v2'; // Bumped version for clean 4-status migration
const REVIEW_QUEUE_KEY = 'articleCoverReviewQueue_v1';

// Seed Articles for Alyssa Marie Dizon
const DEFAULT_MEDIA_ARTICLES = [];

// Seed Media Submissions for Alyssa Marie Dizon (Covering all 4 official statuses)
const DEFAULT_MEDIA_SUBMISSIONS = [];

/**
 * Standardize any legacy status value to the 4 official statuses:
 * 1. 'Pending with Head'
 * 2. 'Returned for Revision'
 * 3. 'EIC Approved'
 * 4. 'Published'
 */
function normalizeMediaStatus(rawStatus) {
    if (!rawStatus) return 'Pending with Head';
    const s = String(rawStatus).trim();

    if (s === 'Published' || s === 'published') {
        return 'Published';
    }
    if (s === 'EIC Approved' || s === 'eic_approved' || s === 'approved_for_mpc') {
        return 'EIC Approved';
    }
    if (s === 'Returned for Revision' || s === 'returned' || s === 'needs_revision' || s === 'For Revision') {
        return 'Returned for Revision';
    }
    if (s === 'Pending with Head' || s === 'pending' || s === 'submitted_to_mpc' || s === 'under-review') {
        return 'Pending with Head';
    }
    if (s === 'approved') {
        return 'Published';
    }
    return s;
}

// =============================================================================
// ARTICLE DATA METHODS
// =============================================================================
function getMediaArticles() {
    try {
        const raw = localStorage.getItem(MEDIA_ARTICLES_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (e) {
        console.warn('Error reading media articles:', e);
    }
    return [];
}

function saveMediaArticles(articles) {
    try {
        localStorage.setItem(MEDIA_ARTICLES_STORAGE_KEY, JSON.stringify(articles));
    } catch (e) {
        console.warn('Error saving media articles:', e);
    }
}

// =============================================================================
// MEDIA ASSET SUBMISSIONS METHODS
// =============================================================================
function getMediaSubmissions() {
    try {
        let list = [];
        const rawV2 = localStorage.getItem(MEDIA_SUBMISSIONS_STORAGE_KEY);
        if (rawV2) {
            list = JSON.parse(rawV2);
        } else {
            const legacyV1 = localStorage.getItem('mediaTeamSubmissions_v1');
            if (legacyV1) {
                try {
                    const parsedLegacy = JSON.parse(legacyV1);
                    if (Array.isArray(parsedLegacy)) {
                        list = parsedLegacy.map(item => ({
                            ...item,
                            status: normalizeMediaStatus(item.status)
                        }));
                    }
                } catch (e) {
                    list = [];
                }
            } else {
                list = [];
            }
        }

        if (!Array.isArray(list)) list = [];

        // Check if any item in review queue was approved or returned by M&PC Head
        const reviewRaw = localStorage.getItem(REVIEW_QUEUE_KEY);
        if (reviewRaw) {
            const reviewQueue = JSON.parse(reviewRaw);
            if (Array.isArray(reviewQueue)) {
                list = list.map(item => {
                    const match = reviewQueue.find(q => q.id === item.id);
                    if (match) {
                        return { 
                            ...item, 
                            status: normalizeMediaStatus(match.status), 
                            remarks: match.remarks || item.remarks 
                        };
                    }
                    return {
                        ...item,
                        status: normalizeMediaStatus(item.status)
                    };
                });
            }
        } else {
            list = list.map(item => ({
                ...item,
                status: normalizeMediaStatus(item.status)
            }));
        }

        return list;
    } catch (e) {
        console.warn('Error reading media submissions:', e);
        return [];
    }
}

function saveMediaSubmissions(submissions) {
    try {
        const normalized = (submissions || []).map(item => ({
            ...item,
            status: normalizeMediaStatus(item.status)
        }));
        localStorage.setItem(MEDIA_SUBMISSIONS_STORAGE_KEY, JSON.stringify(normalized));
        // Keep v1 in sync just in case
        localStorage.setItem('mediaTeamSubmissions_v1', JSON.stringify(normalized));
    } catch (e) {
        console.warn('Error saving media submissions:', e);
    }
}
