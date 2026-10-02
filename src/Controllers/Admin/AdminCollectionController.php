<?php

namespace App\Controllers\Admin;

use App\Services\CollectionService;

class AdminCollectionController {
    public function __construct(private CollectionService $collectionService) {}

    public function handleRequest(): void {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        if ($method === 'GET') {
            if (isset($_GET['id'])) {
                $collection = $this->collectionService->getCollectionById((int) $_GET['id']);
                if (!$collection) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Collection not found']);
                    return;
                }
                echo json_encode(['success' => true, 'data' => $collection]);
                return;
            }

            $collections = $this->collectionService->getAllCollections();
            echo json_encode(['success' => true, 'data' => $collections]);
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
                $result = $this->collectionService->deleteCollection($id);
                if (!$result['success']) {
                    http_response_code(400);
                }
                echo json_encode($result);
                return;
            }

            // Handle File Upload if present
            $imagePath = trim($input['existing_image_path'] ?? $input['image_path'] ?? '');
            if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
                $file = $_FILES['image_file'];
                $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
                $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

                if (!in_array($ext, $allowedExtensions)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Invalid image format. Allowed: JPG, PNG, WEBP']);
                    return;
                }

                $uploadDir = __DIR__ . '/../../../public/uploads/collections/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }

                $filename = 'col_' . time() . '_' . rand(100, 999) . '.' . $ext;
                if (move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
                    $imagePath = $filename;
                }
            }

            $input['image_path'] = $imagePath;

            if ($action === 'update') {
                $id = (int) ($input['id'] ?? 0);
                $result = $this->collectionService->updateCollection($id, $input);
                if (!$result['success']) {
                    http_response_code(400);
                }
                echo json_encode($result);
                return;
            }

            $result = $this->collectionService->createCollection($input);
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
