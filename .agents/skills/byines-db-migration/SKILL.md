---
name: byines-db-migration
description: Guidelines for organizing MySQL schemas (byines.sql) in MySQL Workbench and implementing decoupled Repository classes for 3-tier architecture.
---

# MySQL Database & 3-Tier Repository Skill — ByInes

## Complete Schema Overview & Repository Contracts

Here is the complete mapping of all 11 database entities (including legacy tables and schema normalizations):

| SQL Table (`byines.sql`) | Purpose & Column Standards | Repository Interface | Notes / Enhancements |
| :--- | :--- | :--- | :--- |
| `users` | Customer & Admin accounts. Password hashed via `password_hash()`. | `UserRepositoryInterface` | Roles (`user`, `admin`). Unique email. |
| `categories` | Product categories (Abayas, Scarfs, Niqabs, Accessories). | `CategoryRepositoryInterface` | Unique slug for SEO clean URLs. |
| `collections` | Curated product groupings (Popular Picks, Coffee Collection). | `CollectionRepositoryInterface` | Store banner image & description. |
| `collection_products` | **Pivot Table**: Maps collections to products. | `CollectionRepositoryInterface` | *Normalized from legacy CSV string (`products_ids`)*. |
| `products` | Base product details (`price DECIMAL(10,2)`). | `ProductRepositoryInterface` | Foreign key to `categories`. Unique SKU & slug. |
| `product_variants` | Size, Color, SKU, Stock quantity. | `ProductVariantRepositoryInterface` | Foreign key to `products`. Tracks inventory. |
| `product_images` | Image file paths, sort order, color mapping. | `ProductImageRepositoryInterface` | Foreign key to `products`. Supports main hero flag. |
| `orders` | Customer order records (`subtotal`, `tax`, `total_amount`, status). | `OrderRepositoryInterface` | FK to `users`. Statuses & payment tracking. |
| `order_items` | Purchased items snapshot (`variant_id`, `quantity`, `price`). | `OrderItemRepositoryInterface` | FK to `orders` and `product_variants`. |
| `addresses` | Customer shipping & billing addresses (Morocco standard). | `AddressRepositoryInterface` | FK to `users`. City (Ville), Line 1 (Quartier/Rue), optional Region/Postal Code. Default country 'Morocco'. |
| `reviews` | Customer ratings (1-5 stars) and review text. | `ReviewRepositoryInterface` | FK to `products` and `users`. Approval flag. |
| `wishlist` | Customer saved favorite products. | `WishlistRepositoryInterface` | FK to `users` and `products`. Unique pair lock. |
| `cart_items` | *(Optional)* Persistent server-side cart for logged-in users. | `CartRepositoryInterface` | Syncs guest local storage cart upon login. |

## Schema Refinements over Legacy Dump

1. **Normalize `collections.products_ids`**: Legacy dump stored product IDs as comma-separated text `'11,10,9,7'`. Replace with explicit pivot table `collection_products (collection_id, product_id, sort_order)`.
2. **Added `reviews` & `wishlist`**: Missing from original simple tables list, fully mapped with foreign keys and approval checks.
3. **Decimal Precision**: All monetary columns (`price`, `subtotal`, `tax`, `shipping_cost`, `total_amount`, `price_modifier`) use `DECIMAL(10,2)`.
4. **Engine & Charset**: Enforce `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` across all tables.

## 3-Tier Database Swappability Guidelines

1. **Repository Pattern Isolation**: All SQL queries (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) reside **strictly** within Repository implementation classes (e.g., `src/Repositories/MySQL/MySQLProductRepository.php`).
2. **Interface Abstraction**: Business logic controllers only interact with contracts (`ProductRepositoryInterface`).
3. **Database Swapping**: To change the database provider in the future (e.g., from MySQL to PostgreSQL or MongoDB):
   - Keep `byines.sql` schema as reference.
   - Write a new repository implementation (e.g. `PostgreSQLProductRepository.php`) adhering to the same interface.
   - Update `RepositoryFactory.php` to instantiate the new repository. No changes will be needed in frontend JavaScript or business logic controllers!
