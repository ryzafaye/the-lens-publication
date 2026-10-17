/**
 * The Lens - Member Login Portal JavaScript
 * Handles authentication, form validation, password visibility, and demo access.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Password Visibility Toggle
    const passwordInput = document.getElementById("password");
    const togglePasswordBtn = document.getElementById("togglePassword");
    const passwordEyeIcon = document.getElementById("passwordEyeIcon");

    if (togglePasswordBtn && passwordInput && passwordEyeIcon) {
        togglePasswordBtn.addEventListener("click", () => {
            const isPassword = passwordInput.getAttribute("type") === "password";
            passwordInput.setAttribute("type", isPassword ? "text" : "password");
            
            // Toggle eye icon
            if (isPassword) {
                passwordEyeIcon.classList.remove("fa-eye");
                passwordEyeIcon.classList.add("fa-eye-slash");
                togglePasswordBtn.setAttribute("aria-label", "Hide password");
            } else {
                passwordEyeIcon.classList.remove("fa-eye-slash");
                passwordEyeIcon.classList.add("fa-eye");
                togglePasswordBtn.setAttribute("aria-label", "Show password");
            }
        });
    }

    // 2. Pre-fill remembered student number if exists
    const studentNumberInput = document.getElementById("studentNumber");
    const rememberMeCheckbox = document.getElementById("rememberMe");
    
    if (studentNumberInput && rememberMeCheckbox) {
        const savedStudentNumber = localStorage.getItem("thelens_remembered_student_number");
        if (savedStudentNumber) {
            studentNumberInput.value = savedStudentNumber;
            rememberMeCheckbox.checked = true;
        }
    }

    // 3. Demo Credentials Auto-Fill Buttons
    const demoButtons = document.querySelectorAll(".demo-fill-btn");
    demoButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const sid = btn.getAttribute("data-id");
            const pwd = btn.getAttribute("data-password");
            if (studentNumberInput && passwordInput) {
                studentNumberInput.value = sid;
                passwordInput.value = pwd;
                showAlert("Demo credentials auto-filled! Click 'Sign In' to test.", "info");
            }
        });
    });

    // 4. Alert Banner Display Helper
    const alertBox = document.getElementById("loginAlert");
    const alertMessage = document.getElementById("loginAlertMessage");
    const alertIcon = document.getElementById("loginAlertIcon");

    function showAlert(message, type = "error") {
        if (!alertBox || !alertMessage) return;

        alertBox.classList.remove("hidden", "bg-red-50", "border-red-200", "text-red-800", "bg-emerald-50", "border-emerald-200", "text-emerald-800", "bg-blue-50", "border-blue-200", "text-blue-800");

        if (type === "error") {
            alertBox.classList.add("bg-red-50", "border-red-200", "text-red-800");
            if (alertIcon) alertIcon.className = "fa-solid fa-circle-exclamation text-red-500 mt-0.5 shrink-0";
        } else if (type === "success") {
            alertBox.classList.add("bg-emerald-50", "border-emerald-200", "text-emerald-800");
            if (alertIcon) alertIcon.className = "fa-solid fa-circle-check text-emerald-500 mt-0.5 shrink-0";
        } else if (type === "info") {
            alertBox.classList.add("bg-blue-50", "border-blue-200", "text-blue-800");
            if (alertIcon) alertIcon.className = "fa-solid fa-circle-info text-blue-500 mt-0.5 shrink-0";
        }

        alertMessage.textContent = message;
        alertBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function hideAlert() {
        if (alertBox) {
            alertBox.classList.add("hidden");
        }
    }

    const closeAlertBtn = document.getElementById("closeAlertBtn");
    if (closeAlertBtn) {
        closeAlertBtn.addEventListener("click", hideAlert);
    }

    // 5. Login Form Submission Handler
    const loginForm = document.getElementById("loginForm");
    const submitBtn = document.getElementById("loginSubmitBtn");
    const btnSpinner = document.getElementById("loginSpinner");
    const btnText = document.getElementById("loginBtnText");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            hideAlert();

            const studentNumber = studentNumberInput ? studentNumberInput.value.trim() : "";
            const password = passwordInput ? passwordInput.value : "";
            const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;

            // Basic Validation
            if (!studentNumber) {
                showAlert("Please enter your Student Number or editorial username.", "error");
                studentNumberInput?.focus();
                return;
            }

            if (!password) {
                showAlert("Please enter your password.", "error");
                passwordInput?.focus();
                return;
            }

            // Set loading state
            if (submitBtn) submitBtn.disabled = true;
            if (btnSpinner) btnSpinner.classList.remove("hidden");
            if (btnText) btnText.textContent = "Verifying Credentials...";

            // Check if backend API exists (either Laravel /login or legacy api/login.php)
            let loginSuccess = false;
            let responseUser = null;
            let errorMessage = "Invalid Student ID or password.";

            try {
                // First try standard Laravel endpoint or PHP API if hosted with backend
                const endpoints = ["/login", "api/login.php"];
                let responded = false;

                for (const endpoint of endpoints) {
                    try {
                        const response = await fetch(endpoint, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Accept": "application/json",
                                "X-Requested-With": "XMLHttpRequest"
                            },
                            body: JSON.stringify({
                                student_number: studentNumber,
                                student_id: studentNumber,
                                password: password
                            })
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.success || data.user || data.message === "Login successful!") {
                                loginSuccess = true;
                                responseUser = data.user || { name: "Editorial Staff", student_id: studentNumber, role: "editor" };
                                responded = true;
                                break;
                            } else {
                                errorMessage = data.message || "Invalid credentials.";
                                responded = true;
                                break;
                            }
                        }
                    } catch (netErr) {
                        // Network error or endpoint not served; fallback to demo mode
                    }
                }

                // If no active backend server is connected (e.g. running statically from file/live server),
                // provide full interactive demo mode support!
                if (!responded) {
                    await new Promise(resolve => setTimeout(resolve, 800)); // Smooth UX delay

                    // Demo allowed credentials
                    const demoAccounts = {
                        "2024-00123": { name: "Maria Santos", role: "Editor-in-Chief", pass: "password123" },
                        "2024-00456": { name: "Juan Dela Cruz", role: "Section Editor", pass: "password123" },
                        "2024-00789": { name: "Ana Reyes", role: "Staff Writer", pass: "password123" },
                        "admin": { name: "Publication Administrator", role: "Admin", pass: "admin123" }
                    };

                    const account = demoAccounts[studentNumber];
                    if (account && account.pass === password) {
                        loginSuccess = true;
                        responseUser = {
                            name: account.name,
                            student_id: studentNumber,
                            role: account.role
                        };
                    } else if (password.length >= 6) {
                        // Accept standard student ID patterns in frontend demo
                        loginSuccess = true;
                        responseUser = {
                            name: "Staff Member",
                            student_id: studentNumber,
                            role: "Staff Member"
                        };
                    } else {
                        errorMessage = "Invalid credentials. Password must be at least 6 characters, or use the demo accounts below.";
                    }
                }
            } catch (err) {
                console.error("Login error:", err);
                errorMessage = "An unexpected error occurred. Please try again.";
            }

            // Reset button state
            if (submitBtn) submitBtn.disabled = false;
            if (btnSpinner) btnSpinner.classList.add("hidden");
            if (btnText) btnText.textContent = "Sign In to Portal";

            if (loginSuccess) {
                // Save remember me
                if (rememberMe) {
                    localStorage.setItem("thelens_remembered_student_number", studentNumber);
                } else {
                    localStorage.removeItem("thelens_remembered_student_number");
                }

                // Store active session in sessionStorage
                sessionStorage.setItem("thelens_active_user", JSON.stringify(responseUser));

                showAlert(`Welcome back, ${responseUser.name}! (${responseUser.role}) Redirecting to publication...`, "success");

                setTimeout(() => {
                    window.location.href = "index.html?logged_in=1";
                }, 1200);
            } else {
                showAlert(errorMessage, "error");
            }
        });
    }

    // 6. Forgot Password Modal
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");
    const forgotPasswordModal = document.getElementById("forgotPasswordModal");
    const closeForgotModalBtn = document.getElementById("closeForgotModalBtn");
    const cancelForgotBtn = document.getElementById("cancelForgotBtn");
    const forgotForm = document.getElementById("forgotForm");
    const forgotStatusMsg = document.getElementById("forgotStatusMsg");

    function openForgotModal() {
        if (forgotPasswordModal) {
            forgotPasswordModal.classList.remove("hidden");
            forgotPasswordModal.classList.add("flex");
        }
    }

    function closeForgotModal() {
        if (forgotPasswordModal) {
            forgotPasswordModal.classList.add("hidden");
            forgotPasswordModal.classList.remove("flex");
            if (forgotStatusMsg) forgotStatusMsg.classList.add("hidden");
            if (forgotForm) forgotForm.reset();
        }
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", (e) => {
            e.preventDefault();
            openForgotModal();
        });
    }

    if (closeForgotModalBtn) closeForgotModalBtn.addEventListener("click", closeForgotModal);
    if (cancelForgotBtn) cancelForgotBtn.addEventListener("click", closeForgotModal);

    if (forgotPasswordModal) {
        forgotPasswordModal.addEventListener("click", (e) => {
            if (e.target === forgotPasswordModal) {
                closeForgotModal();
            }
        });
    }

    if (forgotForm) {
        forgotForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const sidInput = document.getElementById("forgotStudentId");
            const sid = sidInput ? sidInput.value.trim() : "";

            if (!sid) return;

            if (forgotStatusMsg) {
                forgotStatusMsg.textContent = `Password reset request submitted for ${sid}. Please check with the Editorial Board or university publication adviser for your temporary credentials.`;
                forgotStatusMsg.classList.remove("hidden");
            }

            setTimeout(() => {
                closeForgotModal();
            }, 3500);
        });
    }

    // 7. Update Date and Year if present
    const currentDate = document.getElementById("currentDate");
    if (currentDate) {
        currentDate.textContent = new Date().toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric"
        }).toUpperCase();
    }

    const copyrightYear = document.getElementById("copyrightYear");
    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }
});
