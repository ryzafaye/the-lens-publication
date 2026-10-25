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
                        <div class="logout-modal-header">
                            <button type="button" id="lens-logout-close-btn" class="logout-modal-close-btn" aria-label="Close dialog">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                            <div class="logout-modal-icon-badge">
                                <i class="fa-solid fa-right-from-bracket"></i>
                            </div>
                            <h2 id="lens-logout-title" class="logout-modal-title">Are you sure you want to log out?</h2>
                            <p class="logout-modal-desc">You will be signed out of your account and returned to the login screen.</p>
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

        const logoutButtons = document.querySelectorAll('#logout-btn, #mobile-logout-btn, .logout-btn');
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
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
            });
        });

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCartoonistShell);
    } else {
        initCartoonistShell();
    }

})();

