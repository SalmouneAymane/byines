<?php

namespace App\Repositories\MySQL;

use App\Contracts\CategoryRepositoryInterface;
use PDO;

class MySQLCategoryRepository implements CategoryRepositoryInterface {
    public function __construct(private PDO $db) {}

    public function getAll(): array {
        $stmt = $this->db->query("
            SELECT c.*, COUNT(p.id) AS products_count 
            FROM categories c 
            LEFT JOIN products p ON p.category_id = c.id 
            GROUP BY c.id 
            ORDER BY c.id DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare("
            INSERT INTO categories (name, slug, image_url) 
            VALUES (:name, :slug, :image_url)
        ");
        $stmt->execute([
            'name'      => $data['name'],
            'slug'      => $data['slug'],
            'image_url' => $data['image_url'] ?? null,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $stmt = $this->db->prepare("
            UPDATE categories 
            SET name = :name, slug = :slug, image_url = :image_url 
            WHERE id = :id
        ");
        return $stmt->execute([
            'id'        => $id,
            'name'      => $data['name'],
            'slug'      => $data['slug'],
            'image_url' => $data['image_url'] ?? null,
        ]);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM categories WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
