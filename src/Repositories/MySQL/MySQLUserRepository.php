<?php

namespace App\Repositories\MySQL;

use App\Contracts\UserRepositoryInterface;
use PDO;

class MySQLUserRepository implements UserRepositoryInterface {
    public function __construct(private PDO $db) {}

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute(['email' => strtolower(trim($email))]);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);
        return $res ?: null;
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT id, first_name, last_name, email, phone, role, created_at FROM users WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);
        return $res ?: null;
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare("
            INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
            VALUES (:first_name, :last_name, :email, :phone, :password_hash, :role)
        ");

        $stmt->execute([
            'first_name'    => trim($data['first_name']),
            'last_name'     => trim($data['last_name']),
            'email'         => strtolower(trim($data['email'])),
            'phone'         => !empty($data['phone']) ? trim($data['phone']) : null,
            'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
            'role'          => $data['role'] ?? 'user'
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function updateProfile(int $id, array $data): bool {
        $stmt = $this->db->prepare("
            UPDATE users 
            SET first_name = :first_name,
                last_name = :last_name,
                phone = :phone
            WHERE id = :id
        ");

        return $stmt->execute([
            'id'         => $id,
            'first_name' => trim($data['first_name']),
            'last_name'  => trim($data['last_name']),
            'phone'      => !empty($data['phone']) ? trim($data['phone']) : null
        ]);
    }
}
