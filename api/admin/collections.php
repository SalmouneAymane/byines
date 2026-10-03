<?php

require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/check_auth.php';
require_once __DIR__ . '/../../src/Config/Database.php';
require_once __DIR__ . '/../../src/Contracts/CollectionRepositoryInterface.php';
require_once __DIR__ . '/../../src/Repositories/MySQL/MySQLCollectionRepository.php';
require_once __DIR__ . '/../../src/Services/CollectionService.php';
require_once __DIR__ . '/../../src/Controllers/Admin/AdminCollectionController.php';

use App\Config\Database;
use App\Repositories\MySQL\MySQLCollectionRepository;
use App\Services\CollectionService;
use App\Controllers\Admin\AdminCollectionController;

try {
    $db = Database::getInstance()->getConnection();
    $repository = new MySQLCollectionRepository($db);
    $service = new CollectionService($repository);
    $controller = new AdminCollectionController($service);

    $controller->handleRequest();
} catch (Throwable $e) {
    \App\Security\Security::handleCaughtApiException($e);
}
