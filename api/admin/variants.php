<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/check_auth.php';
require_once __DIR__ . '/../../src/Config/Database.php';
require_once __DIR__ . '/../../src/Contracts/ProductVariantRepositoryInterface.php';
require_once __DIR__ . '/../../src/Repositories/MySQL/MySQLProductVariantRepository.php';
require_once __DIR__ . '/../../src/Controllers/Admin/AdminVariantController.php';

use App\Config\Database;
use App\Repositories\MySQL\MySQLProductVariantRepository;
use App\Controllers\Admin\AdminVariantController;

try {
    $db = Database::getInstance()->getConnection();
    $variantRepo = new MySQLProductVariantRepository($db);
    $controller = new AdminVariantController($variantRepo);

    $controller->handleRequest();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error'   => $e->getMessage()
    ]);
}
