const TYPE_FLEX = "flex";
const TYPE_BLOCK = "block";

function initCommon() {
    String.prototype.contains = function (str) {
        return this.includes(str.toLowerCase());
    };
    String.prototype.replaceAll = function (str, replacement) {
        return this.split(str).join(replacement);
    };
}

function hideDIV(id) {
    document.querySelectorAll("."+id).forEach(el => el.style.display = "none");
}

function showDIV(id, type=TYPE_FLEX) {
    document.querySelectorAll("."+id).forEach(el => el.style.display = type);
}

function setElementStyle(el, classes) {
    classes.split(" ").forEach(c => el.classList.add(c));
}

function getCocktailImage(title) {
    let filename = title.toLowerCase().replaceAll(" ", "_")+".jpg";
    filename = filename[0].toUpperCase() + filename.slice(1);
    return "/img/"+filename;
}

function cleanTitle(title) {
    return title.split(":")[0].split("(")[0].trim();
}

let timeout = {};
function log(message, element = document.getElementById("log-zone")) {
    if (!element) return;

    const setHeight = px => { element.style.height = px + "px"; };
    const getNbLogs = () => element.firstElementChild.innerHTML.split("<br>").length;

    const logMsg = element.firstElementChild;
    if (logMsg.innerHTML != "") logMsg.innerHTML += "<br>";
    logMsg.innerHTML += message;
    setHeight( getNbLogs() * 28 );

    if (timeout[element.id]) {
        clearTimeout(timeout[element.id]);
        timeout[element.id] = undefined;
    }
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