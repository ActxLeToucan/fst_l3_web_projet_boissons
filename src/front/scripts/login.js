import API from "./API.js";
import { log } from "./common.js";
import { initHeader } from "./header.js";
import User from "./User.js";

onload = () => {
    initHeader();
    setup();
}

function setup() {
    const continue_btn = document.getElementById("continue-btn");
    continue_btn.addEventListener("click", login);
    window.addEventListener("keydown", e => {
        if (e.key == "Enter") login();
    });
}

function login() {
    const login_input = document.querySelector("input[name='login']");
    const password_input = document.querySelector("input[name='password']");

    if (!login_input.value) {
        log("Veuillez saisir un nom d'utilisateur");
        login_input.focus();
        return;
    }

    if (!password_input.value) {
        log("Veuillez saisir un mot de passe");
        password_input.focus();
        return;
    }

    log("Connexion ...");
    API.execute("/users/login", API.METHOD.POST, {
        login: login_input.value,
        password: password_input.value
    }).then(res => {
        if (!res.token) log("Erreur: Aucun jeton utilisateur reçu");

        let u = new User({token: res.token});
        log("Récupération des informations ...");
        u.fetchInformations().then(user => {
            user.save();
            log("Connecté !");
            setTimeout(() => {
                window.location.href = window.origin;
            }, 1000);
        }).catch(err => {
            if (typeof(err) == "string")
                log("Erreur : " + err);
            else log("Erreur : " + err.status + " " + err.statusText)
            console.error(err);
        });
    }).catch(err => {
        if (typeof(err) == "string")
            log("Erreur : " + err);
        else log("Erreur : " + err.status + " " + err.statusText);
        console.error(err);
    });
}