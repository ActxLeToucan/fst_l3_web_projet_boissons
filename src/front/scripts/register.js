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
    const genre_input = document.querySelector("select[name='genre']");

    continue_btn.addEventListener("click", register);
    continue_btn.addEventListener("click", login);
    window.addEventListener("keydown", e => {
        if (e.key == "Enter") register();
    });

    API.execute("/genders").then(res => {
        while (genre_input.firstChild) genre_input.firstChild.remove();
        
        {
            const option = document.createElement("option");
            option.value = "-1";
            option.innerText = "Indéfini";
            genre_input.appendChild(option);
        }

        for (const g in res) {
            const option = document.createElement("option");
            option.value = res[g].id;
            option.innerText = res[g].name;
            genre_input.appendChild(option);
        }
    }).catch(err => console.error);
}

function register() {
    const login_input = document.querySelector("input[name='login']");
    const password_input = document.querySelector("input[name='password']");
    const firstname_input = document.querySelector("input[name='firstname']");
    const lastname_input = document.querySelector("input[name='lastname']");
    const email_input = document.querySelector("input[name='email']");
    const confirm_password_input = document.querySelector("input[name='confirm-password']");
    const birthdate_input = document.querySelector("input[name='birthdate']");
    const zipcode_input = document.querySelector("input[name='zipcode']");
    const city_input = document.querySelector("input[name='city']");
    const address_input = document.querySelector("input[name='address']");
    const genre_input = document.querySelector("select[name='genre']");

    const checks = [
        {check: login_input.value.length > 0, message: "Veuillez saisir un nom d'utilisateur", el: login_input},
        // {check: firstname_input.value.length > 0, message: "Veuillez saisir un prénom", el: firstname_input},
        // {check: lastname_input.value.length > 0, message: "Veuillez saisir un nom", el: lastname_input},
        // {check: email_input.value.length == 0, message: "Veuillez saisir une adresse email", el: email_input},
        {check: password_input.value.length > 0, message: "Veuillez saisir un mot de passe", el: password_input},
        {check: confirm_password_input.value.length > 0, message: "Veuillez confirmer votre mot de passe", el: confirm_password_input},
        {check: password_input.value === confirm_password_input.value, message: "Les mots de passe ne correspondent pas", el: confirm_password_input},
        // {check: birthdate_input.value.length > 0, message: "Veuillez saisir une date de naissance", el: birthdate_input},
        // {check: zipcode_input.value.length > 0, message: "Veuillez saisir un code postal", el: zipcode_input},
        // {check: city_input.value.length > 0, message: "Veuillez saisir une ville", el: city_input},
        // {check: address_input.value.length > 0, message: "Veuillez saisir une adresse", el: address_input}
    ];
    
    let isValid = true;
    checks.forEach(check => {
        if (!isValid) return;
        if (!check.check) {
            isValid = false;
            log(check.message);
            check.el.focus();
        }
    });

    if (!isValid) return;

    let data = {};
    data["login"] = login_input.value;
    data["password"] = password_input.value;
    if ( firstname_input.value.length > 0 ) data["firstname"] = firstname_input.value;
    if ( lastname_input.value.length > 0 )  data["lastname"] = lastname_input.value;
    if ( email_input.value.length > 0 )     data["email"] = email_input.value;
    if ( birthdate_input.value.length > 0 ) data["birthdate"] = birthdate_input.value;
    if ( zipcode_input.value.length > 0 )   data["zipcode"] = zipcode_input.value;
    if ( city_input.value.length > 0 )      data["city"] = city_input.value;
    if ( address_input.value.length > 0 )   data["address"] = address_input.value;
    if ( genre_input.value != -1 )          data["genre"] = genre_input.value;

    log("Inscription ...");
    API.execute("/users/register", API.METHOD.POST, data).then(res => {
        if (!res.token) log("Erreur: Aucun jeton utilisateur reçu");

        let u = new User({token: res.token});
        log("Récupération des informations ...");
        u.fetchInformations().then(user => {
            user.save();
            log("Inscrit !");
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