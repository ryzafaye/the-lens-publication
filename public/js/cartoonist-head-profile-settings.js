/**
 * ============================================================================
 * THE LENS ΓÇö PROFILE SETTINGS LOGIC (CARTOONIST HEAD PORTAL)
 * Manages Officer Profile Details, Avatar Upload, and Password Security
 * Exact Parity with President / Executive Profile Settings Format, Design & Logic
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 1. AUTHENTICATION & ROLE VERIFICATION (CARTOONIST HEAD PORTAL)
    // =========================================================================
    const activeRole = localStorage.getItem('cartoonistHeadRole') || localStorage.getItem('userRole') || 'Cartoonist Head';
    let userRole = 'Cartoonist Head';
    
    let rawStoredName = localStorage.getItem('cartoonistHeadName') || localStorage.getItem('userName');
    let userName = rawStoredName || 'Danilo Reyes';
    
    let rawStoredNum = localStorage.getItem('cartoonistHeadStudentNumber') || localStorage.getItem('studentNumber');
    let studentNumber = rawStoredNum || '2024-00030-BN-0';
    
    let userAvatar = localStorage.getItem('cartoonistHeadAvatar') || localStorage.getItem('userAvatar') || 'images/member-placeholder.svg';

    // Cache clean credentials
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userName', userName);
    localStorage.setItem('studentNumber', studentNumber);
    localStorage.setItem('cartoonistHeadRole', userRole);
    localStorage.setItem('cartoonistHeadName', userName);
    localStorage.setItem('cartoonistHeadStudentNumber', studentNumber);

    // Sync roles across DOM
    const topbarRoleBadge = document.getElementById('topbar-user-role');
    const sidebarRoleText = document.getElementById('sidebar-user-role');
    const mobileRoleText = document.getElementById('mobile-user-role');

    if (topbarRoleBadge) topbarRoleBadge.textContent = userRole;
    if (sidebarRoleText) sidebarRoleText.textContent = userRole;
    if (mobileRoleText) mobileRoleText.textContent = userRole;

    // Sync names across DOM
    const sidebarUserName = document.getElementById('sidebar-user-name');
    const mobileUserName = document.getElementById('mobile-user-name');

    if (sidebarUserName) sidebarUserName.textContent = userName;
    if (mobileUserName) mobileUserName.textContent = userName;

    // Sync avatar across DOM
    function updateAllAvatars(src) {
        const previewImg = document.getElementById('avatar-preview-img');
        const sidebarImg = document.getElementById('sidebar-avatar-img') || document.getElementById('sidebar-user-avatar');
        const topbarImg = document.getElementById('topbar-avatar-img');
        const mobileImg = document.getElementById('mobile-avatar-img');

        if (previewImg) previewImg.src = src;
        if (sidebarImg) sidebarImg.src = src;
        if (topbarImg) topbarImg.src = src;
        if (mobileImg) mobileImg.src = src;
    }
    updateAllAvatars(userAvatar);

    // =========================================================================
    // 2. TOAST NOTIFICATIONS
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
        }, 3200);
    }

    // =========================================================================
    // 3. PROFILE HYDRATION & PHOTO UPLOAD
    // =========================================================================
    const inputStudentNumber = document.getElementById('input-student-number');
    const inputFullName = document.getElementById('input-full-name');
    const inputOfficerRole = document.getElementById('input-officer-role');
    const avatarFileInput = document.getElementById('avatar-file-input');
    const btnChangeAvatar = document.getElementById('btn-change-avatar');
    const btnResetAvatar = document.getElementById('btn-reset-avatar');
    const profileInfoForm = document.getElementById('profile-info-form');

    if (inputStudentNumber) inputStudentNumber.value = studentNumber;
    if (inputFullName) inputFullName.value = userName;
    if (inputOfficerRole) inputOfficerRole.value = userRole;

    if (btnChangeAvatar && avatarFileInput) {
        btnChangeAvatar.addEventListener('click', () => {
            avatarFileInput.click();
        });

        avatarFileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            if (!file.type.match(/^image\/(jpeg|png|webp)$/i)) {
                showToast('Please select a JPG, PNG, or WEBP image file.', 'error');
                avatarFileInput.value = '';
                return;
            }

            if (file.size > 4 * 1024 * 1024) {
                showToast('Image file size must not exceed 4MB.', 'error');
                avatarFileInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (evt) {
                const base64Img = evt.target.result;
                try {
                    localStorage.setItem('cartoonistHeadAvatar', base64Img);
                    localStorage.setItem('userAvatar', base64Img);
                    userAvatar = base64Img;
                    updateAllAvatars(base64Img);
                    showToast('Profile photo updated.');
                } catch (err) {
                    console.warn('Storage quota exceeded, showing preview only', err);
                    updateAllAvatars(base64Img);
                    showToast('Profile photo preview updated.');
                }
            };
            reader.readAsDataURL(file);
        });
    }

    if (btnResetAvatar) {
        btnResetAvatar.addEventListener('click', () => {
            const defaultPlaceholder = 'images/member-placeholder.svg';
            localStorage.removeItem('cartoonistHeadAvatar');
            localStorage.setItem('userAvatar', defaultPlaceholder);
            userAvatar = defaultPlaceholder;
            updateAllAvatars(defaultPlaceholder);
            if (avatarFileInput) avatarFileInput.value = '';
            showToast('Profile photo reset to default placeholder.');
        });
    }

    if (profileInfoForm) {
        profileInfoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = (inputFullName ? inputFullName.value : '').trim();
            const newStudentNum = (inputStudentNumber ? inputStudentNumber.value : '').trim();

            if (!newName) {
                showToast('Please enter your full name.', 'error');
                if (inputFullName) inputFullName.focus();
                return;
            }

            if (!newStudentNum) {
                showToast('Please enter your student number.', 'error');
                if (inputStudentNumber) inputStudentNumber.focus();
                return;
            }

            userName = newName;
            studentNumber = newStudentNum;

            localStorage.setItem('userName', newName);
            localStorage.setItem('studentNumber', newStudentNum);
            localStorage.setItem('cartoonistHeadName', newName);
            localStorage.setItem('cartoonistHeadStudentNumber', newStudentNum);

            if (sidebarUserName) sidebarUserName.textContent = newName;
            if (mobileUserName) mobileUserName.textContent = newName;

            showToast('Officer profile updated successfully.');
        });
    }

    // =========================================================================
    // 4. PASSWORD & SECURITY CHANGE
    // =========================================================================
    const passwordForm = document.getElementById('password-change-form');
    const inputCurrentPassword = document.getElementById('input-current-password');
    const inputNewPassword = document.getElementById('input-new-password');
    const inputConfirmPassword = document.getElementById('input-confirm-password');

    // Password visibility toggles
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            if (!targetInput) return;

            const isPass = targetInput.getAttribute('type') === 'password';
            targetInput.setAttribute('type', isPass ? 'text' : 'password');
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

            const curPass = inputCurrentPassword ? inputCurrentPassword.value : '';
            const newPass = inputNewPassword ? inputNewPassword.value : '';
            const confirmPass = inputConfirmPassword ? inputConfirmPassword.value : '';

            if (!curPass) {
                showToast('Please enter your current password.', 'error');
                if (inputCurrentPassword) inputCurrentPassword.focus();
                return;
            }

            if (newPass.length < 8) {
                showToast('New password must be at least 8 characters long.', 'error');
                if (inputNewPassword) inputNewPassword.focus();
                return;
            }

            if (newPass !== confirmPass) {
                showToast('New passwords do not match. Please re-enter.', 'error');
                if (inputConfirmPassword) inputConfirmPassword.focus();
                return;
            }

            // Simulate successful password change
            if (inputCurrentPassword) inputCurrentPassword.value = '';
            if (inputNewPassword) inputNewPassword.value = '';
            if (inputConfirmPassword) inputConfirmPassword.value = '';

            showToast('Account password updated successfully.');
        });
    }
});

