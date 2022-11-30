import { hideDIV, initCommon, showDIV } from "./common.js";
import User from "./User.js";

const HEADER_CONTENT = `<div class="flex grow h-fit rounded-lg shadow-xl bg-slate-50 border-2 border-pink-600 px-4 py-4">
<div class="flex flex-col justify-center w-fit">
    <a href="/index.html" class="text-2xl font-extrabold text-slate-700 hover:text-pink-600 transition-all"> Cocktails & Cie </a>
</div>
<div class="flex justify-center grow space-x-8">
    <a class="text-xl font-semibold text-slate-700 px-2 rounded cursor-pointer
              transition-all hover:bg-pink-600 hover:text-slate-50" href="/list.html"> Cocktails </a>
    <a class="text-xl font-semibold text-slate-700 px-2 rounded cursor-pointer
              transition-all hover:bg-pink-600 hover:text-slate-50" href="/favorites.html"> Favorites </a>
</div>
<div class="flex justify-end">
    <div id="is-connected">
        <a class="border-2 border-pink-600 rounded px-2 bg-transparent text-slate-700 font-semibold transition-all
        hover:border-pink-600 hover:bg-pink-600 hover:text-slate-50" href="/profile.html"> Mon profil </a>
    </div>
    <div id="is-disconnected" class="space-x-4">
        <a class="border-2 border-transparent rounded px-2 bg-transparent text-slate-700 font-semibold
              transition-all hover:bg-pink-600 hover:text-slate-50" href="/register.html"> S'inscrire </a>
        <a class="border-2 border-pink-600 rounded px-2 bg-transparent text-slate-700 font-semibold transition-all
              hover:border-pink-600 hover:bg-pink-600 hover:text-slate-50" href="/login.html"> Se connecter </a>
    </div>
</div>
</div>`;

function initHeader() {
    initCommon();

    const header = document.getElementById("header");
    header.innerHTML = HEADER_CONTENT;

    if (User.isConnected()) {
        showDIV("is-connected");
        hideDIV("is-disconnected");
    } else {
        hideDIV("is-connected");
        showDIV("is-disconnected");
    }
}

export {
    initHeader
}