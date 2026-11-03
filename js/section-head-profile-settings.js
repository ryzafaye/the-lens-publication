/**
 * THE LENS — SECTION HEAD PROFILE SETTINGS
 * Clean, Reusable & Modular Implementation
 */

document.addEventListener('DOMContentLoaded', () => {

    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
        window.location.href = 'login.html';
        return;
    }

    const currentSection = localStorage.getItem('sectionHeadSection') || 'News';

    // -------------------------------------------------------------------------
    // 1. DATA INITIALIZATION & HYDRATION
    // -------------------------------------------------------------------------
    let role = localStorage.getItem('sectionHeadRole') || userRole || `${currentSection} Head`;
    let name = localStorage.getItem('sectionHeadName') || localStorage.getItem('userName') || 'Danilo C. Ramos';
    let studentNumber = localStorage.getItem('sectionHeadStudentNumber') || localStorage.getItem('studentNumber') || '2024-00051-BN-0';
    let avatar = localStorage.getItem('sectionHeadAvatar') || localStorage.getItem('userAvatar') || 'images/member-placeholder.svg';

    // DOM Elements
    const inputStudentNumber = document.getElementById('input-student-number');
    const inputFullName = document.getElementById('input-full-name');
    const inputOfficerRole = document.getElementById('input-officer-role');
    const avatarPreviewImg = document.getElementById('avatar-preview-img');
    const avatarFileInput = document.getElementById('avatar-file-input');
    const btnChangeAvatar = document.getElementById('btn-change-avatar');
    const btnResetAvatar = document.getElementById('btn-reset-avatar');
    const profileForm = document.getElementById('profile-info-form');
    const passwordForm = document.getElementById('password-form');
    const toastContainer = document.getElementById('toast-container');

    // Populate Fields
    if (inputStudentNumber) inputStudentNumber.value = studentNumber;
    if (inputFullName) inputFullName.value = name;
    if (inputOfficerRole) inputOfficerRole.value = role;
    if (avatarPreviewImg) avatarPreviewImg.src = avatar;

    // -------------------------------------------------------------------------
    // 2. TOAST HELPER
    // -------------------------------------------------------------------------
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
        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;
        toast.innerHTML = `<span class="toast-bullet-dot"></span><span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-dismissing');
            setTimeout(() => toast.remove(), 260);
        }, 3200);
    }

    // -------------------------------------------------------------------------
    // 3. AVATAR UPLOAD & REMOVE
    // -------------------------------------------------------------------------
    if (btnChangeAvatar && avatarFileInput) {
        btnChangeAvatar.addEventListener('click', () => {
            avatarFileInput.click();
        });

        avatarFileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            if (!file.type.match('image.*')) {
                showToast('Please select a valid image file (JPG, PNG, WEBP).', 'error');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                showToast('Image size exceeds 2MB limit.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (loadEvt) => {
                const base64 = loadEvt.target.result;
                if (avatarPreviewImg) avatarPreviewImg.src = base64;
                avatar = base64;
                showToast('Profile photo staged. Click "Save Profile" to commit.', 'info');
            };
            reader.readAsDataURL(file);
        });
    }

    if (btnResetAvatar) {
        btnResetAvatar.addEventListener('click', () => {
            avatar = 'images/member-placeholder.svg';
            if (avatarPreviewImg) avatarPreviewImg.src = avatar;
            if (avatarFileInput) avatarFileInput.value = '';
            showToast('Avatar reset to default placeholder. Click "Save Profile" to commit.', 'info');
        });
    }

    // -------------------------------------------------------------------------
    // 4. PROFILE FORM SUBMISSION
    // -------------------------------------------------------------------------
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newName = inputFullName ? inputFullName.value.trim() : '';
            const newNum = inputStudentNumber ? inputStudentNumber.value.trim() : '';

            if (!newName) {
                showToast('Please enter your full name.', 'error');
                if (inputFullName) inputFullName.focus();
                return;
            }

            if (!newNum) {
                showToast('Please enter your student number.', 'error');
                if (inputStudentNumber) inputStudentNumber.focus();
                return;
            }

            name = newName;
            studentNumber = newNum;

            localStorage.setItem('userName', name);
            localStorage.setItem('sectionHeadName', name);
            localStorage.setItem('studentNumber', studentNumber);
            localStorage.setItem('sectionHeadStudentNumber', studentNumber);
            localStorage.setItem('userAvatar', avatar);
            localStorage.setItem('sectionHeadAvatar', avatar);

            // Update live chrome
            const sidebarUserName = document.getElementById('sidebar-user-name');
            const sidebarAvatar = document.getElementById('sidebar-avatar-img') || document.querySelector('.sidebar-profile .profile-avatar img');
            if (sidebarUserName) sidebarUserName.textContent = name;
            if (sidebarAvatar) sidebarAvatar.src = avatar;

            showToast('Profile information saved successfully.', 'success');
        });
    }

    // -------------------------------------------------------------------------
    // 5. PASSWORD CHANGE FORM
    // -------------------------------------------------------------------------
    document.querySelectorAll('.btn-toggle-eye').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;

            const isPass = input.type === 'password';
            input.type = isPass ? 'text' : 'password';
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye', !isPass);
                icon.classList.toggle('fa-eye-slash', isPass);
            }
        });
    });

    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const curPass = document.getElementById('input-current-pass');
            const newPass = document.getElementById('input-new-pass');
            const confPass = document.getElementById('input-confirm-pass');

            const curVal = curPass ? curPass.value : '';
            const newVal = newPass ? newPass.value : '';
            const confVal = confPass ? confPass.value : '';

            if (!curVal) {
                showToast('Please provide your current password.', 'error');
                if (curPass) curPass.focus();
                return;
            }

            if (!newVal || newVal.length < 8) {
                showToast('New password must be at least 8 characters long.', 'error');
                if (newPass) newPass.focus();
                return;
            }

            if (newVal !== confVal) {
                showToast('New password and confirm password do not match.', 'error');
                if (confPass) confPass.focus();
                return;
            }

            // Simulate update
            passwordForm.reset();
            showToast('Account password updated successfully.', 'success');
        });
    }
});

