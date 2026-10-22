import { includePartials } from "./include.js";

// Highlights the nav link that matches the current page.
export function updateActiveNavLink() {
    const page = window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll("#navigation a").forEach(link => {
        const isActive = link.getAttribute("href") === page;
        link.classList.toggle("active", isActive);
        link.classList.toggle("border-white", isActive);
        link.classList.toggle("text-white", isActive);
        link.classList.toggle("border-transparent", !isActive);
        link.classList.toggle("text-white/90", !isActive);
    });
}

// Swaps <main> instead of reloading the whole page. `onPageChange` re-renders the new content.
export function initRouter(onPageChange) {
    document.addEventListener("click", async event => {
        const link = event.target.closest("a");
        if (!link) return;

        const href = link.getAttribute("href");
        // Let the browser handle downloads, external links, contact links, and new tabs.
        // Only same-site HTML navigation should be intercepted for the SPA page swap.
        const skip = !href || link.hasAttribute("download")
            || link.hasAttribute("data-no-router")
            || href.includes("login.html")
            || /^(https?:\/\/|mailto:|tel:|data:|javascript:)/i.test(href)
            || href.startsWith("#") || link.target === "_blank";
        if (skip) return;

        event.preventDefault();
        const openArticleDialog = document.getElementById("article-modal");
        if (openArticleDialog?.open) openArticleDialog.close();
        document.getElementById("navigation")?.classList.remove("mobile-open");
        document.body.classList.remove("mobile-nav-open");
        window.history.pushState({}, "", href);
        await loadPage(href, onPageChange);
    });

    window.addEventListener("popstate", () => {
        loadPage(window.location.pathname + window.location.search, onPageChange);
    });
}

async function loadPage(url, onPageChange) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Page not found");

        const doc = new DOMParser().parseFromString(await response.text(), "text/html");
        const newMain = doc.querySelector("main");
        if (!newMain) throw new Error("No <main> in " + url);

        document.querySelector("main").replaceWith(document.importNode(newMain, true));
        if (doc.title) document.title = doc.title;
        window.scrollTo({ top: 0, behavior: "smooth" });

        await includePartials(document.querySelector("main"));
        updateActiveNavLink();
        onPageChange();
        if (window.location.hash && !/^#article-\d+$/.test(window.location.hash)) {
            const targetId = decodeURIComponent(window.location.hash.slice(1));
            window.setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
        }
    } catch (error) {
        console.error("Page swap failed:", error);
        window.location.href = url;
    }
}
