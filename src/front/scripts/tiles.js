import { cleanTitle, getCocktailImage } from "./common.js";

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

function createAlimentTile(aliment, selected_aliments, lastState, refreshCocktails, refreshList) {
    if (aliment.state == undefined) aliment.state = STATE_PLUS;

    const exists = lastState.find(a => a.id == aliment.id);
    const container = document.createElement("div");
    const classes = "flex text-slate-500 rounded bg-slate-50 border border-slate-200 shadow px-1 space-x-1";
    classes.split(" ").forEach(c => container.classList.add(c));
    container.innerHTML = ALIMENT_TILE_BODY.replace("{{title}}", aliment.name);
    container.id = "aliment-tile-"+aliment.id;

    if (!exists) container.classList.add("spawn-right");

    const setState = (state) => {
        aliment.state = state;
        container.classList[state? "remove":"add"]("bg-slate-100");
        container.classList[state? "add":"remove"]("bg-pink-50");
        container.querySelector(".plus-btn").classList[state? "add":"remove"]("hidden");
        container.querySelector(".minus-btn").classList[state? "remove":"add"]("hidden");
        container.querySelector("p").style.textDecoration = state? "none":"line-through";
        refreshCocktails();
    }
    setState(aliment.state);

    container.querySelector(".minus-btn").addEventListener("click", () => {
        setState(!aliment.state);
    });
    container.querySelector(".plus-btn").addEventListener("click", () => {
        setState(!aliment.state);
    });
    container.querySelector(".remove-btn").addEventListener("click", () => {
        selected_aliments.splice(selected_aliments.indexOf(aliment), 1);
        refreshList();
        refreshCocktails();
    });

    return container;
}

function createCocktailTile(cocktail) {
    cocktail.icon = getCocktailImage(cocktail.title);
    
    const container = document.createElement("a");
    const classes = "spawn-up flex flex-col m-10 rounded-lg shadow-lg border-2 border-slate-300 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all hover:border-pink-600 cursor-pointer";
    classes.split(" ").forEach(c => container.classList.add(c));
    container.href = "/cocktail.html?id="+cocktail.id;
    container.innerHTML = COCKTAIL_TILE_BODY
        .replace("{{title}}", cleanTitle(cocktail.title))
        .replace("{{icon}}", cocktail.icon);
    container.id = "cocktail-tile-"+cocktail.id;
    
    fetch(cocktail.icon).then(res => {
        if (res.status == 404) {
            container.querySelector("img").style.display = "none";
            container.querySelector(".noimg-svg").style.display = "flex";
        } else {
            container.querySelector("img").style.display = "flex";
            container.querySelector(".noimg-svg").style.display = "none";
        }
    }).catch(err => {});

    return container;
}

export {
    createAlimentTile,
    createCocktailTile
}