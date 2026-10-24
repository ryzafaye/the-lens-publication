/**
 * ============================================================================
 * THE LENS — REUSABLE MEDIA & PUBLIC COMMUNICATIONS (M&PC) SHELL CONTROLLER
 * Shared Chrome & Navigation across all M&PC Portal Pages
 * ============================================================================
 */

(function () {
    'use strict';

    if (window.__mpcShellInitialized) {
        return;
    }
    window.__mpcShellInitialized = true;

    function initMPCShell() {

        // =====================================================================
        // 1. DYNAMIC M&PC PROFILE & ROLE HYDRATION
        // =====================================================================
        function hydrateMPCProfile() {
            let role = 'M&PC Head';
            let name = 'Julian Del Rosario';
            let studentNum = '2024-00020-BN-0';

            try {
                const storedRole = localStorage.getItem('mpcRole') || (localStorage.getItem('userRole') && (localStorage.getItem('userRole').toLowerCase().includes('media') || localStorage.getItem('userRole').toLowerCase().includes('communications') || localStorage.getItem('userRole').toLowerCase().includes('m&pc')) ? localStorage.getItem('userRole') : null);
                const storedName = localStorage.getItem('mpcName') || (storedRole ? localStorage.getItem('userName') : null);
                const storedNum = localStorage.getItem('mpcStudentNumber') || (storedRole ? localStorage.getItem('studentNumber') : null);

                if (storedRole && (storedRole.toLowerCase().includes('media') || storedRole.toLowerCase().includes('communications') || storedRole.toLowerCase().includes('m&pc'))) {
                    // Normalize to clean M&PC Head / Assoc M&PC Head
                    if (storedRole.toLowerCase().includes('assoc')) {
                        role = 'Assoc M&PC Head';
                    } else {
                        role = 'M&PC Head';
                    }
                    if (storedName) name = storedName;
                    if (storedNum) studentNum = storedNum;
                } else {
                    // Initialize default M&PC session
                    role = 'M&PC Head';
                    name = 'Julian Del Rosario';
                    studentNum = '2024-00020-BN-0';
                    localStorage.setItem('userRole', 'M&PC Head');
                    localStorage.setItem('userName', 'Julian Del Rosario');
                    localStorage.setItem('studentNumber', '2024-00020-BN-0');
                    localStorage.setItem('mpcRole', 'M&PC Head');
                    localStorage.setItem('mpcName', 'Julian Del Rosario');
                    localStorage.setItem('mpcStudentNumber', '2024-00020-BN-0');
                }
            } catch (e) {
                // Storage unavailable
            }

            const sidebarUserName = document.getElementById('sidebar-user-name');
            const sidebarUserRole = document.getElementById('sidebar-user-role');
            const topbarUserRole = document.getElementById('topbar-user-role');
            const mobileUserRole = document.getElementById('mobile-user-role');
            const mobileUserName = document.getElementById('mobile-user-name');

            if (sidebarUserName) sidebarUserName.textContent = name;
            if (sidebarUserRole) sidebarUserRole.textContent = role;
            if (topbarUserRole) topbarUserRole.textContent = role;
            if (mobileUserRole) mobileUserRole.textContent = role;
            if (mobileUserName) mobileUserName.textContent = name;

            // Hydrate avatar if present
            const avatarImg = localStorage.getItem('mpcAvatar') || localStorage.getItem('userAvatar') || 'images/member-placeholder.svg';
            const sidebarAvatar = document.getElementById('sidebar-user-avatar') || document.querySelector('.sidebar-profile .profile-avatar img');
            const topbarAvatar = document.querySelector('.topbar-avatar-circle img');
            const mobileAvatar = document.querySelector('.mobile-nav-avatar img');
            if (sidebarAvatar && avatarImg) sidebarAvatar.src = avatarImg;
            if (topbarAvatar && avatarImg) topbarAvatar.src = avatarImg;
            if (mobileAvatar && avatarImg) mobileAvatar.src = avatarImg;
        }

        hydrateMPCProfile();

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
            const filename = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'mpc-dashboard.html';

            const navItems = document.querySelectorAll('.sidebar-nav-item, .mobile-nav-link');
            navItems.forEach(item => {
                const targetPage = item.getAttribute('href') || item.getAttribute('data-page') || '';
                if (targetPage && (targetPage === filename || (filename === '' && targetPage === 'mpc-dashboard.html'))) {
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
        const logoutBtns = document.querySelectorAll('#logout-btn, #mobile-logout-btn, .logout-btn');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                try {
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('studentNumber');
                    localStorage.removeItem('mpcRole');
                    localStorage.removeItem('mpcName');
                    localStorage.removeItem('mpcStudentNumber');
                } catch (err) {
                    console.warn('Storage cleanup issue on logout', err);
                }
                window.location.href = 'login.html';
            });
        });

        // Global interface exposure
        window.MPCShell = {
            hydrateMPCProfile,
            updateDesktopClock
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMPCShell);
    } else {
        initMPCShell();
    }
})();

