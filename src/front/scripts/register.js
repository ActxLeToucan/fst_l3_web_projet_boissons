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
    // recuperation des inputs a configurer dans la page
    const continue_btn = document.getElementById("continue-btn");
    const genre_input = document.querySelector("select[name='genre']");
    const optionnal_banner = document.getElementById("optionnal-banner");

    // ajout d'un event listener pour l'affichage des champs optionnels
    optionnal_banner.addEventListener("click", ToogleOptionnal);

    // ajout d'un event listener pour lancer la creation du compte
    // quand l'utilisateur clique sur le bouton "Continuer"
    continue_btn.addEventListener("click", register);

    // ajout d'un event listener pour lancer la creation du compte
    // quand l'utilisateur appuie sur la touche "Entrée"
    window.addEventListener("keydown", e => {
        if (e.key == "Enter") register();
    });

    // recuperation des genres depuis l'API
    API.execute("/genders").then(res => {
        while (genre_input.firstChild) genre_input.firstChild.remove(); // on vide le select
        // on ajoute les options
        for (const g in res) {
            const option = document.createElement("option");
            option.value = res[g].id;
            option.innerText = res[g].name;
            genre_input.appendChild(option);
        }
        // On selectionne la derniere option (genre "Autre")
        genre_input.value = genre_input.lastElementChild.value;
    }).catch(err => console.error);
}

/**
 * Creee le compte de l'utilisateur a partir des informations
 * saisies dans le formulaire, si elles sont valides
 */
function register() {
    // recuperation des inputs
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

    // verification des champs (certaines conditions sont commentees car elles ne sont pour les champs optionnels)
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
    
    // verification des champs
    let isValid = true;
    checks.forEach(check => {
        if (!isValid) return;
        if (!check.check) {
            isValid = false;
            log(check.message);
            check.el.focus();
        }
    });

    // si les champs ne sont pas valides, on arrete la fonction
    if (!isValid) return;

    // creation de l'objet data a envoyer a l'API
    let data = {};
    data["login"] = login_input.value;
    data["password"] = password_input.value;
    // ajout des champs optionnels si ils sont remplis
    if ( firstname_input.value.length > 0 ) data["firstname"] = firstname_input.value;
    if ( lastname_input.value.length > 0 )  data["lastname"] = lastname_input.value;
    if ( email_input.value.length > 0 )     data["email"] = email_input.value;
    if ( birthdate_input.value.length > 0 ) data["birthdate"] = birthdate_input.value;
    if ( zipcode_input.value.length > 0 )   data["zip"] = zipcode_input.value;
    if ( city_input.value.length > 0 )      data["city"] = city_input.value;
    if ( address_input.value.length > 0 )   data["address"] = address_input.value;
    if ( genre_input.value != -1 )          data["gender"] = genre_input.value;

    // envoi de la requete de creation de compte a l'API
    log("Inscription ...");
    API.execute("/users/register", API.METHOD.POST, data).then(res => {
        // si l'API ne renvoie pas de jeton utilisateur, on affiche une erreur
        if (!res.token) log("Erreur: Aucun jeton utilisateur reçu");

        // creation de l'utilisateur depuis le token
        let u = new User({token: res.token});
        log("Récupération des informations ...");
        // recuperation des informations de l'utilisateur
        u.fetchInformations().then(user => {

            user.save(); // sauvegarde de l'utilisateur
            log("Inscrit !");
            // redirection vers la page d'accueil
            setTimeout(() => {
                window.location.href = window.origin;
            }, 1000);

        }).catch(err => {
            // si une erreur survient, on l'affiche
            if (typeof(err) == "string")
                log("Erreur : " + err);
            else log("Erreur : " + err.status + " " + err.statusText)
            console.error(err);
        });

    }).catch(err => {
        // si une erreur survient, on l'affiche
        if (typeof(err) == "string")
            log("Erreur : " + err);
        else log("Erreur : " + err.status + " " + err.statusText);
        console.error(err);
    });
}

let optionnal = false;
/**
 * Affiche ou cache le contenu optionnel
 */
function ToogleOptionnal() {
    // recuperation des elements
    const content = document.getElementById("optionnal-content");
    const banner = document.getElementById("optionnal-banner");

    if (optionnal) {
        // on cache le contenu optionnel
        content.style.maxHeight = "0px";
        banner.firstElementChild.style.transform = "rotate(-90deg)";
    } else {
        // on affiche le contenu optionnel
        content.style.maxHeight = content.firstElementChild.getBoundingClientRect().height + "px";
        banner.firstElementChild.style.transform = "rotate(0deg)";
    }
    optionnal = !optionnal;
}