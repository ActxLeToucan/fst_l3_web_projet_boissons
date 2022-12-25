import { setElementStyle } from "./common.js";

let autocomplete_container;
let focusIndex;
let data_arr = [];
let onselected_callback;

/**
 * Ajoute une liste d'autocompletion à un élément (input par exemple)
 * @param {HTMLElement} el element ou sera affiché l'autocompletion
 * @param {String[]} data liste des données à afficher
 * @param {Function} onselected fonction à appeler quand un élément est sélectionné
 * @returns L'element HTML de l'autocompletion
 */
function showAutocomplete(el, data, onselected) {
    // initialisation des variables globales
    focusIndex = -1;
    data_arr = data;
    onselected_callback = onselected;

    // si il n'y a pas de données, on cache l'autocompletion
    if (data.length === 0) {
        if (autocomplete_container != null) {
            if (!autocomplete_container.hasMouse) {
                autocomplete_container.remove();
                autocomplete_container = null;
            }
        }
        return;
    }

    // on récupère la position de l'input
    const elBounds = el.getBoundingClientRect();

    // si l'autocompletion n'existe pas, on la crée
    if (!autocomplete_container) {
        // creation de l'element
        const container = document.createElement("div");
        setElementStyle(container, "fixed flex flex-col bg-white border border-pink-600 rounded-lg shadow-lg");
        container.style.top = elBounds.y + elBounds.height + "px";
        container.style.left = elBounds.x + "px";
        container.style.width = elBounds.width + "px";
        container.style.maxHeight = "200px";
        container.style.overflowY = "auto";
        container.style.zIndex = "1000";
        container.style.scrollBehavior = "smooth";
        autocomplete_container = container;

        autocomplete_container.addEventListener("mouseenter", ev => {
            autocomplete_container.hasMouse = true;
        });
        autocomplete_container.addEventListener("mouseleave", ev => {
            autocomplete_container.hasMouse = false;
        });

        // gestion des appuis sur les touches (flèches haut/bas)
        autocomplete_container.focusDown = () => {
            focusIndex++;
            if (focusIndex >= autocomplete_container.children.length)
                focusIndex = 0;

            autocomplete_container.updateSelected();
        };
        autocomplete_container.focusUp = () => {
            focusIndex--;
            if (focusIndex < 0)
                focusIndex = autocomplete_container.children.length - 1;

            autocomplete_container.updateSelected();
        };

        // Affichage de l'élément sélectionné
        autocomplete_container.updateSelected = () => {
            for (let i = 0; i < autocomplete_container.children.length; i++) {
                const el = autocomplete_container.children[i];
                if (i == focusIndex) {
                    el.classList.add("bg-pink-100");
                    autocomplete_container.scrollTo(0, el.offsetTop - 80);
                }
                else el.classList.remove("bg-pink-100");
            }
        };

        // Gestion du scroll de la page (pour remettre l'autocompletion à sa place)
        const resizeBar = () => {
            const elBounds = el.getBoundingClientRect();
            if (autocomplete_container == null) {
                window.removeEventListener("scroll", this);
                return;
            }
            autocomplete_container.style.top = elBounds.y + elBounds.height + "px";
            autocomplete_container.style.left = elBounds.x + "px";
            autocomplete_container.style.width = elBounds.width + "px";
        };
        window.addEventListener("scroll", resizeBar);
        window.addEventListener("resize", resizeBar);
    }
    
    // on vide l'autocompletion
    autocomplete_container.innerHTML = "";
    // on ajoute les données à l'autocompletion
    data.forEach(item => {
        const itemEl = document.createElement("div");
        setElementStyle(itemEl, "flex items-center px-2 py-1 hover:bg-pink-100 text-md font-semibold text-slate-700 py-2");
        itemEl.innerText = item.title;
        itemEl.addEventListener("click", () => {
            onselected(item);
            autocomplete_container.remove();
        });
        autocomplete_container.appendChild(itemEl);
    });    

    // on affiche l'autocompletion
    document.body.appendChild(autocomplete_container);
    return autocomplete_container;
}

/**
 * Cache l'autocompletion
 */
function hideAutocomplete() {
    showAutocomplete(null, [], null);
}

/**
 * Gère l'appuie sur une touche de l'input de l'autocompletion
 * @param {String} key code de la touche appuyee
 */
function focusAutocomplete(key="ArrowDown") {
    if (autocomplete_container == null) return;
    if (key == "ArrowDown") autocomplete_container.focusDown();
    else autocomplete_container.focusUp();
}

/**
 * Retourne si un element de l'autocompletion est selectionne
 */
function autoCompleteHovered() {
    return focusIndex != -1;
}

/**
 * Selectionne l'element de l'autocompletion actuellement mis en evidence
 */
function autoCompleteSelect() {
    if (focusIndex == -1) return null;
    return onselected_callback(data_arr[focusIndex]);
}

export {
    showAutocomplete,
    focusAutocomplete,
    autoCompleteHovered,
    autoCompleteSelect,
    hideAutocomplete
};