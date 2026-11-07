<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'The Lens Publication') | The Lens</title>

    <!-- Tailwind CDN & Custom Config -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="{{ asset('js/tailwind-config.js') }}"></script>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- FontAwesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Lens Public Styles -->
    <link rel="stylesheet" href="{{ asset('css/main.css') }}">
    @stack('styles')
</head>
<body class="@yield('body_class', 'bg-white text-stone-900 font-body antialiased min-h-screen flex flex-col')">

    @unless(View::hasSection('hide_header_footer'))
    <!-- Header Container -->
    <header id="header-container" class="site-header w-full font-body border-b border-stone-200 shadow-sm bg-white">
        <!-- Top Bar -->
        <div class="top-bar">
            <div class="top-bar-inner">
                <div class="top-bar-details">
                    <span class="top-bar-item date-item">
                        <i class="fa-regular fa-calendar" aria-hidden="true"></i>
                        <time id="current-date">{{ now()->format('l, F j, Y') }}</time>
                    </span>
                    <span class="top-bar-divider campus-divider" aria-hidden="true">|</span>
                    <span class="campus-name">
                        <i class="fa-solid fa-graduation-cap campus-icon" aria-hidden="true"></i>
                        <span>Polytechnic University of the Philippines – Biñan Campus</span>
                    </span>
                </div>
                <div class="top-bar-actions">
                    <a class="facebook-link" href="https://www.facebook.com/profile.php?id=61560889387183" data-publication-link="facebook" target="_blank" rel="noopener noreferrer" aria-label="The Lens Publication on Facebook" title="The Lens on Facebook">
                        <i class="fa-brands fa-facebook-f" aria-hidden="true"></i>
                    </a>
                    <a class="email-link" href="mailto:thelenspublicationpupbc@gmail.com" data-publication-link="email" aria-label="Email The Lens Publication" title="The Lens email">
                        <i class="fa-regular fa-envelope" aria-hidden="true"></i>
                    </a>
                    <span class="top-bar-divider login-divider" aria-hidden="true">|</span>
                    <a href="{{ route('login') }}" id="member-login-btn" class="member-login-btn">
                        <i class="fa-regular fa-user" aria-hidden="true"></i>
                        <span>Login as a Member</span>
                    </a>
                </div>
            </div>
        </div>

        <!-- Brand & Search Row -->
        <div class="brand-search-row">
            <button id="menu-button" class="mobile-menu-button" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="navigation">
                <span class="menu-glyph" aria-hidden="true">☰</span>
            </button>

            <a href="{{ route('public.home') }}" class="brand-lockup" aria-label="The Lens home">
                <img src="{{ asset('images/logo.jpg') }}" alt="The Lens logo" class="site-logo">
                <span class="brand-copy">
                    <span class="brand-name">THE LENS</span>
                    <span class="brand-tagline">Basta Lente, Abante!</span>
                </span>
            </a>

            <!-- Search Bar & Dropdown -->
            <div class="search-shell" id="global-search-shell">
                <form id="search-form" class="search-form" action="{{ route('public.archives') }}" method="GET" role="search">
                    <i class="fa-solid fa-magnifying-glass search-leading-icon" aria-hidden="true"></i>
                    <input type="search" id="search-input" name="q" value="{{ request('q') }}" class="search-input" placeholder="Search articles, authors, or topics…" aria-label="Search articles and authors" autocomplete="off">
                    <button type="button" id="sort-filter-btn" class="sort-filter-btn" aria-expanded="false" aria-controls="filter-dropdown">
                        <i class="fa-solid fa-sliders" aria-hidden="true"></i>
                        <span>Sort &amp; Filter</span>
                        <i class="fa-solid fa-chevron-down filter-chevron" aria-hidden="true"></i>
                    </button>

                    <!-- Filter Dropdown Panel -->
                    <div id="filter-dropdown" class="filter-dropdown hidden">
                        <div class="filter-panel-heading">
                            <span>Sort &amp; Filter</span>
                            <button type="button" id="close-filter-btn" class="icon-button" aria-label="Close filters">
                                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                            </button>
                        </div>
                        <div class="filter-grid">
                            <div class="filter-field">
                                <label for="sort-select">Sort by</label>
                                <select id="sort-select" name="sort" class="archive-select">
                                    <option value="newest" @selected(request('sort', 'newest') === 'newest')>Newest</option>
                                    <option value="oldest" @selected(request('sort') === 'oldest')>Oldest</option>
                                    <option value="popular" @selected(request('sort') === 'popular')>Most Viewed</option>
                                    <option value="az" @selected(request('sort') === 'az')>A-Z</option>
                                </select>
                            </div>
                            <div class="filter-field">
                                <label for="category-select">Category</label>
                                <select id="category-select" name="category" class="archive-select">
                                    <option value="All" @selected(request('category', 'All') === 'All')>All categories</option>
                                    <option value="News" @selected(request('category') === 'News')>News</option>
                                    <option value="Feature" @selected(request('category') === 'Feature')>Features</option>
                                    <option value="Opinion" @selected(request('category') === 'Opinion')>Opinion</option>
                                    <option value="Science & Technology" @selected(request('category') === 'Science & Technology')>Science &amp; Technology</option>
                                    <option value="Literature" @selected(request('category') === 'Literature')>Literature</option>
                                </select>
                            </div>
                            <div class="filter-field filter-date-field">
                                <label for="date-filter-type">Published date</label>
                                <div class="published-date-controls">
                                    <select id="date-filter-type" name="dateType" class="archive-select">
                                        <option value="any" @selected(request('dateType', 'any') === 'any')>Any date</option>
                                        <option value="today" @selected(request('dateType') === 'today')>Today</option>
                                        <option value="this_week" @selected(request('dateType') === 'this_week')>This week</option>
                                        <option value="choose" @selected(request('dateType') === 'choose')>Choose date</option>
                                    </select>
                                    <input type="date" id="date-filter-value" name="dateValue" value="{{ request('dateValue') }}" class="archive-select mt-2 @if(request('dateType') !== 'choose') hidden @endif">
                                </div>
                            </div>
                        </div>
                        <div class="filter-panel-footer">
                            <button type="button" id="clear-filters-btn" class="clear-filters-btn">Clear filters</button>
                            <button type="submit" class="apply-filters-btn">
                                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i> Apply
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Utility links -->
            <div class="header-utility-links" aria-label="Publication links">
                <a href="{{ route('public.about') }}" class="header-utility-link @if(request()->routeIs('public.about')) is-active @endif" data-header-action="about-us">
                    <i class="fa-regular fa-circle-question" aria-hidden="true"></i>
                    <span>About Us</span>
                </a>
                <a href="{{ route('public.feedback') }}" class="header-utility-link @if(request()->routeIs('public.feedback')) is-active @endif" data-header-action="send-feedback">
                    <i class="fa-regular fa-paper-plane" aria-hidden="true"></i>
                    <span>Send Feedback</span>
                </a>
            </div>
        </div>

        <div class="mobile-nav-backdrop" id="mobile-nav-backdrop" aria-hidden="true"></div>

        <!-- Navigation Bar -->
        <nav class="navigation" id="navigation" aria-label="Main navigation">
            <div class="navigation-inner">
                <div class="mobile-nav-top">
                    <span>Explore The Lens</span>
                    <button type="button" id="close-nav-btn" aria-label="Close navigation">
                        <span class="close-glyph" aria-hidden="true">×</span>
                    </button>
                </div>
                <ul class="nav-list">
                    <li><a href="{{ route('public.home') }}" class="nav-link @if(request()->routeIs('public.home')) is-active @endif">Home</a></li>
                    <li><a href="{{ route('public.category', 'latest') }}" class="nav-link @if(request()->is('category/latest') || request()->is('latest')) is-active @endif">Latest</a></li>
                    <li><a href="{{ route('public.category', 'news') }}" class="nav-link @if(request()->is('category/news') || request()->is('news')) is-active @endif">News</a></li>
                    <li><a href="{{ route('public.category', 'feature') }}" class="nav-link @if(request()->is('category/feature') || request()->is('category/features') || request()->is('features')) is-active @endif">Features</a></li>
                    <li><a href="{{ route('public.category', 'opinion') }}" class="nav-link @if(request()->is('category/opinion') || request()->is('opinion')) is-active @endif">Opinion</a></li>
                    <li><a href="{{ route('public.category', 'science-technology') }}" class="nav-link @if(request()->is('category/science*') || request()->is('science*')) is-active @endif">Science &amp; Technology</a></li>
                    <li><a href="{{ route('public.category', 'literature') }}" class="nav-link @if(request()->is('category/literature') || request()->is('literature')) is-active @endif">Literature</a></li>
                    <li><a href="{{ route('public.archives') }}" class="nav-link @if(request()->routeIs('public.archives')) is-active @endif">Archives</a></li>
                    <li class="mobile-only-nav-item"><a href="{{ route('public.about') }}" class="nav-link @if(request()->routeIs('public.about')) is-active @endif">About Us</a></li>
                    <li class="mobile-only-nav-item"><a href="{{ route('public.feedback') }}" class="nav-link @if(request()->routeIs('public.feedback')) is-active @endif"><span>Send Feedback</span></a></li>
                </ul>
                <div class="mobile-nav-socials" aria-label="Publication contact links">
                    <a href="https://www.facebook.com/profile.php?id=61560889387183" data-publication-link="facebook" target="_blank" rel="noopener noreferrer">
                        <i class="fa-brands fa-facebook-f" aria-hidden="true"></i>
                        <span>Visit Facebook Page</span>
                    </a>
                    <a href="mailto:thelenspublicationpupbc@gmail.com" data-publication-link="email">
                        <i class="fa-regular fa-envelope" aria-hidden="true"></i>
                        <span>Email The Lens</span>
                    </a>
                </div>
            </div>
        </nav>
    </header>
    @endunless

    @if(View::hasSection('hide_header_footer'))
        @yield('content')
    @else
        <!-- Main Content Area -->
        <main class="flex-grow">
            @yield('content')
        </main>

        <!-- Footer Container -->
        <footer id="footer-container" class="site-footer bg-[#1a050b] text-stone-300">
            <div class="footer-content max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div class="footer-brand-column">
                    <a href="{{ route('public.home') }}" class="footer-brand-lockup flex items-center gap-3 mb-3">
                        <img src="{{ asset('images/logo.jpg') }}" alt="The Lens logo" class="footer-brand-logo w-10 h-10 rounded-full border border-rose-900/40">
                        <span>
                            <strong class="footer-brand-name block text-white font-serif tracking-wider">THE LENS</strong>
                            <span class="footer-brand-tagline text-xs text-rose-300 italic">Basta Lente, Abante!</span>
                        </span>
                    </a>
                    <p class="footer-description text-xs text-white leading-relaxed">
                        The Official Student Journalism Body of Polytechnic University of the Philippines – Biñan Campus.
                    </p>
                </div>
                <div>
                    <h3 class="footer-heading text-sm font-semibold text-white uppercase tracking-wider mb-3">Explore</h3>
                    <div class="flex flex-col space-y-2 text-xs text-stone-400">
                        <a href="{{ route('public.category', 'news') }}" class="footer-link hover:text-white transition-colors">News</a>
                        <a href="{{ route('public.category', 'feature') }}" class="footer-link hover:text-white transition-colors">Features</a>
                        <a href="{{ route('public.category', 'opinion') }}" class="footer-link hover:text-white transition-colors">Opinion</a>
                        <a href="{{ route('public.category', 'science-technology') }}" class="footer-link hover:text-white transition-colors">Science &amp; Technology</a>
                        <a href="{{ route('public.category', 'literature') }}" class="footer-link hover:text-white transition-colors">Literature</a>
                    </div>
                </div>
                <div>
                    <h3 class="footer-heading text-sm font-semibold text-white uppercase tracking-wider mb-3">The Publication</h3>
                    <div class="flex flex-col space-y-2 text-xs text-stone-400">
                        <a href="{{ route('public.about') }}" class="footer-link hover:text-white transition-colors">About The Lens</a>
                        <a href="{{ route('public.members') }}" class="footer-link hover:text-white transition-colors">Our Members</a>
                        <a href="{{ route('public.about') }}#documents" class="footer-link hover:text-white transition-colors">Financial Records &amp; Documents</a>
                        <a href="{{ route('public.archives') }}" class="footer-link hover:text-white transition-colors">Article Archives</a>
                    </div>
                </div>
                <div id="footer-contact">
                    <h3 class="footer-heading text-sm font-semibold text-white uppercase tracking-wider mb-3">Contact &amp; Socials</h3>
                    <div class="flex flex-col space-y-2 text-xs text-stone-400">
                        <a href="https://www.facebook.com/profile.php?id=61560889387183" data-publication-link="facebook" target="_blank" rel="noopener noreferrer" class="footer-link hover:text-white transition-colors flex items-center gap-2">
                            <i class="fa-brands fa-facebook-f text-rose-400" aria-hidden="true"></i>
                            <span>Facebook Page</span>
                        </a>
                        <a href="mailto:thelenspublicationpupbc@gmail.com" data-publication-link="email" class="footer-link hover:text-white transition-colors flex items-center gap-2">
                            <i class="fa-regular fa-envelope text-rose-400" aria-hidden="true"></i>
                            <span>Email The Lens</span>
                        </a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom border-t border-stone-800 text-center py-4 text-xs text-stone-500">
                <p>© <span id="copyright-year">{{ date('Y') }}</span> The Lens. All rights reserved.</p>
            </div>
        </footer>
    @endif

    <!-- Header Scripts: Navigation & Filter Controls -->
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            // Mobile Navigation Toggle
            const menuBtn = document.getElementById('menu-button');
            const nav = document.getElementById('navigation');
            const closeNavBtn = document.getElementById('close-nav-btn');
            const backdrop = document.getElementById('mobile-nav-backdrop');

            function toggleNav(open) {
                if (nav) nav.classList.toggle('is-open', open);
                if (backdrop) backdrop.classList.toggle('is-visible', open);
                if (menuBtn) menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
                document.body.style.overflow = open ? 'hidden' : '';
            }

            if (menuBtn) {
                menuBtn.addEventListener('click', () => toggleNav(true));
            }
            if (closeNavBtn) {
                closeNavBtn.addEventListener('click', () => toggleNav(false));
            }
            if (backdrop) {
                backdrop.addEventListener('click', () => toggleNav(false));
            }

            // Search Sort & Filter Dropdown Toggle
            const filterBtn = document.getElementById('sort-filter-btn');
            const filterDropdown = document.getElementById('filter-dropdown');
            const closeFilterBtn = document.getElementById('close-filter-btn');
            const clearFiltersBtn = document.getElementById('clear-filters-btn');
            const dateTypeSelect = document.getElementById('date-filter-type');
            const dateValueInput = document.getElementById('date-filter-value');

            if (filterBtn && filterDropdown) {
                filterBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const isHidden = filterDropdown.classList.contains('hidden');
                    filterDropdown.classList.toggle('hidden', !isHidden);
                    filterBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
                });
            }

            if (closeFilterBtn && filterDropdown) {
                closeFilterBtn.addEventListener('click', function () {
                    filterDropdown.classList.add('hidden');
                    if (filterBtn) filterBtn.setAttribute('aria-expanded', 'false');
                });
            }

            if (dateTypeSelect && dateValueInput) {
                dateTypeSelect.addEventListener('change', function () {
                    if (this.value === 'choose') {
                        dateValueInput.classList.remove('hidden');
                    } else {
                        dateValueInput.classList.add('hidden');
                        dateValueInput.value = '';
                    }
                });
            }

            if (clearFiltersBtn) {
                clearFiltersBtn.addEventListener('click', function () {
                    const sortSelect = document.getElementById('sort-select');
                    const categorySelect = document.getElementById('category-select');
                    if (sortSelect) sortSelect.value = 'newest';
                    if (categorySelect) categorySelect.value = 'All';
                    if (dateTypeSelect) {
                        dateTypeSelect.value = 'any';
                        if (dateValueInput) {
                            dateValueInput.classList.add('hidden');
                            dateValueInput.value = '';
                        }
                    }
                });
            }

            // Global Share Button Handler
            document.addEventListener('click', async function (e) {
                const shareBtn = e.target.closest('[data-copy-article-id]');
                if (!shareBtn) return;

                const articleId = shareBtn.getAttribute('data-copy-article-id');
                const articleUrl = shareBtn.getAttribute('data-article-url') || window.location.origin + '/article/' + articleId;

                try {
                    await navigator.clipboard.writeText(articleUrl);
                    
                    // Increment count in backend
                    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                    fetch('/article/' + articleId + '/share', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': token || ''
                        }
                    }).then(res => res.json()).then(data => {
                        const countNode = shareBtn.querySelector('[data-share-count]');
                        if (countNode && data.shares !== undefined) {
                            countNode.textContent = data.shares;
                        }
                    }).catch(() => {});

                    const originalHTML = shareBtn.innerHTML;
                    shareBtn.innerHTML = '<i class="fa-solid fa-check text-emerald-600" aria-hidden="true"></i> <span class="text-emerald-700 font-medium">Copied!</span>';
                    setTimeout(() => {
                        shareBtn.innerHTML = originalHTML;
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy link', err);
                }
            });
        });
    </script>
    @stack('scripts')
</body>
</html>
