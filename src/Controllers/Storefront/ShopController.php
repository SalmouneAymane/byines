<?php

namespace App\Controllers\Storefront;

use App\Contracts\ProductRepositoryInterface;

class ShopController {
    public function __construct(
        private ProductRepositoryInterface $productRepo
    ) {}

    public function handleRequest(): void {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        if ($method !== 'GET') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            return;
        }

        $action = $_GET['action'] ?? 'list';

        if ($action === 'filter_options') {
            $options = $this->productRepo->getFilterOptions();
            echo json_encode([
                'success' => true,
                'data' => $options
            ]);
            return;
        }

        // Parse filters from GET parameters
        $filters = [];

        if (!empty($_GET['category_id'])) {
            $filters['category_id'] = (int) $_GET['category_id'];
        }

        if (!empty($_GET['collection_id'])) {
            $filters['collection_id'] = (int) $_GET['collection_id'];
        }

        if (isset($_GET['min_price']) && $_GET['min_price'] !== '') {
            $filters['min_price'] = (float) $_GET['min_price'];
        }

        if (isset($_GET['max_price']) && $_GET['max_price'] !== '') {
            $filters['max_price'] = (float) $_GET['max_price'];
        }

        if (!empty($_GET['search'])) {
            $filters['search'] = trim($_GET['search']);
        }

        if (!empty($_GET['colors'])) {
            $filters['colors'] = is_array($_GET['colors']) ? $_GET['colors'] : explode(',', $_GET['colors']);
        }

        if (!empty($_GET['sizes'])) {
            $filters['sizes'] = is_array($_GET['sizes']) ? $_GET['sizes'] : explode(',', $_GET['sizes']);
        }

        if (!empty($_GET['sort'])) {
            $filters['sort'] = $_GET['sort'];
        }

        $products = $this->productRepo->getFilteredProducts($filters);
        $options = $this->productRepo->getFilterOptions();

        echo json_encode([
            'success' => true,
            'data' => [
                'products' => $products,
                'total' => count($products),
                'filter_options' => $options
            ]
        ]);
    }
}
