<?php

require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../src/Config/Database.php';
require_once __DIR__ . '/../../src/Contracts/UserRepositoryInterface.php';
require_once __DIR__ . '/../../src/Repositories/MySQL/MySQLUserRepository.php';
require_once __DIR__ . '/../../src/Controllers/Storefront/AuthController.php';

use App\Config\Database;
use App\Repositories\MySQL\MySQLUserRepository;
use App\Controllers\Storefront\AuthController;

try {
    $db = Database::getInstance()->getConnection();
    $userRepo = new MySQLUserRepository($db);

    $controller = new AuthController($userRepo);
    $controller->handleRequest();
} catch (Throwable $e) {
    \App\Security\Security::handleCaughtApiException($e);
}
