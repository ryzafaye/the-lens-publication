/**
 * ============================================================================
 * THE LENS — WRITER SHELL CONTROLLER
 * Shared Chrome & Navigation for Staff Writer Portal Pages
 * ============================================================================
 */

(function () {
    'use strict';

    if (window.__writerShellInitialized) {
        return;
    }
    window.__writerShellInitialized = true;

    function initWriterShell() {

        // =====================================================================
        // 1. DYNAMIC WRITER PROFILE & ROLE HYDRATION
        // =====================================================================
        function hydrateWriterProfile() {
            let writerName = localStorage.getItem('writerName') || 'Sofia M. Alcaraz';
            let writerRole = 'Writer';
            let writerId = localStorage.getItem('writerId') || 'sofia-alcaraz';

            try {
                const storedRole = localStorage.getItem('userRole');
                const storedName = localStorage.getItem('userName');

                // If user is actively logged in as a writer, keep writer state in sync
                if (storedRole === 'Writer' && storedName) {
                    writerName = storedName;
                } else if (!storedRole) {
                    // Only initialize default writer if no session role exists at all
                    localStorage.setItem('userRole', 'Writer');
                    localStorage.setItem('userName', 'Sofia M. Alcaraz');
                    localStorage.setItem('writerName', 'Sofia M. Alcaraz');
                    localStorage.setItem('writerId', 'sofia-alcaraz');
                }
            } catch (e) {
                // Storage unavailable
            }

            // Always display strictly "Writer" (no Junior/Senior)
            writerRole = 'Writer';

            const sidebarWriterName = document.getElementById('sidebar-writer-name');
            const sidebarUserRole = document.getElementById('sidebar-user-role');
            const topbarUserRole = document.getElementById('topbar-user-role');
            const mobileUserRole = document.getElementById('mobile-user-role');
            const mobileWriterName = document.getElementById('mobile-writer-name') || document.querySelector('.mobile-nav-name');

            if (sidebarWriterName) sidebarWriterName.textContent = writerName;
            if (sidebarUserRole) sidebarUserRole.textContent = writerRole;
            if (topbarUserRole) topbarUserRole.textContent = writerRole;
            if (mobileUserRole) mobileUserRole.textContent = writerRole;
            if (mobileWriterName) mobileWriterName.textContent = writerName;
        }

        hydrateWriterProfile();

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

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!mobileNavDropdown.contains(e.target) && !mobileHamburgerBtn.contains(e.target)) {
                    mobileNavDropdown.classList.remove('open');
                    mobileHamburgerBtn.setAttribute('aria-expanded', 'false');
                }
            });

            // Close on escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && mobileNavDropdown.classList.contains('open')) {
                    mobileNavDropdown.classList.remove('open');
                    mobileHamburgerBtn.setAttribute('aria-expanded', 'false');
                    mobileHamburgerBtn.focus();
                }
            });
        }

        // =====================================================================
        // 4. LOGOUT HANDLER
        // =====================================================================
                // =====================================================================
        // CUSTOM DESIGNED LOGOUT CONFIRMATION MODAL
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

        function handleLogout(e) {
            if (e) e.preventDefault();
            showLogoutModal(() => {
                try {
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('studentNumber');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('writerId');
                    sessionStorage.clear();
                } catch (err) {}
                window.location.href = 'login.html';
            });
        }

        const logoutBtn = document.getElementById('logout-btn');
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWriterShell);
    } else {
        initWriterShell();
    }
})();

