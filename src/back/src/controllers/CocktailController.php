<?php

namespace boissons\controllers;

use boissons\models\Recipe;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Slim\Container;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class CocktailController {
    public function __construct(private readonly Container $c) {
    }

    public function all(Request $rq, Response $rs, array $args): Response {
        $cocktails = Recipe::all();
        $min = $cocktails->map(fn($cocktail) => $cocktail->toArrayMin());
        return $rs->withJson($min);
    }

    public function one(Request $rq, Response $rs, array $args): Response {
        try {
            $cocktail = Recipe::findOrfail($args["id"]);
        } catch (ModelNotFoundException $e) {
            return $rs->withJson(["error" => "Recipe not found"], 404);
        }
        return $rs->withJson($cocktail->toArrayFull());
    }
}