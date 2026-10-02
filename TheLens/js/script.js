// Section names
const SEC = ["News", "Campus", "Features", "Opinion", "Sports", "Arts"];

// Sample articles fallback if database/AJAX fails
const seed = [
    {
        id: "s1",
        title: "Student Council Approves New Library Hours for Exam Season",
        section: "News",
        author: "Maria Santos",
        date: "2026-09-22",
        tags: ["council", "library"],
        excerpt: "Beginning next month, the main library will stay open until midnight on weekdays.",
        body: [
            "The Student Council voted this week to extend library hours during the exam period, responding to a petition signed by more than 400 students.",
            "Council members said the change will run on a trial basis and be reviewed at the end of the term. Students can share feedback through the council's suggestion form."
        ]
    },
    {
        id: "s2",
        title: "Inside the Robotics Club's Race to Nationals",
        section: "Campus",
        author: "Jared Lim",
        date: "2026-09-20",
        tags: ["clubs", "robotics"],
        excerpt: "Late nights, spare parts and a stubborn robot arm: how a small team qualified.",
        body: [
            "In a cramped corner of the engineering building, twelve students have spent weeks rebuilding a robot that refused to grip.",
            "Their advisor says the real win is the teamwork. The team leaves for the national competition in November."
        ]
    }
];

let cachedArticles = [];
const $app =$('#app');
let currentUser = null;

// Fetch articles from Database via AJAX with safe fallback (cache: false prevents browser caching)
function fetchArticles(callback) {
    $.ajax({
        url: 'api/articles.php',
        method: 'GET',
        dataType: 'json',
        cache: false,
        success: function(data) {
            cachedArticles = Array.isArray(data) && data.length ? data : seed;
            if (callback) callback();
        },
        error: function(xhr, status, error) {
            console.warn('Failed to fetch from database, falling back to seed data.', error);
            cachedArticles = seed; 
            if (callback) callback();
        }
    });
}

const all = () => cachedArticles;

// Helper functions
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const fmt = d => {
    try {
        return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return d; }
};

const mins = a => {
    const textBody = Array.isArray(a.body) ? a.body.join(' ') : (typeof a.body === 'string' ? a.body : '');
    return Math.max(1, Math.round(textBody.split(/\s+/).length / 200));
};

const card = a => `<a class="card" href="#/a/${esc(a.id)}">
    ${a.cover ? `<img class="thumb" src="${a.cover}" alt="">` : ''}
    <span class="k">${esc(a.section)}</span>
    <h3>${esc(a.title)}</h3>
    <p>${esc(a.excerpt)}</p>
    <small>${esc(a.author)} · ${fmt(a.date)}</small>
    </a>`;

const list = (arr, t) => arr.length ? `<div class="grid">${arr.map(card).join('')}</div>` : `<div class="empty">${t || 'No articles found.'}</div>`;

function nav(cur) {
    $('#nav').html(`<a href="#/" class="${cur === '/' ? 'on' : ''}">Home</a>` + 
        SEC.map(s => `<a href="#/s/${encodeURIComponent(s)}" class="${cur === s ? 'on' : ''}">${s}</a>`).join('') +
        `<a href="#/search" class="${cur === 'search' ? 'on' : ''}">Search</a>`);
}

// Pages
function home() {
    const a = all();
    if (!a.length) return;
    const [f, ...rest] = a;
    $app.html(`<a class="hero" href="#/a/${esc(f.id)}">
        ${f.cover ? `<img class="hero-img" src="${f.cover}" alt="">` : ''}
        <span class="k">${esc(f.section)} · Featured</span>
        <h1>${esc(f.title)}</h1>
        <p>${esc(f.excerpt)}</p>
        <small>By ${esc(f.author)} · ${fmt(f.date)} · ${mins(f)} min read</small>
        </a>
    <div class="sh"><h2>Latest</h2></div>${list(rest.slice(0, 6))}
    ${SEC.map(s => {
        const x = a.filter(p => p.section === s).slice(0, 3);
        return x.length ? `<div class="sh"><h2>${s}</h2><a class="k" href="#/s/${encodeURIComponent(s)}">View all →</a></div>${list(x)}` : '';
    }).join('')}`);
}

function section(s) {
    const items = all().filter(p => p.section === s);
    $app.html(`<div class="sh" style="margin-top:0"><h2>${esc(s)}</h2><div><select id="sort" style="width:auto"><option value="n">Newest first</option><option value="o">Oldest first</option></select></div></div><div id="lst">${list(items, 'Nothing published in this section yet.')}</div>`);
    $('#sort').on('change', function(e) {
        const v = [...items];
        if (e.target.value === 'o') v.reverse();
        $('#lst').html(list(v));
    });
}

function searchPage(initialQuery = '') {
    nav('search');
    $app.html(`
        <div class="sh" style="margin-top:0">
            <h2>Search Articles</h2>
        </div>
        <div style="margin-bottom: 2rem;">
            <input id="searchInput" type="text" placeholder="Search by title, author, tag, section, or content..." value="${esc(initialQuery)}" style="width: 100%; padding: 0.75rem; font-size: 1rem; border: 1px solid var(--border); background: var(--bg); color: var(--text); border-radius: 4px;">
        </div>
        <div id="searchResults"></div>
    `);

    const performSearch = (q) => {
        const query = q.toLowerCase().trim();
        if (!query) {
            $('#searchResults').html('<div class="empty">Type something to search articles in real time.</div>');
            return;
        }

        const results = all().filter(a => {
            const title = (a.title || '').toLowerCase();
            const author = (a.author || '').toLowerCase();
            const section = (a.section || '').toLowerCase();
            const excerpt = (a.excerpt || '').toLowerCase();
            
            // Safely parse tags whether they are an array or string
            let tagsStr = '';
            if (Array.isArray(a.tags)) {
                tagsStr = a.tags.join(' ').toLowerCase();
            } else if (typeof a.tags === 'string') {
                tagsStr = a.tags.toLowerCase();
            }

            // Safely parse body whether it's an array of paragraphs or a single string
            let bodyStr = '';
            if (Array.isArray(a.body)) {
                bodyStr = a.body.join(' ').toLowerCase();
            } else if (typeof a.body === 'string') {
                bodyStr = a.body.toLowerCase();
            }

            return title.includes(query) ||
                   author.includes(query) ||
                   section.includes(query) ||
                   excerpt.includes(query) ||
                   tagsStr.includes(query) ||
                   bodyStr.includes(query);
        });

        $('#searchResults').html(list(results, `No articles found matching "${esc(q)}".`));
    };

    $('#searchInput').on('input', function() {
        performSearch($(this).val());
    });

    if (initialQuery) {
        performSearch(initialQuery);
    } else {
        $('#searchResults').html('<div class="empty">Type something to search articles in real time.</div>');
    }
    $('#searchInput').focus();
}

function article(id) {
    const a = all().find(x => x.id === id);
    if (!a) {
        $app.html('<div class="empty">Article not found. <a href="#/" style="text-decoration:underline">Back home</a></div>');
        return;
    }
    nav(a.section);
    const rel = all().filter(x => x.section === a.section && x.id !== a.id).slice(0, 3);
    
    // Safely render body paragraphs
    const bodyParagraphs = Array.isArray(a.body) ? a.body : (typeof a.body === 'string' ? [a.body] : []);
    // Safely render tags
    const tagsArr = Array.isArray(a.tags) ? a.tags : (typeof a.tags === 'string' ? a.tags.split(',').map(t => t.trim()) : []);

    $app.html(`<article class="art">
        <a class="k" href="#/s/${encodeURIComponent(a.section)}">${esc(a.section)}</a>
        <h1>${esc(a.title)}</h1>
        <p class="lead">${esc(a.excerpt)}</p>
        ${a.cover ? `<img class="art-img" src="${a.cover}" alt="">` : ''}
        <div class="meta">By <b>${esc(a.author)}</b> · ${fmt(a.date)} · ${mins(a)} min read</div>
        <div class="body">${bodyParagraphs.map(p => `<p>${esc(p)}</p>`).join('')}</div>
        <div>${tagsArr.map(t => `<a class="tag" href="#/q/${encodeURIComponent(t)}">#${esc(t)}</a>`).join('')}</div>
        <div class="row"><button class="ghost" id="cp">Copy link</button></div></article>
        ${rel.length ? `<div class="sh"><h2>Related</h2></div>${list(rel)}` : ''}`);
    
    $('#cp').on('click', async function(e) {
        await navigator.clipboard.writeText(location.href);
        $(this).text('Copied!');
    });
}

function write() {
    let cover = null;
    const u = user();
    
    $app.html(`<div class="form"><h2>Write an article (${u.role.toUpperCase()} mode)</h2>
    <label>Title</label><input id="t">
    <label>Section</label><select id="s">${SEC.map(s => `<option>${s}</option>`).join('')}</select>
    <label>Short summary</label><input id="ex" maxlength="160">
    <label>Tags (comma-separated)</label><input id="tg">
    <label>Article text</label><textarea id="bd" rows="10"></textarea>
    <label>Cover photo</label><input id="cov" type="file" accept="image/*">
    <div id="covWrap" style="margin-top: 10px;"></div>
    <div class="row" style="margin-top: 1rem;"><button id="pub">${u.role === 'writer' ? 'Submit for Review' : 'Publish Immediately'}</button><small id="msg"></small></div></div>`);

    $('#cov').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(uploadEvent) {
                cover = uploadEvent.target.result;
                $('#covWrap').html(`<img src="${cover}" alt="Preview" style="max-width: 200px; border-radius: 4px;">`);
            };
            reader.readAsDataURL(file);
        }
    });

    $('#pub').on('click', function() {
        const title = $('#t').val().trim(), bd = $('#bd').val().trim();
        if (!title || !bd) {
            $('#msg').text('Title and text are required.');
            return;
        }
        
        const payload = {
            title: title,
            section: $('#s').val(),
            excerpt: $('#ex').val().trim() || bd.slice(0, 120) + '…',
            tags: $('#tg').val().split(',').map(x => x.trim().toLowerCase()).filter(Boolean),
            body: bd.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean),
            cover: cover
        };

        $.ajax({
            url: 'api/articles.php',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function(res) {
                if (res.success) {
                    if (res.status === 'pending') {
                        $app.html(`<div class="empty"><h2>Article Submitted!</h2><p>Your article has been sent to the editors for review.</p><a class="btn" href="#/">Back to Home</a></div>`);
                    } else {
                        fetchArticles(() => { 
                            location.hash = '#/';
                            if (location.hash === '#/') route();
                        });
                    }
                } else {
                    $('#msg').text('Failed to save article.');
                }
            },
            error: function() { $('#msg').text('Server error.'); }
        });
    });
}

// Editorial Queue for Reviewing Pending Articles
function editorialQueue() {
    const u = user();
    if (!u || !['admin', 'editor'].includes(u.role)) {
        location.hash = '#/';
        return;
    }

    $.ajax({
        url: 'api/articles.php?status=pending',
        method: 'GET',
        dataType: 'json',
        cache: false,
        success: function(pendingArticles) {
            $app.html(`<div class="sh" style="margin-top:0"><h2>Editorial Review Queue</h2></div>` +
                (pendingArticles.length ? `<div class="grid">${pendingArticles.map(a => `
                    <div class="card" style="cursor:default">
                        ${a.cover ? `<img class="thumb" src="${a.cover}" alt="">` : ''}
                        <span class="k">${esc(a.section)} · Pending</span>
                        <h3>${esc(a.title)}</h3>
                        <p>${esc(a.excerpt)}</p>
                        <small>By ${esc(a.author)} ·${fmt(a.date)}</small>
                        <div class="row" style="margin-top:1rem">
                            <button class="btn approve-btn" data-id="${a.id}">Approve & Publish</button>
                            <button class="ghost reject-btn" data-id="${a.id}">Reject</button>
                        </div>
                    </div>`).join('')}</div>` : 
                `<div class="empty">No articles waiting for review. Good job!</div>`));

            $('.approve-btn').on('click', function() {
                const id = $(this).data('id');$.ajax({
                    url: 'api/articles.php',
                    method: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({ id, action: 'publish' }),
                    success: function() { 
                        fetchArticles(() => { editorialQueue(); });
                    }
                });
            });

            $('.reject-btn').on('click', function() {
                const id = $(this).data('id');$.ajax({
                    url: 'api/articles.php',
                    method: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({ id, action: 'reject' }),
                    success: function() { 
                        fetchArticles(() => { editorialQueue(); });
                    }
                });
            });
        }
    });
}

// User Management Dashboard for Admins
function manageAccounts() {
    const u = user();
    if (!u || u.role !== 'admin') {
        location.hash = '#/';
        return;
    }

    $.ajax({
        url: 'api/users.php',
        method: 'GET',
        dataType: 'json',
        cache: false,
        success: function(users) {
            $app.html(`
                <div class="sh" style="margin-top:0">
                    <h2>Account Management</h2>
                    <button class="btn" id="openCreateModal">Add New User</button>
                </div>
                <div id="userFormArea"></div>
                <div class="grid" style="margin-top: 1.5rem;">
                    ${users.map(usr => `
                        <div class="card" style="cursor:default">
                            <span class="k">${esc(usr.role.toUpperCase())}</span>
                            <h3>${esc(usr.name)}</h3>
                            <p>${esc(usr.email)}</p>
                            <div class="row" style="margin-top:1rem">
                                <button class="ghost edit-user-btn" data-id="${usr.id}" data-name="${esc(usr.name)}" data-email="${esc(usr.email)}" data-role="${usr.role}">Edit</button>
                                <button class="ghost delete-user-btn" data-id="${usr.id}" style="color:red">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `);

            $('#openCreateModal').on('click', () => {
                renderUserForm();
            });

            $('.edit-user-btn').on('click', function() {
                const data = $(this).data();
                renderUserForm(data);
            });

            $('.delete-user-btn').on('click', function() {
                const id = $(this).data('id');
                if (confirm('Are you sure you want to delete this user?')) {
                    $.ajax({
                        url: 'api/users.php',
                        method: 'DELETE',
                        contentType: 'application/json',
                        data: JSON.stringify({ id }),
                        success: function(res) {
                            if (res.success) {
                                manageAccounts();
                            } else {
                                alert(res.message || 'Failed to delete user.');
                            }
                        }
                    });
                }
            });
        }
    });
}

function renderUserForm(editData = null) {
    const isEdit = !!editData;
    $('#userFormArea').html(`
        <div class="form" style="margin-bottom: 2rem; border: 1px solid var(--border); padding: 1.5rem; border-radius: 6px;">
            <h3>${isEdit ? 'Edit User: ' + editData.name : 'Create New Account'}</h3>
            <label>Full Name</label><input id="usrName" value="${isEdit ? editData.name : ''}">
            <label>Email Address</label><input id="usrEmail" type="email" value="${isEdit ? editData.email : ''}">
            <label>Role</label>
            <select id="usrRole">
                <option value="writer" ${isEdit && editData.role === 'writer' ? 'selected' : ''}>Writer</option>
                <option value="editor" ${isEdit && editData.role === 'editor' ? 'selected' : ''}>Editor</option>
                <option value="admin" ${isEdit && editData.role === 'admin' ? 'selected' : ''}>Admin</option>
            </select>
            <label>Password ${isEdit ? '(Leave blank to keep current password)' : ''}</label>
            <input id="usrPass" type="password">
            <p class="err" id="usrMsg"></p>
            <div class="row" style="margin-top:1rem">
                <button id="saveUserBtn">${isEdit ? 'Update User' : 'Create User'}</button>
                <button class="ghost" id="cancelUserBtn">Cancel</button>
            </div>
        </div>
    `);

    $('#cancelUserBtn').on('click', () => {
        $('#userFormArea').html('');
    });

    $('#saveUserBtn').on('click', () => {
        const payload = {
            name: $('#usrName').val().trim(),
            email: $('#usrEmail').val().trim(),
            role: $('#usrRole').val(),
            password: $('#usrPass').val()
        };

        if (isEdit) payload.id = editData.id;

        $.ajax({
            url: 'api/users.php',
            method: isEdit ? 'PUT' : 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function(res) {
                if (res.success) {
                    manageAccounts();
                } else {
                    $('#usrMsg').text(res.message || 'Operation failed.');
                }
            },
            error: function() {
                $('#usrMsg').text('Server error occurred.');
            }
        });
    });
}

// Session management
function user() {
    return currentUser;
}

function authBar() {
    const u = user();
    $('#auth').html(u 
        ? `<span class="who">Hi, ${esc(u.name)} (${u.role})</span>` +
          (u.role === 'admin' ? `<a class="btn ghost" href="#/accounts">Accounts</a>` : '') +
          (['admin', 'editor'].includes(u.role) ? `<a class="btn ghost" href="#/queue">Review Queue</a>` : '') +
          `<a class="btn" href="#/write">Write</a><button class="ghost" id="logout">Log out</button>`
        : `<a class="btn" href="#/login">Log in</a>`);
    
    if (u) {
        $('#logout').on('click', () => {
            $.ajax({
                url: 'api/logout.php',
                method: 'POST',
                complete: function() {
                    currentUser = null;
                    authBar();
                    location.hash = '#/';
                }
            });
        });
    }
}

function login() {
    $app.html(`<div class="login">
        <h2>Staff log in</h2>
        <label>Email</label><input id="em" type="email">
        <label>Password</label><input id="pw" type="password">
        <p class="err" id="err"></p>
        <button id="go" style="width:100%">Log in</button>
    </div>`);

    const submit = () => {
        const email = $('#em').val().trim(), password = $('#pw').val();
        
        $.ajax({
            url: 'api/login.php',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email, password }),
            success: function(res) {
                if (res.success) {
                    currentUser = res.user;
                    authBar();
                    location.hash = '#/';
                } else {
                    $('#err').text(res.message);
                }
            }
        });
    };

    $('#go').on('click', submit);
}

// Router & Startup
function route() {
    const p = (location.hash.slice(1) || '/').split('/').filter(Boolean), d = decodeURIComponent;
    let cur = '';
    if (!p.length) { cur = '/'; home(); }
    else if (p[0] === 's') { cur = d(p[1]); section(cur); }
    else if (p[0] === 'a') { article(p[1]); window.scrollTo(0, 0); return; }
    else if (p[0] === 'q') { searchPage(d(p[1])); return; }
    else if (p[0] === 'search') { searchPage(d(p[1] || '')); return; }
    else if (p[0] === 'write') { if (!user()) { location.hash = '#/login'; return; } write(); }
    else if (p[0] === 'queue') { editorialQueue(); return; }
    else if (p[0] === 'accounts') { manageAccounts(); return; }
    else if (p[0] === 'login') { login(); }
    else { home(); }
    nav(cur);
    window.scrollTo(0, 0);
}

$(document).ready(() => {
    // 0. Header search box. This is the box in the top bar (id="q") —
    // it was never wired to anything before, which is why typing in it
    // and pressing Enter did nothing. It now sends you to the Search
    // page with your text already filled in.
    $('#q').on('keydown', function(e) {
        if (e.key === 'Enter') {
            const query = $(this).val().trim();
            if (query) location.hash = '#/search/' + encodeURIComponent(query);
        }
    });

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
                route();
            });
        },
        error: function() {
            authBar();
            fetchArticles(() => {
                $(window).on('hashchange', route);
                route();
            });
        }
    });
});