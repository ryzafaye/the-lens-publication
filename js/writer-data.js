/**
 * ============================================================================
 * THE LENS — WRITER DATA MANAGEMENT
 * Shared Articles & State Persistence for Staff Writers
 * Supports both rich HTML content and plain text safely without entity corruption.
 * ============================================================================
 */

const WRITER_DATA_STORAGE_KEY = 'theLensWriterArticles_v3';

const DEFAULT_WRITER_ARTICLES = [];

// Helper to decode multi-encoded HTML entities (e.g. &amp;lt;span -> <span)
function decodeCorruptedHtmlEntities(str) {
    if (!str || typeof str !== 'string') return '';
    let decoded = str;
    let maxPasses = 5;
    while (maxPasses > 0 && (/&amp;lt;/i.test(decoded) || /&lt;/i.test(decoded) || /&amp;gt;/i.test(decoded) || /&gt;/i.test(decoded))) {
        if (typeof document !== 'undefined') {
            const txt = document.createElement('textarea');
            txt.innerHTML = decoded;
            const newDecoded = txt.value;
            if (newDecoded === decoded) break;
            decoded = newDecoded;
        } else {
            decoded = decoded
                .replace(/&amp;lt;/g, '<')
                .replace(/&amp;gt;/g, '>')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;quot;/g, '"')
                .replace(/&quot;/g, '"')
                .replace(/&amp;amp;/g, '&');
        }
        maxPasses--;
    }
    return decoded;
}

// Helper to extract clean plain text from content for preview/reading time
function cleanArticleContentText(content) {
    if (!content) return '';
    const decoded = decodeCorruptedHtmlEntities(content);
    return decoded
        .replace(/<div><br\s*\/?><\/div>/gi, '\n\n')
        .replace(/<\/(?:div|p|blockquote|h[1-6])>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();
}

// Helper to get active writer ID
function getActiveWriterId() {
    try {
        const storedId = localStorage.getItem('writerId');
        if (storedId) return storedId;
        const storedName = localStorage.getItem('userName');
        if (storedName && storedName.includes('Marco')) return 'marco-valderrama';
    } catch (e) {}
    return 'sofia-alcaraz';
}

function loadAllWriterArticles() {
    try {
        const raw = localStorage.getItem(WRITER_DATA_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                let needsResave = false;
                const cleaned = parsed.map(a => {
                    if (a.content && (/&amp;lt;/i.test(a.content) || /&lt;/i.test(a.content))) {
                        const healedContent = decodeCorruptedHtmlEntities(a.content);
                        if (healedContent !== a.content) {
                            needsResave = true;
                            return { ...a, content: healedContent };
                        }
                    }
                    return a;
                });
                if (needsResave) {
                    saveAllWriterArticles(cleaned);
                }
                return cleaned;
            }
        }
    } catch (e) {
        console.warn('Could not read ' + WRITER_DATA_STORAGE_KEY, e);
    }
    const fresh = JSON.parse(JSON.stringify(DEFAULT_WRITER_ARTICLES));
    saveAllWriterArticles(fresh);
    return fresh;
}

function saveAllWriterArticles(articles) {
    try {
        localStorage.setItem(WRITER_DATA_STORAGE_KEY, JSON.stringify(articles));
    } catch (e) {
        console.error('Could not save ' + WRITER_DATA_STORAGE_KEY, e);
    }
}

// Return ONLY the articles authored by the active writer
function getMyArticles(writerId = getActiveWriterId()) {
    const all = loadAllWriterArticles();
    return all.filter(a => a.writerId === writerId);
}
