/**
 * ============================================================================
 * THE LENS — CARTOONIST DATA MANAGEMENT (cartoon-data.js)
 * Shared Articles & Media Assets Management for Cartoonist Portal
 * Official Cartoon Statuses:
 *   - 'Pending with Head'
 *   - 'Pending EIC Review'
 *   - 'Returned for Revision'
 *   - 'EIC Approved'
 *   - 'Published'
 * ============================================================================
 */

const CARTOONIST_SUBMISSIONS_STORAGE_KEY = 'cartoonistSubmissions_v1';
const CARTOON_REVIEW_QUEUE_KEY = 'articleCoverReviewQueue_v1';

/**
 * Standardize any status value to official statuses:
 * 1. 'Pending with Head'
 * 2. 'Pending EIC Review'
 * 3. 'Returned for Revision'
 * 4. 'EIC Approved'
 * 5. 'Published'
 */
function normalizeCartoonStatus(rawStatus) {
    if (!rawStatus) return 'Pending with Head';
    const s = String(rawStatus).trim();

    if (s === 'Published' || s === 'published') {
        return 'Published';
    }
    if (s === 'EIC Approved' || s === 'eic_approved' || s === 'approved_for_mpc' || s === 'approved') {
        return 'EIC Approved';
    }
    if (s.toLowerCase().includes('return') || s.toLowerCase().includes('revision') || s === 'returned' || s === 'needs_revision') {
        return 'Returned for Revision';
    }
    if (s === 'Pending EIC Review' || s === 'forwarded to eic' || s === 'Forwarded to EIC' || s === 'submitted_to_eic') {
        return 'Pending EIC Review';
    }
    if (s === 'Pending with Head' || s === 'Pending Cartoonist Review' || s === 'pending' || s === 'submitted_to_mpc' || s === 'under-review') {
        return 'Pending with Head';
    }
    return s;
}

// =============================================================================
// USER IDENTITY & SUBMISSION SCOPING (CARTOONIST ROLE PARITY)
// Guarantees each Cartoonist account sees their own submitted cartoons
// =============================================================================

function normalizeCartoonTextName(name) {
    if (!name) return '';
    return String(name).trim().toLowerCase().replace(/\s+/g, ' ');
}

function getCurrentCartoonistUserIdentity() {
    const userId = window.LARAVEL_USER_ID 
        || localStorage.getItem('cartoonistUserId') 
        || localStorage.getItem('userId') 
        || '';
    const studentNum = window.LARAVEL_STUDENT_NUMBER 
        || localStorage.getItem('cartoonistStudentNumber') 
        || localStorage.getItem('studentNumber') 
        || '';
    const userName = window.LARAVEL_USER_NAME 
        || localStorage.getItem('cartoonistName') 
        || localStorage.getItem('userName') 
        || '';
    return {
        userId: userId ? String(userId).trim() : '',
        studentNum: studentNum ? String(studentNum).trim().toLowerCase() : '',
        userName: normalizeCartoonTextName(userName)
    };
}

function isCurrentUserCartoonSubmission(item, identity) {
    if (!item) return false;
    const { userId, studentNum, userName } = identity || getCurrentCartoonistUserIdentity();

    // 1. Primary: Explicit userId match
    if (userId && item.userId) {
        return String(item.userId).trim() === userId;
    }

    // 2. Secondary: Explicit student number match
    const itemStudentNum = String(item.userStudentNumber || item.studentNumber || '').trim().toLowerCase();
    if (studentNum && itemStudentNum) {
        return itemStudentNum === studentNum;
    }

    // 3. Fallback: Artist or Author name match (for backward compatibility)
    const itemArtist = normalizeCartoonTextName(item.artist || item.author || '');
    if (userName && itemArtist) {
        const genericNames = ['cartoonist', 'staff cartoonist', 'cartoonist member', 'user', 'author', 'admin'];
        if (genericNames.includes(userName) || genericNames.includes(itemArtist)) {
            return false;
        }

        if (itemArtist === userName) {
            return true;
        }

        const partsA = itemArtist.split(' ').filter(p => p.length > 1);
        const partsB = userName.split(' ').filter(p => p.length > 1);
        if (partsA.length >= 2 && partsB.length >= 2) {
            if (partsA[0] === partsB[0] && partsA[partsA.length - 1] === partsB[partsB.length - 1]) {
                return true;
            }
        }
    }

    // If item has no explicit user markers (legacy seed/first item), fallback to true so user can view
    if (!item.userId && !item.userStudentNumber && !item.studentNumber && (!item.artist || item.artist === 'Staff Cartoonist' || item.artist === 'Cartoonist')) {
        return true;
    }

    return false;
}

// =============================================================================
// SUBMISSIONS DATA METHODS
// =============================================================================

function getAllRawCartoonSubmissions() {
    try {
        let list = [];
        const raw = localStorage.getItem(CARTOONIST_SUBMISSIONS_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) list = parsed;
        }

        // Also check review queue for any cartoons not yet in cartoonistSubmissions_v1
        const reviewRaw = localStorage.getItem(CARTOON_REVIEW_QUEUE_KEY);
        if (reviewRaw) {
            try {
                const reviewQueue = JSON.parse(reviewRaw);
                if (Array.isArray(reviewQueue)) {
                    reviewQueue.forEach(q => {
                        if (!q || !q.id) return;
                        const t = (q.type || '').toLowerCase();
                        if (t === 'cartoon' || t === 'cartoons') {
                            const match = list.find(item => String(item.id) === String(q.id));
                            if (match) {
                                match.status = normalizeCartoonStatus(q.status || match.status);
                                if (q.remarks) match.remarks = q.remarks;
                                if (q.endorsedBy) match.endorsedBy = q.endorsedBy;
                                if (q.approvedBy) match.approvedBy = q.approvedBy;
                            } else if (q.image) {
                                list.push({
                                    ...q,
                                    status: normalizeCartoonStatus(q.status)
                                });
                            }
                        }
                    });
                }
            } catch (err) {}
        }

        // Normalize status
        list = list.map(item => ({
            ...item,
            status: normalizeCartoonStatus(item.status)
        }));

        // Filter genuine items (must have valid image and not be a placeholder)
        list = list.filter(item => {
            if (!item || !item.image) return false;
            const img = String(item.image).trim();
            if (img.includes('maroon.jpg')) return false;
            return true;
        });

        // Strict deduplication by ID
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
        console.warn('Error reading raw cartoon submissions:', e);
        return [];
    }
}

/**
 * Returns cartoon submissions.
 * When called inside Cartoonist views, scopes strictly to current user identity.
 */
function getCartoonSubmissions(filterByUser = true) {
    let source = [];
    if (window.INITIAL_CARTOONS && Array.isArray(window.INITIAL_CARTOONS) && window.INITIAL_CARTOONS.length > 0) {
        source = window.INITIAL_CARTOONS;
    } else if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA) && window.INITIAL_DATA.length > 0) {
        source = window.INITIAL_DATA;
    } else {
        source = getAllRawCartoonSubmissions();
    }

    if (!filterByUser) {
        return source;
    }

    const identity = getCurrentCartoonistUserIdentity();
    if (identity.userId || identity.studentNum || identity.userName) {
        const filtered = source.filter(item => isCurrentUserCartoonSubmission(item, identity));
        // If identity filtering yields items, return them. If not and source has items without userId, return source
        if (filtered.length > 0) return filtered;
        return source.filter(item => isCurrentUserCartoonSubmission(item, identity));
    }

    return source;
}

function saveCartoonSubmissions(submissions) {
    try {
        localStorage.setItem(CARTOONIST_SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
    } catch (e) {
        console.warn('Error saving cartoon submissions:', e);
    }
}
