import API from "./API.js";
import { log } from "./common.js";
import { initHeader } from "./header.js";
import User from "./User.js";

onload = () => {
    initHeader();
    if (!User.isConnected()) {
        window.location.href = window.location.origin;
        return;
    }

    setup();
}

function setup() {
    const disconnect_btn = document.getElementById("disconnect-btn");
    const modify_btn = document.getElementById("modify-btn");
    
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