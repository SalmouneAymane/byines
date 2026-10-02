<?php

namespace App\Controllers\Admin;

use PDO;

class AdminStatsController {
    public function __construct(private PDO $db) {}

    public function handleRequest(): void {
        try {
            $totalProducts = (int) $this->db->query("SELECT COUNT(*) FROM products WHERE is_active = 1")->fetchColumn();
            $totalCategories = (int) $this->db->query("SELECT COUNT(*) FROM categories")->fetchColumn();
            $totalCollections = (int) $this->db->query("SELECT COUNT(*) FROM collections")->fetchColumn();
            $totalOrders = (int) $this->db->query("SELECT COUNT(*) FROM orders")->fetchColumn();
            $totalUsers = (int) $this->db->query("SELECT COUNT(*) FROM users")->fetchColumn();
            $lowStockCount = (int) $this->db->query("SELECT COUNT(*) FROM product_variants WHERE stock_quantity <= 5")->fetchColumn();

            echo json_encode([
                'success' => true,
                'data' => [
                    'total_products'    => $totalProducts,
                    'total_categories'  => $totalCategories,
                    'total_collections' => $totalCollections,
                    'total_orders'      => $totalOrders,
                    'total_users'       => $totalUsers,
                    'low_stock_count'   => $lowStockCount
                ]
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to load stats',
                'error'   => $e->getMessage()
            ]);
        }
    }
}
