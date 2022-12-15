<?php

namespace boissons\controllers;

use boissons\models\Aliment;
use boissons\models\Recipe;
use Illuminate\Database\Eloquent\Model;
use Slim\Container;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class DbController {
    public function __construct(private readonly Container $c) {
    }

    public function init(Request $rq, Response $rs, array $args): Response {
        // get the file Donnees.inc.php
        $file = file_get_contents('..' . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'Donnees.inc.php');
        $file = str_replace("<?php", "", $file);
        $file = str_replace("?>", "", $file);

        // execute the file
        eval($file);
        if (!isset($Recettes) || !is_array($Recettes)) {
            return $rs->withJson(["error" => "Array \$Recettes not found"], 500);
        }
        if (!isset($Hierarchie) || !is_array($Hierarchie)) {
            return $rs->withJson(["error" => "Array \$Hierarchie not found"], 500);
        }

        // clear the database
        Recipe::all()->each(function ($recipe) {
            $recipe->delete();
        });
        Aliment::all()->each(function ($aliment) {
            $aliment->delete();
        });

        // insert the recipes
        foreach ($Recettes as $recipe) {
            $newRecipe = new Recipe();
            $newRecipe->title = $recipe["titre"];
            $newRecipe->descrIngredients = $recipe["ingredients"];
            $newRecipe->preparation = $recipe["preparation"];
            $newRecipe->save();

            $tabIngredients = $newRecipe->ingredients->map(fn($ingredient) => $ingredient->id)->toArray();

            if (isset($recipe["index"]) && is_array($recipe["index"])) {
                foreach ($recipe["index"] as $ingredient) {
                    $aliment = Aliment::where("name", $ingredient)->first();
                    if ($aliment === null) {
                        $aliment = new Aliment();
                        $aliment->name = $ingredient;
                        $aliment->save();
                    }

                    if (!in_array($aliment->id, $tabIngredients)) {
                        $newRecipe->ingredients()->attach($aliment->id);
                        $tabIngredients[] = $aliment->id;
                    }
                }
            }
        }

        // insert the hierarchy
        foreach ($Hierarchie as $alimentName => $data) {
            $aliment = Aliment::where("name", $alimentName)->first();
            if ($aliment === null) {
                $aliment = new Aliment();
                $aliment->name = $alimentName;
                $aliment->save();
            }

            $tabSubAliments = $aliment->subAliments->map(fn($subAliment) => $subAliment->id)->toArray();

            if (isset($data["sous-categorie"]) && is_array($data["sous-categorie"])) {
                foreach ($data["sous-categorie"] as $subAlimentName) {
                    $subAliment = Aliment::where("name", $subAlimentName)->first();
                    if ($subAliment === null) {
                        $subAliment = new Aliment();
                        $subAliment->name = $subAlimentName;
                        $subAliment->save();
                    }
                    if (!in_array($subAliment->id, $tabSubAliments)) {
                        $aliment->subAliments()->attach($subAliment->id);
                        $tabSubAliments[] = $subAliment->id;
                    }
                }
            }

            $tabSuperAliments = $aliment->superAliments->map(fn($superAliment) => $superAliment->id)->toArray();

            if (isset($data["super-categorie"]) && is_array($data["super-categorie"])) {
                foreach ($data["super-categorie"] as $superAlimentName) {
                    $superAliment = Aliment::where("name", $superAlimentName)->first();
                    if ($superAliment === null) {
                        $superAliment = new Aliment();
                        $superAliment->name = $superAlimentName;
                        $superAliment->save();
                    }
                    if (!in_array($superAliment->id, $tabSuperAliments)) {
                        $aliment->superAliments()->attach($superAliment->id);
                        $tabSuperAliments[] = $superAliment->id;
                    }
                }
            }
        }

        return $rs->withJson(["success" => "Database initialized"]);
    }
}