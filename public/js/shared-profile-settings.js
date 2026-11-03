/**
 * ============================================================================
 * THE LENS — SHARED PROFILE SETTINGS CONTROLLER
 * Full Backend Wiring (Laravel Auth & ProfileController)
 * Dynamic AJAX Submissions, Real-time Validation & Toast Feedback
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 1. TOAST NOTIFICATION UTILITY
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
        }, 3400);
    }

    // CSRF Token helper
    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') 
            || document.querySelector('input[name="_token"]')?.value 
            || '';
    }

    // Helper to extract first error from Laravel validation JSON
    function getErrorMessage(data, fallback = 'An error occurred. Please try again.') {
        if (!data) return fallback;
        if (data.errors && typeof data.errors === 'object') {
            const firstKey = Object.keys(data.errors)[0];
            if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey].length > 0) {
                return data.errors[firstKey][0];
            }
        }
        return data.message || fallback;
    }

    // =========================================================================
    // 2. AVATAR UPLOAD, PREVIEW & REMOVAL
    // =========================================================================
    const avatarFileInput = document.getElementById('avatar-file-input');
    const btnChangeAvatar = document.getElementById('btn-change-avatar');
    const btnResetAvatar = document.getElementById('btn-reset-avatar');
    const inputRemoveAvatar = document.getElementById('input-remove-avatar');

    function updateAllAvatars(src) {
        const avatars = document.querySelectorAll(
            '#avatar-preview-img, .avatar-preview-img, .profile-avatar img, .topbar-avatar-circle img, .mobile-nav-avatar img, #sidebar-avatar-img'
        );
        avatars.forEach(img => {
            if (img) img.src = src;
        });
    }

    // Trigger native file picker
    if (btnChangeAvatar && avatarFileInput) {
        btnChangeAvatar.addEventListener('click', () => {
            avatarFileInput.click();
        });
    }

    // Handle selected image file
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
                showToast('Invalid file format. Please select a JPG, PNG, or WEBP image.', 'danger');
                avatarFileInput.value = '';
                return;
            }

            // Flag that avatar is not to be removed
            if (inputRemoveAvatar) {
                inputRemoveAvatar.value = '0';
            }

            // Preview instantly
            const reader = new FileReader();
            reader.onload = (loadEvt) => {
                const dataUrl = loadEvt.target.result;
                updateAllAvatars(dataUrl);
            };
            reader.readAsDataURL(file);
        });
    }

    // Reset avatar to default placeholder
    if (btnResetAvatar) {
        btnResetAvatar.addEventListener('click', () => {
            const defaultPlaceholder = '/images/member-placeholder.svg';
            updateAllAvatars(defaultPlaceholder);
            if (avatarFileInput) avatarFileInput.value = '';
            if (inputRemoveAvatar) inputRemoveAvatar.value = '1';
            showToast('Profile photo reset to default placeholder. Click Save Profile to apply.');
        });
    }

    // =========================================================================
    // 3. PROFILE INFORMATION FORM SUBMISSION (AJAX FETCH)
    // =========================================================================
    const profileInfoForm = document.getElementById('profile-info-form');
    const inputStudentNumber = document.getElementById('input-student-number');
    const inputFullName = document.getElementById('input-full-name');
    const btnSaveProfile = document.getElementById('btn-save-profile');

    if (profileInfoForm) {
        profileInfoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const studentNumber = inputStudentNumber ? inputStudentNumber.value.trim() : '';
            const fullName = inputFullName ? inputFullName.value.trim() : '';

            if (!studentNumber) {
                showToast('Student number is required.', 'danger');
                if (inputStudentNumber) inputStudentNumber.focus();
                return;
            }

            if (!fullName) {
                showToast('Full name is required.', 'danger');
                if (inputFullName) inputFullName.focus();
                return;
            }

            // UI loading state
            const originalBtnHtml = btnSaveProfile ? btnSaveProfile.innerHTML : '';
            if (btnSaveProfile) {
                btnSaveProfile.disabled = true;
                btnSaveProfile.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Saving...</span>';
            }

            try {
                const formData = new FormData(profileInfoForm);
                const targetUrl = profileInfoForm.action || '/profile/update-info';

                const response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'Accept': 'application/json'
                    },
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(getErrorMessage(data, 'Failed to update profile information.'));
                }

                // Sync updated full name with DOM headers, sidebars, and topbars
                if (data.user && data.user.full_name) {
                    const nameElements = document.querySelectorAll(
                        '.profile-name, #sidebar-user-name, #mobile-user-name, #sidebar-writer-name, #mobile-writer-name'
                    );
                    nameElements.forEach(el => {
                        el.textContent = data.user.full_name;
                    });
                }

                // Sync new avatar URL if returned
                if (data.user && data.user.avatar_url) {
                    updateAllAvatars(data.user.avatar_url);
                }

                // Reset file input and removal state
                if (avatarFileInput) avatarFileInput.value = '';
                if (inputRemoveAvatar) inputRemoveAvatar.value = '0';

                showToast(data.message || 'Profile updated successfully.', 'success');
            } catch (err) {
                showToast(err.message || 'Network error while updating profile.', 'danger');
            } finally {
                if (btnSaveProfile) {
                    btnSaveProfile.disabled = false;
                    btnSaveProfile.innerHTML = originalBtnHtml;
                }
            }
        });
    }

    // =========================================================================
    // 4. PASSWORD & SECURITY FORM SUBMISSION (AJAX FETCH)
    // =========================================================================
    const passwordForm = document.getElementById('password-change-form');
    const inputCurrentPass = document.getElementById('input-current-password');
    const inputNewPass = document.getElementById('input-new-password');
    const inputConfirmPass = document.getElementById('input-confirm-password');
    const btnUpdatePassword = document.getElementById('btn-update-password');

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

    // Password criteria indicators
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
        passwordForm.addEventListener('submit', async (e) => {
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
                showToast('New passwords do not match. Please verify your confirmation.', 'danger');
                if (inputConfirmPass) inputConfirmPass.focus();
                return;
            }

            if (newVal === currentVal) {
                showToast('New password must be different from your current password.', 'danger');
                if (inputNewPass) inputNewPass.focus();
                return;
            }

            // UI loading state
            const originalBtnHtml = btnUpdatePassword ? btnUpdatePassword.innerHTML : '';
            if (btnUpdatePassword) {
                btnUpdatePassword.disabled = true;
                btnUpdatePassword.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Updating...</span>';
            }

            try {
                const formData = new FormData(passwordForm);
                const targetUrl = passwordForm.action || '/profile/update-password';

                const response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'Accept': 'application/json'
                    },
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(getErrorMessage(data, 'Failed to update password.'));
                }

                // Reset password input fields on success
                if (inputCurrentPass) inputCurrentPass.value = '';
                if (inputNewPass) inputNewPass.value = '';
                if (inputConfirmPass) inputConfirmPass.value = '';
                updatePasswordCriteria();

                showToast(data.message || 'Password updated successfully.', 'success');
            } catch (err) {
                showToast(err.message || 'Network error while updating password.', 'danger');
            } finally {
                if (btnUpdatePassword) {
                    btnUpdatePassword.disabled = false;
                    btnUpdatePassword.innerHTML = originalBtnHtml;
                }
            }
        });
    }

});
