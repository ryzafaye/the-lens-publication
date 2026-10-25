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

// Seed Articles for Raphael Luna
const DEFAULT_CARTOONIST_ARTICLES = [
    {
        id: 'cart-art-01',
        writerId: 'raphael-luna',
        author: 'Raphael Luna',
        title: 'The Satirical Ink: How Campus Editorial Cartoons Shape Student Discourse',
        category: 'Features',
        excerpt: 'Exploring the lineage of satirical newspaper caricature and how bold line work distills university bureaucracy into biting civic critique.',
        date: 'Oct 22, 2026',
        rawDate: '2026-10-22',
        status: 'Published',
        views: 2890,
        shares: 140,
        remarks: '',
        content: `Caricature is often perceived as mere exaggeration, but in campus journalism, it represents a razor-sharp editorial scalpel. When university councils debate budget allocations or tuition restructuring behind closed committee doors, a single visual metaphor can illuminate power dynamics faster than a two-thousand-word treatise.\n\nA cartoon does not merely summarize the news; it takes a definitive ideological stand. By magnifying facial gestures, framing bureaucratic inertia through symbolic props, and confronting administrative decisions head-on, the editorial cartoonist ensures that campus issues remain uncomfortably impossible to ignore.\n\n"Editorial sketching is visual truth-telling without the camouflage of diplomatic rhetoric," as the publication handbook instructs.`
    },
    {
        id: 'cart-art-02',
        writerId: 'raphael-luna',
        author: 'Raphael Luna',
        title: 'Behind the Sketchpad: Anatomy of an Investigative Political Cartoon',
        category: 'Opinion',
        excerpt: 'From rapid thumbnail roughs to high-contrast ink: the editorial and legal verification process behind weekly satire.',
        date: 'Oct 23, 2026',
        rawDate: '2026-10-23',
        status: 'Pending Review',
        views: 0,
        shares: 0,
        remarks: '',
        content: `Before any cartoon reaches the prepress plate, hours of investigative synthesis must take place. Cartoonists examine committee transcripts, cross-reference policy memos, and identify the central contradiction at the heart of the headline.\n\nTechnically, every stroke must withstand rigorous defamation review while preserving maximum punch. In this retrospective, we deconstruct three major editorial strips from draft conception to front-page ink.`
    },
    {
        id: 'cart-art-03',
        writerId: 'raphael-luna',
        author: 'Raphael Luna',
        title: 'Symbolism and Caricature in Campus Press Freedom',
        category: 'Opinion',
        excerpt: 'Why headline placement, line weight contrast, and metaphorical subtlety dictate reader retention across print tabloids.',
        date: 'Oct 20, 2026',
        rawDate: '2026-10-20',
        status: 'For Revision',
        views: 0,
        shares: 0,
        remarks: 'Please refine the caricature facial contrast and amplify the pen-tip symbolism for print reproduction.',
        content: `Visual balance is the backbone of caricature. Readers absorb visual metaphors within three seconds, demanding clean silhouettes and clear spatial hierarchy.\n\nBalancing primary visual focal points with contextual background subtext ensures essential student commentary communicates with force.`
    }
];

// Seed Cartoon Submissions for Raphael Luna (Covering all 4 official statuses)
const DEFAULT_CARTOON_SUBMISSIONS = [
    {
        id: 'cart-s01',
        type: 'cartoon',
        title: 'The 24-Unit Burden: Faculty Overload & Administrative Deadlines',
        category: 'News',
        artist: 'Raphael Luna',
        uploaderRole: 'Cartoonist',
        image: 'images/covers/faculty-overload-cartoon.svg',
        date: 'Oct 12, 2026',
        rawDate: '2026-10-12',
        fileSize: '410 KB',
        status: 'Published',
        remarks: 'Approved for publication alongside the student council budget hearing report.',
        connectedArticleId: '1',
        connectedArticleTitle: 'Student council opens budget hearing to all colleges',
        connectedArticleExcerpt: 'The annual budget hearing will be livestreamed and open to every student organization for the first time.',
        connectedArticleAuthor: 'Mara Villanueva',
        connectedArticleCategory: 'News',
        connectedArticleDate: 'Oct 12, 2026',
        connectedArticleUrl: 'article.html?id=1',
        views: 2150,
        readTime: '2 min read',
        shares: 0
    },
    {
        id: 'cart-s02',
        type: 'cartoon',
        title: 'Midnight Study Shift & Exam Week Sanctuary',
        category: 'Features',
        artist: 'Raphael Luna',
        uploaderRole: 'Cartoonist',
        image: 'images/covers/midnight-study-cartoon.svg',
        date: 'Oct 11, 2026',
        rawDate: '2026-10-11',
        fileSize: '530 KB',
        status: 'Published',
        remarks: 'Published live alongside the campus library overnight feature.',
        connectedArticleId: '4',
        connectedArticleTitle: "Inside the campus library's overnight study shift",
        connectedArticleExcerpt: 'A closer look at the students and staff who keep quiet study spaces welcoming during exam week.',
        connectedArticleAuthor: 'Lia Mendoza',
        connectedArticleCategory: 'Features',
        connectedArticleDate: 'Oct 11, 2026',
        connectedArticleUrl: 'article.html?id=4',
        views: 1625,
        readTime: '2 min read',
        shares: 0
    },
    {
        id: 'cart-s02b',
        type: 'cartoon',
        title: 'Enrollment Portal Peak Traffic & Server Bandwidth Graphic',
        category: 'Science and Technology',
        artist: 'Raphael Luna',
        uploaderRole: 'Cartoonist',
        image: 'images/covers/portal-pubmat.svg',
        date: 'Oct 11, 2026',
        rawDate: '2026-10-11',
        fileSize: '490 KB',
        status: 'Published',
        remarks: 'Published live on the portal tech desk.',
        connectedArticleId: '7',
        connectedArticleTitle: 'Why the enrollment portal keeps timing out',
        connectedArticleExcerpt: 'Students share their experiences with peak-hour traffic as IT reviews ways to improve server bandwidth.',
        connectedArticleAuthor: 'Noah Reyes',
        connectedArticleCategory: 'Science and Technology',
        connectedArticleDate: 'Oct 11, 2026',
        connectedArticleUrl: 'article.html?id=7',
        views: 1384,
        readTime: '1 min read',
        shares: 0
    },
    {
        id: 'cart-s03',
        type: 'cartoon',
        title: 'Tuition & Student Welfare Editorial Cartoon',
        category: 'Opinion',
        artist: 'Raphael Luna',
        uploaderRole: 'Cartoonist',
        image: 'images/covers/press-freedom-cartoon.svg',
        date: 'Oct 10, 2026',
        rawDate: '2026-10-10',
        fileSize: '480 KB',
        status: 'Published',
        remarks: 'Published live alongside the student welfare opinion column.',
        connectedArticleId: '10',
        connectedArticleTitle: 'Opinion: Cheaper cafeteria meals are a basic need',
        connectedArticleExcerpt: 'Affordable food on campus should be part of the core conversation about student welfare.',
        connectedArticleAuthor: 'Paolo Santos',
        connectedArticleCategory: 'Opinion',
        connectedArticleDate: 'Oct 10, 2026',
        connectedArticleUrl: 'article.html?id=10',
        views: 996,
        readTime: '1 min read',
        shares: 1
    },
    {
        id: 'cart-s04',
        type: 'cartoon',
        title: 'Quadrangle Mobilization & Press Freedom Strip',
        category: 'News',
        artist: 'Raphael Luna',
        uploaderRole: 'Cartoonist',
        image: 'images/covers/photo-quadrangle-rally.svg',
        date: 'Oct 23, 2026',
        rawDate: '2026-10-23',
        fileSize: '460 KB',
        status: 'Pending with Head',
        remarks: ''
    },
    {
        id: 'cart-s05',
        type: 'cartoon',
        title: 'Varsity Spirit & Athletic Championship Cartoon',
        category: 'Sports',
        artist: 'Raphael Luna',
        uploaderRole: 'Cartoonist',
        image: 'images/covers/photo-cheering-varsity.svg',
        date: 'Oct 21, 2026',
        rawDate: '2026-10-21',
        fileSize: '510 KB',
        status: 'Returned for Revision',
        remarks: 'Please update the athletic mascot uniform colors to match official university burgundy.'
    },
    {
        id: 'cart-s06',
        type: 'cartoon',
        title: 'Campus Laboratory & Science Discovery Illustration',
        category: 'Science and Technology',
        artist: 'Raphael Luna',
        uploaderRole: 'Cartoonist',
        image: 'images/covers/photo-laboratory-research.svg',
        date: 'Oct 24, 2026',
        rawDate: '2026-10-24',
        fileSize: '475 KB',
        status: 'EIC Approved',
        remarks: 'EIC Approved for scheduled release.'
    }
];

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
    if (s === 'EIC Approved' || s === 'eic_approved' || s === 'approved_for_mpc') {
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
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.warn('Error reading cartoonist articles:', e);
    }
    localStorage.setItem(CARTOONIST_ARTICLES_STORAGE_KEY, JSON.stringify(DEFAULT_CARTOONIST_ARTICLES));
    return DEFAULT_CARTOONIST_ARTICLES;
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
        } else {
            list = [...DEFAULT_CARTOON_SUBMISSIONS];
        }

        // Merge defaults
        DEFAULT_CARTOON_SUBMISSIONS.forEach(seed => {
            const existingIdx = list.findIndex(existing => existing.id === seed.id);
            if (existingIdx !== -1) {
                const safeImage = (list[existingIdx].image && !list[existingIdx].image.includes('maroon.jpg'))
                    ? list[existingIdx].image
                    : seed.image;

                list[existingIdx] = {
                    ...seed,
                    ...list[existingIdx],
                    image: safeImage,
                    connectedArticleTitle: list[existingIdx].connectedArticleTitle || seed.connectedArticleTitle,
                    connectedArticleExcerpt: list[existingIdx].connectedArticleExcerpt || seed.connectedArticleExcerpt,
                    connectedArticleAuthor: list[existingIdx].connectedArticleAuthor || seed.connectedArticleAuthor,
                    connectedArticleCategory: list[existingIdx].connectedArticleCategory || seed.connectedArticleCategory,
                    connectedArticleDate: list[existingIdx].connectedArticleDate || seed.connectedArticleDate,
                    connectedArticleUrl: list[existingIdx].connectedArticleUrl || seed.connectedArticleUrl,
                    views: list[existingIdx].views !== undefined ? list[existingIdx].views : seed.views,
                    readTime: list[existingIdx].readTime || seed.readTime || '2 min read',
                    shares: list[existingIdx].shares !== undefined ? list[existingIdx].shares : (seed.shares || 0)
                };
            } else {
                list.push({ ...seed });
            }
        });

        // Ensure images are valid
        list = list.map(item => {
            const seed = DEFAULT_CARTOON_SUBMISSIONS.find(s => s.id === item.id);
            const safeImg = (item.image && !item.image.includes('maroon.jpg'))
                ? item.image
                : (seed ? seed.image : 'images/covers/faculty-overload-cartoon.svg');
            return {
                ...item,
                image: safeImg,
                status: normalizeCartoonStatus(item.status)
            };
        });

        localStorage.setItem(CARTOONIST_SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));

        // Check review queue
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
                            remarks: match.remarks || item.remarks 
                        };
                    }
                    return item;
                });
            }
        }

        return list;
    } catch (e) {
        console.warn('Error reading cartoon submissions:', e);
        return DEFAULT_CARTOON_SUBMISSIONS;
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
