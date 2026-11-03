<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Editor-in-Chief Dashboard') | The Lens</title>

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
            const rawRole = "{!! Auth::user()->role->role_name ?? 'Editor-in-Chief' !!}";
            const userName = "{!! Auth::user()->full_name ?? 'Editor-in-Chief' !!}";
            const studentNum = "{!! Auth::user()->student_number ?? '' !!}";

            window.LARAVEL_USER_ROLE = rawRole;
            window.LARAVEL_USER_NAME = userName;

            localStorage.setItem('userRole', rawRole);
            localStorage.setItem('userName', userName);
            localStorage.setItem('studentNumber', studentNum);
            localStorage.setItem('eicRole', rawRole);
            localStorage.setItem('eicName', userName);
            localStorage.setItem('eicStudentNumber', studentNum);
        @endauth
    </script>
</head>
<body class="dashboard-body">

    <!-- Reusable EIC Sidebar Component -->
    @include('components.eic-sidebar')

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
                    <span id="topbar-user-role" class="topbar-role-badge">{{ Auth::user()?->role?->role_name ?? 'Editor-in-Chief' }}</span>
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
                    <div id="mobile-user-name" class="mobile-nav-name">{{ Auth::user()?->full_name ?? 'Editor-in-Chief' }}</div>
                    <div id="mobile-user-role" class="mobile-nav-role">{{ Auth::user()?->role?->role_name ?? 'Editor-in-Chief' }}</div>
                </div>
            </div>

            <div class="mobile-nav-links">
                <a href="{{ route('eic.dashboard') }}" class="mobile-nav-link {{ request()->routeIs('eic.dashboard') ? 'active' : '' }}">
                    <i class="fa-solid fa-chart-pie"></i>
                    <span>Dashboard</span>
                </a>
                <a href="{{ route('eic.manage-articles') }}" class="mobile-nav-link {{ request()->routeIs('eic.manage-articles*') ? 'active' : '' }}">
                    <i class="fa-regular fa-newspaper"></i>
                    <span>Manage Articles</span>
                </a>
                <a href="{{ route('eic.manage-my-articles') }}" class="mobile-nav-link {{ request()->routeIs('eic.manage-my-articles*') ? 'active' : '' }}">
                    <i class="fa-solid fa-file-pen"></i>
                    <span>Manage My Articles</span>
                </a>
                <a href="{{ route('eic.review-articles') }}" class="mobile-nav-link {{ request()->routeIs('eic.review-articles*') ? 'active' : '' }}">
                    <i class="fa-solid fa-clipboard-check"></i>
                    <span>Review Article</span>
                </a>
                <a href="{{ route('eic.submit-article') }}" class="mobile-nav-link {{ request()->routeIs('eic.submit-article*') ? 'active' : '' }}">
                    <i class="fa-solid fa-feather-pointed"></i>
                    <span>Submit article</span>
                </a>
                <a href="{{ route('eic.manage-accounts') }}" class="mobile-nav-link {{ request()->routeIs('eic.manage-accounts*') ? 'active' : '' }}">
                    <i class="fa-solid fa-user-group"></i>
                    <span>Manage Accounts</span>
                </a>
                <a href="{{ route('eic.activity-logs') }}" class="mobile-nav-link {{ request()->routeIs('eic.activity-logs*') ? 'active' : '' }}">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                    <span>Activity log</span>
                </a>
                <a href="{{ route('eic.transparency') }}" class="mobile-nav-link {{ request()->routeIs('eic.transparency*') ? 'active' : '' }}">
                    <i class="fa-solid fa-file-invoice-dollar"></i>
                    <span>Transparency</span>
                </a>
                <a href="{{ route('eic.feedback-inbox') }}" class="mobile-nav-link {{ request()->routeIs('eic.feedback-inbox*') ? 'active' : '' }}">
                    <i class="fa-regular fa-comments"></i>
                    <span>Feedback</span>
                </a>
            </div>

            <div class="mobile-nav-footer">
                <a href="{{ route('eic.profile-settings') }}" class="mobile-nav-footer-link {{ request()->routeIs('eic.profile-settings*') ? 'active' : '' }}">
                    <i class="fa-solid fa-sliders"></i>
                    <span>Profile Settings</span>
                </a>
                <a href="{{ url('/') }}" target="_blank" rel="noopener noreferrer" class="mobile-nav-footer-link">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    <span>View public site</span>
                </a>
                <button type="button" id="mobile-logout-btn" class="mobile-nav-footer-link mobile-logout-btn">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>Logout</span>
                </button>
            </div>
        </nav>

        <!-- Main Content Area -->
        @yield('content')

    </div>

    <!-- Hidden Logout Form for Modal/JS trigger -->
    <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
        @csrf
    </form>

    <!-- Toast Notification Container -->
    <div id="toast-container" class="toast-container" aria-live="polite"></div>

    <!-- Reusable EIC Shell Controller (Navigation, Role, Clock, Mobile Burger) -->
    <script src="{{ asset('js/eic-shell.js') }}"></script>
    @yield('extra-js')
    @stack('scripts')
</body>
</html>

