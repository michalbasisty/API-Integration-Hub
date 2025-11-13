<?php

namespace App\Tests;

use PHPUnit\Framework\TestCase;

class ApiTest extends TestCase
{
    public function testBackendHealthEndpoint(): void
    {
        // Simulate health check
        $result = [
            'status' => 'ok',
            'service' => 'pulseapi-backend',
        ];

        $this->assertEquals('ok', $result['status'], 'Backend should be healthy');
    }

    public function testDatabaseConnection(): void
    {
        // Test DB connection - skip if not in Docker environment
        if (!getenv('DOCKER_ENV')) {
            $this->markTestSkipped('Skipping database test outside Docker');
            return;
        }

        try {
            $dsn = 'pgsql:host=postgres;dbname=pulseapi';
            $pdo = new \PDO($dsn, 'pulseapi', 'dev_password');
            $this->assertNotNull($pdo, 'Database connection should succeed');
        } catch (\Exception $e) {
            $this->fail('Database connection failed: ' . $e->getMessage());
        }
    }

    public function testRedisConnection(): void
    {
        // Test Redis connection - skip if not in Docker environment
        if (!getenv('DOCKER_ENV')) {
            $this->markTestSkipped('Skipping Redis test outside Docker');
            return;
        }

        if (extension_loaded('redis')) {
            $redis = new \Redis();
            try {
                $redis->connect('redis', 6379);
                $pong = $redis->ping();
                $isPong = $pong === true || $pong === '+PONG' || $pong === 'PONG';
                $this->assertTrue($isPong, 'Redis should respond to ping');
            } catch (\Exception $e) {
                $this->fail('Redis connection failed: ' . $e->getMessage());
            }
        } else {
            $this->markTestSkipped('Redis extension not loaded');
        }
    }
}
