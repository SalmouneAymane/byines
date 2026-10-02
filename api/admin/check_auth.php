<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$userId = $_SESSION['user_id'] ?? null;
$role   = $_SESSION['user_role'] ?? null;

if (!$userId || $role !== 'admin') {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Access Denied: Administrator privileges required.'
    ]);
    exit;
}
