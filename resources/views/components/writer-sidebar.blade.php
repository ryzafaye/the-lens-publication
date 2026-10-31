<aside id="sidebar" class="sidebar" aria-label="Writer Portal Sidebar">
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
                <img id="sidebar-avatar-img" src="{{ Auth::user()->profile_picture_url ? asset(Auth::user()->profile_picture_url) : asset('images/member-placeholder.svg') }}" alt="Writer Avatar">
            </div>
            <div id="sidebar-writer-name" class="profile-name">{{ Auth::user()->full_name ?? 'Writer' }}</div>
            <div id="sidebar-user-role" class="profile-role-text">{{ Auth::user()->role->role_name ?? 'Writer' }}</div>
        </div>

        <nav class="sidebar-nav" aria-label="Writer Portal Navigation">
            <a href="{{ route('writer.dashboard') }}" class="sidebar-nav-item {{ request()->routeIs('writer.dashboard') ? 'active' : '' }}">
                <i class="fa-solid fa-chart-pie"></i>
                <span>Dashboard</span>
            </a>
            <a href="/writer/submit-article" class="sidebar-nav-item {{ request()->is('writer/submit-article*') ? 'active' : '' }}">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>Submit Article</span>
            </a>
            <a href="{{ route('writer.manage-my-articles') }}" class="sidebar-nav-item {{ request()->routeIs('writer.manage-my-articles') || request()->is('writer/manage*') ? 'active' : '' }}">
                <i class="fa-regular fa-newspaper"></i>
                <span>Manage My Articles</span>
            </a>
        </nav>
    </div>

    <div class="sidebar-footer" id="sidebar-footer">
        <a href="{{ route('writer.profile-settings') }}" class="sidebar-footer-link {{ request()->is('writer/settings*') ? 'active' : '' }}">
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