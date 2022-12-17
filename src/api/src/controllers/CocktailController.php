<?php

namespace boissons\controllers;

use boissons\models\Aliment;
use boissons\models\Recipe;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Container;

class CocktailController {
    public function __construct(private readonly Container $c) {
    }

    /**
     * Donne la liste des cocktails (id, titre, lien vers la page du cocktail)
     * @param Request $rq Requête
     * @param Response $rs Réponse
     * @param array $args Arguments (aucun)
     * @return Response Réponse en JSON
     */
    public function all(Request $rq, Response $rs, array $args): Response {
        $recipes = Recipe::select("id", "title")->get();
        foreach ($recipes as $recipe) {
            $recipe->link = $this->c->router->pathFor("cocktail", ["id" => $recipe->id]);
        }
        return $rs->withJson($recipes);
    }

    /**
     * Donne les informations d'un cocktail
     * @param Request $rq Requête
     * @param Response $rs Réponse
     * @param array $args Arguments (id du cocktail)
     * @return Response Réponse en JSON
     */
    public function one(Request $rq, Response $rs, array $args): Response {
        try {
            $cocktail = Recipe::findOrfail($args["id"]);
        } catch (ModelNotFoundException $e) {
            return $rs->withJson(["error" => "Recipe not found"], 404);
        }
        return $rs->withJson($cocktail->toArrayFull());
    }

    /**
     * Recherche les cocktails avec leur nom et leurs ingrédients
     * @param Request $rq Requête
     * @param Response $rs Réponse
     * @param array $args Arguments (aucun)
     * @return Response Réponse en JSON
     */
    public function search(Request $rq, Response $rs, array $args): Response {
        if (!isset($_GET['query']) || !is_string($_GET['query']) || $_GET['query'] === "") {
            return $rs->withJson(["error" => "Query not found"], 400);
        }

        // liste des cocktails dont le nom contient un mot de la requête
        $mots = explode(" ", $_GET['query']);
        $cocktails = Recipe::where(function ($query) use ($mots) {
            foreach ($mots as $mot) {
                $query->orWhere("title", "like", "%$mot%");
            }
        })->get();

        // filtre, on ne garde que les cocktails dont les ingrédients contiennent la requête
        if (isset($_GET['tags_plus'])) {
            $tags = explode(";", $_GET['tags_plus']);
            $allTags = $this->getAlimentIdsFromTags($tags);
            $cocktails = $cocktails->filter(function ($cocktail) use ($tags, $allTags) {
                $ingredients = $cocktail->ingredients;
                $nb = 0;
                foreach ($ingredients as $ingredient) {
                    if (in_array($ingredient->id, $allTags)) {
                        $nb++;
                    }
                }
                return $nb === count($tags);
            });
        }

        // on ne garde que les cocktails dont les ingrédients ne contiennent pas la requête
        if (isset($_GET['tags_minus'])) {
            $tags = explode(";", $_GET['tags_minus']);
            $allTags = $this->getAlimentIdsFromTags($tags);
            $cocktails = $cocktails->filter(function ($cocktail) use ($tags, $allTags) {
                $ingredients = $cocktail->ingredients;
                foreach ($ingredients as $ingredient) {
                    if (in_array($ingredient->id, $allTags)) {
                        return false;
                    }
                }
                return true;
            });
        }

        // formatage des résultats
        $min = [];
        foreach ($cocktails as $cocktail) {
            $cocktailMin = $cocktail->toArrayMin($this->c);
            if (!in_array($cocktailMin, $min)) {
                $min[] = $cocktailMin;
            }
        }

        return $rs->withJson($min);
    }

    /**
     * Récupère les ids des aliments qui correspondent aux tags ou qui en héritent
     * @param array $tags les tags à chercher
     * @return array les ids des aliments correspondants
     */
    private function getAlimentIdsFromTags(array $tags): array {
        $allTags = [];
        foreach ($tags as $tag) {
            $aliment = Aliment::find($tag);
            if ($aliment !== null && !in_array($aliment->id, $allTags)) {
                $allTags[] = $aliment->id;
                $allTags = array_merge($allTags, array_map(fn($child) => $child->id, $aliment->getDescendants()));
            }
        }
        return array_unique($allTags);
    }
}