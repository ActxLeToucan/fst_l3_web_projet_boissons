<?php

namespace boissons\models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Aliment extends Model {
    public $timestamps = false;
    protected $table = 'aliment';
    protected $primaryKey = 'id';

    public function subAliments(): BelongsToMany {
        return $this->belongsToMany(
            Aliment::class,
            "category",
            "aliment_id",
            "aliment_inf"
        );
    }

    public function superAliments(): BelongsToMany {
        return $this->belongsToMany(
            Aliment::class,
            "category",
            "aliment_inf",
            "aliment_id"
        );
    }

    public function inRecipes(): BelongsToMany {
        return $this->belongsToMany(
            Recipe::class,
            "ingredient",
            "aliment_id",
            "recipe_id"
        );
    }

    /**
     * Donne la liste des aliments descendants de l'aliment courant (récursivement)
     * @return array Liste des aliments
     */
    public function getDescendants(): array {
        $descendants = [];
        foreach ($this->subAliments as $subAliment) {
            $descendants[] = $subAliment;
            $descendants = array_merge($descendants, $subAliment->getDescendants());
        }
        return $descendants;
    }
}