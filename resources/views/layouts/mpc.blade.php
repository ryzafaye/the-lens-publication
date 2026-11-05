<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Media &amp; Public Communications') | The Lens</title>

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
            const rawRole = "{!! Auth::user()->role->role_name ?? 'Media and Public Communications Head' !!}";
            const userName = "{!! Auth::user()->full_name ?? 'M&PC Head' !!}";
            const studentNum = "{!! Auth::user()->student_number ?? '' !!}";
            const userAvatar = "{!! Auth::user()->avatar_url ?? asset('images/member-placeholder.svg') !!}";

            window.LARAVEL_USER_ROLE = rawRole;
            window.LARAVEL_USER_NAME = userName;
            window.LARAVEL_USER_AVATAR = userAvatar;

            localStorage.setItem('userRole', rawRole);
            localStorage.setItem('userName', userName);
            localStorage.setItem('studentNumber', studentNum);
            localStorage.setItem('userAvatar', userAvatar);
            localStorage.setItem('mpcRole', rawRole);
            localStorage.setItem('mpcName', userName);
        @endauth
    </script>
</head>
<body class="dashboard-body">

    <!-- Reusable M&PC Sidebar Component -->
    @include('components.mpc-sidebar')

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
                    <span id="topbar-user-role" class="topbar-role-badge">{{ Auth::user()?->role?->role_name ?? 'Media and Public Communications Head' }}</span>
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
                    <div id="mobile-user-name" class="mobile-nav-name">{{ Auth::user()?->full_name ?? 'M&PC Head' }}</div>
                    <div id="mobile-user-role" class="mobile-nav-role">{{ Auth::user()?->role?->role_name ?? 'Media and Public Communications Head' }}</div>
                </div>
            </div>

            <div class="mobile-nav-links">
                <a href="{{ route('mpc.dashboard') }}" class="mobile-nav-link {{ request()->routeIs('mpc.dashboard') ? 'active' : '' }}">
                    <i class="fa-solid fa-chart-pie"></i>
                    <span>Dashboard</span>
                </a>
                <a href="{{ route('mpc.publish-article') }}" class="mobile-nav-link {{ request()->routeIs('mpc.publish-article*') ? 'active' : '' }}">
                    <i class="fa-solid fa-globe"></i>
                    <span>Publish Article</span>
                </a>
                <a href="{{ route('mpc.media-desk') }}" class="mobile-nav-link {{ request()->routeIs('mpc.media-desk*') ? 'active' : '' }}">
                    <i class="fa-regular fa-image"></i>
                    <span>Media Desk</span>
                </a>
                <a href="{{ route('mpc.submit-media') }}" class="mobile-nav-link {{ request()->routeIs('mpc.submit-media*') ? 'active' : '' }}">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    <span>Submit Media</span>
                </a>
                <a href="{{ route('mpc.manage-my-articles') }}" class="mobile-nav-link {{ request()->routeIs('mpc.manage-my-articles*') || request()->routeIs('mpc.my-articles*') ? 'active' : '' }}">
                    <i class="fa-solid fa-file-pen"></i>
                    <span>Manage My Articles</span>
                </a>
                <a href="{{ route('mpc.submit-article') }}" class="mobile-nav-link {{ request()->routeIs('mpc.submit-article*') ? 'active' : '' }}">
                    <i class="fa-solid fa-feather-pointed"></i>
                    <span>Submit article</span>
                </a>
                <a href="{{ route('mpc.activity-logs') }}" class="mobile-nav-link {{ request()->routeIs('mpc.activity-logs*') ? 'active' : '' }}">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                    <span>Activity log</span>
                </a>
                <a href="{{ route('mpc.transparency') }}" class="mobile-nav-link {{ request()->routeIs('mpc.transparency*') ? 'active' : '' }}">
                    <i class="fa-solid fa-file-invoice-dollar"></i>
                    <span>Transparency</span>
                </a>
            </div>

            <div class="mobile-nav-footer">
                <a href="{{ route('mpc.profile-settings') }}" class="mobile-nav-footer-link">
                    <i class="fa-solid fa-sliders"></i>
                    <span>Profile Settings</span>
                </a>
                <a href="{{ url('/') }}" target="_blank" rel="noopener noreferrer" class="mobile-nav-footer-link">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    <span>View public site</span>
                </a>
                <form action="{{ route('logout') }}" method="POST" style="margin: 0; padding: 0;">
                    @csrf
                    <button type="submit" id="mobile-logout-btn" class="mobile-nav-footer-link logout-btn" style="width: 100%; border: none; background: transparent; cursor: pointer; text-align: left;">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        <span>Logout</span>
                    </button>
                </form>
            </div>
        </nav>

        <!-- Dynamic Content Section -->
        @yield('content')

    </div>

    <!-- Global Floating Toast Notification Container -->
    <div id="toast-container" class="toast-container" aria-live="polite"></div>

    <!-- M&PC Shell Controller Script -->
    <script src="{{ asset('js/mpc-shell.js') }}"></script>
    @yield('extra-js')
    @stack('scripts')
</body>
</html>

