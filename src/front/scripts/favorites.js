import API from "./API.js";
import { fetchCocktail } from "./cocktail.js";
import { initHeader } from "./header.js";
import { showPopup } from "./popup.js";
import { createCocktailTile } from "./tiles.js";
import User from "./User.js";

// Evenement au chargement de la page
onload = () => {
    // Initialisation du header
    initHeader();
    // Verification de la migration des favoris
    checkForMigration();
    // Affichage des favoris
    displayCocktails(getFavorites());
};

let container;
/**
 * Affiche la liste des cocktails passée en paramètre dans la page
 * @param {object[]} list liste des cocktails à afficher
 */
function displayCocktails(list) {
    // si le container n'est pas défini, on le récupère
    if (!container)
        container = document.getElementById("cocktail-list");

    // on vide le container
    container.innerHTML = "";
    // on affiche les cocktails
    list.forEach(el => {
        fetchCocktail(el).then(cocktail => {
            const tile = createCocktailTile(cocktail);
            container.appendChild(tile);
        }).catch(err => {
            console.error("Error fetching cocktail "+id);
        })
    });

    // on affiche le message "aucun favori" si la liste est vide, sinon on affiche le container
    const msg = document.getElementById("no-fav");
    const hasFav = list.length > 0;
    
    container.style.display = hasFav? "flex" : "none";
    msg.style.display = hasFav? "none" : "flex";
}

/**
 * Recupere la liste des favoris de l'utilisateur (locale ou distante)
 * @returns La liste des favoris de l'utilisateur
 */
function getFavorites() {
    const fav = [];

    if (User.isConnected()) {
        // si l'utilisateur est connecte, on recupere les favoris distants
        if (User.CurrentUser.favorites)
            for (const el of User.CurrentUser.favorites) fav.push(el);

    } else {
        // sinon on recupere les favoris locaux
        const data = localStorage.getItem("favorites");
        if (data != null)
        for (const el of JSON.parse(data)) fav.push(el);
    }
    
    return fav;
}

// Mets a jour la liste des favoris de l'utilisateur
function setFavorites(list) {
    return new Promise((resolve, reject) => {
        
        if (User.isConnected()) {
            // si l'utilisateur est connecte, on met a jour les favoris distants
            const added = [];
            const removed = [];
            // on recupere les cocktails ajoutes
            for (const el of list) {
                if (!User.CurrentUser.favorites.includes(el))
                    added.push(el);
            }
            // on recupere les cocktails supprimes
            for (const el of User.CurrentUser.favorites) {
                if (!list.includes(el))
                    removed.push(el);
            }

            // on stock le nombre de requetes a faire
            let resultCount = ((removed.length != 0)? 1 : 0) + ((added.length != 0)? 1 : 0);

            // Fonction appelee quand une requete est terminee, pour declencher la fin de la fonction
            const checkForResult = () => {
                if (--resultCount > 0) return;
    
                // si toutes les requetes sont terminees, on recupere les nouveaux favoris et on sauvegarde en local
                User.CurrentUser.fetchFavorites().then(() => {
                    User.CurrentUser.save();
                    resolve(list);
                }).catch(err => reject(err));
            };
    
            // si il a des cocktails a ajouter, on les ajoute
            if (added.length !== 0)
                API.execute_logged("/cocktails/favorites", API.METHOD.POST, User.CurrentUser.token, {ids: added.join(";")}).then(res => {
                    checkForResult();
                }).catch(err => reject(err));
    
            // si il a des cocktails a supprimer, on les supprime
            if (removed.length !== 0)
                API.execute_logged(API.createParam("/cocktails/favorites", "ids", removed.join(";")), API.METHOD.DELETE, User.CurrentUser.token).then(res => {
                    checkForResult();
                }).catch(err => reject(err));
        } else {
            // sinon on met a jour les favoris locaux (c'est plus simple quand on est pas connecte ...)
            localStorage.setItem("favorites", JSON.stringify(list));
            resolve(list);
        }
    });
}

/**
 * Ajoute un cocktail aux favoris (locaux ou distants)
 * @param {number} id id du cocktail a ajouter aux favoris
 * @returns une promesse resolue quand le cocktail sera ajoute aux favoris
 */
function addFavorite(id) {
    return new Promise((resolve, reject) => {
        if (id === undefined || id === null) {
            reject("Invalid id");
            return;
        }

        // recuperation de l'ancienne liste des favoris et ajout du nouveau favori
        const fav = getFavorites();
        if (!fav.includes(id))
            fav.push(id);
        
        // sauvegarde de la nouvelle liste des favoris
        setFavorites(fav).then(resolve).catch(reject);
    });
}

/**
 * Supprime un cocktail des favoris (locaux ou distants)
 * @param {number} id id du cocktail a supprimer des favoris
 * @returns une promesse resolue quand le cocktail sera supprime des favoris
 */
function removeFavorite(id) {
    return new Promise((resolve, reject) => {
        if (id === undefined || id === null) {
            reject("Invalid id");
            return;
        }

        // recuperation de l'ancienne liste des favoris et suppression du favori
        const fav = getFavorites();
        if (fav.includes(id))
            fav.splice(fav.indexOf(id), 1);
        
        // sauvegarde de la nouvelle liste des favoris
        setFavorites(fav).then(resolve).catch(reject);
    });
}

/**
 * Verifie si une migration des favoris de local vers distants est necessaire
 * (si l'utilisateur est connecte et qu'il a des favoris locaux)
 */
function checkForMigration() {
    // si l'utilisateur a deja cache la popup, on ne fait rien (pour eviter de spammer de popup)
    if (localStorage.getItem("hide-migrate-popup") === "true") return;

    // si l'utilisateur n'est pas connecte, on ne fait rien
    if (!User.isConnected()) return;

    // on recupere les favoris locaux
    const data = localStorage.getItem("favorites");
    if (data != null) {
        // si il y a des favoris locaux, on verifie qu'ils ne sont pas deja dans les favoris distants
        let fav = JSON.parse(data);
        User.CurrentUser.favorites.forEach(el => {
            const index = fav.indexOf(el);
            if (index !== -1) fav.splice(index, 1);
        });

        // si il y a des favoris locaux qui ne sont pas dans les favoris distants, on affiche la popup
        if (fav.length > 0) {
            showFavoriteMigrationPopup();
        } else {
            // sinon on supprime les favoris locaux
            localStorage.removeItem("favorites");
        }
    }
}

/**
 * Affiche la popup de migration des favoris
 */
function showFavoriteMigrationPopup() {
    // Utilisation de la fonction showPopup de popup.js
    showPopup(
        "Migration des favoris",
        "Vous avez mis des cocktails en favoris sans être connectés.<br>Ces favoris ne sont pas encore synchronisés avec votre compte.",
        "Voulez-vous importer vos favoris sur votre compte ?",
        "Non, merci",
        "Oui, importer",
        () => { localStorage.setItem("hide-migrate-popup", "true"); },
        migrateFavorites
    );
}

/**
 * Procede a la migration des favoris locaux vers distants
 * @param {object} popup objet popup
 * @returns une promise resolue quand la migration sera terminee
 */
function migrateFavorites(popup) {
    return new Promise((resolve, reject) => {
        // on recupere les favoris locaux
        const fav = JSON.parse(localStorage.getItem("favorites"));
        if (fav.length === 0) { // si il n'y a pas de favoris locaux, on ne fait rien
            reject();
            return;
        }
        
        popup.log("Importation des favoris...");
        // on importe les favoris locaux vers distants
        API.execute_logged("/cocktails/favorites", API.METHOD.POST, User.CurrentUser.token, {ids: fav.join(";")}).then(res => {
            popup.log("Synchronisation des favoris...");

            // suppression des favoris locaux et suppression du masque de la popup (pour pouvoir la revoir si besoin)
            localStorage.removeItem("favorites");
            localStorage.removeItem("hide-migrate-popup");

            // on recupere les favoris distants
            User.CurrentUser.fetchFavorites().then(() => {
                popup.log("Favoris importés !");

                // on sauvegarde les favoris distants et on affiche un message de succes
                User.CurrentUser.save();
                popup.validate_btn.innerHTML = "Fini !";
                setTimeout(resolve, 1000);
            });
        }).catch(err => {
            // si une erreur survient, on affiche un message d'erreur
            console.error(err);
            reject(err);
        });
    });
}

export {
    getFavorites,
    addFavorite,
    removeFavorite,
    checkForMigration
}