-- ====================================================================
-- ByInes E-Commerce Remake — Normalized MySQL Database Schema (v2)
-- Designed for MySQL Workbench & 3-Tier PHP Architecture
-- Engine: InnoDB | Charset: utf8mb4_unicode_ci
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `byines_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `byines_db`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `cart_items`;

DROP TABLE IF EXISTS `wishlist`;

DROP TABLE IF EXISTS `reviews`;

DROP TABLE IF EXISTS `addresses`;

DROP TABLE IF EXISTS `order_items`;

DROP TABLE IF EXISTS `orders`;

DROP TABLE IF EXISTS `product_images`;

DROP TABLE IF EXISTS `product_variants`;

DROP TABLE IF EXISTS `collection_products`;

DROP TABLE IF EXISTS `products`;

DROP TABLE IF EXISTS `collections`;

DROP TABLE IF EXISTS `categories`;

DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------------------
-- 1. USERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE `users` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_users_email` (`email`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- --------------------------------------------------------------------
CREATE TABLE `categories` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `image_url` VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_categories_slug` (`slug`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. COLLECTIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE `collections` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(150) NOT NULL,
    `image_path` VARCHAR(255) DEFAULT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. PRODUCTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE `products` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `category_id` INT(11) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(150) NOT NULL,
    `sku` VARCHAR(50) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `old_price` DECIMAL(10, 2) DEFAULT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_products_slug` (`slug`),
    UNIQUE KEY `idx_products_sku` (`sku`),
    KEY `idx_products_category` (`category_id`),
    CONSTRAINT `fk_products_categories` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. COLLECTION_PRODUCTS PIVOT TABLE (Normalized from legacy CSV string)
-- --------------------------------------------------------------------
CREATE TABLE `collection_products` (
    `collection_id` INT(11) NOT NULL,
    `product_id` INT(11) NOT NULL,
    `sort_order` INT(11) NOT NULL DEFAULT 0,
    PRIMARY KEY (`collection_id`, `product_id`),
    KEY `idx_col_prod_product` (`product_id`),
    CONSTRAINT `fk_col_prod_collection` FOREIGN KEY (`collection_id`) REFERENCES `collections` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_col_prod_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. PRODUCT_VARIANTS TABLE (Size & Color options with stock)
-- --------------------------------------------------------------------
CREATE TABLE `product_variants` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `product_id` INT(11) NOT NULL,
    `color` VARCHAR(30) NOT NULL DEFAULT 'Default',
    `size` VARCHAR(10) NOT NULL DEFAULT 'M',
    `stock_quantity` INT(11) NOT NULL DEFAULT 0,
    `price_modifier` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_variant_unique` (`product_id`, `color`, `size`),
    KEY `idx_variants_product` (`product_id`),
    CONSTRAINT `fk_variants_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 7. PRODUCT_IMAGES TABLE
-- --------------------------------------------------------------------
CREATE TABLE `product_images` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `product_id` INT(11) NOT NULL,
    `color` VARCHAR(30) DEFAULT NULL,
    `image_name` VARCHAR(100) NOT NULL,
    `sort_order` INT(11) NOT NULL DEFAULT 1,
    `is_main` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_images_product` (`product_id`),
    CONSTRAINT `fk_images_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 8. ORDERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE `orders` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `user_id` INT(11) DEFAULT NULL,
    `order_number` VARCHAR(30) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `tax` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `shipping_cost` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM(
        'pending',
        'processing',
        'in_transit',
        'delivered',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',
    `tracking_number` VARCHAR(100) DEFAULT NULL,
    `shipping_name` VARCHAR(100) NOT NULL,
    `shipping_phone` VARCHAR(20) NOT NULL,
    `shipping_address_line1` VARCHAR(150) NOT NULL,
    `shipping_address_line2` VARCHAR(150) DEFAULT NULL,
    `shipping_city` VARCHAR(100) NOT NULL,
    `shipping_region` VARCHAR(100) DEFAULT NULL,
    `shipping_postal_code` VARCHAR(20) DEFAULT NULL,
    `shipping_country` VARCHAR(100) NOT NULL DEFAULT 'Morocco',
    `shipping_method` VARCHAR(50) NOT NULL DEFAULT 'Standard',
    `payment_method` ENUM(
        'cash_on_delivery',
        'paypal',
        'credit_card'
    ) NOT NULL DEFAULT 'cash_on_delivery',
    `payment_status` ENUM(
        'unpaid',
        'paid',
        'refunded',
        'failed'
    ) NOT NULL DEFAULT 'unpaid',
    `payment_transaction_id` VARCHAR(100) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_orders_number` (`order_number`),
    KEY `idx_orders_user` (`user_id`),
    CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 9. ORDER_ITEMS TABLE
-- --------------------------------------------------------------------
CREATE TABLE `order_items` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `order_id` INT(11) NOT NULL,
    `variant_id` INT(11) NOT NULL,
    `quantity` INT(11) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_order_items_order` (`order_id`),
    KEY `idx_order_items_variant` (`variant_id`),
    CONSTRAINT `fk_items_orders` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_items_variants` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 10. ADDRESSES TABLE
-- --------------------------------------------------------------------
CREATE TABLE `addresses` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `user_id` INT(11) NOT NULL,
    `address_type` ENUM('shipping', 'billing') NOT NULL DEFAULT 'shipping',
    `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `address_line1` VARCHAR(150) NOT NULL,
    `address_line2` VARCHAR(150) DEFAULT NULL,
    `city` VARCHAR(100) NOT NULL,
    `region` VARCHAR(100) DEFAULT NULL,
    `postal_code` VARCHAR(20) DEFAULT NULL,
    `country` VARCHAR(100) NOT NULL DEFAULT 'Morocco',
    PRIMARY KEY (`id`),
    KEY `idx_addresses_user` (`user_id`),
    CONSTRAINT `fk_addresses_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 11. REVIEWS TABLE
-- --------------------------------------------------------------------
CREATE TABLE `reviews` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `product_id` INT(11) NOT NULL,
    `user_id` INT(11) NOT NULL,
    `rating` TINYINT(4) NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
    `review_text` TEXT NOT NULL,
    `is_approved` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_review_unique` (`product_id`, `user_id`),
    KEY `idx_reviews_user` (`user_id`),
    CONSTRAINT `fk_reviews_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reviews_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 12. WISHLIST TABLE
-- --------------------------------------------------------------------
CREATE TABLE `wishlist` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `user_id` INT(11) NOT NULL,
    `product_id` INT(11) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_wishlist_unique` (`user_id`, `product_id`),
    KEY `idx_wishlist_product` (`product_id`),
    CONSTRAINT `fk_wishlist_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_wishlist_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 13. CART_ITEMS TABLE (Server-side cart sync for SPA logged-in users)
-- --------------------------------------------------------------------
CREATE TABLE `cart_items` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `user_id` INT(11) NOT NULL,
    `variant_id` INT(11) NOT NULL,
    `quantity` INT(11) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_cart_user_variant` (`user_id`, `variant_id`),
    KEY `idx_cart_variant` (`variant_id`),
    CONSTRAINT `fk_cart_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cart_variants` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ====================================================================
-- SEED DATA MIGRATED FROM LEGACY BYINES.SQL
-- ====================================================================

-- Users Seed
INSERT INTO
    `users` (
        `id`,
        `first_name`,
        `last_name`,
        `email`,
        `phone`,
        `password_hash`,
        `role`,
        `created_at`
    )
VALUES (
        1,
        'Aymane',
        'Salmoune',
        'aymanesalmoune21@gmail.com',
        '0719389174',
        '$2y$10$WLP.PAdtT1t9JkvAaieHFeHjEdYWvKbmbxiJxG0MgJa.D4NRzyXHy',
        'admin',
        '2026-06-03 09:25:10'
    ),
    (
        2,
        'Aymane Admin',
        'Salmoune',
        'aymanesalmoune00@gmail.com',
        '0719389174',
        '$2y$10$aHe0BHrwzVIsr/InoH/1wumLBQqqsIQXllTeDMXt2XhFgatA2VtPq',
        'admin',
        '2026-06-03 09:27:42'
    ),
    (
        3,
        'Alien',
        'Dl3bar',
        'aymanesalmoune28@gmail.com',
        '0719389174',
        '$2y$10$wNHvUU9fEnwDi8lj8E2SW.m/myA8gygH8XDeLivJlvtM6F98N/2nO',
        'user',
        '2026-06-09 09:53:15'
    );

-- Categories Seed
INSERT INTO
    `categories` (
        `id`,
        `name`,
        `slug`,
        `image_url`
    )
VALUES (
        6,
        'Abayas',
        'Abayas',
        'abayas.jpg'
    ),
    (
        7,
        'Scarfs',
        'Scarfs',
        'scarfs.jpg'
    ),
    (
        8,
        'Niqabs',
        'Niqabs',
        'niqabs.jpg'
    ),
    (
        9,
        'Accessories',
        'Accessories',
        'accessories.jpg'
    );

-- Collections Seed
INSERT INTO
    `collections` (
        `id`,
        `title`,
        `image_path`,
        `is_active`
    )
VALUES (
        3,
        'Popular Picks',
        'popular_picks.jpg',
        1
    ),
    (
        4,
        'Coffee collection',
        'coffee_collection.jpg',
        1
    ),
    (
        5,
        'Summer Collection',
        'summer_collection.jpg',
        1
    );

-- Products Seed
INSERT INTO
    `products` (
        `id`,
        `category_id`,
        `name`,
        `slug`,
        `sku`,
        `description`,
        `price`,
        `old_price`,
        `is_active`,
        `created_at`
    )
VALUES (
        7,
        6,
        'Abaya silk',
        'abaya-silk',
        'aba-232',
        'Experience timeless elegance with our premium Elegant Abaya. Crafted from luxurious chiffon fabric.',
        35.00,
        NULL,
        1,
        '2026-06-04 08:33:43'
    ),
    (
        8,
        6,
        'ensemble pani',
        'ensemble-pani',
        'pan-565',
        'Effortless style meets everyday comfort. This premium two-piece matching set is designed for modern women.',
        23.00,
        NULL,
        1,
        '2026-06-04 12:08:52'
    ),
    (
        9,
        6,
        'elegant Abaya',
        'elegant-abaya',
        'aba-241',
        'Crafted from a premium, ultra-soft silk-viscose blend, offering an exquisite drape.',
        38.00,
        NULL,
        1,
        '2026-06-08 09:24:41'
    ),
    (
        10,
        7,
        'silk scarfs',
        'silk-scarfs',
        'scr-272',
        'Luxurious silk scarf with smooth finish.',
        9.00,
        NULL,
        1,
        '2026-06-08 09:26:50'
    ),
    (
        11,
        6,
        'abaya jogging',
        'abaya-jogging',
        'aba-718',
        'Perfect for light sport and outdoor activities.',
        28.00,
        NULL,
        1,
        '2026-06-08 09:36:20'
    ),
    (
        12,
        9,
        'flowers bucket',
        'flowers-bucket',
        'acs-443',
        'A beautiful accessory that makes the perfect gift.',
        10.00,
        NULL,
        1,
        '2026-06-10 13:14:43'
    ),
    (
        13,
        9,
        'flowers bag',
        'flowers-bag',
        'acs-231',
        'A beautiful accessory bag designed with elegance.',
        10.00,
        NULL,
        1,
        '2026-06-10 13:15:47'
    ),
    (
        16,
        9,
        'brown flower bucket',
        'brown-flower-bucket',
        'acs-348',
        'A stylish brown flower bucket accessory.',
        7.00,
        NULL,
        1,
        '2026-06-10 13:19:32'
    ),
    (
        20,
        6,
        'coat abaya',
        'coat-abaya',
        'aba-898',
        'A perfect abaya to wear for cold and snowy days.',
        30.00,
        NULL,
        1,
        '2026-06-10 13:36:11'
    );

-- Collection Products Pivot Seed (Normalized from legacy CSV string!)
INSERT INTO
    `collection_products` (
        `collection_id`,
        `product_id`,
        `sort_order`
    )
VALUES (3, 11, 1),
    (3, 10, 2),
    (3, 9, 3),
    (3, 7, 4),
    (4, 9, 1),
    (4, 7, 2),
    (4, 11, 3),
    (5, 13, 1),
    (5, 16, 2),
    (5, 20, 3),
    (5, 10, 4);

-- Product Variants Seed
INSERT INTO
    `product_variants` (
        `id`,
        `product_id`,
        `color`,
        `size`,
        `stock_quantity`,
        `price_modifier`
    )
VALUES (13, 7, 'red', 'M', 7, 0.00),
    (
        14,
        7,
        'magenta',
        'M',
        10,
        0.00
    ),
    (15, 7, 'beige', 'M', 10, 0.00),
    (
        41,
        9,
        'Default',
        'M',
        34,
        0.00
    ),
    (54, 11, 'black', 'M', 9, 0.00),
    (55, 11, 'black', 'L', 9, 0.00),
    (
        57,
        11,
        'mistyrose',
        'M',
        9,
        0.00
    );

-- Product Images Seed
INSERT INTO
    `product_images` (
        `id`,
        `product_id`,
        `color`,
        `image_name`,
        `sort_order`,
        `is_main`
    )
VALUES (
        19,
        7,
        NULL,
        'abaya_silk_main.jpg',
        0,
        1
    ),
    (
        20,
        7,
        'beige',
        'abaya_silk_beige.jpg',
        2,
        0
    ),
    (
        36,
        9,
        NULL,
        'elegant_abaya_main.jpg',
        0,
        1
    ),
    (
        41,
        11,
        NULL,
        'abaya_jogging_main.jpg',
        0,
        1
    );