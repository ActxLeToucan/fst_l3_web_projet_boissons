# fst_l3_web_projet_boissons

## Auteurs
- [FurWaz](https://github.com/FurWaz)
- [LeToucan](https://github.com/ActxLeToucan)

## Installation
### Apache2
Configurer apache2 pour avoir la base qui pointe vers [src](./src).

Exemple de configuration sur un serveur :
```apache
<VirtualHost *:80>
        ServerName cocktails.projects.antoinectx.fr
        DocumentRoot /var/www/fst_l3_web_projet_boissons/src

        <Directory "/var/www/fst_l3_web_projet_boissons/src">
                AllowOverride All
        </Directory>
        RewriteEngine on
        RewriteCond %{SERVER_NAME} =cocktails.projects.antoinectx.fr
        RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>

<IfModule mod_ssl.c>
<VirtualHost *:443>
        ServerName cocktails.projects.antoinectx.fr
        DocumentRoot /var/www/fst_l3_web_projet_boissons/src

        <Directory "/var/www/fst_l3_web_projet_boissons/src">
                AllowOverride All
        </Directory>

        SSLCertificateFile /etc/letsencrypt/live/projects.antoinectx.fr/fullchain.pem
        SSLCertificateKeyFile /etc/letsencrypt/live/projects.antoinectx.fr/privkey.pem
        Include /etc/letsencrypt/options-ssl-apache.conf
</VirtualHost>
</IfModule>
```

Avec XAMPP, modifier le fichier `httpd.conf` et définir `DocumentRoot` au chemin absolu pointant vers [src](./src).

### API
* Créer une base de données
* Créer le fichier [src/api/src/conf/db.ini](./src/api/src/conf/db.ini) en suivant le modèle ci-dessous
  ```ini
  driver=mysql
  username=my_username
  password=my_password
  host=localhost
  database=my_database
  charset=utf8
  collation=utf8_unicode_ci
  ```
* Exécuter la commande `composer install` dans le dossier [src/api](./src/api)
* Exécuter la commande `./vendor/bin/phinx migrate` dans le dossier [src/api](./src/api) pour créer les tables

### Configuration du site
#### Étape 1
Une fois que vous pouvez accéder au site, connectez-vous avec le compte administrateur par défaut :

* Identifiant : `admin`
* Mot de passe : `admin`

#### Étape 2
Rendez-vous dans le panneau "Administration" (le bouton est situé à côté de "Mon profil").

#### Étape 3
Initialisez la base de données avec les cocktails du fichier [`Donnees.inc.php`](./src/assets/Donnees.inc.php) en cliquant sur le bouton "Charger la base de données".

#### Étape 4
Modifiez le mot de passe du compte administrateur en retournant dans le panneau "Mon profil".
