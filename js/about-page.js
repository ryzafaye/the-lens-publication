const executiveRoles = [
    "President", "Vice President", "Secretary", "Associate Secretary", "Associate Secretary",
    "Treasurer", "Auditor", "Public Relations Officer"
];
const editorialRoles = [
    "Editorial-in-Chief", "Associate Editor-in-Chief", "News Editor", "Science and Technology Editor",
    "Feature Editor", "Literature Editor", "Documentary and Podcast Head", "Photojournalist Head",
    "M&PC Head", "Assoc M&PC Head", "Cartoonist Head"
];

export const leadershipRoster = [...executiveRoles, ...editorialRoles].map((position, index) => ({
    id: `lead-${index + 1}`,
    position,
    group: index < executiveRoles.length ? "Executive Board" : "Editorial and Media Heads",
    name: "Officer Name",
    portrait: "images/member-placeholder.svg",
    portraitAlt: `${position} profile photo`
}));

export const stafferRoster = Array.from({ length: 43 }, (_, index) => ({
    id: `staffer-${String(index + 1).padStart(2, "0")}`,
    position: "Publication Staffer",
    group: "Staff",
    name: `Staff Member ${String(index + 1).padStart(2, "0")}`,
    portrait: "images/member-placeholder.svg",
    portraitAlt: "Publication staff member profile photo"
}));

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function memberCard(member, { compact = false } = {}) {
    const name = escapeHTML(member.name);
    const role = escapeHTML(member.position);
    return `
        <article class="member-profile-card${compact ? " member-profile-card-compact" : ""}" data-member-id="${escapeHTML(member.id)}">
            <div class="member-profile-photo-wrap"><img class="member-profile-photo" src="${escapeHTML(member.portrait)}" alt="${escapeHTML(member.portraitAlt)}" loading="lazy"></div>
            <div class="member-profile-info"><p class="member-role-label">${role}</p><h3>${name}</h3></div>
        </article>`;
}

export function initAboutPage() {
    const executiveGrid = document.getElementById("executive-grid");
    if (!executiveGrid || executiveGrid.dataset.rendered === "true") return;
    // The About page intentionally shows only the executive board. The full 19-role
    // leadership roster and all 43 staffers live on members.html.
    executiveGrid.innerHTML = leadershipRoster.slice(0, 8).map(member => memberCard(member)).join("");
    executiveGrid.dataset.rendered = "true";
}

let membersScrollListenerBound = false;
let membersHeaderResizeObserver = null;

function syncMembersStickyOffset() {
    const header = document.getElementById("header-container");
    if (!header) return;
    const height = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--site-header-sticky-height", `${height}px`);
}

function syncMembersBackToTop() {
    const button = document.getElementById("members-back-to-top");
    if (!button) return;
    button.classList.toggle("is-visible", window.scrollY > 520);
    button.setAttribute("aria-hidden", window.scrollY > 520 ? "false" : "true");
}

export function initMembersPage() {
    const leadershipGrid = document.getElementById("all-leadership-grid");
    const stafferGrid = document.getElementById("staffer-grid");
    if (!leadershipGrid || !stafferGrid) return;
    if (leadershipGrid.dataset.rendered !== "true") {
        leadershipGrid.innerHTML = leadershipRoster.map(member => memberCard(member, { compact: true })).join("");
        stafferGrid.innerHTML = stafferRoster.map(member => memberCard(member, { compact: true })).join("");
        leadershipGrid.dataset.rendered = "true";
    }

    syncMembersStickyOffset();
    const header = document.getElementById("header-container");
    if (header && "ResizeObserver" in window && !membersHeaderResizeObserver) {
        membersHeaderResizeObserver = new ResizeObserver(syncMembersStickyOffset);
        membersHeaderResizeObserver.observe(header);
    }
    if (!window.__lensMembersResizeBound) {
        window.__lensMembersResizeBound = true;
        window.addEventListener("resize", syncMembersStickyOffset, { passive: true });
    }
    const backToTop = document.getElementById("members-back-to-top");
    if (backToTop && backToTop.dataset.bound !== "true") {
        backToTop.dataset.bound = "true";
        backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
    if (!membersScrollListenerBound) {
        membersScrollListenerBound = true;
        window.addEventListener("scroll", syncMembersBackToTop, { passive: true });
    }
    syncMembersBackToTop();
}
