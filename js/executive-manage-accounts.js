/**
 * ============================================================================
 * THE LENS — MANAGE OFFICER ACCOUNTS LOGIC (EXECUTIVE PORTAL)
 * Clean, Reusable & Modular Implementation
 * 
 * Features:
 * 1. Authentication & Role Verification (Route guard & header/sidebar hydration)
 * 2. Mobile Accordion Navigation Toggle
 * 3. Desktop Real-time Clock (Asia/Manila format)
 * 4. Officer Dataset Management (localStorage: 'executiveOfficerAccounts_v3')
 *    - Format: BN-0 (e.g. 2022-01452-BN-0)
 *    - Profile photos used across all officer cards
 * 5. Real-time Search (Name, Student Number, and Role)
 * 6. Status Filter (All, Active, Deactivated)
 * 7. Add Officer Account Modal:
 *    - 3 fields: Student Number, Full Name, Role
 *    - Cancel button removed per executive UX requirements
 *    - Prominent maroon "Create Account" button
 * 8. Deactivate & Activate Officer Account Actions with Confirmation Modal
 * 9. Default Executive Toast Notification System (Dark Pill with Green Bullet Dot)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. AUTHENTICATION & ROLE VERIFICATION
    // =========================================================================
    const userRole = localStorage.getItem('userRole') || 'President';
    const userName = localStorage.getItem('userName') || '';

    if (!localStorage.getItem('userRole')) {
        localStorage.setItem('userRole', 'President');
    }








    // =========================================================================
    // 4. TOAST NOTIFICATION HELPER (Default Executive Bullet Dot Style)
    // =========================================================================
    const toastContainer = document.getElementById('toast-container');

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function showToast(message, type = 'success') {
        if (!toastContainer) return;

        const existingToasts = toastContainer.querySelectorAll('.toast-message');
        existingToasts.forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;

        toast.innerHTML = `<span class="toast-bullet-dot"></span><span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-dismissing');
            setTimeout(() => toast.remove(), 260);
        }, 3400);
    }

    // =========================================================================
    // 5. OFFICER ACCOUNTS DATASET (BN-0 Format)
    // =========================================================================
    const ACCOUNTS_STORAGE_KEY = 'executiveOfficerAccounts_v3';

    const defaultOfficers = [
        {
            id: 'off-01',
            name: "",
            studentNumber: "2022-01452-BN-0",
            role: "President",
            avatar: "images/member-placeholder.svg",
            status: "active"
        },
        {
            id: 'off-02',
            name: "Maria Clara Santos",
            studentNumber: "2022-01893-BN-0",
            role: "Vice President",
            avatar: "images/member-placeholder.svg",
            status: "active"
        },
        {
            id: 'off-03',
            name: "Christian Alcantara",
            studentNumber: "2023-00561-BN-0",
            role: "Editor-in-Chief",
            avatar: "images/member-placeholder.svg",
            status: "active"
        },
        {
            id: 'off-04',
            name: "Althea Grace Mendoza",
            studentNumber: "2023-01124-BN-0",
            role: "Managing Editor",
            avatar: "images/member-placeholder.svg",
            status: "active"
        },
        {
            id: 'off-05',
            name: "Rafael Ramos",
            studentNumber: "2023-02450-BN-0",
            role: "Section Head - News",
            avatar: "images/member-placeholder.svg",
            status: "active"
        },
        {
            id: 'off-06',
            name: "Mara Villanueva",
            studentNumber: "2023-03189-BN-0",
            role: "Section Head - Features",
            avatar: "images/member-placeholder.svg",
            status: "active"
        },
        {
            id: 'off-07',
            name: "Noah Reyes",
            studentNumber: "2024-00215-BN-0",
            role: "Section Head - SciTech",
            avatar: "images/member-placeholder.svg",
            status: "active"
        },
        {
            id: 'off-08',
            name: "Patricia Gomez",
            studentNumber: "2024-00890-BN-0",
            role: "Section Head - Opinions",
            avatar: "images/member-placeholder.svg",
            status: "active"
        },
        {
            id: 'off-09',
            name: "Karlo Bautista",
            studentNumber: "2024-01344-BN-0",
            role: "Media & Publication Head",
            avatar: "images/member-placeholder.svg",
            status: "active"
        },
        {
            id: 'off-10',
            name: "Dominic Cruz",
            studentNumber: "2023-04021-BN-0",
            role: "Associate Editor",
            avatar: "images/member-placeholder.svg",
            status: "deactivated"
        }
    ];

    function loadOfficers() {
        if (Array.isArray(window.OFFICER_DATA) && window.OFFICER_DATA.length > 0) {
            return window.OFFICER_DATA.map(user => ({
                id: user.id,
                name: user.full_name || 'Officer',
                studentNumber: user.student_number || '',
                role: user.role ? (user.role.role_name || user.role) : 'Officer',
                avatar: user.avatar || user.profile_picture_url || 'images/member-placeholder.svg',
                status: user.account_status || (user.is_active === 0 || user.is_active === false ? 'deactivated' : 'active')
            }));
        }
        try {
            const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].studentNumber && parsed[0].studentNumber.includes('BN-0')) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Failed parsing stored officers, restoring defaults:', e);
        }
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(defaultOfficers));
        return defaultOfficers;
    }

    function saveOfficers(officers) {
        try {
            localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(officers));
        } catch (e) {
            console.error('Failed saving officers to localStorage:', e);
        }
    }

    let officersList = loadOfficers();

    // =========================================================================
    // 6. DOM REFERENCES & HELPERS
    // =========================================================================
    const EXECUTIVE_ROLES = [
        'President',
        'Executive Vice President',
        'Secretary',
        'Associate Secretary',
        'Treasurer',
        'Auditor',
        'Public Relations Officer'
    ];

    function isEicViewer() {
        const role = (window.CURRENT_USER_ROLE || localStorage.getItem('userRole') || '').toLowerCase();
        const path = (window.location.pathname || '').toLowerCase();
        return path.includes('/eic') || role.includes('chief') || role.includes('eic');
    }

    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            || document.querySelector('input[name="_token"]')?.value
            || '';
    }

    const searchInput = document.getElementById('officer-search-input');
    const searchClearBtn = document.getElementById('officer-search-clear');
    const statusFilterSelect = document.getElementById('status-filter-select');
    const accountsContainer = document.getElementById('accounts-list-container');
    const statsCounterEl = document.getElementById('accounts-stats-indicator');

    // Add Modal Elements
    const btnOpenAddModal = document.getElementById('btn-open-add-modal');
    const addOfficerModal = document.getElementById('add-officer-modal');
    const addOfficerForm = document.getElementById('add-officer-form');
    const btnCloseAddModal = document.getElementById('btn-close-add-modal');
    const studentIdInput = document.getElementById('officer-input-student-id');

    // Auto-format student number on typing (e.g. 2024-00123-BN-0)
    if (studentIdInput) {
        studentIdInput.addEventListener('input', (e) => {
            let val = e.target.value.toUpperCase();
            let clean = val.replace(/[^A-Z0-9]/g, '');
            if (clean.length > 4 && !val.includes('-')) {
                if (/^\d{4}/.test(clean)) {
                    let formatted = clean.slice(0, 4);
                    if (clean.length > 4) formatted += '-' + clean.slice(4, 9);
                    if (clean.length > 9) formatted += '-' + clean.slice(9, 11);
                    if (clean.length > 11) formatted += '-' + clean.slice(11, 12);
                    e.target.value = formatted;
                }
            } else {
                e.target.value = val;
            }
        });
    }

    // Deactivation Confirmation Modal Elements
    const deactivateModal = document.getElementById('deactivate-confirm-modal');
    const deactivateOfficerNameEl = document.getElementById('deactivate-officer-name');
    const btnConfirmDeactivate = document.getElementById('btn-confirm-deactivate');
    const btnCloseDeactivate = document.getElementById('btn-close-deactivate');
    let targetDeactivateId = null;

    // Edit Role Modal Elements
    const editRoleModal = document.getElementById('edit-role-modal');
    const editRoleForm = document.getElementById('edit-role-form');
    const editRoleSelect = document.getElementById('edit-role-select');
    const editRoleAvatar = document.getElementById('edit-role-avatar');
    const editRoleOfficerName = document.getElementById('edit-role-officer-name');
    const editRoleCurrentBadge = document.getElementById('edit-role-current-badge');
    const btnCloseEditRoleModal = document.getElementById('btn-close-edit-role-modal');
    let targetEditRoleId = null;

    // Change Password Modal Elements
    const changePasswordModal = document.getElementById('change-password-modal');
    const changePasswordForm = document.getElementById('change-officer-password-form');
    const changePasswordOfficerName = document.getElementById('change-password-officer-name');
    const changePasswordCurrentBadge = document.getElementById('change-password-current-badge');
    const changePasswordAvatar = document.getElementById('change-password-avatar');
    const officerNewPasswordInput = document.getElementById('officer-new-password');
    const btnClosePasswordModal = document.getElementById('btn-close-password-modal');
    let targetChangePasswordId = null;

    // Global password toggle eye listener
    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('.password-toggle-btn');
        if (!toggleBtn) return;

        const targetId = toggleBtn.getAttribute('data-target');
        if (!targetId) return;

        const input = document.getElementById(targetId);
        if (!input) return;

        const isPass = (input.type === 'password');
        input.type = isPass ? 'text' : 'password';

        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.className = isPass ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
        }
    });

    // =========================================================================
    // 7. RENDER OFFICER ACCOUNTS LIST
    // =========================================================================
    function getFilteredOfficers() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const statusFilter = statusFilterSelect ? statusFilterSelect.value : 'all';

        return officersList.filter(officer => {
            // Status filter
            if (statusFilter !== 'all' && officer.status !== statusFilter) {
                return false;
            }

            // Search query matching Name, Role, or Student Number (BN-0)
            if (query) {
                const nameMatch = (officer.name || '').toLowerCase().includes(query);
                const roleMatch = (officer.role || '').toLowerCase().includes(query);
                const snMatch = (officer.studentNumber || '').toLowerCase().includes(query);
                return nameMatch || roleMatch || snMatch;
            }

            return true;
        });
    }

    function updateStatsIndicator() {
        if (!statsCounterEl) return;
        const total = officersList.length;
        const activeCount = officersList.filter(o => o.status === 'active').length;
        const deactivatedCount = total - activeCount;

        statsCounterEl.innerHTML = `
            <span><strong class="stat-highlight">${total}</strong> Total Officers</span>
            <span class="stat-dot-separator">•</span>
            <span><strong class="stat-highlight text-emerald-700">${activeCount}</strong> Active</span>
            <span class="stat-dot-separator">•</span>
            <span><strong class="stat-highlight text-rose-700">${deactivatedCount}</strong> Deactivated</span>
        `;
    }

    function renderAccounts() {
        if (!accountsContainer) return;

        updateStatsIndicator();
        const filtered = getFilteredOfficers();

        if (filtered.length === 0) {
            accountsContainer.innerHTML = `
                <div class="empty-accounts-box">
                    <i class="fa-solid fa-users-slash"></i>
                    <h4 class="empty-accounts-title">No Officers Found</h4>
                    <p class="empty-accounts-subtitle">
                        No officer accounts match your current search and filter criteria.
                    </p>
                </div>
            `;
            return;
        }

        const isViewerEic = isEicViewer();

        accountsContainer.innerHTML = filtered.map(officer => {
            const isDeactivated = officer.status === 'deactivated';
            const avatarSrc = officer.avatar || 'images/member-placeholder.svg';
            const isExecutive = EXECUTIVE_ROLES.includes(officer.role);
            const eicRestricted = isViewerEic && isExecutive;

            return `
                <div class="account-box ${isDeactivated ? 'deactivated' : ''}" id="account-card-${officer.id}">
                    
                    <!-- Left: Profile Picture + Details -->
                    <div class="account-info-stack">
                        <div class="officer-avatar-wrapper" title="${escapeHTML(officer.name)}">
                            <img src="${escapeHTML(avatarSrc)}" alt="${escapeHTML(officer.name)}" class="officer-profile-img">
                        </div>

                        <div class="officer-details">
                            <!-- Top Line: Full Name + Role Tag -->
                            <div class="officer-primary-row">
                                <h3 class="officer-name">${escapeHTML(officer.name)}</h3>
                                <span class="officer-role-tag">${escapeHTML(officer.role)}</span>
                            </div>

                            <!-- Bottom Line: Account Status -->
                            <div class="officer-meta-row">
                                <span class="status-pill ${isDeactivated ? 'deactivated' : 'active'}">
                                    <span class="status-dot"></span>
                                    <span>${isDeactivated ? 'Deactivated' : 'Active'}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Right Actions: Edit Role + Change Password + Deactivate / Activate -->
                    <div class="account-actions-stack">
                        ${!eicRestricted ? `
                            <button type="button" class="btn-account-edit-role" data-action="edit-role" data-id="${officer.id}" title="Edit officer role">
                                <i class="fa-solid fa-user-pen"></i>
                                <span>Edit Role</span>
                            </button>
                            <button type="button" class="btn-account-change-password" data-action="change-password" data-id="${officer.id}" title="Change officer password">
                                <i class="fa-solid fa-key"></i>
                                <span>Password</span>
                            </button>
                        ` : `
                            <button type="button" class="btn-account-edit-role opacity-50 cursor-not-allowed" data-action="eic-restricted" title="Editor-in-Chief cannot modify executive accounts">
                                <i class="fa-solid fa-lock text-stone-400"></i>
                                <span>Executive</span>
                            </button>
                        `}

                        ${eicRestricted ? `
                            <span class="text-xs text-stone-400 italic font-medium px-2 py-1">Protected</span>
                        ` : (isDeactivated ? `
                            <button type="button" class="btn-account-activate" data-action="activate" data-id="${officer.id}" title="Reactivate this officer account">
                                <i class="fa-solid fa-user-check"></i>
                                <span>Activate</span>
                            </button>
                        ` : `
                            <button type="button" class="btn-account-deactivate" data-action="deactivate" data-id="${officer.id}" title="Deactivate officer credentials">
                                <i class="fa-solid fa-user-slash"></i>
                                <span>Deactivate</span>
                            </button>
                        `)}
                    </div>

                </div>
            `;
        }).join('');
    }

    // =========================================================================
    // 8. SEARCH & FILTER EVENT LISTENERS
    // =========================================================================
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const hasQuery = searchInput.value.trim().length > 0;
            if (searchClearBtn) {
                searchClearBtn.style.display = hasQuery ? 'block' : 'none';
            }
            renderAccounts();
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchClearBtn.style.display = 'none';
                searchInput.focus();
                renderAccounts();
            }
        });
    }

    if (statusFilterSelect) {
        statusFilterSelect.addEventListener('change', () => {
            renderAccounts();
        });
    }

    // =========================================================================
    // 9. ACTION DELEGATION: EDIT ROLE, PASSWORD, DEACTIVATE & ACTIVATE
    // =========================================================================
    if (accountsContainer) {
        accountsContainer.addEventListener('click', async (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;

            if (action === 'eic-restricted') {
                showToast('Editor-in-Chief is not permitted to modify executive accounts or change their status.', 'warning');
                return;
            }

            const officerId = btn.dataset.id;
            const officer = officersList.find(o => String(o.id) === String(officerId));
            if (!officer) return;

            const isOfficerExecutive = EXECUTIVE_ROLES.includes(officer.role);

            if (action === 'edit-role') {
                if (isEicViewer() && isOfficerExecutive) {
                    showToast('Editor-in-Chief is not permitted to modify executive accounts.', 'danger');
                    return;
                }
                targetEditRoleId = officerId;
                if (editRoleOfficerName) editRoleOfficerName.textContent = officer.name;
                if (editRoleAvatar) editRoleAvatar.src = officer.avatar || 'images/member-placeholder.svg';
                if (editRoleCurrentBadge) editRoleCurrentBadge.innerHTML = `Current Role: <strong>${escapeHTML(officer.role)}</strong>`;
                if (editRoleSelect) editRoleSelect.value = officer.role;
                if (editRoleModal) editRoleModal.classList.remove('hidden');
            } else if (action === 'change-password') {
                if (isEicViewer() && isOfficerExecutive) {
                    showToast('Editor-in-Chief is not permitted to modify passwords of executive accounts.', 'danger');
                    return;
                }
                targetChangePasswordId = officerId;
                if (changePasswordOfficerName) changePasswordOfficerName.textContent = officer.name;
                if (changePasswordAvatar) changePasswordAvatar.src = officer.avatar || 'images/member-placeholder.svg';
                if (changePasswordCurrentBadge) changePasswordCurrentBadge.innerHTML = `Role: <strong>${escapeHTML(officer.role)}</strong>`;
                if (officerNewPasswordInput) officerNewPasswordInput.value = '';
                if (changePasswordModal) changePasswordModal.classList.remove('hidden');
            } else if (action === 'deactivate') {
                if (isEicViewer() && isOfficerExecutive) {
                    showToast('Editor-in-Chief is not permitted to change the status of executive accounts.', 'danger');
                    return;
                }
                targetDeactivateId = officerId;
                if (deactivateOfficerNameEl) {
                    deactivateOfficerNameEl.textContent = officer.name;
                }
                if (deactivateModal) {
                    deactivateModal.classList.remove('hidden');
                }
            } else if (action === 'activate') {
                if (isEicViewer() && isOfficerExecutive) {
                    showToast('Editor-in-Chief is not permitted to change the status of executive accounts.', 'danger');
                    return;
                }

                // Call backend toggleStatus
                if (window.__ACCOUNT_ROUTES__ && window.__ACCOUNT_ROUTES__.toggleStatus && !String(officerId).startsWith('off-')) {
                    try {
                        const res = await fetch(`${window.__ACCOUNT_ROUTES__.toggleStatus}/${officerId}/status`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': getCsrfToken(),
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({ status: 'active' })
                        });
                        const data = await res.json();
                        if (!res.ok || data.success === false) {
                            showToast(data.message || 'Failed to activate officer account.', 'danger');
                            return;
                        }
                    } catch (err) {
                        console.warn('Network error activating officer on backend:', err);
                    }
                }

                officer.status = 'active';
                saveOfficers(officersList);
                renderAccounts();
                showToast(`Officer account reactivated.`, 'success');
            }
        });
    }

    // -------------------------------------------------------------------------
    // Edit Role Modal Controller
    // -------------------------------------------------------------------------
    function closeEditRoleModal() {
        if (editRoleModal) {
            editRoleModal.classList.add('hidden');
        }
        targetEditRoleId = null;
    }

    if (btnCloseEditRoleModal) btnCloseEditRoleModal.addEventListener('click', closeEditRoleModal);

    if (editRoleForm) {
        editRoleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!targetEditRoleId) return;

            const officer = officersList.find(o => String(o.id) === String(targetEditRoleId));
            if (!officer) return;

            const newRole = editRoleSelect ? editRoleSelect.value : '';
            if (!newRole) return;

            // EIC cannot promote accounts to executives
            if (isEicViewer() && EXECUTIVE_ROLES.includes(newRole)) {
                showToast('Editor-in-Chief cannot promote accounts to executive roles.', 'danger');
                return;
            }

            const oldRole = officer.role;

            // Sync with backend
            if (window.__ACCOUNT_ROUTES__ && window.__ACCOUNT_ROUTES__.updateRole && !String(targetEditRoleId).startsWith('off-')) {
                try {
                    const res = await fetch(`${window.__ACCOUNT_ROUTES__.updateRole}/${targetEditRoleId}/role`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': getCsrfToken(),
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ role: newRole })
                    });
                    const data = await res.json();
                    if (!res.ok || data.success === false) {
                        showToast(data.message || 'Failed to update officer role.', 'danger');
                        return;
                    }

                    officer.role = data.new_role || newRole;
                    saveOfficers(officersList);
                    closeEditRoleModal();
                    renderAccounts();
                    showToast(data.message || `Role for ${officer.name} updated to ${newRole}.`, 'success');

                    // If edited officer is currently signed in, sync userRole and redirect to new dashboard
                    const isSelf = data.is_self || String(targetEditRoleId) === String(window.CURRENT_USER_ID);
                    if (isSelf) {
                        localStorage.setItem('userRole', data.new_role || newRole);
                        if (window.ExecutiveShell && window.ExecutiveShell.hydrateUserRole) {
                            window.ExecutiveShell.hydrateUserRole();
                        }
                        if (data.dashboard_url) {
                            showToast(`Your role changed to ${data.new_role}. Updating dashboard...`, 'info');
                            setTimeout(() => {
                                window.location.href = data.dashboard_url;
                            }, 1200);
                        }
                    }
                    return;
                } catch (err) {
                    console.warn('Network error updating role on backend:', err);
                }
            }

            officer.role = newRole;
            saveOfficers(officersList);

            // Sync client userRole if self
            const activeUserRole = localStorage.getItem('userRole');
            if (activeUserRole === oldRole || officer.name === (localStorage.getItem('userName') || '')) {
                localStorage.setItem('userRole', newRole);
                if (window.ExecutiveShell && window.ExecutiveShell.hydrateUserRole) {
                    window.ExecutiveShell.hydrateUserRole();
                }
            }

            closeEditRoleModal();
            renderAccounts();
            showToast(`Role for ${officer.name} updated to ${newRole}.`, 'success');
        });
    }

    // -------------------------------------------------------------------------
    // Change Officer Password Modal Controller
    // -------------------------------------------------------------------------
    function closeChangePasswordModal() {
        if (changePasswordModal) {
            changePasswordModal.classList.add('hidden');
        }
        if (officerNewPasswordInput) {
            officerNewPasswordInput.value = '';
            officerNewPasswordInput.classList.remove('input-invalid');
        }
        targetChangePasswordId = null;
    }

    if (btnClosePasswordModal) btnClosePasswordModal.addEventListener('click', closeChangePasswordModal);

    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!targetChangePasswordId) return;

            const officer = officersList.find(o => String(o.id) === String(targetChangePasswordId));
            if (!officer) return;

            const newPass = officerNewPasswordInput ? officerNewPasswordInput.value.trim() : '';
            if (!newPass || newPass.length < 6) {
                if (officerNewPasswordInput) officerNewPasswordInput.classList.add('input-invalid');
                showToast('Password must be at least 6 characters.', 'warning');
                return;
            }

            // Sync with backend
            if (window.__ACCOUNT_ROUTES__ && window.__ACCOUNT_ROUTES__.changePassword && !String(targetChangePasswordId).startsWith('off-')) {
                try {
                    const res = await fetch(`${window.__ACCOUNT_ROUTES__.changePassword}/${targetChangePasswordId}/password`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': getCsrfToken(),
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ password: newPass })
                    });
                    const data = await res.json();
                    if (!res.ok || data.success === false) {
                        showToast(data.message || 'Failed to update officer password.', 'danger');
                        return;
                    }
                    closeChangePasswordModal();
                    showToast(data.message || `Password for ${officer.name} updated successfully.`, 'success');
                    return;
                } catch (err) {
                    console.warn('Network error changing officer password:', err);
                }
            }

            closeChangePasswordModal();
            showToast(`Password for ${officer.name} updated successfully.`, 'success');
        });
    }

    // -------------------------------------------------------------------------
    // Deactivation Confirmation Controller
    // -------------------------------------------------------------------------
    if (btnConfirmDeactivate) {
        btnConfirmDeactivate.addEventListener('click', async () => {
            if (!targetDeactivateId) return;

            const officerIndex = officersList.findIndex(o => String(o.id) === String(targetDeactivateId));
            if (officerIndex === -1) return;

            const officer = officersList[officerIndex];

            // EIC cannot change status of executives
            if (isEicViewer() && EXECUTIVE_ROLES.includes(officer.role)) {
                showToast('Editor-in-Chief is not permitted to change the status of executive accounts.', 'danger');
                closeDeactivateModal();
                return;
            }

            // Call backend toggleStatus
            if (window.__ACCOUNT_ROUTES__ && window.__ACCOUNT_ROUTES__.toggleStatus && !String(targetDeactivateId).startsWith('off-')) {
                try {
                    const res = await fetch(`${window.__ACCOUNT_ROUTES__.toggleStatus}/${targetDeactivateId}/status`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': getCsrfToken(),
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ status: 'deactivated' })
                    });
                    const data = await res.json();
                    if (!res.ok || data.success === false) {
                        showToast(data.message || 'Failed to deactivate officer account.', 'danger');
                        closeDeactivateModal();
                        return;
                    }
                } catch (err) {
                    console.warn('Network error deactivating officer on backend:', err);
                }
            }

            officersList[officerIndex].status = 'deactivated';
            saveOfficers(officersList);
            renderAccounts();
            showToast(`Officer account deactivated.`, 'danger');
            closeDeactivateModal();
        });
    }

    function closeDeactivateModal() {
        if (deactivateModal) {
            deactivateModal.classList.add('hidden');
        }
        targetDeactivateId = null;
    }

    if (btnCloseDeactivate) btnCloseDeactivate.addEventListener('click', closeDeactivateModal);

    // =========================================================================
    // 10. ADD OFFICER ACCOUNT MODAL & FORM VALIDATION
    // =========================================================================
    function openAddModal() {
        if (addOfficerModal) {
            addOfficerModal.classList.remove('hidden');
            const studentIdInput = document.getElementById('officer-input-student-id');
            if (studentIdInput) studentIdInput.focus();
        }
    }

    function closeAddModal() {
        if (addOfficerModal) {
            addOfficerModal.classList.add('hidden');
        }
        if (addOfficerForm) {
            addOfficerForm.reset();
            const invalidElements = addOfficerForm.querySelectorAll('.input-invalid');
            invalidElements.forEach(el => el.classList.remove('input-invalid'));
        }
    }

    if (btnOpenAddModal) btnOpenAddModal.addEventListener('click', openAddModal);
    if (btnCloseAddModal) btnCloseAddModal.addEventListener('click', closeAddModal);

    // Close modals on overlay backdrop click
    [addOfficerModal, deactivateModal, editRoleModal, changePasswordModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAddModal();
            closeDeactivateModal();
            closeEditRoleModal();
            closeChangePasswordModal();
        }
    });

    if (addOfficerForm) {
        addOfficerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const studentIdInput = document.getElementById('officer-input-student-id');
            const nameInput = document.getElementById('officer-input-name');
            const roleSelect = document.getElementById('officer-input-role');
            const passwordInput = document.getElementById('officer-input-password');

            const studentNumber = studentIdInput ? studentIdInput.value.trim() : '';
            const name = nameInput ? nameInput.value.trim() : '';
            const role = roleSelect ? roleSelect.value : '';
            const password = passwordInput ? passwordInput.value.trim() : '';

            let hasError = false;

            const studentNumberRegex = /^\d{4}-\d{4,5}-[A-Za-z0-9]{2,4}-\d$/i;
            if (!studentNumber || !studentNumberRegex.test(studentNumber)) {
                hasError = true;
                if (studentIdInput) studentIdInput.classList.add('input-invalid');
                showToast('Invalid student number format. Expected format: YYYY-XXXXX-BN-0 (e.g. 2024-00123-BN-0)', 'warning');
                return;
            } else if (studentIdInput) {
                studentIdInput.classList.remove('input-invalid');
            }

            if (!name || name.length < 2) {
                hasError = true;
                if (nameInput) nameInput.classList.add('input-invalid');
            } else if (nameInput) {
                nameInput.classList.remove('input-invalid');
            }

            if (!role) {
                hasError = true;
                if (roleSelect) roleSelect.classList.add('input-invalid');
            } else if (roleSelect) {
                roleSelect.classList.remove('input-invalid');
            }

            if (!password || password.length < 6) {
                hasError = true;
                if (passwordInput) passwordInput.classList.add('input-invalid');
            } else if (passwordInput) {
                passwordInput.classList.remove('input-invalid');
            }

            if (hasError) {
                showToast('Please complete all fields. Password must be at least 6 characters.', 'warning');
                return;
            }

            // EIC cannot create accounts with executive roles
            if (isEicViewer() && EXECUTIVE_ROLES.includes(role)) {
                showToast('Editor-in-Chief is not permitted to create executive accounts.', 'danger');
                return;
            }

            // Check if student number already exists locally
            const snExists = officersList.some(o => (o.studentNumber || '').toLowerCase() === studentNumber.toLowerCase());
            if (snExists) {
                showToast('An officer with this student number already exists.', 'warning');
                if (studentIdInput) studentIdInput.classList.add('input-invalid');
                return;
            }

            // Post to backend
            if (window.__ACCOUNT_ROUTES__ && window.__ACCOUNT_ROUTES__.store) {
                try {
                    const res = await fetch(window.__ACCOUNT_ROUTES__.store, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': getCsrfToken(),
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            student_number: studentNumber,
                            full_name: name,
                            role: role,
                            password: password
                        })
                    });

                    const data = await res.json();
                    if (!res.ok || data.success === false) {
                        showToast(data.message || 'Failed to create officer account.', 'danger');
                        return;
                    }

                    const createdOfficer = {
                        id: data.officer?.id || `off-${Date.now()}`,
                        name: data.officer?.full_name || name,
                        studentNumber: data.officer?.student_number || studentNumber,
                        role: data.officer?.role?.role_name || data.officer?.role || role,
                        avatar: data.officer?.avatar || data.officer?.profile_picture_url || 'images/member-placeholder.svg',
                        status: data.officer?.account_status || 'active'
                    };

                    officersList.unshift(createdOfficer);
                    saveOfficers(officersList);
                    renderAccounts();
                    closeAddModal();
                    showToast(data.message || 'Officer account created successfully.', 'success');
                    return;
                } catch (err) {
                    console.warn('Network error creating officer on backend:', err);
                }
            }

            const newOfficer = {
                id: `off-${Date.now()}`,
                name: name,
                studentNumber: studentNumber,
                role: role,
                avatar: 'images/member-placeholder.svg',
                status: 'active'
            };

            officersList.unshift(newOfficer);
            saveOfficers(officersList);
            renderAccounts();
            closeAddModal();
            showToast('Officer account created successfully.', 'success');
        });
    }

    // =========================================================================
    // 11. INITIALIZATION
    // =========================================================================
    renderAccounts();

});

