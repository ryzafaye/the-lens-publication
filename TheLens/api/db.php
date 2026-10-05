<?php
$host = 'localhost';
$db   = 'the_lens';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);

    // Auto-migrate: ensure student_id column exists in users table
    static $migrated = false;
    if (!$migrated) {
        $checkCol = $pdo->query("SHOW COLUMNS FROM users LIKE 'student_id'")->fetch();
        if (!$checkCol) {
            // 1. Add student_id column
            $pdo->exec("ALTER TABLE users ADD COLUMN student_id VARCHAR(50) NULL AFTER name");
            
            // 2. Populate default student_ids for any existing users
            $existing = $pdo->query("SELECT id, name FROM users WHERE student_id IS NULL OR student_id = ''")->fetchAll();
            foreach ($existing as $u) {
                $defaultId = 'STU-' . str_pad($u['id'], 4, '0', STR_PAD_LEFT);
                $upd = $pdo->prepare("UPDATE users SET student_id = ? WHERE id = ?");
                $upd->execute([$defaultId, $u['id']]);
            }
            
            // 3. Add UNIQUE constraint on student_id
            $pdo->exec("ALTER TABLE users ADD UNIQUE (student_id)");
            
            // 4. Make email column nullable so accounts can be created without email
            try {
                $pdo->exec("ALTER TABLE users MODIFY COLUMN email VARCHAR(191) NULL");
            } catch (\Exception $ex) {
                // If email column alteration differs across engines, ignore gracefully
            }
        }
        $migrated = true;
    }
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed.']);
    exit;
}
?>