<?php

namespace App\Controllers\Storefront;

use App\Contracts\UserRepositoryInterface;

class AuthController {
    public function __construct(
        private UserRepositoryInterface $userRepo
    ) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public function handleRequest(): void {
        $action = $_GET['action'] ?? 'me';
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        if ($action === 'me' && $method === 'GET') {
            $this->handleMe();
            return;
        }

        if ($action === 'login' && $method === 'POST') {
            $this->handleLogin();
            return;
        }

        if ($action === 'signup' && $method === 'POST') {
            $this->handleSignup();
            return;
        }

        if ($action === 'logout' && $method === 'POST') {
            $this->handleLogout();
            return;
        }

        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action or request method.']);
    }

    private function handleMe(): void {
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            echo json_encode(['success' => true, 'data' => null]);
            return;
        }

        $user = $this->userRepo->findById((int) $userId);
        echo json_encode([
            'success' => true,
            'data' => $user
        ]);
    }

    private function handleLogin(): void {
        $input = json_decode(file_get_contents('php://input'), true);

        $email = strtolower(trim($input['email'] ?? ''));
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Please provide both email and password.']);
            return;
        }

        $user = $this->userRepo->findByEmail($email);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid email address or password.']);
            return;
        }

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
        $_SESSION['user_role'] = $user['role'];

        unset($user['password_hash']);

        echo json_encode([
            'success' => true,
            'message' => 'Logged in successfully.',
            'data' => $user
        ]);
    }

    private function handleSignup(): void {
        $input = json_decode(file_get_contents('php://input'), true);

        $firstName = trim($input['first_name'] ?? '');
        $lastName = trim($input['last_name'] ?? '');
        $email = strtolower(trim($input['email'] ?? ''));
        $phone = trim($input['phone'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($firstName) || empty($lastName)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Please enter your first and last name.']);
            return;
        }

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Please provide a valid email address.']);
            return;
        }

        if (empty($password) || strlen($password) < 6) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long.']);
            return;
        }

        $existing = $this->userRepo->findByEmail($email);
        if ($existing) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'An account with this email address already exists.']);
            return;
        }

        $userId = $this->userRepo->create([
            'first_name' => $firstName,
            'last_name'  => $lastName,
            'email'      => $email,
            'phone'      => $phone,
            'password'   => $password,
            'role'       => 'user'
        ]);

        $user = $this->userRepo->findById($userId);

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
        $_SESSION['user_role'] = $user['role'];

        echo json_encode([
            'success' => true,
            'message' => 'Account created successfully.',
            'data' => $user
        ]);
    }

    private function handleLogout(): void {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();

        echo json_encode([
            'success' => true,
            'message' => 'Logged out successfully.'
        ]);
    }
}
