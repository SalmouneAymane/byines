# Agent Rules: ByInes E-Commerce Remake (3-Tier SPA Architecture)

## Project Overview
This project is a modern, high-end remake of the **ByInes** luxury modest fashion storefront (Abayas, Scarfs, Niqabs, Accessories, Curated Collections) built using a **Strict 3-Tier Architecture**, **Single Page Application (SPA)** frontend, **Modern PHP 8+**, **Tailwind CSS**, **Vanilla JS**, and **MySQL** (managed via MySQL Workbench).

---

## 1. Strict 3-Tier Architecture Rules (Database Swappability)

The application MUST strictly isolate layers so the database technology can be swapped (e.g., MySQL to PostgreSQL, SQLite, or MongoDB) without changing business logic or UI code:

```
┌────────────────────────────────────────────────────────┐
│  Tier 1: Presentation Tier (Frontend / SPA)            │
│  HTML5 + Tailwind CSS + Vanilla JS SPA Router + fetch  │
└──────────────────────────┬─────────────────────────────┘
                           │ JSON via HTTP (Fetch API)
┌──────────────────────────▼─────────────────────────────┐
│  Tier 2: Business Logic / Application Tier (PHP)       │
│  API Controllers + Domain Services (e.g. OrderService) │
└──────────────────────────┬─────────────────────────────┘
                           │ Interfaces (e.g. ProductRepositoryInterface)
┌──────────────────────────▼─────────────────────────────┐
│  Tier 3: Data Access Tier (Persistence Layer)          │
│  Repository Implementations (MySQLProductRepository)   │
└────────────────────────────────────────────────────────┘
```

### 3-Tier Code Pattern Guidelines

#### Tier 3: Repository Interface & MySQL Implementation
```php
// src/Contracts/ProductRepositoryInterface.php
namespace App\Contracts;

interface ProductRepositoryInterface {
    public function findById(int $id): ?array;
    public function getByCategory(int $categoryId): array;
    public function getAllActive(array $filters = []): array;
}

// src/Repositories/MySQL/MySQLProductRepository.php
namespace App\Repositories\MySQL;

use App\Contracts\ProductRepositoryInterface;
use PDO;

class MySQLProductRepository implements ProductRepositoryInterface {
    public function __construct(private PDO $db) {}

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM products WHERE id = :id AND is_active = 1");
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }
}
```

#### Tier 2: API Controller Example
```php
// api/products.php
use App\Services\ProductService;
use App\Factories\RepositoryFactory;

header('Content-Type: application/json');

$productRepo = RepositoryFactory::getProductRepository(); // Returns MySQLProductRepository
$service = new ProductService($productRepo);

$products = $service->getCatalogProducts($_GET);
echo json_encode(['success' => true, 'data' => $products]);
exit;
```

---

## 2. SPA & Zero-Page-Reload Architecture Rules
- **Pure `.html` Frontend Entry Points**: All public frontend entry points MUST be pure `.html` files (e.g. `public/index.html` and `public/admin/index.html`). Zero `.php` files inside public web roots.
- **No Page Refreshes**: The application operates as a Single Page Application (SPA). Zero full-page browser reloads allowed during navigation, form submissions, cart updates, or modal opens.
- **Dynamic View Routing**: `index.html` contains the dynamic `#app` view container. Routing is managed via `history.pushState()` and hash routers.
- **Async Fetch Forms**: All forms (Login, Signup, Cart, Address, Checkout, Filters) submit via `fetch()`, returning JSON.
- **Modals & Drawers**: Cart drawer, Auth modals, and Quick View render as dynamic overlay components on top of the active view.

---

## 3. Design System & Luxury UI/UX Rules (Ethos Monolith Standard)
- **Master Design System Document**: All styling MUST strictly adhere to [`.agents/rules/design-system.md`](file:///.agents/rules/design-system.md) (derived from `.agents/DESIGN.md`).
- **STRICT NO EMOJIS RULE**: Emojis are STRICTLY BANNED in all UI elements, navigation items, cards, headers, buttons, and notifications. Always use clean, minimalist, 1.5px stroke SVG icons.
- **Sharp Geometric Corners (`rounded-none`)**: All buttons, input fields, cards, modal drawers, and containers MUST have crisp 90-degree corners (`border-radius: 0px`). Zero soft rounded corners.
- **Strict Monochromatic Fashion Palette (Zero Gold)**:
  - Background: Warm Cream / Light Gray (`#F9F9F9` & `#FFFFFF`).
  - Primary Dark: Deep Black (`#000000` / `#1B1B1B`).
  - Secondary Text: Medium Slate Gray (`#5D5F5F`).
  - Depth: Hairline 1px borders (`#EAEAEA` / `border-stone-200`), zero heavy drop-shadows.
- **Typography Pairing**:
  - Headlines: Serif (*Noto Serif* or *Playfair Display*).
  - Body & UI Controls: Sans-serif (*Inter*), uppercase tracking for labels and buttons (`tracking-widest text-xs`).

---

## 4. Database & MySQL Workflow (MySQL Workbench)
- **Schema Standards**: Use explicit foreign key constraints (`ON DELETE RESTRICT` / `CASCADE`), indexes on foreign key columns (`product_id`, `category_id`, `user_id`), and `DECIMAL(10,2)` for monetary values.
- **Order Transactions**: Order creation MUST use PDO transactions (`beginTransaction()`, `commit()`, `rollBack()`) inside the Repository layer (`MySQLOrderRepository.php`).
- **Moroccan Address Format**: Address schema and checkout forms MUST conform to Moroccan standards: mandatory Phone Number + City (Ville), Quartier/Address line 1, with optional Region/Province, optional Postal Code (defaulting to NULL), and default country `'Morocco'`.
- **File Upload Processing**: Image assets (Categories, Collections, Products) are uploaded via `multipart/form-data`, validated (JPG, PNG, WEBP), saved securely to `public/uploads/<type>/`, and the resulting filename/path is stored in the database.
- **Workbench Compatibility**: Format all SQL scripts cleanly for execution inside MySQL Workbench.

---

## 5. Phased 14 Micro-Phase Roadmap

### STAGE 1: Admin Dashboard (Micro-Phases 1 to 6)
- **Phase 1: DB Connection & Env Setup** — `.env`, `Database.php`, test endpoint `api/test_db.php`.
- **Phase 2: Admin HTML Shell & Sidebar Layout** — `public/admin/index.php`, Tailwind admin CSS, sidebar/header.
- **Phase 3: Admin Category Manager (CRUD)** — `MySQLCategoryRepository.php`, `api/admin/categories.php`, AJAX category CRUD view.
- **Phase 4: Admin Collection Manager (CRUD)** — `MySQLCollectionRepository.php`, `api/admin/collections.php`, collection CRUD view & image upload.
- **Phase 5: Admin Product Manager (Basic Info)** — `MySQLProductRepository.php`, `api/admin/products.php`, product add form.
- **Phase 6: Admin Variant Matrix & Stock Manager** — `MySQLProductVariantRepository.php`, `api/admin/variants.php`, variant matrix & inventory modal.

### STAGE 2: Customer Storefront SPA (Micro-Phases 7 to 12)
- **Phase 7: Customer SPA Shell & Glassmorphism Header** — `public/index.php`, `router.js`, sticky header, mobile drawer, footer.
- **Phase 8: Homepage View** — `api/home.php`, `HomeView.js` (Hero banner, Categories grid, Collections showcase).
- **Phase 9: Shop Catalog & Real-Time Filter Sidebar** — `api/products.php`, `ShopView.js` (AJAX category/price/color filters).
- **Phase 10: Product Details Page & Variant Selector** — `api/product_detail.php`, `ProductDetailView.js` (gallery zoom, variant swatches, stock badges).
- **Phase 11: Slide-Over Cart Drawer & Local Storage** — `cartStore.js`, `CartDrawer.js` (slide-over drawer with local storage sync).
- **Phase 12: Moroccan Checkout & COD Order Processing** — `MySQLOrderRepository.php`, `api/checkout.php`, `CheckoutView.js` (Moroccan address, COD transaction).

### STAGE 3: Customer Auth & User Dashboard (Micro-Phases 13 & 14)
- **Phase 13: Customer Login/Signup Modals** — `MySQLUserRepository.php`, `api/auth.php`, `AuthModal.js`.
- **Phase 14: Customer Account Dashboard** — `AccountView.js` (Order history timeline, Moroccan address book manager).

### STAGE 4: Multilingual & Internationalization Engine (Micro-Phase 15)
- **Phase 15: Multilingual Integration (English, French, Arabic + RTL Engine)** — `i18n.js`, translation dictionaries (`en.js`, `fr.js`, `ar.js`), header language toggle (`EN | FR | AR`), dynamic `dir="rtl"` attribute switching, and database localization setup.

---

## 6. Agent Execution Workflow & Verification
- **Ignore Archive Directory**: All legacy code has been moved to `archive/` and added to `.gitignore`. DO NOT inspect, reference, or read files inside `archive/` unless explicitly requested by the user.
- **PHP Syntax Check**: Run `php -l <filename>` to verify zero syntax errors before saving.
- **Interface Decoupling Check**: Verify Controllers/Services inject Repository Interfaces rather than instantiating raw DB connections directly.
- **AJAX Endpoints**: Ensure JSON API endpoints return proper HTTP headers (`header('Content-Type: application/json')`) and structured responses (`{ "success": true, "data": ... }`).
