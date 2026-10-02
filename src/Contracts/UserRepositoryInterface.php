<?php

namespace App\Contracts;

interface UserRepositoryInterface {
    public function findByEmail(string $email): ?array;
    public function findById(int $id): ?array;
    public function create(array $data): int;
    public function updateProfile(int $id, array $data): bool;
}
