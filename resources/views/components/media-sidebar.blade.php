<!-- ==========================================================================
     THE LENS — REUSABLE MEDIA & COMMUNICATION SIDEBAR COMPONENT
     Shared across all Media & Communication Team Portal pages
     ========================================================================== -->
<aside id="sidebar" class="sidebar" aria-label="Media &amp; Communication Portal Sidebar">
    
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
                <img id="sidebar-user-avatar" src="{{ Auth::user()?->avatar_url ?? (Auth::user()?->avatar ? asset(Auth::user()->avatar) : asset('images/member-placeholder.svg')) }}" alt="{{ Auth::user()?->full_name ?? 'Media Team' }} Avatar">
            </div>
            <div id="sidebar-user-name" class="profile-name">{{ Auth::user()?->full_name ?? 'Media & Communication' }}</div>
            <div id="sidebar-user-role" class="profile-role-text">{{ Auth::user()?->role?->role_name ?? 'Media & Communication' }}</div>
        </div>

        <!-- Navigation Links -->
        <nav class="sidebar-nav" aria-label="Media Portal Navigation">
            <a href="{{ route('media.dashboard') }}" class="sidebar-nav-item {{ request()->routeIs('media.dashboard') ? 'active' : '' }}">
                <i class="fa-solid fa-chart-pie"></i>
                <span>Dashboard</span>
            </a>

            <a href="{{ route('media.submit-article') }}" class="sidebar-nav-item {{ request()->routeIs('media.submit-article*') ? 'active' : '' }}">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>Submit Article</span>
            </a>

            <a href="{{ route('media.manage-articles') }}" class="sidebar-nav-item {{ request()->routeIs('media.manage-articles*') || request()->routeIs('media.manage-my-articles*') ? 'active' : '' }}">
                <i class="fa-regular fa-newspaper"></i>
                <span>Manage My Articles</span>
            </a>

            <a href="{{ route('media.submit-media') }}" class="sidebar-nav-item {{ request()->routeIs('media.submit-media*') ? 'active' : '' }}">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <span>Submit Media</span>
            </a>

            <a href="{{ route('media.manage-media') }}" class="sidebar-nav-item {{ request()->routeIs('media.manage-media*') ? 'active' : '' }}">
                <i class="fa-solid fa-images"></i>
                <span>Manage Media</span>
            </a>
        </nav>
    </div>

    <!-- Bottom of Sidebar: Profile Settings, View Public Site, Logout -->
    <div class="sidebar-footer" id="sidebar-footer">
        <a href="{{ route('media.profile-settings') }}" class="sidebar-footer-link {{ request()->routeIs('media.profile-settings*') ? 'active' : '' }}">
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

