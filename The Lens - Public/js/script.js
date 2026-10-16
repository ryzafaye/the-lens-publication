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
        tags: ["student council", "budget", "transparency", "campus"],
        content: `For the first time in university history, the Central Student Council (CSC) has officially opened its annual budget deliberations to all academic collegiate councils and recognized student organizations through open public hearings and live streaming.

The landmark initiative follows months of active petitioning by independent student coalitions advocating for transparent allocations of the university student activity fee. Previously, budgetary reviews were conducted behind closed committee doors, with only broad summaries released at the conclusion of the academic term.

According to the financial dossier presented by the CSC Treasury, the proposed budget for Academic Year 2026–2027 stands at ₱1.85 million. The funds are earmarked for student welfare subsidies, collegiate sports fests, student publication grants, mental health advocacy caravans, and community outreach programs.

"Every single centavo managed by the student council originates from student fees. It is our uncompromised duty to ensure that every student has the right to see, question, and critique how their contributions are spent," CSC President Regina Alcantara addressed the assembly during the opening floor.

Representatives from the College of Engineering and College of Arts raised queries regarding proposed transportation subsidies and emergency assistance funds. Deliberations will continue across the next two Friday afternoons at the Student Activity Center, with live audience participation permitted.`
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
        tags: ["clinic", "midterms", "health", "student services"],
        content: `Recognizing the heightened stress, fatigue, and medical needs of students during midterm examinations, the University Health and Wellness Clinic has officially extended its operational hours until 9:00 PM throughout the examination cycle.

The extended schedule, running Monday through Saturday, guarantees on-duty registered nurses, triage consultations, emergency medication dispensation, and blood pressure monitoring for evening study groups and late laboratory classes.

Dr. Armando Teodoro, Director of University Health Services, emphasized that preventative care is crucial during high-stakes exam periods. "Midterms bring sleep deprivation, erratic meal schedules, and elevated stress. We want students to know they never have to endure preventable illness in silence simply because regular daytime office hours have ended," Dr. Teodoro said.

In addition to general clinic services, the wellness wing has established a calm recharge lounge stocked with herbal tea, hydration stations, and certified guidance counselors available for crisis de-escalation.

Students are reminded to carry their university ID and medical records when visiting. The campus emergency ambulance service remains on standby 24/7 for acute medical transfers.`
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
        tags: ["campus", "sustainability", "environment", "infrastructure"],
        content: `University administrators, faculty, and student environmental leaders officially broke ground on the University Green Park Pavilion this Tuesday, launching an ambitious ecological infrastructure initiative in the heart of the campus.

The 1,200-square-meter sustainable pavilion, situated directly between the Engineering Complex and the Central Library, will convert an underutilized gravel plot into an eco-friendly communal study garden featuring solar-powered workstation benches, native shade trees, and rainwater harvesting filtration systems.

Notably, the architectural blueprint was adapted from the winning design submitted by third-year architecture and civil engineering students during the University Sustainability Innovation Challenge last semester.

"This space is designed as a living classroom. Students will be able to study in well-ventilated, naturally shaded surroundings while witnessing real-time renewable energy and stormwater management in action," explained Project Head Engr. Corazon Velasquez.

Construction will proceed in phases to avoid class disruptions, with initial seating plazas opening ahead of the second semester and complete landscaping scheduled for completion by March 2027.`
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
        tags: ["library", "students", "exams", "feature"],
        content: `At 2:45 AM on a Wednesday, while the surrounding city sleeps, the fourth floor of the Central University Library breathes with the quiet, determined energy of hundreds of students gathered under warm desk lamps.

For undergraduates and graduate students alike, the 24-hour examination shift has become a sacred campus rite of passage. Rows of carrels are lined with coffee thermoses, color-coded sticky notes, anatomy diagrams, and open textbooks.

Behind this nocturnal sanctuary are dedicated campus custodians and night librarians like Mang Berting, who has watched three decades of university students chase their degrees. "At three in the morning, you see every facet of student life," Mang Berting shares with a gentle smile as he checks the hot water urn. "You see tears of frustration, quiet moments of prayer, and bursts of quiet laughter when a group finally solves a complex problem."

Third-year nursing student Andrea Santos credits the library's shared camaraderie for keeping her motivated: "When your energy dips, you look across the room and see dozens of your peers fighting just as hard for their future. It gives you the second wind you need."

As dawn breaks over the campus bell tower, the collective rustle of closing binders marks another night conquered in pursuit of lifelong dreams.`
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
        tags: ["photography", "student life", "media", "journalism"],
        content: `When senior photojournalist Carlos Rivera sling his dual camera harness across his shoulders at dawn, the sun is only just beginning to illuminate the campus grandstand. Ahead lies a grueling twelve-hour day covering student rallies, varsity athletic playoffs, and evening cultural showcases.

Student photojournalism is an art of split-second intuition and physical endurance. "A powerful photo does not merely record an event; it immortalizes the pulse, the emotion, and the unspoken tension of a single fleeting second," Carlos explains as he adjusts his aperture before the opening tip-off.

Behind every viral photograph published on The Lens website and social feeds are hours of unglamorous dedication. Photographers sprint between campus colleges under sweltering heat, kneel in the mud along the sports boundary lines, and spend late nights sorting through thousands of RAW files to meet strict press deadlines.

Balancing academic demands with documentary journalism is an everyday tightrope. "You learn to annotate reading materials on the commute and review laboratory flashcards while photo exports render," Carlos remarks. "Yet every sacrifice feels justified the moment a student tells you that your photograph made them feel seen."`
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
        tags: ["cafeteria", "community", "feature", "workers"],
        content: `Long before the campus gates unlock and the first jeepneys arrive, the kitchen vents of the University Main Canteen are already billowing aromatic steam into the crisp 4:30 AM air.

Head Cook Aling Nelia has been serving the university student community for over twenty-two years. Alongside her devoted seven-person kitchen staff, she coordinates the preparation of more than 1,800 hearty, affordable meal portions every single weekday.

Preparing wholesome food under inflationary pressures is a challenging craft. Aling Nelia refuses to cut corners on nutrition, working closely with local agricultural suppliers to source fresh vegetables and lean proteins at fair wholesale rates.

"Many of our students live far from home in boarding houses and dormitories," Aling Nelia explains while stirring a giant vat of sinigang na baboy. "When they eat our food, we want it to taste like a warm home-cooked meal prepared by a mother who cares for them."

The genuine affection is mirrored in the cafeteria lines, where kitchen staff greet students by name, memorize their comfort foods, and slip extra broth or rice to working scholars facing difficult weeks.

While academic laurels and research grants make university headlines, the everyday vitality of our academic community is fueled by the tireless dedication of these kitchen champions.`
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
        tags: ["opinion", "cafeteria", "student welfare", "food security"],
        content: `Education is universally upheld as an equalizer of opportunity. Yet on our campus today, where a basic plate of rice and viand regularly climbs past ₱110, an urgent reality must be confronted: how can students cultivate their minds when their basic nutritional needs are neglected?

The cost of campus living has grown unsustainable for the average student. Squeezed between escalating dormitory rents, daily transportation fares, and printing costs, students are frequently forced to reduce their food budgets to dangerous minimums.

Nutritional deprivation directly impairs cognitive function. Medical studies consistently demonstrate that skipping meals or subsisting solely on ultra-processed instant snacks results in chronic fatigue, impaired focus, and compromised immune defenses during demanding academic terms.

Several neighboring state institutions have pioneered student-centered nutritional interventions, including subsidized university cafeterias, student cooperative bakeries, and cooperative dining programs with local farmers. There is no moral justification for our university to remain an exception.

The administration must adopt a comprehensive campus food security policy establishing mandatory price caps on staple student meals. Nourishment is not a commercial privilege; it is an indispensable foundation of academic achievement.`
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
        tags: ["opinion", "group work", "grading", "academics"],
        content: `Every university student knows the exasperating narrative: a five-person semester capstone is assigned, two teammates go missing after the first week, two others contribute superficial internet summaries, and one solitary student spends sleepless nights piecing together the final submission.

Collaborative assignments are ostensibly designed to cultivate real-world teamwork, leadership, and communication skills. Yet when instructors assign a uniform group mark without individual contribution metrics, collaborative pedagogy degenerates into structural exploitation.

Diligent students are placed in a hostage situation—forced to shoulder unreasonable burdens or watch their academic scholarships jeopardized by indifferent groupmates. Concurrently, non-participating members receive unearned grades that misrepresent their competence and rob them of genuine learning opportunities.

The answer is not to abandon collaborative scholarship, but to reform its evaluation methodology. Academic departments must implement rigorous individual milestone defenses, anonymous weighted peer reviews, and transparent task contribution logs.

True teamwork hinges upon reciprocal accountability. When grading rubrics reward passive free-riding, they fail the very educational ethos they are designed to uphold.`
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
        tags: ["opinion", "mental health", "wellness", "academics"],
        content: `In modern higher education, exhaustion is too often glorified as a badge of honor. Collegiate social media culture celebrates all-nighters, skipped meals, and dangerously excessive caffeine intake as though physical depletion were synonymous with ambition.

Data from the University Guidance and Counseling Office paints an alarming picture: consultations regarding chronic burnout, acute anxiety, and depressive symptoms have surged by 45% over the past two academic years. Under prevailing university policies, students experiencing psychological crisis must navigate complex bureaucratic protocols to avoid punitive absence marks.

Institutionalizing wellness days is neither an excuse for idleness nor a compromise of academic excellence. It is a necessary acknowledgment of human cognitive limits. Providing students with two designated, penalty-free mental health pauses each term empowers them to rest, recover, and recalibrate before situational distress compounds into clinical illness.

Forward-thinking institutions globally have demonstrated that protected recovery intervals improve term retention, elevate academic output, and foster healthier campus cultures.

A university's prestige should be measured not by how brutally it grinds down its student body, but by how wisely it equips them to thrive with resilience, purpose, and dignity.`
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
        tags: ["technology", "enrollment", "portal", "infrastructure"],
        content: `Every semester registration window brings a familiar ritual of collective dread: thousands of eager students huddled over laptops at 8:00 AM, desperately refreshing browser tabs as the dreaded "504 Gateway Time-out" brings course enlistment to a crashing halt.

An investigative analysis by The Lens into the university's technical infrastructure reveals the core bottlenecks plaguing the digital enrollment system. Originally deployed over twelve years ago, the portal relies on a monolithic database architecture unable to process the torrential flood of concurrent database transactions when 14,000 students simultaneously attempt to secure limited elective slots.

University IT Director Engr. Manuel David confirmed that while front-end cloud capacity was upgraded this summer, backend database locks remain the primary choke point. "When hundreds of users submit enlistment requests for the same section within milliseconds, transactional row locking causes query queues to cascade and freeze," Engr. David explained.

The university has announced a multi-phase modernization initiative set for roll-out in 2027. Planned improvements include containerized microservices, asynchronous cart reservations with priority queuing, and distributed cloud caching.

Until these systemic upgrades arrive, students are advised to clear browser cache, avoid duplicate tabs, and utilize hardwired campus computer laboratories for optimal connection stability.`
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
        tags: ["cybersecurity", "digital safety", "technology", "privacy"],
        content: `With the university's transition toward unified Single Sign-On (SSO) credentials encompassing official emails, grading portals, digital library access, and campus Wi-Fi networks, a single breached password can instantly compromise a student's entire academic identity.

The University Cyber Defense Task Force reported a 60% uptick in spear-phishing campaigns targeting student inboxes this semester. Fraudulent communications masquerading as the Office of the Registrar frequently demand immediate credential verification under threat of enrollment cancellation.

Cybersecurity specialists emphasize that sound digital habits thwart the vast majority of credential theft. Essential protections include enabling app-based Two-Factor Authentication (2FA), using passphrases rather than predictable birthdays or student IDs, and never replicating institutional passwords on external websites.

Unsecured public Wi-Fi networks at commercial cafes near campus pose additional interception risks. Students accessing sensitive portals off-campus should consistently connect via the university's encrypted Eduroam network or use an approved virtual private network.

Digital safety is an interdependent communal ecosystem. Protecting your personal credentials defends the perimeter of the entire university network.`
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
        tags: ["engineering", "innovation", "robotics", "awards"],
        content: `An interdisciplinary team of undergraduate engineering and environmental science scholars has clinched the grand championship at the 2026 National CleanTech Innovation Challenge with their breakthrough invention, the "Agos-1" solar-powered water purification rover.

Developed over ten months of rigorous laboratory and field testing, Agos-1 is an autonomous amphibious robotic craft engineered to navigate floodwaters and polluted urban tributaries. The rover pairs computer vision navigation with a high-efficiency multi-stage purification system comprising centrifugal particulate filtration, granular activated carbon, and germicidal ultraviolet sterilization.

During live field trials in municipal waterways adjacent to the campus, Agos-1 operated continuously for over eight hours on solar power alone, purifying more than 1,400 liters of stagnant runoff to meet strict national potable drinking benchmarks.

Team Lead Sofia Hernandez, a fifth-year mechanical engineering student, dedicated the accolade to communities vulnerable to seasonal typhoons. "We set out to engineer practical, scalable climate solutions for Filipino families. Innovation attains its greatest meaning when it protects human lives in times of disaster," Hernandez declared.

The research consortium was awarded a ₱500,000 innovation grant by the Department of Science and Technology to manufacture deployed units for community disaster response councils.`
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
        content: `The hallway holds its breath at night,
A desk lamp guards a pool of light.
The clock moves on, the pages turn,
And still there is a hope to learn.

Through empty archways shadows creep,
While half the dreaming city sleeps;
The quiet clatter of the keys,
Like wind among the campus trees.

The chalk-dust lingers on the slate,
A testament to hours late;
Equations traced in fading white,
Dissolving softly in the night.

And though the tired eyelids fall,
A steadfast flame sustains us all:
The thirst to know, the will to stand,
With future waiting in our hand.

When morning paints the quad in gold,
The quiet stories will be told;
Of those who kept the lanterns bright,
And walked with purpose through the night.`
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
        tags: ["creative writing", "prose", "literature"],
        content: `There is a quiet, sacred magic in opening a weathered library textbook in the third-floor humanities stacks and discovering a folded scrap of yellowed paper resting between pages 214 and 215.

In our university library, every volume bears a double history: the printed curriculum of scholars who lived centuries ago, and the intimate marginalia of the students who sat in these same chairs decades before us. An anonymous hand in faded blue ballpoint writes: "Remember this theory for Thursday's exam." Another note from October 1996 asks in hurried cursive: "Is all of this sacrifice worth it?"

Directly underneath it, penned in a completely different handwriting dated November 2008, another student replied: "Yes. Keep holding on."

These accidental time capsules—dried sampaguita bookmarks, provincial bus ticket stubs, and doodled geometric patterns—render our campus library an unintentional museum of youth and resilience. In our moments of deepest exhaustion, we are tempted to believe our doubts and anxieties are uniquely our own.

Yet the margins tell a gentler, more comforting truth. Thousands of students before us have stared out these exact bay windows into the twilight, wondering whether their labor would matter. The quiet words they left behind remind us that we never study alone; we are simply taking our turn in an enduring, generational chorus of young minds reaching out toward the light.`
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
        tags: ["prose", "reflection", "literature"],
        content: `Autumn leaves gather in the weathered crevices of stone benches as generations of students walk past the historic university bell tower. If the quadrangle could speak, it would recount a hundred thousand beginnings and heartfelt farewells.

In the soft dampness of early morning, the quadrangle belongs to the resident sparrows and the elderly groundskeepers whose bamboo brooms trace wide arcs across the brick walkways. By midday, it transforms into a bustling sea of quickening strides, colorful umbrellas, and passionate debates beneath the acacia canopy.

Here, wide-eyed freshmen huddle over course registration schedules, trying to decipher room codes; here, senior graduates in black togas toss their caps toward the wide blue sky while their families wipe away tears of earned pride.

The physical contours of the campus inevitably change with the passing years—new pavilions emerge, digital screens replace bulletin boards, and solar arrays crown the historic terracotta roofs. Yet the essential heartbeat of the quadrangle remains enduringly constant.

It remains the sacred crossroads of university life—the open square where raw curiosity arrives, where lifelong friendships are forged in the fire of shared study, and where purpose is irrevocably discovered.`
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
        <div
            data-article-id="${featured.id}"
            class="article-clickable cursor-pointer"
            role="button"
            tabindex="0"
            aria-label="Read ${escapeHTML(featured.title)}">
            ${createImage(featured, "featured-image")}
        </div>

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

    // Create the dialog if the page does not already contain it.
    if (!modal) {
        modal = document.createElement("dialog");
        modal.id = "articleModal";
        modal.className = "article-modal";

        modal.innerHTML = `
            <div class="modal-topbar">
                <span class="modal-topbar-brand">
                    <i class="fa-solid fa-newspaper" style="margin-right:6px;"></i>The Lens
                </span>
                <button
                    type="button"
                    id="closeArticle"
                    class="modal-topbar-close"
                    aria-label="Close article">
                    &times;
                </button>
            </div>

            <div id="articleDetails" class="modal-reader"></div>
        `;

        document.body.appendChild(modal);

        // Inline fallback styles (safety net in case CSS hasn't loaded yet).
        const modalStyle = document.createElement("style");

        modalStyle.textContent = `
            .article-modal {
                position: fixed;
                inset: 0;
                width: 100vw;
                height: 100vh;
                max-width: 100vw;
                max-height: 100vh;
                margin: 0;
                padding: 0;
                border: none;
                border-radius: 0;
                overflow-y: auto;
                background: #fff;
            }

            .article-modal::backdrop {
                display: none;
            }

            .modal-topbar {
                position: sticky;
                top: 0;
                z-index: 20;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 14px 24px;
                background: #fff;
                border-bottom: 2px solid #571525;
            }

            .modal-topbar-brand {
                font-weight: 800;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                color: #571525;
                font-size: 15px;
            }

            .modal-topbar-close {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                border: none;
                border-radius: 50%;
                background: transparent;
                color: #571525;
                font-size: 24px;
                line-height: 1;
                cursor: pointer;
                transition: background 0.2s, transform 0.2s;
            }

            .modal-topbar-close:hover {
                background: #fdf2f4;
                transform: scale(1.08);
            }

            .modal-reader {
                max-width: 740px;
                margin: 0 auto;
                padding: 36px 24px 80px;
            }

            .modal-image {
                width: 100%;
                aspect-ratio: 16 / 9;
                object-fit: cover;
                border-radius: 6px;
                margin: 20px 0 28px;
                display: block;
            }

            .modal-title {
                font-size: clamp(28px, 4.5vw, 44px);
                font-weight: 800;
                line-height: 1.15;
                margin: 0 0 16px;
                color: #571525;
                letter-spacing: -0.02em;
            }

            .modal-body {
                line-height: 1.88;
                font-size: 16px;
                color: #2b2426;
            }

            .modal-body p {
                margin-bottom: 1.35rem;
            }

            .copy-link-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 9px 16px;
                border: 1.5px solid #ded4d5;
                border-radius: 6px;
                background: white;
                color: #571525;
                font-size: 12px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .copy-link-btn:hover {
                background: #fff1f3;
                border-color: #571525;
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

    // Convert complete article text into styled paragraphs.
    const paragraphs = escapeHTML(article.content)
        .split(/\n\s*\n/)
        .map(paragraph => `
            <p class="mb-4 text-stone-800 leading-relaxed text-[15px] md:text-base">${paragraph.replace(/\n/g, "<br>")}</p>
        `)
        .join("");

    // Estimate reading time (~180 words per minute)
    const wordCount = (article.content || "").split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 180));

    const articleURL =
        location.origin +
        location.pathname.replace(/[^/]*$/, "archives.html") +
        "#article-" + article.id;

    details.innerHTML = `
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
            <span class="text-xs font-bold tracking-widest uppercase text-wine flex items-center gap-1.5">
                <i class="fa-solid fa-newspaper text-sm"></i> THE LENS STUDENT PUBLICATION
            </span>
            <span class="text-xs text-stone-500 font-medium flex items-center gap-1.5">
                <i class="fa-regular fa-clock"></i> ${readingTime} min read
            </span>
        </div>

        <h2 class="modal-title font-display">
            ${escapeHTML(article.title)}
        </h2>

        ${articleMeta(article)}

        <div class="flex items-center gap-3 py-3 my-4 border-y border-stone-100 text-xs text-stone-600 bg-stone-50/60 px-3 rounded-lg">
            <div class="w-9 h-9 rounded-full bg-rose-100 text-wine flex items-center justify-center font-bold text-sm shrink-0 border border-rose-200">
                ${article.author ? escapeHTML(article.author.charAt(0)) : "L"}
            </div>
            <div>
                <p class="font-bold text-stone-900">${escapeHTML(article.author)}</p>
                <p class="text-stone-500 text-[11px]">The Lens Campus Journalist • Staff Contributor</p>
            </div>
        </div>

        ${createImage(article, "modal-image")}

        <div class="modal-body font-body">
            ${paragraphs}
        </div>

        <div class="mt-8 pt-5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <button
                type="button"
                id="copyArticleLink"
                class="copy-link-btn">
                <i class="fa-regular fa-copy"></i> Copy link
            </button>

            <button
                type="button"
                id="modalCloseFooterBtn"
                class="text-xs font-bold text-stone-600 hover:text-wine py-2 px-3 rounded-lg hover:bg-stone-100 transition flex items-center gap-1.5">
                <i class="fa-solid fa-xmark"></i> Close Article
            </button>
        </div>
    `;

    // Open the dialog.
    if (!modal.open) {
        modal.showModal();
    }
    modal.scrollTop = 0;

    // Close button at bottom
    const footerCloseBtn = details.querySelector("#modalCloseFooterBtn");
    if (footerCloseBtn) {
        footerCloseBtn.addEventListener("click", () => {
            modal.close();
            history.replaceState(null, "", location.pathname + location.search);
        });
    }

    // Add the article ID to the URL.
    history.replaceState(null, "", "#article-" + article.id);

    // Copy article link.
    const copyButton = details.querySelector("#copyArticleLink");
    if (copyButton) {
        copyButton.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(articleURL);
                copyButton.innerHTML = `<i class="fa-solid fa-check text-emerald-600"></i> Link copied!`;
                setTimeout(() => {
                    copyButton.innerHTML = `<i class="fa-regular fa-copy"></i> Copy link`;
                }, 2000);
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
    if (event.target.closest("#closeArticle") || event.target.closest(".close-modal") || event.target.closest(".close-article")) {
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
   14B. ACTIVE MEMBER AUTH STATUS
   Updates the "Login as Member" button when a user is signed in.
   ========================================================= */

try {
    const rawUser = sessionStorage.getItem("thelens_active_user");
    if (rawUser) {
        const activeUser = JSON.parse(rawUser);
        const loginBtn = document.getElementById("memberLoginBtn");
        const mobileLoginBtn = document.getElementById("mobileMemberLoginBtn");

        const loggedInHtml = `<span class="flex items-center gap-1.5"><i class="fa-solid fa-circle-user text-rose-300"></i> <span class="max-w-[140px] truncate">${activeUser.name}</span> <span class="opacity-75 text-[10px]">(${activeUser.role})</span></span> <button type="button" id="logoutActionBtn" title="Log out" class="ml-1.5 text-rose-200 hover:text-white transition"><i class="fa-solid fa-right-from-bracket"></i></button>`;

        if (loginBtn) {
            loginBtn.innerHTML = loggedInHtml;
            loginBtn.removeAttribute("href");
            loginBtn.classList.add("cursor-default");
        }

        if (mobileLoginBtn) {
            mobileLoginBtn.innerHTML = loggedInHtml;
            mobileLoginBtn.removeAttribute("href");
        }

        const logoutBtn = document.getElementById("logoutActionBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                sessionStorage.removeItem("thelens_active_user");
                window.location.reload();
            });
        }
    }
} catch (e) {
    console.error("Auth status check:", e);
}


/* =========================================================
   15. INITIALIZE THE CURRENT PAGE
   Wrapped in a function so it can be re-run on seamless navigation.
   ========================================================= */

function initLensPage() {
    // Render Homepage Sections
    if (document.getElementById("featuredArticle")) displayFeaturedArticle();
    if (document.getElementById("latestArticles")) displayLatestArticles();
    if (document.getElementById("moreArticles")) displayMoreArticles();

    // Render Category Sections
    displayCategory("News", "newsArticles");
    displayCategory("Features", "featuresArticles");
    displayCategory("Opinion", "opinionArticles");
    displayCategory("Science and Technology", "scienceArticles");
    displayCategory("Literature", "literatureArticles");

    // Render Archive Page
    if (document.getElementById("archiveArticles")) {
        const urlParameters = new URLSearchParams(window.location.search);
        const initialCategory = urlParameters.get("category") || "All";
        const initialQuery = urlParameters.get("q") || "";

        const categorySelect = document.getElementById("archiveFilter");
        if (categorySelect) {
            const validOption = Array.from(categorySelect.options)
                .some(option => option.value === initialCategory);
            categorySelect.value = validOption ? initialCategory : "All";
        }

        const searchInputBox = document.getElementById("searchInput");
        if (searchInputBox && initialQuery) {
            searchInputBox.value = initialQuery;
        }

        const count = displayArchives(
            categorySelect ? categorySelect.value : "All",
            initialQuery
        );

        const searchMessage = document.getElementById("searchMessage");
        if (searchMessage && initialQuery) {
            searchMessage.textContent = `${count} article(s) found for "${initialQuery}".`;
            searchMessage.classList.remove("hidden");
        }
    }
}

// Run this once when the script first loads
initLensPage();


/* =========================================================
   16. SEAMLESS PAGE NAVIGATION & ACTIVE LINKS
   Loads pages without full browser reloads and syncs the nav.
   ========================================================= */

// Function to highlight the correct navigation link
function updateActiveNavLink() {
    // Get the current page from the URL
    let page = window.location.pathname.split("/").pop();
    
    // Default to index.html if on the root path
    if (!page || page === "" || page === "/") {
        page = "index.html";
    }

    // Find all links in the navigation
    document.querySelectorAll('#navigation a').forEach(link => {
        const href = link.getAttribute('href');
        
        // Check if the link matches the current page
        if (href === page || (href === '#home' && page === 'index.html')) {
            // Make Active (White border, white text)
            link.classList.add('active', 'border-white', 'text-white');
            link.classList.remove('border-transparent', 'text-white/90');
        } else {
            // Make Inactive (Transparent border, slightly faded text)
            link.classList.remove('active', 'border-white', 'text-white');
            link.classList.add('border-transparent', 'text-white/90');
        }
    });
}

// Intercept all clicks on the document
document.addEventListener('click', async (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');

    // Ignore external links, mailto, anchor tags, or new tabs
    if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#') || link.target === '_blank') {
        return; 
    }

    // Prevent default reload
    e.preventDefault();

    // Close mobile menu if it is open
    const nav = document.getElementById('navigation');
    if (nav && nav.classList.contains('mobile-open')) {
        nav.classList.remove('mobile-open');
    }

    // Update URL bar
    window.history.pushState({}, '', href);

    // Fetch and swap content
    await loadPageWithoutReload(href);
});

// Listen for browser Back/Forward buttons
window.addEventListener('popstate', async () => {
    await loadPageWithoutReload(window.location.pathname + window.location.search);
});

// Fetch and swap the <main> content
async function loadPageWithoutReload(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Page not found');
        const htmlText = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        const newMain = doc.querySelector('main');
        if (newMain) {
            const currentMain = document.querySelector('main');
            
            // Swap the HTML content
            currentMain.innerHTML = newMain.innerHTML;
            currentMain.id = newMain.id;
            currentMain.className = newMain.className;

            // Update title and reset view
            if (doc.title) document.title = doc.title;
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // RUN THE UPDATES
            updateActiveNavLink(); // Move the white underline
            initLensPage();        // Render the new articles
        }
    } catch (error) {
        console.error('Seamless load failed:', error);
        window.location.href = url; // Fallback to normal navigation
    }
}