<?php

require_once __DIR__ . '/../bootstrap.php';

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === realpath(__FILE__)) {
    http_response_code(404);
    exit;
}

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
