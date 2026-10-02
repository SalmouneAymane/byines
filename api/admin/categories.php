<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/check_auth.php';
require_once __DIR__ . '/../../src/Config/Database.php';
require_once __DIR__ . '/../../src/Contracts/CategoryRepositoryInterface.php';
require_once __DIR__ . '/../../src/Repositories/MySQL/MySQLCategoryRepository.php';
require_once __DIR__ . '/../../src/Services/CategoryService.php';
require_once __DIR__ . '/../../src/Controllers/Admin/AdminCategoryController.php';

use App\Config\Database;
use App\Repositories\MySQL\MySQLCategoryRepository;
use App\Services\CategoryService;
use App\Controllers\Admin\AdminCategoryController;

try {
    $db = Database::getInstance()->getConnection();
    $repository = new MySQLCategoryRepository($db);
    $service = new CategoryService($repository);
    $controller = new AdminCategoryController($service);

    $controller->handleRequest();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error'   => $e->getMessage()
    ]);
}
