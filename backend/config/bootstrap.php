<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__) . '/vendor/autoload.php';

if (!isset($_SERVER['APP_ENV'])) {
    $_SERVER['APP_ENV'] = $_ENV['APP_ENV'] ?? 'dev';
}

if (!isset($_SERVER['APP_DEBUG'])) {
    $_SERVER['APP_DEBUG'] = $_ENV['APP_DEBUG'] ?? (($_SERVER['APP_ENV'] ?? 'dev') !== 'prod');
}

if (class_exists(Dotenv::class)) {
    (new Dotenv())->usePutenv()->bootEnv(dirname(__DIR__) . '/.env');
}