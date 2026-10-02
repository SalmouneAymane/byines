<?php

echo "=== 1. FILTER OPTIONS ===\n";
$_GET = ['action' => 'filter_options'];
ob_start();
require 'api/storefront/products.php';
$out1 = ob_get_clean();
echo $out1 . "\n\n";

echo "=== 2. FILTER BY CATEGORY 6 (Abayas) ===\n";
$_GET = ['category_id' => 6];
ob_start();
require 'api/storefront/products.php';
$out2 = ob_get_clean();
echo $out2 . "\n\n";

echo "=== 3. SEARCH 'silk' ===\n";
$_GET = ['search' => 'silk'];
ob_start();
require 'api/storefront/products.php';
$out3 = ob_get_clean();
echo $out3 . "\n\n";
