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
    const userName = localStorage.getItem('userName') || 'Juan Dela Cruz';

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
            name: "Juan Dela Cruz",
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
    // 6. DOM REFERENCES
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

        accountsContainer.innerHTML = filtered.map(officer => {
            const isDeactivated = officer.status === 'deactivated';
            const avatarSrc = officer.avatar || 'images/member-placeholder.svg';

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

                            <!-- Bottom Line: Account Status (Replaces Student Number) -->
                            <div class="officer-meta-row">
                                <span class="status-pill ${isDeactivated ? 'deactivated' : 'active'}">
                                    <span class="status-dot"></span>
                                    <span>${isDeactivated ? 'Deactivated' : 'Active'}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Right Actions: Edit Role + Deactivate / Activate -->
                    <div class="account-actions-stack">
                        <button type="button" class="btn-account-edit-role" data-action="edit-role" data-id="${officer.id}" title="Edit officer role">
                            <i class="fa-solid fa-user-pen"></i>
                            <span>Edit Role</span>
                        </button>
                        ${isDeactivated ? `
                            <button type="button" class="btn-account-activate" data-action="activate" data-id="${officer.id}" title="Reactivate this officer account">
                                <i class="fa-solid fa-user-check"></i>
                                <span>Activate</span>
                            </button>
                        ` : `
                            <button type="button" class="btn-account-deactivate" data-action="deactivate" data-id="${officer.id}" title="Deactivate officer credentials">
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
    // 9. ACTION DELEGATION: DEACTIVATE & ACTIVATE
    // =========================================================================
    if (accountsContainer) {
        accountsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;
            const officerId = btn.dataset.id;
            const officer = officersList.find(o => o.id === officerId);
            if (!officer) return;

            if (action === 'edit-role') {
                targetEditRoleId = officerId;
                if (editRoleOfficerName) editRoleOfficerName.textContent = officer.name;
                if (editRoleAvatar) editRoleAvatar.src = officer.avatar || 'images/member-placeholder.svg';
                if (editRoleCurrentBadge) editRoleCurrentBadge.innerHTML = `Current Role: <strong>${escapeHTML(officer.role)}</strong>`;
                if (editRoleSelect) editRoleSelect.value = officer.role;
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
                officer.status = 'active';
                saveOfficers(officersList);
                renderAccounts();
                showToast(`Officer account reactivated.`, 'success');
            }
        });
    }

    // Edit Role Modal Controller
    function closeEditRoleModal() {
        if (editRoleModal) {
            editRoleModal.classList.add('hidden');
        }
        targetEditRoleId = null;
    }

    if (btnCloseEditRoleModal) btnCloseEditRoleModal.addEventListener('click', closeEditRoleModal);

    if (editRoleForm) {
        editRoleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!targetEditRoleId) return;

            const officer = officersList.find(o => o.id === targetEditRoleId);
            if (!officer) return;

            const newRole = editRoleSelect ? editRoleSelect.value : '';
            if (!newRole) return;

            const oldRole = officer.role;
            officer.role = newRole;
            saveOfficers(officersList);

            // If edited officer is currently signed in, sync userRole in localStorage and live chrome
            const activeUserRole = localStorage.getItem('userRole');
            if (activeUserRole === oldRole || officer.name === (localStorage.getItem('userName') || 'Juan Dela Cruz')) {
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

    // Confirmation for Deactivation
    if (btnConfirmDeactivate) {
        btnConfirmDeactivate.addEventListener('click', () => {
            if (!targetDeactivateId) return;

            const officerIndex = officersList.findIndex(o => o.id === targetDeactivateId);
            if (officerIndex !== -1) {
                officersList[officerIndex].status = 'deactivated';
                saveOfficers(officersList);
                renderAccounts();
                showToast(`Officer account deactivated.`, 'danger');
            }

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
    // 10. ADD OFFICER ACCOUNT MODAL & FORM VALIDATION (BN-0 FORMAT)
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
        addOfficerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const studentIdInput = document.getElementById('officer-input-student-id');
            const nameInput = document.getElementById('officer-input-name');
            const roleSelect = document.getElementById('officer-input-role');

            const studentNumber = studentIdInput ? studentIdInput.value.trim() : '';
            const name = nameInput ? nameInput.value.trim() : '';
            const role = roleSelect ? roleSelect.value : '';

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

            // Check if student number already exists
            const snExists = officersList.some(o => (o.studentNumber || '').toLowerCase() === studentNumber.toLowerCase());
            if (snExists) {
                showToast('An officer with this student number already exists.', 'warning');
                if (studentIdInput) studentIdInput.classList.add('input-invalid');
                return;
            }

            const newOfficer = {
                id: `off-${Date.now()}`,
                name: name,
                studentNumber: studentNumber,
                role: role,
                avatar: 'images/member-placeholder.svg',
                status: 'active'
            };

            // Prepend new officer
            officersList.unshift(newOfficer);
            saveOfficers(officersList);

            // Re-render accounts list
            renderAccounts();

            // Close modal & reset form
            closeAddModal();

            // Success feedback
            showToast('Officer account created successfully.', 'success');
        });
    }

    // =========================================================================
    // 11. INITIALIZATION
    // =========================================================================
    renderAccounts();

});

