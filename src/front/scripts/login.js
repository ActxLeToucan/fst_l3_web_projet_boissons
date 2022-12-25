import API from "./API.js";
import { log } from "./common.js";
import { initHeader } from "./header.js";
import User from "./User.js";

// Chargement de la page
onload = () => {
    // Initialisation du header
    initHeader();

    // Mise en place de la page
    setup();
}

/**
 * Mise en place de la page
 */
function setup() {
    // recuperation du bouton "se connecter" et ajout d'un event listener
    // pour lancer la connexion
    const continue_btn = document.getElementById("continue-btn");
    continue_btn.addEventListener("click", login);

    // ajout d'un event listener pour lancer la connexion
    // quand l'utilisateur appuie sur la touche "Entrée"
    window.addEventListener("keydown", e => {
        if (e.key == "Enter") login();
    });
}

/**
 * Lance la connexion de l'utilisateur a partir des informations
 * saisies dans le formulaire
 */
function login() {
    // recuperation des inputs
    const login_input = document.querySelector("input[name='login']");
    const password_input = document.querySelector("input[name='password']");

    // verification du login
    if (!login_input.value) {
        log("Veuillez saisir un nom d'utilisateur");
        login_input.focus();
        return;
    }

    // verification du mdp
    if (!password_input.value) {
        log("Veuillez saisir un mot de passe");
        password_input.focus();
        return;
    }

    // connexion
    log("Connexion ...");

    // appel de l'API pour se connecter avec les informations saisies
    API.execute("/users/login", API.METHOD.POST, {
        login: login_input.value,
        password: password_input.value
    }).then(res => {
        // verification du jeton utilisateur
        if (!res.token) {
            log("Erreur: Aucun jeton utilisateur reçu");
            return;
        }

        // creation de l'utilisateur a partir du jeton
        let u = new User({token: res.token});
        log("Récupération des informations ...");
        // recuperation des informations de l'utilisateur
        u.fetchInformations().then(user => {
            // sauvegarde de l'utilisateur et redirection vers la page d'accueil
            user.save();
            log("Connecté !");
            setTimeout(() => {
                window.location.href = window.origin;
            }, 1000);
        }).catch(err => {
            // affichage de l'erreur
            if (typeof(err) == "string")
                log("Erreur : " + err);
            else log("Erreur : " + err.status + " " + err.statusText)
            console.error(err);
        });
    }).catch(err => {
        // affichage de l'erreur
        if (typeof(err) == "string")
            log("Erreur : " + err);
        else log("Erreur : " + err.status + " " + err.statusText);
        console.error(err);
    });
}