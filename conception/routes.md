# Routes
## `/cocktails`
### GET `[/]`
Liste des cocktails :
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

### GET `/{id}[/]`
Détails d'un cocktail :

`/2` donne : 
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

### GET `/search`
Paramètres :

|    Nom     |                       Obligatoire                       |        Description         |     Exemple     |
|:----------:|:-------------------------------------------------------:|:--------------------------:|:---------------:|
|   query    | obligatoire si `tags_plus` et `tags_minus` sont absents |         Recherche          | alcöol de frùît |
| tags_plus  |                           non                           | Ingrédients à inclure (ET) |      2;6;9      |
| tags_minus |                           non                           | Ingrédients à exclure (OU) |       1;3       |

Exemple : On veut les cocktails qui contiennent "alcool" ou "de" ou "fruit" dans leur nom, qui ont les ingrédients 2, 6 et 9, mais pas les ingrédients 1 et 3.

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

## GET `/ingredients[/]`
Liste des ingrédients :
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

## `/db`
### GET `/init[/]`
Initialise la base de données. Efface les tables avant.
```json
{
  "success": "Database initialized"
}
```
