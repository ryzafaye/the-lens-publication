<!-- ==========================================================================
     THE LENS — REUSABLE MEDIA & PUBLIC COMMUNICATIONS (M&PC) SIDEBAR COMPONENT
     Shared across all M&PC Portal pages (Exact lens-ui Parity)
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
                <img id="sidebar-user-avatar" src="{{ asset('images/member-placeholder.svg') }}" alt="Avatar">
            </div>
            <div id="sidebar-user-name" class="profile-name">{{ Auth::user()?->full_name ?? 'M&PC Head' }}</div>
            <div id="sidebar-user-role" class="profile-role-text">{{ Auth::user()?->role?->role_name ?? 'M&PC Head' }}</div>
        </div>

        <!-- Navigation Links matching lens-ui mpc-sidebar.html -->
        <nav class="sidebar-nav" aria-label="Main Navigation">
            <a href="{{ route('mpc-head.dashboard') }}" class="sidebar-nav-item {{ request()->routeIs('mpc-head.dashboard*') ? 'active active-manual' : '' }}" data-page="mpc-dashboard.html">
                <i class="fa-solid fa-chart-pie"></i>
                <span>Dashboard</span>
            </a>

            <a href="{{ route('mpc-head.publish-article') }}" class="sidebar-nav-item {{ request()->routeIs('mpc-head.publish-article*') ? 'active active-manual' : '' }}" data-page="mpc-publish-article.html">
                <i class="fa-solid fa-globe"></i>
                <span>Publish Article</span>
            </a>

            <a href="{{ route('mpc-head.media-desk') }}" class="sidebar-nav-item {{ request()->routeIs('mpc-head.media-desk*') ? 'active active-manual' : '' }}" data-page="mpc-media-desk.html">
                <i class="fa-regular fa-image"></i>
                <span>Media Desk</span>
            </a>

            <a href="{{ route('mpc-head.submit-media') }}" class="sidebar-nav-item {{ request()->routeIs('mpc-head.submit-media*') ? 'active active-manual' : '' }}" data-page="mpc-submit-media.html">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <span>Submit Media</span>
            </a>

            <a href="{{ route('mpc-head.manage-my-articles') }}" class="sidebar-nav-item {{ request()->routeIs('mpc-head.manage-my-articles*') ? 'active active-manual' : '' }}" data-page="mpc-manage-my-articles.html">
                <i class="fa-solid fa-file-pen"></i>
                <span>Manage My Articles</span>
            </a>

            <a href="{{ route('mpc-head.submit-article') }}" class="sidebar-nav-item {{ request()->routeIs('mpc-head.submit-article*') ? 'active active-manual' : '' }}" data-page="mpc-submit-article.html">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>Submit article</span>
            </a>

            <a href="{{ route('mpc-head.activity-logs') }}" class="sidebar-nav-item {{ request()->routeIs('mpc-head.activity-logs*') ? 'active active-manual' : '' }}" data-page="mpc-activity-logs.html">
                <i class="fa-solid fa-clock-rotate-left"></i>
                <span>Activity log</span>
            </a>

            <a href="{{ route('mpc-head.transparency') }}" class="sidebar-nav-item {{ request()->routeIs('mpc-head.transparency*') ? 'active active-manual' : '' }}" data-page="mpc-transparency.html">
                <i class="fa-solid fa-file-invoice-dollar"></i>
                <span>Transparency</span>
            </a>
        </nav>
    </div>

    <!-- Bottom of Sidebar: Profile Settings, View Public Site, Logout -->
    <div class="sidebar-footer" id="sidebar-footer">
        <a href="{{ route('mpc-head.profile-settings') }}" class="sidebar-footer-link {{ request()->routeIs('mpc-head.profile-settings*') ? 'active' : '' }}" data-page="mpc-profile-settings.html">
            <i class="fa-solid fa-sliders"></i>
            <span>Profile Settings</span>
        </a>

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
