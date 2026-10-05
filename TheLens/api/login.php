<?php
require_once 'db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

// Student ID is a string; also accept email as legacy fallback
$student_id = trim($data['student_id'] ?? $data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$student_id || !$password) {
    echo json_encode([
        'success' => false,
        'message' => 'Student ID and password required.'
    ]);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE student_id = ? OR email = ?");
$stmt->execute([$student_id, $student_id]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid Student ID or password.'
    ]);
    exit;
}

session_start();
session_regenerate_id(true);

$_SESSION['user'] = [
    'id' => $user['id'],
    'name' => $user['name'],
    'student_id' => $user['student_id'] ?? '',
    'email' => $user['email'] ?? '',
    'role' => $user['role']
];

echo json_encode([
    'success' => true,
    'user' => $_SESSION['user']
]);
?>