/**
 * The Lens — Member Login Logic
 * Hybrid authentication: Connected to Laravel backend with client-side fallback
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // Accounts Dictionary (Supported both locally and in backend)
    // ----------------------------------------------------
    const DUMMY_ACCOUNTS = {
        // 2024 Accounts
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
        "2024-00103-BN-0": { role: "Writer", name: "Camille Joy Perez", writerId: "sofia-alcaraz", isWriter: true },
        // 2023 Accounts (from Database Seeder)
        "2023-00001-BN-0": { role: "President", name: "Organization President", isWriter: false },
        "2023-00002-BN-0": { role: "Editorial-In-Chief", name: "Editor In Chief", isWriter: false },
        "2023-00003-BN-0": { role: "News Editor", name: "News Section Editor", isWriter: false },
        "2023-00004-BN-0": { role: "Staffer", name: "Publication Staffer", isWriter: true }
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

    function setFormLoading(isLoading) {
        if (loginBtn) loginBtn.disabled = isLoading;
        if (btnText) btnText.classList.toggle('hidden', isLoading);
        if (btnSpinner) {
            btnSpinner.classList.toggle('hidden', !isLoading);
            btnSpinner.classList.toggle('flex', isLoading);
        }
    }

    function handleLoginSuccess(user, role, studentNumber, isWriter, targetPage) {
        const portalName = isWriter ? 'Writer Dashboard' : 'Executive Dashboard';

        // Fully isolate session storage per persona to prevent data bleed
        if (isWriter) {
            localStorage.setItem('userRole', 'Writer');
            localStorage.setItem('userName', user);
            localStorage.setItem('studentNumber', studentNumber);
            localStorage.setItem('writerName', user);
            localStorage.setItem('writerRole', 'Writer');
            localStorage.setItem('writerStudentNumber', studentNumber);
            localStorage.setItem('writerId', 'sofia-alcaraz');
            const avatar = localStorage.getItem('writerAvatar') || 'images/member-placeholder.svg';
            localStorage.setItem('userAvatar', avatar);
        } else {
            localStorage.setItem('userRole', role);
            localStorage.setItem('userName', user);
            localStorage.setItem('studentNumber', studentNumber);
            localStorage.setItem('executiveRole', role);
            localStorage.setItem('executiveName', user);
            localStorage.setItem('executiveStudentNumber', studentNumber);
            const avatar = localStorage.getItem('executiveAvatar') || 'images/member-placeholder.svg';
            localStorage.setItem('userAvatar', avatar);
        }

        showStatus(`Welcome, ${role}! Redirecting to ${portalName}...`, 'success');

        setTimeout(() => {
            window.location.href = targetPage;
        }, 700);
    }

    // ----------------------------------------------------
    // Form Submission & Authentication
    // ----------------------------------------------------
    form.addEventListener('submit', async (e) => {
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

        setFormLoading(true);

        // 1. Try Laravel Backend Authentication First
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    student_number: studentVal,
                    password: passVal
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    handleLoginSuccess(
                        data.user.full_name,
                        data.user.role,
                        data.user.student_number,
                        data.user.is_writer,
                        data.user.redirect_to
                    );
                    return;
                }
            }
        } catch (err) {
            console.warn('Backend login request error, falling back to local verification:', err);
        }

        // 2. Client-side Fallback check
        const account = DUMMY_ACCOUNTS[studentVal];
        const isPasswordCorrect = (passVal === REQUIRED_PASSWORD);

        if (account && isPasswordCorrect) {
            const isWriter = account.isWriter || account.role.toLowerCase().includes('writer') || account.role.toLowerCase().includes('staffer');
            const targetPage = isWriter ? 'writer-dashboard.html' : 'executive-dashboard.html';

            handleLoginSuccess(account.name, account.role, studentVal, isWriter, targetPage);
        } else {
            setFormLoading(false);
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
