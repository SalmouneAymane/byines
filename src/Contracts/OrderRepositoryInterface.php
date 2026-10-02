<?php

namespace App\Contracts;

interface OrderRepositoryInterface {
    public function createOrder(array $orderData, array $items): array;
    public function getAllOrders(): array;
    public function getOrderById(int $id): ?array;
    public function getOrderByNumber(string $orderNumber): ?array;
    public function getOrdersByUserId(int $userId): array;
    public function updateOrderStatus(int $id, string $status): bool;
}
