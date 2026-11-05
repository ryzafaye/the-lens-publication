<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Executive Portal') | The Lens</title>

    <!-- Typography & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,600;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- CSS -->
    <link rel="stylesheet" href="{{ asset('css/executive-dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-modals.css') }}">
    @yield('extra-css')
    @stack('styles')

    <script>
        @auth
            const rawRole = "{!! Auth::user()->role->role_name ?? 'News Head' !!}";
            const userName = "{!! Auth::user()->full_name ?? 'Section Head' !!}";
            
            // Exact mapping from Database Role to Dropdown Value
            let derivedSection = rawRole.replace(/ Head/i, '').trim();
            
            if (derivedSection.toLowerCase() === 'literary') {
                derivedSection = 'Literature';
            } else if (derivedSection.toLowerCase() === 'science and technology') {
                derivedSection = 'Science & Technology';
            } else if (derivedSection.toLowerCase() === 'opinion') {
                derivedSection = 'Opinion';
            } else if (derivedSection.toLowerCase() === 'feature') {
                derivedSection = 'Feature'; 
            }

            // Expose globally for the Vanilla JS to consume
            window.LARAVEL_USER_ROLE = rawRole;
            window.LARAVEL_USER_SECTION = derivedSection;

            // Sync for fallback logic in existing JS files
            localStorage.setItem('userRole', rawRole);
            localStorage.setItem('userName', userName);
            localStorage.setItem('sectionHeadRole', rawRole);
            localStorage.setItem('sectionHeadName', userName);
            localStorage.setItem('sectionHeadSection', derivedSection);
        @endauth
    </script>
</head>
<body class="dashboard-body">

    <!-- Executive Sidebar Component -->
    @include('components.executive-sidebar')

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
                        <img src="{{ Auth::user()?->avatar_url ?? (Auth::user()?->avatar ? asset(Auth::user()->avatar) : asset('images/member-placeholder.svg')) }}" alt="User Profile Picture">
                    </div>
                    <span id="topbar-user-role" class="topbar-role-badge">{{ Auth::user()?->role?->role_name ?? 'Executive' }}</span>
                </div>
            </div>
        </header>

        <!-- Mobile Navigation Menu Dropdown -->
        <nav id="mobile-nav-dropdown" class="mobile-nav-dropdown" aria-label="Mobile Navigation Menu">
            <div class="mobile-nav-profile">
                <div class="mobile-nav-avatar">
                    <img src="{{ Auth::user()?->avatar_url ?? (Auth::user()?->avatar ? asset(Auth::user()->avatar) : asset('images/member-placeholder.svg')) }}" alt="Avatar">
                </div>
                <div class="mobile-nav-user-info">
                    <div id="mobile-user-name" class="mobile-nav-name">{{ Auth::user()?->full_name ?? 'Executive' }}</div>
                    <div id="mobile-user-role" class="mobile-nav-role">{{ Auth::user()?->role?->role_name ?? 'Officer' }}</div>
                </div>
            </div>

            @php
                $portalPrefix = request()->is('section-head*') ? 'section-head' : 'executive';
                $userRole = Auth::user()?->role?->role_name ?? '';
                $isPresOrVp = in_array($userRole, ['President', 'Vice President', 'Executive Vice President']);
            @endphp
            <div class="mobile-nav-links">
                <a href="{{ url($portalPrefix . '/dashboard') }}" class="mobile-nav-link {{ request()->is('*/dashboard') || request()->routeIs('*.dashboard') ? 'active' : '' }}">
                    <i class="fa-solid fa-chart-pie"></i>
                    <span>Dashboard</span>
                </a>

                @if($isPresOrVp)
                <a href="{{ route('executive.manage-articles') }}" class="mobile-nav-link {{ request()->is('executive/manage-articles*') || request()->routeIs('executive.manage-articles*') ? 'active' : '' }}">
                    <i class="fa-regular fa-newspaper"></i>
                    <span>Manage Articles</span>
                </a>
                @endif

                <a href="{{ url($portalPrefix . '/manage-my-articles') }}" class="mobile-nav-link {{ request()->is('*/manage-my-articles*') || request()->is('*/my-articles*') || request()->routeIs('*.manage-my-articles*') ? 'active' : '' }}">
                    <i class="fa-solid fa-file-pen"></i>
                    <span>Manage My Articles</span>
                </a>

                @if($isPresOrVp || request()->is('section-head*'))
                <a href="{{ url($portalPrefix . '/review-articles') }}" class="mobile-nav-link {{ request()->is('*/review-articles*') || request()->routeIs('*.review-articles*') || request()->routeIs('*.review-article*') ? 'active' : '' }}">
                    <i class="fa-solid fa-clipboard-check"></i>
                    <span>Review Article</span>
                </a>
                @endif

                <a href="{{ url($portalPrefix . '/submit-article') }}" class="mobile-nav-link {{ request()->is('*/submit-article*') || request()->routeIs('*.submit-article*') ? 'active' : '' }}">
                    <i class="fa-solid fa-feather-pointed"></i>
                    <span>Submit article</span>
                </a>

                @if($isPresOrVp)
                <a href="{{ route('executive.manage-accounts') }}" class="mobile-nav-link {{ request()->is('executive/manage-accounts*') || request()->routeIs('executive.manage-accounts*') ? 'active' : '' }}">
                    <i class="fa-solid fa-user-group"></i>
                    <span>Manage Accounts</span>
                </a>
                @endif

                <a href="{{ url($portalPrefix . '/activity-logs') }}" class="mobile-nav-link {{ request()->is('*/activity-logs*') || request()->routeIs('*.activity-logs*') ? 'active' : '' }}">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                    <span>Activity log</span>
                </a>

                @if(!request()->is('section-head*'))
                <a href="{{ route('executive.transparency') }}" class="mobile-nav-link {{ request()->is('executive/transparency*') || request()->routeIs('executive.transparency*') ? 'active' : '' }}">
                    <i class="fa-solid fa-file-invoice-dollar"></i>
                    <span>Transparency</span>
                </a>
                @endif

                @if($isPresOrVp)
                <a href="{{ route('executive.feedback') }}" class="mobile-nav-link {{ request()->is('executive/feedback*') || request()->routeIs('executive.feedback*') ? 'active' : '' }}">
                    <i class="fa-regular fa-comments"></i>
                    <span>Feedback</span>
                </a>
                @endif
            </div>

            <div class="mobile-nav-footer">
                <a href="{{ url($portalPrefix . '/profile-settings') }}" class="mobile-nav-footer-link">
                    <i class="fa-solid fa-sliders"></i>
                    <span>Profile Settings</span>
                </a>
                <a href="/" target="_blank" rel="noopener noreferrer" class="mobile-nav-footer-link">
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

    <!-- Executive Shell Script for Menu and Clock -->
    <script src="{{ asset('js/executive-shell.js') }}"></script>
    @yield('extra-js')
    @stack('scripts')
</body>
</html>
