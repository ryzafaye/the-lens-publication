/**
 * ============================================================================
 * THE LENS — MANAGE OFFICER ACCOUNTS LOGIC (EXECUTIVE & EIC PORTALS)
 * Live Database Integration via Laravel Backend
 * 
 * Features:
 * 1. Live Database Hydration (window.OFFICER_DATA & window.AVAILABLE_ROLES)
 *    - Includes ALL staff and officers: Writers, Cartoonists, Media Team, and Board
 * 2. Real-time Search (Name, Student Number, and Role)
 * 3. Status Filter (All, Active, Deactivated)
 * 4. Add Officer Account Modal (POST to Laravel store endpoint with CSRF)
 * 5. Edit Officer Role Modal (PUT to Laravel update-role endpoint with CSRF)
 * 6. Deactivate & Activate Actions with Confirmation Modal (PATCH status)
 * 7. Custom Compact Scrollable Role Dropdown (max-height: 195px, smooth scrolling)
 * 8. Executive Toast Notification System (Dark Pill with Bullet Dot)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. BACKEND ROUTE & DATA INITIALIZATION
    // =========================================================================
    const routes = window.__ACCOUNT_ROUTES__ || {
        base: '/eic/manage-accounts',
        store: '/eic/manage-accounts',
        updateRole: '/eic/manage-accounts',
        toggleStatus: '/eic/manage-accounts'
    };

    function getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) return meta.getAttribute('content');
        const input = document.querySelector('input[name="_token"]');
        return input ? input.value : '';
    }

    function normalizeOfficer(officer) {
        if (!officer) return null;
        const roleName = officer.role ? (officer.role.role_name || officer.role) : (officer.role_name || officer.role || 'Officer');
        const roleId = officer.role_id || (officer.role ? officer.role.id : null);
        const avatarUrl = officer.profile_picture_url || officer.avatar || '/images/member-placeholder.svg';
        return {
            id: officer.id,
            name: officer.full_name || officer.name || '',
            studentNumber: officer.student_number || officer.studentNumber || '',
            role: roleName,
            roleId: roleId,
            avatar: avatarUrl,
            status: officer.account_status || officer.status || 'active',
            raw: officer
        };
    }

    let rawOfficers = Array.isArray(window.OFFICER_DATA) ? window.OFFICER_DATA : [];
    let officersList = rawOfficers.map(normalizeOfficer).filter(Boolean);

    // =========================================================================
    // 2. TOAST NOTIFICATION HELPER
    // =========================================================================
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
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }

        const existingToasts = container.querySelectorAll('.toast-message');
        existingToasts.forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;
        toast.innerHTML = `<span class="toast-bullet-dot"></span><span>${escapeHTML(message)}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-dismissing');
            setTimeout(() => toast.remove(), 260);
        }, 3400);
    }

    // =========================================================================
    // 3. DOM REFERENCES
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
    // 4. CUSTOM SCROLLABLE ROLE DROPDOWN CONTROLLERS (Add & Edit Modals)
    // =========================================================================
    function initCustomRoleDropdown(wrapperId, triggerId, labelId, menuId, selectId) {
        const wrapper = document.getElementById(wrapperId);
        const trigger = document.getElementById(triggerId);
        const label = document.getElementById(labelId);
        const menu = document.getElementById(menuId);
        const select = document.getElementById(selectId);

        if (!wrapper || !trigger || !label || !menu || !select) return null;

        function closeDropdown() {
            menu.classList.add('hidden');
            trigger.classList.remove('active');
            trigger.setAttribute('aria-expanded', 'false');
        }

        function openDropdown() {
            // Close any other open custom dropdowns first
            document.querySelectorAll('.custom-select-menu').forEach(m => m.classList.add('hidden'));
            document.querySelectorAll('.custom-select-trigger').forEach(t => t.classList.remove('active'));

            menu.classList.remove('hidden');
            trigger.classList.add('active');
            trigger.setAttribute('aria-expanded', 'true');

            // Scroll to currently selected item if any
            const selectedOpt = menu.querySelector('.custom-select-option.selected');
            if (selectedOpt) {
                selectedOpt.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (menu.classList.contains('hidden')) {
                openDropdown();
            } else {
                closeDropdown();
            }
        });

        menu.addEventListener('click', (e) => {
            const opt = e.target.closest('.custom-select-option');
            if (!opt) return;

            const val = opt.dataset.value;
            const roleName = opt.dataset.roleName || (opt.querySelector('span') ? opt.querySelector('span').textContent.trim() : '');

            select.value = val;
            label.textContent = roleName;
            trigger.classList.remove('input-invalid');

            menu.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');

            closeDropdown();
            select.dispatchEvent(new Event('change', { bubbles: true }));
        });

        function setValue(val, text) {
            select.value = val;
            let matchedName = text;
            menu.querySelectorAll('.custom-select-option').forEach(opt => {
                if (String(opt.dataset.value) === String(val) || (text && opt.dataset.roleName && opt.dataset.roleName.toLowerCase() === text.toLowerCase())) {
                    opt.classList.add('selected');
                    matchedName = opt.dataset.roleName;
                    select.value = opt.dataset.value;
                } else {
                    opt.classList.remove('selected');
                }
            });
            label.textContent = matchedName || 'Select role...';
        }

        function resetValue() {
            select.value = '';
            label.textContent = 'Select role...';
            menu.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
            trigger.classList.remove('input-invalid');
            closeDropdown();
        }

        return { closeDropdown, openDropdown, setValue, resetValue };
    }

    const addRoleDropdown = initCustomRoleDropdown(
        'add-role-select-wrapper',
        'add-role-trigger',
        'add-role-label',
        'add-role-menu',
        'officer-input-role'
    );

    const editRoleDropdown = initCustomRoleDropdown(
        'edit-role-select-wrapper',
        'edit-role-trigger',
        'edit-role-label',
        'edit-role-menu',
        'edit-role-select'
    );

    // Global click-outside listener to close open custom select menus
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select-wrapper')) {
            document.querySelectorAll('.custom-select-menu').forEach(m => m.classList.add('hidden'));
            document.querySelectorAll('.custom-select-trigger').forEach(t => t.classList.remove('active'));
        }
    });

    // =========================================================================
    // 5. FILTER & RENDER ACCOUNTS LIST
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
            <span><strong class="stat-highlight">${total}</strong> Total Officers &amp; Staff</span>
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
                    <h4 class="empty-accounts-title">No Accounts Found</h4>
                    <p class="empty-accounts-subtitle">
                        No member accounts match your current search and filter criteria.
                    </p>
                </div>
            `;
            return;
        }

        accountsContainer.innerHTML = filtered.map(officer => {
            const isDeactivated = officer.status === 'deactivated';
            const avatarSrc = officer.avatar || '/images/member-placeholder.svg';

            return `
                <div class="account-box ${isDeactivated ? 'deactivated' : ''}" id="account-card-${officer.id}">
                    
                    <!-- Left: Profile Picture + Details -->
                    <div class="account-info-stack">
                        <div class="officer-avatar-wrapper" title="${escapeHTML(officer.name)}">
                            <img src="${escapeHTML(avatarSrc)}" alt="${escapeHTML(officer.name)}" class="officer-profile-img" onerror="this.src='/images/member-placeholder.svg'">
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
                                ${officer.studentNumber ? `<span class="officer-sn-tag" style="font-size:0.75rem; color:#64748b; font-weight:500;">${escapeHTML(officer.studentNumber)}</span>` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Right Actions: Edit Role + Deactivate / Activate -->
                    <div class="account-actions-stack">
                        <button type="button" class="btn-account-edit-role" data-action="edit-role" data-id="${officer.id}" title="Edit role">
                            <i class="fa-solid fa-user-pen"></i>
                            <span>Edit Role</span>
                        </button>
                        ${isDeactivated ? `
                            <button type="button" class="btn-account-activate" data-action="activate" data-id="${officer.id}" title="Reactivate this account">
                                <i class="fa-solid fa-user-check"></i>
                                <span>Activate</span>
                            </button>
                        ` : `
                            <button type="button" class="btn-account-deactivate" data-action="deactivate" data-id="${officer.id}" title="Deactivate account credentials">
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
    // 7. ACTION DELEGATION: EDIT ROLE, DEACTIVATE & ACTIVATE
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
                if (editRoleAvatar) editRoleAvatar.src = officer.avatar || '/images/member-placeholder.svg';
                if (editRoleCurrentBadge) editRoleCurrentBadge.innerHTML = `Current Role: <strong>${escapeHTML(officer.role)}</strong>`;
                
                // Synchronize custom dropdown
                if (editRoleDropdown) {
                    editRoleDropdown.setValue(officer.roleId, officer.role);
                } else if (editRoleSelect) {
                    editRoleSelect.value = officer.roleId;
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
                // Send PATCH request to backend to activate account
                btn.disabled = true;
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Activating...</span>';

                try {
                    const url = `${routes.toggleStatus}/${officerId}/status`;
                    const response = await fetch(url, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': getCsrfToken()
                        },
                        body: JSON.stringify({ status: 'active' })
                    });

                    const data = await response.json();

                    if (!response.ok || !data.success) {
                        showToast(data.message || 'Failed to reactivate account.', 'warning');
                        btn.disabled = false;
                        btn.innerHTML = originalHtml;
                        return;
                    }

                    officer.status = 'active';
                    renderAccounts();
                    showToast(data.message || 'Account reactivated.', 'success');
                } catch (err) {
                    console.error('Network error activating account:', err);
                    showToast('Network error while activating account.', 'warning');
                    btn.disabled = false;
                    btn.innerHTML = originalHtml;
                }
            }
        });
    }

    // =========================================================================
    // 8. EDIT ROLE MODAL & FORM SUBMISSION
    // =========================================================================
    function closeEditRoleModal() {
        if (editRoleModal) {
            editRoleModal.classList.add('hidden');
        }
        document.querySelectorAll('.custom-select-menu').forEach(m => m.classList.add('hidden'));
        document.querySelectorAll('.custom-select-trigger').forEach(t => t.classList.remove('active'));
        targetEditRoleId = null;
    }

    if (btnCloseEditRoleModal) btnCloseEditRoleModal.addEventListener('click', closeEditRoleModal);

    if (editRoleForm) {
        editRoleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!targetEditRoleId) return;

            const officer = officersList.find(o => String(o.id) === String(targetEditRoleId));
            if (!officer) return;

            const newRoleId = editRoleSelect ? editRoleSelect.value : '';
            if (!newRoleId) {
                showToast('Please select a valid role.', 'warning');
                return;
            }

            const submitBtn = editRoleForm.querySelector('button[type="submit"]');
            const originalContent = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Saving...</span>';
            }

            try {
                const url = `${routes.updateRole}/${targetEditRoleId}/role`;
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken()
                    },
                    body: JSON.stringify({ role_id: newRoleId })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    const errorMsg = data.message || (data.errors ? Object.values(data.errors).flat().join(' ') : 'Failed to update role.');
                    showToast(errorMsg, 'warning');
                    return;
                }

                if (data.officer) {
                    const updated = normalizeOfficer(data.officer);
                    officer.role = updated.role;
                    officer.roleId = updated.roleId;
                } else {
                    const selectedOpt = editRoleSelect.options[editRoleSelect.selectedIndex];
                    officer.role = selectedOpt ? (selectedOpt.dataset.roleName || selectedOpt.textContent.trim()) : 'Officer';
                    officer.roleId = newRoleId;
                }

                closeEditRoleModal();
                renderAccounts();
                showToast(data.message || `Role updated successfully.`, 'success');
            } catch (err) {
                console.error('Error updating role:', err);
                showToast('A network error occurred while updating the role.', 'warning');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalContent;
                }
            }
        });
    }

    // =========================================================================
    // 9. DEACTIVATE CONFIRMATION MODAL & SUBMISSION
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

            const officer = officersList.find(o => String(o.id) === String(targetDeactivateId));
            if (!officer) return;

            btnConfirmDeactivate.disabled = true;
            const originalContent = btnConfirmDeactivate.innerHTML;
            btnConfirmDeactivate.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Deactivating...</span>';

            try {
                const url = `${routes.toggleStatus}/${targetDeactivateId}/status`;
                const response = await fetch(url, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken()
                    },
                    body: JSON.stringify({ status: 'deactivated' })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    showToast(data.message || 'Failed to deactivate account.', 'warning');
                    return;
                }

                officer.status = 'deactivated';
                closeDeactivateModal();
                renderAccounts();
                showToast(data.message || 'Account deactivated.', 'danger');
            } catch (err) {
                console.error('Error deactivating account:', err);
                showToast('A network error occurred while deactivating account.', 'warning');
            } finally {
                btnConfirmDeactivate.disabled = false;
                btnConfirmDeactivate.innerHTML = originalContent;
            }
        });
    }

    // =========================================================================
    // 10. ADD OFFICER ACCOUNT MODAL & FORM SUBMISSION
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
        if (addRoleDropdown) {
            addRoleDropdown.resetValue();
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
            const addTrigger = document.getElementById('add-role-trigger');

            const studentNumber = studentIdInput ? studentIdInput.value.trim() : '';
            const name = nameInput ? nameInput.value.trim() : '';
            const roleId = roleSelect ? roleSelect.value : '';

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

            if (!roleId) {
                hasError = true;
                if (addTrigger) addTrigger.classList.add('input-invalid');
                if (roleSelect) roleSelect.classList.add('input-invalid');
            } else {
                if (addTrigger) addTrigger.classList.remove('input-invalid');
                if (roleSelect) roleSelect.classList.remove('input-invalid');
            }

            if (hasError) {
                showToast('Please complete all required fields with valid details.', 'warning');
                return;
            }

            const submitBtn = addOfficerForm.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Creating...</span>';
            }

            try {
                const response = await fetch(routes.store, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken()
                    },
                    body: JSON.stringify({
                        student_number: studentNumber,
                        full_name: name,
                        role_id: roleId
                    })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    const errorMsg = data.message || (data.errors ? Object.values(data.errors).flat().join(' ') : 'Failed to create account.');
                    showToast(errorMsg, 'warning');
                    if (data.errors && data.errors.student_number && studentIdInput) {
                        studentIdInput.classList.add('input-invalid');
                    }
                    return;
                }

                // Add newly created officer to local array and re-render
                if (data.officer) {
                    const createdOfficer = normalizeOfficer(data.officer);
                    officersList.unshift(createdOfficer);
                }

                renderAccounts();
                closeAddModal();
                showToast(data.message || 'Account created successfully.', 'success');
            } catch (err) {
                console.error('Error creating account:', err);
                showToast('A network error occurred while creating the account.', 'warning');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnContent;
                }
            }
        });
    }

    // =========================================================================
    // 11. INITIALIZATION
    // =========================================================================
    renderAccounts();

});
