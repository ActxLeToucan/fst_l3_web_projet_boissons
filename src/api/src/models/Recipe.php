<?php

namespace boissons\models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Slim\Container;

class Recipe extends Model {
    public $timestamps = false;
    protected $table = 'recipe';
    protected $primaryKey = 'id';

    public function favoriteOf(): BelongsToMany {
        return $this->belongsToMany(
            User::class,
            "favorite",
            "recipe_id",
            "user_id"
        );
    }

    public function ingredients(): BelongsToMany {
        return $this->belongsToMany(
            Aliment::class,
            "ingredient",
            "recipe_id",
            "aliment_id"
        );
    }

    public function toArrayMin(Container $container): array {
        return [
            "id" => $this->id,
            "title" => $this->title,
            "link" => $container->router->pathFor("cocktail", ["id" => $this->id])
        ];
    }

    public function toArrayFull(): array {
        $tabIngredients = [];
        foreach ($this->ingredients as $ingredient) {
            $tabIngredients[$ingredient->id] = $ingredient->name;
        }
        return [
            "id" => $this->id,
            "title" => $this->title,
            "preparation" => $this->preparation,
            "descrIngredients" => explode("|", $this->descrIngredients),
            "ingredients" => $tabIngredients
        ];
    }
}