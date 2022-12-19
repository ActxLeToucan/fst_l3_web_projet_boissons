<?php

namespace boissons\models;

use Illuminate\Database\Eloquent\Model;

class Gender extends Model {
    public $timestamps = false;
    protected $table = 'gender';
    protected $primaryKey = 'id';

    public function users() {
        return $this->hasMany(User::class, "gender_id");
    }
}