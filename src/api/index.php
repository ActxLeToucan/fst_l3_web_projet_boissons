<?php

ini_set('display_errors', '1');

use boissons\dbInit;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

require_once __DIR__ . '/vendor/autoload.php';

$app = new App(dbInit::init());

const PARAM_IN_BODY_GET = false;
const PARAM_IN_BODY_POST = true;
const PARAM_IN_BODY_PUT = true;
const PARAM_IN_BODY_DELETE = false;
const PARAM_IN_BODY_PATCH = true;

const SUPPORTED_LANGUAGES = ['en', 'fr'];
const DEFAULT_LANGUAGE = 'en';


$app->group('/cocktails', function () use ($app) {
    $app->get('[/]', 'boissons\controllers\CocktailController:all')->setName('cocktails');
    $app->get('/search[/]', 'boissons\controllers\CocktailController:search')->setName('search');
    $app->post('/favorites[/]', 'boissons\controllers\CocktailController:favorites')->setName('favorites');
    $app->delete('/favorites[/]', 'boissons\controllers\CocktailController:unfavorites')->setName('unfavorites');
    $app->get('/random[/[{nb}[/]]]', 'boissons\controllers\CocktailController:random')->setName('random');
    $app->get('/{id}[/]', 'boissons\controllers\CocktailController:one')->setName('cocktail');
});

$app->group('/ingredients', function () use ($app) {
    $app->get('[/]', 'boissons\controllers\IngredientController:all')->setName('ingredients');
});

$app->group('/users', function () use ($app) {
    $app->post('/login[/]', 'boissons\controllers\UserController:login')->setName('login');
    $app->post('/register[/]', 'boissons\controllers\UserController:register')->setName('register');
    $app->group('/me', function () use ($app) {
        $app->get('[/]', 'boissons\controllers\UserController:me')->setName('me');
        $app->put('[/]', 'boissons\controllers\UserController:update')->setName('update');
        $app->delete('[/]', 'boissons\controllers\UserController:delete')->setName('delete');
        $app->get('/favorites[/]', 'boissons\controllers\UserController:favorites')->setName('favorites');
        $app->patch('/password[/]', 'boissons\controllers\UserController:changePassword')->setName('changePassword');
    });
});

$app->group('/genders', function () use ($app) {
    $app->get('[/]', 'boissons\controllers\GenderController:all')->setName('genders');
});

$app->group('/db', function () use ($app) {
    $app->get('/init[/]', 'boissons\controllers\DbController:init')->setName('dbInit');
});

$app->run();

/**
 * Remove accents from a string
 * (from {@link https://gist.github.com/evaisse/169594?permalink_comment_id=4048789#gistcomment-4048789 a GitHub comment})
 * @param string $string String to remove accents from
 * @return string String without accents
 */
function unaccent(string $string): string {
    return preg_replace('~&([a-z]{1,2})(acute|cedil|circ|grave|lig|orn|ring|slash|th|tilde|uml);~i', '$1', htmlentities($string, ENT_QUOTES, 'UTF-8'));
}

/**
 * Get a message in the current language
 * @param Request $rq Request to get the language from
 * @param string $key Message key
 * @param mixed $extra Extra data to insert in the message
 * @return string Message
 */
function msgLocale(Request $rq, string $key, mixed $extra = null): string {
    $lang = $rq->getHeader("Accept-Language")[0] ?? DEFAULT_LANGUAGE;
    if (!in_array($lang, SUPPORTED_LANGUAGES)) $lang = DEFAULT_LANGUAGE;

    $messages = [
        // token
        'missing_token' => [
            'en' => "Missing token",
            'fr' => "Jeton manquant",
        ],
        'invalid_token' => [
            'en' => "Invalid token",
            'fr' => "Jeton invalide",
        ],

        // user
        'address_too_long' => [
            'en' => "Address must be at most $extra characters long",
            'fr' => "L'adresse doit faire au plus $extra caractères",
        ],
        'city_too_long' => [
            'en' => "City must be at most $extra characters long",
            'fr' => "La ville doit faire au plus $extra caractères",
        ],
        'email_too_long' => [
            'en' => "Email must be at most $extra characters long",
            'fr' => "L'adresse email doit faire au plus $extra caractères",
        ],
        'firstname_too_long' => [
            'en' => "Firstname must be at most $extra characters long",
            'fr' => "Le prénom doit faire au plus $extra caractères",
        ],
        'gender_not_found' => [
            'en' => "Gender not found",
            'fr' => "Genre inconnu",
        ],
        'invalid_birthdate' => [
            'en' => "Birthdate must be in the format $extra",
            'fr' => "La date de naissance doit être au format $extra",
        ],
        'invalid_email' => [
            'en' => "Invalid email",
            'fr' => "Adresse email invalide",
        ],
        'lastname_too_long' => [
            'en' => "Lastname must be at most $extra characters long",
            'fr' => "Le nom doit faire au plus $extra caractères",
        ],
        'phone_too_long' => [
            'en' => "Phone must be at most $extra characters long",
            'fr' => "Le numéro de téléphone doit faire au plus $extra caractères",
        ],
        'user_deleted' => [
            'en' => "User deleted",
            'fr' => "Utilisateur supprimé",
        ],
        'user_not_found' => [
            'en' => "User not found",
            'fr' => "Utilisateur inconnu",
        ],
        'user_updated' => [
            'en' => "User updated",
            'fr' => "Utilisateur mis à jour",
        ],
        'zip_too_long' => [
            'en' => "Zip code must be at most $extra characters long",
            'fr' => "Le code postal doit faire au plus $extra caractères",
        ],

        // login
        'login_already_used' => [
            'en' => "Login already used",
            'fr' => "Ce nom d'utilisateur est déjà utilisé",
        ],
        'login_too_long' => [
            'en' => "Login must be at most $extra characters long",
            'fr' => "Le nom d'utilisateur doit faire au plus $extra caractères",
        ],
        'login_too_short' => [
            'en' => "Login must be at least $extra characters long",
            'fr' => "Le nom d'utilisateur doit faire au moins $extra caractères",
        ],
        'missing_login' => [
            'en' => "Missing login",
            'fr' => "Le nom d'utilisateur est manquant",
        ],

        // password
        'missing_password' => [
            'en' => "Missing password",
            'fr' => "Le mot de passe est manquant",
        ],
        'missing_new_password' => [
            'en' => "Missing new password",
            'fr' => "Le nouveau mot de passe est manquant",
        ],
        'password_updated' => [
            'en' => "Password updated",
            'fr' => "Mot de passe mis à jour",
        ],
        'password_no_lowercase' => [
            'en' => "Password must contain at least one lowercase letter",
            'fr' => "Le mot de passe doit contenir au moins une lettre minuscule",
        ],
        'password_no_number' => [
            'en' => "Password must contain at least one digit",
            'fr' => "Le mot de passe doit contenir au moins un chiffre",
        ],
        'password_no_special' => [
            'en' => "Password must contain at least one special character",
            'fr' => "Le mot de passe doit contenir au moins un caractère spécial",
        ],
        'password_no_uppercase' => [
            'en' => "Password must contain at least one uppercase letter",
            'fr' => "Le mot de passe doit contenir au moins une lettre majuscule",
        ],
        'password_too_short' => [
            'en' => "Password must be at least $extra characters long",
            'fr' => "Le mot de passe doit faire au moins $extra caractères",
        ],
        'wrong_password' => [
            'en' => "Wrong password",
            'fr' => "Mot de passe incorrect",
        ],

        // recipes
        'missing_ids' => [
            'en' => "Missing ids",
            'fr' => "Identifiants manquants",
        ],
        'missing_query' => [
            'en' => "Missing query",
            'fr' => "Requête manquante",
        ],
        'recipe_added_to_favorites' => [
            'en' => "Cocktail added to favorites",
            'fr' => "Cocktail ajouté aux favoris",
        ],
        'recipe_removed_from_favorites' => [
            'en' => "Cocktail removed from favorites",
            'fr' => "Cocktail retiré des favoris",
        ],
        'recipes_added_to_favorites' => [
            'en' => "Cocktails added to favorites",
            'fr' => "Cocktails ajoutés aux favoris",
        ],
        'recipes_removed_from_favorites' => [
            'en' => "Cocktails removed from favorites",
            'fr' => "Cocktails retirés des favoris",
        ],
        'recipe_not_found' => [
            'en' => is_null($extra) ? "Cocktail not found" : "Cocktail $extra not found",
            'fr' => is_null($extra) ? "Cocktail introuvable" : "Cocktail $extra introuvable",
        ],

        // db
        'db_recettes_not_found' => [
            'en' => "Array \$Recettes not found",
            'fr' => "Tableau \$Recettes introuvable",
        ],
        'db_hierarchie_not_found' => [
            'en' => "Array \$Hierarchie not found",
            'fr' => "Tableau \$Hierarchie introuvable",
        ],
        'db_init_success' => [
            'en' => "Database initialized successfully",
            'fr' => "Base de données initialisée avec succès",
        ],
    ];

    $default = [
        'en' => "No message found",
        'fr' => "Aucun message trouvé"
    ];

    return ($messages[$key] ?? $default)[$lang];
}