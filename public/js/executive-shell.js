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
 * THE LENS — EXECUTIVE SHELL CONTROLLER
 * Shared Chrome & Navigation across all Executive Portal Pages
 * ============================================================================
 */

(function () {
    'use strict';

    if (window.__executiveShellInitialized) {
        return;
    }
    window.__executiveShellInitialized = true;

    function initExecutiveShell() {

        // =====================================================================
        // 1. DYNAMIC PROFILE & ROLE HYDRATION
        // =====================================================================
        function hydrateExecutiveProfile() {
            const sidebarUserName = document.getElementById('sidebar-user-name') || document.querySelector('.sidebar-profile .profile-name');
            const sidebarUserRole = document.getElementById('sidebar-user-role');
            const topbarUserRole = document.getElementById('topbar-user-role');
            const mobileUserRole = document.getElementById('mobile-user-role');
            const mobileUserName = document.getElementById('mobile-user-name');
            const sectionBadges = document.querySelectorAll('.dynamic-section-name');

            // Fallback values from storage if DOM elements are empty
            let role = topbarUserRole?.textContent?.trim() || sidebarUserRole?.textContent?.trim() || 'Executive';
            let name = sidebarUserName?.textContent?.trim() || mobileUserName?.textContent?.trim() || 'Executive User';
            let section = 'Editorial';

            try {
                const storedRole = localStorage.getItem('sectionHeadRole') || localStorage.getItem('userRole');
                const storedName = localStorage.getItem('sectionHeadName') || localStorage.getItem('userName');
                const storedSection = localStorage.getItem('sectionHeadSection');

                if (storedRole && (!role || role === 'Executive' || role === 'Officer')) role = storedRole;
                if (storedName && (!name || name === 'Executive User')) name = storedName;
                if (storedSection) section = storedSection;
            } catch (e) {
                // Storage unavailable
            }

            if (sidebarUserName && !sidebarUserName.textContent.trim()) sidebarUserName.textContent = name;
            if (sidebarUserRole && !sidebarUserRole.textContent.trim()) sidebarUserRole.textContent = role;
            if (topbarUserRole && !topbarUserRole.textContent.trim()) topbarUserRole.textContent = role;
            if (mobileUserRole && !mobileUserRole.textContent.trim()) mobileUserRole.textContent = role;
            if (mobileUserName && !mobileUserName.textContent.trim()) mobileUserName.textContent = name;

            sectionBadges.forEach(badge => {
                if (!badge.textContent.trim() || badge.textContent.trim() === 'News') {
                    badge.textContent = section;
                }
            });

            // Hydrate avatar if present in storage and not already set
            try {
                const avatarImg = localStorage.getItem('sectionHeadAvatar') || localStorage.getItem('userAvatar');
                const sidebarAvatar = document.getElementById('sidebar-avatar-img') || document.querySelector('.sidebar-profile .profile-avatar img');
                if (sidebarAvatar && avatarImg && !sidebarAvatar.getAttribute('src')?.includes('data:')) {
                    sidebarAvatar.src = avatarImg;
                }
            } catch (e) {}
        }

        hydrateExecutiveProfile();

        // =====================================================================
        // 2. REAL-TIME DESKTOP CLOCK (Asia/Manila)
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
        // 3. MOBILE HAMBURGER NAVIGATION & ACCORDION
        // =====================================================================
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

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && isNavOpen()) {
                    setNavState(false);
                }
            });
        }

        // =====================================================================
        // 4. ACTIVE PAGE NAVIGATION HIGHLIGHTING
        // =====================================================================
        function highlightActiveNavigation() {
            const currentPath = window.location.pathname;
            const navItems = document.querySelectorAll('.sidebar-nav-item, .mobile-nav-link');
            navItems.forEach(item => {
                const href = item.getAttribute('href');
                if (!href) return;
                if (item.classList.contains('active')) return;

                if (href === currentPath || (currentPath.startsWith(href) && href !== '/' && href !== '#')) {
                    item.classList.add('active');
                    item.setAttribute('aria-current', 'page');
                }
            });
        }
        highlightActiveNavigation();

        // =====================================================================
        // 5. CUSTOM DESIGNED LOGOUT CONFIRMATION MODAL
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

        function triggerLogout(targetForm) {
            showLogoutModal(() => {
                try {
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('studentNumber');
                    localStorage.removeItem('sectionHeadRole');
                    localStorage.removeItem('sectionHeadName');
                    localStorage.removeItem('sectionHeadSection');
                    localStorage.removeItem('sectionHeadStudentNumber');
                    sessionStorage.clear();
                } catch (err) {}

                if (targetForm && typeof targetForm.submit === 'function') {
                    targetForm.submit();
                } else {
                    const fallbackForm = document.querySelector('form[action*="logout"]');
                    if (fallbackForm) {
                        fallbackForm.submit();
                    } else {
                        window.location.href = '/login';
                    }
                }
            });
        }

        // Global capture-phase logout listener - intercepts any logout button click anywhere on page
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#logout-btn, #mobile-logout-btn, .logout-btn, .mobile-logout-btn, [data-action="logout"]');
            if (btn) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                const parentForm = btn.closest('form');
                triggerLogout(parentForm);
            }
        }, true);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExecutiveShell);
    } else {
        initExecutiveShell();
    }
})();
