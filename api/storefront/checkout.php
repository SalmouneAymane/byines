<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../src/Config/Database.php';
require_once __DIR__ . '/../../src/Contracts/OrderRepositoryInterface.php';
require_once __DIR__ . '/../../src/Repositories/MySQL/MySQLOrderRepository.php';
require_once __DIR__ . '/../../src/Controllers/Storefront/CheckoutController.php';

use App\Config\Database;
use App\Repositories\MySQL\MySQLOrderRepository;
use App\Controllers\Storefront\CheckoutController;

try {
    $db = Database::getInstance()->getConnection();
    $orderRepo = new MySQLOrderRepository($db);

    $controller = new CheckoutController($orderRepo);
    $controller->handleRequest();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error'   => $e->getMessage()
    ]);
}
