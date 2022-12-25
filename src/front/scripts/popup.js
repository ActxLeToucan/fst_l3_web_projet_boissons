import { log } from "./common.js";

let popup = null;

// Corps d'une popup générique, avec des champs à remplacer
// comme par exemple le {{title}} pour le titre de la popup
const POPUP_CONTENT = `
<div class="flex flex-col w-fit h-fit border-2 border-pink-600 rounded-lg shadow-xl bg-slate-50 mx-auto">
    <div class="flex grow h-fit p-2 bg-pink-600">
        <h1 class="text-xl font-extrabold text-slate-50"> {{title}} </h1>
    </div>
    <div id="popup-body" class="flex flex-col grow h-fit p-4">
        <p class="text-slate-700"> {{description}} </p>
        <p class="my-4 mx-8 text-center font-semibold text-slate-700"> {{question}} </p>
    </div>
    <div id="log-zone-popup" class="w-fit mx-auto transition-all overflow-hidden duration-250" style="height: 0px;">
        <p class="text-lg font-semibold text-pink-600 text-center"></p>
    </div>
    <span class="flex grow h-[2px] bg-pink-600 rounded mx-4"></span>
    <div class="flex justify-between p-4">
        <a class="rounded px-2 bg-transparent text-slate-700 font-semibold transition-all
            hover:bg-pink-600 hover:text-slate-50 cursor-pointer" id="btn-no"> Non </a>
        <a class="border-2 border-pink-600 rounded px-2 bg-transparent text-slate-700 font-semibold transition-all
            hover:bg-pink-600 hover:text-slate-50 cursor-pointer" id="btn-yes"> Oui </a>
    </div>
</div>
`;

/**
 * Cree une popup generique avec les parametres specifies
 * @param {String} title titre de la popup
 * @param {String} description description de la popup
 * @param {String} question question de la popup
 * @param {String} cancelLabel texte du bouton d'annulation
 * @param {String} validateLabel texte du bouton de validation
 * @param {Function} onCancel Callback pour l'annulation
 * @param {Function} onValidate Callback pour la validation
 * @param {Function} onCreate Callback a la création de la popup
 * @returns 
 */
function showPopup(title, description, question, cancelLabel, validateLabel, onCancel, onValidate, onCreate) {
    if (popup != null) return; // Une popup est deja affichee

    // Creation de la popup
    popup = document.createElement("div");
    popup.classList.add("popup-container");
    popup.classList.add("popup-show");

    // Ajout du contenu de la popup
    popup.innerHTML = POPUP_CONTENT
        .replace("{{title}}", title)
        .replace("{{description}}", description)
        .replace("{{question}}", question);

    // Recuperation des boutons de la popup
    const btnYes = popup.querySelector("#btn-yes");
    const btnNo = popup.querySelector("#btn-no");

    // Ajout des labels aux boutons
    btnYes.innerText = validateLabel;
    btnNo.innerText = cancelLabel;

    // Recuperation du body de la popup (pour y ajouter des elements facultatifs)
    popup.body = popup.querySelector("#popup-body");
    popup.validate_btn = btnYes;
    popup.cancel_btn = btnNo;

    // Ajout d'une fonction de log dans la popup
    popup.log = msg => {
        const logZone = popup.querySelector("#log-zone-popup");
        log(msg, logZone);
    };

    // Fonction interne pour executer un callback
    // et cacher la popup une fois le callback termine
    const executeCallback = (callback) => {
        const res = callback(popup);
        if (res instanceof Promise) {
            res.then(() => hidePopup());
        } else {
            hidePopup();
        }
    };

    // Ajout du listener pour cacher la popup si on clique en dehors
    popup.addEventListener("click", ev => {
        let rect = popup.firstElementChild.getBoundingClientRect();
        if (ev.clientX < rect.left || ev.clientX > rect.right || ev.clientY < rect.top || ev.clientY > rect.bottom) {
            if (onCancel) executeCallback(onCancel);
            hidePopup();
        }
    });

    // Ajout des listeners pour les boutons
    btnYes?.addEventListener("click", () => { if (onValidate) executeCallback(onValidate); });
    btnNo?.addEventListener("click", () => { if (onCancel) executeCallback(onCancel); });

    // Declanchement du callback onCreate et ajout de la popup au DOM
    if (onCreate) onCreate(popup);
    document.body.appendChild(popup);

    // Retour de la popup pour pouvoir l'utiliser
    return popup;
}

/**
 * Cache la popup si elle est affichee
 */
function hidePopup() {
    if (popup == null) return;

    // on ajoute les classes qu'il faut pour déclancher l'animation
    popup.classList.remove("popup-show");
    popup.classList.add("popup-hide");

    // au bout de 500ms on supprime la popup du DOM (fin de l'animation)
    setTimeout(() => {
        if (popup == null) return;
        popup.remove();
        popup = null;
    }, 500);
}

export { showPopup, hidePopup };