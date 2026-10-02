<?php

namespace App\Repositories\MySQL;

use App\Contracts\ProductRepositoryInterface;
use PDO;

class MySQLProductRepository implements ProductRepositoryInterface {
    public function __construct(private PDO $db) {}

    public function getAll(?int $categoryId = null): array {
        $sql = "
            SELECT 
                p.*,
                c.name AS category_name,
                COALESCE(SUM(pv.stock_quantity), 0) AS total_stock,
                COUNT(DISTINCT pv.id) AS variants_count,
                (
                    SELECT image_name 
                    FROM product_images pi 
                    WHERE pi.product_id = p.id 
                    ORDER BY pi.is_main DESC, pi.sort_order ASC, pi.id ASC 
                    LIMIT 1
                ) AS main_image
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN product_variants pv ON pv.product_id = p.id
        ";

        $params = [];
        if ($categoryId !== null) {
            $sql .= " WHERE p.category_id = :category_id";
            $params['category_id'] = $categoryId;
        }

        $sql .= " GROUP BY p.id ORDER BY p.id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Populate collection IDs for each product
        foreach ($products as &$product) {
            $product['collection_ids'] = $this->getCollectionIds((int) $product['id']);
        }

        return $products;
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("
            SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.id = :id
        ");
        $stmt->execute(['id' => $id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            return null;
        }

        $product['collection_ids'] = $this->getCollectionIds($id);
        $product['images'] = $this->getImages($id);

        return $product;
    }

    public function findBySlug(string $slug): ?array {
        $stmt = $this->db->prepare("
            SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.slug = :slug
        ");
        $stmt->execute(['slug' => $slug]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            return null;
        }

        $product['collection_ids'] = $this->getCollectionIds((int) $product['id']);
        $product['images'] = $this->getImages((int) $product['id']);

        return $product;
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare("
            INSERT INTO products (category_id, name, slug, sku, description, price, old_price, is_active)
            VALUES (:category_id, :name, :slug, :sku, :description, :price, :old_price, :is_active)
        ");
        $stmt->execute([
            'category_id' => $data['category_id'],
            'name'        => $data['name'],
            'slug'        => $data['slug'],
            'sku'         => $data['sku'],
            'description' => $data['description'] ?? '',
            'price'       => $data['price'],
            'old_price'   => !empty($data['old_price']) ? $data['old_price'] : null,
            'is_active'   => isset($data['is_active']) ? (int) $data['is_active'] : 1
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $stmt = $this->db->prepare("
            UPDATE products 
            SET category_id = :category_id,
                name = :name,
                slug = :slug,
                sku = :sku,
                description = :description,
                price = :price,
                old_price = :old_price,
                is_active = :is_active
            WHERE id = :id
        ");
        return $stmt->execute([
            'id'          => $id,
            'category_id' => $data['category_id'],
            'name'        => $data['name'],
            'slug'        => $data['slug'],
            'sku'         => $data['sku'],
            'description' => $data['description'] ?? '',
            'price'       => $data['price'],
            'old_price'   => !empty($data['old_price']) ? $data['old_price'] : null,
            'is_active'   => isset($data['is_active']) ? (int) $data['is_active'] : 1
        ]);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM products WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    public function setCollections(int $productId, array $collectionIds): void {
        $stmt = $this->db->prepare("DELETE FROM collection_products WHERE product_id = :product_id");
        $stmt->execute(['product_id' => $productId]);

        if (empty($collectionIds)) {
            return;
        }

        $insertStmt = $this->db->prepare("
            INSERT INTO collection_products (collection_id, product_id, sort_order)
            VALUES (:collection_id, :product_id, 0)
        ");

        foreach ($collectionIds as $colId) {
            $insertStmt->execute([
                'collection_id' => (int) $colId,
                'product_id'    => $productId
            ]);
        }
    }

    public function getCollectionIds(int $productId): array {
        $stmt = $this->db->prepare("SELECT collection_id FROM collection_products WHERE product_id = :product_id");
        $stmt->execute(['product_id' => $productId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function getImages(int $productId): array {
        $stmt = $this->db->prepare("
            SELECT * FROM product_images 
            WHERE product_id = :product_id 
            ORDER BY is_main DESC, sort_order ASC, id ASC
        ");
        $stmt->execute(['product_id' => $productId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addImage(int $productId, string $imageName, ?string $color = null, int $sortOrder = 1, bool $isMain = false): int {
        if ($isMain) {
            $resetStmt = $this->db->prepare("UPDATE product_images SET is_main = 0 WHERE product_id = :product_id");
            $resetStmt->execute(['product_id' => $productId]);
        } else {
            // Check if there are any existing images for this product; if not, make this first one main
            $checkStmt = $this->db->prepare("SELECT COUNT(*) FROM product_images WHERE product_id = :product_id");
            $checkStmt->execute(['product_id' => $productId]);
            if ((int) $checkStmt->fetchColumn() === 0) {
                $isMain = true;
            }
        }

        $stmt = $this->db->prepare("
            INSERT INTO product_images (product_id, color, image_name, sort_order, is_main)
            VALUES (:product_id, :color, :image_name, :sort_order, :is_main)
        ");
        $stmt->execute([
            'product_id' => $productId,
            'color'      => $color ?: null,
            'image_name' => $imageName,
            'sort_order' => $sortOrder,
            'is_main'    => $isMain ? 1 : 0
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function deleteImage(int $imageId): bool {
        // Fetch image details before deleting to re-assign main image if needed
        $stmt = $this->db->prepare("SELECT product_id, is_main FROM product_images WHERE id = :id");
        $stmt->execute(['id' => $imageId]);
        $img = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$img) {
            return false;
        }

        $delStmt = $this->db->prepare("DELETE FROM product_images WHERE id = :id");
        $result = $delStmt->execute(['id' => $imageId]);

        if ($result && $img['is_main']) {
            // Set another image as main if available
            $setMainStmt = $this->db->prepare("
                UPDATE product_images 
                SET is_main = 1 
                WHERE product_id = :product_id 
                ORDER BY sort_order ASC, id ASC 
                LIMIT 1
            ");
            $setMainStmt->execute(['product_id' => $img['product_id']]);
        }

        return $result;
    }

    public function setMainImage(int $productId, int $imageId): void {
        $resetStmt = $this->db->prepare("UPDATE product_images SET is_main = 0 WHERE product_id = :product_id");
        $resetStmt->execute(['product_id' => $productId]);

        $setStmt = $this->db->prepare("UPDATE product_images SET is_main = 1 WHERE id = :id AND product_id = :product_id");
        $setStmt->execute(['id' => $imageId, 'product_id' => $productId]);
    }

    public function getFilteredProducts(array $filters = []): array {
        $sql = "
            SELECT 
                p.*,
                c.name AS category_name,
                COALESCE(SUM(pv.stock_quantity), 0) AS total_stock,
                COUNT(DISTINCT pv.id) AS variants_count,
                (
                    SELECT image_name 
                    FROM product_images pi 
                    WHERE pi.product_id = p.id 
                    ORDER BY pi.is_main DESC, pi.sort_order ASC, pi.id ASC 
                    LIMIT 1
                ) AS main_image
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN product_variants pv ON pv.product_id = p.id
        ";

        $where = ["p.is_active = 1"];
        $params = [];

        if (!empty($filters['category_id'])) {
            $where[] = "p.category_id = :category_id";
            $params['category_id'] = (int) $filters['category_id'];
        }

        if (!empty($filters['collection_id'])) {
            $sql .= " LEFT JOIN collection_products cp ON cp.product_id = p.id";
            $where[] = "cp.collection_id = :collection_id";
            $params['collection_id'] = (int) $filters['collection_id'];
        }

        if (isset($filters['min_price']) && $filters['min_price'] !== '') {
            $where[] = "p.price >= :min_price";
            $params['min_price'] = (float) $filters['min_price'];
        }

        if (isset($filters['max_price']) && $filters['max_price'] !== '') {
            $where[] = "p.price <= :max_price";
            $params['max_price'] = (float) $filters['max_price'];
        }

        if (!empty($filters['search'])) {
            $where[] = "(p.name LIKE :search1 OR p.description LIKE :search2 OR p.sku LIKE :search3)";
            $searchTerm = '%' . trim($filters['search']) . '%';
            $params['search1'] = $searchTerm;
            $params['search2'] = $searchTerm;
            $params['search3'] = $searchTerm;
        }

        if (!empty($filters['colors']) && is_array($filters['colors'])) {
            $colorPlaceholders = [];
            foreach ($filters['colors'] as $i => $color) {
                $paramKey = "color_" . $i;
                $colorPlaceholders[] = ":" . $paramKey;
                $params[$paramKey] = $color;
            }
            $where[] = "pv.color IN (" . implode(', ', $colorPlaceholders) . ")";
        }

        if (!empty($filters['sizes']) && is_array($filters['sizes'])) {
            $sizePlaceholders = [];
            foreach ($filters['sizes'] as $i => $size) {
                $paramKey = "size_" . $i;
                $sizePlaceholders[] = ":" . $paramKey;
                $params[$paramKey] = $size;
            }
            $where[] = "pv.size IN (" . implode(', ', $sizePlaceholders) . ")";
        }

        if (!empty($where)) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }

        $sql .= " GROUP BY p.id";

        // Sorting
        $sort = $filters['sort'] ?? 'newest';
        switch ($sort) {
            case 'price_asc':
                $sql .= " ORDER BY p.price ASC";
                break;
            case 'price_desc':
                $sql .= " ORDER BY p.price DESC";
                break;
            case 'name_asc':
                $sql .= " ORDER BY p.name ASC";
                break;
            case 'newest':
            default:
                $sql .= " ORDER BY p.id DESC";
                break;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($products as &$product) {
            $product['collection_ids'] = $this->getCollectionIds((int) $product['id']);
        }

        return $products;
    }

    public function getFilterOptions(): array {
        // Price range
        $priceStmt = $this->db->query("SELECT MIN(price) AS min_price, MAX(price) AS max_price FROM products WHERE is_active = 1");
        $priceRange = $priceStmt->fetch(PDO::FETCH_ASSOC) ?: ['min_price' => 0, 'max_price' => 100];

        // Colors
        $colorStmt = $this->db->query("SELECT DISTINCT color FROM product_variants WHERE color != 'Default' AND color IS NOT NULL AND color != '' ORDER BY color ASC");
        $colors = $colorStmt->fetchAll(PDO::FETCH_COLUMN);

        // Sizes
        $sizeStmt = $this->db->query("SELECT DISTINCT size FROM product_variants WHERE size IS NOT NULL AND size != '' ORDER BY size ASC");
        $sizes = $sizeStmt->fetchAll(PDO::FETCH_COLUMN);

        // Categories
        $catStmt = $this->db->query("SELECT id, name, slug FROM categories ORDER BY name ASC");
        $categories = $catStmt->fetchAll(PDO::FETCH_ASSOC);

        // Collections
        $colStmt = $this->db->query("SELECT id, title FROM collections WHERE is_active = 1 ORDER BY title ASC");
        $collections = $colStmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'min_price'   => (float) ($priceRange['min_price'] ?? 0),
            'max_price'   => (float) ($priceRange['max_price'] ?? 100),
            'colors'      => $colors,
            'sizes'       => $sizes,
            'categories'  => $categories,
            'collections' => $collections
        ];
    }

    public function getRelatedProducts(int $categoryId, int $excludeProductId, int $limit = 4): array {
        $stmt = $this->db->prepare("
            SELECT 
                p.*,
                c.name AS category_name,
                (
                    SELECT image_name 
                    FROM product_images pi 
                    WHERE pi.product_id = p.id 
                    ORDER BY pi.is_main DESC, pi.sort_order ASC, pi.id ASC 
                    LIMIT 1
                ) AS main_image
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.category_id = :category_id 
              AND p.id != :exclude_id 
              AND p.is_active = 1
            ORDER BY RAND()
            LIMIT :limit_val
        ");
        $stmt->bindValue(':category_id', $categoryId, PDO::PARAM_INT);
        $stmt->bindValue(':exclude_id', $excludeProductId, PDO::PARAM_INT);
        $stmt->bindValue(':limit_val', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

