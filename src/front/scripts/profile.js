import API from "./API.js";
import { log, setElementStyle } from "./common.js";
import { checkForMigration } from "./favorites.js";
import { initHeader } from "./header.js";
import { showPopup } from "./popup.js";
import User from "./User.js";

// Chargement de la page
onload = () => {
    // Initialisation du header
    initHeader();
    // Verification de la migration des favoris
    checkForMigration();

    // Si l'utilisateur n'est pas connecte, on le redirige vers l'index
    if (!User.isConnected()) {
        window.location.href = window.location.origin;
        return;
    }

    // Mise en place de la page
    setup();
}

/**
 * Mise en place de la page
 */
function setup() {
    // recuperation des boutons
    const disconnect_btn = document.getElementById("disconnect-btn");
    const modify_btn = document.getElementById("modify-btn");
    const modify_password_btn = document.getElementById("modify-password-btn");
    const delete_btn = document.getElementById("delete-btn");

    // recuperation des informations utilisateurs (pour etre sur d'etre a jour)
    User.CurrentUser.fetchInformations().then(user => {

        // Affichage des informations de l'utilisateur dans les inputs
        let inputs = {};
        for (const prop of user.props) {
            inputs[prop] = document.querySelector(`input[name='${prop}']`);
            if (inputs[prop]) {
                inputs[prop].value = user[prop] ?? "";
            }
        }

        // recuperation des genres possibles
        retrieveGenders();
    }).catch(err => console.error);

    // ajout des event listeners sur les boutons
    disconnect_btn.addEventListener("click", () => {
        User.disconnect();
        window.location.href = window.location.origin;
    });
    modify_btn.addEventListener("click", updateInformations);
    modify_password_btn.addEventListener("click", modifyPassword);
    delete_btn.addEventListener("click", deleteAccount);
}

/**
 * Recuperation des genres possibles
 */
function retrieveGenders() {
    // recuperation de l'input des genres
    const genre_input = document.querySelector("select[name='gender']");

    // recuperation des genres depuis l'API
    API.execute("/genders").then(res => {
        while (genre_input.firstChild) genre_input.firstChild.remove(); // on vide les options de l'input

        // ajout des options dans l'input
        for (const g in res) {
            const option = document.createElement("option");
            option.value = res[g].id;
            option.innerText = res[g].name;
            genre_input.appendChild(option);
        }

        // On selectionne le genre "Autre" par defaut
        genre_input.value = genre_input.lastElementChild.value;

        // Si l'utilisateur a deja un genre, on le selectionne
        if (User.CurrentUser.gender != undefined) {
            genre_input.value = User.CurrentUser.gender;
        }
    }).catch(err => console.error);
}

/**
 * Mise a jour des informations de l'utilisateur
 */
function updateInformations() {
    // on recupere les nouvelles informations de l'utilisateur
    // et on stocke les changements dans l'objet data
    const user = User.CurrentUser;
    let inputs = {};
    let data = {};
    for (const prop of user.props) {
        inputs[prop] = document.querySelector(`input[name='${prop}']`);
        if (!inputs[prop]) inputs[prop] = document.querySelector(`select[name='${prop}']`);

        if (inputs[prop] != undefined || inputs[prop] != null) {
            if (inputs[prop].value != user[prop] && inputs[prop].value != "")
                data[prop] = inputs[prop].value;
        }
    }
    
    // Si il n'y a pas de changement, on arrete la fonction
    if (Object.keys(data).length == 0) return;

    // On met a jour les informations de l'utilisateur
    const log_zone = document.getElementById("log-zone-profile");
    log("Mise à jour des informations ...", log_zone);

    // On envoie les nouvelles informations a l'API
    API.execute_logged("/users/me", API.METHOD.PUT, User.CurrentUser.token, data).then(res => {
        
        // On met a jour les informations de l'utilisateur
        user.fetchInformations().then(user => {
            user.save(); // on sauvegarde les informations de l'utilisateur
            log("Informations mises à jour !", log_zone);

        }).catch(err => {
            // Si il a une erreur, on l'affiche
            if (typeof(err) == "string")
                log("Erreur : " + err, log_zone);
            else log("Erreur : " + err.status + " " + err.statusText, log_zone);
            console.error(err);
        });

    }).catch(err => {
        // Si il a une erreur, on l'affiche
        if (typeof(err) == "string")
            log("Erreur : " + err, log_zone);
        else log("Erreur : " + err.status + " " + err.statusText, log_zone);
        console.error(err);
    });;
}

/**
 * Modifie le mot de passe de l'utilisateur
 * en le remplaçant par le nouveau mot de passe
 */
function modifyPassword() {
    // recuperation des inputs
    const old_password = document.querySelector("input[name='old-password']");
    const new_password = document.querySelector("input[name='new-password']");
    const confirm_password = document.querySelector("input[name='confirm-password']");
    const log_zone = document.getElementById("log-zone-password");

    // liste des verifications a effectuer
    const checks = [
        {check: old_password.value.length > 0, msg: "Veuillez saisir un mot de passe", el: old_password},
        {check: new_password.value.length > 0, msg: "Veuillez saisir un nouveau mot de passe", el: new_password},
        {check: confirm_password.value.length > 0, msg: "Veuillez confirmer le nouveau mot de passe", el: confirm_password},
        {check: new_password.value == confirm_password.value, msg: "Les mots de passe ne correspondent pas", el: confirm_password}
    ];

    // on verifie que toutes les conditions sont respectees
    for (const check of checks) {
        if (!check.check) {
            log(check.msg, log_zone);
            check.el.focus();
            return;
        }
    }

    // on prepare les donnees a envoyer a l'API
    const data = {
        old: old_password.value,
        new: new_password.value
    };

    // On envoie la requete a l'API pour modifier le mot de passe
    log("Modification ...", log_zone);
    API.execute_logged("/users/me/password", API.METHOD.PATCH, User.CurrentUser.token, data).then(res => {
        // mot de passe modifie, on recharge la page
        log("Mot de passe modifié !", log_zone);
        setTimeout(() => { window.location.href = window.location.href; }, 1000);
    }).catch(err => {
        // Si il a une erreur, on l'affiche
        if (typeof(err) == "string")
            log("Erreur : " + err, log_zone);
        else log("Erreur : " + err.status + " " + err.statusText, log_zone);
        console.error(err);
    });
}

/**
 * Supprime le compte de l'utilisateur
 */
function deleteAccount() {
    // on affiche une popup pour demander la confirmation de la suppression
    showPopup(
        "Suppression de compte",
        "Vous êtes sur le point de supprimer votre compte.<br>Cette action est irréversible.",
        "Êtes-vous sûr de vouloir continuer ?",
        "Non, annuler",
        "Oui, supprimer",
        () => {},
        removeAccount,
        (popup) => { // callback pour la création de la popup

            // on ajoute un input pour le mot de passe dans la popup
            const password_input = document.createElement("input");
            password_input.type = "password";
            password_input.placeholder = "Mot de passe";
            setElementStyle(password_input, "border-2 border-slate-300 bg-slate-50 rounded outline-none focus:border-slate-600 text-md text-slate-700 px-1 bg-slate-100 text-center transition-all");
            popup.body.appendChild(password_input);
        }
    );
}

/**
 * Supprime le compte de l'utilisateur avec une requete a l'API
 * @param {object} popup objet popup
 * @returns une promise resolue si la suppression a reussi
 */
function removeAccount(popup) {
    return new Promise((resolve, reject) => {
        // Envoie de la requete a l'API pour supprimer le compte
        popup.log("Suppression du compte ...");
        API.execute_logged("/users/me", API.METHOD.DELETE, User.CurrentUser.token, {password: popup.body.querySelector("input").value}).then(res => {

            // compte supprime, on deconnecte l'utilisateur et on recharge la page
            popup.log("Compte supprimé !");
            setTimeout(() => {
                User.disconnect();
                window.location.href = window.location.origin;
                resolve();
            }, 1000);
        }).catch(err => {
            // Si il a une erreur, on l'affiche
            if (typeof(err) == "string")
                popup.log("Erreur : " + err);
            else popup.log("Erreur : " + err.status + " " + err.statusText);
            console.error(err);
            reject(err);
        });
    });
}