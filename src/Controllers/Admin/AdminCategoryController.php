<?php

namespace App\Controllers\Admin;

use App\Services\CategoryService;

class AdminCategoryController {
    public function __construct(private CategoryService $categoryService) {}

    public function handleRequest(): void {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        if ($method === 'GET') {
            if (isset($_GET['id'])) {
                $category = $this->categoryService->getCategoryById((int) $_GET['id']);
                if (!$category) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Category not found']);
                    return;
                }
                echo json_encode(['success' => true, 'data' => $category]);
                return;
            }

            $categories = $this->categoryService->getAllCategories();
            echo json_encode(['success' => true, 'data' => $categories]);
            return;
        }

        if ($method === 'POST') {
            $action = $_POST['action'] ?? 'create';
            if (isset($_SERVER['CONTENT_TYPE']) && str_contains($_SERVER['CONTENT_TYPE'], 'application/json')) {
                $input = json_decode(file_get_contents('php://input'), true) ?? [];
                $action = $input['action'] ?? $action;
            } else {
                $input = $_POST;
            }

            if ($action === 'delete') {
                $id = (int) ($input['id'] ?? 0);
                $result = $this->categoryService->deleteCategory($id);
                if (!$result['success']) {
                    http_response_code(400);
                }
                echo json_encode($result);
                return;
            }

            // Handle File Upload if present
            $imageUrl = trim($input['existing_image_url'] ?? $input['image_url'] ?? '');
            if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
                $file = $_FILES['image_file'];
                $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
                $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

                if (!in_array($ext, $allowedExtensions)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Invalid image format. Allowed: JPG, PNG, WEBP']);
                    return;
                }

                $uploadDir = __DIR__ . '/../../../public/uploads/categories/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }

                $filename = 'cat_' . time() . '_' . rand(100, 999) . '.' . $ext;
                if (move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
                    $imageUrl = $filename;
                }
            }

            $input['image_url'] = $imageUrl;

            if ($action === 'update') {
                $id = (int) ($input['id'] ?? 0);
                $result = $this->categoryService->updateCategory($id, $input);
                if (!$result['success']) {
                    http_response_code(400);
                }
                echo json_encode($result);
                return;
            }

            $result = $this->categoryService->createCategory($input);
            if (!$result['success']) {
                http_response_code(400);
            }
            echo json_encode($result);
            return;
        }

        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    }
}
