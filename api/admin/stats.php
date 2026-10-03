<?php

require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/check_auth.php';
require_once __DIR__ . '/../../src/Config/Database.php';
require_once __DIR__ . '/../../src/Controllers/Admin/AdminStatsController.php';

use App\Config\Database;
use App\Controllers\Admin\AdminStatsController;

try {
    $db = Database::getInstance()->getConnection();
    $controller = new AdminStatsController($db);
    $controller->handleRequest();
} catch (Throwable $e) {
    \App\Security\Security::handleCaughtApiException($e, 'Failed to load admin stats');
}
