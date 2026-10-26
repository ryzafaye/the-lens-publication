// One-time automatic workflow purge to guarantee zero-mock state for testing
try {
    const CLEAR_FLAG = 'theLens_workflow_v4_purged';
    if (localStorage.getItem(CLEAR_FLAG) !== 'true') {
        const keysToRemove = [
            'theLensWriterArticles_v3',
            'theLensWriterArticles_v2',
            'theLensWriterArticles_v1',
            'sectionHeadReviewQueue_v1',
            'eicPendingReviewQueue',
            'executivePendingReviewQueue',
            'mpc_publish_articles_v2',
            'mpc_publish_articles_v1',
            'mpc_approved_covers_v1',
            'theLensPublishedArticles',
            'executiveArticles',
            'theLensArticles',
            'theLensCartoonistArticles_v1',
            'cartoonistSubmissions_v1',
            'articleCoverReviewQueue_v1',
            'theLensMediaArticles_v1',
            'mediaTeamSubmissions_v2',
            'mediaTeamSubmissions_v1',
            'sectionHeadMyArticles_v1',
            'eicMyArticles_v1',
            'executiveMyArticles_v1',
            'mpcMyArticles_v1',
            'cartoonistHeadMyArticles_v1',
            'sectionHeadArticleDrafts',
            'eicArticleDrafts',
            'executiveArticleDrafts',
            'mpcArticleDrafts',
            'cartoonistHeadArticleDrafts',
            'mediaArticleDrafts_v1',
            'cartoonistArticleDrafts_v1',
            'executiveActivityLogs_v1',
            'mpcActivityLogs_v1',
            'cartoonistHeadActivityLogs_v1',
            'eicActivityLogs_v1',
            'sectionHeadActivityLogs_v1'
        ];
        keysToRemove.forEach(k => localStorage.removeItem(k));
        localStorage.setItem(CLEAR_FLAG, 'true');
    }
} catch (e) {}
/**
 * ============================================================================
 * THE LENS — REUSABLE EXECUTIVE SHELL CONTROLLER
 * Shared Chrome & Navigation across all Executive Portal Pages
 * 
 * Clean, readable, modular controller that handles:
 *  1. User Role Hydration (topbar, sidebar, mobile nav)
 *  2. Real-Time Desktop Clock (Asia/Manila time)
 *  3. Mobile Hamburger Menu Toggle, Backdrop, Outside-Click, Escape & Resize
 *  4. Active Page Navigation Highlighting
 *  5. Reusable Sidebar Footer slot injection
 *  6. Executive Logout Handling (Square Modal, No Subtitle)
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
                <a href="executive-profile-settings.html" class="sidebar-footer-link" data-page="executive-profile-settings.html">
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
                role = localStorage.getItem('userRole') || localStorage.getItem('executiveRole') || 'President';
                if (!localStorage.getItem('userRole')) {
                    localStorage.setItem('userRole', role);
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
        // 3. REAL-TIME DESKTOP CLOCK (Asia/Manila)
        // =====================================================================
        function updateDesktopClock() {
            const clockDisplays = document.querySelectorAll('#topbar-clock-display, .topbar-clock span:last-child');
            if (!clockDisplays.length) return;
            const now = new Date();
            const datePart = now.toLocaleDateString('en-US', {
                timeZone: 'Asia/Manila',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            const timePart = now.toLocaleTimeString('en-US', {
                timeZone: 'Asia/Manila',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            const formatted = datePart + ' | ' + timePart;
            clockDisplays.forEach(el => {
                if (el.textContent !== formatted) el.textContent = formatted;
            });
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
        // 6. CUSTOM DESIGNED LOGOUT CONFIRMATION MODAL (Square, Compact, No Subtitle)
        // =====================================================================
        function showLogoutModal(onConfirm) {
            let modal = document.getElementById('lens-logout-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'lens-logout-modal';
                modal.className = 'modal-overlay';
                modal.setAttribute('role', 'dialog');
                modal.setAttribute('aria-modal', 'true');
                modal.setAttribute('aria-labelledby', 'lens-logout-title');
                modal.innerHTML = `
                    <div class="modal-card logout-modal-card">
                        <button type="button" id="lens-logout-close-btn" class="logout-modal-close-btn" aria-label="Close dialog">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                        <div class="logout-modal-header">
                            <div class="logout-modal-icon-badge">
                                <i class="fa-solid fa-right-from-bracket"></i>
                            </div>
                            <h2 id="lens-logout-title" class="logout-modal-title">Are you sure you want to log out?</h2>
                        </div>
                        <div class="logout-modal-actions">
                            <button type="button" id="lens-logout-cancel-btn" class="logout-btn-cancel">Cancel</button>
                            <button type="button" id="lens-logout-confirm-btn" class="logout-btn-confirm">
                                <i class="fa-solid fa-right-from-bracket"></i>
                                <span>Log Out</span>
                            </button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                const closeModal = () => modal.classList.add('hidden');
                const closeBtn = modal.querySelector('#lens-logout-close-btn');
                const cancelBtn = modal.querySelector('#lens-logout-cancel-btn');
                if (closeBtn) closeBtn.addEventListener('click', closeModal);
                if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

                modal.addEventListener('click', (e) => {
                    if (e.target === modal) closeModal();
                });

                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                        closeModal();
                    }
                });
            }

            const confirmBtn = modal.querySelector('#lens-logout-confirm-btn');
            if (confirmBtn) {
                const newConfirmBtn = confirmBtn.cloneNode(true);
                confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
                newConfirmBtn.addEventListener('click', () => {
                    modal.classList.add('hidden');
                    if (typeof onConfirm === 'function') onConfirm();
                });
            }

            modal.classList.remove('hidden');
        }

        function triggerLogout() {
            showLogoutModal(() => {
                try {
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('studentNumber');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('executiveRole');
                    localStorage.removeItem('executiveName');
                    localStorage.removeItem('executiveStudentNumber');
                    sessionStorage.clear();
                } catch (err) {}
                window.location.href = 'login.html';
            });
        }

        // Global capture-phase logout listener - intercepts any logout button click anywhere on page
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#logout-btn, #mobile-logout-btn, .logout-btn, .mobile-logout-btn, [data-action="logout"]');
            if (btn) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                triggerLogout();
            }
        }, true);

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
