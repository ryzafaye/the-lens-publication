import { displayArchives } from "./archives.js";
import { categoryListItem } from "./article-templates.js";
import { articleMatchesDateFilter, escapeHTML, getPublicArticles, sortArticlesList } from "./article-utils.js";
import { initMotionEffects } from "./site-chrome.js";

let activeSearchMain = null;
let activeResultsSection = null;
let originalMainChildren = [];
let inputDebounce = null;

function articleSearchText(article) {
    return [article.title, article.excerpt, article.content, article.author, article.category, ...(article.tags || [])]
        .filter(Boolean).join(" ").toLocaleLowerCase();
}

function makeResultsSection(main) {
    if (activeSearchMain !== main) {
        activeSearchMain = main;
        activeResultsSection = null;
        originalMainChildren = [];
    }

    if (activeResultsSection?.isConnected && activeResultsSection.parentElement === main) return activeResultsSection;

    activeResultsSection = document.createElement("section");
    activeResultsSection.id = "global-search-results";
    activeResultsSection.className = "global-search-results";
    activeResultsSection.setAttribute("aria-live", "polite");
    main.insertBefore(activeResultsSection, main.firstElementChild);

    originalMainChildren = [...main.children]
        .filter(element => element !== activeResultsSection)
        .map(element => ({ element, wasHidden: element.hidden }));
    originalMainChildren.forEach(({ element }) => { element.hidden = true; });
    main.classList.add("global-search-active");
    return activeResultsSection;
}

function restoreDefaultMain() {
    const currentMain = document.querySelector("main");
    if (activeSearchMain && activeSearchMain === currentMain) {
        originalMainChildren.forEach(({ element, wasHidden }) => {
            if (element.isConnected) element.hidden = wasHidden;
        });
        activeResultsSection?.remove();
        activeSearchMain.classList.remove("global-search-active");
    }
    activeSearchMain = null;
    activeResultsSection = null;
    originalMainChildren = [];
}

function hideFilterDropdown(sortFilterBtn, filterDropdown) {
    filterDropdown?.classList.add("hidden");
    sortFilterBtn?.setAttribute("aria-expanded", "false");
}

function getDateSelectionValue() {
    const month = document.getElementById("date-month-select")?.value || "";
    const day = document.getElementById("date-day-select")?.value || "";
    const year = document.getElementById("date-year-select")?.value || "";
    return year || month || day ? `${year}|${month}|${day}` : "";
}

function getDateSelectionLabel(value) {
    if (!value || !String(value).includes("|")) return value || "";
    const [year = "", month = "", day = ""] = String(value).split("|");
    const monthName = month ? new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2020, Number(month) - 1, 1))) : "";
    if (monthName && day && year) return `${monthName} ${day}, ${year}`;
    if (monthName && year) return `${monthName} ${year}`;
    if (monthName && day) return `${monthName} ${day}`;
    if (monthName) return monthName;
    if (day && year) return `Day ${day}, ${year}`;
    if (day) return `Day ${day}`;
    return year ? String(year) : "";
}

function getFiltersFromHeader() {
    return {
        query: document.getElementById("search-input")?.value.trim() || "",
        category: document.getElementById("category-select")?.value || "All",
        sort: document.getElementById("sort-select")?.value || "newest",
        dateMode: document.getElementById("date-filter-type")?.value || "any",
        dateValue: getDateSelectionValue()
    };
}

function renderPublicSearchResults(filters) {
    const main = document.querySelector("main");
    if (!main) return;

    const resultsSection = makeResultsSection(main);
    const query = filters.query.toLocaleLowerCase();
    let matches = getPublicArticles().filter(article => {
        const categoryMatches = filters.category === "All" || article.category === filters.category;
        const queryMatches = !query || articleSearchText(article).includes(query);
        const dateMatches = articleMatchesDateFilter(article, filters.dateMode, filters.dateValue);
        return categoryMatches && queryMatches && dateMatches;
    });
    matches = sortArticlesList(matches, filters.sort);

    const activeFilterLabels = [];
    if (filters.query) activeFilterLabels.push(`“${escapeHTML(filters.query)}”`);
    if (filters.category !== "All") activeFilterLabels.push(escapeHTML(filters.category));
    if (filters.dateMode === "today") activeFilterLabels.push("Today");
    if (filters.dateMode === "this_week") activeFilterLabels.push("This week");
    if (filters.dateMode === "choose" && filters.dateValue) activeFilterLabels.push(escapeHTML(getDateSelectionLabel(filters.dateValue)));
    if (filters.sort === "popular") activeFilterLabels.push("Most viewed");
    else if (filters.sort === "oldest") activeFilterLabels.push("Oldest first");
    else if (filters.sort === "az") activeFilterLabels.push("A–Z");

    const resultSummary = `${matches.length} ${matches.length === 1 ? "article" : "articles"} found${activeFilterLabels.length ? ` · ${activeFilterLabels.join(" · ")}` : ""}.`;

    resultsSection.innerHTML = `
        <div class="search-results-heading">
            <div class="search-results-heading-copy">
                <p class="search-results-eyebrow">THE LENS · PUBLIC ARTICLES</p>
                <h1>Search Results</h1>
                <p class="search-results-summary">${resultSummary}</p>
            </div>
            <button type="button" class="search-results-clear" data-clear-global-search>
                <i class="fa-solid fa-arrow-rotate-left" aria-hidden="true"></i><span>Clear results</span>
            </button>
        </div>
        ${matches.length ? `
            <div class="category-list-grid search-results-grid">
                ${matches.map(categoryListItem).join("")}
            </div>
        ` : `
            <div class="search-empty-state">
                <i class="fa-regular fa-folder-open" aria-hidden="true"></i>
                <h2>No articles found</h2>
                <p>Try another keyword, author name, category, or published date.</p>
            </div>
        `}
    `;
    initMotionEffects(resultsSection);
}

export function initSearch() {
    const searchInput = document.getElementById("search-input");
    const searchForm = document.getElementById("search-form");
    const sortFilterBtn = document.getElementById("sort-filter-btn");
    const filterDropdown = document.getElementById("filter-dropdown");
    const closeFilterBtn = document.getElementById("close-filter-btn");
    const clearFiltersBtn = document.getElementById("clear-filters-btn");
    const sortSelect = document.getElementById("sort-select");
    const categorySelect = document.getElementById("category-select");
    const dateModeSelect = document.getElementById("date-filter-type");
    const dateValueWrap = document.getElementById("date-filter-value-wrap");
    const monthSelect = document.getElementById("date-month-select");
    const daySelect = document.getElementById("date-day-select");
    const yearSelect = document.getElementById("date-year-select");

    if (!searchForm || searchForm.dataset.eventsBound === "true") return;
    searchForm.dataset.eventsBound = "true";

    function populateYearOptions() {
        if (!yearSelect || yearSelect.dataset.optionsReady === "true") return;
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 1999 + 1 }, (_, index) => currentYear - index);
        years.forEach(year => {
            const option = document.createElement("option");
            option.value = String(year);
            option.textContent = String(year);
            yearSelect.appendChild(option);
        });
        yearSelect.dataset.optionsReady = "true";
    }

    function updateAvailableDays() {
        if (!daySelect) return;
        const selectedMonth = monthSelect?.value ? Number(monthSelect.value) : null;
        const selectedYear = yearSelect?.value ? Number(yearSelect.value) : null;
        let maxDay = 31;
        if (selectedMonth === 4 || selectedMonth === 6 || selectedMonth === 9 || selectedMonth === 11) maxDay = 30;
        if (selectedMonth === 2) {
            maxDay = selectedYear
                ? (new Date(selectedYear, 1, 29).getMonth() === 1 ? 29 : 28)
                : 29;
        }
        [...daySelect.options].forEach(option => {
            if (!option.value) return;
            const unavailable = Number(option.value) > maxDay;
            option.disabled = unavailable;
            option.hidden = unavailable;
        });
        if (daySelect.value && Number(daySelect.value) > maxDay) daySelect.value = "";
    }

    function updateDateInput() {
        if (!dateModeSelect || !dateValueWrap) return;
        populateYearOptions();
        const choosingDate = dateModeSelect.value === "choose";
        dateValueWrap.hidden = !choosingDate;
        [monthSelect, daySelect, yearSelect].forEach(select => { if (select) select.disabled = !choosingDate; });
        if (!choosingDate) {
            if (monthSelect) monthSelect.value = "";
            if (daySelect) daySelect.value = "";
            if (yearSelect) yearSelect.value = "";
        }
        updateAvailableDays();
    }

    if (dateModeSelect) {
        dateModeSelect.addEventListener("change", () => {
            updateDateInput();
            executeFilterAction();
        });
        updateDateInput();
    }

    if (sortFilterBtn && filterDropdown) {
        sortFilterBtn.addEventListener("click", event => {
            event.stopPropagation();
            const opening = filterDropdown.classList.contains("hidden");
            filterDropdown.classList.toggle("hidden", !opening);
            sortFilterBtn.setAttribute("aria-expanded", String(opening));
        });
        closeFilterBtn?.addEventListener("click", () => hideFilterDropdown(sortFilterBtn, filterDropdown));
        document.addEventListener("click", event => {
            if (!filterDropdown.contains(event.target) && !sortFilterBtn.contains(event.target)) {
                hideFilterDropdown(sortFilterBtn, filterDropdown);
            }
        });
    }

    function executeFilterAction(closeDropdown = false) {
        const filters = getFiltersFromHeader();

        const archiveContainer = document.getElementById("archive-articles");
        if (archiveContainer) {
            // The Archives page keeps its own list and filters; it does not include the public search results.
            const count = displayArchives(filters.category, filters.query, filters.sort, filters.dateMode, filters.dateValue);
            const message = document.getElementById("search-message");
            if (message) {
                const extras = [];
                if (filters.query) extras.push(`for “${filters.query}”`);
                if (filters.category !== "All") extras.push(filters.category);
                if (filters.dateMode === "today") extras.push("Today");
                if (filters.dateMode === "this_week") extras.push("This week");
                if (filters.dateMode === "choose" && filters.dateValue) extras.push(getDateSelectionLabel(filters.dateValue));
                message.textContent = `${count} ${count === 1 ? "article" : "articles"} found${extras.length ? ` ${extras.join(" · ")}` : ""}.`;
                message.classList.remove("hidden");
            }
            const archiveFilter = document.getElementById("archive-filter");
            if (archiveFilter) archiveFilter.value = filters.category;
            if (closeDropdown) hideFilterDropdown(sortFilterBtn, filterDropdown);
            return;
        }

        renderPublicSearchResults(filters);
        if (closeDropdown) hideFilterDropdown(sortFilterBtn, filterDropdown);
    }

    sortSelect?.addEventListener("change", () => executeFilterAction(false));
    categorySelect?.addEventListener("change", () => executeFilterAction(false));
    [monthSelect, daySelect, yearSelect].forEach(select => {
        select?.addEventListener("change", () => {
            updateAvailableDays();
            executeFilterAction(false);
        });
    });

    searchInput?.addEventListener("input", () => {
        window.clearTimeout(inputDebounce);
        inputDebounce = window.setTimeout(() => {
            // Start filtering as soon as a reader types; keep results visible when clearing a query.
            if (searchInput.value.trim() || activeResultsSection) executeFilterAction();
        }, 300);
    });

    searchForm.addEventListener("submit", event => {
        event.preventDefault();
        executeFilterAction(true);
    });

    function clearFilterValues() {
        if (searchInput) searchInput.value = "";
        if (categorySelect) categorySelect.value = "All";
        if (sortSelect) sortSelect.value = "newest";
        if (dateModeSelect) dateModeSelect.value = "any";
        [monthSelect, daySelect, yearSelect].forEach(select => { if (select) select.value = ""; });
        updateDateInput();
    }

    clearFiltersBtn?.addEventListener("click", () => {
        clearFilterValues();
        if (document.getElementById("archive-articles")) executeFilterAction();
        else restoreDefaultMain();
    });

    document.addEventListener("click", event => {
        if (event.target.closest("[data-clear-global-search]")) {
            clearFilterValues();
            restoreDefaultMain();
        }
    });
}
