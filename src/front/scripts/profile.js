import API from "./API.js";
import { log } from "./common.js";
import { checkForMigration } from "./favorites.js";
import { initHeader } from "./header.js";
import User from "./User.js";

onload = () => {
    initHeader();
    checkForMigration();
    if (!User.isConnected()) {
        window.location.href = window.location.origin;
        return;
    }

    setup();
}

function setup() {
    const disconnect_btn = document.getElementById("disconnect-btn");
    const modify_btn = document.getElementById("modify-btn");
    const modify_password_btn = document.getElementById("modify-password-btn");
    
    const user = User.CurrentUser;
    let inputs = {};
    for (const prop of user.props) {
        inputs[prop] = document.querySelector(`input[name='${prop}']`);
        if (inputs[prop]) {
            inputs[prop].value = user[prop] ?? "Indéfini";
        }
    }

    retrieveGenders();

    disconnect_btn.addEventListener("click", () => {
        User.disconnect();
        window.location.href = window.location.origin;
    });
    modify_btn.addEventListener("click", updateInformations);
    modify_password_btn.addEventListener("click", modifyPassword);
}

function retrieveGenders() {
    const genre_input = document.querySelector("select[name='gender']");

    API.execute("/genders").then(res => {
        while (genre_input.firstChild) genre_input.firstChild.remove();

        for (const g in res) {
            const option = document.createElement("option");
            option.value = res[g].id;
            option.innerText = res[g].name;
            genre_input.appendChild(option);
        }

        // select the "Autre" options
        genre_input.value = genre_input.lastElementChild.value;

        if (user.gender) {
            genre_input.value = user.gender;
        }
    }).catch(err => console.error);
}

function updateInformations() {
    const user = User.CurrentUser;
    let inputs = {};
    let data = {};
    for (const prop of user.props) {
        inputs[prop] = document.querySelector(`input[name='${prop}']`);
        if (inputs[prop]) {
            if (inputs[prop].value != user[prop])
                data[prop] = inputs[prop].value;
        }
    }
    
    if (Object.keys(data).length == 0) return;

    const log_zone = document.getElementById("log-zone-profile");
    log("Mise à jour des informations ...", log_zone);
    API.execute_logged("/users/me", API.METHOD.PUT, User.CurrentUser.token, data).then(res => {
        user.fetchInformations().then(user => {
            user.save();
            log("Informations mises à jour !", log_zone);
        }).catch(err => {
            if (typeof(err) == "string")
                log("Erreur : " + err, log_zone);
            else log("Erreur : " + err.status + " " + err.statusText, log_zone);
            console.error(err);
        });
    }).catch(err => {
        if (typeof(err) == "string")
            log("Erreur : " + err, log_zone);
        else log("Erreur : " + err.status + " " + err.statusText, log_zone);
        console.error(err);
    });;
}

function modifyPassword() {
    const old_password = document.querySelector("input[name='old-password']");
    const new_password = document.querySelector("input[name='new-password']");
    const confirm_password = document.querySelector("input[name='confirm-password']");
    const log_zone = document.getElementById("log-zone-password");

    const checks = [
        {check: old_password.value.length > 0, msg: "Veuillez saisir un mot de passe", el: old_password},
        {check: new_password.value.length > 0, msg: "Veuillez saisir un nouveau mot de passe", el: new_password},
        {check: confirm_password.value.length > 0, msg: "Veuillez confirmer le nouveau mot de passe", el: confirm_password},
        {check: new_password.value == confirm_password.value, msg: "Les mots de passe ne correspondent pas", el: confirm_password}
    ];

    for (const check of checks) {
        if (!check.check) {
            log(check.msg, log_zone);
            check.el.focus();
            return;
        }
    }

    const data = {
        old: old_password.value,
        new: new_password.value
    };

    log("Modification ...", log_zone);
    API.execute_logged("/users/me/password", API.METHOD.PATCH, User.CurrentUser.token, data).then(res => {
        log("Mot de passe modifié !", log_zone);
        window.location.href = window.location.href;
    }).catch(err => {
        if (typeof(err) == "string")
            log("Erreur : " + err, log_zone);
        else log("Erreur : " + err.status + " " + err.statusText, log_zone);
        console.error(err);
    });
}