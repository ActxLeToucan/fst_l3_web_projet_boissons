import { hideDIV, initCommon, setElementStyle, showDIV } from "./common.js";
import User from "./User.js";

const HEADER_CONTENT = `<div class="flex flex-col grow h-fit rounded-lg shadow-xl bg-slate-50 border-2 border-pink-600 px-4 py-4">
<div class="hidden md:flex grow">
    <div class="flex flex-col justify-center w-fit">
        <a href="/index.html" class="text-2xl font-extrabold text-slate-700 hover:text-pink-600 transition-all"> Cocktails & Cie </a>
    </div>
    <div class="flex justify-center grow space-x-8">
        <a class="text-xl font-semibold text-slate-700 px-2 rounded cursor-pointer
                  transition-all hover:bg-pink-600 hover:text-slate-50" href="/list.html"> Cocktails </a>
        <a class="text-xl font-semibold text-slate-700 px-2 rounded cursor-pointer
                  transition-all hover:bg-pink-600 hover:text-slate-50" href="/favorites.html"> Favoris </a>
    </div>
    <div class="flex justify-end">
        <div class="is-connected">
            <a class="border-2 border-pink-600 rounded px-2 bg-transparent text-slate-700 font-semibold transition-all
            hover:border-pink-600 hover:bg-pink-600 hover:text-slate-50" href="/profile.html"> Mon profil </a>
        </div>
        <div class="is-disconnected space-x-4">
            <a class="border-2 border-transparent rounded px-2 bg-transparent text-slate-700 font-semibold
                  transition-all hover:bg-pink-600 hover:text-slate-50" href="/register.html"> S'inscrire </a>
            <a class="border-2 border-pink-600 rounded px-2 bg-transparent text-slate-700 font-semibold transition-all
                  hover:border-pink-600 hover:bg-pink-600 hover:text-slate-50" href="/login.html"> Se connecter </a>
        </div>
    </div>
</div>
<div class="flex md:hidden grow">
    <div class="flex flex-col justify-center w-fit">
        <a href="/index.html" class="text-2xl font-extrabold text-slate-700 hover:text-pink-600 transition-all"> Cocktails & Cie </a>
    </div>
    <div class="flex grow justify-end">
        <div class="flex flex-col justify-center text-slate-700">
            <svg id="menu-btn" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
        </div>
    </div>
</div>
<div id="mobile-menu" class="flex flex-col grow h-fit overflow-hidden transition-all duration-500" style="max-height: 0px;">
    <div class="flex flex-col grow">
        <span class="flex grow h-[2px] bg-pink-600 rounded mx-4 mt-2"></span>
        <div class="flex flex-col h-fit my-4">
            <a class="text-xl font-semibold text-slate-700 px-2 rounded cursor-pointer text-center py-2
                transition-all hover:bg-pink-600 hover:text-slate-50" href="/list.html"> Cocktails </a>
            <a class="text-xl font-semibold text-slate-700 px-2 rounded cursor-pointer text-center py-2
                transition-all hover:bg-pink-600 hover:text-slate-50" href="/favorites.html"> Favoris </a>
        </div>
        <span class="flex grow h-[2px] bg-slate-300 rounded w-12 mx-auto"></span>
        <div class="flex grow mt-4">
            <div class="is-connected">
                <a class="border-2 border-pink-600 rounded px-2 bg-transparent text-slate-700 font-semibold transition-all
                hover:border-pink-600 hover:bg-pink-600 hover:text-slate-50" href="/profile.html"> Mon profil </a>
            </div>
            <div class="is-disconnected flex grow justify-evenly space-x-4 mb-2">
                <a class="border-2 border-transparent rounded px-2 bg-transparent text-slate-700 font-semibold
                        transition-all hover:bg-pink-600 hover:text-slate-50" href="/register.html"> S'inscrire </a>
                <a class="border-2 border-pink-600 rounded px-2 bg-transparent text-slate-700 font-semibold transition-all
                        hover:border-pink-600 hover:bg-pink-600 hover:text-slate-50" href="/login.html"> Se connecter </a>
            </div>
        </div>
    </div>
</div>
</div>`;

let mobile_menu_shown = false;
function initHeader() {
    initCommon();

    const header = document.querySelector("header");
    if (!header) return;
    setElementStyle(header, "flex fixed top-0 w-full h-fit p-2 z-50");
    header.innerHTML = HEADER_CONTENT;

    if (User.isConnected()) {
        showDIV("is-connected");
        hideDIV("is-disconnected");
    } else {
        hideDIV("is-connected");
        showDIV("is-disconnected");
    }

    const menu_btn = header.querySelector("#menu-btn");
    menu_btn?.addEventListener("click", () => {
        const mobile_menu = document.querySelector("#mobile-menu");
        if (!mobile_menu_shown) {
            mobile_menu.style.maxHeight = mobile_menu.firstElementChild.getBoundingClientRect().height + "px";
            mobile_menu_shown = true;
        } else {
            mobile_menu.style.maxHeight = "0px";
            mobile_menu_shown = false;
        }
    });
}

export {
    initHeader
}