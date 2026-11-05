<!-- ==========================================================================
     THE LENS — REUSABLE EXECUTIVE SIDEBAR COMPONENT
     Shared across all Executive Portal & Section Head pages with strict RBAC
     ========================================================================== -->
<aside id="sidebar" class="sidebar" aria-label="Executive Portal Sidebar">
    
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
                <img id="sidebar-user-avatar" src="{{ Auth::user()?->avatar_url ?? (Auth::user()?->avatar ? asset(Auth::user()->avatar) : asset('images/member-placeholder.svg')) }}" alt="{{ Auth::user()?->full_name ?? 'Executive' }} Avatar">
            </div>
            <div class="profile-name">{{ Auth::user()?->full_name ?? 'Executive' }}</div>
            <div id="sidebar-user-role" class="profile-role-text">{{ Auth::user()?->role?->role_name ?? 'Officer' }}</div>
        </div>

        @php
            $portalPrefix = request()->is('section-head*') ? 'section-head' : 'executive';
            $userRole = Auth::user()?->role?->role_name ?? '';
            $isPresOrVp = in_array($userRole, ['President', 'Vice President', 'Executive Vice President']);
        @endphp

        <!-- Navigation Links with Strict RBAC -->
        <nav class="sidebar-nav" aria-label="Main Navigation">
            <a href="{{ url($portalPrefix . '/dashboard') }}" class="sidebar-nav-item {{ request()->is('*/dashboard') || request()->routeIs('*.dashboard') ? 'active' : '' }}">
                <i class="fa-solid fa-chart-pie"></i>
                <span>Dashboard</span>
            </a>

            {{-- Manage Articles: Restricted to President and Vice President --}}
            @if($isPresOrVp)
                <a href="{{ route('executive.manage-articles') }}" class="sidebar-nav-item {{ request()->is('executive/manage-articles*') || request()->routeIs('executive.manage-articles*') ? 'active' : '' }}">
                    <i class="fa-regular fa-newspaper"></i>
                    <span>Manage Articles</span>
                </a>
            @endif

            <a href="{{ url($portalPrefix . '/manage-my-articles') }}" class="sidebar-nav-item {{ request()->is('*/my-articles*') || request()->is('*/manage-my-articles*') || request()->routeIs('*.manage-my-articles*') ? 'active' : '' }}">
                <i class="fa-solid fa-file-pen"></i>
                <span>Manage My Articles</span>
            </a>

            {{-- Review Article: Restricted to President, Vice President, and Section Heads (for their desk) --}}
            @if($isPresOrVp || request()->is('section-head*'))
                <a href="{{ url($portalPrefix . '/review-articles') }}" class="sidebar-nav-item {{ request()->is('*/review-articles*') || request()->routeIs('*.review-articles*') || request()->routeIs('*.review-article*') ? 'active' : '' }}">
                    <i class="fa-solid fa-clipboard-check"></i>
                    <span>Review Article</span>
                </a>
            @endif

            <a href="{{ url($portalPrefix . '/submit-article') }}" class="sidebar-nav-item {{ request()->is('*/submit-article*') || request()->routeIs('*.submit-article*') ? 'active' : '' }}">
                <i class="fa-solid fa-feather-pointed"></i>
                <span>Submit article</span>
            </a>

            {{-- Manage Accounts: Restricted to President and Vice President --}}
            @if($isPresOrVp)
                <a href="{{ route('executive.manage-accounts') }}" class="sidebar-nav-item {{ request()->is('executive/manage-accounts*') || request()->routeIs('executive.manage-accounts*') ? 'active' : '' }}">
                    <i class="fa-solid fa-user-group"></i>
                    <span>Manage Accounts</span>
                </a>
            @endif

            <a href="{{ url($portalPrefix . '/activity-logs') }}" class="sidebar-nav-item {{ request()->is('*/activity-logs*') || request()->routeIs('*.activity-logs*') ? 'active' : '' }}">
                <i class="fa-solid fa-clock-rotate-left"></i>
                <span>Activity log</span>
            </a>

            @if(!request()->is('section-head*'))
                <a href="{{ route('executive.transparency') }}" class="sidebar-nav-item {{ request()->is('executive/transparency*') || request()->routeIs('executive.transparency*') ? 'active' : '' }}">
                    <i class="fa-solid fa-file-invoice-dollar"></i>
                    <span>Transparency</span>
                </a>
            @endif

            {{-- Feedback: Restricted to President and Vice President --}}
            @if($isPresOrVp)
                <a href="{{ route('executive.feedback') }}" class="sidebar-nav-item {{ request()->is('executive/feedback*') || request()->routeIs('executive.feedback*') ? 'active' : '' }}">
                    <i class="fa-regular fa-comments"></i>
                    <span>Feedback</span>
                </a>
            @endif
        </nav>
    </div>

    <!-- Bottom of Sidebar: Profile Settings, View Public Site, Logout -->
    <div class="sidebar-footer" id="sidebar-footer">
        <a href="{{ url($portalPrefix . '/profile-settings') }}" class="sidebar-footer-link {{ request()->is('*/profile-settings*') || request()->is('*/settings*') || request()->routeIs('*.profile-settings*') ? 'active' : '' }}">
            <i class="fa-solid fa-sliders"></i>
            <span>Profile Settings</span>
        </a>

        <a href="{{ url('/') }}" target="_blank" rel="noopener noreferrer" class="sidebar-footer-link">
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
