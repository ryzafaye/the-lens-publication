<?php
require_once 'db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    echo json_encode([
        'success' => false,
        'message' => 'Email and password required.'
    ]);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();


if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email or password.'
    ]);
    exit;
}

session_start();

$_SESSION['user'] = [
    'id' => $user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'role' => $user['role']
];

echo json_encode([
    'success' => true,
    'user' => $_SESSION['user']
]);
?>