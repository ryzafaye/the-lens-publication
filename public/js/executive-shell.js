(function () {
    'use strict';

    if (window.__executiveShellInitialized) return;
    window.__executiveShellInitialized = true;

    function initExecutiveShell() {
        // Desktop Clock
        function updateDesktopClock() {
            const clockDisplays = document.querySelectorAll('#topbar-clock-display, .topbar-clock span:last-child');
            if (!clockDisplays.length) return;
            const now = new Date();
            const datePart = now.toLocaleDateString('en-US', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', year: 'numeric' });
            const timePart = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit', hour12: true });
            const formatted = datePart + ' | ' + timePart;
            clockDisplays.forEach(el => {
                if (el.textContent !== formatted) el.textContent = formatted;
            });
        }
        updateDesktopClock();
        setInterval(updateDesktopClock, 1000);

        // Mobile Hamburger Navigation
        const mobileHamburgerBtn = document.getElementById('mobile-hamburger-btn');
        const mobileNavDropdown = document.getElementById('mobile-nav-dropdown');

        if (mobileHamburgerBtn && mobileNavDropdown) {
            let backdrop = document.getElementById('mobile-nav-backdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.id = 'mobile-nav-backdrop';
                backdrop.className = 'mobile-nav-backdrop';
                mobileNavDropdown.parentNode.insertBefore(backdrop, mobileNavDropdown);
            }

            function isNavOpen() {
                return mobileNavDropdown.classList.contains('open');
            }

            function setNavState(open) {
                const icon = mobileHamburgerBtn.querySelector('i');
                if (open) {
                    mobileNavDropdown.classList.add('open', 'active', 'expanded');
                    if (backdrop) backdrop.classList.add('open', 'active', 'expanded');
                    mobileHamburgerBtn.setAttribute('aria-expanded', 'true');
                    document.body.classList.add('mobile-nav-open');
                    if (icon) { icon.classList.remove('fa-bars'); icon.classList.add('fa-xmark'); }
                } else {
                    mobileNavDropdown.classList.remove('open', 'active', 'expanded');
                    if (backdrop) backdrop.classList.remove('open', 'active', 'expanded');
                    mobileHamburgerBtn.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('mobile-nav-open');
                    if (icon) { icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars'); }
                }
            }

            mobileHamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                setNavState(!isNavOpen());
            });
            if (backdrop) backdrop.addEventListener('click', () => setNavState(false));
            
            document.addEventListener('click', (e) => {
                if (isNavOpen() && !mobileNavDropdown.contains(e.target) && !mobileHamburgerBtn.contains(e.target)) {
                    setNavState(false);
                }
            });
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768 && isNavOpen()) setNavState(false);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExecutiveShell);
    } else {
        initExecutiveShell();
    }
})();