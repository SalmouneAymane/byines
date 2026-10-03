<?php

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === realpath(__FILE__)) {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../src/Security/Security.php';

\App\Security\Security::bootstrapApi();
