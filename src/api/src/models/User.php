<?php

namespace boissons\models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class User extends Model {
    const ADMIN = 1;
    const USER = 0;

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

    public static function getUser(Request $rq, Response $rs, bool $paramInBody): array {
        if (is_null($token = $paramInBody ? $rq->getParsedBody()["token"] : $rq->getQueryParam("token")))
            return [
                "response" => $rs->withJson(["error" => "Missing token"], 400),
                "user" => null
            ];

        try {
            $user = User::where("token", $token)->firstOrFail();
        } catch (ModelNotFoundException $_) {
            return [
                "response" => $rs->withJson(["error" => "Invalid token"], 404),
                "user" => null
            ];
        }

        return [
            "response" => $rs,
            "user" => $user
        ];
    }

    public static function checkLevel(Request $rq, Response $rs, int $level, bool $paramInBody): Response {
        $res = self::getUser($rq, $rs, $paramInBody);
        if ($res["response"]->getStatusCode() !== 200) return $res["response"];

        $user = $res["user"];

        return $user->level === $level ? $rs : $rs->withJson(["error" => "Permission denied"], 403);
    }
}