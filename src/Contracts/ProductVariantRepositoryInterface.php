<?php

namespace App\Contracts;

interface ProductVariantRepositoryInterface {
    public function getByProductId(int $productId): array;
    public function findById(int $id): ?array;
    public function create(array $data): int;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function saveBatch(int $productId, array $variants): void;
    public function updateStock(int $variantId, int $stockQuantity): bool;
}
