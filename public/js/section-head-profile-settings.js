/**
 * ============================================================================
 * THE LENS — SECTION HEAD PROFILE SETTINGS CONTROLLER
 * Full Backend & Supabase Integration with Real-Time Validation
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    // =========================================================================
    // 1. AVATAR HELPERS
    // =========================================================================
    function updateAllAvatars(src) {
        const previewImg = document.getElementById('avatar-preview-img');
        const sidebarImg = document.getElementById('sidebar-avatar-img');
        const topbarImg = document.getElementById('topbar-avatar-img');

        if (previewImg) previewImg.src = src;
        if (sidebarImg) sidebarImg.src = src;
        if (topbarImg) topbarImg.src = src;
    }

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
        }, 3600);
    }

    // =========================================================================
    // 3. PROFILE FORM & AVATAR UPLOAD
    // =========================================================================
    const inputStudentNumber = document.getElementById('input-student-number');
    const inputFullName = document.getElementById('input-full-name');
    const avatarFileInput = document.getElementById('avatar-file-input');
    const removeAvatarInput = document.getElementById('remove-avatar-input');
    const btnChangeAvatar = document.getElementById('btn-change-avatar');
    const btnResetAvatar = document.getElementById('btn-reset-avatar');
    const profileInfoForm = document.getElementById('profile-info-form');
    const btnSaveProfile = document.getElementById('btn-save-profile');

    // Trigger file dialog
    if (btnChangeAvatar && avatarFileInput) {
        btnChangeAvatar.addEventListener('click', () => {
            avatarFileInput.click();
        });
    }

    // Handle chosen file (Preview immediately)
    if (avatarFileInput) {
        avatarFileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            if (file.size > 3 * 1024 * 1024) {
                showToast('Image file too large. Please select an image under 3MB.', 'danger');
                avatarFileInput.value = '';
                return;
            }

            if (!file.type.startsWith('image/')) {
                showToast('Invalid file type. Please select an image (JPG, PNG, or WEBP).', 'danger');
                avatarFileInput.value = '';
                return;
            }

            if (removeAvatarInput) removeAvatarInput.value = '0';

            const reader = new FileReader();
            reader.onload = (loadEvt) => {
                const dataUrl = loadEvt.target.result;
                const previewImg = document.getElementById('avatar-preview-img');
                if (previewImg) previewImg.src = dataUrl;
                showToast('Photo selected. Click "Save Profile" to apply changes.');
            };
            reader.readAsDataURL(file);
        });
    }

    // Reset avatar to placeholder
    if (btnResetAvatar) {
        btnResetAvatar.addEventListener('click', () => {
            const defaultPlaceholder = '/images/member-placeholder.svg';
            if (avatarFileInput) avatarFileInput.value = '';
            if (removeAvatarInput) removeAvatarInput.value = '1';
            const previewImg = document.getElementById('avatar-preview-img');
            if (previewImg) previewImg.src = defaultPlaceholder;
            showToast('Profile photo set to remove. Click "Save Profile" to save.', 'warning');
        });
    }

    // Profile Information Form Submit via AJAX to Supabase backend
    if (profileInfoForm) {
        profileInfoForm.addEventListener('submit', async (e) => {
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

            const origBtnHtml = btnSaveProfile ? btnSaveProfile.innerHTML : '';
            if (btnSaveProfile) {
                btnSaveProfile.disabled = true;
                btnSaveProfile.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Saving...</span>';
            }

            try {
                const formData = new FormData(profileInfoForm);
                const response = await fetch(profileInfoForm.action, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json'
                    },
                    body: formData
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    showToast(data.message || 'Profile updated successfully.', 'success');

                    const sidebarUserName = document.getElementById('sidebar-user-name');
                    if (sidebarUserName && data.user) sidebarUserName.textContent = data.user.full_name;

                    if (data.user && data.user.profile_picture_url) {
                        updateAllAvatars(data.user.profile_picture_url);
                    } else if (removeAvatarInput && removeAvatarInput.value === '1') {
                        updateAllAvatars('/images/member-placeholder.svg');
                    }
                } else {
                    const msg = data.message || (data.errors ? Object.values(data.errors).flat().join(' ') : 'Failed to update profile.');
                    showToast(msg, 'danger');
                }
            } catch (err) {
                console.error(err);
                showToast('A network error occurred while updating profile.', 'danger');
            } finally {
                if (btnSaveProfile) {
                    btnSaveProfile.disabled = false;
                    btnSaveProfile.innerHTML = origBtnHtml;
                }
            }
        });
    }

    // =========================================================================
    // 4. PASSWORD & SECURITY FORM
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

    // Password Form Submit via AJAX to Supabase backend
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
                showToast('New passwords do not match. Please re-enter.', 'danger');
                if (inputConfirmPass) inputConfirmPass.focus();
                return;
            }

            if (newVal === currentVal) {
                showToast('New password must be different from current password.', 'danger');
                if (inputNewPass) inputNewPass.focus();
                return;
            }

            const origBtnHtml = btnUpdatePassword ? btnUpdatePassword.innerHTML : '';
            if (btnUpdatePassword) {
                btnUpdatePassword.disabled = true;
                btnUpdatePassword.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Updating...</span>';
            }

            try {
                const response = await fetch(passwordForm.action, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        current_password: currentVal,
                        new_password: newVal,
                        new_password_confirmation: confirmVal
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    showToast(data.message || 'Password updated successfully.', 'success');
                    passwordForm.reset();
                    updatePasswordCriteria();
                } else {
                    const msg = data.message || (data.errors ? Object.values(data.errors).flat().join(' ') : 'Failed to update password.');
                    showToast(msg, 'danger');
                }
            } catch (err) {
                console.error(err);
                showToast('A network error occurred while updating password.', 'danger');
            } finally {
                if (btnUpdatePassword) {
                    btnUpdatePassword.disabled = false;
                    btnUpdatePassword.innerHTML = origBtnHtml;
                }
            }
        });
    }

});
