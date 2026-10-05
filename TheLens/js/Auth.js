

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
        <label>Student ID</label><input id="sid" type="text" placeholder="Enter Student ID (e.g. 2024-00123)">
        <label>Password</label><input id="pw" type="password" placeholder="Enter your password">
        <p class="err" id="err"></p>
        <button id="go" style="width:100%">Log in</button>
    </div>`);

    const submit = () => {
        const student_id = $('#sid').val().trim(), password = $('#pw').val();
        
        if (!student_id || !password) {
            $('#err').text('Student ID and password required.');
            return;
        }

        $.ajax({
            url: 'api/login.php',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ student_id, password }),
            success: function(res) {
                if (res.success) {
                    currentUser = res.user;
                    authBar();
                    location.hash = '#/';
                } else {
                    $('#err').text(res.message);
                }
            },
            error: function() {
                $('#err').text('Server error occurred during login.');
            }
        });
    };

    $('#go').on('click', submit);
    $('#sid, #pw').on('keydown', function(e) {
        if (e.key === 'Enter') submit();
    });
}