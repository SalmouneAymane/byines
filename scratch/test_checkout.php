<?php

// Test submission of Cash-on-Delivery checkout
$payload = [
    'shipping_name'          => 'Aymane Salmoune',
    'shipping_phone'         => '0619389174',
    'shipping_address_line1' => 'Bd Mohamed V, Quartier Maarif N 12',
    'shipping_city'          => 'Casablanca',
    'shipping_region'        => 'Casablanca-Settat',
    'items' => [
        [
            'variantId' => 15,
            'quantity'  => 2,
            'price'     => 35.00
        ]
    ]
];

$_SERVER['REQUEST_METHOD'] = 'POST';

// Mock php://input by defining input stream or passing data directly
ob_start();
require_once __DIR__ . '/../src/Config/Database.php';
require_once __DIR__ . '/../src/Contracts/OrderRepositoryInterface.php';
require_once __DIR__ . '/../src/Repositories/MySQL/MySQLOrderRepository.php';
require_once __DIR__ . '/../src/Controllers/Storefront/CheckoutController.php';

$db = \App\Config\Database::getInstance()->getConnection();
$orderRepo = new \App\Repositories\MySQL\MySQLOrderRepository($db);
$controller = new \App\Controllers\Storefront\CheckoutController($orderRepo);

// Execute directly with array
$result = $orderRepo->createOrder([
    'subtotal'               => 70.00,
    'shipping_cost'          => 5.00,
    'total_amount'           => 75.00,
    'shipping_name'          => $payload['shipping_name'],
    'shipping_phone'         => $payload['shipping_phone'],
    'shipping_address_line1' => $payload['shipping_address_line1'],
    'shipping_city'          => $payload['shipping_city'],
    'shipping_country'       => 'Morocco',
    'payment_method'         => 'cash_on_delivery'
], $payload['items']);

echo json_encode(['success' => true, 'data' => $result]);
