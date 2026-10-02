<?php

namespace App\Repositories\MySQL;

use App\Contracts\OrderRepositoryInterface;
use PDO;
use Exception;

class MySQLOrderRepository implements OrderRepositoryInterface {
    public function __construct(private PDO $db) {}

    public function createOrder(array $orderData, array $items): array {
        if (empty($items)) {
            throw new Exception("Cannot place an order with zero items.");
        }

        $this->db->beginTransaction();

        try {
            // Generate unique order number (e.g. BYN-2026-8492)
            $year = date('Y');
            $rand = sprintf("%04d", mt_rand(1000, 9999));
            $orderNumber = "BYN-{$year}-{$rand}";

            // Ensure order number is strictly unique
            $chkStmt = $this->db->prepare("SELECT COUNT(*) FROM orders WHERE order_number = :num");
            $chkStmt->execute(['num' => $orderNumber]);
            if ((int)$chkStmt->fetchColumn() > 0) {
                $orderNumber = "BYN-{$year}-" . sprintf("%04d", mt_rand(1000, 9999));
            }

            $stmt = $this->db->prepare("
                INSERT INTO orders (
                    user_id, order_number, subtotal, tax, shipping_cost, total_amount,
                    status, shipping_name, shipping_phone, shipping_address_line1,
                    shipping_address_line2, shipping_city, shipping_region,
                    shipping_postal_code, shipping_country, shipping_method,
                    payment_method, payment_status
                ) VALUES (
                    :user_id, :order_number, :subtotal, :tax, :shipping_cost, :total_amount,
                    'pending', :shipping_name, :shipping_phone, :shipping_address_line1,
                    :shipping_address_line2, :shipping_city, :shipping_region,
                    :shipping_postal_code, :shipping_country, :shipping_method,
                    :payment_method, 'unpaid'
                )
            ");

            $stmt->execute([
                'user_id'                => $orderData['user_id'] ?? null,
                'order_number'           => $orderNumber,
                'subtotal'               => (float) $orderData['subtotal'],
                'tax'                    => (float) ($orderData['tax'] ?? 0.00),
                'shipping_cost'          => (float) ($orderData['shipping_cost'] ?? 0.00),
                'total_amount'           => (float) $orderData['total_amount'],
                'shipping_name'          => trim($orderData['shipping_name']),
                'shipping_phone'         => trim($orderData['shipping_phone']),
                'shipping_address_line1' => trim($orderData['shipping_address_line1']),
                'shipping_address_line2' => !empty($orderData['shipping_address_line2']) ? trim($orderData['shipping_address_line2']) : null,
                'shipping_city'          => trim($orderData['shipping_city']),
                'shipping_region'        => !empty($orderData['shipping_region']) ? trim($orderData['shipping_region']) : null,
                'shipping_postal_code'   => !empty($orderData['shipping_postal_code']) ? trim($orderData['shipping_postal_code']) : null,
                'shipping_country'       => $orderData['shipping_country'] ?? 'Morocco',
                'shipping_method'        => $orderData['shipping_method'] ?? 'Moroccan Express Delivery',
                'payment_method'         => $orderData['payment_method'] ?? 'cash_on_delivery'
            ]);

            $orderId = (int) $this->db->lastInsertId();

            // Prepared statements for order items and variant stock deduction
            $itemStmt = $this->db->prepare("
                INSERT INTO order_items (order_id, variant_id, quantity, price)
                VALUES (:order_id, :variant_id, :quantity, :price)
            ");

            $stockStmt = $this->db->prepare("
                UPDATE product_variants 
                SET stock_quantity = GREATEST(0, stock_quantity - :qty)
                WHERE id = :variant_id
            ");

            foreach ($items as $item) {
                $variantId = (int) $item['variantId'];
                $quantity = max(1, (int) $item['quantity']);
                $price = (float) $item['price'];

                $itemStmt->execute([
                    'order_id'   => $orderId,
                    'variant_id' => $variantId,
                    'quantity'   => $quantity,
                    'price'      => $price
                ]);

                $stockStmt->execute([
                    'qty'        => $quantity,
                    'variant_id' => $variantId
                ]);
            }

            $this->db->commit();

            return [
                'order_id'     => $orderId,
                'order_number' => $orderNumber,
                'total_amount' => (float) $orderData['total_amount']
            ];
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getAllOrders(): array {
        $stmt = $this->db->query("
            SELECT o.*, COUNT(oi.id) AS total_items 
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            GROUP BY o.id
            ORDER BY o.id DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getOrderById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            return null;
        }

        $order['items'] = $this->getOrderItems((int)$order['id']);
        return $order;
    }

    public function getOrderByNumber(string $orderNumber): ?array {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE order_number = :number");
        $stmt->execute(['number' => $orderNumber]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            return null;
        }

        $order['items'] = $this->getOrderItems((int)$order['id']);
        return $order;
    }

    public function getOrdersByUserId(int $userId): array {
        $stmt = $this->db->prepare("
            SELECT o.*, COUNT(oi.id) AS total_items 
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            WHERE o.user_id = :user_id
            GROUP BY o.id
            ORDER BY o.id DESC
        ");
        $stmt->execute(['user_id' => $userId]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($orders as &$order) {
            $order['items'] = $this->getOrderItems((int)$order['id']);
        }

        return $orders;
    }

    public function updateOrderStatus(int $id, string $status): bool {
        $stmt = $this->db->prepare("UPDATE orders SET status = :status WHERE id = :id");
        return $stmt->execute(['status' => $status, 'id' => $id]);
    }

    private function getOrderItems(int $orderId): array {
        $stmt = $this->db->prepare("
            SELECT oi.*, p.name AS product_name, p.sku, pv.color, pv.size,
            (
                SELECT image_name 
                FROM product_images pi 
                WHERE pi.product_id = p.id 
                ORDER BY pi.is_main DESC, pi.sort_order ASC, pi.id ASC 
                LIMIT 1
            ) AS main_image
            FROM order_items oi
            JOIN product_variants pv ON pv.id = oi.variant_id
            JOIN products p ON p.id = pv.product_id
            WHERE oi.order_id = :order_id
        ");
        $stmt->execute(['order_id' => $orderId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
