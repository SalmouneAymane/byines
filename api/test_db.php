<?php

header('Content-Type: application/json; charset=utf-8');

// Autoload / Include Config
require_once __DIR__ . '/../src/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::getInstance()->getConnection();

    // Query tables list
    $tablesStmt = $db->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

    // Query sample counts
    $counts = [];
    $trackedTables = ['categories', 'products', 'users', 'collections', 'orders'];
    foreach ($trackedTables as $table) {
        if (in_array($table, $tables)) {
            $stmt = $db->query("SELECT COUNT(*) FROM `{$table}`");
            $counts[$table] = (int) $stmt->fetchColumn();
        }
    }

    echo json_encode([
        'success'   => true,
        'message'   => 'Database connection successful!',
        'database'  => $_ENV['DB_NAME'] ?? 'byines_db',
        'tables'    => $tables,
        'counts'    => $counts,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed.',
        'error'   => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
