import { setElementStyle } from "./common";

let menus = [];

/**
 * Cree un menu a partir d'une liste d'elements
 * @param {{x: number, y: number}} coords Coordonnées du menu
 * @param {object[]} elements Elements a afficher
 * @param {object[]} selected_elements elements deja selectionnés
 * @param {Function} onselection callback de selection d'un element
 * @param {number} sub niveau de sous menu
 * @returns L'element HTML du menu ou undefined si erreur
 */
function createListMenu(coords, elements, selected_elements, onselection, sub = 0) {
    if (!elements || elements.length == 0) return; // si elements est null ou vide, on ne fait rien

    // si un menu existe deja a ce niveau, on le supprime
    if (menus[sub]) {
        for (let i = sub; i < menus.length; i++) {
            if (!menus[i]) continue;
            menus[i].remove();
            menus[i] = null;
        }
    }

    // creation du menu
    const container = document.createElement("div");
    const classes = "fixed z-20 bg-white border border-pink-600 shadow-lg rounded overflow-hidden";
    classes.split(" ").forEach(c => container.classList.add(c));
    container.style.top = coords.y+"px";
    container.style.left = coords.x+"px";
    container.innerHTML = `<div class="flex flex-col space-y-1"></div>`;
    menus[sub] = container;

    // ajout des elements
    elements.forEach(element => {
        // test si l'element est deja selectionné
        const exists = selected_elements.find(e => e.id == element.id);

        // creation de l'element
        const item = document.createElement("div");
        let classes = "flex flex-row justify-between space-x-2 px-2 py-1 transition-colors duration-200";
        // si l'element est deja selectionné, on le grise
        if (!exists) classes += " text-slate-700 hover:text-pink-600 hover:bg-pink-50 cursor-pointer";
        else classes += " text-slate-400";
        setElementStyle(item, classes);
        // ajout du nom de l'element
        item.innerHTML = `<div class="flex flex-col justify-center"> <p class="font-semibold m-0 pb-1"> ${element.name} </p> </div>`;

        // Ajout de l'evenement de click sur l'element
        item.addEventListener("click", () => {
            if (exists) return; // si l'element est deja selectionné, on ne fait rien

            // on ajoute l'element a la liste des elements selectionnés
            selected_elements.push(element);
            onselection(selected_elements);

            // si l'element a des enfants, on les retirent de la liste des elements selectionnés
            // (car si l'element parent est selectionné, les enfants le sont tous automatiquement)
            if (element.elements) {
                for (let i = 0; i < element.elements.length; i++) {
                    let index = selected_elements.indexOf(element.elements[i]);
                    if (index != -1) {
                        selected_elements.splice(index, 1);
                        onselection(selected_elements);
                    }
                }
            }
        });
        // Ajout de l'evenement de survol de l'element
        item.addEventListener("mouseenter", () => {
            if (exists) return; // si l'element est deja selectionné, on ne fait rien

            // on créé un sous menu si l'element a des enfants
            const rect = item.getBoundingClientRect();
            const coords = {x: rect.x + rect.width, y: rect.y};
            createListMenu(coords, element.children, selected_elements, onselection, sub + 1);
        });

        // on ajoute l'element au menu
        container.querySelector(".flex").appendChild(item);
    });

    // override de la fonction remove pour supprimer les sous menus et les listeners avec
    container.isRemoved = false;
    container._remove = container.remove;
    container.remove = () => {
        if (menus.length == 0) return;

        // on supprime les listeners
        window.removeEventListener("click", container.remove);
        container.isRemoved = true;
        // on supprime le menu
        container._remove();
        // on supprime les sous menus
        for (let i = sub + 1; i < menus.length; i++) {
            if (!menus[i]) continue;
            menus[i]._remove();
            menus[i] = null;
        }
    };

    // on ajoute un listener sur le click de la souris pour supprimer le menu
    // on attend 10ms pour etre sur que le menu est bien affiché
    setTimeout(() => {
        if (container.isRemoved) return;
        if (sub != 0) return;

        window.addEventListener("click", container.remove);
    }, 10);

    // on ajoute le menu a la page
    document.body.appendChild(container);

    // On s'assure que le menu ne sort pas de l'ecran
    const rect = container.getBoundingClientRect();
    if (rect.x + rect.width > window.innerWidth) {
        container.style.left = (window.innerWidth - rect.width)+"px";
    }
    if (rect.y + rect.height > window.innerHeight) {
        container.style.top = (window.innerHeight - rect.height)+"px";
    }

    // on retourne le menu
    return container;
}

export {
    createListMenu
}