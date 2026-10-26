/**
 * The Lens — Member Login Logic
 * Frontend simulation with role-based routing
 */

// One-time automatic workflow purge to guarantee zero-mock state for testing
try {
    const CLEAR_FLAG = 'theLens_workflow_v4_purged';
    if (localStorage.getItem(CLEAR_FLAG) !== 'true') {
        const keysToRemove = [
            'theLensWriterArticles_v3',
            'theLensWriterArticles_v2',
            'theLensWriterArticles_v1',
            'sectionHeadReviewQueue_v1',
            'eicPendingReviewQueue',
            'executivePendingReviewQueue',
            'mpc_publish_articles_v2',
            'mpc_publish_articles_v1',
            'mpc_approved_covers_v1',
            'theLensPublishedArticles',
            'executiveArticles',
            'theLensArticles',
            'theLensCartoonistArticles_v1',
            'cartoonistSubmissions_v1',
            'articleCoverReviewQueue_v1',
            'theLensMediaArticles_v1',
            'mediaTeamSubmissions_v2',
            'mediaTeamSubmissions_v1',
            'sectionHeadMyArticles_v1',
            'eicMyArticles_v1',
            'executiveMyArticles_v1',
            'mpcMyArticles_v1',
            'cartoonistHeadMyArticles_v1',
            'sectionHeadArticleDrafts',
            'eicArticleDrafts',
            'executiveArticleDrafts',
            'mpcArticleDrafts',
            'cartoonistHeadArticleDrafts',
            'mediaArticleDrafts_v1',
            'cartoonistArticleDrafts_v1',
            'executiveActivityLogs_v1',
            'mpcActivityLogs_v1',
            'cartoonistHeadActivityLogs_v1',
            'eicActivityLogs_v1',
            'sectionHeadActivityLogs_v1'
        ];
        keysToRemove.forEach(k => localStorage.removeItem(k));
        localStorage.setItem(CLEAR_FLAG, 'true');
    }
} catch (e) {}

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // Dummy Accounts Dictionary (Executive, Section Heads & Writer Staff)
    // -------------------------------------------------------------------------
    const DUMMY_ACCOUNTS = {
        // Executive Officers
        "2024-00001-BN-0": { role: "President", name: "Juan Dela Cruz", isWriter: false, isSectionHead: false },
        "2024-00002-BN-0": { role: "Vice President", name: "Maria Clara Santos", isWriter: false, isSectionHead: false },
        "2024-00003-BN-0": { role: "Secretary", name: "Christian Alcantara", isWriter: false, isSectionHead: false },
        "2024-00004-BN-0": { role: "Associate Secretary", name: "Althea Grace Mendoza", isWriter: false, isSectionHead: false },
        "2024-00005-BN-0": { role: "Associate Secretary", name: "Rafael Ramos", isWriter: false, isSectionHead: false },
        "2024-00006-BN-0": { role: "Treasurer", name: "Mara Villanueva", isWriter: false, isSectionHead: false },
        "2024-00007-BN-0": { role: "Auditor", name: "Gabriel Navarro", isWriter: false, isSectionHead: false },
        "2024-00008-BN-0": { role: "Public Relations Officer", name: "Patricia Reyes", isWriter: false, isSectionHead: false },

        // Section Heads
        "2024-00051-BN-0": { role: "News Head", name: "Danilo C. Ramos", section: "News", isWriter: false, isSectionHead: true },
        "2024-00052-BN-0": { role: "Science and Technology Head", name: "Dr. Elena M. Romero", section: "Science and Technology", isWriter: false, isSectionHead: true },
        "2024-00053-BN-0": { role: "Feature Head", name: "Bianca Rose Flores", section: "Features", isWriter: false, isSectionHead: true },
        "2024-00054-BN-0": { role: "Literature Head", name: "Carlos Joaquin Luna", section: "Literature", isWriter: false, isSectionHead: true },

        // Editorial Board / Editors-in-Chief (EIC)
        "2024-00010-BN-0": { role: "Editorial-In-Chief", name: "Victoria Reyes", isWriter: false, isSectionHead: false, isEIC: true },
        "2024-00011-BN-0": { role: "Associate Editor-in-Chief", name: "Marcus Vance", isWriter: false, isSectionHead: false, isEIC: true },

        // Media & Public Communications (M&PC Heads)
        "2024-00020-BN-0": { role: "M&PC Head", name: "Julian Del Rosario", isWriter: false, isSectionHead: false, isMPC: true },
        "2024-00021-BN-0": { role: "Assoc M&PC Head", name: "Samantha Cruz", isWriter: false, isSectionHead: false, isMPC: true },
        "M&PC Head": { role: "M&PC Head", name: "Julian Del Rosario", studentNumber: "2024-00020-BN-0", isWriter: false, isSectionHead: false, isMPC: true },
        "Assoc M&PC Head": { role: "Assoc M&PC Head", name: "Samantha Cruz", studentNumber: "2024-00021-BN-0", isWriter: false, isSectionHead: false, isMPC: true },
        "Assoc Head": { role: "Assoc M&PC Head", name: "Samantha Cruz", studentNumber: "2024-00021-BN-0", isWriter: false, isSectionHead: false, isMPC: true },
        "Associate Head": { role: "Assoc M&PC Head", name: "Samantha Cruz", studentNumber: "2024-00021-BN-0", isWriter: false, isSectionHead: false, isMPC: true },
        "Julian Del Rosario": { role: "M&PC Head", name: "Julian Del Rosario", studentNumber: "2024-00020-BN-0", isWriter: false, isSectionHead: false, isMPC: true },
        "Samantha Cruz": { role: "Assoc M&PC Head", name: "Samantha Cruz", studentNumber: "2024-00021-BN-0", isWriter: false, isSectionHead: false, isMPC: true },

        // Cartoonist Head
        "2024-00030-BN-0": { role: "Cartoonist Head", name: "Danilo Reyes", isCartoonistHead: true, isWriter: false, isSectionHead: false },

        // Media & Communication Team
        "2024-00080-BN-0": { role: "Media & Communication", name: "Alyssa Marie Dizon", isMedia: true, isWriter: false, isSectionHead: false },
        "2024-00081-BN-0": { role: "Media & Communication", name: "Joshua Kenneth Tan", isMedia: true, isWriter: false, isSectionHead: false },

        // Cartoonist
        "2024-00090-BN-0": { role: "Cartoonist", name: "Raphael Luna", isCartoonist: true, isWriter: false, isSectionHead: false },
        "2024-00091-BN-0": { role: "Cartoonist", name: "Giselle Morales", isCartoonist: true, isWriter: false, isSectionHead: false },

        // Staff Writers
        "2024-00101-BN-0": { role: "Writer", name: "Sofia M. Alcaraz", writerId: "sofia-alcaraz", isWriter: true, isSectionHead: false },
        "2024-00102-BN-0": { role: "Writer", name: "Marco L. Valderrama", writerId: "marco-valderrama", isWriter: true, isSectionHead: false },
        "2024-00103-BN-0": { role: "Writer", name: "Camille Joy Perez", writerId: "sofia-alcaraz", isWriter: true, isSectionHead: false }
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

        // Validate against dummy accounts & required password (with case-insensitive / alias fallback)
        let account = (typeof DUMMY_ACCOUNTS[studentVal] === 'object') 
            ? DUMMY_ACCOUNTS[studentVal] 
            : (DUMMY_ACCOUNTS[studentVal] ? { role: DUMMY_ACCOUNTS[studentVal], name: DUMMY_ACCOUNTS[studentVal].includes('Writer') ? 'Sofia M. Alcaraz' : 'Juan Dela Cruz', isWriter: DUMMY_ACCOUNTS[studentVal].toLowerCase().includes('writer') } : null);

        if (!account) {
            const cleanKey = studentVal.trim().toLowerCase();
            for (const [k, v] of Object.entries(DUMMY_ACCOUNTS)) {
                if (k.toLowerCase() === cleanKey) {
                    account = v;
                    break;
                }
            }
        }

        if (!account) {
            try {
                const storedOfficers = JSON.parse(localStorage.getItem('manageAccountsOfficers_v1') || '[]');
                const found = storedOfficers.find(o => 
                    (o.studentNumber && o.studentNumber.toLowerCase() === studentVal.toLowerCase()) ||
                    (o.name && o.name.toLowerCase() === studentVal.toLowerCase())
                );
                if (found) {
                    account = {
                        role: found.role,
                        name: found.name,
                        studentNumber: found.studentNumber,
                        isWriter: found.role.toLowerCase().includes('writer')
                    };
                }
            } catch (e) {}
        }

        const isPasswordCorrect = (passVal === REQUIRED_PASSWORD);

        if (account && isPasswordCorrect) {
            // Determine role persona: Cartoonist Head, Cartoonist, Media Team, Writer, Section Head, EIC, MPC, or Executive
            const isCartoonistHead = account.isCartoonistHead || (account.role.toLowerCase().includes('cartoonist') && account.role.toLowerCase().includes('head'));
            const isCartoonist = !isCartoonistHead && (account.isCartoonist || account.role.toLowerCase().includes('cartoonist'));
            const isMedia = !isCartoonistHead && !isCartoonist && (account.isMedia || (!account.isMPC && (account.role.toLowerCase().includes('media & communication') || account.role.toLowerCase().includes('media and communication'))));
            
            const isMPC = !isCartoonistHead && !isCartoonist && !isMedia && (
                account.isMPC ||
                account.role.toLowerCase().includes('m&pc') ||
                account.role.toLowerCase().includes('mpc') ||
                account.role.toLowerCase().includes('assoc head') ||
                account.role.toLowerCase().includes('associate head') ||
                account.role.toLowerCase().includes('assoc m&pc') ||
                account.role.toLowerCase().includes('associate m&pc') ||
                account.role.toLowerCase().includes('associate media') ||
                account.role.toLowerCase().includes('media head') ||
                (account.role.toLowerCase().includes('media') && account.role.toLowerCase().includes('head'))
            );

            const isWriter = !isCartoonistHead && !isCartoonist && !isMedia && !isMPC && (account.isWriter || account.role.toLowerCase().includes('writer') || account.role.toLowerCase().includes('contributor'));
            const isEIC = !isCartoonistHead && !isCartoonist && !isMedia && !isMPC && (account.isEIC || account.role.toLowerCase().includes('chief') || account.role.toLowerCase().includes('eic'));
            
            const isSectionHead = !isCartoonistHead && !isCartoonist && !isMedia && !isMPC && !isEIC && (
                account.isSectionHead || (
                    account.role.toLowerCase().includes('head') &&
                    !account.role.toLowerCase().includes('chief') &&
                    !account.role.toLowerCase().includes('communications') &&
                    !account.role.toLowerCase().includes('media') &&
                    !account.role.toLowerCase().includes('m&pc') &&
                    !account.role.toLowerCase().includes('mpc') &&
                    !account.role.toLowerCase().includes('assoc') &&
                    !account.role.toLowerCase().includes('associate')
                )
            );

            let targetPage = 'executive-dashboard.html';
            let portalName = 'Executive Dashboard';

            // Fully isolate session storage per persona to prevent data bleed
            if (isCartoonistHead) {
                targetPage = 'cartoonist-head-dashboard.html';
                portalName = 'Cartoonist Head Dashboard';
                localStorage.setItem('userRole', account.role || 'Cartoonist Head');
                localStorage.setItem('userName', account.name);
                localStorage.setItem('studentNumber', studentVal);
                localStorage.setItem('cartoonistHeadRole', account.role || 'Cartoonist Head');
                localStorage.setItem('cartoonistHeadName', account.name);
                localStorage.setItem('cartoonistHeadStudentNumber', studentVal);
                localStorage.setItem('cartoonistHeadId', account.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                const avatar = localStorage.getItem('cartoonistHeadAvatar') || 'images/member-placeholder.svg';
                localStorage.setItem('userAvatar', avatar);
            } else if (isCartoonist) {
                targetPage = 'cartoonist-dashboard.html';
                portalName = 'Cartoonist Dashboard';
                localStorage.setItem('userRole', account.role || 'Cartoonist');
                localStorage.setItem('userName', account.name);
                localStorage.setItem('studentNumber', studentVal);
                localStorage.setItem('cartoonistRole', account.role || 'Cartoonist');
                localStorage.setItem('cartoonistName', account.name);
                localStorage.setItem('cartoonistStudentNumber', studentVal);
                localStorage.setItem('cartoonistId', account.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                const avatar = localStorage.getItem('cartoonistAvatar') || 'images/member-placeholder.svg';
                localStorage.setItem('userAvatar', avatar);
            } else if (isMedia) {
                targetPage = 'media-dashboard.html';
                portalName = 'Media & Communication Dashboard';
                localStorage.setItem('userRole', account.role || 'Media & Communication');
                localStorage.setItem('userName', account.name);
                localStorage.setItem('studentNumber', studentVal);
                localStorage.setItem('mediaRole', account.role || 'Media & Communication');
                localStorage.setItem('mediaName', account.name);
                localStorage.setItem('mediaStudentNumber', studentVal);
                localStorage.setItem('mediaId', account.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                const avatar = localStorage.getItem('mediaAvatar') || 'images/member-placeholder.svg';
                localStorage.setItem('userAvatar', avatar);
            } else if (isWriter) {
                targetPage = 'writer-dashboard.html';
                portalName = 'Writer Dashboard';
                localStorage.setItem('userRole', 'Writer');
                localStorage.setItem('userName', account.name);
                localStorage.setItem('studentNumber', studentVal);
                localStorage.setItem('writerName', account.name);
                localStorage.setItem('writerRole', 'Writer');
                localStorage.setItem('writerStudentNumber', studentVal);
                localStorage.setItem('writerId', account.writerId || 'sofia-alcaraz');
                const avatar = localStorage.getItem('writerAvatar') || 'images/member-placeholder.svg';
                localStorage.setItem('userAvatar', avatar);
            } else if (isSectionHead) {
                targetPage = 'section-head-dashboard.html';
                portalName = 'Section Head Dashboard';
                localStorage.setItem('userRole', account.role);
                localStorage.setItem('userName', account.name);
                localStorage.setItem('studentNumber', studentVal);
                localStorage.setItem('sectionHeadRole', account.role);
                localStorage.setItem('sectionHeadName', account.name);
                localStorage.setItem('sectionHeadSection', account.section || 'General');
                localStorage.setItem('sectionHeadStudentNumber', studentVal);
                const avatar = localStorage.getItem('sectionHeadAvatar') || 'images/member-placeholder.svg';
                localStorage.setItem('userAvatar', avatar);
            } else if (isEIC) {
                targetPage = 'eic-dashboard.html';
                portalName = 'Editor-in-Chief Dashboard';
                localStorage.setItem('userRole', account.role);
                localStorage.setItem('userName', account.name);
                localStorage.setItem('studentNumber', studentVal);
                localStorage.setItem('eicRole', account.role);
                localStorage.setItem('eicName', account.name);
                localStorage.setItem('eicStudentNumber', studentVal);
                const avatar = localStorage.getItem('eicAvatar') || 'images/member-placeholder.svg';
                localStorage.setItem('userAvatar', avatar);
            } else if (isMPC) {
                targetPage = 'mpc-dashboard.html';
                portalName = 'Media & Public Communications Dashboard';
                const isAssoc = account.role.toLowerCase().includes('assoc') || account.role.toLowerCase().includes('associate');
                const canonicalRole = isAssoc ? 'Assoc M&PC Head' : 'M&PC Head';
                const canonicalName = account.name || (isAssoc ? 'Samantha Cruz' : 'Julian Del Rosario');
                const canonicalNumber = account.studentNumber || (studentVal.includes('BN-0') ? studentVal : (isAssoc ? '2024-00021-BN-0' : '2024-00020-BN-0'));

                localStorage.setItem('userRole', canonicalRole);
                localStorage.setItem('userName', canonicalName);
                localStorage.setItem('studentNumber', canonicalNumber);
                localStorage.setItem('mpcRole', canonicalRole);
                localStorage.setItem('mpcName', canonicalName);
                localStorage.setItem('mpcStudentNumber', canonicalNumber);
                localStorage.setItem('mpcId', canonicalName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                const avatar = localStorage.getItem('mpcAvatar') || 'images/member-placeholder.svg';
                localStorage.setItem('userAvatar', avatar);
            } else {
                targetPage = 'executive-dashboard.html';
                portalName = 'Executive Dashboard';
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
