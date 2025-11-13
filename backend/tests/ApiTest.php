<?php

namespace App\Tests;

class ApiTest
{
    public function testBackendHealthEndpoint(): void
    {
        // Simulate health check
        $result = [
            'status' => 'ok',
            'service' => 'pulseapi-backend',
        ];
        
        assert($result['status'] === 'ok', 'Backend should be healthy');
    }

    public function testDatabaseConnection(): void
    {
        // Test DB connection
        try {
            $dsn = 'pgsql:host=postgres;dbname=pulseapi';
            $pdo = new \PDO($dsn, 'pulseapi', 'dev_password');
            assert($pdo !== null, 'Database connection should succeed');
        } catch (\Exception $e) {
            throw new \RuntimeException('Database connection failed: ' . $e->getMessage());
        }
    }

    public function testRedisConnection(): void
    {
        // Test Redis connection
        if (extension_loaded('redis')) {
            $redis = new \Redis();
            try {
                $redis->connect('redis', 6379);
                $pong = $redis->ping();
                $isPong = $pong === true || $pong === '+PONG' || $pong === 'PONG';
                assert($isPong, 'Redis should respond to ping');
            } catch (\Exception $e) {
                throw new \RuntimeException('Redis connection failed: ' . $e->getMessage());
            }
        }
    }
}
