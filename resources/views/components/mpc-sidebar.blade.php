<!-- ==========================================================================
     THE LENS — REUSABLE MEDIA & PUBLIC COMMUNICATIONS (M&PC) SIDEBAR COMPONENT
     Shared across all M&PC Portal pages
     ========================================================================== -->
<aside id="sidebar" class="sidebar" aria-label="Media &amp; Public Communications Portal Sidebar">
    
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
                <img id="sidebar-user-avatar" src="{{ Auth::user()?->avatar_url ?? (Auth::user()?->avatar ? asset(Auth::user()->avatar) : asset('images/member-placeholder.svg')) }}" alt="{{ Auth::user()?->full_name ?? 'User' }} Avatar">
            </div>
            <div id="sidebar-user-name" class="profile-name">{{ Auth::user()?->full_name ?? 'M&PC Head' }}</div>
            <div id="sidebar-user-role" class="profile-role-text">{{ Auth::user()?->role?->role_name ?? 'Media and Public Communications Head' }}</div>
        </div>

        <!-- Navigation Links -->
        <nav class="sidebar-nav" aria-label="Main Navigation">
            <a href="{{ route('mpc.dashboard') }}" class="sidebar-nav-item {{ request()->routeIs('mpc.dashboard') ? 'active' : '' }}">
                <i class="fa-solid fa-chart-pie"></i>
                <span>Dashboard</span>
            </a>

            <a href="{{ route('mpc.publish-article') }}" class="sidebar-nav-item {{ request()->routeIs('mpc.publish-article*') ? 'active' : '' }}">
                <i class="fa-solid fa-globe"></i>
                <span>Publish Article</span>
            </a>

            <a href="{{ route('mpc.media-desk') }}" class="sidebar-nav-item {{ request()->routeIs('mpc.media-desk*') ? 'active' : '' }}">
                <i class="fa-regular fa-image"></i>
                <span>Media Desk</span>
            </a>

            <a href="{{ route('mpc.submit-media') }}" class="sidebar-nav-item {{ request()->routeIs('mpc.submit-media*') ? 'active' : '' }}">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <span>Submit Media</span>
            </a>

            <a href="{{ route('mpc.manage-my-articles') }}" class="sidebar-nav-item {{ request()->routeIs('mpc.manage-my-articles*') || request()->routeIs('mpc.my-articles*') ? 'active' : '' }}">
                <i class="fa-solid fa-file-pen"></i>
                <span>Manage My Articles</span>
            </a>

            <a href="{{ route('mpc.submit-article') }}" class="sidebar-nav-item {{ request()->routeIs('mpc.submit-article*') ? 'active' : '' }}">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>Submit article</span>
            </a>

            <a href="{{ route('mpc.activity-logs') }}" class="sidebar-nav-item {{ request()->routeIs('mpc.activity-logs*') ? 'active' : '' }}">
                <i class="fa-solid fa-clock-rotate-left"></i>
                <span>Activity log</span>
            </a>

            <a href="{{ route('mpc.transparency') }}" class="sidebar-nav-item {{ request()->routeIs('mpc.transparency*') ? 'active' : '' }}">
                <i class="fa-solid fa-file-invoice-dollar"></i>
                <span>Transparency</span>
            </a>
        </nav>
    </div>

    <!-- Bottom of Sidebar: Profile Settings, View Public Site, Logout -->
    <div class="sidebar-footer" id="sidebar-footer">
        <a href="{{ route('mpc.profile-settings') }}" class="sidebar-footer-link {{ request()->routeIs('mpc.profile-settings*') ? 'active' : '' }}">
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

