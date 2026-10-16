/* =========================================================
   THE LENS — PUBLIC WEBSITE
   File: js/script.js

   IMPORTANT:
   1. This file is shared by index.html and archives.html.
   2. Replace your old JavaScript with this entire file.
   3. Sample articles are stored in the articles array.
   4. All sample article images use images/news.jpg.
   ========================================================= */


/* =========================================================
   1. ARTICLE DATA (3 EXAMPLES PER CATEGORY)
   ========================================================= */

const articles = [
    // --- NEWS (3 ARTICLES) ---
    {
        id: 1,
        category: "News",
        date: "Oct 12, 2026",
        views: 2140,
        title: "Student council opens budget hearing to all colleges",
        excerpt: "The annual budget hearing will be livestreamed and open to every student organization for the first time.",
        author: "Mara Villanueva",
        image: "images/maroon.jpg",
        color: "#571525",
        tags: ["student council", "budget", "campus"],
        content: `The annual student council budget hearing will be livestreamed and open to every student organization for the first time.\n\nThe hearing will give students an opportunity to learn about proposed expenses, ask questions, and understand how student funds are allocated.`
    },
    {
        id: 2,
        category: "News",
        date: "Oct 08, 2026",
        views: 870,
        title: "Campus clinic extends hours for midterm week",
        excerpt: "Students can now walk in until 9 PM while examinations are ongoing.",
        author: "Mara Villanueva",
        image: "images/maroon.jpg",
        color: "#571525",
        tags: ["clinic", "midterms", "student services"],
        content: `The campus clinic has announced extended operating hours for midterm week.\n\nStudents should confirm the official schedule and available services with the clinic before visiting.`
    },
    {
        id: 3,
        category: "News",
        date: "Oct 04, 2026",
        views: 1420,
        title: "University unveils new sustainable green park project",
        excerpt: "The campus development board breaks ground on a eco-friendly communal pavilion.",
        author: "Gabriel Santos",
        image: "images/maroon.jpg",
        color: "#571525",
        tags: ["campus", "environment", "infrastructure"],
        content: `A new green pavilion project aimed at providing outdoor study areas break ground today.\n\nThe project is expected to complete by the start of next semester.`
    },

    // --- FEATURES (3 ARTICLES) ---
    {
        id: 4,
        category: "Features",
        date: "Oct 11, 2026",
        views: 1620,
        title: "Inside the campus library's overnight study shift",
        excerpt: "A closer look at the students and staff who keep quiet study spaces welcoming during exam week.",
        author: "Lia Mendoza",
        image: "images/maroon.jpg",
        color: "#571525",
        tags: ["library", "students", "exams"],
        content: `During exam week, the campus library becomes a shared space for students preparing for their examinations.\n\nThis feature explores the experiences of students and staff who help maintain a welcoming study environment.`
    },
    {
        id: 5,
        category: "Features",
        date: "Oct 07, 2026",
        views: 1120,
        title: "A day in the life of a student photographer",
        excerpt: "From dawn rehearsals to night events, one lens covers every single moment.",
        author: "Lia Mendoza",
        image: "images/maroon.jpg",
        color: "#65162d",
        tags: ["photography", "student life", "media"],
        content: `Student photographers document campus life, from rehearsals to major events.\n\nThis feature explores their preparation, deadlines, and the passion behind every published photograph.`
    },
    {
        id: 6,
        category: "Features",
        date: "Oct 02, 2026",
        views: 1950,
        title: "The unsung heroes behind the campus cafeteria",
        excerpt: "Meet the kitchen staff who feed thousands of students every single weekday.",
        author: "Lia Mendoza",
        image: "images/maroon.jpg",
        color: "#65162d",
        tags: ["cafeteria", "community", "feature"],
        content: `Behind every warm meal on campus is a dedicated team waking up before dawn.\n\nWe sat down with the head chef to discuss how the kitchen operates under peak rush hours.`
    },

    // --- OPINION (3 ARTICLES) ---
    {
        id: 7,
        category: "Opinion",
        date: "Oct 10, 2026",
        views: 990,
        title: "Opinion: Cheaper cafeteria meals are a basic need",
        excerpt: "Affordable food on campus should be part of the core conversation about student welfare.",
        author: "Paolo Santos",
        image: "images/maroon.jpg",
        color: "#592014",
        tags: ["opinion", "cafeteria", "student welfare"],
        content: `Access to affordable meals is an important part of student welfare.\n\nThis opinion article discusses why cafeteria prices matter to students and encourages a conversation about affordable food options.`
    },
    {
        id: 8,
        category: "Opinion",
        date: "Oct 06, 2026",
        views: 650,
        title: "Opinion: Group projects need clearer grading rubrics",
        excerpt: "When one student carries the whole team, the grading scheme has failed.",
        author: "Paolo Santos",
        image: "images/maroon.jpg",
        color: "#592014",
        tags: ["opinion", "group work", "grading"],
        content: `Group projects can teach students collaboration, but unclear expectations may make it difficult to assess individual contributions fairly.\n\nThis opinion piece encourages discussion about transparent rubrics and meaningful feedback.`
    },
    {
        id: 9,
        category: "Opinion",
        date: "Oct 01, 2026",
        views: 1210,
        title: "Opinion: Why mental health days should be institutionalized",
        excerpt: "Academic rigor shouldn't come at the cost of total physical and mental burnout.",
        author: "Paolo Santos",
        image: "images/maroon.jpg",
        color: "#592014",
        tags: ["opinion", "mental health", "academics"],
        content: `Integrating wellness days into the academic calendar allows students time to recharge and reflect, ultimately boosting overall academic performance and well-being.`
    },

    // --- SCIENCE & TECHNOLOGY (3 ARTICLES) ---
    {
        id: 10,
        category: "Science and Technology",
        date: "Oct 11, 2026",
        views: 1380,
        title: "Why the enrollment portal keeps timing out",
        excerpt: "Students share their experiences with peak-hour traffic as IT reviews ways to improve server bandwidth.",
        author: "Noah Reyes",
        image: "images/maroon.jpg",
        color: "#65162d",
        tags: ["technology", "enrollment", "portal"],
        content: `Some students have reported delays when accessing the enrollment portal during busy periods.\n\nThis article discusses verified causes, official statements, and practical recommendations for students.`
    },
    {
        id: 11,
        category: "Science and Technology",
        date: "Oct 05, 2026",
        views: 540,
        title: "Small digital habits that help protect student accounts",
        excerpt: "Simple cybersecurity steps can make school accounts significantly more secure.",
        author: "Noah Reyes",
        image: "images/maroon.jpg",
        color: "#65162d",
        tags: ["cybersecurity", "digital safety", "technology"],
        content: `Strong, unique passwords and caution around suspicious links can help protect online accounts.\n\nStudents should follow official school IT guidance and enable additional security protections.`
    },
    {
        id: 12,
        category: "Science and Technology",
        date: "Sep 29, 2026",
        views: 1880,
        title: "Engineering team wins national award for eco-rover",
        excerpt: "A student-designed autonomous vehicle takes home top honors in clean energy innovation.",
        author: "Noah Reyes",
        image: "images/maroon.jpg",
        color: "#65162d",
        tags: ["engineering", "innovation", "awards"],
        content: `The university robotics team scored first place in the national engineering challenge with their solar-powered water filtration rover.`
    },

    // --- LITERATURE (3 ARTICLES) ---
    {
        id: 13,
        category: "Literature",
        date: "Oct 09, 2026",
        views: 760,
        title: "Hollow Rooms: a poem for the night shift",
        excerpt: "A quiet poem about long evenings, unfinished notes, and finding hope before morning.",
        author: "Elena Cruz",
        image: "images/maroon.jpg",
        color: "#571525",
        tags: ["poetry", "literature", "creative writing"],
        content: `The hallway holds its breath at night,\nA desk lamp guards a pool of light.\nThe clock moves on, the pages turn,\nAnd still there is a hope to learn.`
    },
    {
        id: 14,
        category: "Literature",
        date: "Oct 03, 2026",
        views: 430,
        title: "Letters left between the pages",
        excerpt: "A short literary piece about memory, friendship, and the words we keep.",
        author: "Elena Cruz",
        image: "images/maroon.jpg",
        color: "#571525",
        tags: ["creative writing", "literature"],
        content: `Some words stay with us long after the page has been closed.\n\nThis piece explores old notes found inside secondhand library textbooks.`
    },
    {
        id: 15,
        category: "Literature",
        date: "Sep 27, 2026",
        views: 890,
        title: "Echoes of the Quadrangle",
        excerpt: "Reflections on passing time and changing seasons across the historic campus courtyard.",
        author: "Elena Cruz",
        image: "images/maroon.jpg",
        color: "#571525",
        tags: ["prose", "literature"],
        content: `Leaves gather in the corners of stone benches as generations of students walk past the old bell tower.`
    }
];

/* =========================================================
   2. HELPER FUNCTIONS
   Reusable functions for displaying article information.
   ========================================================= */

// Safely display text without interpreting it as HTML.
function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return replacements[character];
    });
}


// Find an article using its ID.
function getArticle(id) {
    return articles.find(article => article.id === Number(id));
}


// Format article details for the featured article and modal.
function articleMeta(article) {
    return `
        <div class="article-meta flex items-center gap-2 text-[10px] tracking-wider uppercase font-semibold mb-3">
            <span class="text-[#700f2b] font-bold">
                ${escapeHTML(article.category)}
            </span>
            <span class="text-stone-400">|</span>
            <span class="text-stone-500">${escapeHTML(article.date)}</span>
            <span class="text-stone-400">|</span>
            <span class="text-stone-500">${Number(article.views || 0).toLocaleString()} views</span>
        </div>
    `;
}


// Display an article image or a colored placeholder.
function createImage(article, imageClass = "") {
    const title = escapeHTML(article.title);
    const color = escapeHTML(article.color || "#571525");

    if (article.image) {
        return `
            <div class="article-image ${imageClass}"
                 style="--image-color: ${color}">

                <img
                    src="${escapeHTML(article.image)}"
                    alt="${title}"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                >

                <div class="image-placeholder"
                     style="display:none">
                    <span>${title}</span>
                </div>
            </div>
        `;
    }

    return `
        <div class="article-image ${imageClass}"
             style="--image-color: ${color}">

            <div class="image-placeholder">
                <span>${title}</span>
            </div>
        </div>
    `;
}


// Create a clickable article title.
function articleTitle(article, className = "") {
    return `
        <button
            type="button"
            class="article-title-button ${className}"
            data-article-id="${article.id}">

            ${escapeHTML(article.title)}
        </button>
    `;
}


// Sort articles from newest to oldest.
function getNewestArticles(list) {
    return [...list].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
}


/* =========================================================
   3. FEATURED ARTICLE
   Homepage only.
   ========================================================= */

function displayFeaturedArticle() {
    const container = document.getElementById("featuredArticle");

    // Prevent errors on pages without this element.
    if (!container || articles.length === 0) return;

    const featured = articles[0];

    container.innerHTML = `
        ${createImage(featured, "featured-image")}

        ${articleMeta(featured)}

        <h2 class="featured-title">
            ${articleTitle(featured)}
        </h2>

        <div class="featured-divider"></div>

        <p class="featured-excerpt">
            ${escapeHTML(featured.excerpt)}
        </p>

        <p class="article-byline">
            By <strong>${escapeHTML(featured.author)}</strong>
        </p>
    `;
}


/* =========================================================
   4. LATEST RELEASES
   Displays the next four newest articles.
   ========================================================= */

function displayLatestArticles() {
    const container = document.getElementById("latestArticles");

    if (!container) return;

    const latestArticles = getNewestArticles(articles).slice(1, 5);

    container.innerHTML = latestArticles.map(article => `
        <article class="latest-item">

            <div>
                <p class="latest-category">
                    ${escapeHTML(article.category)}
                </p>

                <h3 class="latest-title">
                    ${articleTitle(article)}
                </h3>

                <p class="latest-views">
                    ${Number(article.views || 0).toLocaleString()} views
                </p>
            </div>

            <div
                data-article-id="${article.id}"
                class="article-clickable"
                role="button"
                tabindex="0"
                aria-label="Read ${escapeHTML(article.title)}">

                ${createImage(article, "latest-image")}
            </div>

        </article>
    `).join("");
}


/* =========================================================
   5. MORE STORIES
   Displays three additional articles.
   ========================================================= */

function displayMoreArticles() {
    const container = document.getElementById("moreArticles");

    if (!container) return;

    const moreArticles = getNewestArticles(articles).slice(5, 8);

    container.innerHTML = moreArticles.map(article => `
        <article class="story-card">

            <div
                data-article-id="${article.id}"
                class="article-clickable"
                role="button"
                tabindex="0"
                aria-label="Read ${escapeHTML(article.title)}">

                ${createImage(article, "story-card-image")}
            </div>

            <p class="story-card-category">
                ${escapeHTML(article.category)}
            </p>

            <h3 class="story-card-title">
                ${articleTitle(article)}
            </h3>

            <p class="story-card-excerpt">
                ${escapeHTML(article.excerpt)}
            </p>

        </article>
    `).join("");
}


/* =========================================================
   6. CATEGORY SECTIONS
   Displays articles for a particular category.
   ========================================================= */

function displayCategory(category, elementId) {
    const container = document.getElementById(elementId);

    if (!container) return;

    const matchingArticles = getNewestArticles(
        articles.filter(article => article.category === category)
    ).slice(0, 3);

    if (matchingArticles.length === 0) {
        container.innerHTML = `
            <p class="py-5 text-sm text-stone-500">
                No articles available yet.
            </p>
        `;
        return;
    }

    container.innerHTML = matchingArticles.map(article => `
        <article class="category-card">

            <div
                data-article-id="${article.id}"
                class="article-clickable"
                role="button"
                tabindex="0"
                aria-label="Read ${escapeHTML(article.title)}">

                ${createImage(article, "small-image")}
            </div>

            <div>
                <p class="latest-category">
                    ${escapeHTML(article.category)}
                </p>

                <h3>${articleTitle(article)}</h3>

                <p>${escapeHTML(article.excerpt)}</p>
            </div>

        </article>
    `).join("");
}


/* =========================================================
   SORTING HELPER
   ========================================================= */

function sortArticlesList(list, sortBy = "newest") {
    const sorted = [...list];
    if (sortBy === "oldest") {
        return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === "popular") {
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    // Default: "newest"
    return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/* =========================================================
   7. ARTICLE ARCHIVES
   ========================================================= */

function displayArchives(category = "All", searchTerm = "", sortBy = "newest") {
    const container = document.getElementById("archiveArticles");

    if (!container) return 0;

    const query = searchTerm.trim().toLowerCase();

    let matchingArticles = articles.filter(article => {
        const matchesCategory =
            category === "All" || article.category === category;

        const searchableText = [
            article.title,
            article.excerpt,
            article.content,
            article.author,
            article.category,
            ...(article.tags || [])
        ].join(" ").toLowerCase();

        const matchesSearch =
            query === "" || searchableText.includes(query);

        return matchesCategory && matchesSearch;
    });

    // Apply Sorting
    matchingArticles = sortArticlesList(matchingArticles, sortBy);

    if (matchingArticles.length === 0) {
        container.innerHTML = `
            <p class="py-5 text-sm text-stone-500">
                No articles found matching your criteria.
            </p>
        `;
    } else {
        container.innerHTML = matchingArticles.map(article => `
            <article class="archive-item">
                <div
                    data-article-id="${article.id}"
                    class="article-clickable"
                    role="button"
                    tabindex="0"
                    aria-label="Read ${escapeHTML(article.title)}">
                    ${createImage(article, "archive-image")}
                </div>

                <div>
                    <p class="latest-category">
                        ${escapeHTML(article.category)}
                        · ${escapeHTML(article.date)}
                    </p>
                    <h3>${articleTitle(article)}</h3>
                    <p>${escapeHTML(article.excerpt)}</p>
                </div>
            </article>
        `).join("");
    }

    const countElement = document.getElementById("archiveCount");
    if (countElement) {
        countElement.textContent = `${matchingArticles.length} article(s) found`;
    }

    return matchingArticles.length;
}


/* =========================================================
   8. ARTICLE VIEWER
   Creates a dialog automatically if the HTML does not
   already contain one. This works on BOTH pages.
   ========================================================= */

function getArticleModal() {
    let modal = document.getElementById("articleModal");

    // Create the dialog if neither page contains it.
    if (!modal) {
        modal = document.createElement("dialog");
        modal.id = "articleModal";
        modal.className = "article-modal";

        modal.innerHTML = `
            <div class="modal-header">
                <span class="font-bold">THE LENS</span>

                <button
                    type="button"
                    id="closeArticle"
                    class="close-article"
                    aria-label="Close article">
                    &times;
                </button>
            </div>

            <div id="articleDetails" class="modal-content"></div>
        `;

        document.body.appendChild(modal);

        // Add a basic fallback style for the dialog.
        const modalStyle = document.createElement("style");

        modalStyle.textContent = `
            .article-modal {
                width: min(850px, 94vw);
                max-height: 90vh;
                overflow-y: auto;
                border: none;
                border-radius: 8px;
                padding: 24px;
                color: #292524;
                background: white;
            }

            .article-modal::backdrop {
                background: rgba(25, 10, 15, 0.75);
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 16px;
                padding-bottom: 16px;
                margin-bottom: 20px;
                border-bottom: 2px solid #571525;
                color: #571525;
            }

            .close-article {
                font-size: 30px;
                line-height: 1;
                cursor: pointer;
                border: none;
                background: transparent;
            }

            .modal-image {
                width: 100%;
                max-height: 400px;
                object-fit: cover;
                margin-bottom: 20px;
            }

            .modal-title {
                font-family: 'Playfair Display', Georgia, serif;
                font-size: clamp(28px, 5vw, 42px);
                font-weight: 800;
                line-height: 1.15;
                margin: 20px 0;
                color: #571525;
            }

            .modal-body {
                line-height: 1.8;
                white-space: normal;
            }

            .share-button {
                display: inline-block;
                margin: 8px 8px 0 0;
                padding: 10px 14px;
                border: 1px solid #571525;
                color: #571525;
                text-decoration: none;
                background: white;
                cursor: pointer;
                font-size: 14px;
            }

            .share-button:hover {
                background: #fff1f2;
            }
        `;

        document.head.appendChild(modalStyle);
    }

    return modal;
}


function openArticle(articleId) {
    const article = getArticle(articleId);

    if (!article) return;

    const modal = getArticleModal();
    const details = modal.querySelector("#articleDetails");

    if (!details) return;

    // Convert article text into paragraphs.
    // Escape text before inserting it into the page.
    const paragraphs = escapeHTML(article.content)
        .split(/\n\s*\n/)
        .map(paragraph => `
            <p class="mb-4">${paragraph.replace(/\n/g, "<br>")}</p>
        `)
        .join("");

    const articleURL =
        location.origin +
        location.pathname.replace(/[^/]*$/, "archives.html") +
        "#article-" + article.id;

    details.innerHTML = `
        ${createImage(article, "modal-image")}

        ${articleMeta(article)}

        <h2 class="modal-title">
            ${escapeHTML(article.title)}
        </h2>

        <p class="article-byline mb-5">
            By <strong>${escapeHTML(article.author)}</strong>
        </p>

        <div class="modal-body">
            ${paragraphs}
        </div>

        <div class="mt-6">
            <button
                type="button"
                id="copyArticleLink"
                class="share-button">
                Copy article link
            </button>

            <a
                class="share-button"
                href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleURL)}"
                target="_blank"
                rel="noopener noreferrer">
                Share on Facebook
            </a>
        </div>
    `;

    // Open the dialog.
    if (!modal.open) {
        modal.showModal();
    }

    // Add the article ID to the URL.
    history.replaceState(null, "", "#article-" + article.id);

    // Copy article link.
    const copyButton = details.querySelector("#copyArticleLink");

    if (copyButton) {
        copyButton.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(articleURL);
                copyButton.textContent = "Link copied!";
            } catch {
                window.prompt("Copy this article link:", articleURL);
            }
        });
    }
}


// Event delegation: one listener handles all generated article cards.
document.addEventListener("click", event => {
    const trigger = event.target.closest("[data-article-id]");

    if (trigger) {
        openArticle(trigger.dataset.articleId);
    }
});


// Support keyboard activation of article image cards.
document.addEventListener("keydown", event => {
    const trigger = event.target.closest(
        '[role="button"][data-article-id]'
    );

    if (!trigger) return;

    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openArticle(trigger.dataset.articleId);
    }
});


// Close the dialog using its close button.
document.addEventListener("click", event => {
    if (event.target.closest("#closeArticle")) {
        const modal = document.getElementById("articleModal");

        if (modal?.open) {
            modal.close();
        }

        history.replaceState(
            null,
            "",
            location.pathname + location.search
        );
    }
});


// Close the dialog when the backdrop is clicked.
document.addEventListener("click", event => {
    const modal = document.getElementById("articleModal");

    if (modal && event.target === modal && modal.open) {
        modal.close();

        history.replaceState(
            null,
            "",
            location.pathname + location.search
        );
    }
});




/* =========================================================
   9. SEARCH BAR & AUTOMATIC SORT/FILTER CONTROLS
   ========================================================= */

const sortFilterBtn = document.getElementById("sortFilterBtn");
const filterDropdown = document.getElementById("filterDropdown");
const closeFilterBtn = document.getElementById("closeFilterBtn");
const sortSelect = document.getElementById("sortSelect");
const categorySelect = document.getElementById("categorySelect");

// Toggle Dropdown Visibility
if (sortFilterBtn && filterDropdown) {
    sortFilterBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        filterDropdown.classList.toggle("hidden");
    });

    if (closeFilterBtn) {
        closeFilterBtn.addEventListener("click", () => {
            filterDropdown.classList.add("hidden");
        });
    }

    // Close when clicking outside
    document.addEventListener("click", (e) => {
        if (!filterDropdown.contains(e.target) && !sortFilterBtn.contains(e.target)) {
            filterDropdown.classList.add("hidden");
        }
    });
}

// Perform Search/Filter Action Automatically
function executeFilterAction() {
    const query = searchInput ? searchInput.value.trim() : "";
    const category = categorySelect ? categorySelect.value : "All";
    const sort = sortSelect ? sortSelect.value : "newest";

    const archiveContainer = document.getElementById("archiveArticles");

    if (archiveContainer) {
        // If on Archives page, filter & sort live in place
        const count = displayArchives(category, query, sort);
        const message = document.getElementById("searchMessage");

        if (message) {
            message.textContent = `${count} article(s) found` + (query ? ` for "${query}"` : ".");
            message.classList.remove("hidden");
        }
    } else {
        // If on Homepage, redirect to Archives with query parameters
        const destination = new URL("archives.html", location.href);
        if (query) destination.searchParams.set("q", query);
        if (category && category !== "All") destination.searchParams.set("category", category);
        if (sort && sort !== "newest") destination.searchParams.set("sort", sort);

        window.location.href = destination.href;
    }
}

// Automatic triggers on dropdown change
if (sortSelect) {
    sortSelect.addEventListener("change", executeFilterAction);
}

if (categorySelect) {
    categorySelect.addEventListener("change", executeFilterAction);
}

// Handle Form Submit (Pressing Enter in search bar)
if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        executeFilterAction();
    });
}


/* =========================================================
   10. ARCHIVE CATEGORY FILTER
   Only runs when archiveFilter exists.
   ========================================================= */

const archiveFilter = document.getElementById("archiveFilter");

if (archiveFilter) {
    archiveFilter.addEventListener("change", () => {
        const query = searchInput ? searchInput.value : "";

        displayArchives(archiveFilter.value, query);
    });
}


/* =========================================================
   11. HOMEPAGE CATEGORY BUTTONS
   Clicking a category button opens the archive page with
   the selected category.
   ========================================================= */

document.querySelectorAll(".category-button").forEach(button => {
    button.addEventListener("click", () => {
        const category = button.dataset.category;

        const destination = new URL("archives.html", location.href);

        if (category) {
            destination.searchParams.set("category", category);
        }

        window.location.href = destination.href;
    });
});


/* =========================================================
   12. MOBILE NAVIGATION
   Works on either page if the navigation elements exist.
   ========================================================= */

const menuButton = document.getElementById("menuButton");
const navigation = document.getElementById("navigation");
const closeNavBtn = document.getElementById("closeNavBtn");

if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
        navigation.classList.toggle("mobile-open");

        const isOpen = navigation.classList.contains("mobile-open");

        menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    // Close the menu when the close button is clicked.
    if (closeNavBtn) {
        closeNavBtn.addEventListener("click", () => {
            navigation.classList.remove("mobile-open");
            menuButton.setAttribute("aria-expanded", "false");
        });
    }

    // Close the menu when a navigation link is clicked.
    navigation.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navigation.classList.remove("mobile-open");

            menuButton.setAttribute("aria-expanded", "false");
        });
    });
}


/* =========================================================
   13. READER FEEDBACK FORM
   DEMO ONLY: this does not send or save feedback.
   A backend API is required to store submissions.
   ========================================================= */

const feedbackForm = document.getElementById("feedbackForm");
const feedbackStatus = document.getElementById("feedbackMessage");

if (feedbackForm) {
    feedbackForm.addEventListener("submit", event => {
        event.preventDefault();

        const messageInput =
            document.getElementById("readerMessage");

        const message = messageInput
            ? messageInput.value.trim()
            : "";

        if (!message) {
            if (feedbackStatus) {
                feedbackStatus.textContent =
                    "Please enter your feedback.";
            }

            return;
        }

        if (feedbackStatus) {
            feedbackStatus.textContent =
                "Demo only: your feedback has not been sent. Connect this form to your backend API to enable submissions.";
        }

        feedbackForm.reset();
    });
}


/* =========================================================
   14. DATE AND COPYRIGHT
   Updates these values only if the elements exist.
   ========================================================= */

const currentDate = document.getElementById("currentDate");

if (currentDate) {
    currentDate.textContent = new Date().toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).toUpperCase();
}

const copyrightYear = document.getElementById("copyrightYear");

if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
}


/* =========================================================
   15. INITIALIZE THE CURRENT PAGE
   Only render sections that exist on the current page.
   ========================================================= */

// Homepage sections.
if (document.getElementById("featuredArticle")) {
    displayFeaturedArticle();
}

if (document.getElementById("latestArticles")) {
    displayLatestArticles();
}

if (document.getElementById("moreArticles")) {
    displayMoreArticles();
}

displayCategory("News", "newsArticles");
displayCategory("Features", "featuresArticles");
displayCategory("Opinion", "opinionArticles");
displayCategory("Science and Technology", "scienceArticles");
displayCategory("Literature", "literatureArticles");


// Archive page: render articles and read URL parameters.
if (document.getElementById("archiveArticles")) {
    const urlParameters = new URLSearchParams(location.search);

    const initialCategory = urlParameters.get("category") || "All";
    const initialQuery = urlParameters.get("q") || "";

    // Apply the category dropdown value from the URL.
    const categorySelect = document.getElementById("archiveFilter");

    if (categorySelect) {
        const validOption = Array.from(categorySelect.options)
            .some(option => option.value === initialCategory);

        categorySelect.value = validOption ? initialCategory : "All";
    }

    // Fill the search input from the URL.
    if (searchInput && initialQuery) {
        searchInput.value = initialQuery;
    }

    // Display filtered articles.
    const count = displayArchives(
        categorySelect ? categorySelect.value : "All",
        initialQuery
    );

    // Display search feedback if a query was supplied.
    const searchMessage = document.getElementById("searchMessage");

    if (searchMessage && initialQuery) {
        searchMessage.textContent =
            `${count} article(s) found for "${initialQuery}".`;

        searchMessage.classList.remove("hidden");
    }

}
