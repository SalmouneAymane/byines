<?php

require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../src/Config/Database.php';
require_once __DIR__ . '/../../src/Contracts/UserRepositoryInterface.php';
require_once __DIR__ . '/../../src/Contracts/OrderRepositoryInterface.php';
require_once __DIR__ . '/../../src/Repositories/MySQL/MySQLUserRepository.php';
require_once __DIR__ . '/../../src/Repositories/MySQL/MySQLOrderRepository.php';
require_once __DIR__ . '/../../src/Controllers/Storefront/AccountController.php';

use App\Config\Database;
use App\Repositories\MySQL\MySQLUserRepository;
use App\Repositories\MySQL\MySQLOrderRepository;
use App\Controllers\Storefront\AccountController;

try {
    $db = Database::getInstance()->getConnection();
    $userRepo = new MySQLUserRepository($db);
    $orderRepo = new MySQLOrderRepository($db);

    $controller = new AccountController($userRepo, $orderRepo);
    $controller->handleRequest();
} catch (Throwable $e) {
    \App\Security\Security::handleCaughtApiException($e);
}
