import { initHeader } from "./header.js";
import { getCocktailImage, setElementStyle } from "./common.js";
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
    console.log("cocktailID", cocktailID);
    fetchCocktail(cocktailID).then(cocktail => {
        console.log("cocktail", cocktail)
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

    for (let ingredient of cocktail.descrIngredients) {
        const p = document.createElement("p");
        p.innerText = ingredient;
        ingredients.appendChild(p);
    }

    for (let aliment in cocktail.ingredients) {
        const div = document.createElement("div");
        setElementStyle(div, "border-4 border-pink-600 px-4 py-1 rounded-lg w-fit h-fit");
        const p = document.createElement("p");
        setElementStyle(div, "text-xl font-semibold text-slate-700");
        p.innerText = cocktail.ingredients[aliment];
        div.appendChild(p);
        aliments.appendChild(div);
    }
}