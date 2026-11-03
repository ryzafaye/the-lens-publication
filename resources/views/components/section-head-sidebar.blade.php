<aside id="sidebar" class="sidebar" aria-label="Section Head Portal Sidebar">
    <div class="sidebar-top-section">
        <div class="sidebar-header">
            <div class="sidebar-brand-lockup">
                <div class="sidebar-logo-square">
                    <img src="{{ asset('images/logo.jpg') }}" alt="The Lens Logo">
                </div>
                <span class="sidebar-brand-name">The Lens Publication</span>
            </div>
        </div>

        <div class="sidebar-profile">
            <div class="profile-avatar">
                <img id="sidebar-avatar-img" src="{{ Auth::user()->profile_picture_url ? asset(Auth::user()->profile_picture_url) : asset('images/member-placeholder.svg') }}" alt="Section Head Avatar">
            </div>
            <div id="sidebar-user-name" class="profile-name">{{ Auth::user()->full_name ?? 'Section Head' }}</div>
            <div id="sidebar-user-role" class="profile-role-text">{{ Auth::user()->role->role_name ?? 'Section Head' }}</div>
        </div>

        <nav class="sidebar-nav" aria-label="Section Head Navigation">
            <a href="{{ route('section-head.dashboard') }}" class="sidebar-nav-item {{ request()->routeIs('section-head.dashboard') ? 'active' : '' }}">
                <i class="fa-solid fa-chart-pie"></i>
                <span>Dashboard</span>
            </a>

            <a href="{{ route('section-head.manage-my-articles') }}" class="sidebar-nav-item {{ request()->routeIs('section-head.manage-my-articles') ? 'active' : '' }}">
                <i class="fa-solid fa-file-pen"></i>
                <span>Manage My Articles</span>
            </a>

            <a href="{{ route('section-head.review-articles') }}" class="sidebar-nav-item {{ request()->routeIs('section-head.review-articles') ? 'active' : '' }}">
                <i class="fa-solid fa-clipboard-check"></i>
                <span>Review Article</span>
            </a>

            <a href="{{ route('section-head.submit-article') }}" class="sidebar-nav-item {{ request()->routeIs('section-head.submit-article') ? 'active' : '' }}">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>Submit article</span>
            </a>

            <a href="{{ route('section-head.activity-logs') }}" class="sidebar-nav-item {{ request()->routeIs('section-head.activity-logs') ? 'active' : '' }}">
                <i class="fa-solid fa-clock-rotate-left"></i>
                <span>Activity log</span>
            </a>
        </nav>
    </div>

    <div class="sidebar-footer">
        <a href="{{ route('section-head.profile-settings') }}" class="sidebar-footer-link {{ request()->is('section-head/settings*') ? 'active' : '' }}">
            <i class="fa-solid fa-sliders"></i>
            <span>Profile Settings</span>
        </a>

        <a href="/" target="_blank" rel="noopener noreferrer" class="sidebar-footer-link">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            <span>View public site</span>
        </a>

        <form action="{{ route('logout') }}" method="POST" style="width: 100%; margin: 0; padding: 0;">
            @csrf
            <button type="submit" id="logout-btn" class="sidebar-footer-link logout-btn">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Logout</span>
            </button>
        </form>
    </div>
</aside>
