<?php

ini_set('display_errors', '1');

use boissons\dbInit;
use Slim\App;

require_once __DIR__ . '/vendor/autoload.php';

$app = new App(dbInit::init());

$app->group('/api/cocktails', function () use ($app) {
    $app->get('[/]', 'boissons\controllers\CocktailController:all')->setName('cocktails');
    $app->get('/{id}[/]', 'boissons\controllers\CocktailController:one')->setName('cocktail');
});

$app->group('/api/db', function () use ($app) {
    $app->get('/init[/]', 'boissons\controllers\DbController:init')->setName('dbInit');
});

$app->run();
