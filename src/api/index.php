<?php

ini_set('display_errors', '1');

use boissons\dbInit;
use Slim\App;

require_once __DIR__ . '/vendor/autoload.php';

$app = new App(dbInit::init());

const PARAM_IN_BODY_GET = false;
const PARAM_IN_BODY_POST = true;
const PARAM_IN_BODY_PUT = true;
const PARAM_IN_BODY_DELETE = false;
const PARAM_IN_BODY_PATCH = true;

/**
 * Remove accents from a string
 * (from {@link https://gist.github.com/evaisse/169594?permalink_comment_id=4048789#gistcomment-4048789 a GitHub comment})
 * @param string $string String to remove accents from
 * @return string String without accents
 */
function unaccent(string $string): string {
    return preg_replace('~&([a-z]{1,2})(acute|cedil|circ|grave|lig|orn|ring|slash|th|tilde|uml);~i', '$1', htmlentities($string, ENT_QUOTES, 'UTF-8'));
}

$app->group('/cocktails', function () use ($app) {
    $app->get('[/]', 'boissons\controllers\CocktailController:all')->setName('cocktails');
    $app->get('/search', 'boissons\controllers\CocktailController:search')->setName('search');
    $app->get('/{id}[/]', 'boissons\controllers\CocktailController:one')->setName('cocktail');
});

$app->group('/ingredients', function () use ($app) {
    $app->get('[/]', 'boissons\controllers\IngredientController:all')->setName('ingredients');
});

$app->group('/users', function () use ($app) {
    $app->post('/login', 'boissons\controllers\UserController:login')->setName('login');
    $app->post('/register', 'boissons\controllers\UserController:register')->setName('register');
    $app->get('/me', 'boissons\controllers\UserController:me')->setName('me');
    $app->get('/{login}[/]', 'boissons\controllers\UserController:fromLogin')->setName('user');
});

$app->group('/genders', function () use ($app) {
    $app->get('[/]', 'boissons\controllers\GenderController:all')->setName('genders');
});

$app->group('/db', function () use ($app) {
    $app->get('/init[/]', 'boissons\controllers\DbController:init')->setName('dbInit');
});

$app->run();