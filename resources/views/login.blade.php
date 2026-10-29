<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login | The Lens</title>

    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <style>
        .book-wrapper { perspective: 1600px; }
        .open-book { transform-style: preserve-3d; box-shadow: 0 30px 60px -15px rgba(58, 6, 20, 0.22), 0 15px 35px -10px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(74, 9, 27, 0.08); border-radius: 20px; position: relative; }
        .book-edge-stack { position: absolute; bottom: -8px; left: 20px; right: 20px; height: 10px; background: linear-gradient(to bottom, #eae7e1, #d4cfc5); border-radius: 0 0 16px 16px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1); z-index: 0; }
        .book-edge-stack-sub { position: absolute; bottom: -14px; left: 36px; right: 36px; height: 8px; background: linear-gradient(to bottom, #ded9ce, #c5beb1); border-radius: 0 0 14px 14px; box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12); z-index: -1; }
        .left-page-spine-shadow { background: linear-gradient(to left, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.15) 30%, transparent 100%); }
        .right-page-spine-shadow { background: linear-gradient(to right, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.05) 35%, transparent 100%); }
        .silk-ribbon { position: absolute; top: -6px; left: 50%; transform: translateX(-50%); width: 24px; height: 84px; background: linear-gradient(135deg, #8d1337 0%, #700f2b 50%, #4a091b 100%); box-shadow: 0 6px 12px rgba(74, 9, 27, 0.35), 0 2px 4px rgba(0, 0, 0, 0.2); z-index: 40; border-radius: 3px 3px 0 0; clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%); transition: transform 0.3s ease; }
        .silk-ribbon:hover { transform: translateX(-50%) translateY(4px); }
        @keyframes floatLogo { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-10px) rotate(0.8deg); } }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.45; transform: scale(0.96); } 50% { opacity: 0.85; transform: scale(1.1); } }
        @keyframes driftOrb1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(25px, -20px) scale(1.15); } }
        @keyframes driftOrb2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-30px, 25px) scale(1.1); } }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @keyframes bookEntrance { 0% { opacity: 0; transform: translateY(24px) scale(0.97); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-float-logo { animation: floatLogo 5.5s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulseGlow 4.5s ease-in-out infinite; }
        .animate-drift-1 { animation: driftOrb1 12s ease-in-out infinite; }
        .animate-drift-2 { animation: driftOrb2 14s ease-in-out infinite; }
        .animate-book { animation: bookEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .shimmer-button { position: relative; overflow: hidden; }
        .shimmer-button::after { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent); transition: 0.5s; }
        .shimmer-button:hover::after { animation: shimmer 1.1s infinite; }
    </style>
</head>
<body class="min-h-full bg-white font-body text-stone-900 selection:bg-wine selection:text-white flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16 relative overflow-x-hidden">

    <div class="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(112,15,43,0.04),transparent_70%)]"></div>

    <div class="book-wrapper w-full max-w-4xl lg:max-w-5xl relative z-10 animate-book my-6">
        <div class="book-edge-stack hidden sm:block"></div>
        <div class="book-edge-stack-sub hidden sm:block"></div>

        <div class="open-book bg-stone-900 flex flex-col lg:flex-row rounded-2xl sm:rounded-3xl overflow-hidden relative border-4 border-[#3a0614] z-10">
            <div class="silk-ribbon hidden lg:block" title="The Lens Bookmark"></div>

            <section class="relative lg:w-1/2 py-6 px-4 sm:py-8 sm:px-6 lg:p-14 min-h-[140px] sm:min-h-[180px] lg:min-h-[580px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#22020b] via-[#4a091b] to-[#120207] shadow-inner">
                <div class="left-page-spine-shadow pointer-events-none absolute right-0 top-0 bottom-0 w-12 hidden lg:block z-20"></div>
                <div class="pointer-events-none absolute -top-16 -left-16 w-80 h-80 rounded-full bg-rose-600/25 blur-3xl animate-drift-1"></div>
                <div class="pointer-events-none absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-wine/50 blur-3xl animate-drift-2"></div>
                <div class="pointer-events-none absolute inset-0 opacity-[0.06]" style="background-image: radial-gradient(rgba(255, 255, 255, 0.9) 1px, transparent 1px); background-size: 20px 20px;"></div>
                <div class="pointer-events-none absolute inset-4 sm:inset-6 rounded-2xl border border-white/10 hidden sm:block"></div>

                <div class="relative z-10 flex items-center justify-center">
                    <div class="relative group cursor-pointer">
                        <div class="absolute -inset-3 sm:-inset-4 lg:-inset-6 rounded-full bg-gradient-to-tr from-rose-600/50 via-wine/70 to-amber-500/35 blur-xl sm:blur-2xl lg:blur-3xl animate-pulse-glow"></div>
                        <div class="absolute -inset-2.5 sm:-inset-3.5 lg:-inset-5 rounded-full border border-white/25 border-dashed animate-spin" style="animation-duration: 35s;"></div>
                        <div class="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-80 lg:h-80 rounded-full p-1.5 sm:p-2 lg:p-3 bg-gradient-to-b from-white/30 via-white/10 to-transparent shadow-xl lg:shadow-2xl backdrop-blur-xl animate-float-logo">
                            <div class="w-full h-full rounded-full overflow-hidden border border-white/40 lg:border-2 shadow-inner bg-[#4a091b] flex items-center justify-center">
                                <img src="{{ asset('images/logo.jpg') }}" alt="The Lens Logo" class="w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-105">
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main class="lg:w-1/2 flex flex-col justify-center p-6 sm:p-10 lg:p-16 bg-[#ffffff] relative">
                <div class="right-page-spine-shadow pointer-events-none absolute left-0 top-0 bottom-0 w-10 hidden lg:block z-20"></div>
                <div class="pointer-events-none absolute inset-4 sm:inset-6 rounded-2xl border border-stone-200/60 hidden sm:block"></div>

                <div class="w-full max-w-sm mx-auto relative z-20">
                    <div class="mb-6 sm:mb-8 pt-4 sm:pt-0">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-widest uppercase bg-rose-900/10 text-rose-900 mb-3">
                            Member Portal
                        </span>
                        <h1 class="font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                            Sign In
                        </h1>
                        <p class="mt-1.5 text-sm text-stone-500">
                            Enter your student number and password to proceed.
                        </p>
                    </div>

                    @if ($errors->any())
                        <div class="mb-6 p-3.5 rounded-xl text-xs sm:text-sm font-medium bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                            <i class="fa-solid fa-circle-exclamation text-rose-500"></i>
                            <span>{{ $errors->first() }}</span>
                        </div>
                    @endif

                    <form id="login-form" method="POST" action="{{ route('login.post') }}" class="space-y-5">
                        @csrf
                        
                        <div class="space-y-1.5">
                            <label for="student-number" class="block text-xs font-semibold uppercase tracking-wider text-stone-800">
                                Student Number
                            </label>
                            <div class="relative group">
                                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-rose-900 transition-colors">
                                    <i class="fa-regular fa-id-card text-base"></i>
                                </div>
                                <input type="text" id="student-number" name="student_number" value="{{ old('student_number') }}" required autocomplete="username" placeholder="0000-00000-BN-0" class="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-stone-200 bg-stone-50/60 text-stone-900 placeholder:text-stone-400 text-sm font-medium tracking-wide focus:outline-none focus:border-rose-900 focus:bg-white focus:ring-4 focus:ring-rose-900/10 transition-all duration-200 shadow-sm">
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-stone-800">
                                Password
                            </label>
                            <div class="relative group">
                                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-rose-900 transition-colors">
                                    <i class="fa-solid fa-lock text-sm"></i>
                                </div>
                                <input type="password" id="password" name="password" required autocomplete="current-password" placeholder="Enter your password" class="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-stone-200 bg-stone-50/60 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:border-rose-900 focus:bg-white focus:ring-4 focus:ring-rose-900/10 transition-all duration-200 shadow-sm">
                                
                                <button type="button" id="toggle-password" class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 focus:outline-none transition-colors">
                                    <i id="toggle-password-icon" class="fa-regular fa-eye text-sm"></i>
                                </button>
                            </div>
                        </div>

                        <div class="pt-2">
                            <button type="submit" id="login-button" class="shimmer-button w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#700f2b] to-[#8d1337] hover:from-[#5e0c24] hover:to-[#700f2b] text-white font-medium text-sm tracking-wide shadow-md hover:shadow-lg shadow-rose-900/25 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-rose-900/25">
                                <span>Log In</span>
                                <i class="fa-solid fa-arrow-right text-xs"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    </div>

    <script>
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
    </script>
</body>
</html>