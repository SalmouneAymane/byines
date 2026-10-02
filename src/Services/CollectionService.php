<?php

namespace App\Services;

use App\Contracts\CollectionRepositoryInterface;

class CollectionService {
    public function __construct(private CollectionRepositoryInterface $collectionRepo) {}

    public function getAllCollections(): array {
        return $this->collectionRepo->getAll();
    }

    public function getCollectionById(int $id): ?array {
        return $this->collectionRepo->findById($id);
    }

    public function createCollection(array $data): array {
        $title = trim($data['title'] ?? '');
        $imagePath = trim($data['image_path'] ?? '');
        $isActive = isset($data['is_active']) ? (int) $data['is_active'] : 1;

        if (empty($title)) {
            return ['success' => false, 'message' => 'Collection title is required'];
        }

        $newId = $this->collectionRepo->create([
            'title'      => $title,
            'image_path' => $imagePath,
            'is_active'  => $isActive
        ]);

        return [
            'success'    => true,
            'message'    => 'Collection created successfully',
            'id'         => $newId,
            'image_path' => $imagePath
        ];
    }

    public function updateCollection(int $id, array $data): array {
        if ($id <= 0) {
            return ['success' => false, 'message' => 'Invalid collection ID for update'];
        }

        $title = trim($data['title'] ?? '');
        $imagePath = trim($data['image_path'] ?? '');
        $isActive = isset($data['is_active']) ? (int) $data['is_active'] : 1;

        if (empty($title)) {
            return ['success' => false, 'message' => 'Collection title is required'];
        }

        $updated = $this->collectionRepo->update($id, [
            'title'      => $title,
            'image_path' => $imagePath,
            'is_active'  => $isActive
        ]);

        return [
            'success'    => $updated,
            'message'    => $updated ? 'Collection updated successfully' : 'Failed to update collection',
            'image_path' => $imagePath
        ];
    }

    public function deleteCollection(int $id): array {
        if ($id <= 0) {
            return ['success' => false, 'message' => 'Invalid collection ID for deletion'];
        }

        $deleted = $this->collectionRepo->delete($id);
        return [
            'success' => $deleted,
            'message' => $deleted ? 'Collection deleted successfully' : 'Failed to delete collection'
        ];
    }
}
