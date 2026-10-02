<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/check_auth.php';
require_once __DIR__ . '/../../src/Config/Database.php';
require_once __DIR__ . '/../../src/Contracts/OrderRepositoryInterface.php';
require_once __DIR__ . '/../../src/Repositories/MySQL/MySQLOrderRepository.php';

use App\Config\Database;
use App\Repositories\MySQL\MySQLOrderRepository;

try {
    $db = Database::getInstance()->getConnection();
    $orderRepo = new MySQLOrderRepository($db);

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $id     = isset($_GET['id']) ? (int) $_GET['id'] : null;

    if ($method === 'GET') {
        if ($id) {
            $order = $orderRepo->getOrderById($id);
            if (!$order) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Order not found.']);
                exit;
            }
            echo json_encode(['success' => true, 'data' => $order]);
        } else {
            $orders = $orderRepo->getAllOrders();
            echo json_encode(['success' => true, 'data' => $orders]);
        }
        exit;
    }

    if ($method === 'PUT' && $id) {
        $input  = json_decode(file_get_contents('php://input'), true);
        $status = trim($input['status'] ?? '');

        $allowed = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!in_array($status, $allowed, true)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Invalid status value.']);
            exit;
        }

        $updated = $orderRepo->updateOrderStatus($id, $status);
        if ($updated) {
            echo json_encode(['success' => true, 'message' => "Order status updated to '{$status}' successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update order status.']);
        }
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error'   => $e->getMessage()
    ]);
}
