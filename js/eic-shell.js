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
 * THE LENS — REUSABLE EDITOR-IN-CHIEF (EIC) SHELL CONTROLLER
 * Shared Chrome & Navigation across all EIC Portal Pages
 * ============================================================================
 */

(function () {
    'use strict';

    if (window.__eicShellInitialized) {
        return;
    }
    window.__eicShellInitialized = true;

    function initEICShell() {

        // =====================================================================
        // 1. DYNAMIC EIC PROFILE & ROLE HYDRATION
        // =====================================================================
        function hydrateEICProfile() {
            let role = 'Editorial-In-Chief';
            let name = 'Victoria Reyes';
            let studentNum = '2024-00010-BN-0';

            try {
                const storedRole = localStorage.getItem('eicRole') || (localStorage.getItem('userRole') && (localStorage.getItem('userRole').toLowerCase().includes('chief') || localStorage.getItem('userRole').toLowerCase().includes('eic')) ? localStorage.getItem('userRole') : null);
                const storedName = localStorage.getItem('eicName') || (storedRole ? localStorage.getItem('userName') : null);
                const storedNum = localStorage.getItem('eicStudentNumber') || (storedRole ? localStorage.getItem('studentNumber') : null);

                if (storedRole && (storedRole.toLowerCase().includes('chief') || storedRole.toLowerCase().includes('eic'))) {
                    role = storedRole;
                    if (storedName) name = storedName;
                    if (storedNum) studentNum = storedNum;
                } else {
                    // Initialize default EIC session
                    role = 'Editorial-In-Chief';
                    name = 'Victoria Reyes';
                    studentNum = '2024-00010-BN-0';
                    localStorage.setItem('userRole', 'Editorial-In-Chief');
                    localStorage.setItem('userName', 'Victoria Reyes');
                    localStorage.setItem('studentNumber', '2024-00010-BN-0');
                    localStorage.setItem('eicRole', 'Editorial-In-Chief');
                    localStorage.setItem('eicName', 'Victoria Reyes');
                    localStorage.setItem('eicStudentNumber', '2024-00010-BN-0');
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
            const avatarImg = localStorage.getItem('eicAvatar') || localStorage.getItem('userAvatar') || 'images/member-placeholder.svg';
            const sidebarAvatar = document.getElementById('sidebar-user-avatar') || document.querySelector('.sidebar-profile .profile-avatar img');
            const topbarAvatar = document.querySelector('.topbar-avatar-circle img');
            const mobileAvatar = document.querySelector('.mobile-nav-avatar img');
            if (sidebarAvatar && avatarImg) sidebarAvatar.src = avatarImg;
            if (topbarAvatar && avatarImg) topbarAvatar.src = avatarImg;
            if (mobileAvatar && avatarImg) mobileAvatar.src = avatarImg;
        }

        hydrateEICProfile();

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
            const filename = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'eic-dashboard.html';

            const navItems = document.querySelectorAll('.sidebar-nav-item, .mobile-nav-link');
            navItems.forEach(item => {
                const targetPage = item.getAttribute('href') || item.getAttribute('data-page') || '';
                if (targetPage && (targetPage === filename || (filename === '' && targetPage === 'eic-dashboard.html'))) {
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
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('studentNumber');
                    localStorage.removeItem('eicRole');
                    localStorage.removeItem('eicName');
                    localStorage.removeItem('eicStudentNumber');
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

        // Auto-close mobile drawer on desktop resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                const nav = document.getElementById('mobile-nav-dropdown');
                const btn = document.getElementById('mobile-hamburger-btn');
                if (nav) nav.classList.remove('open');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            }
        });

        // Global interface exposure for other page scripts
        window.EICShell = {
            hydrateEICProfile,
            updateDesktopClock
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEICShell);
    } else {
        initEICShell();
    }
})();
