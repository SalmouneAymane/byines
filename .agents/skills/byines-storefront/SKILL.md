---
name: byines-storefront
description: Guidelines and patterns for building the modern ByInes e-commerce SPA storefront using a 3-tier architecture (PHP 8 JSON API + Repositories, Tailwind CSS, HTML5, Vanilla JS SPA Router, MySQL).
---

# ByInes 3-Tier SPA Storefront Engineering Skill

## 1. 3-Tier Architecture Pattern

To ensure database independence and modularity, follow this 3-tier interaction flow:

```
[Tier 1: Presentation (Vanilla JS SPA)]
      │  fetch('/api/products.php')
      ▼
[Tier 2: Application (ProductController -> ProductService)]
      │  $this->productRepository->getAllActive()
      ▼
[Tier 3: Data Access (ProductRepositoryInterface -> MySQLProductRepository)]
```

### Tier 3 Example: Repository Interface & MySQL Implementation
```php
// src/Repositories/Contracts/ProductRepositoryInterface.php
namespace App\Repositories\Contracts;

interface ProductRepositoryInterface {
    public function findById(int $id): ?array;
    public function getByCategory(int $categoryId): array;
    public function getAllActive(array $filters = []): array;
}

// src/Repositories/MySQL/MySQLProductRepository.php
namespace App\Repositories\MySQL;

use App\Repositories\Contracts\ProductRepositoryInterface;
use PDO;

class MySQLProductRepository implements ProductRepositoryInterface {
    public function __construct(private PDO $db) {}

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM products WHERE id = :id AND is_active = 1");
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }
    // ...
}
```

### Tier 2 Example: API Controller
```php
// api/products.php
use App\Services\ProductService;
use App\Factories\RepositoryFactory;

header('Content-Type: application/json');

$productRepo = RepositoryFactory::getProductRepository(); // Returns MySQLProductRepository or swapped repo
$service = new ProductService($productRepo);

$products = $service->getCatalogProducts($_GET);
echo json_encode(['success' => true, 'data' => $products]);
exit;
```

---

## 2. SPA Engine & Form Submissions (Tier 1)
- **Main Container**: Index (`index.php`) contains `#app` dynamic view area.
- **Client Router (`router.js`)**: Intercepts link clicks (`<a>` tags), handles `history.pushState()`, and dynamically loads views without page reloads.
- **Zero-Reload Forms**: All form submissions use JS `fetch()` to call Tier 2 Controllers and update UI state or close drawers/modals.

---

## 3. Verification Checklist
- Verify that Controllers and Services type-hint Interfaces (`ProductRepositoryInterface`) rather than concrete database classes.
- Verify that swapping database implementation in `RepositoryFactory` breaks zero code in Tier 1 or Tier 2.
