import { fetchCocktail } from "./cocktail.js";
import { initHeader } from "./header.js";
import { createCocktailTile } from "./tiles.js";
import User from "./User.js";

onload = () => {
    initHeader();
    const fav = getFavorites();
    displayCocktails(fav);
};

let container;
function displayCocktails(list) {
    if (!container)
        container = document.getElementById("cocktail-list");

    container.innerHTML = "";
    list.forEach(el => {
        fetchCocktail(el).then(cocktail => {
            const tile = createCocktailTile(cocktail);
            container.appendChild(tile);
        }).catch(err => {
            console.error("Error fetching cocktail "+id);
        })
    });

    const fav = document.getElementById("cocktail-list");
    const msg = document.getElementById("no-fav");
    const hasFav = list.length > 0;
    
    fav.style.display = hasFav? "flex" : "none";
    msg.style.display = hasFav? "none" : "flex";
}

function getFavorites() {
    const fav = [];
    if (User.isConnected()) {
        if (User.CurrentUser.favorites)
            for (const el of User.CurrentUser.favorites) fav.push(el);
    } else {
        const data = localStorage.getItem("favorites");
        if (data != null)
        for (const el of JSON.parse(data)) fav.push(el);
    }
    return fav;
}

function setFavorites(list) {
    if (User.isConnected()) {
        User.CurrentUser.favorites = list;
        User.CurrentUser.save();
    } else {
        localStorage.setItem("favorites", JSON.stringify(list));
    }
}

function addFavorite(id) {
    if (id === undefined || id === null) return;

    const fav = getFavorites();
    if (!fav.includes(id))
        fav.push(id);
    
    setFavorites(fav);
}

function removeFavorite(id) {
    if (id === undefined || id === null) return;

    const fav = getFavorites();
    if (fav.includes(id))
        fav.splice(fav.indexOf(id), 1);
    
    setFavorites(fav);
}

export {
    getFavorites,
    addFavorite,
    removeFavorite
}