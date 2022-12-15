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

## `/db`
### GET `/init[/]`
Initialise la base de données. Efface les tables avant.
```json
{
  "success": "Database initialized"
}
```

## GET `/search`
Paramètres :

|    Nom     |        Description         | Exemple |
|:----------:|:--------------------------:|:-------:|
|   query    |         Recherche          | boisson |
| tags_plus  | Ingrédients à inclure (ET) |  2;6;9  |
| tags_minus | Ingrédients à exclure (OU) |   1;3   |

Exemple : On veut les cocktails qui contiennent "boisson" dans leur nom, qui ont les ingrédients 2, 6 et 9, mais pas les ingrédients 1 et 3.
`/search?query=boisson&tags_plus=2;6;9&tags_minus=1;3`

```json
[
  {
    "id": 1,
    "title": "Alerte à Malibu (Boisson de la couleurs des fameux maillots de bains... ou presque)",
    "link": "/api/cocktails/1/"
  },
  {
    "id": 98,
    "title": "Boisson de la mort",
    "link": "/api/cocktails/98/"
  },
  ...
]
```
