<?php

namespace boissons;

use Illuminate\Database\Capsule\Manager as DB;
use Slim\Container;

class dbInit {
    /**
     * Initialisation de la base de données
     * @return Container
     */
    public static function init(): Container {
        $tabFile = parse_ini_file("src".DIRECTORY_SEPARATOR."conf".DIRECTORY_SEPARATOR."db.ini");

        $db = new DB();

        $db->addConnection([
            'driver' => $tabFile['driver'],
            'host' => $tabFile['host'],
            'database' => $tabFile['database'],
            'username' => $tabFile['username'],
            'password' => $tabFile['password'],
            'charset' => $tabFile['charset'],
            'collation' => $tabFile['collation'],
            'prefix' => ''
        ]);

        $db->setAsGlobal();
        $db->bootEloquent();

        $configuration = [
            'settings' => [
                'displayErrorDetails' => true,
                'dbconf' => '/conf/db.ini'
            ]
        ];
        return new Container($configuration);
    }
}
