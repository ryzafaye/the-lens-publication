/**
 * ============================================================================
 * THE LENS — MANAGE OFFICER & MEMBER ACCOUNTS LOGIC (EXECUTIVE & EIC PORTAL)
 * Full Frontend-to-Backend Integration
 * 
 * Features:
 * 1. Synchronized with Backend Endpoints (Store, Update Role, Toggle Status)
 * 2. Real-time Search (Name, Student Number, and Role)
 * 3. Status Filter (All Accounts, Active Only, Deactivated Only)
 * 4. Add Officer / Member Account Modal:
 *    - Fields: Student Number, Full Name, Role
 *    - Sends POST to backend store endpoint
 * 5. Edit Officer / Member Role Modal:
 *    - Pre-selects current role
 *    - Sends PUT to backend updateRole endpoint
 * 6. Deactivate & Reactivate Account Actions:
 *    - Sends PATCH to backend toggleStatus endpoint
 *    - Confirmation dialog for deactivation
 *    - Self-deactivation prevention with backend validation feedback
 * 7. Real-time Statistics Counter (Total, Active, Deactivated)
 * 8. Toast Notification System with backend feedback messages
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. CSRF TOKEN & ROUTE RESOLUTION
    // =========================================================================
    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            || document.querySelector('input[name="_token"]')?.value
            || '';
    }

    const isEicPortal = window.location.pathname.includes('/eic/');
    const defaultBasePath = isEicPortal ? '/eic/manage-accounts' : '/executive/manage-accounts';

    const accountRoutes = window.__ACCOUNT_ROUTES__ || {
        base: defaultBasePath,
        store: defaultBasePath,
        updateRole: defaultBasePath,
        toggleStatus: defaultBasePath
    };

    // =========================================================================
    // 2. TOAST NOTIFICATION HELPER (Default Lens Bullet Dot Style)
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
    // 3. OFFICER ACCOUNTS DATASET (INITIAL HYDRATION & PERSISTENCE)
    // =========================================================================
    const ACCOUNTS_STORAGE_KEY = isEicPortal ? 'eicOfficerAccounts_v3' : 'executiveOfficerAccounts_v3';

    function normalizeOfficer(o) {
        if (!o) return null;
        const roleName = typeof o.role === 'object' && o.role !== null ? (o.role.role_name || 'Staff') : (o.role || 'Staff');
        const avatarUrl = o.avatar || o.avatar_url || o.profile_picture_url || 'images/member-placeholder.svg';
        return {
            id: String(o.id || `off-${Date.now()}`),
            name: o.name || o.full_name || 'Unnamed Member',
            studentNumber: o.studentNumber || o.student_number || '2024-00000-BN-0',
            role: roleName,
            avatar: avatarUrl,
            status: o.status || o.account_status || 'active'
        };
    }

    function loadOfficers() {
        const sourceList = (window.INITIAL_OFFICERS && window.INITIAL_OFFICERS.length > 0) ? window.INITIAL_OFFICERS
            : (window.INITIAL_DATA && window.INITIAL_DATA.length > 0) ? window.INITIAL_DATA
            : (window.OFFICER_DATA && window.OFFICER_DATA.length > 0) ? window.OFFICER_DATA
            : null;

        if (sourceList && Array.isArray(sourceList) && sourceList.length > 0) {
            const normalized = sourceList.map(normalizeOfficer).filter(Boolean);
            saveOfficers(normalized);
            return normalized;
        }

        try {
            const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.map(normalizeOfficer).filter(Boolean);
                }
            }
        } catch (e) {
            console.warn('Failed parsing stored officers, restoring fallback:', e);
        }

        return [];
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
    // 4. DOM REFERENCES
    // =========================================================================
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

    // =========================================================================
    // 5. RENDER OFFICER ACCOUNTS LIST
    // =========================================================================
    function getFilteredOfficers() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const statusFilter = statusFilterSelect ? statusFilterSelect.value : 'all';

        return officersList.filter(officer => {
            // Status filter
            if (statusFilter !== 'all' && officer.status !== statusFilter) {
                return false;
            }

            // Search query matching Name, Role, or Student Number
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
            <span><strong class="stat-highlight">${total}</strong> Total Accounts</span>
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
            const query = searchInput ? searchInput.value.trim() : '';
            const isSearching = !!query || (statusFilterSelect && statusFilterSelect.value !== 'all');
            accountsContainer.innerHTML = `
                <div class="empty-accounts-box">
                    <i class="fa-solid fa-users-slash"></i>
                    <h4 class="empty-accounts-title">${isSearching ? 'No accounts found' : 'No accounts yet'}</h4>
                </div>
            `;
            return;
        }

        accountsContainer.innerHTML = filtered.map(officer => {
            const isDeactivated = officer.status === 'deactivated';
            const avatarSrc = officer.avatar || 'images/member-placeholder.svg';

            return `
                <div class="account-box ${isDeactivated ? 'deactivated' : ''}" id="account-card-${escapeHTML(officer.id)}">
                    
                    <!-- Left: Profile Picture + Details -->
                    <div class="account-info-stack">
                        <div class="officer-avatar-wrapper" title="${escapeHTML(officer.name)}">
                            <img src="${escapeHTML(avatarSrc)}" alt="${escapeHTML(officer.name)}" class="officer-profile-img" onerror="this.onerror=null;this.src='images/member-placeholder.svg';">
                        </div>

                        <div class="officer-details">
                            <!-- Top Line: Full Name + Role Tag -->
                            <div class="officer-primary-row">
                                <h3 class="officer-name">${escapeHTML(officer.name)}</h3>
                                <span class="officer-role-tag">${escapeHTML(officer.role)}</span>
                            </div>

                            <!-- Bottom Line: Account Status & Student Number -->
                            <div class="officer-meta-row">
                                <span class="status-pill ${isDeactivated ? 'deactivated' : 'active'}">
                                    <span class="status-dot"></span>
                                    <span>${isDeactivated ? 'Deactivated' : 'Active'}</span>
                                </span>
                                <span class="text-xs text-stone-500 font-mono ml-2">${escapeHTML(officer.studentNumber)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right Actions: Edit Role + Deactivate / Activate -->
                    <div class="account-actions-stack">
                        <button type="button" class="btn-account-edit-role" data-action="edit-role" data-id="${escapeHTML(officer.id)}" title="Edit officer role">
                            <i class="fa-solid fa-user-pen"></i>
                            <span>Edit Role</span>
                        </button>
                        ${isDeactivated ? `
                            <button type="button" class="btn-account-activate" data-action="activate" data-id="${escapeHTML(officer.id)}" title="Reactivate this account">
                                <i class="fa-solid fa-user-check"></i>
                                <span>Activate</span>
                            </button>
                        ` : `
                            <button type="button" class="btn-account-deactivate" data-action="deactivate" data-id="${escapeHTML(officer.id)}" title="Deactivate account credentials">
                                <i class="fa-solid fa-user-slash"></i>
                                <span>Deactivate</span>
                            </button>
                        `}
                    </div>

                </div>
            `;
        }).join('');
    }

    // =========================================================================
    // 6. SEARCH & FILTER EVENT LISTENERS
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
    // 7. ACTION DELEGATION: EDIT ROLE, DEACTIVATE, ACTIVATE
    // =========================================================================
    if (accountsContainer) {
        accountsContainer.addEventListener('click', async (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;
            const officerId = btn.dataset.id;
            const officer = officersList.find(o => String(o.id) === String(officerId));
            if (!officer) return;

            if (action === 'edit-role') {
                targetEditRoleId = officerId;
                if (editRoleOfficerName) editRoleOfficerName.textContent = officer.name;
                if (editRoleAvatar) editRoleAvatar.src = officer.avatar || 'images/member-placeholder.svg';
                if (editRoleCurrentBadge) editRoleCurrentBadge.innerHTML = `Current Role: <strong>${escapeHTML(officer.role)}</strong>`;
                if (editRoleSelect) {
                    editRoleSelect.value = officer.role;
                    if (!editRoleSelect.value) {
                        Array.from(editRoleSelect.options).forEach(opt => {
                            if (opt.textContent.trim().toLowerCase() === (officer.role || '').toLowerCase()) {
                                editRoleSelect.value = opt.value;
                            }
                        });
                    }
                }
                if (editRoleModal) editRoleModal.classList.remove('hidden');

            } else if (action === 'deactivate') {
                targetDeactivateId = officerId;
                if (deactivateOfficerNameEl) {
                    deactivateOfficerNameEl.textContent = officer.name;
                }
                if (deactivateModal) {
                    deactivateModal.classList.remove('hidden');
                }

            } else if (action === 'activate') {
                const originalHtml = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Activating...</span>';

                try {
                    const statusUrl = `${accountRoutes.base}/${encodeURIComponent(officerId)}/status`;
                    const response = await fetch(statusUrl, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': getCsrfToken(),
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify({ status: 'active' })
                    });

                    const data = await response.json();

                    if (!response.ok || data.success === false) {
                        const errMsg = data.message || 'Failed to reactivate account.';
                        showToast(errMsg, 'warning');
                        return;
                    }

                    officer.status = 'active';
                    saveOfficers(officersList);
                    renderAccounts();
                    showToast(data.message || `Account for ${officer.name} reactivated successfully.`, 'success');
                } catch (err) {
                    console.error('Error reactivating account:', err);
                    showToast('A network or server error occurred while reactivating the account.', 'danger');
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = originalHtml;
                }
            }
        });
    }

    // =========================================================================
    // 8. EDIT ROLE MODAL CONTROLLER & BACKEND SUBMISSION
    // =========================================================================
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
            const newRoleId = editRoleSelect?.selectedOptions?.[0]?.dataset?.id || null;
            if (!newRole) {
                showToast('Please select a valid role.', 'warning');
                return;
            }

            const submitBtn = editRoleForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Updating...</span>';
            }

            try {
                const updateUrl = `${accountRoutes.base}/${encodeURIComponent(targetEditRoleId)}/role`;
                const payload = {
                    role: newRole,
                    role_id: newRoleId
                };

                const response = await fetch(updateUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (!response.ok || data.success === false) {
                    const errMsg = data.message || (data.errors ? Object.values(data.errors).flat().join(' ') : 'Failed to update role.');
                    showToast(errMsg, 'warning');
                    return;
                }

                officer.role = newRole;
                saveOfficers(officersList);

                closeEditRoleModal();
                renderAccounts();
                showToast(data.message || `Role for ${officer.name} updated to ${newRole}.`, 'success');
            } catch (err) {
                console.error('Error updating officer role:', err);
                showToast('A network or server error occurred while updating the role.', 'danger');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    }

    // =========================================================================
    // 9. CONFIRMATION FOR DEACTIVATION & BACKEND SUBMISSION
    // =========================================================================
    function closeDeactivateModal() {
        if (deactivateModal) {
            deactivateModal.classList.add('hidden');
        }
        targetDeactivateId = null;
    }

    if (btnCloseDeactivate) btnCloseDeactivate.addEventListener('click', closeDeactivateModal);

    if (btnConfirmDeactivate) {
        btnConfirmDeactivate.addEventListener('click', async () => {
            if (!targetDeactivateId) return;

            const officerIndex = officersList.findIndex(o => String(o.id) === String(targetDeactivateId));
            if (officerIndex === -1) return;

            const officer = officersList[officerIndex];
            const originalBtnHtml = btnConfirmDeactivate.innerHTML;
            btnConfirmDeactivate.disabled = true;
            btnConfirmDeactivate.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Deactivating...</span>';

            try {
                const statusUrl = `${accountRoutes.base}/${encodeURIComponent(targetDeactivateId)}/status`;
                const response = await fetch(statusUrl, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ status: 'deactivated' })
                });

                const data = await response.json();

                if (!response.ok || data.success === false) {
                    const errMsg = data.message || 'Failed to deactivate account.';
                    showToast(errMsg, 'warning');
                    return;
                }

                officersList[officerIndex].status = 'deactivated';
                saveOfficers(officersList);
                renderAccounts();
                closeDeactivateModal();
                showToast(data.message || `Account for ${officer.name} deactivated.`, 'danger');
            } catch (err) {
                console.error('Error deactivating account:', err);
                showToast('A network or server error occurred while deactivating the account.', 'danger');
            } finally {
                btnConfirmDeactivate.disabled = false;
                btnConfirmDeactivate.innerHTML = originalBtnHtml;
            }
        });
    }

    // =========================================================================
    // 10. ADD OFFICER / MEMBER ACCOUNT MODAL & BACKEND SUBMISSION
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
    [addOfficerModal, deactivateModal, editRoleModal].forEach(modal => {
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
        }
    });

    if (addOfficerForm) {
        addOfficerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const studentIdInput = document.getElementById('officer-input-student-id');
            const nameInput = document.getElementById('officer-input-name');
            const roleSelect = document.getElementById('officer-input-role');

            const studentNumber = studentIdInput ? studentIdInput.value.trim() : '';
            const name = nameInput ? nameInput.value.trim() : '';
            const role = roleSelect ? roleSelect.value : '';
            const roleId = roleSelect?.selectedOptions?.[0]?.dataset?.id || null;

            let hasError = false;

            if (!studentNumber || studentNumber.length < 4) {
                hasError = true;
                if (studentIdInput) studentIdInput.classList.add('input-invalid');
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

            if (hasError) {
                showToast('Please complete all required fields with valid details.', 'warning');
                return;
            }

            // Check if student number already exists locally
            const snExists = officersList.some(o => (o.studentNumber || '').toLowerCase() === studentNumber.toLowerCase());
            if (snExists) {
                showToast('An account with this student number already exists.', 'warning');
                if (studentIdInput) studentIdInput.classList.add('input-invalid');
                return;
            }

            const submitBtn = addOfficerForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Creating...</span>';
            }

            try {
                const storeUrl = accountRoutes.store || accountRoutes.base;
                const payload = {
                    student_number: studentNumber,
                    studentNumber: studentNumber,
                    full_name: name,
                    name: name,
                    role: role,
                    role_id: roleId
                };

                const response = await fetch(storeUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (!response.ok || data.success === false) {
                    const errMsg = data.message || (data.errors ? Object.values(data.errors).flat().join(' ') : 'Failed to create officer account.');
                    showToast(errMsg, 'warning');
                    return;
                }

                const createdOfficer = normalizeOfficer(data.officer) || {
                    id: `off-${Date.now()}`,
                    name: name,
                    studentNumber: studentNumber,
                    role: role,
                    avatar: 'images/member-placeholder.svg',
                    status: 'active'
                };

                // Remove existing if any, then prepend
                officersList = officersList.filter(o => o.id !== createdOfficer.id && o.studentNumber !== createdOfficer.studentNumber);
                officersList.unshift(createdOfficer);
                saveOfficers(officersList);

                renderAccounts();
                closeAddModal();
                showToast(data.message || 'Account created successfully.', 'success');
            } catch (err) {
                console.error('Error creating officer account:', err);
                showToast('A network or server error occurred while creating the account.', 'danger');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    }

    // =========================================================================
    // 11. INITIAL RENDERING
    // =========================================================================
    renderAccounts();

});
