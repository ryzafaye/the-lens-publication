import { includePartials } from "./include.js";
import { initRouter, updateActiveNavLink } from "./router.js";
import { initSearch } from "./search.js";
import { initMobileNav } from "./mobile-nav.js";
import { initSiteChrome, initMotionEffects, initStickyHeader } from "./site-chrome.js";
import "./article-modal.js";
import { renderHomePage } from "./home.js";
import { renderCategoryPage } from "./category.js";
import { renderArchivesPage, initArchiveFilter } from "./archives.js";
import { initAboutPage, initMembersPage } from "./about-page.js";
import { initDocumentLibrary } from "./document-library.js";
import { applyPublicationLinks } from "./site-config.js";
import { initFeedbackForm } from "./feedback.js";
import { initAuthorPage } from "./author-page.js";

// Things that live inside <main> and must run again after every page swap.
function renderPage() {
    // The Archives page has a dedicated browse-by-category control, so the global search/sort stays on public article tabs only.
    document.body.classList.toggle("archive-page", Boolean(document.getElementById("archive-articles")));
    renderHomePage();
    renderCategoryPage();
    renderArchivesPage();
    initArchiveFilter();
    initMotionEffects();
    initAboutPage();
    initMembersPage();
    initDocumentLibrary();
    initFeedbackForm();
    initAuthorPage();
    applyPublicationLinks(document);
}

await includePartials();   // header, footer, and any partial inside <main>
applyPublicationLinks(document);
initSearch();              // header pieces only need to run once
initMobileNav();
initSiteChrome();
initStickyHeader();
updateActiveNavLink();
renderPage();
initRouter(renderPage);
