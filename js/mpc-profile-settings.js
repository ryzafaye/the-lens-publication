/**
 * ============================================================================
 * THE LENS — PROFILE SETTINGS LOGIC (MEDIA & PUBLIC COMMUNICATIONS / M&PC PORTAL)
 * Manages Officer Profile Details, Avatar Upload, and Password Security
 * Exact Parity with Executive Profile Settings Format, Design & Logic
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 1. AUTHENTICATION & ROLE VERIFICATION (M&PC PORTAL)
    // =========================================================================
    const activeRole = localStorage.getItem('mpcRole') || localStorage.getItem('userRole') || 'M&PC Head';
    let userRole = activeRole.toLowerCase().includes('assoc') ? 'Assoc M&PC Head' : 'M&PC Head';
    
    let rawStoredName = localStorage.getItem('mpcName') || localStorage.getItem('userName');
    let userName = rawStoredName || 'Julian Del Rosario';
    
    let rawStoredNum = localStorage.getItem('mpcStudentNumber') || localStorage.getItem('studentNumber');
    let studentNumber = rawStoredNum || (userRole.includes('Assoc') ? '2024-00021-BN-0' : '2024-00020-BN-0');
    
    let userAvatar = localStorage.getItem('mpcAvatar') || localStorage.getItem('userAvatar') || 'images/member-placeholder.svg';

    // Cache clean M&PC credentials
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userName', userName);
    localStorage.setItem('studentNumber', studentNumber);
    localStorage.setItem('mpcRole', userRole);
    localStorage.setItem('mpcName', userName);
    localStorage.setItem('mpcStudentNumber', studentNumber);

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

    // Trigger file dialog
    if (btnChangeAvatar && avatarFileInput) {
        btnChangeAvatar.addEventListener('click', () => {
            avatarFileInput.click();
        });
    }

    // Handle chosen file
    if (avatarFileInput) {
        avatarFileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            // Validate file size (max 3MB)
            if (file.size > 3 * 1024 * 1024) {
                showToast('Image file too large. Please select an image under 3MB.', 'danger');
                avatarFileInput.value = '';
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showToast('Invalid file type. Please select an image (JPG, PNG, or WEBP).', 'danger');
                avatarFileInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (loadEvt) => {
                const dataUrl = loadEvt.target.result;
                try {
                    localStorage.setItem('userAvatar', dataUrl);
                    localStorage.setItem('mpcAvatar', dataUrl);
                    userAvatar = dataUrl;
                    updateAllAvatars(dataUrl);
                    showToast('Profile photo updated.');
                } catch (err) {
                    console.warn('Could not store full avatar dataUrl in localStorage:', err);
                    updateAllAvatars(dataUrl);
                    showToast('Profile photo preview updated.');
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // Reset avatar to placeholder
    if (btnResetAvatar) {
        btnResetAvatar.addEventListener('click', () => {
            const defaultPlaceholder = 'images/member-placeholder.svg';
            localStorage.setItem('userAvatar', defaultPlaceholder);
            localStorage.setItem('mpcAvatar', defaultPlaceholder);
            userAvatar = defaultPlaceholder;
            updateAllAvatars(defaultPlaceholder);
            if (avatarFileInput) avatarFileInput.value = '';
            showToast('Profile photo reset to default placeholder.');
        });
    }

    // Profile Information Form Submit
    if (profileInfoForm) {
        profileInfoForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newName = inputFullName ? inputFullName.value.trim() : '';
            const newStudentNum = inputStudentNumber ? inputStudentNumber.value.trim() : '';

            if (!newName) {
                showToast('Please enter your full name.', 'danger');
                if (inputFullName) inputFullName.focus();
                return;
            }

            if (!newStudentNum) {
                showToast('Please enter your student number.', 'danger');
                if (inputStudentNumber) inputStudentNumber.focus();
                return;
            }

            // Save to localStorage
            localStorage.setItem('userName', newName);
            localStorage.setItem('studentNumber', newStudentNum);
            localStorage.setItem('mpcName', newName);
            localStorage.setItem('mpcStudentNumber', newStudentNum);
            userName = newName;
            studentNumber = newStudentNum;

            // Sync with sidebar and mobile drawer
            if (sidebarUserName) sidebarUserName.textContent = newName;
            if (mobileUserName) mobileUserName.textContent = newName;

            showToast('Profile details updated successfully.');
        });
    }

    // =========================================================================
    // 4. PASSWORD & SECURITY FORM
    // =========================================================================
    const passwordForm = document.getElementById('password-change-form');
    const inputCurrentPass = document.getElementById('input-current-password');
    const inputNewPass = document.getElementById('input-new-password');
    const inputConfirmPass = document.getElementById('input-confirm-password');

    // Eye toggle buttons
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            if (!targetId) return;

            const input = document.getElementById(targetId);
            if (!input) return;

            const isPass = (input.type === 'password');
            input.type = isPass ? 'text' : 'password';

            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isPass ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
            }
        });
    });

    // Password criteria real-time feedback
    function updatePasswordCriteria() {
        const newPass = inputNewPass ? inputNewPass.value : '';
        const confirmPass = inputConfirmPass ? inputConfirmPass.value : '';

        const critLength = document.getElementById('crit-length');
        const critMatch = document.getElementById('crit-match');

        if (critLength) {
            const hasLength = newPass.length >= 6;
            critLength.style.color = hasLength ? '#027a48' : '#667085';
            const icon = critLength.querySelector('i');
            if (icon) icon.style.color = hasLength ? '#12b76a' : '#98a2b3';
        }

        if (critMatch) {
            const isMatch = (newPass.length > 0 && newPass === confirmPass);
            critMatch.style.color = isMatch ? '#027a48' : '#667085';
            const icon = critMatch.querySelector('i');
            if (icon) icon.style.color = isMatch ? '#12b76a' : '#98a2b3';
        }
    }

    if (inputNewPass) inputNewPass.addEventListener('input', updatePasswordCriteria);
    if (inputConfirmPass) inputConfirmPass.addEventListener('input', updatePasswordCriteria);

    // Password Form Submit
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const currentVal = inputCurrentPass ? inputCurrentPass.value.trim() : '';
            const newVal = inputNewPass ? inputNewPass.value.trim() : '';
            const confirmVal = inputConfirmPass ? inputConfirmPass.value.trim() : '';

            if (!currentVal) {
                showToast('Please enter your current password.', 'danger');
                if (inputCurrentPass) inputCurrentPass.focus();
                return;
            }

            if (!newVal) {
                showToast('Please enter a new password.', 'danger');
                if (inputNewPass) inputNewPass.focus();
                return;
            }

            if (newVal.length < 6) {
                showToast('New password must be at least 6 characters.', 'danger');
                if (inputNewPass) inputNewPass.focus();
                return;
            }

            if (newVal !== confirmVal) {
                showToast('New passwords do not match. Please re-enter.', 'danger');
                if (inputConfirmPass) inputConfirmPass.focus();
                return;
            }

            if (newVal === currentVal) {
                showToast('New password must be different from current password.', 'danger');
                if (inputNewPass) inputNewPass.focus();
                return;
            }

            // Save new password in localStorage
            localStorage.setItem('mpcAccountPassword', newVal);

            // Reset inputs
            if (inputCurrentPass) inputCurrentPass.value = '';
            if (inputNewPass) inputNewPass.value = '';
            if (inputConfirmPass) inputConfirmPass.value = '';
            updatePasswordCriteria();

            showToast('Password updated successfully.');
        });
    }

});
