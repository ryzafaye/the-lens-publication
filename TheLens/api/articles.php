<?php
require_once 'db.php';
session_start();
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // If requesting pending articles (for editors)
    $status = $_GET['status'] ?? 'published';
    
    if ($status === 'pending' && isset($_SESSION['user']) && in_array($_SESSION['user']['role'], ['admin', 'editor'])) {
        $stmt = $pdo->prepare("SELECT * FROM articles WHERE status = 'pending' ORDER BY date DESC");
        $stmt->execute();
    } else {
        // Default: Only return published articles for the public site
        $stmt = $pdo->prepare("SELECT * FROM articles WHERE status = 'published' ORDER BY date DESC, id DESC");
        $stmt->execute();
    }
    
    $articles = $stmt->fetchAll();
    
    foreach ($articles as &$art) {
        $art['body'] = json_decode($art['body'], true);
        $art['tags'] = $art['tags'] ? explode(',', $art['tags']) : [];
        $art['images'] = $art['images'] ? json_decode($art['images'], true) : [];
    }
    echo json_encode($articles);
} 

elseif ($method === 'POST') {
    if (!isset($_SESSION['user'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $user = $_SESSION['user'];

    $id = 'u' . time();
    $title = trim($data['title']);
    $section = $data['section'];
    $author = $user['name'];
    $author_id = $user['id'];
    $date = date('Y-m-d');
    $excerpt = trim($data['excerpt']);
    $body = json_encode($data['body']);
    $tags = implode(',', $data['tags']);

   
    $imagesArr = is_array($data['images'] ?? null) ? $data['images'] : [];
    $images = $imagesArr ? json_encode($imagesArr) : null;
    $cover = $imagesArr[0] ?? ($data['cover'] ?? null);

    // Workflow rule: Admins/Editors publish immediately. Writers submit as 'pending'.
    $status = in_array($user['role'], ['admin', 'editor']) ? 'published' : 'pending';

    $stmt = $pdo->prepare("INSERT INTO articles (id, title, section, author, author_id, date, excerpt, body, tags, cover, images, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $success = $stmt->execute([$id, $title, $section, $author, $author_id, $date, $excerpt, $body, $tags, $cover, $images, $status]);

    echo json_encode(['success' => $success, 'id' => $id, 'status' => $status]);
} 

elseif ($method === 'PUT') {
    // Used by Editors to Approve pending articles
    if (!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'], ['admin', 'editor'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Permission denied']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? '';
    $action = $data['action'] ?? ''; // 'publish' or 'reject'

    if ($action === 'publish') {
        $stmt = $pdo->prepare("UPDATE articles SET status = 'published' WHERE id = ?");
        $success = $stmt->execute([$id]);
        echo json_encode(['success' => $success]);
    } else {
        $stmt = $pdo->prepare("DELETE FROM articles WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
}

elseif ($method === 'DELETE') {
   
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Permission denied']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? '';

    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Article ID required.']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM articles WHERE id = ?");
    $success = $stmt->execute([$id]);
    echo json_encode(['success' => $success]);
}
?>