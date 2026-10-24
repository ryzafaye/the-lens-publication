/**
 * ============================================================================
 * THE LENS — MEDIA & COMMUNICATION PROFILE SETTINGS CONTROLLER
 * Manages Profile Info, Avatar Upload, and Password Security
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. Elements
    const avatarPreviewImg = document.getElementById('avatar-preview-img');
    const avatarFileInput = document.getElementById('avatar-file-input');
    const btnUploadAvatar = document.getElementById('btn-upload-avatar');

    const profileInfoForm = document.getElementById('profile-info-form');
    const profileFullname = document.getElementById('profile-fullname');
    const profileStudentNumber = document.getElementById('profile-student-number');
    const profileRole = document.getElementById('profile-role');

    const profilePasswordForm = document.getElementById('profile-password-form');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    const toastContainer = document.getElementById('toast-container');

    // 2. Toast System
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
        const resolvedType = type === 'error' ? 'danger' : type;
        toast.className = `toast-message ${resolvedType}`;
        toast.innerHTML = `<span class="toast-bullet-dot"></span><span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-dismissing');
            setTimeout(() => toast.remove(), 260);
        }, 3400);
    }

    // 3. Hydrate Fields
    const storedName = localStorage.getItem('mediaName') || localStorage.getItem('userName') || 'Alyssa Marie Dizon';
    const storedNumber = localStorage.getItem('mediaStudentNumber') || localStorage.getItem('studentNumber') || '2024-00080-BN-0';
    const storedRole = localStorage.getItem('mediaRole') || 'Media & Communication';
    const storedAvatar = localStorage.getItem('mediaAvatar') || localStorage.getItem('userAvatar') || 'images/member-placeholder.svg';

    if (profileFullname) profileFullname.value = storedName;
    if (profileStudentNumber) profileStudentNumber.value = storedNumber;
    if (profileRole) profileRole.value = storedRole;
    if (avatarPreviewImg) avatarPreviewImg.src = storedAvatar;

    // 4. Avatar Upload
    if (btnUploadAvatar && avatarFileInput) {
        btnUploadAvatar.addEventListener('click', () => avatarFileInput.click());

        avatarFileInput.addEventListener('change', () => {
            if (avatarFileInput.files && avatarFileInput.files[0]) {
                const file = avatarFileInput.files[0];
                if (!file.type.match(/^image\//)) {
                    showToast('Please select a valid image file.', 'error');
                    return;
                }
                if (file.size > 5 * 1024 * 1024) {
                    showToast('Photo size must be less than 5MB.', 'error');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const dataUrl = e.target.result;
                    if (avatarPreviewImg) avatarPreviewImg.src = dataUrl;
                    localStorage.setItem('mediaAvatar', dataUrl);
                    localStorage.setItem('userAvatar', dataUrl);

                    // Sync DOM
                    const sidebarImg = document.getElementById('sidebar-avatar-img');
                    const topbarImg = document.getElementById('topbar-avatar-img');
                    const mobileImg = document.getElementById('mobile-avatar-img');
                    if (sidebarImg) sidebarImg.src = dataUrl;
                    if (topbarImg) topbarImg.src = dataUrl;
                    if (mobileImg) mobileImg.src = dataUrl;

                    showToast('Profile photo updated successfully!');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 5. Save Profile Info
    if (profileInfoForm) {
        profileInfoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = profileFullname ? profileFullname.value.trim() : '';
            if (!newName) {
                showToast('Name cannot be empty.', 'error');
                return;
            }

            localStorage.setItem('mediaName', newName);
            localStorage.setItem('userName', newName);

            const sidebarName = document.getElementById('sidebar-user-name');
            const mobileName = document.getElementById('mobile-user-name');
            if (sidebarName) sidebarName.textContent = newName;
            if (mobileName) mobileName.textContent = newName;

            showToast('Profile information saved successfully!');
        });
    }

    // 6. Password Change
    if (profilePasswordForm) {
        profilePasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const cur = currentPasswordInput ? currentPasswordInput.value : '';
            const nxt = newPasswordInput ? newPasswordInput.value : '';
            const cnf = confirmPasswordInput ? confirmPasswordInput.value : '';

            if (cur !== 'password123') {
                showToast('Current password does not match system records.', 'error');
                if (currentPasswordInput) currentPasswordInput.focus();
                return;
            }

            if (nxt.length < 8) {
                showToast('New password must be at least 8 characters long.', 'error');
                if (newPasswordInput) newPasswordInput.focus();
                return;
            }

            if (nxt !== cnf) {
                showToast('New passwords do not match.', 'error');
                if (confirmPasswordInput) confirmPasswordInput.focus();
                return;
            }

            // Success
            showToast('Password updated successfully!');
            profilePasswordForm.reset();
        });
    }

});

