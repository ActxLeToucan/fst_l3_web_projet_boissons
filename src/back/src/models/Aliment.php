<?php

namespace boissons\models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Aliment extends Model {
    protected $table = 'aliment';
    protected $primaryKey = 'id';
    public $timestamps = false;

    public function under(): BelongsToMany {
        return $this->belongsToMany(
            Aliment::class,
            "category",
            "aliment_id",
            "aliment_inf"
        );
    }

    public function above(): BelongsToMany {
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
        )->withPivot("unit", "quantity");
    }
}