<?php

namespace App\Services;

use App\Contracts\ProductRepositoryInterface;
use App\Contracts\ProductVariantRepositoryInterface;

class ProductService {
    public function __construct(
        private ProductRepositoryInterface $productRepo,
        private ProductVariantRepositoryInterface $variantRepo
    ) {}

    public function getAllProducts(?int $categoryId = null): array {
        return $this->productRepo->getAll($categoryId);
    }

    public function getProductById(int $id): ?array {
        $product = $this->productRepo->findById($id);
        if (!$product) {
            return null;
        }

        $product['variants'] = $this->variantRepo->getByProductId($id);
        return $product;
    }

    public function createProduct(array $data, array $files = []): array {
        $errors = $this->validateProductData($data);
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }

        $slug = !empty($data['slug']) ? $this->slugify($data['slug']) : $this->slugify($data['name']);
        $slug = $this->ensureUniqueSlug($slug);

        $sku = !empty($data['sku']) ? trim($data['sku']) : $this->generateSku($data['name']);

        $productId = $this->productRepo->create([
            'category_id' => (int) $data['category_id'],
            'name'        => trim($data['name']),
            'slug'        => $slug,
            'sku'         => $sku,
            'description' => trim($data['description'] ?? ''),
            'price'       => (float) $data['price'],
            'old_price'   => !empty($data['old_price']) ? (float) $data['old_price'] : null,
            'is_active'   => isset($data['is_active']) ? (int) $data['is_active'] : 1
        ]);

        // Process Collections
        if (isset($data['collection_ids']) && is_array($data['collection_ids'])) {
            $this->productRepo->setCollections($productId, $data['collection_ids']);
        }

        // Process Variants
        if (!empty($data['variants']) && is_array($data['variants'])) {
            $this->variantRepo->saveBatch($productId, $data['variants']);
        } else {
            // Default single variant if none provided
            $this->variantRepo->create([
                'product_id'     => $productId,
                'color'          => 'Default',
                'size'           => 'M',
                'stock_quantity' => (int) ($data['stock_quantity'] ?? 10),
                'price_modifier' => 0.00
            ]);
        }

        // Process File Uploads (Multiple Images)
        if (!empty($files['images'])) {
            $this->handleImageUploads($productId, $files['images']);
        }

        return [
            'success' => true,
            'message' => 'Product created successfully',
            'data'    => $this->getProductById($productId)
        ];
    }

    public function updateProduct(int $id, array $data, array $files = []): array {
        $existing = $this->productRepo->findById($id);
        if (!$existing) {
            return ['success' => false, 'message' => 'Product not found'];
        }

        $errors = $this->validateProductData($data);
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }

        $slug = !empty($data['slug']) ? $this->slugify($data['slug']) : $this->slugify($data['name']);
        $slug = $this->ensureUniqueSlug($slug, $id);

        $sku = !empty($data['sku']) ? trim($data['sku']) : $existing['sku'];

        $this->productRepo->update($id, [
            'category_id' => (int) $data['category_id'],
            'name'        => trim($data['name']),
            'slug'        => $slug,
            'sku'         => $sku,
            'description' => trim($data['description'] ?? ''),
            'price'       => (float) $data['price'],
            'old_price'   => !empty($data['old_price']) ? (float) $data['old_price'] : null,
            'is_active'   => isset($data['is_active']) ? (int) $data['is_active'] : 1
        ]);

        // Process Collections
        if (isset($data['collection_ids']) && is_array($data['collection_ids'])) {
            $this->productRepo->setCollections($id, $data['collection_ids']);
        }

        // Process Variants
        if (isset($data['variants']) && is_array($data['variants'])) {
            $this->variantRepo->saveBatch($id, $data['variants']);
        }

        // Process File Uploads (Multiple Images)
        if (!empty($files['images'])) {
            $this->handleImageUploads($id, $files['images']);
        }

        return [
            'success' => true,
            'message' => 'Product updated successfully',
            'data'    => $this->getProductById($id)
        ];
    }

    public function deleteProduct(int $id): array {
        $product = $this->productRepo->findById($id);
        if (!$product) {
            return ['success' => false, 'message' => 'Product not found'];
        }

        // Remove stored image files
        $images = $this->productRepo->getImages($id);
        $uploadDir = __DIR__ . '/../../public/uploads/products/';
        foreach ($images as $img) {
            if (!empty($img['image_name'])) {
                $filePath = $uploadDir . $img['image_name'];
                if (file_exists($filePath)) {
                    @unlink($filePath);
                }
            }
        }

        $this->productRepo->delete($id);

        return ['success' => true, 'message' => 'Product deleted successfully'];
    }

    public function uploadProductImage(int $productId, array $file, ?string $color = null, bool $isMain = false): array {
        $product = $this->productRepo->findById($productId);
        if (!$product) {
            return ['success' => false, 'message' => 'Product not found'];
        }

        $uploaded = $this->saveSingleImageFile($file);
        if (!$uploaded['success']) {
            return $uploaded;
        }

        $imageId = $this->productRepo->addImage($productId, $uploaded['filename'], $color, 1, $isMain);

        return [
            'success'  => true,
            'message'  => 'Image uploaded successfully',
            'image_id' => $imageId,
            'filename' => $uploaded['filename'],
            'images'   => $this->productRepo->getImages($productId)
        ];
    }

    public function deleteProductImage(int $imageId): array {
        $deleted = $this->productRepo->deleteImage($imageId);
        if (!$deleted) {
            return ['success' => false, 'message' => 'Image not found or could not be deleted'];
        }

        return ['success' => true, 'message' => 'Image deleted successfully'];
    }

    public function setMainProductImage(int $productId, int $imageId): array {
        $this->productRepo->setMainImage($productId, $imageId);
        return [
            'success' => true,
            'message' => 'Main image updated',
            'images'  => $this->productRepo->getImages($productId)
        ];
    }

    public function updateVariantStock(int $variantId, int $stockQuantity): array {
        $updated = $this->variantRepo->updateStock($variantId, $stockQuantity);
        if (!$updated) {
            return ['success' => false, 'message' => 'Variant not found'];
        }

        return ['success' => true, 'message' => 'Variant stock updated'];
    }

    private function validateProductData(array $data): array {
        $errors = [];
        if (empty($data['name'])) {
            $errors[] = 'Product name is required';
        }
        if (empty($data['category_id'])) {
            $errors[] = 'Category is required';
        }
        if (!isset($data['price']) || !is_numeric($data['price']) || (float)$data['price'] < 0) {
            $errors[] = 'Valid product price is required';
        }
        return $errors;
    }

    private function slugify(string $text): string {
        $text = preg_replace('~[^\pL\d]+~u', '-', $text);
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
        $text = preg_replace('~[^-\w]+~', '', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);
        $text = strtolower($text);
        return empty($text) ? 'product' : $text;
    }

    private function ensureUniqueSlug(string $slug, ?int $excludeId = null): string {
        $originalSlug = $slug;
        $counter = 1;
        while (true) {
            $existing = $this->productRepo->findBySlug($slug);
            if (!$existing || ($excludeId !== null && (int)$existing['id'] === $excludeId)) {
                break;
            }
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }
        return $slug;
    }

    private function generateSku(string $name): string {
        $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $name), 0, 3));
        if (strlen($prefix) < 3) {
            $prefix = 'PRD';
        }
        return strtolower($prefix) . '-' . rand(100, 999);
    }

    private function handleImageUploads(int $productId, array $files): void {
        // Multi-file structure handling
        if (isset($files['name']) && is_array($files['name'])) {
            $count = count($files['name']);
            for ($i = 0; $i < $count; $i++) {
                if ($files['error'][$i] === UPLOAD_ERR_OK) {
                    $singleFile = [
                        'name'     => $files['name'][$i],
                        'type'     => $files['type'][$i],
                        'tmp_name' => $files['tmp_name'][$i],
                        'error'    => $files['error'][$i],
                        'size'     => $files['size'][$i]
                    ];
                    $res = $this->saveSingleImageFile($singleFile);
                    if ($res['success']) {
                        $this->productRepo->addImage($productId, $res['filename'], null, $i + 1, false);
                    }
                }
            }
        }
    }

    private function saveSingleImageFile(array $file): array {
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        if (!in_array($ext, $allowedExtensions)) {
            return ['success' => false, 'message' => 'Invalid image type. Allowed: JPG, PNG, WEBP'];
        }

        if ($file['size'] > 5 * 1024 * 1024) { // 5MB limit
            return ['success' => false, 'message' => 'Image file size exceeds 5MB limit'];
        }

        $uploadDir = __DIR__ . '/../../public/uploads/products/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $filename = 'prod_' . time() . '_' . uniqid() . '.' . $ext;
        $targetPath = $uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            return ['success' => false, 'message' => 'Failed to move uploaded file'];
        }

        return ['success' => true, 'filename' => $filename];
    }
}
