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
const DEFAULT_MEDIA_ARTICLES = [
    {
        id: 'art-m01',
        writerId: 'alyssa-dizon',
        author: 'Alyssa Marie Dizon',
        title: 'Framing the Narrative: Visual Storytelling & Infographic Ethics in Campus Journalism',
        category: 'Features',
        excerpt: 'How student newsrooms leverage data visualization, color psychology, and rigorous statistical verification to communicate complex university issues.',
        date: 'Oct 22, 2026',
        rawDate: '2026-10-22',
        status: 'Published',
        views: 3420,
        shares: 285,
        remarks: '',
        content: `In an era of rapid information consumption, visual journalism serves as both a hook and an anchor for investigative reporting. When complex university budget allocations or tuition restructuring plans are unveiled, walls of text can often obscure critical insights.\n\nThrough rigorous data visualization and intentional typography, publication materials distill intricate administrative figures into accessible civic knowledge. However, designers must adhere to stringent ethical standards: chart scales must remain uncompressed, source citations must be transparent, and aesthetic flair must never supersede factual accuracy.\n\n"A well-crafted infographic does not merely decorate an article; it functions as an autonomous piece of journalism that holds power to account," notes the media board editorial guidelines.`
    },
    {
        id: 'art-m02',
        writerId: 'alyssa-dizon',
        author: 'Alyssa Marie Dizon',
        title: 'Digital Canvas: Evaluating Modern Graphic Design Tools for Student Publications',
        category: 'Science and Technology',
        excerpt: 'A comprehensive comparative breakdown of open-source vector software versus industry-standard creative suites for campus media teams.',
        date: 'Oct 23, 2026',
        rawDate: '2026-10-23',
        status: 'Pending Review',
        views: 0,
        shares: 0,
        remarks: '',
        content: `As student publications navigate fluctuating operating budgets, creative desks face recurring software licensing dilemmas. Transitioning between proprietary suites and open-source alternatives involves assessing collaborative workflows, typography rendering engines, and prepress CMYK compatibility.\n\nThis review benchmarks leading vector illustration software on real-world newsroom turnaround times, highlighting how cloud-based real-time co-editing is revolutionizing overnight layout deadlines.`
    },
    {
        id: 'art-m03',
        writerId: 'alyssa-dizon',
        author: 'Alyssa Marie Dizon',
        title: 'The Power of Visual Hierarchy in Headline Typography',
        category: 'Features',
        excerpt: 'Why headline placement, weight contrast, and leading dictate reader retention across print tabloids and digital social cards.',
        date: 'Oct 20, 2026',
        rawDate: '2026-10-20',
        status: 'For Revision',
        views: 0,
        shares: 0,
        remarks: 'Please add practical visual examples comparing serif vs sans-serif headers in print banners before final approval.',
        content: `Visual hierarchy is the invisible architecture of journalism. When a reader opens a newspaper or scrolls past a digital pubmat, their eye is directed not by accident, but by conscious typographic orchestration.\n\nBalancing primary headlines with clear contextual decks ensures that essential news reaches readers even during a brief three-second glance.`
    }
];

// Seed Media Submissions for Alyssa Marie Dizon (Covering all 4 official statuses)
const DEFAULT_MEDIA_SUBMISSIONS = [
    {
        id: 'med-s01',
        type: 'pubmat',
        title: '2026 University Student Council Election Schedule',
        category: 'News',
        artist: 'Alyssa Marie Dizon',
        uploaderRole: 'Media & Communication',
        image: 'images/covers/election-guidelines.svg',
        date: 'Oct 22, 2026',
        rawDate: '2026-10-22',
        fileSize: '420 KB',
        status: 'Published',
        remarks: 'Approved for official release across campus bulletin boards and digital portal.'
    },
    {
        id: 'med-s02',
        type: 'pubmat',
        title: 'Mental Health Awareness Month Official Infographic Banner',
        category: 'Features',
        artist: 'Alyssa Marie Dizon',
        uploaderRole: 'Media & Communication',
        image: 'images/covers/sanitation-pubmat.svg',
        date: 'Oct 23, 2026',
        rawDate: '2026-10-23',
        fileSize: '512 KB',
        status: 'Pending with Head',
        remarks: ''
    },
    {
        id: 'med-s03',
        type: 'pubmat',
        title: 'University Sportsfest 2026 Opening Ceremony Graphic',
        category: 'Sports',
        artist: 'Alyssa Marie Dizon',
        uploaderRole: 'Media & Communication',
        image: 'images/covers/press-freedom-cartoon.svg',
        date: 'Oct 21, 2026',
        rawDate: '2026-10-21',
        fileSize: '680 KB',
        status: 'Returned for Revision',
        remarks: 'Please update the official university logo lockup on the top left and increase font contrast on the event schedule timetable.'
    },
    {
        id: 'med-s04',
        type: 'pubmat',
        title: 'Campus Sustainability & Waste Audit Data Graphic',
        category: 'Infographics',
        artist: 'Alyssa Marie Dizon',
        uploaderRole: 'Media & Communication',
        image: 'images/covers/sanitation-pubmat.svg',
        date: 'Oct 24, 2026',
        rawDate: '2026-10-24',
        fileSize: '490 KB',
        status: 'EIC Approved',
        remarks: 'Executive Board endorsement complete. Stored in media library for scheduled release.'
    }
];

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
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.warn('Error reading media articles:', e);
    }
    localStorage.setItem(MEDIA_ARTICLES_STORAGE_KEY, JSON.stringify(DEFAULT_MEDIA_ARTICLES));
    return DEFAULT_MEDIA_ARTICLES;
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
            // Check legacy v1 key and migrate if exists
            const legacyV1 = localStorage.getItem('mediaTeamSubmissions_v1');
            if (legacyV1) {
                try {
                    const parsedLegacy = JSON.parse(legacyV1);
                    if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
                        list = parsedLegacy.map(item => ({
                            ...item,
                            status: normalizeMediaStatus(item.status)
                        }));
                        // Ensure all 4 seeds are represented
                        DEFAULT_MEDIA_SUBMISSIONS.forEach(seed => {
                            if (!list.some(existing => existing.id === seed.id)) {
                                list.push(seed);
                            }
                        });
                    }
                } catch (e) {
                    list = [...DEFAULT_MEDIA_SUBMISSIONS];
                }
            } else {
                list = [...DEFAULT_MEDIA_SUBMISSIONS];
            }
            localStorage.setItem(MEDIA_SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));
        }

        // Also check if any item in review queue was approved or returned by M&PC Head
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
        return DEFAULT_MEDIA_SUBMISSIONS;
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
