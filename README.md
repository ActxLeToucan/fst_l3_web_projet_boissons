# fst_l3_web_projet_boissons

## Auteurs
- [FurWaz](https://github.com/FurWaz)
- [LeToucan](https://github.com/ActxLeToucan)

## Installation
### API
* Créer une base de données
* Créer le fichier [src/back/src/conf/db.ini](./src/back/src/conf/db.ini) en suivant le modèle ci-dessous
  ```ini
  driver=mysql
  username=my_username
  password=my_password
  host=localhost
  database=my_database
  charset=utf8
  collation=utf8_unicode_ci
  ```
* Exécuter la commande `composer install` dans le dossier [src/back](./src/back)
* Exécuter la commande `./vendor/bin/phinx migrate` dans le dossier [src/back](./src/back) pour créer les tables