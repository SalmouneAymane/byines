<?php

require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../src/Config/Database.php';
require_once __DIR__ . '/../../src/Contracts/ProductRepositoryInterface.php';
require_once __DIR__ . '/../../src/Repositories/MySQL/MySQLProductRepository.php';
require_once __DIR__ . '/../../src/Controllers/Storefront/ShopController.php';

use App\Config\Database;
use App\Repositories\MySQL\MySQLProductRepository;
use App\Controllers\Storefront\ShopController;

try {
    $db = Database::getInstance()->getConnection();
    $productRepo = new MySQLProductRepository($db);

    $controller = new ShopController($productRepo);
    $controller->handleRequest();
} catch (Throwable $e) {
    \App\Security\Security::handleCaughtApiException($e);
}
