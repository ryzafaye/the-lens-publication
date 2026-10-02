

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