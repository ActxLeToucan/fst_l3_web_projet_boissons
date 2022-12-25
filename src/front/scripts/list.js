import API from "./API.js";
import { autoCompleteHovered, autoCompleteSelect, focusAutocomplete, hideAutocomplete, showAutocomplete } from "./autocomplete.js";
import { initHeader } from "./header.js";
import { fetchIngredients } from "./ingredients.js";
import { createListMenu } from "./menu.js";
import { createAlimentTile, createCocktailTile } from "./tiles.js";

let aliments = null;
let selected_aliments = [];
let search_input;
let cocktails_list = [];

// Chargement de la page
onload = () => {
    // Initialisation du header
    initHeader();
    // Initialisation de la page
    setup();

    // Récupération des aliments
    fetchIngredients().then(root => {
        aliments = root;

        // Recherche des aliments dans l'URL
        const params = new URLSearchParams(window.location.search);
        const aliments_ids = params.get("aliments");

        // Si des aliments sont présents dans l'URL, on les ajoute à la liste des aliments sélectionnés
        if (aliments_ids) {
            const ids = aliments_ids.split(";");
            for (const id of ids) {
                const aliment = aliments.find(id);
                if (aliment) {
                    selected_aliments.push(aliment);
                }
            }
            // Affichage des aliments sélectionnés
            displayAliments(selected_aliments);
            // Recherche des cocktails correspondants
            refreshCocktails();
        }

    }).catch(err => { console.error("cannot get aliments from url"); });

    // A des fins esthétiques, on ajoute un effet de flottaison au bloc de recherche
    // quand on scroll vers le bas (pour qu'il passe au dessus des tuiles de cocktails)
    let searchZone_floating = false;
    const searchZone = document.getElementById("search-zone");
    window.addEventListener("scroll", () => {
        const top = searchZone.getBoundingClientRect().y;
        const shouldFloat = top < 100;
        // si le menu devrait flotter et qu'il ne flotte pas, ou inversement
        if (shouldFloat != searchZone_floating) {
            // on met à jour l'affichage du menu
            searchZone_floating = shouldFloat;
            searchZone.classList[shouldFloat? "remove": "add"]("shadow-none");
            searchZone.classList[shouldFloat? "remove": "add"]("border-slate-50");
            searchZone.classList[shouldFloat? "add": "remove"]("shadow-xl");
            searchZone.classList[shouldFloat? "add": "remove"]("border-slate-300");
        }
    });
}

/**
 * Mise en place des elements de la page
 */
function setup() {
    // Récupération des éléments de la page
    search_input = document.getElementById("search-input");
    const search_btn = document.getElementById("search-btn");
    const add_aliment_btn = document.getElementById("add-aliment");

    // Affichage du menu des aliments au clic sur le bouton d'ajout d'aliment
    add_aliment_btn.addEventListener("click", () => {
        const rect = add_aliment_btn.getBoundingClientRect();
        const coords = {x: rect.x, y: rect.y+rect.height+10};
        createListMenu(coords, aliments.children, selected_aliments, displayAliments);
    });

    // Recherche des cocktails au clic sur le bouton de recherche
    search_btn.addEventListener("click", refreshCocktails);

    let searchTimeout = -1;
    let lastSearch = "";
    search_input.hasFocus = false;
    // Affichage de la barre d'autocompletion au focus de la barre de recherche
    search_input.addEventListener("focus", () => {
        search_input.hasFocus = true;
        showSearchBar();
    });
    // Masquage de la barre d'autocompletion quand la barre de recherche perd le focus
    search_input.addEventListener("blur", () => {
        search_input.hasFocus = false;
        hideAutocomplete();
    });

    // Recherche des cocktails a la fin de la saisie de la recherche
    search_input.addEventListener("keyup", e => {
        if (searchTimeout != -1)
            clearTimeout(searchTimeout);

        // on attend 200ms des fois que l'utilisateur continue de taper
        // si il a fini de taper, on lance la recherche (avec refreshCocktails)
        searchTimeout = setTimeout(() => {
            if (lastSearch == search_input.value) return;
            lastSearch = search_input.value;
            refreshCocktails();
            searchTimeout = -1;
        }, 200);
    });

    // Gestion des evenements de la barre d'auto-completion
    search_input.addEventListener("keydown", e => {
        // si on appuie sur entrée et qu'un element de l'auto-completion est selectionné
        // on lance la selection de cet element
        if (e.key == "Enter") {
            if (autoCompleteHovered()) {
                autoCompleteSelect();
            } else refreshCocktails();
            e.preventDefault();
        }
        // si on appuie sur echap, on masque l'auto-completion
        if (e.key == "Escape") {
            hideAutocomplete();
            e.preventDefault();
        }
        // si on appuie sur fleche du haut ou du bas, on selectionne l'element suivant
        // ou precedent de l'auto-completion
        if (e.key == "ArrowDown" || e.key == "ArrowUp") {
            focusAutocomplete(e.key);
            e.preventDefault();
        }
    });

    // Recherche des cocktails au chargement de la page
    refreshCocktails();
}

/**
 * Rafraichissement de la liste des cocktails
 * En faisant une requete au serveur pour obtenir les cocktails correspondants
 * aux aliments selectionnes et a la recherche
 */
function refreshCocktails() {
    const aliments_plus_ids = selected_aliments.filter(a => a.state).map(a => a.id);
    const aliments_minus_ids = selected_aliments.filter(a => !a.state).map(a => a.id);

    // Appel de fetchCocktails avec les parametres de recherche
    // pour récupérer la liste des cocktails correspondants
    fetchCocktails({
        query: document.getElementById("search-input").value,
        tags_plus: aliments_plus_ids,
        tags_minus: aliments_minus_ids
    }).then(cocktails => {
        // Affichage de la liste des cocktails
        cocktails_list = cocktails;
        displayCocktails(cocktails);
        // Si la barre de recherche a le focus, on affiche l'auto-completion
        if (search_input.hasFocus) showSearchBar();
    }).catch(err => { console.error("Error fetching cocktails: ", err) });
}

/**
 * Affichage de la barre d'auto-completion
 */
function showSearchBar() {
    // on créé la barre d'auto-completion, en précisant la fonction de selection (redirection vers la page du cocktail)
    showAutocomplete(search_input.parentElement.parentElement, cocktails_list, item => {
        window.location.href = API.createParam("/cocktail.html", "id", item.id);
    });
}

let requestParams = {query: "", tags_plus: [], tags_minus: []};
/**
 * Recuperation les cocktails correspondant aux parametres de recherche
 * @param {String} query recherche texte du/des cocktail(s)
 * @param {Array} tags_plus liste des id des aliments a ajouter
 * @param {Array} tags_minus liste des id des aliments a enlever
 * @returns Une promesse contenant la liste des cocktails correspondants
 */
function fetchCocktails({query, tags_plus, tags_minus}) {
    return new Promise((resolve, reject) => {
        // assignation des nouveaux parametres de recherche
        if (query != undefined)      requestParams.query = query;
        if (tags_plus != undefined)  requestParams.tags_plus = tags_plus;
        if (tags_minus != undefined) requestParams.tags_minus = tags_minus;

        // si aucun parametre de recherche n'est defini, on ne fait pas de requete
        if (
            (requestParams.query == undefined      || requestParams.query == ""           ) &&
            (requestParams.tags_plus == undefined  || requestParams.tags_plus.length == 0 ) &&
            (requestParams.tags_minus == undefined || requestParams.tags_minus.length == 0)
        ) {
            resolve([]);
            return;
        }

        // Construction de l'url de la requete
        let link = "/cocktails/search";
        if (requestParams.query !== "")
            link = API.createParam(link, "query", requestParams.query);
        if (requestParams.tags_plus?.length > 0)
            link = API.createParam(link, "tags_plus", requestParams.tags_plus.join(";"));
        if (requestParams.tags_minus?.length > 0)
            link = API.createParam(link, "tags_minus", requestParams.tags_minus.join(";"));

        // Execution de la requete grace a la classe API
        API.execute(link).then(res => {
            // renvoie de la liste des cocktails
            resolve(res);
        }).catch(err => {
            // renvoie de l'erreur
            console.error("err: ", err);
        });
    });
}

let lastState = [];
/**
 * Affichage sur la page les aliments passés en parametre
 * @param {object[]} aliments liste des aliments a afficher
 */
function displayAliments(aliments) {
    // si aucun parametre n'est defini, on affiche les aliments selectionnes
    if (aliments == undefined) aliments = selected_aliments;

    // recuperation de la zone de liste des aliments
    const list = document.getElementById("aliment-list");
    while (list.firstChild) list.firstChild.remove(); // on vide la liste

    // on affiche les nouveaux aliments
    aliments.forEach(aliment => {
        list.appendChild(createAlimentTile(aliment, selected_aliments, lastState, refreshCocktails, displayAliments));
    });
    // on sauvegarde l'etat actuel des aliments pour pouvoir faire les animations pour l'ajout / suppression l'aliments
    lastState = Array.from(aliments);
}

/**
 * Affichage sur la page les cocktails passés en parametre
 * @param {objec[]} cocktails liste des cocktails a afficher
 */
function displayCocktails(cocktails) {
    // recuperation de la zone de liste des cocktails
    const list = document.getElementById("cocktail-list");
    while (list.firstChild) list.firstChild.remove(); // on vide la liste

    // on affiche les nouveaux cocktails
    cocktails.forEach(cocktail => {
        list.appendChild(createCocktailTile(cocktail));
    });
}