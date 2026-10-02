<?php

namespace App\Controllers\Storefront;

use App\Contracts\ProductRepositoryInterface;
use App\Contracts\ProductVariantRepositoryInterface;

class ProductDetailController {
    public function __construct(
        private ProductRepositoryInterface $productRepo,
        private ProductVariantRepositoryInterface $variantRepo
    ) {}

    public function handleRequest(): void {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        if ($method !== 'GET') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            return;
        }

        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        $slug = $_GET['slug'] ?? '';

        $product = null;
        if ($id > 0) {
            $product = $this->productRepo->findById($id);
        } else if (!empty($slug)) {
            $product = $this->productRepo->findBySlug($slug);
        }

        if (!$product || (int) $product['is_active'] !== 1) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Product not found']);
            return;
        }

        $productId = (int) $product['id'];
        $categoryId = (int) $product['category_id'];

        // Get product variants
        $variants = $this->variantRepo->getByProductId($productId);

        // Get related products
        $relatedProducts = $this->productRepo->getRelatedProducts($categoryId, $productId, 4);

        echo json_encode([
            'success' => true,
            'data' => [
                'product' => $product,
                'variants' => $variants,
                'related_products' => $relatedProducts
            ]
        ]);
    }
}
