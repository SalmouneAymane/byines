<?php

require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/check_auth.php';
require_once __DIR__ . '/../../src/Config/Database.php';
require_once __DIR__ . '/../../src/Contracts/ProductRepositoryInterface.php';
require_once __DIR__ . '/../../src/Contracts/ProductVariantRepositoryInterface.php';
require_once __DIR__ . '/../../src/Repositories/MySQL/MySQLProductRepository.php';
require_once __DIR__ . '/../../src/Repositories/MySQL/MySQLProductVariantRepository.php';
require_once __DIR__ . '/../../src/Services/ProductService.php';
require_once __DIR__ . '/../../src/Controllers/Admin/AdminProductController.php';

use App\Config\Database;
use App\Repositories\MySQL\MySQLProductRepository;
use App\Repositories\MySQL\MySQLProductVariantRepository;
use App\Services\ProductService;
use App\Controllers\Admin\AdminProductController;

try {
    $db = Database::getInstance()->getConnection();
    $productRepo = new MySQLProductRepository($db);
    $variantRepo = new MySQLProductVariantRepository($db);
    $service = new ProductService($productRepo, $variantRepo);
    $controller = new AdminProductController($service);

    $controller->handleRequest();
} catch (Throwable $e) {
    \App\Security\Security::handleCaughtApiException($e);
}
