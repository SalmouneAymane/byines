<?php

namespace App\Services;

use App\Contracts\CategoryRepositoryInterface;

class CategoryService {
    public function __construct(private CategoryRepositoryInterface $categoryRepo) {}

    public function getAllCategories(): array {
        return $this->categoryRepo->getAll();
    }

    public function getCategoryById(int $id): ?array {
        return $this->categoryRepo->findById($id);
    }

    public function createCategory(array $data): array {
        $name = trim($data['name'] ?? '');
        $slug = trim($data['slug'] ?? '');
        $imageUrl = trim($data['image_url'] ?? '');

        if (empty($name)) {
            return ['success' => false, 'message' => 'Category name is required'];
        }

        if (empty($slug)) {
            $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));
        }

        $newId = $this->categoryRepo->create([
            'name'      => $name,
            'slug'      => $slug,
            'image_url' => $imageUrl
        ]);

        return [
            'success'   => true,
            'message'   => 'Category created successfully',
            'id'        => $newId,
            'image_url' => $imageUrl
        ];
    }

    public function updateCategory(int $id, array $data): array {
        if ($id <= 0) {
            return ['success' => false, 'message' => 'Invalid category ID for update'];
        }

        $name = trim($data['name'] ?? '');
        $slug = trim($data['slug'] ?? '');
        $imageUrl = trim($data['image_url'] ?? '');

        if (empty($name)) {
            return ['success' => false, 'message' => 'Category name is required'];
        }

        if (empty($slug)) {
            $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));
        }

        $updated = $this->categoryRepo->update($id, [
            'name'      => $name,
            'slug'      => $slug,
            'image_url' => $imageUrl
        ]);

        return [
            'success'   => $updated,
            'message'   => $updated ? 'Category updated successfully' : 'Failed to update category',
            'image_url' => $imageUrl
        ];
    }

    public function deleteCategory(int $id): array {
        if ($id <= 0) {
            return ['success' => false, 'message' => 'Invalid category ID for deletion'];
        }

        $deleted = $this->categoryRepo->delete($id);
        return [
            'success' => $deleted,
            'message' => $deleted ? 'Category deleted successfully' : 'Failed to delete category'
        ];
    }
}
