
// Pages
function home() {
    const a = all();
    if (!a.length) return;

    // The newest 5 articles become slides; everything else still shows
    
    
    const slideCount = Math.min(5, a.length);
    const slides = a.slice(0, slideCount);
    const rest = a.slice(slideCount);

    $app.html(`
    <div class="hero hero-carousel">
        <div class="hero-slides">
            ${slides.map((f, i) => `
            <a class="hero-slide${i === 0 ? ' active' : ''}" href="#/a/${esc(f.id)}">
                ${f.cover ? `<div class="hero-frame"><img class="hero-bg" src="${f.cover}" alt=""><img class="hero-img" src="${f.cover}" alt=""></div>` : ''}
                <span class="k">${esc(f.section)} · Featured</span>
                <h1>${esc(f.title)}</h1>
                <p>${esc(f.excerpt)}</p>
                <small>By ${esc(f.author)} · ${fmt(f.date)} · ${mins(f)} min read</small>
            </a>`).join('')}
        </div>
        ${slides.length > 1 ? `<div class="hero-dots">
            ${slides.map((_, i) => `<button type="button" class="hero-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Show slide ${i + 1}"></button>`).join('')}
        </div>` : ''}
    </div>
    <div class="sh"><h2>Latest</h2></div>${list(rest.slice(0, 6))}
    ${SEC.map(s => {
        const x = a.filter(p => p.section === s).slice(0, 3);
        return x.length ? `<div class="sh"><h2>${s}</h2><a class="k" href="#/s/${encodeURIComponent(s)}">View all →</a></div>${list(x)}` : '';
    }).join('')}`);

   
    if (slides.length > 1) {
        let index = 0;
        const $slides = $('.hero-slide');
        const $dots = $('.hero-dot');
        const show = (i) => {
            index = i;
            $slides.removeClass('active').eq(i).addClass('active');
            $dots.removeClass('active').eq(i).addClass('active');
        };
        $dots.on('click', function() {
            show($(this).data('index'));
        });
        heroTimer = setInterval(() => show((index + 1) % slides.length), 5000);
    }
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
        ${(() => {
            // Older articles only ever had a single `cover`, saved
            // before the `images` column existed — so if there's no
            // images list, fall back to just showing that one photo.
            const pics = (Array.isArray(a.images) && a.images.length) ? a.images : (a.cover ? [a.cover] : []);
            return pics.length
                ? `<div class="art-gallery">${pics.map(src => `<img class="art-img" src="${src}" alt="">`).join('')}</div>`
                : '';
        })()}
        <div class="meta">By <b>${esc(a.author)}</b> · ${fmt(a.date)} · ${mins(a)} min read</div>
        <div class="body">${bodyParagraphs.map(p => `<p>${esc(p)}</p>`).join('')}</div>
        <div>${tagsArr.map(t => `<a class="tag" href="#/q/${encodeURIComponent(t)}">#${esc(t)}</a>`).join('')}</div>
        <div class="row">
            <button class="ghost" id="cp">Copy link</button>
            ${user() && user().role === 'admin' ? '<button class="ghost" id="delArt" style="color:var(--acc)">Delete article</button>' : ''}
        </div></article>
        ${rel.length ? `<div class="sh"><h2>Related</h2></div>${list(rel)}` : ''}`);
    
    $('#cp').on('click', async function(e) {
        await navigator.clipboard.writeText(location.href);
        $(this).text('Copied!');
    });

    $('#delArt').on('click', function() {
        if (!confirm(`Delete "${a.title}"? This can't be undone.`)) return;
        $.ajax({
            url: 'api/articles.php',
            method: 'DELETE',
            contentType: 'application/json',
            data: JSON.stringify({ id: a.id }),
            success: function(res) {
                if (res.success) {
                    fetchArticles(() => { location.hash = '#/'; });
                } else {
                    alert(res.message || 'Failed to delete article.');
                }
            },
            error: function() { alert('Server error — could not delete the article.'); }
        });
    });
}

function write() {
    // Every photo the writer has attached so far, as data URLs. The
    // first one in this list becomes the article's cover photo
    // automatically — whichever one they pick first.
    let images = [];
    const u = user();

    const renderThumbs = () => {
        $('#covWrap').html(images.map((src, i) => `
            <div class="photo-thumb">
                <img src="${src}" alt="">
                ${i === 0 ? '<span class="photo-thumb-label">Cover</span>' : ''}
                <button type="button" class="photo-thumb-remove" data-index="${i}" aria-label="Remove photo">×</button>
            </div>`).join(''));
        $('.photo-thumb-remove').on('click', function() {
            images.splice($(this).data('index'), 1);
            renderThumbs();
        });
    };

    $app.html(`<div class="form"><h2>Write an article (${u.role.toUpperCase()} mode)</h2>
    <label>Title</label><input id="t">
    <label>Section</label><select id="s">${SEC.map(s => `<option>${s}</option>`).join('')}</select>
    <label>Short summary</label><input id="ex" maxlength="160">
    <label>Tags (comma-separated)</label><input id="tg">
    <label>Article text</label><textarea id="bd" rows="10"></textarea>
    <label>Photos</label>
    <input id="cov" type="file" accept="image/*" multiple>
    <p class="note">You can pick more than one photo. The first one becomes the cover shown on cards and the homepage slideshow — the rest appear further down in the article itself.</p>
    <div id="covWrap" class="photo-thumbs"></div>
    <div class="row" style="margin-top: 1rem;"><button id="pub">${u.role === 'writer' ? 'Submit for Review' : 'Publish Immediately'}</button><small id="msg"></small></div></div>`);

    $('#cov').on('change', function(e) {
        // Each picked photo is shrunk to max 1200px on its longest side
        // and saved as a JPEG before being added. Big phone photos as
        // raw base64 can exceed PHP/MySQL size limits and cause a
        // "Server error", so we resize them in the browser first.
        [...e.target.files].forEach(file => {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const img = new Image();
                img.onload = function() {
                    const MAX = 1200;
                    const scale = Math.min(1, MAX / Math.max(img.width, img.height));
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.round(img.width * scale);
                    canvas.height = Math.round(img.height * scale);
                    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                    images.push(canvas.toDataURL('image/jpeg', 0.8));
                    renderThumbs();
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
        $(this).val(''); // lets the same file be picked again later if removed
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
            images: images
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
            error: function(xhr) { $('#msg').text('Server error: ' + ((xhr.responseJSON && xhr.responseJSON.message) || xhr.status)); }
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
                            <p><b>ID:</b> ${esc(usr.student_id || 'N/A')}${usr.email ? ` · ${esc(usr.email)}` : ''}</p>
                            <div class="row" style="margin-top:1rem">
                                <button class="ghost edit-user-btn" data-id="${usr.id}" data-name="${esc(usr.name)}" data-student-id="${esc(usr.student_id || '')}" data-email="${esc(usr.email || '')}" data-role="${usr.role}">Edit</button>
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
            <label>Student ID (String)</label><input id="usrStudentId" type="text" placeholder="e.g. 2024-00123" value="${isEdit ? (editData.studentId || '') : ''}">
            <label>Email Address (Optional)</label><input id="usrEmail" type="email" value="${isEdit ? (editData.email || '') : ''}">
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
        const studentId = $('#usrStudentId').val().trim();
        if (!studentId) {
            $('#usrMsg').text('Student ID is required.');
            return;
        }

        const payload = {
            name: $('#usrName').val().trim(),
            student_id: studentId,
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

// About Page — masthead, mission, editorial standards, and contact info
function about() {
    nav('about');
    $app.html(`
        <div class="about-page">
            <div class="about-hero">
                <span class="k">About The Publication</span>
                <h1>Illuminating Truth. Elevating Student Voices.</h1>
                <p class="about-lead">
                    <b>The Lens</b> is the official independent student-run journalism club publication. 
                    Founded on the principles of free inquiry, factual reporting, and ethical storytelling, 
                    we serve our campus community with timely news, investigative features, insightful commentary, and cultural coverage.
                </p>
                <div class="about-stats">
                    <div class="stat-card">
                        <span class="stat-num">6</span>
                        <span class="stat-lbl">Sections</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-num">100%</span>
                        <span class="stat-lbl">Student-Run</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-num">Daily</span>
                        <span class="stat-lbl">Digital Edition</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-num">Open</span>
                        <span class="stat-lbl">Submissions</span>
                    </div>
                </div>
            </div>

            <div class="about-section">
                <div class="sh"><h2>Our Editorial Pillars</h2></div>
                <div class="pillars-grid">
                    <div class="pillar-card">
                        <div class="pillar-icon">📰</div>
                        <h3>Accuracy & Truth</h3>
                        <p>We verify before publishing. We seek multiple perspectives, check primary records, and hold student leadership and institutional administration accountable.</p>
                    </div>
                    <div class="pillar-card">
                        <div class="pillar-icon">🎓</div>
                        <h3>Student Development</h3>
                        <p>The Lens is a working newsroom and learning laboratory. We train prospective journalists, writers, photographers, and editors to produce high-caliber work.</p>
                    </div>
                    <div class="pillar-card">
                        <div class="pillar-icon">🏛️</div>
                        <h3>Campus Advocacy</h3>
                        <p>We amplify the issues that matter to students—from tuition policies and campus facilities to club activities, student welfare, and campus arts.</p>
                    </div>
                </div>
            </div>

            <div class="about-section">
                <div class="sh"><h2>Editorial Masthead</h2></div>
                <p class="section-desc">The student journalists, editors, and photographers directing our editorial board this term.</p>
                <div class="masthead-grid">
                    <div class="masthead-card">
                        <div class="avatar">RR</div>
                        <div class="masthead-details">
                            <h3>Ryza Reyes</h3>
                            <span class="badge">Editor-in-Chief</span>
                            <p>Directs overall newsroom operations, long-form investigations, and editorial stances.</p>
                        </div>
                    </div>
                    <div class="masthead-card">
                        <div class="avatar">JT</div>
                        <div class="masthead-details">
                            <h3>Jazmine Tuazon</h3>
                            <span class="badge">Managing Editor</span>
                            <p>Coordinates story assignments, editorial pipelines, publication schedules, and fact-checking.</p>
                        </div>
                    </div>
                    <div class="masthead-card">
                        <div class="avatar">AA</div>
                        <div class="masthead-details">
                            <h3>Arabella Andal</h3>
                            <span class="badge">News & Campus Editor</span>
                            <p>Supervises coverage of the Student Council, administration policies, and campus breaking news.</p>
                        </div>
                    </div>
                    <div class="masthead-card">
                        <div class="avatar">GL</div>
                        <div class="masthead-details">
                            <h3>Gian Lacao</h3>
                            <span class="badge">Features & Arts Editor</span>
                            <p>Curates campus human-interest profiles, club spotlights, visual exhibitions, and arts reviews.</p>
                        </div>
                    </div>
                    <div class="masthead-card">
                        <div class="avatar">YJ</div>
                        <div class="masthead-details">
                            <h3>Yang Jungwon</h3>
                            <span class="badge">Opinion & Sports Editor</span>
                            <p>Leads student opinion columns, athlete spotlights, varsity coverage, and letters to the editor.</p>
                        </div>
                    </div>
                    <div class="masthead-card">
                        <div class="avatar">MT</div>
                        <div class="masthead-details">
                            <h3>Mike Tyson</h3>
                            <span class="badge">Chief Photojournalist</span>
                            <p>Manages photo assignments, photo essays, multimedia journalism, and visual archives.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="about-section">
                <div class="sh"><h2>Editorial Guidelines & Ethics</h2></div>
                <div class="guidelines-grid">
                    <div class="guideline-card">
                        <h4>Editorial Autonomy</h4>
                        <p>The Lens is published independently by the student journalism club. Opinions expressed in columns and letters belong solely to their respective authors.</p>
                    </div>
                    <div class="guideline-card">
                        <h4>Corrections Policy</h4>
                        <p>We strive for complete accuracy. When an error occurs, we correct it promptly and transparently at the top or bottom of the article with a clear correction notice.</p>
                    </div>
                    <div class="guideline-card">
                        <h4>Letters & Guest Op-Eds</h4>
                        <p>We accept op-ed submissions and letters to the editor from all students, faculty, and alumni. Submissions should be concise (500–800 words) and signed with full name.</p>
                    </div>
                </div>
            </div>

            <div class="about-cta">
                <h2>Join The Lens Team</h2>
                <p>No prior journalism experience is necessary. Whether you want to write breaking news, conduct deep investigations, take photos, or manage our digital desk, there is a place for you.</p>
                <div class="row" style="justify-content:center; gap:12px; margin: 1.5rem 0 1rem;">
                    ${user() 
                        ? `<a class="btn" href="#/write">Write an Article</a>` 
                        : `<a class="btn" href="#/login">Staff Login</a>`}
                    <a class="btn ghost" href="#/s/News">Read Latest News</a>
                </div>
                <div class="about-contact-strip">
                    <span>🏢 <b>Newsroom:</b> Student Center, Room 304</span>
                    <span>✉️ <b>Email:</b> <a href="mailto:thelens.publication@gmail.com">thelens.publication@gmail.com</a></span>
                    <span>📅 <b>Editorial Meetings:</b> Every Thursday at 5:00 PM</span>
                </div>
            </div>
        </div>
    `);
}