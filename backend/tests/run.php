<?php

declare(strict_types=1);

use App\Tests\ApiTest;

// Basic runner for simple assertion-based tests

function println(string $msg): void { echo $msg . PHP_EOL; }

require dirname(__DIR__) . '/vendor/autoload.php';
require __DIR__ . '/ApiTest.php';

$results = [
    'passed' => [],
    'failed' => [],
    'skipped' => [],
];

$test = new ApiTest();

// Health endpoint simulation test
try {
    $test->testBackendHealthEndpoint();
    $results['passed'][] = 'testBackendHealthEndpoint';
} catch (\Throwable $e) {
    $results['failed'][] = 'testBackendHealthEndpoint: ' . $e->getMessage();
}

// Database connection test (skip if pdo_pgsql not available)
if (extension_loaded('pdo_pgsql')) {
    try {
        $test->testDatabaseConnection();
        $results['passed'][] = 'testDatabaseConnection';
    } catch (\Throwable $e) {
        $results['failed'][] = 'testDatabaseConnection: ' . $e->getMessage();
    }
} else {
    $results['skipped'][] = 'testDatabaseConnection (pdo_pgsql extension not loaded)';
}

// Redis connection test (method internally skips if ext-redis not loaded)
try {
    $test->testRedisConnection();
    $results['passed'][] = 'testRedisConnection';
} catch (\Throwable $e) {
    $results['failed'][] = 'testRedisConnection: ' . $e->getMessage();
}

println('--- Backend Test Results ---');
println('Passed:   ' . count($results['passed']));
println('Failed:   ' . count($results['failed']));
println('Skipped:  ' . count($results['skipped']));

if ($results['passed']) {
    println('  + ' . implode("\n  + ", $results['passed']));
}
if ($results['failed']) {
    println('  - ' . implode("\n  - ", $results['failed']));
}
if ($results['skipped']) {
    println('  ~ ' . implode("\n  ~ ", $results['skipped']));
}

// Non-zero exit if any failure
if ($results['failed']) {
    exit(1);
}

exit(0);