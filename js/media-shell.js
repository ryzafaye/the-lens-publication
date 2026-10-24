/**
 * ============================================================================
 * THE LENS — MEDIA & COMMUNICATION TEAM SHELL CONTROLLER
 * Shared Chrome & Navigation for Media & Communication Team Portal Pages
 * ============================================================================
 */

(function () {
    'use strict';

    if (window.__mediaShellInitialized) {
        return;
    }
    window.__mediaShellInitialized = true;

    function initMediaShell() {

        // =====================================================================
        // 1. DYNAMIC PROFILE & ROLE HYDRATION
        // =====================================================================
        function hydrateMediaProfile() {
            let mediaName = localStorage.getItem('mediaName') || localStorage.getItem('userName') || 'Alyssa Marie Dizon';
            let mediaRole = localStorage.getItem('mediaRole') || 'Media & Communication';
            let studentNumber = localStorage.getItem('mediaStudentNumber') || localStorage.getItem('studentNumber') || '2024-00080-BN-0';
            let avatar = localStorage.getItem('mediaAvatar') || localStorage.getItem('userAvatar') || 'images/member-placeholder.svg';

            // Ensure cached
            localStorage.setItem('mediaName', mediaName);
            localStorage.setItem('mediaRole', mediaRole);
            localStorage.setItem('mediaStudentNumber', studentNumber);
            localStorage.setItem('userRole', mediaRole);
            localStorage.setItem('userName', mediaName);

            // Update DOM Elements
            const sidebarUserName = document.getElementById('sidebar-user-name');
            const sidebarUserRole = document.getElementById('sidebar-user-role');
            const sidebarAvatarImg = document.getElementById('sidebar-avatar-img') || document.getElementById('sidebar-user-avatar');

            const topbarUserRole = document.getElementById('topbar-user-role');
            const topbarAvatarImg = document.getElementById('topbar-avatar-img');

            const mobileUserName = document.getElementById('mobile-user-name');
            const mobileUserRole = document.getElementById('mobile-user-role');
            const mobileAvatarImg = document.getElementById('mobile-avatar-img');

            if (sidebarUserName) sidebarUserName.textContent = mediaName;
            if (sidebarUserRole) sidebarUserRole.textContent = mediaRole;
            if (sidebarAvatarImg) sidebarAvatarImg.src = avatar;

            if (topbarUserRole) topbarUserRole.textContent = mediaRole;
            if (topbarAvatarImg) topbarAvatarImg.src = avatar;

            if (mobileUserName) mobileUserName.textContent = mediaName;
            if (mobileUserRole) mobileUserRole.textContent = mediaRole;
            if (mobileAvatarImg) mobileAvatarImg.src = avatar;
        }

        hydrateMediaProfile();

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

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileNavDropdown.contains(e.target) && !mobileHamburgerBtn.contains(e.target)) {
                    mobileNavDropdown.classList.remove('open');
                    mobileHamburgerBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // =====================================================================
        // 4. ACTIVE NAVIGATION LINK HIGHLIGHTING
        // =====================================================================
        function highlightActiveNav() {
            const currentPath = window.location.pathname.split('/').pop() || 'media-dashboard.html';

            const navLinks = document.querySelectorAll('.sidebar-nav-item, .sidebar-footer-link, .mobile-nav-link, .mobile-nav-footer-link');
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (!href) return;
                const linkFile = href.split('/').pop().split('?')[0];

                if (linkFile === currentPath) {
                    link.classList.add('active');
                } else if (!link.classList.contains('logout-btn') && !link.classList.contains('mobile-logout-btn')) {
                    // Do not remove active if hardcoded correctly unless mismatched
                    if (linkFile.startsWith('media-') && currentPath.startsWith('media-')) {
                        link.classList.remove('active');
                    }
                }
            });
        }
        highlightActiveNav();

        // =====================================================================
        // 5. LOGOUT HANDLER
        // =====================================================================
        const logoutButtons = document.querySelectorAll('#logout-btn, #mobile-logout-btn, .logout-btn');
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const confirmed = confirm('Are you sure you want to log out of The Lens Media & Communication Portal?');
                if (confirmed) {
                    sessionStorage.clear();
                    window.location.href = 'login.html';
                }
            });
        });

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMediaShell);
    } else {
        initMediaShell();
    }

})();

