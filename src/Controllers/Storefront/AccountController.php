<?php

namespace App\Controllers\Storefront;

use App\Contracts\UserRepositoryInterface;
use App\Contracts\OrderRepositoryInterface;

class AccountController {
    public function __construct(
        private UserRepositoryInterface $userRepo,
        private OrderRepositoryInterface $orderRepo
    ) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public function handleRequest(): void {
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Please sign in to access your account.']);
            return;
        }

        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $action = $_GET['action'] ?? 'overview';

        if ($action === 'overview' && $method === 'GET') {
            $user = $this->userRepo->findById((int) $userId);
            $orders = $this->orderRepo->getOrdersByUserId((int) $userId);

            echo json_encode([
                'success' => true,
                'data' => [
                    'user'   => $user,
                    'orders' => $orders
                ]
            ]);
            return;
        }

        if ($action === 'update_profile' && $method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);

            $firstName = trim($input['first_name'] ?? '');
            $lastName = trim($input['last_name'] ?? '');
            $phone = trim($input['phone'] ?? '');

            if (empty($firstName) || empty($lastName)) {
                http_response_code(422);
                echo json_encode(['success' => false, 'message' => 'First and last name cannot be empty.']);
                return;
            }

            $this->userRepo->updateProfile((int) $userId, [
                'first_name' => $firstName,
                'last_name'  => $lastName,
                'phone'      => $phone
            ]);

            $updatedUser = $this->userRepo->findById((int) $userId);
            $_SESSION['user_name'] = $updatedUser['first_name'] . ' ' . $updatedUser['last_name'];

            echo json_encode([
                'success' => true,
                'message' => 'Profile updated successfully.',
                'data'    => $updatedUser
            ]);
            return;
        }

        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action or request method.']);
    }
}
