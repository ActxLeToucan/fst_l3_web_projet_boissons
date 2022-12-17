<?php

namespace boissons\controllers;

use boissons\models\Aliment;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Container;

class IngredientController {
    public function __construct(private readonly Container $c) {
    }

    public function all(Request $rq, Response $rs, array $args): Response {
        $ingredients = Aliment::select("id", "name", "aliment_inf as child")
            ->leftJoin("category", "aliment.id", "=", "category.aliment_id")
            ->get();

        $tabIngredients = [];
        foreach ($ingredients as $ingredient) {
            if (!isset($tabIngredients[$ingredient->id])) {
                $tabIngredients[$ingredient->id] = [
                    "id" => $ingredient->id,
                    "name" => $ingredient->name,
                    "children" => [],
                    "parents" => []
                ];
            }
            if ($ingredient->child !== null) {
                $tabIngredients[$ingredient->id]["children"][] = $ingredient->child;
            }
        }

        // find parents
        foreach ($tabIngredients as $id => $ingredient) {
            foreach ($ingredient["children"] as $child) {
                $tabIngredients[$child]["parents"][] = $id;
            }
        }

        return $rs->withJson($tabIngredients);
    }
}