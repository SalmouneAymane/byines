<?php

require_once __DIR__ . '/bootstrap.php';

echo json_encode([
    'success' => true,
    'data' => ['csrf_token' => \App\Security\Security::csrfToken()],
]);
