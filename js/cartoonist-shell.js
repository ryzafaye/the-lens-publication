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
 * THE LENS — CARTOONIST SHELL CONTROLLER
 * Shared Chrome & Navigation for Cartoonist Portal Pages
 * ============================================================================
 */

(function () {
    'use strict';

    if (window.__cartoonistShellInitialized) {
        return;
    }
    window.__cartoonistShellInitialized = true;

    function initCartoonistShell() {

        // =====================================================================
        // 1. DYNAMIC PROFILE & ROLE HYDRATION
        // =====================================================================
        function hydrateCartoonistProfile() {
            let cartoonistName = localStorage.getItem('cartoonistName') || localStorage.getItem('userName') || 'Raphael Luna';
            let cartoonistRole = localStorage.getItem('cartoonistRole') || 'Cartoonist';
            let studentNumber = localStorage.getItem('cartoonistStudentNumber') || localStorage.getItem('studentNumber') || '2024-00090-BN-0';
            let avatar = localStorage.getItem('cartoonistAvatar') || localStorage.getItem('userAvatar') || 'images/member-placeholder.svg';

            // Ensure cached
            localStorage.setItem('cartoonistName', cartoonistName);
            localStorage.setItem('cartoonistRole', cartoonistRole);
            localStorage.setItem('cartoonistStudentNumber', studentNumber);
            localStorage.setItem('userRole', cartoonistRole);
            localStorage.setItem('userName', cartoonistName);

            // Update DOM Elements
            const sidebarUserName = document.getElementById('sidebar-user-name');
            const sidebarUserRole = document.getElementById('sidebar-user-role');
            const sidebarAvatarImg = document.getElementById('sidebar-avatar-img') || document.getElementById('sidebar-user-avatar');

            const topbarUserRole = document.getElementById('topbar-user-role');
            const topbarAvatarImg = document.getElementById('topbar-avatar-img');

            const mobileUserName = document.getElementById('mobile-user-name');
            const mobileUserRole = document.getElementById('mobile-user-role');
            const mobileAvatarImg = document.getElementById('mobile-avatar-img');

            if (sidebarUserName) sidebarUserName.textContent = cartoonistName;
            if (sidebarUserRole) sidebarUserRole.textContent = cartoonistRole;
            if (sidebarAvatarImg) sidebarAvatarImg.src = avatar;

            if (topbarUserRole) topbarUserRole.textContent = cartoonistRole;
            if (topbarAvatarImg) topbarAvatarImg.src = avatar;

            if (mobileUserName) mobileUserName.textContent = cartoonistName;
            if (mobileUserRole) mobileUserRole.textContent = cartoonistRole;
            if (mobileAvatarImg) mobileAvatarImg.src = avatar;
        }

        hydrateCartoonistProfile();

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
            const currentPath = window.location.pathname.split('/').pop() || 'cartoonist-dashboard.html';

            const navLinks = document.querySelectorAll('.sidebar-nav-item, .sidebar-footer-link, .mobile-nav-link, .mobile-nav-footer-link');
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (!href) return;
                const linkFile = href.split('/').pop().split('?')[0];

                if (linkFile === currentPath) {
                    link.classList.add('active');
                } else if (!link.classList.contains('logout-btn') && !link.classList.contains('mobile-logout-btn')) {
                    if (linkFile.startsWith('cartoonist-') && currentPath.startsWith('cartoonist-')) {
                        link.classList.remove('active');
                    }
                }
            });
        }
        highlightActiveNav();

        // =====================================================================
        // 5. CUSTOM DESIGNED LOGOUT CONFIRMATION MODAL (Square, Compact, No Subtitle)
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
                    sessionStorage.clear();
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('studentNumber');
                    localStorage.removeItem('cartoonistRole');
                    localStorage.removeItem('cartoonistName');
                    localStorage.removeItem('cartoonistStudentNumber');
                } catch (err) {}
                window.location.href = 'login.html';
            });
        }

        // Global capture-phase logout listener - intercepts any logout click anywhere
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#logout-btn, #mobile-logout-btn, .logout-btn, .mobile-logout-btn, [data-action="logout"]');
            if (btn) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                triggerLogout();
            }
        }, true);

        // Auto-close mobile drawer on desktop resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                const nav = document.getElementById('mobile-nav-dropdown');
                const btn = document.getElementById('mobile-hamburger-btn');
                if (nav) nav.classList.remove('open');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            }
        });

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCartoonistShell);
    } else {
        initCartoonistShell();
    }

})();
