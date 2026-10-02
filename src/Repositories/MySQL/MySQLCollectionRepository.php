<?php

namespace App\Repositories\MySQL;

use App\Contracts\CollectionRepositoryInterface;
use PDO;

class MySQLCollectionRepository implements CollectionRepositoryInterface {
    public function __construct(private PDO $db) {}

    public function getAll(): array {
        $stmt = $this->db->query("
            SELECT c.*, COUNT(cp.product_id) AS products_count 
            FROM collections c 
            LEFT JOIN collection_products cp ON cp.collection_id = c.id 
            GROUP BY c.id 
            ORDER BY c.id DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM collections WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare("
            INSERT INTO collections (title, image_path, is_active) 
            VALUES (:title, :image_path, :is_active)
        ");
        $stmt->execute([
            'title'      => $data['title'],
            'image_path' => $data['image_path'] ?? null,
            'is_active'  => $data['is_active'] ?? 1
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $stmt = $this->db->prepare("
            UPDATE collections 
            SET title = :title, image_path = :image_path, is_active = :is_active 
            WHERE id = :id
        ");
        return $stmt->execute([
            'id'         => $id,
            'title'      => $data['title'],
            'image_path' => $data['image_path'] ?? null,
            'is_active'  => $data['is_active'] ?? 1
        ]);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM collections WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
