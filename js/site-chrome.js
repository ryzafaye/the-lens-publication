let revealObserver = null;

function updateSiteDate() {
    const now = new Date();
    const currentDate = document.getElementById("current-date");
    const copyrightYear = document.getElementById("copyright-year");

    if (currentDate) {
        currentDate.textContent = new Intl.DateTimeFormat("en-PH", {
            timeZone: "Asia/Manila", weekday: "short", month: "short", day: "numeric", year: "numeric"
        }).format(now).toUpperCase();
    }
    if (copyrightYear) {
        copyrightYear.textContent = new Intl.DateTimeFormat("en-PH", {
            timeZone: "Asia/Manila", year: "numeric"
        }).format(now);
    }
}

/* Keep the shared site header sticky; scroll state changes shadow only, never layout geometry. */
export function initStickyHeader() {
    const header = document.getElementById("header-container");
    if (!header || header.dataset.stickyReady === "true") return;
    header.dataset.stickyReady = "true";

    let framePending = false;
    const updateHeaderState = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 32);
        framePending = false;
    };
    const onScroll = () => {
        if (framePending) return;
        framePending = true;
        window.requestAnimationFrame(updateHeaderState);
    };

    updateHeaderState();
    window.addEventListener("scroll", onScroll, { passive: true });
}

export function initSiteChrome() {
    updateSiteDate();

    // Demo-only member status hook. The public reader interface itself has no member portal.
    try {
        const activeUser = JSON.parse(sessionStorage.getItem("thelens_active_user") || "null");
        const loginBtn = document.getElementById("member-login-btn");
        if (!activeUser || !loginBtn) return;
        loginBtn.innerHTML = `
            <span class="member-status-label"><i class="fa-solid fa-circle-user" aria-hidden="true"></i>
            <span>${String(activeUser.name || "Member").replace(/[&<>"']/g, "")}</span>
            <small>${String(activeUser.role || "").replace(/[&<>"']/g, "")}</small></span>
            <button type="button" id="logout-action-btn" class="logout-action-btn" aria-label="Log out" title="Log out"><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i></button>`;
        loginBtn.removeAttribute("href");
        loginBtn.classList.add("is-signed-in");
        document.getElementById("logout-action-btn")?.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            sessionStorage.removeItem("thelens_active_user");
            window.location.reload();
        });
    } catch (error) {
        console.warn("Could not read member status:", error);
    }
}

export function initMotionEffects(root = document) {
    const elements = root.querySelectorAll(".reveal-on-scroll:not([data-motion-ready])");
    if (!elements.length) return;

    if ("IntersectionObserver" in window) {
        if (!revealObserver) {
            revealObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    entry.target.classList.remove("motion-pending");
                    revealObserver.unobserve(entry.target);
                });
            }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
        }
        elements.forEach(element => {
            element.dataset.motionReady = "true";
            element.classList.add("motion-pending");
            revealObserver.observe(element);
        });
    } else {
        elements.forEach(element => element.classList.add("is-visible"));
    }
}
