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
            return $rs->withJson(["error" => msgLocale($rq, "missing_login")], 400);
        if (!isset($body["password"]) || ($password = $body["password"]) === "")
            return $rs->withJson(["error" => msgLocale($rq, "missing_password")], 400);

        $user = User::where("login", $login)->first();
        if ($user === null) $user = User::where("email", $login)->first();
        if ($user === null)
            return $rs->withJson(["error" => msgLocale($rq, "user_not_found")], 404);

        if (!password_verify($password, $user->password))
            return $rs->withJson(["error" => msgLocale($rq, "wrong_password")], 401);

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
            return $rs->withJson(["error" => msgLocale($rq, "missing_login")], 400);
        if (!isset($body["password"]) || ($password = $body["password"]) === "")
            return $rs->withJson(["error" => msgLocale($rq, "missing_password")], 400);

        // verification du mot de passe
        if (($rs = $this->checkPasswordField($rq, $rs, $password))->getStatusCode() !== 200) return $rs;

        // verification du login
        if (strlen($login) < 4)
            return $rs->withJson(["error" => msgLocale($rq, "login_too_short", 4)], 400);
        if (strlen($login) > 64)
            return $rs->withJson(["error" => msgLocale($rq, "login_too_long", 64)], 400);
        $user = User::where("login", $login)->first();
        if ($user !== null)
            return $rs->withJson(["error" => msgLocale($rq, "login_already_used")], 400);

        // parametres optionnels
        $firstname = isset($body["firstname"]) && $body["firstname"] !== "" ? htmlspecialchars($body["firstname"]) : null;
        if (($rs = $this->checkFirstnameField($rq, $rs, $firstname))->getStatusCode() !== 200) return $rs;

        $lastname = isset($body["lastname"]) && $body["lastname"] !== "" ? htmlspecialchars($body["lastname"]) : null;
        if (($rs = $this->checkLastnameField($rq, $rs, $lastname))->getStatusCode() !== 200) return $rs;

        $birthdate = isset($body["birthdate"]) && $body["birthdate"] !== "" ? $body["birthdate"] : null;
        if (($rs = $this->checkBirthdateField($rq, $rs, $birthdate))->getStatusCode() !== 200) return $rs;

        $email = isset($body["email"]) && $body["email"] !== "" ? htmlspecialchars($body["email"]) : null;
        if (($rs = $this->checkEmailField($rq, $rs, $email))->getStatusCode() !== 200) return $rs;

        $phone = isset($body["phone"]) && $body["phone"] !== "" ? htmlspecialchars($body["phone"]) : null;
        if (($rs = $this->checkPhoneField($rq, $rs, $phone))->getStatusCode() !== 200) return $rs;

        $city = isset($body["city"]) && $body["city"] !== "" ? htmlspecialchars($body["city"]) : null;
        if (($rs = $this->checkCityField($rq, $rs, $city))->getStatusCode() !== 200) return $rs;

        $zip = isset($body["zip"]) && $body["zip"] !== "" ? htmlspecialchars($body["zip"]) : null;
        if (($rs = $this->checkZipField($rq, $rs, $zip))->getStatusCode() !== 200) return $rs;

        $address = isset($body["address"]) && $body["address"] !== "" ? htmlspecialchars($body["address"]) : null;
        if (($rs = $this->checkAddressField($rq, $rs, $address))->getStatusCode() !== 200) return $rs;

        $genderId = isset($body["gender"]) && $body["gender"] !== "" && is_numeric($body["gender"]) ? intval($body["gender"]) : null;
        $res = $this->checkGenderField($rq, $rs, $genderId);

        if (($rs = $res['response'])->getStatusCode() !== 200) return $rs;
        $gender = $res['gender'];

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

    /**
     * Check the password field
     * @param Request $rq The request
     * @param Response $rs The response
     * @param string $password The password to check
     * @return Response The response
     */
    private function checkPasswordField(Request $rq, Response $rs, string $password): Response {
        if (strlen($password) < 8)
            return $rs->withJson(["error" => msgLocale($rq, "password_too_short", 8)], 400);
        if (!preg_match("/[a-z]/", $password))
            return $rs->withJson(["error" => msgLocale($rq, "password_no_lowercase")], 400);
        if (!preg_match("/[A-Z]/", $password))
            return $rs->withJson(["error" => msgLocale($rq, "password_no_uppercase")], 400);
        if (!preg_match("/[0-9]/", $password))
            return $rs->withJson(["error" => msgLocale($rq, "password_no_number")], 400);
        if (!preg_match("/[^a-zA-Z0-9]/", $password))
            return $rs->withJson(["error" => msgLocale($rq, "password_no_special")], 400);

        return $rs;
    }

    /**
     * Check the firstname field
     * @param Request $rq The request
     * @param Response $rs The response
     * @param string|null $firstname The firstname to check
     * @return Response The response
     */
    private function checkFirstnameField(Request $rq, Response $rs, ?string $firstname): Response {
        if (!is_null($firstname) && strlen($firstname) > 32)
            return $rs->withJson(["error" => msgLocale($rq, "firstname_too_long", 32)], 400);

        return $rs;
    }

    /**
     * Check the lastname field
     * @param Request $rq The request
     * @param Response $rs The response
     * @param string|null $lastname The lastname to check
     * @return Response The response
     */
    private function checkLastnameField(Request $rq, Response $rs, ?string $lastname): Response {
        if (!is_null($lastname) && strlen($lastname) > 32)
            return $rs->withJson(["error" => msgLocale($rq, "lastname_too_long", 32)], 400);

        return $rs;
    }

    /**
     * Check the birthdate field
     * @param Request $rq The request
     * @param Response $rs The response
     * @param string|null $birthdate The birthdate to check
     * @return Response The response
     */
    private function checkBirthdateField(Request $rq, Response $rs, ?string $birthdate): Response {
        if (!is_null($birthdate) && !preg_match("/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/", $birthdate))
            return $rs->withJson(["error" => msgLocale($rq, "invalid_birthdate", "YYYY-MM-DD")], 400);

        return $rs;
    }

    /**
     * Check the email field
     * @param Request $rq The request
     * @param Response $rs The response
     * @param string|null $email The email to check
     * @return Response The response
     */
    private function checkEmailField(Request $rq, Response $rs, ?string $email): Response {
        if (!is_null($email)) {
            if (!filter_var($email, FILTER_VALIDATE_EMAIL))
                return $rs->withJson(["error" => msgLocale($rq, "invalid_email")], 400);
            if (strlen($email) > 64)
                return $rs->withJson(["error" => msgLocale($rq, "email_too_long", 64)], 400);
        }

        return $rs;
    }

    /**
     * Check the phone field
     * @param Request $rq The request
     * @param Response $rs The response
     * @param string|null $phone The phone to check
     * @return Response The response
     */
    private function checkPhoneField(Request $rq, Response $rs, ?string $phone): Response {
        if (!is_null($phone) && strlen($phone) > 32)
            return $rs->withJson(["error" => msgLocale($rq, "phone_too_long", 32)], 400);

        return $rs;
    }

    /**
     * Check the city field
     * @param Request $rq The request
     * @param Response $rs The response
     * @param string|null $city The city to check
     * @return Response The response
     */
    private function checkCityField(Request $rq, Response $rs, ?string $city): Response {
        if (!is_null($city) && strlen($city) > 32)
            return $rs->withJson(["error" => msgLocale($rq, "city_too_long", 32)], 400);

        return $rs;
    }

    /**
     * Check the zip field
     * @param Request $rq The request
     * @param Response $rs The response
     * @param string|null $zip The zip to check
     * @return Response The response
     */
    private function checkZipField(Request $rq, Response $rs, ?string $zip): Response {
        if (!is_null($zip) && strlen($zip) > 8)
            return $rs->withJson(["error" => msgLocale($rq, "zip_too_long", 8)], 400);

        return $rs;
    }

    /**
     * Check the address field
     * @param Request $rq The request
     * @param Response $rs The response
     * @param string|null $address The address to check
     * @return Response The response
     */
    private function checkAddressField(Request $rq, Response $rs, ?string $address): Response {
        if (!is_null($address) && strlen($address) > 64)
            return $rs->withJson(["error" => msgLocale($rq, "address_too_long", 64)], 400);

        return $rs;
    }

    /**
     * Check the gender field
     * @param Request $rq The request
     * @param Response $rs The response
     * @param int|null $genderId The gender id to check
     * @return Response The response
     */
    private function checkGenderField(Request $rq, Response $rs, ?int $genderId): array {
        $res = [
            'response' => $rs,
            'gender' => null
        ];

        if (!is_null($genderId)) {
            try {
                $res['gender'] = Gender::findOrfail($genderId);
            } catch (ModelNotFoundException $_) {
                $res['response'] = $rs->withJson(["error" => msgLocale($rq, "gender_not_found")], 400);
            }
        }

        return $res;
    }

    public function me(Request $rq, Response $rs, array $args): Response {
        $res = User::fromToken($rq, $rs, PARAM_IN_BODY_GET);
        if ($res["response"]->getStatusCode() !== 200) return $res["response"];

        $user = $res["user"];

        return $rs->withJson($user->toArrayPublic());
    }

    public function favorites(Request $rq, Response $rs, array $args): Response {
        $res = User::fromToken($rq, $rs, PARAM_IN_BODY_GET);
        if ($res["response"]->getStatusCode() !== 200) return $res["response"];

        $user = $res["user"];

        $favorites = $user->favorites()->get();

        // formatage des résultats
        $min = [];
        foreach ($favorites as $cocktail) {
            $cocktailMin = $cocktail->toArrayMin($this->c);
            $min[] = $cocktailMin;
        }

        return $rs->withJson($min);
    }

    public function changePassword(Request $rq, Response $rs, array $args): Response {
        $res = User::fromToken($rq, $rs, PARAM_IN_BODY_PATCH);
        if ($res["response"]->getStatusCode() !== 200) return $res["response"];

        $user = $res["user"];

        $body = $rq->getParsedBody();

        // vérification des champs
        if (!isset($body["old"]) || ($old = $body["old"]) === "")
            return $rs->withJson(["error" => msgLocale($rq, "missing_password")], 400);
        if (!isset($body["new"]) || ($new = $body["new"]) === "")
            return $rs->withJson(["error" => msgLocale($rq, "missing_new_password")], 400);

        if (!password_verify($old, $user->password))
            return $rs->withJson(["error" => msgLocale($rq, "wrong_password")], 401);

        if (($rs = $this->checkPasswordField($rq, $rs, $new))->getStatusCode() !== 200) return $rs;

        $user->password = password_hash($new, PASSWORD_DEFAULT);
        $user->save();

        return $rs->withJson(["success" => msgLocale($rq, "password_changed")]);
    }

    public function update(Request $rq, Response $rs, array $args): Response {
        $res = User::fromToken($rq, $rs, PARAM_IN_BODY_PUT);
        if ($res["response"]->getStatusCode() !== 200) return $res["response"];

        $user = $res["user"];

        $body = $rq->getParsedBody();

        // vérification des champs
        $firstname = isset($body["firstname"]) && $body["firstname"] !== "" ? htmlspecialchars($body["firstname"]) : null;
        if (($rs = $this->checkFirstnameField($rq, $rs, $firstname))->getStatusCode() !== 200) return $rs;
        if (!is_null($firstname)) $user->firstname = $firstname;

        $lastname = isset($body["lastname"]) && $body["lastname"] !== "" ? htmlspecialchars($body["lastname"]) : null;
        if (($rs = $this->checkLastnameField($rq, $rs, $lastname))->getStatusCode() !== 200) return $rs;
        if (!is_null($lastname)) $user->lastname = $lastname;

        $birthdate = isset($body["birthdate"]) && $body["birthdate"] !== "" ? htmlspecialchars($body["birthdate"]) : null;
        if (($rs = $this->checkBirthdateField($rq, $rs, $birthdate))->getStatusCode() !== 200) return $rs;
        if (!is_null($birthdate)) $user->birthdate = $birthdate;

        $email = isset($body["email"]) && $body["email"] !== "" ? htmlspecialchars($body["email"]) : null;
        if (($rs = $this->checkEmailField($rq, $rs, $email))->getStatusCode() !== 200) return $rs;
        if (!is_null($email)) $user->email = $email;

        $phone = isset($body["phone"]) && $body["phone"] !== "" ? htmlspecialchars($body["phone"]) : null;
        if (($rs = $this->checkPhoneField($rq, $rs, $phone))->getStatusCode() !== 200) return $rs;
        if (!is_null($phone)) $user->phone = $phone;

        $city = isset($body["city"]) && $body["city"] !== "" ? htmlspecialchars($body["city"]) : null;
        if (($rs = $this->checkCityField($rq, $rs, $city))->getStatusCode() !== 200) return $rs;
        if (!is_null($city)) $user->city = $city;

        $zip = isset($body["zip"]) && $body["zip"] !== "" ? htmlspecialchars($body["zip"]) : null;
        if (($rs = $this->checkZipField($rq, $rs, $zip))->getStatusCode() !== 200) return $rs;
        if (!is_null($zip)) $user->zip = $zip;

        $address = isset($body["address"]) && $body["address"] !== "" ? htmlspecialchars($body["address"]) : null;
        if (($rs = $this->checkAddressField($rq, $rs, $address))->getStatusCode() !== 200) return $rs;
        if (!is_null($address)) $user->address = $address;

        $genderId = isset($body["gender"]) && $body["gender"] !== "" && is_numeric($body["gender"]) ? intval($body["gender"]) : null;
        $res = $this->checkGenderField($rq, $rs, $genderId);
        if (($rs = $res['response'])->getStatusCode() !== 200) return $rs;
        if (!is_null($gender = $res['gender'])) $user->gender()->associate($gender);

        $user->save();

        return $rs->withJson(["success" => msgLocale($rq, "user_updated")]);
    }
}