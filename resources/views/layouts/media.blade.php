<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Media &amp; Communication Portal') | The Lens</title>

    <!-- Typography & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,600;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Shared Stylesheets ("Executive Parity" Design System) -->
    <link rel="stylesheet" href="{{ asset('css/executive-dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-modals.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-manage-articles.css') }}">
    @yield('extra-css')
    @stack('styles')

    <script>
        @auth
            const rawRole = "{!! Auth::user()->role->role_name ?? 'Media Team' !!}";
            const userName = "{!! Auth::user()->full_name ?? 'Media Team' !!}";
            const studentNum = "{!! Auth::user()->student_number ?? '' !!}";
            const userAvatar = "{!! Auth::user()->avatar_url ?? asset('images/member-placeholder.svg') !!}";

            window.LARAVEL_USER_ROLE = rawRole;
            window.LARAVEL_USER_NAME = userName;
            window.LARAVEL_USER_AVATAR = userAvatar;

            try {
                localStorage.setItem('userRole', rawRole);
                localStorage.setItem('userName', userName);
                localStorage.setItem('studentNumber', studentNum);
                localStorage.setItem('userAvatar', userAvatar);
                localStorage.setItem('mediaRole', rawRole);
                localStorage.setItem('mediaName', userName);
                localStorage.setItem('mediaStudentNumber', studentNum);
                localStorage.setItem('mediaAvatar', userAvatar);
            } catch (e) {}
        @endauth
    </script>
</head>
<body class="dashboard-body">

    <!-- Reusable Media & Communication Sidebar Component -->
    @include('components.media-sidebar')

    <div class="main-wrapper">
        <!-- TOPBAR -->
        <header class="topbar">
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

            <div class="topbar-right">
                <button type="button" class="topbar-notification-btn" aria-label="View notifications">
                    <span class="notification-icon-wrapper">
                        <i class="fa-regular fa-bell"></i>
                        <span class="notification-badge-dot"></span>
                    </span>
                    <span class="notification-label">Notification</span>
                </button>
                <div class="topbar-divider"></div>
                <div class="topbar-user-profile">
                    <div class="topbar-avatar-circle" title="User Profile">
                        <img id="topbar-user-avatar" src="{{ Auth::user()?->avatar_url ?? (Auth::user()?->avatar ? asset(Auth::user()->avatar) : asset('images/member-placeholder.svg')) }}" alt="{{ Auth::user()?->full_name ?? 'User' }} Profile Picture">
                    </div>
                    <span id="topbar-user-role" class="topbar-role-badge">{{ Auth::user()?->role?->role_name ?? 'Media & Communication' }}</span>
                </div>
            </div>
        </header>

        <!-- Mobile Navigation Menu Dropdown -->
        <nav id="mobile-nav-dropdown" class="mobile-nav-dropdown" aria-label="Mobile Navigation Menu">
            <div class="mobile-nav-profile">
                <div class="mobile-nav-avatar">
                    <img id="mobile-user-avatar" src="{{ Auth::user()?->avatar_url ?? (Auth::user()?->avatar ? asset(Auth::user()->avatar) : asset('images/member-placeholder.svg')) }}" alt="{{ Auth::user()?->full_name ?? 'User' }} Avatar">
                </div>
                <div class="mobile-nav-user-info">
                    <div id="mobile-user-name" class="mobile-nav-name">{{ Auth::user()?->full_name ?? 'Media Team' }}</div>
                    <div id="mobile-user-role" class="mobile-nav-role">{{ Auth::user()?->role?->role_name ?? 'Media & Communication' }}</div>
                </div>
            </div>

            <div class="mobile-nav-links">
                <a href="{{ route('media.dashboard') }}" class="mobile-nav-link {{ request()->routeIs('media.dashboard') ? 'active' : '' }}">
                    <i class="fa-solid fa-chart-pie"></i>
                    <span>Dashboard</span>
                </a>
                <a href="{{ route('media.submit-article') }}" class="mobile-nav-link {{ request()->routeIs('media.submit-article*') ? 'active' : '' }}">
                    <i class="fa-solid fa-feather-pointed"></i>
                    <span>Submit Article</span>
                </a>
                <a href="{{ route('media.manage-articles') }}" class="mobile-nav-link {{ request()->routeIs('media.manage-articles*') || request()->routeIs('media.manage-my-articles*') ? 'active' : '' }}">
                    <i class="fa-regular fa-newspaper"></i>
                    <span>Manage My Articles</span>
                </a>
                <a href="{{ route('media.submit-media') }}" class="mobile-nav-link {{ request()->routeIs('media.submit-media*') ? 'active' : '' }}">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    <span>Submit Media</span>
                </a>
                <a href="{{ route('media.manage-media') }}" class="mobile-nav-link {{ request()->routeIs('media.manage-media*') ? 'active' : '' }}">
                    <i class="fa-solid fa-images"></i>
                    <span>Manage Media</span>
                </a>
            </div>

            <div class="mobile-nav-footer">
                <a href="{{ route('media.profile-settings') }}" class="mobile-nav-footer-link {{ request()->routeIs('media.profile-settings*') ? 'active' : '' }}">
                    <i class="fa-solid fa-sliders"></i>
                    <span>Profile Settings</span>
                </a>
                <a href="{{ url('/') }}" target="_blank" rel="noopener noreferrer" class="mobile-nav-footer-link">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    <span>View public site</span>
                </a>
                <form action="{{ route('logout') }}" method="POST" style="margin: 0; padding: 0;">
                    @csrf
                    <button type="submit" id="mobile-logout-btn" class="mobile-nav-footer-link mobile-logout-btn" style="width: 100%; border: none; background: transparent; cursor: pointer; text-align: left;">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        <span>Logout</span>
                    </button>
                </form>
            </div>
        </nav>

        <!-- Dynamic Content Section -->
        @yield('content')

    </div>

    <!-- Toast Notification Container -->
    <div id="toast-container" class="toast-container" aria-live="polite"></div>

    <!-- Media Shell Script for Menu and Clock -->
    <script src="{{ asset('js/media-shell.js') }}"></script>
    @yield('extra-js')
    @stack('scripts')
</body>
</html>

