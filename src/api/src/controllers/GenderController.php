<?php

namespace boissons\controllers;

use boissons\models\Gender;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Container;

class GenderController {
    public function __construct(private readonly Container $c) {
    }

    public function all(Request $rq, Response $rs, array $args): Response {
        $genders = Gender::all();
        return $rs->withJson($genders);
    }
}