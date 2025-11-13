<?php

namespace App\Interface\Http;

use Doctrine\DBAL\Connection;
use Predis\Client as PredisClient;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class HealthController
{
    #[Route(path: '/api/health', methods: ['GET'])]
    public function health(): JsonResponse
    {
        return new JsonResponse([
            'status' => 'ok',
            'service' => 'pulseapi-backend',
            'timestamp' => (new \DateTimeImmutable())->format(DATE_ATOM),
            'message' => 'Backend is running',
        ]);
    }

    #[Route(path: '/api/status', methods: ['GET'])]
    public function status(Connection $connection, PredisClient $redis): JsonResponse
    {
        $dbStatus = 'unknown';
        $redisStatus = 'unknown';

        try {
            $connection->connect();
            $dbStatus = $connection->isConnected() ? 'connected' : 'disconnected';
        } catch (\Throwable $e) {
            $dbStatus = 'disconnected';
        }

        try {
            // If ping succeeds without throwing, consider Redis connected.
            $redis->ping();
            $redisStatus = 'connected';
        } catch (\Throwable $e) {
            $redisStatus = 'disconnected';
        }

        return new JsonResponse([
            'status' => 'ok',
            'service' => 'pulseapi-backend',
            'database' => $dbStatus,
            'redis' => $redisStatus,
            'timestamp' => (new \DateTimeImmutable())->format(DATE_ATOM),
        ]);
    }
}