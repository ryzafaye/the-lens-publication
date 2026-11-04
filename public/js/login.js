/**
 * The Lens — Member Login Logic
 * Backend authentication with UI enhancements (Password toggle, uppercase auto-format)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Purge any legacy dummy mock accounts from localStorage if present
    try {
        const dummyNames = [
            'Juan Dela Cruz', 'Maria Clara Santos', 'Christian Alcantara',
            'Althea Grace Mendoza', 'Rafael Ramos', 'Mara Villanueva',
            'Gabriel Navarro', 'Patricia Reyes', 'Danilo C. Ramos',
            'Dr. Elena M. Romero', 'Bianca Rose Flores', 'Carlos Joaquin Luna',
            'Victoria Reyes', 'Marcus Vance', 'Julian Del Rosario',
            'Samantha Cruz', 'Danilo Reyes', 'Alyssa Marie Dizon',
            'Joshua Kenneth Tan', 'Raphael Luna', 'Giselle Morales',
            'Sofia M. Alcaraz', 'Marco L. Valderrama', 'Camille Joy Perez'
        ];
        const currentStoredName = localStorage.getItem('userName');
        if (currentStoredName && dummyNames.includes(currentStoredName)) {
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            localStorage.removeItem('studentNumber');
            localStorage.removeItem('eicName');
            localStorage.removeItem('mpcName');
            localStorage.removeItem('cartoonistName');
            localStorage.removeItem('cartoonistHeadName');
            localStorage.removeItem('mediaName');
            localStorage.removeItem('writerName');
            localStorage.removeItem('sectionHeadName');
            localStorage.removeItem('executiveName');
        }
    } catch (e) {}

    // DOM Elements
    const form = document.getElementById('login-form');
    const studentInput = document.getElementById('student-number');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const togglePasswordIcon = document.getElementById('toggle-password-icon');
    const loginBtn = document.getElementById('login-button');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const statusMsg = document.getElementById('status-message');

    if (!form) return;

    // ----------------------------------------------------
    // Toggle Password Visibility
    // ----------------------------------------------------
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

    // ----------------------------------------------------
    // Auto-format Student Number (e.g., 2024-00001-BN-0)
    // ----------------------------------------------------
    if (studentInput) {
        studentInput.addEventListener('input', (e) => {
            let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (val.length > 4 && !val.includes('-')) {
                if (/^\d{4}/.test(val)) {
                    let formatted = val.slice(0, 4);
                    if (val.length > 4) formatted += '-' + val.slice(4, 9);
                    if (val.length > 9) formatted += '-' + val.slice(9, 11);
                    if (val.length > 11) formatted += '-' + val.slice(11, 12);
                    e.target.value = formatted;
                }
            } else {
                e.target.value = val;
            }
        });
    }

    // ----------------------------------------------------
    // Form Submission: Real Backend Authentication Only
    // ----------------------------------------------------
    form.addEventListener('submit', (e) => {
        const studentVal = studentInput ? studentInput.value.trim() : '';
        const passVal = passwordInput ? passwordInput.value : '';

        // Field presence validation
        if (!studentVal) {
            e.preventDefault();
            showStatus('Please enter your student number.', 'error');
            if (studentInput) studentInput.focus();
            return;
        }

        if (!passVal) {
            e.preventDefault();
            showStatus('Please enter your password.', 'error');
            if (passwordInput) passwordInput.focus();
            return;
        }

        // Show loading spinner while form submits to Laravel backend
        if (loginBtn) loginBtn.disabled = true;
        if (btnText) btnText.classList.add('hidden');
        if (btnSpinner) {
            btnSpinner.classList.remove('hidden');
            btnSpinner.classList.add('flex');
        }

        // If form has no action attribute set, ensure it targets /login
        if (!form.getAttribute('action')) {
            form.setAttribute('action', '/login');
            form.setAttribute('method', 'POST');
        }

        // Allow natural browser submit to Laravel AuthController
    });

    /**
     * Helper to render dynamic status message
     * @param {string} text - Message to display
     * @param {'error'|'success'|'info'} type - Alert status type
     */
    function showStatus(text, type) {
        if (!statusMsg) return;

        statusMsg.textContent = text;
        statusMsg.className = 'mb-6 p-3.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2';

        if (type === 'error') {
            statusMsg.classList.add('bg-rose-50', 'text-rose-700', 'border', 'border-rose-200');
            statusMsg.innerHTML = `<i class="fa-solid fa-circle-exclamation text-rose-500"></i> <span>${escapeHTML(text)}</span>`;
        } else if (type === 'success') {
            statusMsg.classList.add('bg-emerald-50', 'text-emerald-700', 'border', 'border-emerald-200');
            statusMsg.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-500"></i> <span>${escapeHTML(text)}</span>`;
        } else {
            statusMsg.classList.add('bg-amber-50', 'text-amber-800', 'border', 'border-amber-200');
            statusMsg.innerHTML = `<i class="fa-solid fa-circle-info text-amber-500"></i> <span>${escapeHTML(text)}</span>`;
        }

        statusMsg.classList.remove('hidden');
    }

    function escapeHTML(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
});
