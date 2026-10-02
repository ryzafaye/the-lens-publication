<?php
require_once 'db.php';
session_start();
header('Content-Type: application/json');

// Security check: Only admins can manage accounts
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, name, email, role FROM users ORDER BY id DESC");
    echo json_encode($stmt->fetchAll());
} 

elseif ($method === 'POST') {
    // Create new user
    $data = json_decode(file_get_contents('php://input'), true);
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? 'writer';

    if (!$name || !$email || !$password) {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
        $success = $stmt->execute([$name, $email, $hashedPassword, $role]);
        echo json_encode(['success' => $success]);
    } catch (\PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Email might already be in use.']);
    }
} 

elseif ($method === 'PUT') {
    // Edit existing user
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $role = $data['role'] ?? 'writer';
    $password = $data['password'] ?? '';

    if (!$id || !$name || !$email) {
        echo json_encode(['success' => false, 'message' => 'ID, name, and email are required.']);
        exit;
    }

    if (!empty($password)) {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET name = ?, email = ?, role = ?, password = ? WHERE id = ?");
        $success = $stmt->execute([$name, $email, $role, $hashedPassword, $id]);
    } else {
        $stmt = $pdo->prepare("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?");
        $success = $stmt->execute([$name, $email, $role, $id]);
    }

    echo json_encode(['success' => $success]);
} 

elseif ($method === 'DELETE') {
    // Delete user
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;

    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'User ID required.']);
        exit;
    }

    // Prevent admin from deleting themselves
    if ($id == $_SESSION['user']['id']) {
        echo json_encode(['success' => false, 'message' => 'You cannot delete your own active account.']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $success = $stmt->execute([$id]);
    echo json_encode(['success' => $success]);
}
?>