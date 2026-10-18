/**
 * ============================================================================
 * THE LENS — REUSABLE EXECUTIVE SHELL CONTROLLER
 * Shared Chrome across all Executive Portal Pages
 * Handles:
 *  1. Reusable Sidebar Footer injection
 *  2. Real-Time Desktop Clock
 *  3. Dynamic User Role Hydration
 *  4. Mobile Hamburger Menu Toggle & Outside-Click Dismissal
 *  5. Active Navigation Link Highlighting
 *  6. Logout Handling
 * ============================================================================
 */

(function () {
    'use strict';

    function initExecutiveShell() {
        // ---------------------------------------------------------------------
        // 1. Reusable Sidebar Footer Markup Injection (if placeholder exists)
        // ---------------------------------------------------------------------
        const footerSlot = document.querySelector('[data-include="executive-sidebar-footer.html"], [data-slot="sidebar-footer"]');
        if (footerSlot) {
            footerSlot.innerHTML = `
                <a href="#settings" class="sidebar-footer-link">
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

        // ---------------------------------------------------------------------
        // 2. User Role Hydration
        // ---------------------------------------------------------------------
        const userRole = localStorage.getItem('userRole') || 'President';
        if (!localStorage.getItem('userRole')) {
            localStorage.setItem('userRole', 'President');
        }

        const topbarRole = document.getElementById('topbar-user-role');
        const sidebarRole = document.getElementById('sidebar-user-role');
        const mobileRole = document.getElementById('mobile-user-role');

        if (topbarRole) topbarRole.textContent = userRole;
        if (sidebarRole) sidebarRole.textContent = userRole;
        if (mobileRole) mobileRole.textContent = userRole;

        // ---------------------------------------------------------------------
        // 3. Real-Time Topbar Clock (Desktop)
        // ---------------------------------------------------------------------
        const clockDisplay = document.getElementById('topbar-clock-display');
        function updateClock() {
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
        updateClock();
        setInterval(updateClock, 1000);

        // ---------------------------------------------------------------------
        // 4. Mobile Hamburger Menu Accordion & Outside Click
        // ---------------------------------------------------------------------
        const mobileHamburgerBtn = document.getElementById('mobile-hamburger-btn');
        const mobileNavDropdown = document.getElementById('mobile-nav-dropdown');

        if (mobileHamburgerBtn && mobileNavDropdown) {
            mobileHamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = mobileNavDropdown.classList.contains('active') || mobileNavDropdown.classList.contains('open');
                if (isOpen) {
                    mobileNavDropdown.classList.remove('active', 'open');
                    mobileHamburgerBtn.setAttribute('aria-expanded', 'false');
                } else {
                    mobileNavDropdown.classList.add('active', 'open');
                    mobileHamburgerBtn.setAttribute('aria-expanded', 'true');
                }
            });

            document.addEventListener('click', (e) => {
                if (mobileNavDropdown.classList.contains('active') || mobileNavDropdown.classList.contains('open')) {
                    if (!mobileNavDropdown.contains(e.target) && !mobileHamburgerBtn.contains(e.target)) {
                        mobileNavDropdown.classList.remove('active', 'open');
                        mobileHamburgerBtn.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        }

        // ---------------------------------------------------------------------
        // 5. Active Navigation Link Highlighting
        // ---------------------------------------------------------------------
        const currentPath = window.location.pathname.split('/').pop() || 'executive-dashboard.html';
        const navLinks = document.querySelectorAll('.sidebar-nav-item, .mobile-nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href === currentPath || (currentPath === '' && href === 'executive-dashboard.html'))) {
                link.classList.add('active');
            } else if (href && !href.startsWith('#')) {
                link.classList.remove('active');
            }
        });

        // ---------------------------------------------------------------------
        // 6. Logout Handling
        // ---------------------------------------------------------------------
        function handleLogout(e) {
            e.preventDefault();
            localStorage.removeItem('userRole');
            localStorage.removeItem('studentNumber');
            window.location.href = 'login.html';
        }

        const logoutBtn = document.getElementById('logout-btn');
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExecutiveShell);
    } else {
        initExecutiveShell();
    }
})();

