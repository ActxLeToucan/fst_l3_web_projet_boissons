import { initHeader } from "./header.js";
import User from "./User.js";
import API from "./API.js";
import { setElementStyle } from "./common.js";

// quand la page est chargée
onload = () => {
    initHeader();

    // si l'utilisateur n'est pas connecté ou n'est pas admin, on reviens a la page d'accueil
    if (!User.isConnected() || User.CurrentUser.level != 1) {
        window.location.href = window.location.origin;
        return;
    }

    // sinon on lance la fonction setup
    setup();
}

/**
 * Mets en place la page web (Evenements, etc...)
 */
function setup() {
    // au click sur le bouton "charger la base de données", on lance la fonction loadBdd
    const load_bdd_btn = document.getElementById("load-bdd-btn");
    load_bdd_btn.addEventListener("click", ev => loadBdd());
}

/**
 * Affiche un message a l'utilisateur
 * @param {String} message message a afficher
 */
function log(message) {
    // on recupere la zone des messages
    const log_zone = document.getElementById("log-zone");

    // on cree une nouvelle popup message
    const p = document.createElement("p");
    setElementStyle(p, "popup-show text-slate-700 bg-pink-100 border-2 border-pink-600 rounded-lg p-2 shadow-lg m-2 w-fit mx-auto");
    p.innerText = message;
    log_zone.appendChild(p);

    // au bout de 5sec on la supprime
    setTimeout(() => {
        p.classList.remove("popup-show");
        p.classList.add("popup-hide");
        setTimeout(() => {
            p.remove();
        }, 400);
    }, 5000);
}

/**
 * Fais une requete au serveur pour charger la base de données
 */
function loadBdd() {
    log("Initialisation de la base de données...");
    // on utilise la classe API pour faire la requete
    API.execute_logged("/db/init", API.METHOD.GET, User.CurrentUser.token).then(res => {
        // si la requete a reussi, on affiche un message de succes
        log("Base de données initialisée !");
    }).catch(err => {
        // si la requete a echoué, on affiche un message d'erreur
        if (typeof(err) == "string") {
            log("Erreur : " + err);
        } else {
            log("Erreur : " + err.status + " " + err.statusText);
        }
    });
}