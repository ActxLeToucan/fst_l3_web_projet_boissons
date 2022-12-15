# Routes
## `/cocktails`
### GET `[/]`
Liste des cocktails :
```json
[
  {
    "id": 1,
    "title": "Alerte à Malibu (Boisson de la couleurs des fameux maillots de bains... ou presque)"
  },
  {
    "id": 2,
    "title": "Aperol Spritz : Boisson italien pétillant"
  },
  {
    "id": 3,
    "title": "Aquarium"
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

|    Nom     |     Description      | Exemple |
|:----------:|:--------------------:|:-------:|
|     q      |      Recherche       |  Soda   |
| tags_plus  | Catégories à inclure |  2;6;9  |
| tags_minus | Catégories à exclure |   1;3   |