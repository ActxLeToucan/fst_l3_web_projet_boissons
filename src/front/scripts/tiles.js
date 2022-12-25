import { cleanTitle, getCocktailImage, setElementStyle } from "./common.js";

// Contenu HTML d'une tuile de cocktail
// Avec des champs à remplacer par des données (comme {{title}})
const COCKTAIL_TILE_BODY = `<div class="flex flex-col h-fit lg:w-[15em] md:w-[12em] w-[8em]">
    <div class="flex flex-col grow">
        <img src="{{icon}}" alt="cocktail image" class="lg:w-60 lg:h-60 md:w-40 md:h-40 w-20 h-20 text-center mx-auto object-cover">
        <div class="noimg-svg flex flex-col justify-center lg:w-60 lg:h-60 md:w-40 md:h-40 w-20 h-20 mx-auto text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="lg:w-20 lg:h-20 md:w-16 md:h-16 w-10 h-10 mx-auto">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
        </div>
    </div>
    <div class="flex flex-col grow-0 justify-center p-4 bg-transparent">
        <p class="lg:text-lg text-md text-slate-700 font-bold truncate mx-auto max-w-full"> {{title}} </p>
    </div>
</div>`;

// Contenu HTML d'une tuile d'aliment
// Avec des champs à remplacer par des données (comme {{title}})
const ALIMENT_TILE_BODY = `
<div class="toggle-btn flex flex-col justify-center cursor-pointer">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="plus-btn w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M18 12H6" />
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="minus-btn w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
    </svg>
</div>
<div class="flex flex-col justify-center"><p class="font-semibold m-0 pb-1 pr-1"> {{title}} </p></div>
<div class="remove-btn flex flex-col justify-center cursor-pointer">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 bg-pink-600 text-slate-50 rounded">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
</div>`;

const STATE_PLUS = true;
const STATE_MINUS = false;

/**
 * Cree une tuile pour un aliment
 * @param {object} aliment aliment à afficher
 * @param {object[]} selected_aliments liste des aliments sélectionnés (pour en supprimer cet aliment si besoin)
 * @param {object{}} lastState dernier etat de selected_aliments (pour l'animation)
 * @param {Function} refreshCocktails callback utilisé pour rafraichir la liste des cocktails
 * @param {Function} refreshList callback utilisé pour rafraichir la liste des aliments
 * @returns 
 */
function createAlimentTile(aliment, selected_aliments, lastState, refreshCocktails, refreshList) {
    if (aliment.state == undefined) aliment.state = STATE_PLUS; // Par défaut, l'aliment est en mode "ajouter"

    // on regarde si l'aliment est déjà dans la liste des aliments (pour l'animation)
    const exists = lastState.find(a => a.id == aliment.id);

    // on crée la tuile
    const container = document.createElement("div");
    const classes = "flex text-slate-500 rounded bg-slate-50 border border-slate-200 shadow px-1 space-x-1";
    setElementStyle(container, classes);
    // on ajoute le contenu HTML
    container.innerHTML = ALIMENT_TILE_BODY.replace("{{title}}", aliment.name);
    container.id = "aliment-tile-"+aliment.id;

    // on ajoute l'animation si l'aliment n'etait pas deja selectionné
    if (!exists) container.classList.add("spawn-right");

    // Fonction pour changer l'état de l'aliment (ajouté ou retiré)
    const setState = (state) => {
        // on sauvegarde l'état
        aliment.state = state;
        // on change graphiquement la representation de l'aliment
        container.classList[state? "remove":"add"]("bg-slate-100");
        container.classList[state? "add":"remove"]("bg-pink-50");
        container.querySelector(".plus-btn").classList[state? "add":"remove"]("hidden");
        container.querySelector(".minus-btn").classList[state? "remove":"add"]("hidden");
        container.querySelector("p").style.textDecoration = state? "none":"line-through";
        // on mets a jour les cocktails correspondants au filtres
        refreshCocktails();
    }
    setState(aliment.state); // on initialise l'état de l'aliment

    // on ajoute les evenements pour changer l'état de l'aliment
    container.querySelector(".minus-btn").addEventListener("click", () => {
        setState(!aliment.state);
    });
    container.querySelector(".plus-btn").addEventListener("click", () => {
        setState(!aliment.state);
    });

    // on ajoute l'evenement pour supprimer l'aliment de la liste des aliments selectionnés
    container.querySelector(".remove-btn").addEventListener("click", () => {
        selected_aliments.splice(selected_aliments.indexOf(aliment), 1);
        refreshList();
        refreshCocktails();
    });

    // on retourne la tuile
    return container;
}

/**
 * Cree une tuile pour un cocktail
 * @param {object} cocktail Cocktail à afficher
 * @returns l'element HTML de la tuile
 */
function createCocktailTile(cocktail) {
    // on recupere l'url de l'image du cocktail depuis le titre
    cocktail.icon = getCocktailImage(cocktail.title);
    
    // on crée la tuile
    const container = document.createElement("a");
    const classes = "spawn-up flex flex-col lg:m-10 m-2 rounded-lg shadow-lg border-2 border-slate-300 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all hover:border-pink-600 cursor-pointer";
    setElementStyle(container, classes);
    // on ajoute l'url de la page du cocktail
    container.href = "/cocktail.html?id="+cocktail.id;
    // on ajoute le contenu HTML, en remplaçant les variables par les valeurs
    container.innerHTML = COCKTAIL_TILE_BODY
        .replace("{{title}}", cleanTitle(cocktail.title))
        .replace("{{icon}}", cocktail.icon);
    container.id = "cocktail-tile-"+cocktail.id;
    
    // On regarde si la requete de l'image renvoie une erreur 404
    // Si c'est le cas, on affiche une icone "no image"
    fetch(cocktail.icon).then(res => {
        if (res.status == 404) {
            container.querySelector("img").style.display = "none";
            container.querySelector(".noimg-svg").style.display = "flex";
        } else {
            container.querySelector("img").style.display = "flex";
            container.querySelector(".noimg-svg").style.display = "none";
        }
    }).catch(err => {});

    // on retourne la tuile
    return container;
}

export {
    createAlimentTile,
    createCocktailTile
}