<?php

namespace boissons\controllers;

use boissons\models\Gender;
use boissons\models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Container;

class UserController {
    public function __construct(private readonly Container $c) {
    }

    public function login(Request $rq, Response $rs, array $args): Response {
        $body = $rq->getParsedBody();
        if (!isset($body["login"]) || ($login = htmlspecialchars($body["login"])) === "")
            return $rs->withJson(["error" => "Missing login"], 400);
        if (!isset($body["password"]) || ($password = $body["password"]) === "")
            return $rs->withJson(["error" => "Missing password"], 400);

        $user = User::where("login", $login)->first();
        if ($user === null) $user = User::where("email", $login)->first();
        if ($user === null)
            return $rs->withJson(["error" => "User not found"], 404);

        if (!password_verify($password, $user->password))
            return $rs->withJson(["error" => "Wrong password"], 401);

        if ($user->token === null) {
            $user->token = bin2hex(random_bytes(64));
            $user->save();
        }

        return $rs->withJson(["token" => $user->token]);
    }

    public function register(Request $rq, Response $rs, array $args): Response {
        $body = $rq->getParsedBody();

        // parametres obligatoires
        if (!isset($body["login"]) || ($login = htmlspecialchars($body["login"])) === "")
            return $rs->withJson(["error" => "Missing login"], 400);
        if (!isset($body["password"]) || ($password = $body["password"]) === "")
            return $rs->withJson(["error" => "Missing password"], 400);

        // verification du mot de passe
        if (strlen($password) < 8)
            return $rs->withJson(["error" => "Password must be at least 8 characters long"], 400);
        if (!preg_match("/[a-z]/", $password))
            return $rs->withJson(["error" => "Password must contain at least one lowercase letter"], 400);
        if (!preg_match("/[A-Z]/", $password))
            return $rs->withJson(["error" => "Password must contain at least one uppercase letter"], 400);
        if (!preg_match("/[0-9]/", $password))
            return $rs->withJson(["error" => "Password must contain at least one digit"], 400);
        if (!preg_match("/[^a-zA-Z0-9]/", $password))
            return $rs->withJson(["error" => "Password must contain at least one special character"], 400);

        // verification du login
        if (strlen($login) < 4)
            return $rs->withJson(["error" => "Login must be at least 4 characters long"], 400);
        if (strlen($login) > 64)
            return $rs->withJson(["error" => "Login must be at most 64 characters long"], 400);
        $user = User::where("login", $login)->first();
        if ($user !== null)
            return $rs->withJson(["error" => "Login already taken"], 400);

        // parametres optionnels
        $firstname = isset($body["firstname"]) && $body["firstname"] !== "" ? htmlspecialchars($body["firstname"]) : null;
        if (!is_null($firstname) && strlen($firstname) > 32)
            return $rs->withJson(["error" => "Firstname must be at most 32 characters long"], 400);
        $lastname = isset($body["lastname"]) && $body["lastname"] !== "" ? htmlspecialchars($body["lastname"]) : null;
        if (!is_null($lastname) && strlen($lastname) > 32)
            return $rs->withJson(["error" => "Lastname must be at most 32 characters long"], 400);
        $birthdate = isset($body["birthdate"]) && $body["birthdate"] !== "" ? $body["birthdate"] : null;
        if (!is_null($birthdate) && !preg_match("/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/", $birthdate))
            return $rs->withJson(["error" => "Birthdate must be in the format YYYY-MM-DD"], 400);
        $email = isset($body["email"]) && $body["email"] !== "" ? htmlspecialchars($body["email"]) : null;
        if (!is_null($email)) {
            if (!filter_var($email, FILTER_VALIDATE_EMAIL))
                return $rs->withJson(["error" => "Invalid email"], 400);
            if (strlen($email) > 64)
                return $rs->withJson(["error" => "Email must be at most 64 characters long"], 400);
        }
        $phone = isset($body["phone"]) && $body["phone"] !== "" ? htmlspecialchars($body["phone"]) : null;
        if (!is_null($phone) && strlen($phone) > 32)
            return $rs->withJson(["error" => "Phone must be at most 32 characters long"], 400);
        $city = isset($body["city"]) && $body["city"] !== "" ? htmlspecialchars($body["city"]) : null;
        if (!is_null($city) && strlen($city) > 32)
            return $rs->withJson(["error" => "City must be at most 32 characters long"], 400);
        $zip = isset($body["zip"]) && $body["zip"] !== "" ? htmlspecialchars($body["zip"]) : null;
        if (!is_null($zip) && strlen($zip) > 8)
            return $rs->withJson(["error" => "Zip must be at most 8 characters long"], 400);
        $address = isset($body["address"]) && $body["address"] !== "" ? htmlspecialchars($body["address"]) : null;
        if (!is_null($address) && strlen($address) > 64)
            return $rs->withJson(["error" => "Address must be at most 64 characters long"], 400);
        $genderId = isset($body["gender"]) && $body["gender"] !== "" && is_numeric($body["gender"]) ? intval($body["gender"]) : null;
        if (!is_null($genderId)) {
            try {
                $gender = Gender::findOrfail($genderId);
            } catch (ModelNotFoundException $_) {
                return $rs->withJson(["error" => "Gender not found"], 404);
            }
        } else {
            $gender = null;
        }

        // creation de l'utilisateur
        $user = new User();
        $user->login = $login;
        $user->password = password_hash($password, PASSWORD_DEFAULT);
        $user->firstname = $firstname;
        $user->lastname = $lastname;
        $user->birthdate = $birthdate;
        $user->email = $email;
        $user->phone = $phone;
        $user->city = $city;
        $user->zip = $zip;
        $user->address = $address;
        is_null($gender) ? $user->gender_id = null : $user->gender()->associate($gender);
        $user->level = 0;
        $user->token = bin2hex(random_bytes(64));
        $user->save();


        return $rs->withJson(["token" => $user->token]);
    }

    public function me(Request $rq, Response $rs, array $args): Response {
        $res = User::fromToken($rq, $rs, PARAM_IN_BODY_GET);
        if ($res["response"]->getStatusCode() !== 200) return $res["response"];

        $user = $res["user"];

        return $rs->withJson($user->toArrayPublic());
    }
}