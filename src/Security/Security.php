<?php

namespace App\Security;

use RuntimeException;
use Throwable;

final class Security {
    private const RATE_LIMIT_DIRECTORY = __DIR__ . '/../../storage/security-rate-limits';

    public static function bootstrapApi(): void {
        ini_set('display_errors', '0');
        ini_set('log_errors', '1');
        error_reporting(E_ALL);
        set_exception_handler([self::class, 'handleApiException']);

        self::startSession();
        self::sendSecurityHeaders();
        header('Content-Type: application/json; charset=utf-8');

        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        if (!in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) {
            self::validateCsrfToken();
        }
    }

    public static function startSession(): void {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => self::isHttps(),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }

    public static function sendSecurityHeaders(): void {
        header('X-Frame-Options: DENY');
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
        header("Content-Security-Policy-Report-Only: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://cdn.tailwindcss.com; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self'");
    }

    public static function csrfToken(): string {
        self::startSession();
        if (!isset($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }

        return $_SESSION['csrf_token'];
    }

    public static function validateCsrfToken(): void {
        $submittedToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        $sessionToken = $_SESSION['csrf_token'] ?? '';

        if (!is_string($submittedToken) || !is_string($sessionToken)
            || $submittedToken === '' || $sessionToken === ''
            || !hash_equals($sessionToken, $submittedToken)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'The request security token is missing or invalid. Refresh the page and try again.',
            ]);
            exit;
        }
    }

    public static function consumeRateLimit(string $scope, int $limit, int $windowSeconds): array {
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
        if ($ipAddress === '') {
            throw new RuntimeException('Unable to determine client IP for rate limiting.');
        }

        $directory = self::RATE_LIMIT_DIRECTORY;
        if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
            throw new RuntimeException('Unable to initialize rate limit storage.');
        }

        $clientKey = hash('sha256', $scope . "\0" . $ipAddress);
        $file = $directory . DIRECTORY_SEPARATOR . $clientKey . '.json';
        $handle = fopen($file, 'c+');
        if ($handle === false) {
            throw new RuntimeException('Unable to open rate limit storage.');
        }

        $now = time();
        $allowed = true;
        $retryAfter = 0;
        try {
            if (!flock($handle, LOCK_EX)) {
                throw new RuntimeException('Unable to lock rate limit storage.');
            }

            $contents = stream_get_contents($handle);
            $attempts = $contents === '' ? [] : json_decode($contents, true, 512, JSON_THROW_ON_ERROR);
            if (!is_array($attempts)) {
                throw new RuntimeException('Rate limit storage has an invalid format.');
            }

            $attempts = array_values(array_filter(
                $attempts,
                static fn ($timestamp): bool => is_int($timestamp) && $timestamp > $now - $windowSeconds
            ));

            if (count($attempts) >= $limit) {
                $allowed = false;
                $retryAfter = max(1, $attempts[0] + $windowSeconds - $now);
            } else {
                $attempts[] = $now;
                $encodedAttempts = json_encode($attempts, JSON_THROW_ON_ERROR);
                rewind($handle);
                if (!ftruncate($handle, 0) || fwrite($handle, $encodedAttempts) !== strlen($encodedAttempts)) {
                    throw new RuntimeException('Unable to persist rate limit state.');
                }
                fflush($handle);
            }
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }

        return ['allowed' => $allowed, 'retry_after' => $retryAfter];
    }

    public static function handleApiException(Throwable $exception): void {
        error_log(sprintf(
            '[ByInes API] %s: %s in %s:%d',
            get_class($exception),
            $exception->getMessage(),
            $exception->getFile(),
            $exception->getLine()
        ));

        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
        }

        $response = ['success' => false, 'message' => 'Internal server error'];
        if (!self::isProduction()) {
            $response['error'] = $exception->getMessage();
        }
        echo json_encode($response);
    }

    public static function handleCaughtApiException(Throwable $exception, string $developmentMessage = 'Internal server error'): void {
        error_log(sprintf(
            '[ByInes API] %s: %s in %s:%d',
            get_class($exception),
            $exception->getMessage(),
            $exception->getFile(),
            $exception->getLine()
        ));
        http_response_code(500);

        $response = ['success' => false, 'message' => self::isProduction() ? 'Internal server error' : $developmentMessage];
        if (!self::isProduction()) {
            $response['error'] = $exception->getMessage();
        }
        echo json_encode($response);
    }

    private static function isHttps(): bool {
        return isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== '' && strtolower($_SERVER['HTTPS']) !== 'off';
    }

    public static function isProduction(): bool {
        $environment = getenv('APP_ENV');
        if ($environment === false || $environment === '') {
            $envFile = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . '.env';
            if (is_file($envFile)) {
                foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                    if (preg_match('/^\s*APP_ENV\s*=\s*(.*?)\s*$/', $line, $matches)) {
                        $environment = trim($matches[1], " \t\n\r\0\x0B\"'");
                        break;
                    }
                }
            }
        }

        return strtolower((string) ($environment ?: 'production')) === 'production';
    }
}
