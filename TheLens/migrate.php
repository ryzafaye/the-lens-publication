<?php
require_once __DIR__ . '/api/db.php';

header('Content-Type: text/html; charset=utf-8');

try {
    // 1. Check if student_id exists
    $checkCol = $pdo->query("SHOW COLUMNS FROM users LIKE 'student_id'")->fetch();
    $statusMsg = '';

    if (!$checkCol) {
        $pdo->exec("ALTER TABLE users ADD COLUMN student_id VARCHAR(50) NULL AFTER name");
        $existing = $pdo->query("SELECT id, name FROM users WHERE student_id IS NULL OR student_id = ''")->fetchAll();
        foreach ($existing as $u) {
            $defaultId = 'STU-' . str_pad($u['id'], 4, '0', STR_PAD_LEFT);
            $upd = $pdo->prepare("UPDATE users SET student_id = ? WHERE id = ?");
            $upd->execute([$defaultId, $u['id']]);
        }
        $pdo->exec("ALTER TABLE users ADD UNIQUE (student_id)");
        try {
            $pdo->exec("ALTER TABLE users MODIFY COLUMN email VARCHAR(191) NULL");
        } catch (\Exception $e) {}
        $statusMsg = 'Successfully added <code>student_id</code> column (VARCHAR(50), UNIQUE) and populated existing user records!';
    } else {
        $statusMsg = '<code>student_id</code> column already exists in the <code>users</code> table.';
    }

    // Fetch all current users to display
    $users = $pdo->query("SELECT id, name, student_id, email, role FROM users ORDER BY id ASC")->fetchAll();
?>
<!DOCTYPE html>
<html>
<head>
    <title>Database Migration - The Lens</title>
    <style>
        body { font-family: -apple-system, system-ui, sans-serif; padding: 40px; background: #faf8f4; color: #1c1b19; max-width: 800px; margin: 0 auto; }
        .card { background: #fff; border: 1px solid #e2ddd2; border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.04); }
        h1, h2 { color: #7a1522; margin-top: 0; }
        .success { color: #1e7e34; background: #e8f5e9; border: 1px solid #c8e6c9; padding: 12px 16px; border-radius: 6px; font-weight: 500; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { text-align: left; padding: 10px 14px; border-bottom: 1px solid #eee; }
        th { background: #fdfbf7; font-weight: 600; color: #555; }
        .badge { background: #7a1522; color: #fff; padding: 2px 8px; border-radius: 99px; font-size: 12px; }
        a.btn { display: inline-block; background: #7a1522; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 500; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>The Lens Database Migration</h1>
        <div class="success">✓ <?= $statusMsg ?></div>
        
        <h2 style="margin-top: 24px;">Current Users in Database:</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Student ID</th>
                    <th>Email</th>
                    <th>Role</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($users as $u): ?>
                <tr>
                    <td><?= htmlspecialchars($u['id']) ?></td>
                    <td><b><?= htmlspecialchars($u['name']) ?></b></td>
                    <td><code style="color:#7a1522;font-weight:bold;"><?= htmlspecialchars($u['student_id'] ?? 'N/A') ?></code></td>
                    <td><?= htmlspecialchars($u['email'] ?? '-') ?></td>
                    <td><span class="badge"><?= htmlspecialchars(strtoupper($u['role'])) ?></span></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        
        <a class="btn" href="index.php#/login">Go to Staff Login →</a>
    </div>
</body>
</html>
<?php
} catch (\Exception $e) {
    echo "<h1>Migration Error</h1><p>" . htmlspecialchars($e->getMessage()) . "</p>";
}
