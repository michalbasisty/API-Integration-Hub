<?php

// Tests bootstrap file
putenv('APP_ENV=test');
putenv('KERNEL_CLASS=App\\Kernel');

if (!is_file(dirname(__DIR__).'/vendor/autoload_runtime.php')) {
    throw new LogicException('Symfony Runtime is not installed: execute "composer require symfony/runtime".');
}

require dirname(__DIR__).'/vendor/autoload_runtime.php';
