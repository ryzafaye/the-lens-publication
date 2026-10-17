/* =========================================================
   THE LENS — ADMIN PORTAL JAVASCRIPT
   File: js/admin.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    
    // =========================================================
    // ADD USER MODAL CONTROLLER (admin-accounts.html)
    // =========================================================
    const addUserModal = document.getElementById('addUserModal');
    const openAddUserModal = document.getElementById('openAddUserModal');
    const closeAddUserModal = document.getElementById('closeAddUserModal');
    const cancelAddUserModal = document.getElementById('cancelAddUserModal');

    if (addUserModal) {
        const showModal = () => addUserModal.classList.remove('hidden');
        const hideModal = () => addUserModal.classList.add('hidden');

        if (openAddUserModal) openAddUserModal.addEventListener('click', showModal);
        if (closeAddUserModal) closeAddUserModal.addEventListener('click', hideModal);
        if (cancelAddUserModal) cancelAddUserModal.addEventListener('click', hideModal);

        addUserModal.addEventListener('click', (e) => {
            if (e.target === addUserModal) hideModal();
        });
    }

    // =========================================================
    // EDIT USER MODAL CONTROLLER (admin-accounts.html)
    // =========================================================
    const editUserModal = document.getElementById('editUserModal');
    const editButtons = document.querySelectorAll('.editUserBtn');
    const closeEditUserModal = document.getElementById('closeEditUserModal');
    const cancelEditUserModal = document.getElementById('cancelEditUserModal');

    if (editUserModal) {
        const showEditModal = () => editUserModal.classList.remove('hidden');
        const hideEditModal = () => editUserModal.classList.add('hidden');

        // Attach event listeners to all "Edit" action buttons
        editButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // You can pull dataset values here if you want to populate fields dynamically
                showEditModal();
            });
        });

        if (closeEditUserModal) closeEditUserModal.addEventListener('click', hideEditModal);
        if (cancelEditUserModal) cancelEditUserModal.addEventListener('click', hideEditModal);

        editUserModal.addEventListener('click', (e) => {
            if (e.target === editUserModal) hideEditModal();
        });
    }

});