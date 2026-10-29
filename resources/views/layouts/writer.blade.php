<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Writer Portal') | The Lens</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,600;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- I-link mo rito ang mga CSS files mula sa public folder -->
    <link rel="stylesheet" href="{{ asset('css/executive-dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-modals.css') }}">
    <link rel="stylesheet" href="{{ asset('css/writer-dashboard.css') }}">
    @yield('extra-css')
</head>
<body class="dashboard-body">

    @include('components.writer-sidebar')

    <div class="main-wrapper">
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
                <button type="button" class="topbar-notification-btn">
                    <span class="notification-icon-wrapper">
                        <i class="fa-regular fa-bell"></i>
                        <span class="notification-badge-dot"></span>
                    </span>
                    <span class="notification-label">Notification</span>
                </button>
                <div class="topbar-divider"></div>
                <div class="topbar-user-profile">
                    <div class="topbar-avatar-circle">
                        <img src="{{ asset('images/member-placeholder.svg') }}" alt="User">
                    </div>
                    <span id="topbar-user-role" class="topbar-role-badge">Writer</span>
                </div>
            </div>
        </header>

        <!-- Dynamic Content Section -->
        @yield('content')

    </div>

    <!-- Ginagamit ng Writer ang parehong shell ng Executive para sa Menu/Clock -->
    <script src="{{ asset('js/executive-shell.js') }}"></script>
    @yield('extra-js')
</body>
</html>