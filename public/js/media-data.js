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
const MEDIA_SUBMISSIONS_STORAGE_KEY = 'mediaTeamSubmissions_v2';
const REVIEW_QUEUE_KEY = 'articleCoverReviewQueue_v1';

// One-time purge of all pics submitted by media team per user request
try {
    const PURGE_MEDIA_PICS_FLAG = 'theLens_purge_all_media_pics_v20261107_final';
    if (localStorage.getItem(PURGE_MEDIA_PICS_FLAG) !== 'true') {
        localStorage.removeItem(MEDIA_SUBMISSIONS_STORAGE_KEY);
        localStorage.removeItem('mediaTeamSubmissions_v1');
        localStorage.setItem(MEDIA_SUBMISSIONS_STORAGE_KEY, JSON.stringify([]));

        // Also remove photos submitted by media team from review queue
        const rawReview = localStorage.getItem(REVIEW_QUEUE_KEY);
        if (rawReview) {
            try {
                let rq = JSON.parse(rawReview);
                if (Array.isArray(rq)) {
                    rq = rq.filter(item => {
                        if (!item) return false;
                        const t = (item.type || '').toLowerCase();
                        const cat = (item.category || '').toLowerCase();
                        const role = (item.uploaderRole || '').toLowerCase();
                        return t !== 'photo' && cat !== 'photo' && !role.includes('media') && !role.includes('photojournalist');
                    });
                    localStorage.setItem(REVIEW_QUEUE_KEY, JSON.stringify(rq));
                }
            } catch (err) {}
        }
        localStorage.setItem(PURGE_MEDIA_PICS_FLAG, 'true');
    }
} catch (e) {}

// Zero hardcoded seed datasets
const DEFAULT_MEDIA_ARTICLES = [];
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
    if (s === 'EIC Approved' || s === 'eic_approved' || s === 'approved_for_mpc' || s === 'approved') {
        return 'EIC Approved';
    }
    if (s === 'Returned for Revision' || s === 'returned' || s === 'needs_revision' || s === 'For Revision') {
        return 'Returned for Revision';
    }
    if (s === 'Pending EIC Review' || s === 'forwarded to eic') {
        return 'Pending EIC Review';
    }
    if (s === 'Pending with Head' || s === 'Pending M&PC Review' || s === 'pending' || s === 'submitted_to_mpc' || s === 'under-review') {
        return 'Pending with Head';
    }
    return s;
}

// =============================================================================
// ARTICLE DATA METHODS
// Refactored for backend controller data injection via window.INITIAL_DATA or window.INITIAL_ARTICLES
// =============================================================================
function getMediaArticles() {
    if (window.INITIAL_ARTICLES && Array.isArray(window.INITIAL_ARTICLES) && window.INITIAL_ARTICLES.length > 0) {
        return window.INITIAL_ARTICLES;
    }
    if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA) && window.INITIAL_DATA.length > 0) {
        return window.INITIAL_DATA;
    }
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
// USER IDENTITY & SUBMISSION SCOPING (MEDIA TEAM ROLE PARITY)
// Guarantees each Media Team account only sees their own submitted media
// =============================================================================

function normalizeTextName(name) {
    if (!name) return '';
    return String(name).trim().toLowerCase().replace(/\s+/g, ' ');
}

function getCurrentMediaUserIdentity() {
    const userId = window.LARAVEL_USER_ID 
        || localStorage.getItem('mediaUserId') 
        || localStorage.getItem('userId') 
        || '';
    const studentNum = window.LARAVEL_STUDENT_NUMBER 
        || localStorage.getItem('mediaStudentNumber') 
        || localStorage.getItem('studentNumber') 
        || '';
    const userName = window.LARAVEL_USER_NAME 
        || localStorage.getItem('mediaName') 
        || localStorage.getItem('userName') 
        || '';
    return {
        userId: userId ? String(userId).trim() : '',
        studentNum: studentNum ? String(studentNum).trim().toLowerCase() : '',
        userName: normalizeTextName(userName)
    };
}

function isCurrentUserMediaSubmission(item, identity) {
    if (!item) return false;
    const { userId, studentNum, userName } = identity || getCurrentMediaUserIdentity();

    // 1. Primary: Explicit userId match
    if (userId && item.userId) {
        return String(item.userId).trim() === userId;
    }

    // 2. Secondary: Explicit student number match
    const itemStudentNum = String(item.userStudentNumber || item.studentNumber || '').trim().toLowerCase();
    if (studentNum && itemStudentNum) {
        return itemStudentNum === studentNum;
    }

    // 3. Fallback: Artist or Author name match (for backward compatibility with existing submissions)
    const itemArtist = normalizeTextName(item.artist || item.author || '');
    if (userName && itemArtist) {
        // Prevent matching generic fallback labels like "media team" or "media team member"
        const genericNames = ['media team', 'media team member', 'user', 'author', 'admin'];
        if (genericNames.includes(userName) || genericNames.includes(itemArtist)) {
            return false;
        }

        if (itemArtist === userName) {
            return true;
        }

        // Compare first and last name tokens if formatted slightly differently
        const partsA = itemArtist.split(' ').filter(p => p.length > 1);
        const partsB = userName.split(' ').filter(p => p.length > 1);
        if (partsA.length >= 2 && partsB.length >= 2) {
            if (partsA[0] === partsB[0] && partsA[partsA.length - 1] === partsB[partsB.length - 1]) {
                return true;
            }
        }
    }

    return false;
}

// =============================================================================
// MEDIA ASSET SUBMISSIONS METHODS
// Refactored for backend controller data injection via window.INITIAL_DATA or window.INITIAL_MEDIA
// =============================================================================

function getAllRawMediaSubmissions() {
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

        // Exclude any legacy mock or hardcoded items (must be genuine user upload)
        list = list.filter(item => {
            if (!item || !item.image) return false;
            const img = String(item.image).trim();
            if (img.includes('images/') || img.includes('covers/') || img.includes('maroon.jpg') || img.includes('portal-pubmat') || img.includes('election-guidelines') || img.includes('faculty-overload') || img.includes('press-freedom')) {
                return false;
            }
            if (String(item.id).includes('mock') || String(item.id).includes('sample') || String(item.id).includes('seed') || String(item.id).includes('default')) {
                return false;
            }
            return img.startsWith('data:image/') || img.startsWith('/storage/') || img.startsWith('http');
        });

        // Sync latest status and remarks from review queue if exists
        const reviewRaw = localStorage.getItem(REVIEW_QUEUE_KEY);
        if (reviewRaw) {
            try {
                const reviewQueue = JSON.parse(reviewRaw);
                if (Array.isArray(reviewQueue)) {
                    list = list.map(item => {
                        const match = reviewQueue.find(q => String(q.id) === String(item.id));
                        if (match) {
                            return { 
                                ...item, 
                                status: normalizeMediaStatus(match.status), 
                                remarks: match.remarks || item.remarks,
                                endorsedBy: match.endorsedBy || item.endorsedBy,
                                approvedBy: match.approvedBy || item.approvedBy
                            };
                        }
                        return {
                            ...item,
                            status: normalizeMediaStatus(item.status)
                        };
                    });
                }
            } catch (err) {}
        } else {
            list = list.map(item => ({
                ...item,
                status: normalizeMediaStatus(item.status)
            }));
        }

        // Strict deduplication by ID to guarantee zero duplicate cards
        const seenIds = new Set();
        list = list.filter(item => {
            if (!item || !item.id) return false;
            const strId = String(item.id);
            if (seenIds.has(strId)) return false;
            seenIds.add(strId);
            return true;
        });

        return list;
    } catch (e) {
        console.warn('Error reading raw media submissions:', e);
        return [];
    }
}

/**
 * Returns media submissions.
 * When called inside Media Team role views (dashboard, manage-media),
 * filters strictly so that each account only sees their own submitted media.
 */
function getMediaSubmissions(filterByUser = true) {
    let source = [];
    if (window.INITIAL_MEDIA && Array.isArray(window.INITIAL_MEDIA) && window.INITIAL_MEDIA.length > 0) {
        source = window.INITIAL_MEDIA;
    } else if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA) && window.INITIAL_DATA.length > 0) {
        source = window.INITIAL_DATA;
    } else {
        source = getAllRawMediaSubmissions();
    }

    if (!filterByUser) {
        return source;
    }

    const identity = getCurrentMediaUserIdentity();
    if (identity.userId || identity.studentNum || identity.userName) {
        return source.filter(item => isCurrentUserMediaSubmission(item, identity));
    }

    return source;
}

/**
 * Saves current user's media submissions while safely preserving submissions from other accounts.
 */
function saveMediaSubmissions(submissions) {
    try {
        const identity = getCurrentMediaUserIdentity();
        const authorDisplayName = window.LARAVEL_USER_NAME || localStorage.getItem('mediaName') || localStorage.getItem('userName') || 'Media Team Member';

        const normalizedUserSubmissions = (submissions || []).map(item => {
            const normalizedStatus = normalizeMediaStatus(item.status);
            return {
                ...item,
                status: normalizedStatus,
                userId: item.userId || identity.userId || undefined,
                userStudentNumber: item.userStudentNumber || item.studentNumber || identity.studentNum || undefined,
                studentNumber: item.studentNumber || item.userStudentNumber || identity.studentNum || undefined,
                artist: item.artist || authorDisplayName,
                author: item.author || item.artist || authorDisplayName
            };
        });

        // Deduplicate normalized user submissions by ID
        const seenUserIds = new Set();
        const dedupedUserSubs = [];
        normalizedUserSubmissions.forEach(item => {
            if (!item || !item.id) return;
            const strId = String(item.id);
            if (!seenUserIds.has(strId)) {
                seenUserIds.add(strId);
                dedupedUserSubs.push(item);
            }
        });

        // Load all existing items from storage to avoid wiping submissions from other accounts
        let allExisting = [];
        try {
            const rawV2 = localStorage.getItem(MEDIA_SUBMISSIONS_STORAGE_KEY);
            if (rawV2) {
                const parsed = JSON.parse(rawV2);
                if (Array.isArray(parsed)) allExisting = parsed;
            }
        } catch (e) {
            allExisting = [];
        }

        // Retain items belonging to OTHER users
        const otherUsersItems = allExisting.filter(item => {
            if (!item) return false;
            return !isCurrentUserMediaSubmission(item, identity);
        });

        // Merge user's submissions with other users' submissions, eliminating duplicate IDs
        const nonConflictingOthers = otherUsersItems.filter(i => !seenUserIds.has(String(i.id)));

        const combined = [...dedupedUserSubs, ...nonConflictingOthers];

        localStorage.setItem(MEDIA_SUBMISSIONS_STORAGE_KEY, JSON.stringify(combined));
        localStorage.setItem('mediaTeamSubmissions_v1', JSON.stringify(combined));
    } catch (e) {
        console.warn('Error saving media submissions:', e);
    }
}
