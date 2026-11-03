/**
 * THE LENS — EDITOR-IN-CHIEF (EIC) PROFILE SETTINGS
 * Clean, Reusable & Modular Implementation
 */

document.addEventListener('DOMContentLoaded', () => {

    const userRole = localStorage.getItem('eicRole') || localStorage.getItem('userRole');
    if (!userRole) {
        window.location.href = 'login.html';
        return;
    }

    // -------------------------------------------------------------------------
    // 1. DATA INITIALIZATION & HYDRATION
    // -------------------------------------------------------------------------
    let role = localStorage.getItem('eicRole') || userRole || 'Editor-in-Chief';
    let name = localStorage.getItem('eicName') || localStorage.getItem('userName') || 'Victoria Reyes';
    let studentNumber = localStorage.getItem('eicStudentNumber') || localStorage.getItem('studentNumber') || '2024-00010-BN-0';
    let avatar = localStorage.getItem('eicAvatar') || localStorage.getItem('userAvatar') || 'images/member-placeholder.svg';

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
        }, 3000);
    }

    // -------------------------------------------------------------------------
    // 3. AVATAR UPLOAD & RESET HANDLERS
    // -------------------------------------------------------------------------
    if (btnChangeAvatar && avatarFileInput) {
        btnChangeAvatar.addEventListener('click', () => {
            avatarFileInput.click();
        });

        avatarFileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                showToast('Please upload a valid image file (PNG, JPG, or SVG).', 'danger');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                showToast('Image file size must be under 2MB.', 'danger');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                if (avatarPreviewImg) avatarPreviewImg.src = dataUrl;
                localStorage.setItem('eicAvatar', dataUrl);
                localStorage.setItem('userAvatar', dataUrl);

                // Update shell avatars
                const sidebarAvatar = document.getElementById('sidebar-user-avatar') || document.querySelector('.sidebar-profile .profile-avatar img');
                const topbarAvatar = document.querySelector('.topbar-avatar-circle img');
                const mobileAvatar = document.querySelector('.mobile-nav-avatar img');
                if (sidebarAvatar) sidebarAvatar.src = dataUrl;
                if (topbarAvatar) topbarAvatar.src = dataUrl;
                if (mobileAvatar) mobileAvatar.src = dataUrl;

                showToast('Profile photo updated successfully!', 'success');
            };
            reader.readAsDataURL(file);
        });
    }

    if (btnResetAvatar) {
        btnResetAvatar.addEventListener('click', () => {
            const defaultAvatar = 'images/member-placeholder.svg';
            if (avatarPreviewImg) avatarPreviewImg.src = defaultAvatar;
            localStorage.setItem('eicAvatar', defaultAvatar);
            localStorage.setItem('userAvatar', defaultAvatar);

            const sidebarAvatar = document.getElementById('sidebar-user-avatar') || document.querySelector('.sidebar-profile .profile-avatar img');
            const topbarAvatar = document.querySelector('.topbar-avatar-circle img');
            const mobileAvatar = document.querySelector('.mobile-nav-avatar img');
            if (sidebarAvatar) sidebarAvatar.src = defaultAvatar;
            if (topbarAvatar) topbarAvatar.src = defaultAvatar;
            if (mobileAvatar) mobileAvatar.src = defaultAvatar;

            showToast('Profile photo reset to default.', 'info');
        });
    }

    // -------------------------------------------------------------------------
    // 4. PROFILE INFO FORM SUBMISSION
    // -------------------------------------------------------------------------
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newName = inputFullName ? inputFullName.value.trim() : '';

            if (!newName) {
                showToast('Please enter your full name.', 'warning');
                return;
            }

            localStorage.setItem('eicName', newName);
            localStorage.setItem('userName', newName);

            // Reflect on UI
            const sidebarName = document.getElementById('sidebar-user-name');
            const mobileName = document.getElementById('mobile-user-name');
            if (sidebarName) sidebarName.textContent = newName;
            if (mobileName) mobileName.textContent = newName;

            showToast('Profile information saved successfully!', 'success');
        });
    }

    // -------------------------------------------------------------------------
    // 5. PASSWORD FORM & CRITERIA VALIDATION
    // -------------------------------------------------------------------------
    const inputCurrentPassword = document.getElementById('input-current-password');
    const inputNewPassword = document.getElementById('input-new-password');
    const inputConfirmPassword = document.getElementById('input-confirm-password');

    const critLength = document.getElementById('crit-length');
    const critMatch = document.getElementById('crit-match');

    function validatePasswordInputs() {
        const newPass = inputNewPassword ? inputNewPassword.value : '';
        const confPass = inputConfirmPassword ? inputConfirmPassword.value : '';

        const isLongEnough = newPass.length >= 6;
        const isMatching = (newPass.length > 0 && newPass === confPass);

        if (critLength) critLength.classList.toggle('valid', isLongEnough);
        if (critMatch) critMatch.classList.toggle('valid', isMatching);

        return isLongEnough && isMatching;
    }

    if (inputNewPassword) inputNewPassword.addEventListener('input', validatePasswordInputs);
    if (inputConfirmPassword) inputConfirmPassword.addEventListener('input', validatePasswordInputs);

    // Password Visibility Toggles
    const toggleBtns = document.querySelectorAll('.password-toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';

            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye', !isPassword);
                icon.classList.toggle('fa-eye-slash', isPassword);
            }
        });
    });

    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const curPass = inputCurrentPassword ? inputCurrentPassword.value : '';
            const newPass = inputNewPassword ? inputNewPassword.value : '';
            const confPass = inputConfirmPassword ? inputConfirmPassword.value : '';

            if (!curPass) {
                showToast('Please enter your current password.', 'warning');
                if (inputCurrentPassword) inputCurrentPassword.focus();
                return;
            }

            if (!validatePasswordInputs()) {
                showToast('Please ensure your new password meets all criteria.', 'warning');
                return;
            }

            // Simulated password update
            if (inputCurrentPassword) inputCurrentPassword.value = '';
            if (inputNewPassword) inputNewPassword.value = '';
            if (inputConfirmPassword) inputConfirmPassword.value = '';
            validatePasswordInputs();

            showToast('Password updated successfully!', 'success');
        });
    }
});

