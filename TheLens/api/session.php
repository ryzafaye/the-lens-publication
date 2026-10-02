<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user'])) {
    echo json_encode(['logged_in' => true, 'user' => $_SESSION['user']]);
} else {
    echo json_encode(['logged_in' => false]);
}
?>