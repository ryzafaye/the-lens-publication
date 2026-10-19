/**
 * ============================================================================
 * THE LENS — REUSABLE EXECUTIVE SHELL CONTROLLER
 * Shared Chrome & Navigation across all Executive Portal Pages
 * 
 * Clean, readable, modular controller that handles:
 *  1. User Role Hydration (topbar, sidebar, mobile nav)
 *  2. Real-Time Desktop Clock (Philippine local time)
 *  3. Mobile Hamburger Menu Toggle, Backdrop, Outside-Click, Escape & Resize
 *  4. Active Page Navigation Highlighting
 *  5. Reusable Sidebar Footer slot injection
 *  6. Executive Logout Handling
 * ============================================================================
 */

(function () {
    'use strict';

    // Prevent duplicate initialization if included multiple times
    if (window.__executiveShellInitialized) {
        return;
    }
    window.__executiveShellInitialized = true;

    function initExecutiveShell() {

        // =====================================================================
        // 1. REUSABLE SIDEBAR FOOTER INJECTION (if placeholder exists)
        // =====================================================================
        const footerSlot = document.querySelector('[data-include="executive-sidebar-footer.html"], [data-slot="sidebar-footer"]');
        if (footerSlot && footerSlot.children.length === 0) {
            footerSlot.innerHTML = `
                <a href="profile-settings.html" class="sidebar-footer-link" data-page="profile-settings.html">
                    <i class="fa-solid fa-sliders"></i>
                    <span>Profile Settings</span>
                </a>
                <a href="index.html" target="_blank" rel="noopener noreferrer" class="sidebar-footer-link">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    <span>View public site</span>
                </a>
                <button type="button" id="logout-btn" class="sidebar-footer-link logout-btn">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>Logout</span>
                </button>
            `;
            footerSlot.classList.add('sidebar-footer');
        }

        // =====================================================================
        // 2. DYNAMIC USER ROLE HYDRATION
        // =====================================================================
        function hydrateUserRole() {
            let role = 'President';
            try {
                role = localStorage.getItem('userRole') || 'President';
                if (!localStorage.getItem('userRole')) {
                    localStorage.setItem('userRole', 'President');
                }
            } catch (e) {
                // LocalStorage blocked or unavailable
            }

            const topbarRole = document.getElementById('topbar-user-role');
            const sidebarRole = document.getElementById('sidebar-user-role');
            const mobileRole = document.getElementById('mobile-user-role');

            if (topbarRole) topbarRole.textContent = role;
            if (sidebarRole) sidebarRole.textContent = role;
            if (mobileRole) mobileRole.textContent = role;
        }
        hydrateUserRole();

        // =====================================================================
        // 3. REAL-TIME DESKTOP CLOCK
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
        // 4. MOBILE HAMBURGER NAVIGATION & ACCORDION
        // =====================================================================
        const mobileHamburgerBtn = document.getElementById('mobile-hamburger-btn');
        const mobileNavDropdown = document.getElementById('mobile-nav-dropdown');

        if (mobileHamburgerBtn && mobileNavDropdown) {
            // Ensure backdrop element exists for clean click-outside overlay
            let backdrop = document.getElementById('mobile-nav-backdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.id = 'mobile-nav-backdrop';
                backdrop.className = 'mobile-nav-backdrop';
                mobileNavDropdown.parentNode.insertBefore(backdrop, mobileNavDropdown);
            }

            function isNavOpen() {
                return mobileNavDropdown.classList.contains('open') || 
                       mobileNavDropdown.classList.contains('active') || 
                       mobileNavDropdown.classList.contains('expanded');
            }

            function setNavState(open) {
                const icon = mobileHamburgerBtn.querySelector('i');
                if (open) {
                    mobileNavDropdown.classList.add('open', 'active', 'expanded');
                    if (backdrop) backdrop.classList.add('open', 'active', 'expanded');
                    mobileHamburgerBtn.setAttribute('aria-expanded', 'true');
                    document.body.classList.add('mobile-nav-open');
                    if (icon) {
                        icon.classList.remove('fa-bars');
                        icon.classList.add('fa-xmark');
                    }
                } else {
                    mobileNavDropdown.classList.remove('open', 'active', 'expanded');
                    if (backdrop) backdrop.classList.remove('open', 'active', 'expanded');
                    mobileHamburgerBtn.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('mobile-nav-open');
                    if (icon) {
                        icon.classList.remove('fa-xmark');
                        icon.classList.add('fa-bars');
                    }
                }
            }

            // Burger button click toggle
            mobileHamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                setNavState(!isNavOpen());
            });

            // Tap backdrop to close
            if (backdrop) {
                backdrop.addEventListener('click', () => setNavState(false));
            }

            // Tap anywhere outside to close
            document.addEventListener('click', (e) => {
                if (isNavOpen()) {
                    if (!mobileNavDropdown.contains(e.target) && !mobileHamburgerBtn.contains(e.target)) {
                        setNavState(false);
                    }
                }
            });

            // Close on Escape key press
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && isNavOpen()) {
                    setNavState(false);
                }
            });

            // Automatically close if screen resized back to desktop (> 768px)
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768 && isNavOpen()) {
                    setNavState(false);
                }
            });

            // Close menu when clicking any nav link inside mobile dropdown
            const mobileLinks = mobileNavDropdown.querySelectorAll('.mobile-nav-link, .mobile-nav-footer-link');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    setNavState(false);
                });
            });

            // Expose helper on window for debugging or manual control
            window.setExecutiveMobileNav = setNavState;
        }

        // =====================================================================
        // 5. ACTIVE NAVIGATION LINK HIGHLIGHTING
        // =====================================================================
        const currentPath = window.location.pathname.split('/').pop() || 'executive-dashboard.html';
        const navLinks = document.querySelectorAll('.sidebar-nav-item, .mobile-nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                const targetFile = href.split('#')[0];
                if (targetFile === currentPath || (currentPath === '' && targetFile === 'executive-dashboard.html')) {
                    link.classList.add('active');
                } else if (!href.startsWith('#')) {
                    link.classList.remove('active');
                }
            }
        });

        // =====================================================================
        // 6. EXECUTIVE LOGOUT HANDLING
        // =====================================================================
        function handleLogout(e) {
            e.preventDefault();
            try {
                localStorage.removeItem('userRole');
                localStorage.removeItem('studentNumber');
            } catch (err) {
                // Ignore
            }
            window.location.href = 'login.html';
        }

        const logoutBtn = document.getElementById('logout-btn');
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);

        // Expose API namespace
        window.ExecutiveShell = {
            hydrateUserRole,
            updateDesktopClock,
            setNavState: window.setExecutiveMobileNav || (() => {})
        };
    }

    // Initialize as soon as DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExecutiveShell);
    } else {
        initExecutiveShell();
    }
})();
