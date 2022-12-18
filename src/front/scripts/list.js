import API from "./API.js";
import { initHeader } from "./header.js";
import { fetchIngredients } from "./ingredients.js";
import { createListMenu } from "./menu.js";
import { createAlimentTile, createCocktailTile } from "./tiles.js";

let aliments = null;
let selected_aliments = [];

onload = () => {
    initHeader();
    setup();
    fetchIngredients().then(root => {
        aliments = root;
    }).catch(err => { console.error("cannot get aliments"); });

    let searchZone_floating = false;
    const searchZone = document.getElementById("search-zone");
    window.addEventListener("scroll", () => {
        const top = searchZone.getBoundingClientRect().y;
        const shouldFloat = top < 100;
        if (shouldFloat != searchZone_floating) {
            searchZone_floating = shouldFloat;
            searchZone.classList[shouldFloat? "remove": "add"]("shadow-none");
            searchZone.classList[shouldFloat? "remove": "add"]("border-slate-50");
            searchZone.classList[shouldFloat? "add": "remove"]("shadow-xl");
            searchZone.classList[shouldFloat? "add": "remove"]("border-slate-300");
        }
    });
}

function setup() {
    const search_input = document.getElementById("search-input");
    const search_btn = document.getElementById("search-btn");
    const add_aliment_btn = document.getElementById("add-aliment");

    add_aliment_btn.addEventListener("click", () => {
        const rect = add_aliment_btn.getBoundingClientRect();
        const coords = {x: rect.x, y: rect.y+rect.height+10};
        createListMenu(coords, aliments.children, selected_aliments, displayAliments);
    });

    search_btn.addEventListener("click", refreshCocktails);

    let searchTimeout = -1;
    search_input.addEventListener("keyup", e => {
        if (searchTimeout != -1)
            clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            refreshCocktails();
            searchTimeout = -1;
        }, 200);
    });

    refreshCocktails();
}

function refreshCocktails() {
    const aliments_plus_ids = selected_aliments.filter(a => a.state).map(a => a.id);
    const aliments_minus_ids = selected_aliments.filter(a => !a.state).map(a => a.id);
    fetchCocktails({
        query: document.getElementById("search-input").value,
        tags_plus: aliments_plus_ids,
        tags_minus: aliments_minus_ids
    });
}

let requestParams = {query: "", tags_plus: [], tags_minus: []};
function fetchCocktails({query, tags_plus, tags_minus}) {
    
    if (query != undefined)      requestParams.query = query;
    if (tags_plus != undefined)  requestParams.tags_plus = tags_plus;
    if (tags_minus != undefined) requestParams.tags_minus = tags_minus;

    if (
        (requestParams.query == undefined      || requestParams.query == ""           ) &&
        (requestParams.tags_plus == undefined  || requestParams.tags_plus.length == 0 ) &&
        (requestParams.tags_minus == undefined || requestParams.tags_minus.length == 0)
    ) displayCocktails([]);

    let link = "/cocktails/search";
    let queryParam = "query=\"\"";
    let plusParam, minusParam;

    if (requestParams.query !== "") { queryParam = "query="+requestParams.query; }

    if (requestParams.tags_plus?.length > 0)
        plusParam = "tags_plus="+requestParams.tags_plus.join(";");

    if (requestParams.tags_minus?.length > 0)
        minusParam = "tags_minus="+requestParams.tags_minus.join(";");

    link += "?" + queryParam;
    if (plusParam) link += "&" + plusParam;
    if (minusParam) link += (plusParam? "?" : "&") + minusParam;

    API.execute(link).then(res => {
        displayCocktails(res);
    }).catch(err => {
        console.error("err: ", err);
    });
}

let lastState = [];
function displayAliments(aliments) {
    if (aliments == undefined) aliments = selected_aliments;
    const list = document.getElementById("aliment-list");
    while (list.firstChild) list.firstChild.remove();
    aliments.forEach(aliment => {
        list.appendChild(createAlimentTile(aliment, selected_aliments, lastState, refreshCocktails, displayAliments));
    });
    lastState = Array.from(aliments);
}

function displayCocktails(cocktails) {
    const list = document.getElementById("cocktail-list");
    while (list.firstChild) list.firstChild.remove();
    cocktails.forEach(cocktail => {
        list.appendChild(createCocktailTile(cocktail));
    });
}