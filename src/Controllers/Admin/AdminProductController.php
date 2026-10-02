<?php

namespace App\Controllers\Admin;

use App\Services\ProductService;

class AdminProductController {
    public function __construct(private ProductService $productService) {}

    public function handleRequest(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? $_POST['action'] ?? null;

        if ($method === 'GET') {
            $id = isset($_GET['id']) ? (int) $_GET['id'] : null;
            if ($id) {
                $product = $this->productService->getProductById($id);
                if (!$product) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Product not found']);
                    return;
                }
                echo json_encode(['success' => true, 'data' => $product]);
            } else {
                $categoryId = isset($_GET['category_id']) ? (int) $_GET['category_id'] : null;
                $products = $this->productService->getAllProducts($categoryId);
                echo json_encode(['success' => true, 'data' => $products]);
            }
            return;
        }

        if ($method === 'POST') {
            if ($action === 'delete') {
                $id = (int) ($_GET['id'] ?? $_POST['id'] ?? 0);
                $result = $this->productService->deleteProduct($id);
                echo json_encode($result);
                return;
            }

            if ($action === 'upload_image') {
                $productId = (int) ($_GET['id'] ?? $_POST['id'] ?? 0);
                $color = $_POST['color'] ?? null;
                $isMain = !empty($_POST['is_main']);
                $file = $_FILES['image'] ?? null;

                if (!$file) {
                    echo json_encode(['success' => false, 'message' => 'No image file uploaded']);
                    return;
                }

                $result = $this->productService->uploadProductImage($productId, $file, $color, $isMain);
                echo json_encode($result);
                return;
            }

            if ($action === 'delete_image') {
                $imageId = (int) ($_GET['image_id'] ?? $_POST['image_id'] ?? 0);
                $result = $this->productService->deleteProductImage($imageId);
                echo json_encode($result);
                return;
            }

            if ($action === 'set_main_image') {
                $productId = (int) ($_GET['id'] ?? $_POST['id'] ?? 0);
                $imageId = (int) ($_GET['image_id'] ?? $_POST['image_id'] ?? 0);
                $result = $this->productService->setMainProductImage($productId, $imageId);
                echo json_encode($result);
                return;
            }

            // Parse request input (Form Data vs JSON)
            $data = $_POST;
            $rawInput = file_get_contents('php://input');
            if (!empty($rawInput)) {
                $json = json_decode($rawInput, true);
                if (is_array($json)) {
                    $data = array_merge($data, $json);
                }
            }

            // Decode nested collection_ids or variants if passed as JSON string in FormData
            if (isset($data['collection_ids']) && is_string($data['collection_ids'])) {
                $decoded = json_decode($data['collection_ids'], true);
                if (is_array($decoded)) {
                    $data['collection_ids'] = $decoded;
                }
            }
            if (isset($data['variants']) && is_string($data['variants'])) {
                $decoded = json_decode($data['variants'], true);
                if (is_array($decoded)) {
                    $data['variants'] = $decoded;
                }
            }

            if ($action === 'update' || !empty($_GET['id'])) {
                $id = (int) ($_GET['id'] ?? $data['id'] ?? 0);
                $result = $this->productService->updateProduct($id, $data, $_FILES);
            } else {
                $result = $this->productService->createProduct($data, $_FILES);
            }

            echo json_encode($result);
            return;
        }

        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
}
