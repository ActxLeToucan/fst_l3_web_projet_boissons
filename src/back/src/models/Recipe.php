<?php

namespace boissons\models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Recipe extends Model {
    protected $table = 'recipe';
    protected $primaryKey = 'id';
    public $timestamps = false;

    public function favoritesOf(): BelongsToMany {
        return $this->belongsToMany(
            User::class,
            "favorite",
            "recipe_id",
            "user_id"
        );
    }
}