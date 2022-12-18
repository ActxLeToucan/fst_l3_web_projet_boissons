import { initHeader } from "./header.js";
import { getCocktailImage, setElementStyle } from "./common.js";
import { addFavorite, getFavorites, removeFavorite } from "./favorites.js";
import API from "./API.js";

onload = () => {
    initHeader();
    setupPage();
}

function setupPage() {
    const cocktailID = window.location.search.split("=")[1];
    if (!cocktailID) {
        window.location.href = window.location.origin;
    }
    fetchCocktail(cocktailID).then(cocktail => {
        setCocktailInfos(cocktail);
    });
}

function fetchCocktail(cocktailID) {
    return new Promise((resolve, reject) => {
        API.execute("/cocktails/"+cocktailID).then(cocktail => {
            resolve(cocktail);
        }).catch(err => {
            reject(err);
        });
    });
}

function setCocktailInfos(cocktail) {
    const name = document.getElementById("cocktail-name");
    const preparation = document.getElementById("cocktail-preparation");
    const ingredients = document.getElementById("cocktail-ingredients");
    const aliments = document.getElementById("cocktail-aliments");
    const image = document.getElementById("cocktail-image");

    name.innerText = cocktail.title;
    preparation.innerText = cocktail.preparation;
    image.src = getCocktailImage(cocktail.title);

    ingredients.innerHTML = "";
    for (let ingredient of cocktail.descrIngredients) {
        const p = document.createElement("p");
        p.innerText = ingredient;
        ingredients.appendChild(p);
    }

    aliments.innerHTML = "";
    for (let aliment in cocktail.ingredients) {
        const div = document.createElement("div");
        setElementStyle(div, "border-4 border-pink-600 px-4 py-1 m-2 rounded-lg w-fit h-fit");
        const p = document.createElement("p");
        setElementStyle(div, "text-xl font-semibold text-slate-700 whitespace-nowrap");
        p.innerText = cocktail.ingredients[aliment];
        div.appendChild(p);
        aliments.appendChild(div);
    }

    const fav = getFavorites();
    const isFav = fav.includes(cocktail.id);

    const favIcon = document.getElementById("fav-icon");
    const COLOR_WHITE = "#f8fafc";
    favIcon.style.fill = isFav ? COLOR_WHITE : "none";

    const favBtn = document.getElementById("fav-btn");
    favBtn.addEventListener("click", ev => {
        if (isFav)
            removeFavorite(cocktail.id);
        else addFavorite(cocktail.id);

        // update page to show the new star icon
        setCocktailInfos(cocktail);
    });
}

export {
    fetchCocktail
}