<?php

namespace boissons\models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Model {
    protected $table = 'user';
    protected $primaryKey = 'id';
    public $timestamps = false;

    public function gender(): BelongsTo {
        return $this->belongsTo(Gender::class, "gender_id");
    }

    public function favorites(): BelongsToMany {
        return $this->belongsToMany(
            Recipe::class,
            "favorite",
            "user_id",
            "recipe_id"
        );
    }

    public function toArrayPublic(): array {
        return [
            "id" => $this->id,
            "login" => $this->login,
            "firstname" => $this->firstname,
            "lastname" => $this->lastname,
            "birthdate" => $this->birthdate,
            "email" => $this->email,
            "city" => $this->city,
            "zip" => $this->zip,
            "address" => $this->address,
            "gender_id" => $this->gender_id,
            "gender" => $this->gender ? $this->gender->name : null,
            "level" => $this->level
        ];
    }
}