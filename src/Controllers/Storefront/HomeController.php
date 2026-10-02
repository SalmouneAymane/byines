<?php

namespace App\Controllers\Storefront;

use App\Contracts\CollectionRepositoryInterface;
use App\Contracts\ProductRepositoryInterface;
use App\Contracts\CategoryRepositoryInterface;

class HomeController {
    public function __construct(
        private CollectionRepositoryInterface $collectionRepo,
        private ProductRepositoryInterface $productRepo,
        private CategoryRepositoryInterface $categoryRepo
    ) {}

    public function handleRequest(): void {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method !== 'GET') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            return;
        }

        // Fetch active collections
        $allCollections = $this->collectionRepo->getAll();
        $activeCollections = array_values(array_filter($allCollections, fn($c) => (int)$c['is_active'] === 1));

        // Fetch featured products (active ones)
        $allProducts = $this->productRepo->getAll();
        $featuredProducts = array_values(array_filter($allProducts, fn($p) => (int)$p['is_active'] === 1));
        // Take top 8 for home showcase
        $featuredProducts = array_slice($featuredProducts, 0, 8);

        // Fetch categories
        $categories = $this->categoryRepo->getAll();

        echo json_encode([
            'success' => true,
            'data' => [
                'collections' => $activeCollections,
                'featured_products' => $featuredProducts,
                'categories' => $categories
            ]
        ]);
    }
}
