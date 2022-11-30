import { initHeader } from "./header.js";

const COCKTAIL_TILE_BODY = `<div class="flex flex-col h-fit w-max max-w-[15em]">
    <div class="flex flex-col grow">
        <img src="{{icon}}" alt="cocktail image" class="w-60 h-60 object-cover">
        <div class="noimg-svg flex flex-col justify-center w-60 h-60 text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-20 h-20 mx-auto">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
        </div>
    </div>
    <div class="flex flex-col grow-0 justify-center p-4 bg-transparent">
        <p class="text-lg text-slate-700 font-bold truncate mx-auto max-w-full"> {{title}} </p>
    </div>
</div>`;

const cocktails_arr = [
    {title: "Alerte à Malibu (Boisson de la couleurs des fameux maillots de bains... ou presque)", id: 1},
    {title: "Aperol Spritz : Boisson italien pétillant", id: 2, icon: "https://resize.elle.fr/portrait/var/plain_site/storage/images/elle-a-table/recettes-de-cuisine/cocktail-bora-bora-sans-alcool-2806526/50409614-1-fre-FR/Cocktail-Bora-Bora-sans-alcool.jpg"},
    {title: "Aquarium", id: 3},
    {title: "Black velvet", id: 4},
    {title: "Bloody Mary", id: 5, icon: "https://images.radio-canada.ca/v1/alimentation/recette/4x3/cocktail-camerise-oolong.jpg"},
    {title: "Bora bora", id: 6},
    {title: "Builder", id: 7},
];

function createCocktailTile(cocktail) {
    const container = document.createElement("a");
    const classes = "flex flex-col m-10 rounded-lg shadow-lg border-2 border-slate-300 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all hover:border-pink-600 cursor-pointer";
    classes.split(" ").forEach(c => container.classList.add(c));
    container.href = "/cocktail.html?id"+cocktail.id;
    container.innerHTML = COCKTAIL_TILE_BODY
        .replace("{{title}}", cocktail.title)
        .replace("{{description}}", cocktail.description)
        .replace("{{icon}}", cocktail.icon);
    container.id = "cocktail-tile-"+cocktail.id;
    
    if (cocktail.icon == undefined) {
        container.querySelector("img").style.display = "none";
        container.querySelector(".noimg-svg").style.display = "flex";
    } else {
        container.querySelector("img").style.display = "flex";
        container.querySelector(".noimg-svg").style.display = "none";
    }

    return container;
}

onload = () => {
    initHeader();
    setup();
}

function cleanCocktails() {
    for (let i = 0; i < cocktails_arr.length; i++) {
        const cocktail = cocktails_arr[i];
        cocktail.title = cocktail.title.split(":")[0].split("(")[0].trim();
    }
}

function setup() {
    const search_input = document.getElementById("search-input");
    const search_btn = document.getElementById("search-btn");

    cleanCocktails();

    search_btn.addEventListener("click", () => {
        filterCocktails(search_input.value);
    });
    search_input.addEventListener("keyup", (e) => {
        if (e.key === "Enter" || true) {
            filterCocktails(search_input.value);
        }
    });
    filterCocktails("");
    filterCocktails(search_input.value);
}

function filterCocktails(query) {
    displayCocktails(cocktails_arr.filter(cocktail => {
        return cocktail.title.toLowerCase().replaceAll(" ", "").contains(query.toLowerCase().replaceAll(" ", ""));
    }));
}

function displayCocktails(cocktails) {
    const list = document.getElementById("cocktail-list");
    if (list.childElementCount != cocktails_arr.length) {
        while (list.firstChild) list.firstChild.remove();
        cocktails.forEach(cocktail => {
            list.appendChild(createCocktailTile(cocktail));
        });
    }

    const valid_ids = cocktails.map(cocktail => cocktail.id);
    cocktails_arr.forEach(cocktail => {
        const tile = document.getElementById("cocktail-tile-"+cocktail.id);
        if (tile) {
            if (valid_ids.includes(cocktail.id)) {
                showTile(tile);
            } else {
                hideTile(tile);
            }
        }
    });
}

function hideTile(tile) {
    tile.style.maxWidth = "0px";
    setTimeout(() => {
        tile.style.display = "none";
    }, 100);
}

function showTile(tile) {
    tile.style.display = "flex";
    setTimeout(() => {
        tile.style.maxWidth = tile.firstChild.getBoundingClientRect().width + 4 + "px";
    }, 10);
}