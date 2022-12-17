<?php

ini_set('display_errors', '1');

use boissons\dbInit;
use Slim\App;

require_once __DIR__ . '/vendor/autoload.php';

$app = new App(dbInit::init());

$app->group('/cocktails', function () use ($app) {
    $app->get('[/]', 'boissons\controllers\CocktailController:all')->setName('cocktails');
    $app->get('/search', 'boissons\controllers\CocktailController:search')->setName('search');
    $app->get('/{id}[/]', 'boissons\controllers\CocktailController:one')->setName('cocktail');
});

$app->group('/ingredients', function () use ($app) {
    $app->get('[/]', 'boissons\controllers\IngredientController:all')->setName('ingredients');
});

$app->group('/db', function () use ($app) {
    $app->get('/init[/]', 'boissons\controllers\DbController:init')->setName('dbInit');
});

$app->run();
