<!-- ==========================================================================
     THE LENS — REUSABLE CARTOONIST SIDEBAR COMPONENT
     Shared across all Cartoonist Portal pages
     ========================================================================== -->
<aside id="sidebar" class="sidebar" aria-label="Cartoonist Portal Sidebar">
    
    <div class="sidebar-top-section">
        <!-- Brand Lockup -->
        <div class="sidebar-header">
            <div class="sidebar-brand-lockup">
                <div class="sidebar-logo-square">
                    <img src="{{ asset('images/logo.jpg') }}" alt="The Lens Logo">
                </div>
                <span class="sidebar-brand-name">The Lens Publication</span>
            </div>
        </div>

        <!-- Profile Section -->
        <div class="sidebar-profile">
            <div class="profile-avatar">
                <img id="sidebar-user-avatar" src="{{ Auth::user()?->avatar_url ?? (Auth::user()?->avatar ? asset(Auth::user()->avatar) : asset('images/member-placeholder.svg')) }}" alt="{{ Auth::user()?->full_name ?? 'Cartoonist' }} Avatar">
            </div>
            <div id="sidebar-user-name" class="profile-name">{{ Auth::user()?->full_name ?? 'Cartoonist' }}</div>
            <div id="sidebar-user-role" class="profile-role-text">{{ Auth::user()?->role?->role_name ?? 'Cartoonist' }}</div>
        </div>

        <!-- Navigation Links -->
        <nav class="sidebar-nav" aria-label="Cartoonist Portal Navigation">
            <a href="{{ route('cartoonist.dashboard') }}" class="sidebar-nav-item {{ request()->routeIs('cartoonist.dashboard') ? 'active' : '' }}">
                <i class="fa-solid fa-chart-pie"></i>
                <span>Dashboard</span>
            </a>

            <a href="{{ route('cartoonist.submit-article') }}" class="sidebar-nav-item {{ request()->routeIs('cartoonist.submit-article*') ? 'active' : '' }}">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>Submit Article</span>
            </a>

            <a href="{{ route('cartoonist.manage-articles') }}" class="sidebar-nav-item {{ request()->routeIs('cartoonist.manage-articles*') || request()->routeIs('cartoonist.manage-my-articles*') ? 'active' : '' }}">
                <i class="fa-regular fa-newspaper"></i>
                <span>Manage My Articles</span>
            </a>

            <a href="{{ route('cartoonist.submit-cartoon') }}" class="sidebar-nav-item {{ request()->routeIs('cartoonist.submit-cartoon*') ? 'active' : '' }}">
                <i class="fa-solid fa-paintbrush"></i>
                <span>Submit Cartoon</span>
            </a>

            <a href="{{ route('cartoonist.manage-cartoons') }}" class="sidebar-nav-item {{ request()->routeIs('cartoonist.manage-cartoons*') ? 'active' : '' }}">
                <i class="fa-solid fa-palette"></i>
                <span>Manage Cartoons</span>
            </a>
        </nav>
    </div>

    <!-- Bottom of Sidebar: Profile Settings, View Public Site, Logout -->
    <div class="sidebar-footer" id="sidebar-footer">
        <a href="{{ route('cartoonist.profile-settings') }}" class="sidebar-footer-link {{ request()->routeIs('cartoonist.profile-settings*') ? 'active' : '' }}">
            <i class="fa-solid fa-sliders"></i>
            <span>Profile Settings</span>
        </a>

        <a href="{{ url('/') }}" target="_blank" rel="noopener noreferrer" class="sidebar-footer-link">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            <span>View public site</span>
        </a>

        <form action="{{ route('logout') }}" method="POST" style="margin: 0; padding: 0;">
            @csrf
            <button type="submit" id="logout-btn" class="sidebar-footer-link logout-btn" style="width: 100%; border: none; background: transparent; cursor: pointer; text-align: left;">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Logout</span>
            </button>
        </form>
    </div>

</aside>

