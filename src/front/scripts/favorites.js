import API from "./API.js";
import { fetchCocktail } from "./cocktail.js";
import { initHeader } from "./header.js";
import { createCocktailTile } from "./tiles.js";
import User from "./User.js";

const POPUP_CONTENT = `
<div class="flex flex-col w-fit h-fit border-2 border-pink-600 rounded-lg shadow-xl bg-slate-50 mx-auto">
    <div class="flex grow h-fit p-2 bg-pink-600">
        <h1 class="text-xl font-extrabold text-slate-50"> Migration des favoris </h1>
    </div>
    <div class="flex flex-col grow h-fit p-4">
        <p class="text-slate-700"> Vous avez mis des cocktails en favoris sans être connectés. </p>
        <p class="text-slate-700"> Ces favoris ne sont pas encore synchronisés avec votre compte. </p>
        <p class="my-4 mx-8 text-center font-semibold text-slate-700"> Voulez-vous importer vos favoris sur votre compte ? </p>
    </div>
    <span class="flex grow h-[2px] bg-pink-600 rounded mx-4"></span>
    <div class="flex justify-between p-4">
        <a class="rounded px-2 bg-transparent text-slate-700 font-semibold transition-all
            hover:bg-pink-600 hover:text-slate-50 cursor-pointer" id="btn-no"> Non, merci </a>
        <a class="border-2 border-pink-600 rounded px-2 bg-transparent text-slate-700 font-semibold transition-all
            hover:bg-pink-600 hover:text-slate-50 cursor-pointer" id="btn-yes"> Oui, importer </a>
    </div>
</div>
`;

onload = () => {
    initHeader();
    checkForMigration();
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

function checkForMigration() {
    if (localStorage.getItem("hide-migrate-popup") === "true") return;

    if (!User.isConnected()) return;

    const data = localStorage.getItem("favorites");
    if (data != null) {
        let fav = JSON.parse(data);
        User.CurrentUser.favorites.forEach(el => {
            const index = fav.indexOf(el);
            if (index !== -1) fav.splice(index, 1);
        });
        if (fav.length > 0) {
            showFavoriteMigrationPopup();
        }

        localStorage.removeItem("favorites");
    }
}

let popup = null;
function showFavoriteMigrationPopup() {
    if (popup != null) return;

    popup = document.createElement("div");
    popup.classList.add("popup-container");
    popup.classList.add("popup-show");
    popup.innerHTML = POPUP_CONTENT;

    const btnYes = popup.querySelector("#btn-yes");
    const btnNo = popup.querySelector("#btn-no");

    popup.addEventListener("click", ev => {
        let rect = popup.firstElementChild.getBoundingClientRect();
        if (ev.clientX < rect.left || ev.clientX > rect.right || ev.clientY < rect.top || ev.clientY > rect.bottom)
            hideFavoriteMigrationPopup();
    });

    btnYes?.addEventListener("click", migrateFavorites);
    btnNo?.addEventListener("click", () => {
        hideFavoriteMigrationPopup();
        localStorage.setItem("hide-migrate-popup", "true");
    });
    document.body.appendChild(popup);
}

function hideFavoriteMigrationPopup() {
    if (popup == null) return;

    popup.classList.remove("popup-show");
    popup.classList.add("popup-hide");
    setTimeout(() => {
        popup.remove();
        popup = null;
    }, 500);
}

function migrateFavorites() {
    const fav = JSON.parse(localStorage.getItem("favorites"));
    if (fav.length === 0) {
        hideFavoriteMigrationPopup();
        return;
    }

    const btnYes = popup.querySelector("#btn-yes");
    const btnNo = popup.querySelector("#btn-no");
    btnYes.disabled = true;
    btnNo.disabled = true;
    const oldtext = btnYes.innerHTML;
    btnYes.innerHTML = "Importation ...";

    API.execute_logged("/cocktails/favorites", API.METHOD.POST, User.CurrentUser.token, {ids: fav.join(";")}).then(res => {
        localStorage.removeItem("favorites");
        localStorage.removeItem("hide-migrate-popup");
        btnYes.innerHTML = "Mise à jour ...";
        User.CurrentUser.fetchFavorites().then(() => {
            User.CurrentUser.save();
            btnYes.innerHTML = "Fini !";
            setTimeout(hideFavoriteMigrationPopup, 1000);
        });
        btnYes.disabled = false;
        btnNo.disabled = false;
        btnYes.innerHTML = oldtext;
    }).catch(err => {
        btnYes.disabled = false;
        btnNo.disabled = false;
        btnYes.innerHTML = oldtext;
        console.error(err);
    });
}

export {
    getFavorites,
    addFavorite,
    removeFavorite,
    checkForMigration,
    showFavoriteMigrationPopup,
    hideFavoriteMigrationPopup
}