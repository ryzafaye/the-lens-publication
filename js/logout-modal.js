/**
 * ============================================================================
 * THE LENS — CUSTOM DESIGNED LOGOUT CONFIRMATION MODAL
 * Replaces native browser alert/confirm with signature editorial modal UI
 * ============================================================================
 */

(function () {
    'use strict';

    /**
     * Creates and opens the custom designed Logout confirmation modal.
     * @param {Function} onConfirm - Callback invoked if user confirms logout.
     */
    function showLogoutConfirmation(onConfirm) {
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

            const closeModal = () => {
                modal.classList.add('hidden');
            };

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
                if (typeof onConfirm === 'function') {
                    onConfirm();
                } else {
                    try {
                        sessionStorage.clear();
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('userName');
                        localStorage.removeItem('studentNumber');
                    } catch (e) {}
                    window.location.href = 'login.html';
                }
            });
        }

        modal.classList.remove('hidden');
    }

    // Expose globally
    window.showLogoutConfirmation = showLogoutConfirmation;

    // Auto-bind to all logout buttons in DOM
    function bindLogoutButtons() {
        const buttons = document.querySelectorAll('#logout-btn, #mobile-logout-btn, .logout-btn, .mobile-logout-btn');
        buttons.forEach(btn => {
            if (btn.dataset.logoutBound === 'true') return;
            btn.dataset.logoutBound = 'true';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                showLogoutConfirmation(() => {
                    try {
                        sessionStorage.clear();
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('userName');
                        localStorage.removeItem('studentNumber');
                    } catch (err) {}
                    window.location.href = 'login.html';
                });
            }, true); // Use capture phase to intercept before older inline confirm() listeners
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindLogoutButtons);
    } else {
        bindLogoutButtons();
    }
})();

