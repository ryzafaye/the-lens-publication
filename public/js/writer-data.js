/**
 * ============================================================================
 * THE LENS — WRITER DATA MANAGEMENT
 * Shared Mock Articles & State Persistence for Staff Writers
 * Version 3: Clean Plain Paragraph Formatting (No raw <div> tags)
 * ============================================================================
 */

const WRITER_DATA_STORAGE_KEY = 'theLensWriterArticles_v3';

const DEFAULT_WRITER_ARTICLES = [
    // --- Sofia M. Alcaraz's Articles ---
    {
        id: 'art-s01',
        writerId: 'sofia-alcaraz',
        author: 'Sofia M. Alcaraz',
        title: 'The Silent Crisis: Mental Health Services in Modern State Universities',
        category: 'Features',
        excerpt: 'An investigative report on student counseling backlogs, mental health staffing ratios, and clinical resource bottlenecks across regional campuses.',
        date: 'Oct 18, 2026',
        rawDate: '2026-10-18',
        status: 'Published',
        views: 4210,
        shares: 312,
        remarks: '',
        content: `Behind the picturesque facades of state colleges, student mental health facilities face an unprecedented strain. Counseling centers report appointment waiting times stretching up to six weeks during midterm and final examination periods.\n\nAccording to data gathered across three regional branches, the ratio of guidance counselors to enrolled students stands at approximately 1 to 2,400—far below the internationally recommended benchmark. Student leaders have urged university regents to allocate emergency supplemental funding for tele-mental health services and peer counselor training networks.\n\n"When students reach out in crisis, delaying support by more than a few days can derail their entire academic journey," emphasized Dr. Clara Valdez, director of university student wellness.`
    },
    {
        id: 'art-s02',
        writerId: 'sofia-alcaraz',
        author: 'Sofia M. Alcaraz',
        title: 'Quantum Leaps: Inside the New Regional Nanotechnology Laboratory',
        category: 'Science and Technology',
        excerpt: 'A first look inside the university’s multi-million peso materials science cleanroom and its potential for student-led semiconductor research.',
        date: 'Oct 21, 2026',
        rawDate: '2026-10-21',
        status: 'Pending Review',
        views: 0,
        shares: 0,
        remarks: '',
        content: `Dressed in head-to-toe particulate suits, senior materials engineering scholars stepped inside the newly commissioned Regional Advanced Nanotechnology Center. The facility represents the largest state-funded research installation on campus in over a decade.\n\nEquipped with scanning electron microscopy and thin-film deposition chambers, the laboratory will allow undergraduate researchers to fabricate micro-sensors for agricultural soil diagnostics and water quality monitoring.\n\nFaculty advisors anticipate that the lab's inaugural cohort of research papers will be submitted to regional peer-reviewed symposiums before the end of the academic year.`
    },
    {
        id: 'art-s03',
        writerId: 'sofia-alcaraz',
        author: 'Sofia M. Alcaraz',
        title: 'Demystifying Artificial Intelligence in Student Research Papers',
        category: 'Opinions',
        excerpt: 'Why university academic honesty boards need pedagogical guidelines rather than outright punitive bans on generative writing assistants.',
        date: 'Oct 19, 2026',
        rawDate: '2026-10-19',
        status: 'For Revision',
        views: 0,
        shares: 0,
        remarks: 'Please expand Section 2 on ethical attribution and cite specific guidelines from the University Academic Integrity Council before resubmission.',
        content: `As artificial intelligence tools become integrated into daily writing workflows, universities find themselves at an ethical crossroads. Blanket bans and automated detection algorithms often punish honest students while failing to cultivate critical discernment.\n\nInstead of treating AI strictly as a disciplinary hazard, academic departments must establish transparent attribution frameworks. When students are taught how to interrogate AI-generated hypotheses rather than uncritically copy them, technological literacy flourishes.`
    },
    {
        id: 'art-s04',
        writerId: 'sofia-alcaraz',
        author: 'Sofia M. Alcaraz',
        title: 'Voices from the Courtyard: An Oral History of Student Activism',
        category: 'Features',
        excerpt: 'Remembering five decades of grassroots assembly under the historic Acacia trees of the main university quadrangle.',
        date: 'Oct 12, 2026',
        rawDate: '2026-10-12',
        status: 'Published',
        views: 8920,
        shares: 648,
        remarks: '',
        content: `Under the sprawling canopy of the central courtyard Acacia trees, generations of students have unfurled banners, composed manifestos, and sung anthems of solidarity. From the martial law era walkouts of the 1970s to recent mobilizations against budget cuts, the quadrangle remains the moral compass of the campus.\n\nAlumni leaders recall sleepless nights organizing student councils by candlelight, while contemporary activists utilize digital broadcast livestreams to broadcast campus assemblies in real time.`
    },
    {
        id: 'art-s05',
        writerId: 'sofia-alcaraz',
        author: 'Sofia M. Alcaraz',
        title: 'Under the Night Sky: Campus Astronomy Club Observation Logs',
        category: 'Science and Technology',
        excerpt: 'Stargazing sessions from the science building rooftop reveal both the wonder of the cosmos and the mounting challenge of urban light pollution.',
        date: 'Oct 22, 2026',
        rawDate: '2026-10-22',
        status: 'Draft',
        views: 0,
        shares: 0,
        remarks: '',
        content: `Every Friday evening, the rooftop observatory of the Science & Tech complex transforms into an open-air classroom. Students gather around high-magnification refractors to track Jupiter's Galilean moons and the rings of Saturn.\n\nHowever, ambient light from surrounding commercial developments continues to encroach upon regional dark sky conditions. The club is currently drafting a lighting efficiency petition to present to city council.`
    },
    {
        id: 'art-s06',
        writerId: 'sofia-alcaraz',
        author: 'Sofia M. Alcaraz',
        title: 'Investigating Regional Microplastic Levels in Local Watersheds',
        category: 'Science and Technology',
        excerpt: 'Preliminary findings from student water sample assays along the river boundary bordering campus dormitory zones.',
        date: 'Oct 15, 2026',
        rawDate: '2026-10-15',
        status: 'Draft',
        views: 0,
        shares: 0,
        remarks: '',
        content: `Water sampling along the riverbanks adjacent to university dormitories has revealed microplastic concentrations exceeding municipal baseline averages. Most synthetic fragments originated from single-use beverage containers and packaging film.`
    },
    {
        id: 'art-s07',
        writerId: 'sofia-alcaraz',
        author: 'Sofia M. Alcaraz',
        title: 'Renewable Energy Transition: Solar Panels Installed on North Building',
        category: 'News',
        excerpt: 'The university engineering department commissions its first grid-tied 150kW solar array, cutting peak utility expenses.',
        date: 'Oct 05, 2026',
        rawDate: '2026-10-05',
        status: 'Published',
        views: 6140,
        shares: 419,
        remarks: '',
        content: `In a major stride toward sustainable campus operations, university facilities management officially connected the 150-kilowatt photovoltaic system on the North Engineering Building rooftop.\n\nThe solar array is expected to offset approximately 18% of the building's monthly electricity demand, generating savings that will be reallocated toward student laboratory equipment upgrades.`
    },
    {
        id: 'art-s08',
        writerId: 'sofia-alcaraz',
        author: 'Sofia M. Alcaraz',
        title: 'The Anatomy of Tuition Fee Increases: A Five-Year Retrospective',
        category: 'Opinions',
        excerpt: 'Scrutinizing inflationary cost adjustments and capital outlay expenses across autonomous state universities.',
        date: 'Sep 28, 2026',
        rawDate: '2026-09-28',
        status: 'Published',
        views: 9180,
        shares: 785,
        remarks: '',
        content: `A multi-year review of state subsidy allocations reveals an increasing reliance on miscellaneous fees to fund operational shortfalls. This trend places growing financial burdens onto working-class households.`
    },

    // --- Marco L. Valderrama's Articles ---
    {
        id: 'art-m01',
        writerId: 'marco-valderrama',
        author: 'Marco L. Valderrama',
        title: 'University Administration Announces Phased Campus Wi-Fi Modernization',
        category: 'News',
        excerpt: 'Following student petitions, university IT reveals a ₱4.8M infrastructure overhaul targeting dead zones in dorms and satellite libraries.',
        date: 'Oct 20, 2026',
        rawDate: '2026-10-20',
        status: 'Published',
        views: 3840,
        shares: 260,
        remarks: '',
        content: `In response to sustained student reporting and council resolutions, the university administration has approved an expedited ₱4.8-million modernization budget for campus network infrastructure.\n\nPhase One will commence immediately across North Wing laboratories and graduate dormitories, installing high-throughput optical fiber links and enterprise dual-band wireless access points.`
    },
    {
        id: 'art-m02',
        writerId: 'marco-valderrama',
        author: 'Marco L. Valderrama',
        title: 'Editorial: Transparency in Mandatory Student Activity Fees',
        category: 'Opinions',
        excerpt: 'Why student councils and publication boards must demand open-ledger accounting for all semesterly collections.',
        date: 'Oct 21, 2026',
        rawDate: '2026-10-21',
        status: 'Pending Review',
        views: 0,
        shares: 0,
        remarks: '',
        content: `Every registration cycle, tens of thousands of enrolled undergraduates remit mandatory cultural, athletic, and development fees. Yet, detailed disbursement ledgers remain notoriously difficult to access.\n\nGenuine democratic student governance requires proactive fiscal disclosure. When student councils publish monthly expense receipts openly, community trust is fortified.`
    },
    {
        id: 'art-m03',
        writerId: 'marco-valderrama',
        author: 'Marco L. Valderrama',
        title: 'Budget Allocation Breakdown: Where Do Student Development Funds Go?',
        category: 'News',
        excerpt: 'An investigative report into capital expenditure ratios, athletics subsidies, and equipment acquisition funds.',
        date: 'Oct 20, 2026',
        rawDate: '2026-10-20',
        status: 'Pending Review',
        views: 0,
        shares: 0,
        remarks: '',
        content: `An examination of the fiscal year audit summaries demonstrates significant disparities in how departments disburse student activity funds. While central athletics programs received over 40% of allocations, student publication bodies operated on shoestring printing reserves.`
    },
    {
        id: 'art-m04',
        writerId: 'marco-valderrama',
        author: 'Marco L. Valderrama',
        title: 'Delayed Renovation of the Central Gymnasium Sparks Student Petitions',
        category: 'News',
        excerpt: 'Varsity athletes and physical education classes continue to train in makeshift outdoor courts six months past contractor deadlines.',
        date: 'Oct 17, 2026',
        rawDate: '2026-10-17',
        status: 'For Revision',
        views: 0,
        shares: 0,
        remarks: 'Please reach out to the university campus physical plant director for an official statement on the contractor penalty clause.',
        content: `The renovation of the University Central Gymnasium sits six months behind schedule, leaving over a dozen athletic teams and thousands of general physical education students competing for limited practice hours on exposed outdoor courts.\n\nContractor representatives cited material supply delays, but university student council representatives note that structural steel shipments arrived on site over two months ago.`
    },
    {
        id: 'art-m05',
        writerId: 'marco-valderrama',
        author: 'Marco L. Valderrama',
        title: 'Behind the Ballot: Preparations for the 2026 Student Council Elections',
        category: 'News',
        excerpt: 'Campus political alliances gear up for automated electronic voting as student electoral commission releases campaign rules.',
        date: 'Oct 08, 2026',
        rawDate: '2026-10-08',
        status: 'Published',
        views: 5280,
        shares: 382,
        remarks: '',
        content: `With candidacy filing closing this week, major student political alliances have begun canvassing dormitories and lecture halls in preparation for the upcoming University Student Council elections.\n\nThe Central Electoral Board has confirmed that voting will be conducted via an audited, open-source online balloting platform developed by senior computer science students.`
    },
    {
        id: 'art-m06',
        writerId: 'marco-valderrama',
        author: 'Marco L. Valderrama',
        title: 'Notes on the Proposed 4-Day Academic Week Policy',
        category: 'Opinions',
        excerpt: 'Weighing commuter savings against compressed laboratory schedules and intensive semester deadlines.',
        date: 'Oct 21, 2026',
        rawDate: '2026-10-21',
        status: 'Draft',
        views: 0,
        shares: 0,
        remarks: '',
        content: `As transportation costs continue to escalate, university administrators have floated a proposal to transition academic lectures to a compressed four-day schedule, leaving Fridays open for asynchronous independent study.`
    },
    {
        id: 'art-m07',
        writerId: 'marco-valderrama',
        author: 'Marco L. Valderrama',
        title: 'Campus Commuters Lament Rising Jeepney Fares Along University Route',
        category: 'News',
        excerpt: 'Student passenger advocacy groups lobby for fare discounts and dedicated morning shuttle services.',
        date: 'Sep 30, 2026',
        rawDate: '2026-09-30',
        status: 'Published',
        views: 4120,
        shares: 295,
        remarks: '',
        content: `Commuter students traveling from peripheral towns have voiced frustration over rising regional transport fares, which now consume up to 35% of their daily allowance.`
    },
    {
        id: 'art-m08',
        writerId: 'marco-valderrama',
        author: 'Marco L. Valderrama',
        title: 'Investigative: Dormitory Safety Standards and Fire Drill Compliance',
        category: 'Features',
        excerpt: 'Inspecting emergency stairwells, alarm panels, and safety protocols inside century-old university residential halls.',
        date: 'Sep 22, 2026',
        rawDate: '2026-09-22',
        status: 'Draft',
        views: 0,
        shares: 0,
        remarks: '',
        content: `An inspection of residential halls revealed several blocked egress paths and outdated extinguisher certificates, sparking calls for urgent safety compliance audits.`
    }
];

// Helper to strip any raw HTML tags from content
function cleanArticleContentText(content) {
    if (!content) return '';
    return content
        .replace(/<div><br\s*\/?><\/div>/gi, '\n\n')
        .replace(/<\/?div[^>]*>/gi, '\n')
        .replace(/<\/?p[^>]*>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
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
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Ensure content is cleanly sanitized
                return parsed.map(a => ({
                    ...a,
                    content: cleanArticleContentText(a.content)
                }));
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
