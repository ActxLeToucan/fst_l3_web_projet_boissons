import { initHeader } from "./header.js";
import { checkForMigration } from "./favorites.js";
import User from "./User.js";
import API from "./API.js";
import { setElementStyle } from "./common.js";

onload = () => {
    initHeader();
    checkForMigration();

    if (!User.isConnected() || User.CurrentUser.level != 1) {
        window.location.href = window.location.origin;
        return;
    }

    setup();
}

function setup() {
    const load_bdd_btn = document.getElementById("load-bdd-btn");
    load_bdd_btn.addEventListener("click", ev => loadBdd());
}

function log(message) {
    const log_zone = document.getElementById("log-zone");

    const p = document.createElement("p");
    setElementStyle(p, "popup-show text-slate-700 bg-pink-100 border-2 border-pink-600 rounded-lg p-2 shadow-lg m-2 w-fit mx-auto");
    p.innerText = message;
    log_zone.appendChild(p);

    setTimeout(() => {
        p.classList.remove("popup-show");
        p.classList.add("popup-hide");
        setTimeout(() => {
            p.remove();
        }, 400);
    }, 5000);
}

function loadBdd() {
    log("Initialisation de la base de données...");
    API.execute_logged("/db/init", API.METHOD.GET, User.CurrentUser.token).then(res => {
        log("Base de données initialisée !");
    }).catch(err => {
        if (typeof(err) == "string") {
            log("Erreur : " + err);
        } else {
            log("Erreur : " + err.status + " " + err.statusText);
        }
    });
}