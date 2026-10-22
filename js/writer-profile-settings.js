/**
 * ============================================================================
 * THE LENS — WRITER PROFILE SETTINGS CONTROLLER
 * Dedicated Settings for Staff Writers: Profile, Bio, Avatar & Password Security
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 0. ROLE GUARD: REDIRECT EXECUTIVES TO EXECUTIVE PROFILE SETTINGS
    // =========================================================================
    const activeRole = localStorage.getItem('userRole') || '';
    if (activeRole && activeRole !== 'Writer' && !activeRole.toLowerCase().includes('writer') && !activeRole.toLowerCase().includes('contributor')) {
        window.location.replace('profile-settings.html');
        return;
    }

    // =========================================================================
    // 1. DYNAMIC WRITER STATE HYDRATION
    // =========================================================================
    let userName = localStorage.getItem('writerName') || (localStorage.getItem('userName') && !['Juan Dela Cruz', 'Maria Clara Santos', 'President'].includes(localStorage.getItem('userName')) ? localStorage.getItem('userName') : 'Sofia M. Alcaraz');
    let studentNumber = localStorage.getItem('writerStudentNumber') || (localStorage.getItem('studentNumber') && !localStorage.getItem('studentNumber').startsWith('2024-0000') ? localStorage.getItem('studentNumber') : '2024-00101-BN-0');
    let writerAvatar = localStorage.getItem('writerAvatar') || 'images/member-placeholder.svg';

    localStorage.setItem('userRole', 'Writer');
    localStorage.setItem('userName', userName);
    localStorage.setItem('studentNumber', studentNumber);
    localStorage.setItem('writerRole', 'Writer');
    localStorage.setItem('writerName', userName);
    localStorage.setItem('writerStudentNumber', studentNumber);

    // Sync avatars across DOM
    function updateAllAvatars(src) {
        const previewImg = document.getElementById('avatar-preview-img');
        const sidebarImg = document.getElementById('sidebar-avatar-img');
        const topbarImg = document.getElementById('topbar-avatar-img');
        const mobileImg = document.getElementById('mobile-avatar-img');

        if (previewImg) previewImg.src = src;
        if (sidebarImg) sidebarImg.src = src;
        if (topbarImg) topbarImg.src = src;
        if (mobileImg) mobileImg.src = src;
    }
    updateAllAvatars(writerAvatar);

    // =========================================================================
    // 2. TOAST NOTIFICATIONS (DEFAULT EXECUTIVE PILL WITH GLOWING BULLET DOT)
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
    const inputWriterRole = document.getElementById('input-writer-role');
    const avatarFileInput = document.getElementById('avatar-file-input');
    const btnChangeAvatar = document.getElementById('btn-change-avatar');
    const btnResetAvatar = document.getElementById('btn-reset-avatar');
    const profileInfoForm = document.getElementById('profile-info-form');

    if (inputStudentNumber) inputStudentNumber.value = studentNumber;
    if (inputFullName) inputFullName.value = userName;
    if (inputWriterRole) inputWriterRole.value = 'Writer';

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
                    localStorage.setItem('writerAvatar', dataUrl);
                    localStorage.setItem('userAvatar', dataUrl);
                    writerAvatar = dataUrl;
                    updateAllAvatars(dataUrl);
                    showToast('Writer profile photo updated.');
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
            localStorage.setItem('writerAvatar', defaultPlaceholder);
            localStorage.setItem('userAvatar', defaultPlaceholder);
            writerAvatar = defaultPlaceholder;
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
            localStorage.setItem('writerName', newName);
            localStorage.setItem('writerStudentNumber', newStudentNum);
            userName = newName;
            studentNumber = newStudentNum;

            // Sync with sidebar and mobile drawer
            const sidebarWriterName = document.getElementById('sidebar-writer-name');
            const mobileWriterName = document.getElementById('mobile-writer-name') || document.querySelector('.mobile-nav-name');
            if (sidebarWriterName) sidebarWriterName.textContent = newName;
            if (mobileWriterName) mobileWriterName.textContent = newName;

            showToast('Writer profile updated successfully.');
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
            localStorage.setItem('writerAccountPassword', newVal);

            // Reset inputs
            if (inputCurrentPass) inputCurrentPass.value = '';
            if (inputNewPass) inputNewPass.value = '';
            if (inputConfirmPass) inputConfirmPass.value = '';
            updatePasswordCriteria();

            showToast('Writer password updated successfully.');
        });
    }

});

