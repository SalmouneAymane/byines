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
- **SQL Security**: Use PDO prepared statements inside Repository classes only. Never concatenate raw user input into SQL.

---

## 5. Technology Stack & Security Rules
- **Backend**: PHP 8+ with OOP, Repository Interfaces, Services, and JSON API Controllers.
- **Styling**: Tailwind CSS via CDN with custom luxury theme palette configured inline.
- **Frontend Logic**: Native HTML5, ES6 Modules, Fetch API, and Client-Side Hash Router.
- **Database**: MySQL managed via MySQL Workbench. Schema updates saved in clean `.sql` files.
- **Environment**: DB credentials loaded from `.env` via custom `Database.php` loader.
- **CSRF & XSS**: Enforce CSRF headers on fetch requests and sanitize HTML outputs.

---

## 6. Phased Development Roadmap (30 Micro-Phases)

### STAGE 1: Admin Dashboard (Micro-Phases 1–6) ✅ COMPLETED
- **Phase 1: DB Connection & Env Setup** — `.env`, `Database.php`, test endpoint `api/test_db.php`.
- **Phase 2: Admin HTML Shell & Sidebar Layout** — `public/admin/index.html`, Tailwind admin CSS, sidebar/header.
- **Phase 3: Admin Category Manager (CRUD)** — `MySQLCategoryRepository.php`, `api/admin/categories.php`, AJAX category CRUD view.
- **Phase 4: Admin Collection Manager (CRUD)** — `MySQLCollectionRepository.php`, `api/admin/collections.php`, collection CRUD view & image upload.
- **Phase 5: Admin Product Manager (Basic Info)** — `MySQLProductRepository.php`, `api/admin/products.php`, product add form.
- **Phase 6: Admin Variant Matrix & Stock Manager** — `MySQLProductVariantRepository.php`, `api/admin/variants.php`, variant matrix & inventory modal.

### STAGE 2: Customer Storefront SPA (Micro-Phases 7–12) ✅ COMPLETED
- **Phase 7: Customer SPA Shell & Header** — `public/index.html`, `storefront_router.js`, sticky header, mobile drawer, footer.
- **Phase 8: Homepage View** — `api/storefront/home.php`, `HomeView.js` (Hero banner, Categories grid, Collections showcase).
- **Phase 9: Shop Catalog & Real-Time Filter Sidebar** — `api/storefront/products.php`, `ShopView.js` (AJAX category/price/color filters).
- **Phase 10: Product Details Page & Variant Selector** — `api/storefront/product_detail.php`, `ProductDetailView.js` (gallery zoom, variant swatches, stock badges).
- **Phase 11: Slide-Over Cart Drawer & Local Storage** — `cart.js`, `CartDrawer.js` (slide-over drawer with local storage sync).
- **Phase 12: Moroccan Checkout & COD Order Processing** — `MySQLOrderRepository.php`, `api/storefront/checkout.php`, `CheckoutView.js` (Moroccan address, COD transaction).

### STAGE 3: Customer Auth & User Dashboard (Micro-Phases 13–14) ✅ COMPLETED
- **Phase 13: Customer Login/Signup Modals** — `MySQLUserRepository.php`, `api/storefront/auth.php`, `AuthModal.js`.
- **Phase 14: Customer Account Dashboard** — `AccountView.js` (Order history timeline, profile settings, sign-out).

### STAGE 4: Multilingual & Internationalization Engine (Micro-Phase 15) ✅ COMPLETED
- **Phase 15: Multilingual Integration (English, French, Arabic + RTL Engine)** — `i18n.js`, translation dictionaries (`en.js`, `fr.js`, `ar.js`), header language toggle (`EN | FR | AR`), dynamic `dir="rtl"` attribute switching, and database localization setup.

### STAGE 5: Multi-Currency Display Engine (Micro-Phase 16) — PLANNED
- **Phase 16: Multi-Currency Price Display** — `currencyStore.js`, header currency toggle (`MAD | EUR | USD`), live exchange rates fetched once on page load from a free API (e.g. `exchangerate.host`) and cached in `sessionStorage`. All prices stored and processed in **MAD** internally; conversion and formatting handled purely on the frontend using `Intl.NumberFormat`. Currency selection persisted in `localStorage`. No backend changes required.

### STAGE 6: Security Hardening (Micro-Phases 17–18) — CRITICAL BEFORE LAUNCH
- **Phase 17: Application Security Hardening** — Add CSRF token generation and validation on all POST forms (`api/auth.php`, `api/checkout.php`). Add rate limiting middleware on login/signup endpoints (e.g. max 5 attempts per IP per minute via APCu or DB counter). Add global PHP security headers: `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`. Guard all API endpoints with `APP_ENV` check to suppress raw error details in production.
- **Phase 18: Server-Side Price Validation** — Fix critical checkout vulnerability: server must re-fetch product variant prices from DB and ignore client-supplied prices entirely. Update `CheckoutController.php` to load variant prices from `MySQLProductVariantRepository` instead of trusting `$item['price']` from the request body. Add stock availability check before confirming order.

### STAGE 7: Production Infrastructure (Micro-Phases 19–20) — REQUIRED FOR HOSTING
- **Phase 19: Apache/Nginx Config & `.htaccess` Rewrite Rules** — Create `public/.htaccess` with: document root enforcement, SPA fallback (`RewriteRule ^(?!api/).*$ /public/index.html`), API routing (`/api/` pass-through), block direct access to `src/`, `.env`, `scratch/`. Ensure all paths work correctly when deployed to shared hosting with `public/` as webroot.
- **Phase 20: Error Handling, Logging & Production Mode** — Create a global `ErrorHandler.php` that catches uncaught exceptions and logs to `storage/logs/app.log` using PHP's `error_log()`. In `APP_ENV=production` mode, return a clean JSON error (no stack trace). Add `APP_ENV` check in `Database.php` to hide connection details from response. Add log rotation hint in docs.

### STAGE 8: Order Notifications (Micro-Phase 21) — IMPORTANT FOR OPERATIONS
- **Phase 21: Order Notification System** — On successful order creation in `CheckoutController.php`, trigger an email notification to the store admin email address (from `.env`: `ADMIN_EMAIL`). Use **PHPMailer** (composer or manual include) with SMTP. Email includes: order number, customer name, phone, city, item list, and total. Optionally add a customer confirmation email. Document setup for Moroccan SMS gateway (Sendoo / SMS.ma) as an alternative for WhatsApp-style confirmation.

### STAGE 9: Admin Enhancements (Micro-Phases 22–23) — IMPORTANT FOR OPERATIONS
- **Phase 22: Admin Orders Polish** — Add print/invoice button per order (browser `window.print()` with a clean invoice layout). Add bulk status update (select multiple orders → set status). Add CSV export of orders for spreadsheet tracking (`Content-Type: text/csv` endpoint `api/admin/orders_export.php`).
- **Phase 23: Image Optimization on Upload** — On product/category/collection image upload, use PHP **GD** or **Imagick** to resize images to a max width of 1200px and re-encode as JPEG at 85% quality before saving to disk. This prevents multi-MB raw uploads from slowing the storefront.

### STAGE 10: SEO & Dynamic Meta (Micro-Phase 24) — IMPORTANT FOR DISCOVERABILITY
- **Phase 24: Dynamic SEO Meta Tags** — Product detail pages need dynamic `<title>` and `<meta description>` per product. Since the app is a client-side SPA, implement either a lightweight PHP prerender layer (server renders meta tags for crawlers based on `User-Agent`) or use `document.title` and `<meta>` tag injection in JS on each route change. Add Open Graph tags (`og:title`, `og:image`, `og:description`) for social media sharing previews.

### STAGE 11: Hosting Deployment (Micro-Phases 25–26) — LAUNCH CHECKLIST
- **Phase 25: Shared Hosting Deployment Guide** — Document step-by-step: (1) Upload all files except `archive/`, `.env`, `scratch/` via FTP/SFTP, (2) Set hosting webroot to `public/`, (3) Import `byines_remake.sql` via phpMyAdmin, (4) Create `.env` on server with production DB credentials and `APP_ENV=production`, (5) Test all API endpoints, (6) Verify image upload permissions (`public/uploads/` must be writable `chmod 755`).
- **Phase 26: SSL & HTTPS Enforcement** — In `.htaccess` add `RewriteCond %{HTTPS} off` redirect to HTTPS. Set PHP session cookie flags: `session.cookie_secure = 1`, `session.cookie_httponly = 1`, `session.cookie_samesite = Strict`. Add `Strict-Transport-Security` (HSTS) header. Verify all asset URLs and API fetch calls use relative paths (already done) so they work over HTTPS without mixed-content warnings.

### STAGE 12: Business Feature Enhancements (Micro-Phases 27–30) — NICE TO HAVE
- **Phase 27: Customer Wishlist** — `WishlistButton.js` component on product cards and detail page. Store wishlist in `localStorage` (guest) or DB table `wishlists` (logged-in user). Wishlist count badge in header. Wishlist view accessible from Account Dashboard.
- **Phase 28: Product Reviews & Star Ratings** — `reviews` DB table (`product_id`, `user_id`, `rating 1–5`, `comment`, `created_at`). `api/storefront/reviews.php` (GET + POST). Review form at bottom of `ProductDetailView.js`. Average star rating displayed on product cards and detail page. Admin moderation toggle in `ProductsView.js`.
- **Phase 29: Discount Codes & Promo Engine** — `promo_codes` DB table (`code`, `discount_type: percent|fixed`, `discount_value`, `min_order`, `expires_at`, `uses_remaining`). Admin CRUD in a new `PromoView.js`. Coupon input field in `CheckoutView.js` with live validation against `api/storefront/promo.php`. Discount applied server-side in `CheckoutController.php`.
- **Phase 30: WhatsApp Order Confirmation** — After successful order placement, generate a pre-filled WhatsApp link (`https://wa.me/212XXXXXXXXX?text=...`) with order number, items, and total. Display as a CTA button on the order success screen. Optionally integrate **WhatsApp Business Cloud API** for automated server-side message sending.

---

## 7. Agent Execution Workflow & Verification
- **Ignore Archive Directory**: All legacy code has been moved to `archive/` and added to `.gitignore`. DO NOT inspect, reference, or read files inside `archive/` unless explicitly requested by the user.
- **PHP Syntax Check**: Run `php -l <filename>` to verify zero syntax errors before saving.
- **Interface Decoupling Check**: Verify Controllers/Services inject Repository Interfaces rather than instantiating raw DB connections directly.
- **AJAX Endpoints**: Ensure JSON API endpoints return proper HTTP headers (`header('Content-Type: application/json')`) and structured responses (`{ "success": true, "data": ... }`).
