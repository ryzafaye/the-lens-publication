/**
 * The Lens — Login UI Interactions
 * Standard native form submission to Laravel Auth.
 * Handles client-side password visibility toggling and student number auto-formatting.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Password Toggle Logic ---
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const togglePasswordIcon = document.getElementById('toggle-password-icon');

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            if (togglePasswordIcon) {
                togglePasswordIcon.classList.toggle('fa-eye', !isPassword);
                togglePasswordIcon.classList.toggle('fa-eye-slash', isPassword);
            }
        });
    }

    // --- 2. Student Number Auto-Formatter ---
    const studentInput = document.getElementById('student-number');
    if (studentInput) {
        studentInput.addEventListener('input', function(e) {
            let val = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
            let formatted = '';

            if (val.length > 0) formatted += val.substring(0, 4);
            if (val.length > 4) formatted += '-' + val.substring(4, 9);
            if (val.length > 9) formatted += '-' + val.substring(9, 11);
            if (val.length > 11) formatted += '-' + val.substring(11, 12);

            e.target.value = formatted;
        });
    }
});
