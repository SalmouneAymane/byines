<?php

namespace App\Contracts;

interface ProductRepositoryInterface {
    public function getAll(?int $categoryId = null): array;
    public function findById(int $id): ?array;
    public function findBySlug(string $slug): ?array;
    public function create(array $data): int;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function setCollections(int $productId, array $collectionIds): void;
    public function getCollectionIds(int $productId): array;
    public function getImages(int $productId): array;
    public function addImage(int $productId, string $imageName, ?string $color = null, int $sortOrder = 1, bool $isMain = false): int;
    public function deleteImage(int $imageId): bool;
    public function setMainImage(int $productId, int $imageId): void;
    public function getFilteredProducts(array $filters = []): array;
    public function getFilterOptions(): array;
    public function getRelatedProducts(int $categoryId, int $excludeProductId, int $limit = 4): array;
}
