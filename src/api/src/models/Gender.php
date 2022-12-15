<?php

namespace boissons\models;

use Illuminate\Database\Eloquent\Model;

class Gender extends Model {
    protected $table = 'gender';
    protected $primaryKey = 'id';
    public $timestamps = false;

    public function users() {
        return $this->hasMany(User::class, "gender_id");
    }
}