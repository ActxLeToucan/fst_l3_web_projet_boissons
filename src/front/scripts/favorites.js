import API from "./API.js";
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
    return new Promise((resolve, reject) => {
        if (User.isConnected()) {
            const added = [];
            const removed = [];
            for (const el of list) {
                if (!User.CurrentUser.favorites.includes(el))
                    added.push(el);
            }
            for (const el of User.CurrentUser.favorites) {
                if (!list.includes(el))
                    removed.push(el);
            }

            let resultCount = ((removed.length != 0)? 1 : 0) + ((added.length != 0)? 1 : 0);
            const checkForResult = () => {
                if (--resultCount > 0) return;
    
                User.CurrentUser.fetchFavorites().then(() => {
                    User.CurrentUser.save();
                    resolve(list);
                }).catch(err => reject(err));
            };
    
            if (added.length !== 0)
                API.execute_logged("/cocktails/favorites", API.METHOD.POST, User.CurrentUser.token, {ids: added.join(";")}).then(res => {
                    checkForResult();
                }).catch(err => reject(err));
    
            if (removed.length !== 0)
                API.execute_logged(API.createParam("/cocktails/favorites", "ids", removed.join(";")), API.METHOD.DELETE, User.CurrentUser.token).then(res => {
                    checkForResult();
                }).catch(err => reject(err));
        } else {
            localStorage.setItem("favorites", JSON.stringify(list));
            resolve(list);
        }
    });
}

function addFavorite(id) {
    return new Promise((resolve, reject) => {
        if (id === undefined || id === null) {
            reject("Invalid id");
            return;
        }

        const fav = getFavorites();
        if (!fav.includes(id))
            fav.push(id);
        
        setFavorites(fav).then(resolve).catch(reject);
    });
}

function removeFavorite(id) {
    return new Promise((resolve, reject) => {
        if (id === undefined || id === null) {
            reject("Invalid id");
            return;
        }

        const fav = getFavorites();
        if (fav.includes(id))
            fav.splice(fav.indexOf(id), 1);
        
        setFavorites(fav).then(resolve).catch(reject);
    });
}

export {
    getFavorites,
    addFavorite,
    removeFavorite
}