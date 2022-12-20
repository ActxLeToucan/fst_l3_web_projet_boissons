# Langues
L'api supporte plusieurs langues pour les réponses. Pour spécifier la langue, ajoutez un header `Accept-Language` avec la langue souhaitée. Par exemple, pour obtenir les réponses en français, ajoutez `Accept-Language: fr` à votre requête.

L'api supporte les langues suivantes :

* `fr` - Français
* `en` - Anglais

# Routes
## `/cocktails`
### GET `[/]`
Liste des cocktails :
```json
[
  {
    "id": 1,
    "title": "Alerte à Malibu (Boisson de la couleurs des fameux maillots de bains... ou presque)",
    "link": "/api/cocktails/1/"
  },
  {
    "id": 2,
    "title": "Aperol Spritz : Boisson italien pétillant",
    "link": "/api/cocktails/2/"
  },
  {
    "id": 3,
    "title": "Aquarium",
    "link": "/api/cocktails/3/"
  },
  ...
]
```

### GET `/search`
Recherche de cocktails par nom et par ingrédients.

Paramètres :

|    Nom     |                       Obligatoire                       |        Description         |     Exemple     |
|:----------:|:-------------------------------------------------------:|:--------------------------:|:---------------:|
|   query    | obligatoire si `tags_plus` et `tags_minus` sont absents |         Recherche          | alcöol de frùît |
| tags_plus  |                           non                           | Ingrédients à inclure (ET) |      2;6;9      |
| tags_minus |                           non                           | Ingrédients à exclure (OU) |       1;3       |

Exemple : On veut les cocktails qui contiennent "alcool" ou "de" ou "fruit" dans leur nom, qui ont les ingrédients 2, 6 et 9, mais pas les ingrédients 1 et 3.

`/search?query=alcöol de frùît&tags_plus=2;6;9&tags_minus=1;3`

```json
[
  {
    "id": 624,
    "title": "Boisson bulles de melon",
    "link": "/api/cocktails/624/"
  },
  {
    "id": 629,
    "title": "Boisson citron-menthe (sans alcool)",
    "link": "/api/cocktails/629/"
  },
  {
    "id": 640,
    "title": "Boisson exotique au fruit de la passion",
    "link": "/api/cocktails/640/"
  },
  {
    "id": 656,
    "title": "Boisson sans alcool Cranberry-orange",
    "link": "/api/cocktails/656/"
  },
  {
    "id": 670,
    "title": "Le baiser de la Schtroumpfette",
    "link": "/api/cocktails/670/"
  },
  {
    "id": 682,
    "title": "Punch-sangria de pastèque",
    "link": "/api/cocktails/682/"
  }
]
```
Les résultats sont triés par pertinence.

### GET `/random[/[{n}[/]]]`
Retourne `n` cocktails aléatoires. Si `n` n'est pas spécifié, retourne un seul cocktail.

Argument :

| Nom | Obligatoire |     Description      | Valeur par défaut |
|:---:|:-----------:|:--------------------:|:-----------------:|
|  n  |     non     | Nombre de cocktails  |         1         |

Retourne pour `n` = 3 :

```json
[
  {
    "id": 42,
    "title": "Boisson coco",
    "link": "/api/cocktails/42/"
  },
  {
    "id": 6,
    "title": "Bora bora",
    "link": "/api/cocktails/6/"
  },
  {
    "id": 55,
    "title": "Boisson la variante (à base de rosé)",
    "link": "/api/cocktails/55/"
  }
]
```

### POST `/favorites[/]`
Ajoute des cocktails aux favoris de l'utilisateur connecté.

Paramètres :

| Nom | Obligatoire |                   Description                    | Exemple |
|:---:|:-----------:|:------------------------------------------------:|:-------:|
| ids |     oui     | Identifiants des cocktails à ajouter aux favoris |  1;2;3  |

Retourne :

```json
{
  "success": "Cocktails added to favorites"
}
```

### DELETE `/favorites[/]`
Supprime des cocktails des favoris de l'utilisateur connecté.

Paramètres :

| Nom | Obligatoire |                    Description                     | Exemple |
|:---:|:-----------:|:--------------------------------------------------:|:-------:|
| ids |     oui     | Identifiants des cocktails à supprimer des favoris |  1;2;3  |

Retourne :

```json
{
  "success": "Cocktails removed from favorites"
}
```

### `/{id}`
#### GET `[/]`
Détails d'un cocktail.

Arguments :

| Nom | Obligatoire |       Description       |
|:---:|:-----------:|:-----------------------:|
| id  |     oui     | Identifiant du cocktail |

`/2` donne :
```json
{
  "id": 2,
  "title": "Aperol Spritz : Boisson italien pétillant",
  "preparation": "Préparer la quantité de Boisson souhaitée en respectant les proportions ! Garnir de glaçons et d'un morceau d'orange (sanguine si possible). Santé !",
  "descrIngredients": [
    "1 verre d'aperol",
    "3 verres de vin blanc pétillant type prosecco",
    "5 glaçons",
    "1 orange sanguine",
    "2 verres d'eau pétillante"
  ],
  "ingredients": {
    "5": "Aperol",
    "6": "Prosecco",
    "7": "Glaçon",
    "8": "Orange sanguine",
    "9": "Eau gazeuse"
  }
}
```

#### POST `/favorite[/]`
Ajoute un cocktail aux favoris de l'utilisateur connecté.

Arguments :

| Nom | Obligatoire |       Description       |
|:---:|:-----------:|:-----------------------:|
| id  |     oui     | Identifiant du cocktail |

Paramètres :

|  Nom  | Obligatoire |           Description           |
|:-----:|:-----------:|:-------------------------------:|
| token |     oui     | Token de l'utilisateur connecté |

Retourne :
```json
{
  "success": "Cocktail added to favorites"
}
```

#### DELETE `/favorite[/]`
Supprime un cocktail des favoris de l'utilisateur connecté.

Arguments :

| Nom | Obligatoire |       Description       |
|:---:|:-----------:|:-----------------------:|
| id  |     oui     | Identifiant du cocktail |

Paramètres :

|  Nom  | Obligatoire |           Description           |
|:-----:|:-----------:|:-------------------------------:|
| token |     oui     | Token de l'utilisateur connecté |

Retourne :
```json
{
  "success": "Cocktail removed from favorites"
}
```

## GET `/ingredients[/]`
Liste des ingrédients :
```json
{
  "1142": {
    "id": 1142,
    "name": "Coriandre",
    "children": [],
    "parents": [
      1310,
      1311
    ]
  },
  "1143": {
    "id": 1143,
    "name": "Vin effervescent",
    "children": [
      1116,
      1139,
      1181
    ],
    "parents": [
      1302,
      1303
    ]
  },
  "1144": {
    "id": 1144,
    "name": "Triple sec",
    "children": [
      1138
    ],
    "parents": [
      1329
    ]
  },
    ...
}
```

## `/users`
### POST `/login`
Obtenir un token d'authentification.

Paramètres :

|   Nom    | Obligatoire |           Description           |   Exemple   |
|:--------:|:-----------:|:-------------------------------:|:-----------:|
|  login   |     oui     | Login ou email de l'utilisateur |    toto     |
| password |     oui     |     Mot de passe de l'user      | Toto_toto54 |

Réponse :
```json
{
    "token": "mon_token_unique"
}
```

### POST `/register`
Inscription d'un nouvel utilisateur et obtention d'un token d'authentification.

Paramètres :

|    Nom    | Obligatoire |        Description         | Vérification                                                                                                                                                                |   Exemple    |
|:---------:|:-----------:|:--------------------------:|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------:|
|   login   |     oui     |   Login de l'utilisateur   | Taille : [4;64]<br/>Ne doit pas déjà exister                                                                                                                                |     toto     |
| password  |     oui     |   Mot de passe de l'user   | Taille : >= 8<br/>Doit contenir :<br/> - au moins une lettre majuscule<br/> - au moins une lettre minuscule<br/> - au moins un chiffre<br/> - au moins un caractère spécial | Toto_toto54  |
| firstname |     non     |  Prénom de l'utilisateur   | Taille : <= 32                                                                                                                                                              |     Toto     |
| lastname  |     non     |    Nom de l'utilisateur    | Taille : <= 32                                                                                                                                                              |     Toto     |
| birthdate |     non     |     Date de naissance      | Format : `YYYY-MM-DD`                                                                                                                                                       |  1990-01-01  |
|   email   |     non     |   Email de l'utilisateur   | Adresse email valide<br/>Taille : <= 64                                                                                                                                     | toto@toto.fr |
|   phone   |     non     | Téléphone de l'utilisateur | Taille : <= 32                                                                                                                                                              | +33612345789 |
|   city    |     non     |   Ville de l'utilisateur   | Taille : <= 32                                                                                                                                                              |    Paris     |
|    zip    |     non     |   Code postal de l'user    | Taille : <= 8                                                                                                                                                               |    75001     |
|  address  |     non     |  Adresse de l'utilisateur  | Taille : <= 64                                                                                                                                                              |  1 rue Toto  |
|  gender   |     non     |   Genre de l'utilisateur   | Doit correspondre à un genre dans la base de données                                                                                                                        |      1       |

Réponse :
```json
{
    "token": "mon_token_unique"
}
```

### `/me`
#### GET `[/]`
Obtenir les informations de l'utilisateur connecté.

Paramètres :

|  Nom   | Obligatoire |       Description       |
|:------:|:-----------:|:-----------------------:|
| token  |     oui     | Token de l'utilisateur  |

Réponse :
```json
{
  "id": 1,
  "login": "toto",
  "firstname": "Toto",
  "lastname": "Toto",
  "birthdate": "1990-01-01",
  "email": "toto@toto.fr",
  "city": "Paris",
  "zip": "75001",
  "address": "1 rue Toto",
  "gender_id": 1,
  "gender": "Homme",
  "level": 1
}
```

#### GET `/favorites`
Obtenir les cocktails favoris de l'utilisateur connecté.

Paramètres :

|  Nom   | Obligatoire |       Description       |
|:------:|:-----------:|:-----------------------:|
| token  |     oui     | Token de l'utilisateur  |

Réponse :
```json
[
    {
        "id": 1,
        "title": "Mojito",
        "link": "/api/cocktails/1/"
    },
    {
        "id": 2,
        "title": "Margarita",
        "link": "/api/cocktails/2/"
    }
]
```

## `/genders`
### GET `[/]`
Liste des genres :
```json
{
  "1": {
    "id": 1,
    "name": "Homme"
  },
  "2": {
    "id": 2,
    "name": "Femme"
  },
  "3": {
    "id": 3,
    "name": "Autre"
  }
}
```

## `/db`
### GET `/init[/]`
Initialise la base de données. Efface les tables avant.

Paramètres :

|  Nom   | Obligatoire |        Description        |
|:------:|:-----------:|:-------------------------:|
| token  |     oui     | Token de l'administrateur |

```json
{
  "success": "Database initialized"
}
```
