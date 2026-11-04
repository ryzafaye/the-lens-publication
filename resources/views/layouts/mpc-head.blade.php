<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Media & Public Communications Dashboard') | The Lens</title>

    <!-- Typography & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,600;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Strictly Separated Minimalist CSS -->
    <link rel="stylesheet" href="{{ asset('css/executive-dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-modals.css') }}">
    @yield('extra-css')
    @stack('styles')

    <script>
        @auth
            const rawRole = "{!! Auth::user()->role->role_name ?? 'Media and Public Communications Head' !!}";
            const userName = "{!! Auth::user()->full_name ?? 'M&PC Head' !!}";
            const studentNum = "{!! Auth::user()->student_number ?? '' !!}";

            window.LARAVEL_USER_ROLE = rawRole;
            window.LARAVEL_USER_NAME = userName;

            localStorage.setItem('userRole', rawRole);
            localStorage.setItem('userName', userName);
            localStorage.setItem('studentNumber', studentNum);
            localStorage.setItem('mpcRole', rawRole);
            localStorage.setItem('mpcName', userName);
            localStorage.setItem('mpcStudentNumber', studentNum);
        @endauth
    </script>
</head>
<body class="dashboard-body">

    <!-- Reusable M&PC Sidebar Component -->
    @include('components.mpc-head-sidebar')

    <!-- ====================================================================== -->
    <!-- MAIN CONTENT AREA: Right                                              -->
    <!-- ====================================================================== -->
    <div class="main-wrapper">

        <!-- Top Header Bar -->
        <header class="topbar">
            
            <!-- Left Side: Mobile Hamburger + Logo + Desktop Clock -->
            <div class="topbar-left">
                <div class="mobile-header-brand">
                    <button type="button" id="mobile-hamburger-btn" class="mobile-hamburger-btn" aria-label="Toggle navigation menu" aria-expanded="false">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                    <div class="mobile-brand-lockup">
                        <div class="mobile-logo-square">
                            <img src="{{ asset('images/logo.jpg') }}" alt="The Lens Logo">
                        </div>
                        <span class="mobile-brand-title">The Lens</span>
                    </div>
                </div>

                <div class="topbar-clock">
                    <i class="fa-regular fa-clock"></i>
                    <span id="topbar-clock-display">Loading date &amp; time…</span>
                </div>
            </div>

            <!-- Right Side: Notification + Profile -->
            <div class="topbar-right">
                <button type="button" class="topbar-notification-btn" aria-label="View notifications">
                    <span class="notification-icon-wrapper">
                        <i class="fa-regular fa-bell"></i>
                        <span class="notification-badge-dot"></span>
                    </span>
                    <span class="notification-label">Notification</span>
                </button>

                <div class="topbar-divider"></div>

                <!-- User Profile Lockup -->
                <div class="topbar-user-profile">
                    <div class="topbar-avatar-circle" title="User Profile">
                        <img src="{{ asset('images/member-placeholder.svg') }}" alt="User Profile Picture">
                    </div>
                    <span id="topbar-user-role" class="topbar-role-badge">{{ Auth::user()?->role?->role_name ?? 'M&PC Head' }}</span>
                </div>

            </div>
        </header>

        <!-- Mobile Accordion Dropdown -->
        <nav id="mobile-nav-dropdown" class="mobile-nav-dropdown" aria-label="Mobile Navigation Menu">
            <div class="mobile-nav-profile">
                <div class="mobile-nav-avatar">
                    <img src="{{ asset('images/member-placeholder.svg') }}" alt="Avatar">
                </div>
                <div class="mobile-nav-user-info">
                    <div class="mobile-nav-name">{{ Auth::user()?->full_name ?? 'M&PC Head' }}</div>
                    <div class="mobile-nav-role">{{ Auth::user()?->role?->role_name ?? 'M&PC Head' }}</div>
                </div>
            </div>

            <div class="mobile-nav-links">
                <a href="{{ route('mpc-head.dashboard') }}" class="mobile-nav-link {{ request()->routeIs('mpc-head.dashboard*') ? 'active' : '' }}">
                    <i class="fa-solid fa-chart-pie"></i>
                    <span>Dashboard</span>
                </a>
                <a href="{{ route('mpc-head.publish-article') }}" class="mobile-nav-link {{ request()->routeIs('mpc-head.publish-article*') ? 'active' : '' }}">
                    <i class="fa-solid fa-globe"></i>
                    <span>Publish Article</span>
                </a>
                <a href="{{ route('mpc-head.media-desk') }}" class="mobile-nav-link {{ request()->routeIs('mpc-head.media-desk*') ? 'active' : '' }}">
                    <i class="fa-regular fa-image"></i>
                    <span>Media Desk</span>
                </a>
                <a href="{{ route('mpc-head.submit-media') }}" class="mobile-nav-link {{ request()->routeIs('mpc-head.submit-media*') ? 'active' : '' }}">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    <span>Submit Media</span>
                </a>
                <a href="{{ route('mpc-head.manage-my-articles') }}" class="mobile-nav-link {{ request()->routeIs('mpc-head.manage-my-articles*') ? 'active' : '' }}">
                    <i class="fa-solid fa-file-pen"></i>
                    <span>Manage My Articles</span>
                </a>
                <a href="{{ route('mpc-head.submit-article') }}" class="mobile-nav-link {{ request()->routeIs('mpc-head.submit-article*') ? 'active' : '' }}">
                    <i class="fa-solid fa-feather-pointed"></i>
                    <span>Submit article</span>
                </a>
                <a href="{{ route('mpc-head.activity-logs') }}" class="mobile-nav-link {{ request()->routeIs('mpc-head.activity-logs*') ? 'active' : '' }}">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                    <span>Activity log</span>
                </a>
                <a href="{{ route('mpc-head.transparency') }}" class="mobile-nav-link {{ request()->routeIs('mpc-head.transparency*') ? 'active' : '' }}">
                    <i class="fa-solid fa-file-invoice-dollar"></i>
                    <span>Transparency</span>
                </a>
            </div>

            <div class="mobile-nav-footer">
                <a href="{{ route('mpc-head.profile-settings') }}" class="mobile-nav-footer-link {{ request()->routeIs('mpc-head.profile-settings*') ? 'active' : '' }}">
                    <i class="fa-solid fa-sliders"></i>
                    <span>Profile Settings</span>
                </a>
                <a href="{{ url('/') }}" target="_blank" rel="noopener noreferrer" class="mobile-nav-footer-link">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    <span>View public site</span>
                </a>
                <button type="submit" form="logout-form" class="mobile-nav-footer-link mobile-logout-btn">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>Logout</span>
                </button>
            </div>
        </nav>

        @yield('content')

    </div>

    <!-- Hidden form for logging out securely via POST -->
    <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
        @csrf
    </form>

    <!-- Global Floating Toast Notification Container -->
    <div id="toast-container" class="toast-container" aria-live="polite"></div>

    <script>
        // Shell interactions: Clock & Mobile drawer
        const hamburgerBtn = document.getElementById('mobile-hamburger-btn');
        const mobileNav = document.getElementById('mobile-nav-dropdown');
        hamburgerBtn?.addEventListener('click', () => {
            const isOpen = mobileNav.classList.toggle('open');
            hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
        });

        function updateClock() {
            const clockEl = document.getElementById('topbar-clock-display');
            if (!clockEl) return;
            const d = new Date();
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            clockEl.textContent = `${dateStr} • ${timeStr}`;
        }
        updateClock();
        setInterval(updateClock, 1000);
    </script>
    @stack('scripts')
</body>
</html>
