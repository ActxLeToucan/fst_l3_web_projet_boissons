import { initHeader } from "./header.js";
import { getCocktailImage, setElementStyle } from "./common.js";
import { addFavorite, checkForMigration, getFavorites, removeFavorite } from "./favorites.js";
import API from "./API.js";

// Evenement au chargement de la page
onload = () => {
    // Initialisation du header
    initHeader();
    // Vérification de la migration des favoris
    checkForMigration();
    // Initialisation de la page
    setupPage();
}

/**
 * Initialisation de la page
 */
function setupPage() {
    // Récupération de l'id du cocktail dans l'url
    const cocktailID = parseInt(window.location.search.split("=")[1]);
    if (isNaN(cocktailID)) {
        window.location.href = window.location.origin;
    }
    // Récupération des informations du cocktail
    fetchCocktail(cocktailID).then(cocktail => {
        setCocktailInfos(cocktail);
    });

    // Gestion du bouton de favoris
    const favBtn = document.getElementById("fav-btn");
    favBtn.addEventListener("click", ev => {
        // si le cocktail est déjà favoris, on le retire, sinon on l'ajoute
        let promise = null;
        if (getFavorites().includes(cocktailID)) promise = removeFavorite(cocktailID);
        else promise = addFavorite(cocktailID);

        // Mise à jour de l'icône de favoris apres l'ajout/suppression
        if (promise != null)
        promise.then(res => {
            udpateFavStatus(cocktailID);
        }).catch(err => console.error(err));
    });
}

/**
 * Recupère les informations d'un cocktail avec son ID depuis l'API
 * @param {number} cocktailID id du cocktail à récupérer
 * @returns un object contenant les informations du cocktail
 */
function fetchCocktail(cocktailID) {
    return new Promise((resolve, reject) => {
        // Utilisation de l'API pour récupérer les informations du cocktail
        API.execute("/cocktails/"+cocktailID).then(cocktail => {
            resolve(cocktail);
        }).catch(err => {
            reject(err);
        });
    });
}

/**
 * Mets les informations du cocktail dans la page
 * @param {object} cocktail cocktail à afficher
 */
function setCocktailInfos(cocktail) {
    // Récupération des éléments de la page
    const name = document.getElementById("cocktail-name");
    const preparation = document.getElementById("cocktail-preparation");
    const ingredients = document.getElementById("cocktail-ingredients");
    const aliments = document.getElementById("cocktail-aliments");
    const image = document.getElementById("cocktail-image");

    // Ajout des informations du cocktail
    name.innerText = cocktail.title;
    preparation.innerText = cocktail.preparation;
    image.src = getCocktailImage(cocktail.title);

    // Ajout des ingrédients du cocktail
    ingredients.innerHTML = "";
    for (let ingredient of cocktail.descrIngredients) {
        const p = document.createElement("p");
        p.innerText = ingredient;
        ingredients.appendChild(p);
    }

    // Ajout des aliments du cocktail
    aliments.innerHTML = "";
    for (let aliment in cocktail.ingredients) {
        const div = document.createElement("div");
        setElementStyle(div, "border-4 border-pink-600 px-4 py-1 m-2 rounded-lg w-fit h-fit hover:bg-pink-100 hover:shadow-md hover:-translate-y-[2px] transition-all");
        const a = document.createElement("a");
        setElementStyle(div, "text-xl font-semibold text-slate-700 whitespace-nowrap");
        a.innerText = cocktail.ingredients[aliment];
        a.href = window.location.origin + "/list.html?aliments=" + aliment;
        div.appendChild(a);
        aliments.appendChild(div);
    }

    // Mise à jour de l'icône de favoris
    udpateFavStatus(cocktail.id);
}

/**
 * Mets à jour l'icône de favoris en fonction de si le cocktail est favoris ou non
 * @param {number} cocktailID id du cocktail
 */
function udpateFavStatus(cocktailID) {
    const fav = getFavorites();
    const isFav = fav.includes(cocktailID);

    const favIcon = document.getElementById("fav-icon");
    const COLOR_WHITE = "#f8fafc";
    favIcon.style.fill = isFav ? COLOR_WHITE : "none";
}

export {
    fetchCocktail
}