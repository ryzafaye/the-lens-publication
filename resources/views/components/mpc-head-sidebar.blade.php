<!-- ==========================================================================
     THE LENS — REUSABLE MEDIA & PUBLIC COMMUNICATIONS (M&PC) SIDEBAR COMPONENT
     Shared across all M&PC Portal pages
     ========================================================================== -->
<aside id="sidebar" class="sidebar" aria-label="Media & Public Communications Portal Sidebar">
    
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
                <img id="sidebar-user-avatar" src="{{ asset('images/member-placeholder.svg') }}" alt="Avatar">
            </div>
            <div id="sidebar-user-name" class="profile-name">{{ Auth::user()?->full_name ?? 'M&PC Head' }}</div>
            <div id="sidebar-user-role" class="profile-role-text">{{ Auth::user()?->role?->role_name ?? 'M&PC Head' }}</div>
        </div>

        <!-- Navigation Links -->
        <nav class="sidebar-nav" aria-label="Main Navigation">
            <a href="{{ route('mpc-head.dashboard') }}" class="sidebar-nav-item {{ request()->routeIs('mpc-head.dashboard*') ? 'active active-manual' : '' }}">
                <i class="fa-solid fa-chart-pie"></i>
                <span>Dashboard</span>
            </a>
        </nav>
    </div>

    <!-- Bottom of Sidebar: Profile Settings, View Public Site, Logout -->
    <div class="sidebar-footer" id="sidebar-footer">
        <a href="{{ url('/') }}" target="_blank" rel="noopener noreferrer" class="sidebar-footer-link">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            <span>View public site</span>
        </a>

        <button type="submit" form="logout-form" class="sidebar-footer-link logout-btn">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
        </button>
    </div>

</aside>
