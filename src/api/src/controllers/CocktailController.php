<?php

namespace boissons\controllers;

use boissons\models\Aliment;
use boissons\models\Recipe;
use boissons\models\User;
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
            return $rs->withJson(["error" => msgLocale($rq, "recipe_not_found")], 404);
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
        $query = $rq->getQueryParam('query');
        $tagsPlus = $rq->getQueryParam('tags_plus');
        $tagsMinus = $rq->getQueryParam('tags_minus');

        if ((is_null($query) || trim($query) === "") && is_null($tagsPlus) && is_null($tagsMinus)) {
            return $rs->withJson(["error" => msgLocale($rq, "missing_query")], 400);
        }

        // liste des cocktails dont le nom contient un mot de la requête
        $mots = is_null($query) ? [] : explode(" ", $query);
        $mots = array_filter($mots, fn($mot) => trim($mot) != ""); // supprime les mots vides
        $cocktails = Recipe::where(function ($query) use ($mots) {
            foreach ($mots as $mot) {
                $query->orWhere("title", "like", "%$mot%");
            }
        })->get();

        // filtre, on ne garde que les cocktails dont les ingrédients contiennent la requête
        if (!is_null($tagsPlus)) {
            $tags = explode(";", $tagsPlus);
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
        if (!is_null($tagsMinus)) {
            $tags = explode(";", $tagsMinus);
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

        // ordre des résultats
        usort($min, function ($a, $b) use ($mots) {
            $aPoints = 0;
            $bPoints = 0;

            $aTitle = unaccent($a['title']);
            $bTitle = unaccent($b['title']);
            $aTitleLower = strtolower($aTitle);
            $bTitleLower = strtolower($bTitle);
            $aTitleWithoutSpecialChars = preg_replace("/[^a-z0-9]/", " ", $aTitleLower);
            $bTitleWithoutSpecialChars = preg_replace("/[^a-z0-9]/", " ", $bTitleLower);
            $aWords = array_filter(explode(" ", $aTitleWithoutSpecialChars), fn($word) => $word !== "");
            $bWords = array_filter(explode(" ", $bTitleWithoutSpecialChars), fn($word) => $word !== "");
            foreach ($mots as $m) {
                $mot = strtolower(unaccent($m));
                $aPointsToAdd = 0;
                $bPointsToAdd = 0;

                // nombre de mots entiers dans le titre
                if (in_array($mot, $aWords)) $aPointsToAdd++;
                if (in_array($mot, $bWords)) $bPointsToAdd++;
                // nombre de mots dans le titre
                if (str_contains($aTitleLower, $mot)) $aPointsToAdd++;
                if (str_contains($bTitleLower, $mot)) $bPointsToAdd++;

                // vérifier si le mot est quelque part entre les parenthèses
                if (preg_match("/\(.*$mot.*\)/", $aTitleLower)) $aPointsToAdd /= 2;
                if (preg_match("/\(.*$mot.*\)/", $bTitleLower)) $bPointsToAdd /= 2;

                $aPoints += $aPointsToAdd;
                $bPoints += $bPointsToAdd;
            }

            if ($aPoints !== $bPoints) return $aPoints > $bPoints ? -1 : 1;
            return strcmp($aTitle, $bTitle);
        });

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

    public function favorites(Request $rq, Response $rs, array $args): Response {
        return $this->favs($rq, $rs, $args, true);
    }

    public function unfavorites(Request $rq, Response $rs, array $args): Response {
        return $this->favs($rq, $rs, $args, false);
    }

    private function favs(Request $rq, Response $rs, array $args, bool $add): Response {
        $ids = $add ? ($rq->getParsedBody()["ids"] ?? null) : $rq->getQueryParam('ids');

        if (is_null($ids))
            return $rs->withJson(["error" => msgLocale($rq, "missing_ids")], 400);

        $ids = explode(";", $ids);

        $res = User::fromToken($rq, $rs);
        if ($res["response"]->getStatusCode() !== 200) return $res["response"];
        $user = $res["user"];

        $favorites = $user->favorites->map(fn($cocktail) => $cocktail->id)->toArray();

        foreach ($ids as $id) {
            $cocktail = Recipe::find($id);
            if ($cocktail === null) {
                return $rs->withJson(["error" => msgLocale($rq, "recipe_not_found", $id)], 404);
            }
            if ($add) {
                if (!in_array($cocktail->id, $favorites)) {
                    $user->favorites()->attach($cocktail);
                    $favorites[] = $cocktail->id;
                }
            } else {
                if (in_array($cocktail->id, $favorites)) {
                    $user->favorites()->detach($cocktail);
                    array_splice($favorites, array_search($cocktail->id, $favorites), 1);
                }
            }
        }

        return $rs->withJson(["success" => $add ? msgLocale($rq, "recipes_added_to_favorites") : msgLocale($rq, "recipes_removed_from_favorites")]);
    }

    public function random(Request $rq, Response $rs, array $args): Response {
        $nb = $args["nb"] ?? 1;
        $nb = max($nb, 1);
        $cocktails = Recipe::inRandomOrder()->take($nb)->get();

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
}