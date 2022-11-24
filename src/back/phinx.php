<?php

$dbConfModule = parse_ini_file("src" . DIRECTORY_SEPARATOR . "conf" . DIRECTORY_SEPARATOR . "db.ini");
if ($dbConfModule === false) {
    throw new Exception("Impossible de lire le fichier de configuration de la base de données");
}

return
    [
        'paths' => [
            'migrations' => '%%PHINX_CONFIG_DIR%%/db/migrations',
            'seeds' => '%%PHINX_CONFIG_DIR%%/db/seeds'
        ],
        'environments' => [
            'default_migration_table' => 'phinxlog',
            'default_environment' => 'main',
            'main' => [
                'adapter' => $dbConfModule['driver'],
                'host' => $dbConfModule['host'],
                'name' => $dbConfModule['database'],
                'user' => $dbConfModule['username'],
                'pass' => $dbConfModule['password'],
                'port' => $dbConfModule['port'],
                'charset' => $dbConfModule['charset'],
            ]
        ],
        'version_order' => 'creation'
    ];
