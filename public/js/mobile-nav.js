/* Accessible responsive navigation drawer, initialized after header.html loads. */
export function initMobileNav() {
    const menuButton = document.getElementById("menu-button");
    const navigation = document.getElementById("navigation");
    const closeButton = document.getElementById("close-nav-btn");
    const backdrop = document.getElementById("mobile-nav-backdrop");

    if (!menuButton || !navigation || menuButton.dataset.navReady === "true") return;
    menuButton.dataset.navReady = "true";

    const mobileViewport = window.matchMedia("(max-width: 767px)");
    const getFocusableItems = () => [...navigation.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter(element => !element.hidden);

    function syncAccessibilityState() {
        const isMobile = mobileViewport.matches;
        const isOpen = isMobile && navigation.classList.contains("mobile-open");
        navigation.inert = isMobile && !isOpen;
        navigation.setAttribute("aria-hidden", String(isMobile && !isOpen));
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
        backdrop?.classList.toggle("is-visible", isOpen);
        backdrop?.setAttribute("aria-hidden", String(!isOpen));
        document.body.classList.toggle("nav-open", isOpen);
    }

    function openNavigation() {
        if (!mobileViewport.matches) return;
        navigation.classList.add("mobile-open");
        syncAccessibilityState();
        window.requestAnimationFrame(() => (closeButton || getFocusableItems()[0])?.focus());
    }

    function closeNavigation({ restoreFocus = true } = {}) {
        const wasOpen = navigation.classList.contains("mobile-open");
        navigation.classList.remove("mobile-open");
        syncAccessibilityState();
        if (restoreFocus && wasOpen && mobileViewport.matches) menuButton.focus();
    }

    menuButton.addEventListener("click", () => {
        if (navigation.classList.contains("mobile-open")) closeNavigation({ restoreFocus: false });
        else openNavigation();
    });
    closeButton?.addEventListener("click", () => closeNavigation());
    backdrop?.addEventListener("click", () => closeNavigation());

    navigation.querySelectorAll("a[href]").forEach(link => {
        link.addEventListener("click", () => closeNavigation({ restoreFocus: false }));
    });

    document.addEventListener("keydown", event => {
        if (!navigation.classList.contains("mobile-open") || !mobileViewport.matches) return;
        if (event.key === "Escape") {
            event.preventDefault();
            closeNavigation();
            return;
        }
        if (event.key !== "Tab") return;

        const focusable = getFocusableItems();
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

    mobileViewport.addEventListener("change", () => {
        navigation.classList.remove("mobile-open");
        syncAccessibilityState();
    });

    syncAccessibilityState();
}
