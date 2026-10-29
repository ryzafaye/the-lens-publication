<aside id="sidebar" class="sidebar" aria-label="Executive Portal Sidebar">
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
                <img src="{{ asset('images/member-placeholder.svg') }}" alt="Avatar">
            </div>
            <div class="profile-name">{{ Auth::user()->full_name ?? 'Executive' }}</div>
            <div id="sidebar-user-role" class="profile-role-text">{{ Auth::user()->role->role_name ?? 'Officer' }}</div>
        </div>

        <nav class="sidebar-nav" aria-label="Main Navigation">
            <a href="{{ route('executive.dashboard') }}" class="sidebar-nav-item {{ request()->routeIs('executive.dashboard') ? 'active' : '' }}">
                <i class="fa-solid fa-chart-pie"></i>
                <span>Dashboard</span>
            </a>

            <a href="/executive/manage-articles" class="sidebar-nav-item {{ request()->is('executive/manage-articles*') ? 'active' : '' }}">
                <i class="fa-regular fa-newspaper"></i>
                <span>Manage Articles</span>
            </a>

            <a href="/executive/my-articles" class="sidebar-nav-item {{ request()->is('executive/my-articles*') ? 'active' : '' }}">
                <i class="fa-solid fa-file-pen"></i>
                <span>Manage My Articles</span>
            </a>

            <a href="/executive/review-articles" class="sidebar-nav-item {{ request()->is('executive/review-articles*') ? 'active' : '' }}">
                <i class="fa-solid fa-clipboard-check"></i>
                <span>Review Article</span>
            </a>

            <a href="/executive/submit-article" class="sidebar-nav-item {{ request()->is('executive/submit-article*') ? 'active' : '' }}">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>Submit article</span>
            </a>

            <!-- Example ng Limitasyon: Huwag ipakita ang Manage Accounts kung Secretary ang naka-login -->
            @if(in_array(Auth::user()->role->role_name, ['President', 'Executive Vice President']))
                <a href="/executive/manage-accounts" class="sidebar-nav-item {{ request()->is('executive/manage-accounts*') ? 'active' : '' }}">
                    <i class="fa-solid fa-user-group"></i>
                    <span>Manage Accounts</span>
                </a>
            @endif

            <a href="/executive/activity-logs" class="sidebar-nav-item {{ request()->is('executive/activity-logs*') ? 'active' : '' }}">
                <i class="fa-solid fa-clock-rotate-left"></i>
                <span>Activity log</span>
            </a>

            <a href="/executive/transparency" class="sidebar-nav-item {{ request()->is('executive/transparency*') ? 'active' : '' }}">
                <i class="fa-solid fa-file-invoice-dollar"></i>
                <span>Transparency</span>
            </a>

            <a href="/executive/feedback" class="sidebar-nav-item {{ request()->is('executive/feedback*') ? 'active' : '' }}">
                <i class="fa-regular fa-comments"></i>
                <span>Feedback</span>
            </a>
        </nav>
    </div>

    <div class="sidebar-footer" id="sidebar-footer">
        <a href="/executive/settings" class="sidebar-footer-link">
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