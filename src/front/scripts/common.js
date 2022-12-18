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
    document.getElementById(id).style.display = "none";
}

function showDIV(id, type=TYPE_FLEX) {
    document.getElementById(id).style.display = type;
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

export {
    initCommon,
    hideDIV,
    showDIV,
    TYPE_FLEX,
    TYPE_BLOCK,
    setElementStyle,
    getCocktailImage,
    cleanTitle
}