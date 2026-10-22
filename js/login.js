/**
 * The Lens — Member Login Logic
 * Frontend simulation with role-based routing
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // Dummy Accounts Dictionary (Executive & Writer Staff)
    // ----------------------------------------------------
    const DUMMY_ACCOUNTS = {
        "2024-00001-BN-0": { role: "President", name: "Juan Dela Cruz", isWriter: false },
        "2024-00002-BN-0": { role: "Vice President", name: "Maria Clara Santos", isWriter: false },
        "2024-00003-BN-0": { role: "Secretary", name: "Christian Alcantara", isWriter: false },
        "2024-00004-BN-0": { role: "Associate Secretary", name: "Althea Grace Mendoza", isWriter: false },
        "2024-00005-BN-0": { role: "Associate Secretary", name: "Rafael Ramos", isWriter: false },
        "2024-00006-BN-0": { role: "Treasurer", name: "Mara Villanueva", isWriter: false },
        "2024-00007-BN-0": { role: "Auditor", name: "Gabriel Navarro", isWriter: false },
        "2024-00008-BN-0": { role: "Public Relations Officer", name: "Patricia Reyes", isWriter: false },
        "2024-00101-BN-0": { role: "Writer", name: "Sofia M. Alcaraz", writerId: "sofia-alcaraz", isWriter: true },
        "2024-00102-BN-0": { role: "Writer", name: "Marco L. Valderrama", writerId: "marco-valderrama", isWriter: true },
        "2024-00103-BN-0": { role: "Writer", name: "Camille Joy Perez", writerId: "sofia-alcaraz", isWriter: true }
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
        const account = (typeof DUMMY_ACCOUNTS[studentVal] === 'object') 
            ? DUMMY_ACCOUNTS[studentVal] 
            : (DUMMY_ACCOUNTS[studentVal] ? { role: DUMMY_ACCOUNTS[studentVal], name: DUMMY_ACCOUNTS[studentVal].includes('Writer') ? 'Sofia M. Alcaraz' : 'Juan Dela Cruz', isWriter: DUMMY_ACCOUNTS[studentVal].toLowerCase().includes('writer') } : null);

        const isPasswordCorrect = (passVal === REQUIRED_PASSWORD);

        if (account && isPasswordCorrect) {
            // Determine if writer or executive
            const isWriter = account.isWriter || account.role.toLowerCase().includes('writer') || account.role.toLowerCase().includes('contributor');
            const targetPage = isWriter ? 'writer-dashboard.html' : 'executive-dashboard.html';
            const portalName = isWriter ? 'Writer Dashboard' : 'Executive Dashboard';

            // Fully isolate session storage per persona to prevent data bleed
            if (isWriter) {
                localStorage.setItem('userRole', 'Writer');
                localStorage.setItem('userName', account.name);
                localStorage.setItem('studentNumber', studentVal);
                localStorage.setItem('writerName', account.name);
                localStorage.setItem('writerRole', 'Writer');
                localStorage.setItem('writerStudentNumber', studentVal);
                localStorage.setItem('writerId', account.writerId || 'sofia-alcaraz');
                const avatar = localStorage.getItem('writerAvatar') || 'images/member-placeholder.svg';
                localStorage.setItem('userAvatar', avatar);
            } else {
                // Executive Login
                localStorage.setItem('userRole', account.role);
                localStorage.setItem('userName', account.name);
                localStorage.setItem('studentNumber', studentVal);
                localStorage.setItem('executiveRole', account.role);
                localStorage.setItem('executiveName', account.name);
                localStorage.setItem('executiveStudentNumber', studentVal);
                const avatar = localStorage.getItem('executiveAvatar') || 'images/member-placeholder.svg';
                localStorage.setItem('userAvatar', avatar);
            }

            // UI Loading Feedback
            if (loginBtn) loginBtn.disabled = true;
            if (btnText) btnText.classList.add('hidden');
            if (btnSpinner) {
                btnSpinner.classList.remove('hidden');
                btnSpinner.classList.add('flex');
            }

            showStatus(`Welcome, ${account.role}! Redirecting to ${portalName}...`, 'success');

            // Redirect
            setTimeout(() => {
                window.location.href = targetPage;
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
