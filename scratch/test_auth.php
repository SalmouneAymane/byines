<?php

require_once __DIR__ . '/../src/Config/Database.php';
require_once __DIR__ . '/../src/Contracts/UserRepositoryInterface.php';
require_once __DIR__ . '/../src/Repositories/MySQL/MySQLUserRepository.php';
require_once __DIR__ . '/../src/Controllers/Storefront/AuthController.php';

$db = \App\Config\Database::getInstance()->getConnection();
$userRepo = new \App\Repositories\MySQL\MySQLUserRepository($db);

// Check if test user exists
$user = $userRepo->findByEmail('alien.dl3bar@byines.com');
if (!$user) {
    $id = $userRepo->create([
        'first_name' => 'Alien',
        'last_name'  => 'Dl3bar',
        'email'      => 'alien.dl3bar@byines.com',
        'phone'      => '0619389174',
        'password'   => 'password123',
        'role'       => 'user'
    ]);
    echo "Created user #{$id}\n";
    $user = $userRepo->findById($id);
}

echo "Found user: " . json_encode($user) . "\n";
