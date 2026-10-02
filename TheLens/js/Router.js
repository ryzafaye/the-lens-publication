

// Router & Startup
function route() {
  
    if (heroTimer) {
        clearInterval(heroTimer);
        heroTimer = null;
    }

    const p = (location.hash.slice(1) || '/').split('/').filter(Boolean), d = decodeURIComponent;
    let cur = '';
    if (!p.length) { cur = '/'; home(); }
    else if (p[0] === 's') { cur = d(p[1]); section(cur); }
    else if (p[0] === 'a') { article(p[1]); window.scrollTo(0, 0); return; }
    else if (p[0] === 'q') { searchPage(d(p[1])); return; }
    else if (p[0] === 'search') { searchPage(d(p[1] || '')); return; }
    else if (p[0] === 'about') { cur = 'about'; about(); }
    else if (p[0] === 'write') { if (!user()) { location.hash = '#/login'; return; } write(); }
    else if (p[0] === 'queue') { editorialQueue(); return; }
    else if (p[0] === 'accounts') { manageAccounts(); return; }
    else if (p[0] === 'login') { login(); }
    else { home(); }
    nav(cur);
    window.scrollTo(0, 0);
}

$(document).ready(() => {
  
    $('#q').on('keydown', function(e) {
        if (e.key === 'Enter') {
            const query = $(this).val().trim();
            if (query) location.hash = '#/search/' + encodeURIComponent(query);
        }
    });

  
    const updateClock = () => {
        $('#clock').text(new Date().toLocaleString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: 'numeric', minute: '2-digit'
        }));
    };
    updateClock();
    setInterval(updateClock, 1000);

    // 1. Theme Toggle Functionality
$('#theme').on('click', () => {
        const r = document.documentElement;
        const currentTheme = r.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        r.setAttribute('data-theme', newTheme);
        localStorage.setItem('lens_theme', newTheme);
    });

    const savedTheme = localStorage.getItem('lens_theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // 2. Footer year
    $('#yr').text(new Date().getFullYear());

    // 3. Check active session, then fetch articles and load router
    $.ajax({
        url: 'api/session.php',
        method: 'GET',
        dataType: 'json',
        cache: false,
        success: function(res) {
            if (res.logged_in) {
                currentUser = res.user;
            }
            authBar();
            fetchArticles(() => {
                $(window).on('hashchange', route);
                $(document).on('click', 'a[href^="#"]', function() {
                    const href = this.getAttribute('href');
                    if (href === location.hash) {
                        route();
                    }
                });
                route();
            });
        },
        error: function() {
            authBar();
            fetchArticles(() => {
                $(window).on('hashchange', route);
                $(document).on('click', 'a[href^="#"]', function() {
                    const href = this.getAttribute('href');
                    if (href === location.hash) {
                        route();
                    }
                });
                route();
            });
        }
    });
});