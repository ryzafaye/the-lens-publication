/**
 * ============================================================================
 * THE LENS — WRITER SHELL CONTROLLER
 * Shared Chrome & Navigation for Staff Writer Portal Pages
 * ============================================================================
 */

(function () {
    'use strict';

    if (window.__writerShellInitialized) {
        return;
    }
    window.__writerShellInitialized = true;

    function initWriterShell() {

        // =====================================================================
        // 1. DYNAMIC WRITER PROFILE & ROLE HYDRATION
        // =====================================================================
        function hydrateWriterProfile() {
            let writerName = localStorage.getItem('writerName') || 'Sofia M. Alcaraz';
            let writerRole = 'Writer';
            let writerId = localStorage.getItem('writerId') || 'sofia-alcaraz';

            try {
                const storedRole = localStorage.getItem('userRole');
                const storedName = localStorage.getItem('userName');

                // If user is actively logged in as a writer, keep writer state in sync
                if (storedRole === 'Writer' && storedName) {
                    writerName = storedName;
                } else if (!storedRole) {
                    // Only initialize default writer if no session role exists at all
                    localStorage.setItem('userRole', 'Writer');
                    localStorage.setItem('userName', 'Sofia M. Alcaraz');
                    localStorage.setItem('writerName', 'Sofia M. Alcaraz');
                    localStorage.setItem('writerId', 'sofia-alcaraz');
                }
            } catch (e) {
                // Storage unavailable
            }

            // Always display strictly "Writer" (no Junior/Senior)
            writerRole = 'Writer';

            const sidebarWriterName = document.getElementById('sidebar-writer-name');
            const sidebarUserRole = document.getElementById('sidebar-user-role');
            const topbarUserRole = document.getElementById('topbar-user-role');
            const mobileUserRole = document.getElementById('mobile-user-role');
            const mobileWriterName = document.getElementById('mobile-writer-name') || document.querySelector('.mobile-nav-name');

            if (sidebarWriterName) sidebarWriterName.textContent = writerName;
            if (sidebarUserRole) sidebarUserRole.textContent = writerRole;
            if (topbarUserRole) topbarUserRole.textContent = writerRole;
            if (mobileUserRole) mobileUserRole.textContent = writerRole;
            if (mobileWriterName) mobileWriterName.textContent = writerName;
        }

        hydrateWriterProfile();

        // =====================================================================
        // 2. REAL-TIME DESKTOP CLOCK
        // =====================================================================
        const clockDisplay = document.getElementById('topbar-clock-display');
        function updateDesktopClock() {
            if (!clockDisplay) return;
            const now = new Date();
            const datePart = now.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            const timePart = now.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            clockDisplay.textContent = `${datePart} | ${timePart}`;
        }
        updateDesktopClock();
        setInterval(updateDesktopClock, 1000);

        // =====================================================================
        // 3. MOBILE HAMBURGER MENU ACCORDION
        // =====================================================================
        const mobileHamburgerBtn = document.getElementById('mobile-hamburger-btn');
        const mobileNavDropdown = document.getElementById('mobile-nav-dropdown');

        if (mobileHamburgerBtn && mobileNavDropdown) {
            mobileHamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = mobileNavDropdown.classList.contains('open');
                if (isOpen) {
                    mobileNavDropdown.classList.remove('open');
                    mobileHamburgerBtn.setAttribute('aria-expanded', 'false');
                } else {
                    mobileNavDropdown.classList.add('open');
                    mobileHamburgerBtn.setAttribute('aria-expanded', 'true');
                }
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!mobileNavDropdown.contains(e.target) && !mobileHamburgerBtn.contains(e.target)) {
                    mobileNavDropdown.classList.remove('open');
                    mobileHamburgerBtn.setAttribute('aria-expanded', 'false');
                }
            });

            // Close on escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && mobileNavDropdown.classList.contains('open')) {
                    mobileNavDropdown.classList.remove('open');
                    mobileHamburgerBtn.setAttribute('aria-expanded', 'false');
                    mobileHamburgerBtn.focus();
                }
            });
        }

        // =====================================================================
        // 4. LOGOUT HANDLER
        // =====================================================================
        function handleLogout() {
            try {
                localStorage.removeItem('userRole');
                localStorage.removeItem('studentNumber');
                localStorage.removeItem('userName');
                localStorage.removeItem('writerId');
            } catch (e) {}
            window.location.href = 'login.html';
        }

        const logoutBtn = document.getElementById('logout-btn');
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWriterShell);
    } else {
        initWriterShell();
    }
})();

