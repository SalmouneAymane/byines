<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// autoload core database and domain classes
spl_autoload_register(function ($className) {
    $file = __DIR__ . '/../classes/' . $className . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

$productModel = new Product();
$product = null;

// get product identifier from url query string
if (isset($_GET['id'])) {
    $product = $productModel->getById(intval($_GET['id']));
} elseif (isset($_GET['slug'])) {
    $product = $productModel->getBySlug(trim($_GET['slug']));
}

// fallback: if no identifier is passed, load the first active product
if (!$product && !isset($_GET['id']) && !isset($_GET['slug'])) {
    $allProducts = $productModel->getAll(false);
    if (!empty($allProducts)) {
        $product = $productModel->getById($allProducts[0]['id']);
    }
}

// if product is not found or inactive (and user is not an admin), show 404
if (!$product || (!$product['is_active'] && ($_SESSION['user_role'] ?? '') !== 'admin')) {
    $pageTitle = 'Product Not Found';
    include '../includes/header.php';
    ?>
    <main style="max-width: 1280px; margin: 6rem auto; padding: 2rem 1.5rem; text-align: center;">
        <h1 style="font-size: 2.5rem; font-weight: 300; color: var(--brand-dark); margin-bottom: 1.5rem;">Product Not Found
        </h1>
        <p style="color: var(--gray-500); font-size: 1.125rem; margin-bottom: 2rem;">The product you are looking for does
            not exist or is currently unavailable.</p>
        <a href="shop.php" class="btn-primary"
            style="display: inline-block; text-decoration: none; padding: 1rem 2rem; background-color: var(--brand-dark); color: var(--white); border-radius: 0.5rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Browse
            Collections</a>
    </main>
    <?php
    include '../includes/footer.php';
    exit;
}

$productId = $product['id'];
$pageTitle = $product['name'];

// fetch images and variants
$images = $productModel->getImages($productId);
$variants = $productModel->getVariants($productId);

// resolve main image (is_main = 1 or first uploaded image)
$mainImageSrc = '../assets/placeholder.png'; // default fallback ..does not exist for now 
if (!empty($images)) {
    $mainImageSrc = '../products/' . $productId . '/img/' . $images[0]['image_name'];
    foreach ($images as $img) {
        if ($img['is_main']) {
            $mainImageSrc = '../products/' . $productId . '/img/' . $img['image_name'];
            break;
        }
    }
}

// extract distinct colors and sizes from variants
$distinctColors = [];
$distinctSizes = [];
foreach ($variants as $v) {
    if (!in_array($v['color'], $distinctColors)) {
        $distinctColors[] = $v['color'];
    }
    if (!in_array($v['size'], $distinctSizes)) {
        $distinctSizes[] = $v['size'];
    }
}

// sort sizes logically
$sizeOrder = ['XS' => 1, 'S' => 2, 'M' => 3, 'L' => 4, 'XL' => 5, 'XXL' => 6];
usort($distinctSizes, function ($a, $b) use ($sizeOrder) {
    return ($sizeOrder[$a] ?? 99) <=> ($sizeOrder[$b] ?? 99);
});

// fetch reviews /// skip for now reviews are not yet implemented
$db = Database::getInstance();
$pdo = $db->getConnection();
$stmtReviews = $pdo->prepare("
    SELECT r.rating, r.review_text, r.created_at, u.first_name, u.last_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ? AND r.is_approved = 1
    ORDER BY r.created_at DESC
");
$stmtReviews->execute([$productId]);
$reviews = $stmtReviews->fetchAll();

// calculate average rating
$avgRating = 0.0;
$reviewCount = count($reviews);
if ($reviewCount > 0) {
    $totalRating = 0;
    foreach ($reviews as $rev) {
        $totalRating += $rev['rating'];
    }
    $avgRating = round($totalRating / $reviewCount, 1);
}

// fetch related products (same category, active, limit 4)
$relatedProducts = $productModel->getRelatedProducts($product['category_id'], $productId, 4);

include '../includes/header.php';
?>

<main class="product-page" style="max-width: 1280px; margin: 0 auto; padding: 2rem 1.5rem;"
    data-variants='<?= htmlspecialchars(json_encode($variants), ENT_QUOTES) ?>'
    data-images='<?= htmlspecialchars(json_encode($images), ENT_QUOTES) ?>'
    data-base-price="<?= floatval($product['price']) ?>" data-product-id="<?= intval($productId) ?>">
    <!-- breadcrumb navigation -->
    <nav class="breadcrumb-nav" style="margin-bottom: 2rem;">
        <a href="index.php"
            style="color: var(--gray-500); text-decoration: none; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em;">Home</a>
        <span style="color: var(--gray-500); margin: 0 0.75rem; font-size: 0.75rem;">/</span>
        <a href="shop.php"
            style="color: var(--gray-500); text-decoration: none; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em;">Collections</a>
        <span style="color: var(--gray-500); margin: 0 0.75rem; font-size: 0.75rem;">/</span>
        <a href="shop.php?category=<?= urlencode($product['category_name']) ?>"
            style="color: var(--gray-500); text-decoration: none; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em;"><?= htmlspecialchars($product['category_name']) ?></a>
        <span style="color: var(--gray-500); margin: 0 0.75rem; font-size: 0.75rem;">/</span>
        <span
            style="color: var(--brand-dark); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;"><?= htmlspecialchars($product['name']) ?></span>
    </nav>

    <!-- product container -->
    <div class="product-detail-container">

        <!-- product image gallery -->
        <section class="product-gallery" style="min-width: 0;">
            <!-- main image -->
            <div class="main-image-wrapper"
                style="position: relative; aspect-ratio: 3/4; margin-bottom: 1.5rem; overflow: hidden; background-color: #EAE4DE; border-radius: 1rem;">
                <img id="mainImage" alt="<?= htmlspecialchars($product['name']) ?> - Main View"
                    src="<?= $mainImageSrc ?>"
                    style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;" />
                <button class="wishlist-btn"
                    style="position: absolute; top: 1.5rem; right: 1.5rem; padding: 0.75rem; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(4px); border-radius: 50%; border: none; cursor: pointer; transition: all 0.3s ease;"
                    onclick="addToCart()">
                    <svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" stroke-width="1.5"
                        viewBox="0 0 24 24">
                        <path
                            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                            stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </button>
            </div>

            <link rel="stylesheet" href="../css/product.css">
            <!-- thumbnail gallery -->
            <div class="thumbnail-gallery"
                style="display: flex; gap: 0.75rem; overflow-x: auto; scroll-behavior: smooth; white-space: nowrap; padding: 0.5rem 0; scrollbar-width: none; -ms-overflow-style: none;">
                <?php foreach ($images as $index => $img):
                    $imgUrl = '../products/' . $productId . '/img/' . $img['image_name'];
                    $isActive = ($mainImageSrc === $imgUrl);
                    ?>
                    <img class="thumbnail" src="<?= $imgUrl ?>" alt="View <?= $index + 1 ?>"
                        data-color="<?= htmlspecialchars($img['color'] ?? '') ?>" data-is-main="<?= $img['is_main'] ?>"
                        style="width: calc(25% - 0.56rem); min-width: 80px; aspect-ratio: 3/4; object-fit: cover; border-radius: 0.5rem; cursor: pointer; border: 2px solid <?= $isActive ? 'var(--brand-dark)' : 'transparent' ?>; opacity: <?= $isActive ? '1' : '0.6' ?>; transition: all 0.3s ease; flex-shrink: 0;"
                        onclick="updateMainImage(this.src)" />
                <?php endforeach; ?>
            </div>
        </section>

        <!-- product details -->
        <section class="product-details" style="display: flex; flex-direction: column; justify-content: center;">
            <!-- product title & price -->
            <div style="margin-bottom: 2rem;">
                <h1 style="font-size: 2.5rem; font-weight: 300; color: var(--brand-dark); margin-bottom: 0.5rem;">
                    <?= htmlspecialchars($product['name']) ?></h1>
                <p style="color: var(--gray-500); font-size: 1rem; margin-bottom: 1rem;">SKU:
                    <?= htmlspecialchars($product['sku']) ?></p>

                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    <span id="productPrice"
                        style="font-size: 1.875rem; font-weight: 600; color: var(--brand-dark);">$<?= number_format($product['price'], 2) ?></span>

                    <?php if ($product['old_price'] && $product['old_price'] > $product['price']): ?>
                        <span
                            style="font-size: 1rem; color: var(--gray-500); text-decoration: line-through;">$<?= number_format($product['old_price'], 2) ?></span>
                        <?php
                        $discount = round((($product['old_price'] - $product['price']) / $product['old_price']) * 100);
                        ?>
                        <span
                            style="background-color: var(--brand-earth); color: var(--white); padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.875rem; font-weight: 600;"><?= $discount ?>%
                            OFF</span>
                    <?php endif; ?>
                </div>

                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="color: var(--brand-dark); font-weight: 600;">
                        <?php
                        $stars = round($avgRating);
                        for ($i = 1; $i <= 5; $i++) {
                            echo $i <= $stars ? '★' : '☆';
                        }
                        ?>
                    </span>
                    <span style="color: var(--gray-500); font-size: 0.875rem;">(<?= $reviewCount ?> customer
                        reviews)</span>
                </div>
            </div>

            <!-- product description -->
            <div
                style="margin-bottom: 2rem; padding: 1.5rem; background-color: rgba(244, 241, 238, 0.5); border-radius: 0.75rem;">
                <p style="color: var(--brand-dark); line-height: 1.8; font-size: 1rem;">
                    <?= nl2br(htmlspecialchars($product['description'])) ?>
                </p>
            </div>

            <!-- color options -->
            <?php if (!empty($distinctColors)): ?>
                <div style="margin-bottom: 2rem;">
                    <label
                        style="display: block; font-weight: 600; color: var(--brand-dark); margin-bottom: 1rem; text-transform: uppercase; font-size: 0.875rem; letter-spacing: 0.1em;">Select
                        Color</label>
                    <div class="color-options" style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                        <?php foreach ($distinctColors as $color):
                            $colorKey = strtolower(trim($color));
                            $colorMap = [
                                'beige' => ['bg' => '#E8DCC4', 'text' => '#1A1A1A'],
                                'magenta' => ['bg' => '#8C5B6B', 'text' => '#FFFFFF'],
                                'red' => ['bg' => '#A64B4B', 'text' => '#FFFFFF'],
                                'black' => ['bg' => '#1A1A1A', 'text' => '#FFFFFF'],
                                'white' => ['bg' => '#FAF9F6', 'text' => '#1A1A1A']
                            ];
                            $bg = $colorMap[$colorKey]['bg'] ?? $colorKey;
                            $text = $colorMap[$colorKey]['text'] ?? '#1A1A1A';
                            ?>
                            <button class="color-btn"
                                style="padding: 0.75rem 1.5rem; background-color: <?= $bg ?>; border: 2px solid transparent; border-radius: 0.5rem; cursor: pointer; transition: all 0.3s ease; color: <?= $text ?>; font-size: 0.875rem; font-weight: 500;"
                                data-color="<?= htmlspecialchars($color) ?>" onclick="selectColor(this)">
                                <?= htmlspecialchars($color) ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                    <p id="selectedColor" style="margin-top: 0.75rem; color: var(--gray-500); font-size: 0.875rem;">
                        Selected: <strong></strong></p>
                </div>
            <?php endif; ?>

            <!-- size options -->
            <?php if (!empty($distinctSizes)): ?>
                <div style="margin-bottom: 2rem;">
                    <label
                        style="display: block; font-weight: 600; color: var(--brand-dark); margin-bottom: 1rem; text-transform: uppercase; font-size: 0.875rem; letter-spacing: 0.1em;">Select
                        Size</label>
                    <div class="size-options" style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                        <?php foreach ($distinctSizes as $size): ?>
                            <button class="size-btn"
                                style="padding: 0.75rem 1.25rem; border: 1px solid var(--gray-300); background-color: transparent; border-radius: 0.5rem; cursor: pointer; transition: all 0.3s ease; font-weight: 600;"
                                data-size="<?= htmlspecialchars($size) ?>" onclick="selectSize(this)">
                                <?= htmlspecialchars($size) ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endif; ?>

            <!-- quantity selector & stock info -->
            <div style="margin-bottom: 2rem; display: flex; align-items: center; gap: 2rem;">
                <div>
                    <label
                        style="display: block; font-weight: 600; color: var(--brand-dark); margin-bottom: 0.5rem; text-transform: uppercase; font-size: 0.875rem; letter-spacing: 0.1em;">Quantity</label>
                    <div
                        style="display: flex; align-items: center; border: 1px solid var(--gray-300); border-radius: 0.5rem; width: fit-content; background: var(--white);">
                        <button onclick="decreaseQuantity()"
                            style="width: 2.5rem; height: 2.5rem; border: none; background: transparent; font-size: 1.25rem; cursor: pointer; transition: opacity 0.3s ease;">−</button>
                        <input id="quantity" type="text" value="1" readonly
                            style="width: 2.5rem; height: 2.5rem; border: none; border-left: 1px solid var(--gray-300); border-right: 1px solid var(--gray-300); text-align: center; font-size: 1rem; font-weight: 600;">
                        <button onclick="increaseQuantity()"
                            style="width: 2.5rem; height: 2.5rem; border: none; background: transparent; font-size: 1.25rem; cursor: pointer; transition: opacity 0.3s ease;">+</button>
                    </div>
                </div>

                <div style="padding-top: 1.5rem;">
                    <span id="stockStatus"></span>
                </div>
            </div>

            <!-- action buttons -->
            <div class="product-actions-grid">
                <button class="add-to-cart-btn"
                    style="padding: 1.25rem 2rem; background-color: var(--white); border: 2px solid var(--brand-dark); border-radius: 0.5rem; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: all 0.3s ease; color: var(--brand-dark);"
                    onclick="addToCart()">
                    Add to Cart
                </button>
                <button class="buy-now-btn"
                    style="padding: 1.25rem 2rem; background-color: var(--brand-dark); border: 2px solid var(--brand-dark); border-radius: 0.5rem; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: all 0.3s ease; color: var(--white);"
                    onclick="buyNow()">
                    Buy Now
                </button>
            </div>

            <!-- additional info -->
            <div style="padding-top: 2rem; border-top: 1px solid var(--gray-200);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
                    <div>
                        <p
                            style="font-weight: 600; color: var(--brand-dark); margin-bottom: 0.5rem; font-size: 0.875rem;">
                            Free Shipping</p>
                        <p style="color: var(--gray-500); font-size: 0.875rem;">On orders over $100</p>
                    </div>
                    <div>
                        <p
                            style="font-weight: 600; color: var(--brand-dark); margin-bottom: 0.5rem; font-size: 0.875rem;">
                            Easy Returns</p>
                        <p style="color: var(--gray-500); font-size: 0.875rem;">30-day return policy</p>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <!-- product specifications & reviews -->
    <section style="margin-bottom: 6rem;">
        <div class="product-specs-grid">
            <!-- specifications -->
            <div>
                <h2 style="font-size: 1.5rem; font-weight: 300; color: var(--brand-dark); margin-bottom: 1.5rem;">
                    Specifications</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid var(--gray-200);">
                        <td
                            style="padding: 1rem 0; color: var(--gray-500); font-weight: 600; text-transform: uppercase; font-size: 0.875rem;">
                            Category</td>
                        <td style="padding: 1rem 0; color: var(--brand-dark);">
                            <?= htmlspecialchars($product['category_name']) ?></td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--gray-200);">
                        <td
                            style="padding: 1rem 0; color: var(--gray-500); font-weight: 600; text-transform: uppercase; font-size: 0.875rem;">
                            SKU Reference</td>
                        <td style="padding: 1rem 0; color: var(--brand-dark);"><?= htmlspecialchars($product['sku']) ?>
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--gray-200);">
                        <td
                            style="padding: 1rem 0; color: var(--gray-500); font-weight: 600; text-transform: uppercase; font-size: 0.875rem;">
                            Care Instruction</td>
                        <td style="padding: 1rem 0; color: var(--brand-dark);">Dry clean or gentle hand wash</td>
                    </tr>
                    <tr>
                        <td
                            style="padding: 1rem 0; color: var(--gray-500); font-weight: 600; text-transform: uppercase; font-size: 0.875rem;">
                            Availability</td>
                        <td style="padding: 1rem 0; color: var(--brand-dark);">Modest storefront exclusive</td>
                    </tr>
                </table>
            </div>

            <!-- reviews -->
            <div>
                <h2 style="font-size: 1.5rem; font-weight: 300; color: var(--brand-dark); margin-bottom: 1.5rem;">
                    Customer Reviews</h2>
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <?php if (empty($reviews)): ?>
                        <p style="color: var(--gray-500);">No reviews yet for this product. Be the first to share your
                            thoughts!</p>
                    <?php else: ?>
                        <?php foreach ($reviews as $rev): ?>
                            <div style="padding-bottom: 1.5rem; border-bottom: 1px solid var(--gray-200);">
                                <div
                                    style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                    <span
                                        style="font-weight: 600; color: var(--brand-dark);"><?= htmlspecialchars($rev['first_name']) ?>
                                        <?= htmlspecialchars(substr($rev['last_name'], 0, 1)) ?>.</span>
                                    <span style="color: var(--brand-dark);">
                                        <?php
                                        for ($i = 1; $i <= 5; $i++) {
                                            echo $i <= $rev['rating'] ? '★' : '☆';
                                        }
                                        ?>
                                    </span>
                                </div>
                                <p style="color: var(--gray-500); font-size: 0.875rem; margin-bottom: 0.5rem;">
                                    Verified Purchase &bull; <?= date('F j, Y', strtotime($rev['created_at'])) ?>
                                </p>
                                <p style="color: var(--brand-dark); line-height: 1.6;">
                                    <?= nl2br(htmlspecialchars($rev['review_text'])) ?></p>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </section>

    <!-- related products -->
    <section style="margin-bottom: 6rem;">
        <h2 class="section-title"
            style="font-size: 2.25rem; text-align: center; margin-bottom: 4rem; font-weight: 300;">You May Also Like
        </h2>
        <div class="product-related-grid">
            <?php foreach ($relatedProducts as $rel):
                $relImg = $productModel->getMainImage($rel['id']);
                $relImgUrl = $relImg ? '../products/' . $rel['id'] . '/img/' . $relImg : '../assets/placeholder.png';
                ?>
                <div class="product-card" style="cursor: pointer;"
                    onclick="window.location.href='product.php?slug=<?= urlencode($rel['slug']) ?>'">
                    <div class="product-img-wrapper"
                        style="position: relative; aspect-ratio: 3/4; margin-bottom: 1rem; overflow: hidden; background-color: #EAE4DE; border-radius: 0.75rem;">
                        <img alt="<?= htmlspecialchars($rel['name']) ?>" class="hover-scale" src="<?= $relImgUrl ?>"
                            style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease-in-out;" />
                        <button class="wishlist-btn"
                            style="position: absolute; top: 1rem; right: 1rem; padding: 0.5rem; background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(4px); border-radius: 50%; border: none; cursor: pointer;"
                            onclick="quickAddToCart(<?= $rel['id'] ?>, this); event.preventDefault(); event.stopPropagation();">
                            <svg class="small-icon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
                                style="width: 1.25rem; height: 1.25rem;">
                                <path
                                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                    stroke-linecap="round" stroke-linejoin="round"></path>
                            </svg>
                        </button>
                    </div>
                    <h3 class="product-name"
                        style="font-size: 1rem; font-weight: 500; color: var(--brand-dark); margin-bottom: 0.5rem;">
                        <?= htmlspecialchars($rel['name']) ?></h3>
                    <p class="product-price" style="color: var(--gray-500); font-size: 0.875rem;">
                        $<?= number_format($rel['price'], 2) ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </section>
</main>

<!-- client-side controllers and data initialization -->
<script src="../scripts/product.js?v=<?= time() ?>"></script>

<?php include '../includes/footer.php'; ?>