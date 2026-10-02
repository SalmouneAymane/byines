<?php

namespace App\Controllers\Storefront;

use App\Contracts\OrderRepositoryInterface;
use Exception;

class CheckoutController {
    public function __construct(
        private OrderRepositoryInterface $orderRepo
    ) {}

    public function handleRequest(): void {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'POST';

        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON payload.']);
            return;
        }

        // Validate mandatory Moroccan shipping fields
        $name = trim($input['shipping_name'] ?? '');
        $phone = trim($input['shipping_phone'] ?? '');
        $address = trim($input['shipping_address_line1'] ?? '');
        $city = trim($input['shipping_city'] ?? '');
        $items = $input['items'] ?? [];

        if (empty($name) || strlen($name) < 2) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Please provide a valid full name.']);
            return;
        }

        if (empty($phone) || strlen($phone) < 8) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Please enter a valid Moroccan phone number (e.g. 0612345678 or 0712345678).']);
            return;
        }

        if (empty($address)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Please provide a delivery address or Quartier.']);
            return;
        }

        if (empty($city)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Please select or enter a Moroccan city (e.g. Casablanca, Rabat, Marrakech).']);
            return;
        }

        if (empty($items) || !is_array($items)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Your shopping bag is empty.']);
            return;
        }

        // Calculate Subtotal and Shipping
        $subtotal = 0.0;
        $validItems = [];

        foreach ($items as $item) {
            $variantId = $item['variantId'] ?? null;
            $qty = max(1, (int) ($item['quantity'] ?? 1));
            $price = (float) ($item['price'] ?? 0);

            if (!$variantId || $price <= 0) continue;

            $subtotal += ($price * $qty);
            $validItems[] = [
                'variantId' => $variantId,
                'quantity'  => $qty,
                'price'     => $price
            ];
        }

        if (empty($validItems)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'No valid items found in checkout request.']);
            return;
        }

        // Free Moroccan shipping over $100, otherwise $5.00
        $shippingCost = $subtotal >= 100.00 ? 0.00 : 5.00;
        $totalAmount = $subtotal + $shippingCost;

        $orderData = [
            'user_id'                => $_SESSION['user_id'] ?? null,
            'subtotal'               => $subtotal,
            'tax'                    => 0.00,
            'shipping_cost'          => $shippingCost,
            'total_amount'           => $totalAmount,
            'shipping_name'          => $name,
            'shipping_phone'         => $phone,
            'shipping_address_line1' => $address,
            'shipping_address_line2' => !empty($input['shipping_address_line2']) ? trim($input['shipping_address_line2']) : null,
            'shipping_city'          => $city,
            'shipping_region'        => !empty($input['shipping_region']) ? trim($input['shipping_region']) : null,
            'shipping_postal_code'   => !empty($input['shipping_postal_code']) ? trim($input['shipping_postal_code']) : null,
            'shipping_country'       => 'Morocco',
            'shipping_method'        => 'Moroccan Express Delivery',
            'payment_method'         => 'cash_on_delivery'
        ];

        try {
            $result = $this->orderRepo->createOrder($orderData, $validItems);

            echo json_encode([
                'success' => true,
                'message' => 'Your Cash-on-Delivery order has been placed successfully!',
                'data'    => $result
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to process your order: ' . $e->getMessage()
            ]);
        }
    }
}
