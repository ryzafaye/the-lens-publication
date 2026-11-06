<!-- ==========================================================================
     THE LENS — REUSABLE EDITOR-IN-CHIEF (EIC) SIDEBAR COMPONENT
     Shared across all EIC Portal pages
     ========================================================================== -->
<aside id="sidebar" class="sidebar" aria-label="Editor-in-Chief Portal Sidebar">
    
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
            <div id="sidebar-user-name" class="profile-name">{{ Auth::user()?->full_name ?? 'Editor-in-Chief' }}</div>
            <div id="sidebar-user-role" class="profile-role-text">{{ Auth::user()?->role?->role_name ?? 'Editor-in-Chief' }}</div>
        </div>

        <!-- Navigation Links -->
        <nav class="sidebar-nav" aria-label="Main Navigation">
            <a href="{{ route('eic.dashboard') }}" class="sidebar-nav-item {{ request()->routeIs('eic.dashboard') ? 'active active-manual' : '' }}" data-page="eic-dashboard.html">
                <i class="fa-solid fa-chart-pie"></i>
                <span>Dashboard</span>
            </a>

            <a href="{{ route('eic.manage-articles') }}" class="sidebar-nav-item {{ request()->routeIs('eic.manage-articles*') ? 'active active-manual' : '' }}" data-page="eic-manage-articles.html">
                <i class="fa-regular fa-newspaper"></i>
                <span>Manage Articles</span>
            </a>

            <a href="{{ route('eic.manage-my-articles') }}" class="sidebar-nav-item {{ request()->routeIs('eic.manage-my-articles*') ? 'active active-manual' : '' }}" data-page="eic-manage-my-articles.html">
                <i class="fa-solid fa-file-pen"></i>
                <span>Manage My Articles</span>
            </a>

            <a href="{{ route('eic.review-articles') }}" class="sidebar-nav-item {{ request()->routeIs('eic.review-articles*') ? 'active active-manual' : '' }}" data-page="eic-review-articles.html">
                <i class="fa-solid fa-clipboard-check"></i>
                <span>Review Article</span>
            </a>

            <a href="{{ route('eic.media-desk') }}" class="sidebar-nav-item {{ request()->routeIs('eic.media-desk*') ? 'active active-manual' : '' }}" data-page="eic-media-desk.html">
                <i class="fa-regular fa-image"></i>
                <span>Media Desk</span>
            </a>

            <a href="{{ route('eic.submit-article') }}" class="sidebar-nav-item {{ request()->routeIs('eic.submit-article*') ? 'active active-manual' : '' }}" data-page="eic-submit-article.html">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>Submit article</span>
            </a>

            <a href="{{ route('eic.manage-accounts') }}" class="sidebar-nav-item {{ request()->routeIs('eic.manage-accounts*') ? 'active active-manual' : '' }}" data-page="eic-manage-accounts.html">
                <i class="fa-solid fa-user-group"></i>
                <span>Manage Accounts</span>
            </a>

            <a href="{{ route('eic.activity-logs') }}" class="sidebar-nav-item {{ request()->routeIs('eic.activity-logs*') ? 'active active-manual' : '' }}" data-page="eic-activity-logs.html">
                <i class="fa-solid fa-clock-rotate-left"></i>
                <span>Activity log</span>
            </a>

            <a href="{{ route('eic.transparency') }}" class="sidebar-nav-item {{ request()->routeIs('eic.transparency*') ? 'active active-manual' : '' }}" data-page="eic-transparency.html">
                <i class="fa-solid fa-file-invoice-dollar"></i>
                <span>Transparency</span>
            </a>

            <a href="{{ route('eic.feedback-inbox') }}" class="sidebar-nav-item {{ request()->routeIs('eic.feedback-inbox*') ? 'active active-manual' : '' }}" data-page="eic-feedback-inbox.html">
                <i class="fa-regular fa-comments"></i>
                <span>Feedback</span>
            </a>
        </nav>
    </div>

    <!-- Bottom of Sidebar: Profile Settings, View Public Site, Logout -->
    <div class="sidebar-footer" id="sidebar-footer">
        <a href="{{ route('eic.profile-settings') }}" class="sidebar-footer-link {{ request()->routeIs('eic.profile-settings*') ? 'active active-manual' : '' }}" data-page="eic-profile-settings.html">
            <i class="fa-solid fa-sliders"></i>
            <span>Profile Settings</span>
        </a>

        <a href="{{ url('/') }}" target="_blank" rel="noopener noreferrer" class="sidebar-footer-link">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            <span>View public site</span>
        </a>

        <form action="{{ route('logout') }}" method="POST" style="margin: 0; padding: 0; width: 100%;">
            @csrf
            <button type="submit" id="logout-btn" class="sidebar-footer-link logout-btn" style="width: 100%; border: none; background: transparent; cursor: pointer; text-align: left;">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Logout</span>
            </button>
        </form>
    </div>

</aside>

