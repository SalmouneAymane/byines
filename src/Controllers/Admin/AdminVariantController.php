<?php

namespace App\Controllers\Admin;

use App\Services\ProductService;
use App\Contracts\ProductVariantRepositoryInterface;

class AdminVariantController {
    public function __construct(
        private ProductVariantRepositoryInterface $variantRepo
    ) {}

    public function handleRequest(): void {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'GET') {
            $productId = isset($_GET['product_id']) ? (int) $_GET['product_id'] : 0;
            if (!$productId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'product_id parameter is required']);
                return;
            }

            $variants = $this->variantRepo->getByProductId($productId);
            echo json_encode(['success' => true, 'data' => $variants]);
            return;
        }

        if ($method === 'POST') {
            $data = $_POST;
            $rawInput = file_get_contents('php://input');
            if (!empty($rawInput)) {
                $json = json_decode($rawInput, true);
                if (is_array($json)) {
                    $data = array_merge($data, $json);
                }
            }

            $action = $_GET['action'] ?? $data['action'] ?? null;

            if ($action === 'update_stock') {
                $variantId = (int) ($data['variant_id'] ?? 0);
                $stock = (int) ($data['stock_quantity'] ?? 0);
                $updated = $this->variantRepo->updateStock($variantId, $stock);
                echo json_encode(['success' => $updated]);
                return;
            }

            if (!empty($data['product_id']) && isset($data['variants']) && is_array($data['variants'])) {
                $this->variantRepo->saveBatch((int) $data['product_id'], $data['variants']);
                echo json_encode([
                    'success' => true,
                    'message' => 'Variants matrix updated successfully',
                    'data'    => $this->variantRepo->getByProductId((int) $data['product_id'])
                ]);
                return;
            }

            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
            return;
        }

        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
}
