import { hideDIV, showDIV } from "./common.js";

function initHeader() {
    hideDIV("is-connected");
    showDIV("is-disconnected");
}

export {
    initHeader
}