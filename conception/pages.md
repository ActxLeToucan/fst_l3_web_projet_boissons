# Front pages list

## Index
- Path `/index.html`
- Parameters: `none`
Page d'accueil du site, avec des boutons pour voir les cocktails, se connecter, etc.

## Login
- Path `/login.html`
- Parameters: `none`
Page de connexion a un compte

## Register
- Path `/register.html`
- Parameters: `none`
Page de création de compte

## Profile
- Path `/profile.html`
- Parameters: `id=[user_id]`
Informations sur le profil de l'utilisateur dont l'id est `user_id`

## Favorites
- Path `/favorites.html`
- Parameters: `id=[user_id]`
Liste des recettes favorites d'un utilisateur dont l'id est `user_id`
Si `user_id` n'est pas spécifié, on affiche les recettes favorites sauvegardés dans le local storage

## List
- Path `/list.html`
- Parameters: `none`
Liste des cocktails disponibles avec barre de recherche et filtres (alcool, type, etc.)

## Cocktail
- Path `/cocktail.html`
- Parameters: `id=[cocktail_id]`
Page d'un cocktail dont l'id est `cocktail_id` avec les ingrédients, la recette, etc.