/**
 * The Lens — Member Login Logic
 * Frontend simulation with role-based routing
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // Dummy Accounts Dictionary
    // ----------------------------------------------------
    const DUMMY_ACCOUNTS = {
        "2024-00001-BN-0": "President",
        "2024-00002-BN-0": "Vice President",
        "2024-00003-BN-0": "Secretary",
        "2024-00004-BN-0": "Associate Secretary",
        "2024-00005-BN-0": "Associate Secretary",
        "2024-00006-BN-0": "Treasurer",
        "2024-00007-BN-0": "Auditor",
        "2024-00008-BN-0": "Public Relations Officer"
    };

    const REQUIRED_PASSWORD = "password123";

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
            }
        });
    }

    // ----------------------------------------------------
    // Form Submission & Authentication Simulation
    // ----------------------------------------------------
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const studentVal = studentInput ? studentInput.value.trim() : '';
        const passVal = passwordInput ? passwordInput.value : '';

        // Initial field presence checks
        if (!studentVal) {
            showStatus('Please enter your student number.', 'error');
            if (studentInput) studentInput.focus();
            return;
        }

        if (!passVal) {
            showStatus('Please enter your password.', 'error');
            if (passwordInput) passwordInput.focus();
            return;
        }

        // Validate against dummy accounts & required password
        const matchedRole = DUMMY_ACCOUNTS[studentVal];
        const isPasswordCorrect = (passVal === REQUIRED_PASSWORD);

        if (matchedRole && isPasswordCorrect) {
            // SUCCESSFUL LOGIN
            // Save role in localStorage as userRole
            localStorage.setItem('userRole', matchedRole);
            localStorage.setItem('studentNumber', studentVal);

            // UI Loading Feedback
            if (loginBtn) loginBtn.disabled = true;
            if (btnText) btnText.classList.add('hidden');
            if (btnSpinner) {
                btnSpinner.classList.remove('hidden');
                btnSpinner.classList.add('flex');
            }

            showStatus(`Welcome, ${matchedRole}! Redirecting to Executive Dashboard...`, 'success');

            // Redirect to executive-dashboard.html
            setTimeout(() => {
                window.location.href = 'executive-dashboard.html';
            }, 850);

        } else {
            // FAILED LOGIN
            showStatus('Invalid credentials. Please verify your student number and password.', 'error');
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            }
        }
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
            statusMsg.innerHTML = `<i class="fa-solid fa-circle-exclamation text-rose-500"></i> <span>${text}</span>`;
        } else if (type === 'success') {
            statusMsg.classList.add('bg-emerald-50', 'text-emerald-700', 'border', 'border-emerald-200');
            statusMsg.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-500"></i> <span>${text}</span>`;
        } else {
            statusMsg.classList.add('bg-amber-50', 'text-amber-800', 'border', 'border-amber-200');
            statusMsg.innerHTML = `<i class="fa-solid fa-circle-info text-amber-500"></i> <span>${text}</span>`;
        }

        statusMsg.classList.remove('hidden');
    }
});

