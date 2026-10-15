<!DOCTYPE html>
<html>
<head>
    <title>The Lens - Login Test</title>
</head>
<body>
    <h2>Test Login</h2>

    <!-- Error message display for login failures -->
    @if($errors->any())
        <div style="color: red;">{{ $errors->first() }}</div>
    @endif

    <form method="POST" action="/login">
        @csrf <!-- for security, to prevent CSRF attacks -->
        
        <label>Student Number:</label><br>
        <input type="text" name="student_number" required><br><br>
        
        <label>Password:</label><br>
        <input type="password" name="password" required><br><br>
        
        <button type="submit">Login</button>
    </form>
</body>
</html>