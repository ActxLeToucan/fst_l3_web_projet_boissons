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
    public $timestamps = false;
    protected $table = 'user';
    protected $primaryKey = 'id';

    /**
     * Vérifie que l'utilisateur a le niveau requis
     * @param Request $rq Requête
     * @param Response $rs Réponse
     * @param int $level Niveau requis
     * @return Response Réponse
     */
    public static function checkLevel(Request $rq, Response $rs, int $level): Response {
        $res = self::fromToken($rq, $rs);
        if ($res["response"]->getStatusCode() !== 200) return $res["response"];

        $user = $res["user"];

        return $user->level === $level ? $rs : $rs->withJson(["error" => "Permission denied"], 403);
    }

    /**
     * Retourne l'utilisateur correspondant au token de la requête
     * @param Request $rq Requête
     * @param Response $rs Réponse
     * @return array ["user" => User, "response" => Response], user ne peut pas être null si la requête est à 200
     */
    public static function fromToken(Request $rq, Response $rs): array {
        $token = $rq->getHeader("token")[0] ?? null;

        if (is_null($token) || trim($token) === "") {
            return [
                "response" => $rs->withJson(["error" => msgLocale($rq, "missing_token")], 400),
                "user" => null
            ];
        }

        try {
            $user = User::where("token", $token)->firstOrFail();
        } catch (ModelNotFoundException $_) {
            return [
                "response" => $rs->withJson(["error" => msgLocale($rq, "invalid_token")], 400),
                "user" => null
            ];
        }

        return [
            "response" => $rs,
            "user" => $user
        ];
    }

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