/**
 * The Lens — Login UI Interactions
 * Standard native form submission to Laravel Auth.
 * Only password visibility toggling is handled on the client.
 */

document.addEventListener('DOMContentLoaded', () => {
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
});

