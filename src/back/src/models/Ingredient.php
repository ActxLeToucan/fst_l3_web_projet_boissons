<?php

namespace boissons\models;

use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model {
    protected $table = 'ingredient';
    protected $primaryKey = 'id';
    public $timestamps = false;


}