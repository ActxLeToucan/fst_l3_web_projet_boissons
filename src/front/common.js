const TYPE_FLEX = "flex";
const TYPE_BLOCK = "block";

function hideDIV(id) {
    document.getElementById(id).style.display = "none";
}

function showDIV(id, type=TYPE_FLEX) {
    document.getElementById(id).style.display = type;
}

export {
    hideDIV,
    showDIV,
    TYPE_FLEX,
    TYPE_BLOCK
}