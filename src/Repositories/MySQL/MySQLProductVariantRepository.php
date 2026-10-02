<?php

namespace App\Repositories\MySQL;

use App\Contracts\ProductVariantRepositoryInterface;
use PDO;

class MySQLProductVariantRepository implements ProductVariantRepositoryInterface {
    public function __construct(private PDO $db) {}

    public function getByProductId(int $productId): array {
        $stmt = $this->db->prepare("
            SELECT * FROM product_variants 
            WHERE product_id = :product_id 
            ORDER BY color ASC, size ASC
        ");
        $stmt->execute(['product_id' => $productId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM product_variants WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);
        return $res ?: null;
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare("
            INSERT INTO product_variants (product_id, color, size, stock_quantity, price_modifier)
            VALUES (:product_id, :color, :size, :stock_quantity, :price_modifier)
            ON DUPLICATE KEY UPDATE 
                stock_quantity = VALUES(stock_quantity),
                price_modifier = VALUES(price_modifier)
        ");
        $stmt->execute([
            'product_id'     => $data['product_id'],
            'color'          => $data['color'] ?? 'Default',
            'size'           => $data['size'] ?? 'M',
            'stock_quantity' => (int) ($data['stock_quantity'] ?? 0),
            'price_modifier' => (float) ($data['price_modifier'] ?? 0.00)
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $stmt = $this->db->prepare("
            UPDATE product_variants 
            SET color = :color,
                size = :size,
                stock_quantity = :stock_quantity,
                price_modifier = :price_modifier
            WHERE id = :id
        ");
        return $stmt->execute([
            'id'             => $id,
            'color'          => $data['color'] ?? 'Default',
            'size'           => $data['size'] ?? 'M',
            'stock_quantity' => (int) ($data['stock_quantity'] ?? 0),
            'price_modifier' => (float) ($data['price_modifier'] ?? 0.00)
        ]);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM product_variants WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    public function saveBatch(int $productId, array $variants): void {
        // First delete variants not in the new list if variant IDs are specified
        $existingIds = array_column(array_filter($variants, fn($v) => !empty($v['id'])), 'id');
        
        if (!empty($existingIds)) {
            $inClause = implode(',', array_map('intval', $existingIds));
            $delStmt = $this->db->prepare("DELETE FROM product_variants WHERE product_id = :product_id AND id NOT IN ($inClause)");
            $delStmt->execute(['product_id' => $productId]);
        } else if (!empty($variants)) {
            // If new variants are submitted without IDs, wipe and recreate to avoid duplicate key issues if colors/sizes changed
            $delStmt = $this->db->prepare("DELETE FROM product_variants WHERE product_id = :product_id");
            $delStmt->execute(['product_id' => $productId]);
        }

        $upsertStmt = $this->db->prepare("
            INSERT INTO product_variants (product_id, color, size, stock_quantity, price_modifier)
            VALUES (:product_id, :color, :size, :stock_quantity, :price_modifier)
            ON DUPLICATE KEY UPDATE 
                stock_quantity = VALUES(stock_quantity),
                price_modifier = VALUES(price_modifier)
        ");

        foreach ($variants as $variant) {
            $upsertStmt->execute([
                'product_id'     => $productId,
                'color'          => !empty($variant['color']) ? trim($variant['color']) : 'Default',
                'size'           => !empty($variant['size']) ? trim($variant['size']) : 'M',
                'stock_quantity' => max(0, (int) ($variant['stock_quantity'] ?? 0)),
                'price_modifier' => (float) ($variant['price_modifier'] ?? 0.00)
            ]);
        }
    }

    public function updateStock(int $variantId, int $stockQuantity): bool {
        $stmt = $this->db->prepare("UPDATE product_variants SET stock_quantity = :stock WHERE id = :id");
        return $stmt->execute([
            'stock' => max(0, $stockQuantity),
            'id'    => $variantId
        ]);
    }
}
