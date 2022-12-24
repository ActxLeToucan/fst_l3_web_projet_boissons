const TYPE_FLEX = "flex";
const TYPE_BLOCK = "block";

/**
 * Fonction d'initialisation des fonctions communes
 * Ajoute les fonctions contains et replaceAll aux String
 * (pour éviter d'avoir à les réécrire à chaque fois)
 */
function initCommon() {
    String.prototype.contains = function (str) {
        return this.includes(str.toLowerCase());
    };
    String.prototype.replaceAll = function (str, replacement) {
        return this.split(str).join(replacement);
    };
}

/**
 * Masque un element du dom d'id donné (display none)
 * @param {String} id id de la div à cacher
 */
function hideDIV(id) {
    document.querySelectorAll("."+id).forEach(el => el.style.display = "none");
}

/**
 * Affiche un element du dom d'id donné (display flex)
 * @param {String} id id de la div à afficher
 * @param {String} type type d'affichage (flex, block, ...), par défaut flex
 */
function showDIV(id, type=TYPE_FLEX) {
    document.querySelectorAll("."+id).forEach(el => el.style.display = type);
}

/**
 * Applique les classes à un element du dom
 * @param {HTMLElement} el element auquel appliquer les classes
 * @param {String} classes classes à appliquer à l'element
 */
function setElementStyle(el, classes) {
    classes.split(" ").forEach(c => el.classList.add(c));
}

/**
 * Renvoie le chemin de l'image du cocktail a partir de son titre
 * @param {String} title titre du cocktail
 * @returns Une string contenant le chemin de l'image du cocktail
 */
function getCocktailImage(title) {
    let filename = title.toLowerCase().replaceAll(" ", "_")+".jpg";
    filename = filename[0].toUpperCase() + filename.slice(1);
    return "/img/"+filename;
}

/**
 * Renvoie le titre du cocktail sans superflu
 * @param {String} title titre du cocktail
 * @returns Le titre du cocktail sans superflu (ex: "Mojito (Cuba Libre)" devient "Mojito")
 */
function cleanTitle(title) {
    return title.split(":")[0].split("(")[0].trim();
}

let timeout = {};
/**
 * Affiche un message dans la zone de log de la page courante (nommée #log-zone)
 * @param {String} message message à afficher dans la zone de log pendant 5 secondes
 * @param {HTMLElement} element element dans lequel afficher le message (par défaut #log-zone)
 */
function log(message, element = document.getElementById("log-zone")) {
    if (!element) return;

    // Fonction pour définir la hauteur de la zone de log
    const setHeight = px => { element.style.height = px + "px"; };
    // Fonction pour récupérer le nombre de lignes de la zone de log
    const getNbLogs = () => element.firstElementChild.innerHTML.split("<br>").length;

    // recuperation du paragraph de log
    const logMsg = element.firstElementChild;
    // ajout du message
    if (logMsg.innerHTML != "") logMsg.innerHTML += "<br>";
    logMsg.innerHTML += message;

    // redimentionnement de la zone de log
    setHeight( getNbLogs() * 28 );

    // suppression des timeout précédents non terminés (pour éviter les conflits)
    if (timeout[element.id]) {
        clearTimeout(timeout[element.id]);
        timeout[element.id] = undefined;
    }
    // suppression du message après 5 secondes
    timeout[element.id] = setTimeout(() => {
        logMsg.innerHTML = "";
        element.style.height = "0px";
        timeout[element.id] = undefined;
    }, 5000);
}

export {
    initCommon,
    hideDIV,
    showDIV,
    TYPE_FLEX,
    TYPE_BLOCK,
    setElementStyle,
    getCocktailImage,
    cleanTitle,
    log
}