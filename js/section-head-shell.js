/**
 * ============================================================================
 * THE LENS — REUSABLE SECTION HEAD SHELL CONTROLLER
 * Shared Chrome & Navigation across all Section Head Portal Pages
 * ============================================================================
 */

(function () {
    'use strict';

    if (window.__sectionHeadShellInitialized) {
        return;
    }
    window.__sectionHeadShellInitialized = true;

    function initSectionHeadShell() {

        // =====================================================================
        // 1. DYNAMIC SECTION HEAD PROFILE & ROLE HYDRATION
        // =====================================================================
        function hydrateSectionHeadProfile() {
            let role = 'News Head';
            let name = 'Danilo C. Ramos';
            let section = 'News';
            let studentNum = '2024-00051-BN-0';

            try {
                const storedRole = localStorage.getItem('sectionHeadRole') || (localStorage.getItem('userRole') && localStorage.getItem('userRole').toLowerCase().includes('head') ? localStorage.getItem('userRole') : null);
                const storedName = localStorage.getItem('sectionHeadName') || (storedRole ? localStorage.getItem('userName') : null);
                const storedSection = localStorage.getItem('sectionHeadSection');
                const storedNum = localStorage.getItem('sectionHeadStudentNumber') || (storedRole ? localStorage.getItem('studentNumber') : null);

                if (storedRole && storedRole.toLowerCase().includes('head')) {
                    role = storedRole;
                    if (storedName) name = storedName;
                    if (storedSection) section = storedSection;
                    if (storedNum) studentNum = storedNum;
                } else {
                    // Initialize default News Head session
                    role = 'News Head';
                    name = 'Danilo C. Ramos';
                    section = 'News';
                    studentNum = '2024-00051-BN-0';
                    localStorage.setItem('userRole', 'News Head');
                    localStorage.setItem('userName', 'Danilo C. Ramos');
                    localStorage.setItem('studentNumber', '2024-00051-BN-0');
                    localStorage.setItem('sectionHeadRole', 'News Head');
                    localStorage.setItem('sectionHeadName', 'Danilo C. Ramos');
                    localStorage.setItem('sectionHeadSection', 'News');
                    localStorage.setItem('sectionHeadStudentNumber', '2024-00051-BN-0');
                }
            } catch (e) {
                // Storage unavailable
            }

            const sidebarUserName = document.getElementById('sidebar-user-name');
            const sidebarUserRole = document.getElementById('sidebar-user-role');
            const topbarUserRole = document.getElementById('topbar-user-role');
            const mobileUserRole = document.getElementById('mobile-user-role');
            const mobileUserName = document.getElementById('mobile-user-name');
            const sectionBadges = document.querySelectorAll('.dynamic-section-name');

            if (sidebarUserName) sidebarUserName.textContent = name;
            if (sidebarUserRole) sidebarUserRole.textContent = role;
            if (topbarUserRole) topbarUserRole.textContent = role;
            if (mobileUserRole) mobileUserRole.textContent = role;
            if (mobileUserName) mobileUserName.textContent = name;

            sectionBadges.forEach(badge => {
                badge.textContent = section;
            });

            // Hydrate avatar if present
            const avatarImg = localStorage.getItem('sectionHeadAvatar') || localStorage.getItem('userAvatar') || 'images/member-placeholder.svg';
            const sidebarAvatar = document.getElementById('sidebar-avatar-img') || document.querySelector('.sidebar-profile .profile-avatar img');
            if (sidebarAvatar && avatarImg) {
                sidebarAvatar.src = avatarImg;
            }
        }

        hydrateSectionHeadProfile();

        // =====================================================================
        // 2. REAL-TIME DESKTOP CLOCK (Asia/Manila)
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
        // 3. MOBILE HAMBURGER NAVIGATION & ACCORDION
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

            document.addEventListener('click', (e) => {
                if (!mobileNavDropdown.contains(e.target) && !mobileHamburgerBtn.contains(e.target)) {
                    mobileNavDropdown.classList.remove('open');
                    mobileHamburgerBtn.setAttribute('aria-expanded', 'false');
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && mobileNavDropdown.classList.contains('open')) {
                    mobileNavDropdown.classList.remove('open');
                    mobileHamburgerBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // =====================================================================
        // 4. ACTIVE PAGE NAVIGATION HIGHLIGHTING
        // =====================================================================
        function highlightActiveNavigation() {
            const currentPath = window.location.pathname;
            const filename = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'section-head-dashboard.html';

            const navItems = document.querySelectorAll('.sidebar-nav-item, .mobile-nav-link');
            navItems.forEach(item => {
                const targetPage = item.getAttribute('href') || item.getAttribute('data-page') || '';
                if (targetPage && (targetPage === filename || (filename === '' && targetPage === 'section-head-dashboard.html'))) {
                    item.classList.add('active');
                    item.setAttribute('aria-current', 'page');
                } else if (!item.classList.contains('active-manual')) {
                    item.classList.remove('active');
                    item.removeAttribute('aria-current');
                }
            });
        }
        highlightActiveNavigation();

        // =====================================================================
        // 5. LOGOUT SESSION CLEANUP
        // =====================================================================
        const logoutBtns = document.querySelectorAll('#logout-btn, .logout-btn');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                try {
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('studentNumber');
                    localStorage.removeItem('sectionHeadRole');
                    localStorage.removeItem('sectionHeadName');
                    localStorage.removeItem('sectionHeadSection');
                    localStorage.removeItem('sectionHeadStudentNumber');
                } catch (err) {
                    console.warn('Storage cleanup issue on logout', err);
                }
                window.location.href = 'login.html';
            });
        });

        // Global interface exposure for other page scripts
        window.SectionHeadShell = {
            hydrateSectionHeadProfile,
            updateDesktopClock
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSectionHeadShell);
    } else {
        initSectionHeadShell();
    }
})();

