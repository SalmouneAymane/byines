<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../src/Config/Database.php';
require_once __DIR__ . '/../../src/Contracts/CollectionRepositoryInterface.php';
require_once __DIR__ . '/../../src/Contracts/ProductRepositoryInterface.php';
require_once __DIR__ . '/../../src/Contracts/ProductVariantRepositoryInterface.php';
require_once __DIR__ . '/../../src/Contracts/CategoryRepositoryInterface.php';

require_once __DIR__ . '/../../src/Repositories/MySQL/MySQLCollectionRepository.php';
require_once __DIR__ . '/../../src/Repositories/MySQL/MySQLProductRepository.php';
require_once __DIR__ . '/../../src/Repositories/MySQL/MySQLCategoryRepository.php';

require_once __DIR__ . '/../../src/Controllers/Storefront/HomeController.php';

use App\Config\Database;
use App\Repositories\MySQL\MySQLCollectionRepository;
use App\Repositories\MySQL\MySQLProductRepository;
use App\Repositories\MySQL\MySQLCategoryRepository;
use App\Controllers\Storefront\HomeController;

try {
    $db = Database::getInstance()->getConnection();
    $collectionRepo = new MySQLCollectionRepository($db);
    $productRepo = new MySQLProductRepository($db);
    $categoryRepo = new MySQLCategoryRepository($db);

    $controller = new HomeController($collectionRepo, $productRepo, $categoryRepo);
    $controller->handleRequest();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error'   => $e->getMessage()
    ]);
}
