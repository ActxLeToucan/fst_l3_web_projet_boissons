import { log } from "./common.js";

let popup = null;

const POPUP_CONTENT = `
<div class="flex flex-col w-fit h-fit border-2 border-pink-600 rounded-lg shadow-xl bg-slate-50 mx-auto">
    <div class="flex grow h-fit p-2 bg-pink-600">
        <h1 class="text-xl font-extrabold text-slate-50"> {{title}} </h1>
    </div>
    <div id="popup-body" class="flex flex-col grow h-fit p-4">
        <p class="text-slate-700"> {{description}} </p>
        <p class="my-4 mx-8 text-center font-semibold text-slate-700"> {{question}} </p>
    </div>
    <div id="log-zone-popup" class="w-fit mx-auto transition-all overflow-hidden duration-250" style="height: 0px;">
        <p class="text-lg font-semibold text-pink-600 text-center"></p>
    </div>
    <span class="flex grow h-[2px] bg-pink-600 rounded mx-4"></span>
    <div class="flex justify-between p-4">
        <a class="rounded px-2 bg-transparent text-slate-700 font-semibold transition-all
            hover:bg-pink-600 hover:text-slate-50 cursor-pointer" id="btn-no"> Non, merci </a>
        <a class="border-2 border-pink-600 rounded px-2 bg-transparent text-slate-700 font-semibold transition-all
            hover:bg-pink-600 hover:text-slate-50 cursor-pointer" id="btn-yes"> Oui, importer </a>
    </div>
</div>
`;

function showPopup(title, description, question, cancelLabel, validateLabel, onCancel, onValidate, onCreate) {
    if (popup != null) return;

    popup = document.createElement("div");
    popup.classList.add("popup-container");
    popup.classList.add("popup-show");
    popup.innerHTML = POPUP_CONTENT
        .replace("{{title}}", title)
        .replace("{{description}}", description)
        .replace("{{question}}", question);

    const btnYes = popup.querySelector("#btn-yes");
    const btnNo = popup.querySelector("#btn-no");

    btnYes.innerText = validateLabel;
    btnNo.innerText = cancelLabel;

    popup.body = popup.querySelector("#popup-body");
    popup.validate_btn = btnYes;
    popup.cancel_btn = btnNo;
    popup.log = msg => {
        const logZone = popup.querySelector("#log-zone-popup");
        log(msg, logZone);
    };

    const executeCallback = (callback) => {
        const res = callback(popup);
        if (res instanceof Promise) {
            res.then(() => hidePopup());
        } else {
            hidePopup();
        }
    };

    popup.addEventListener("click", ev => {
        let rect = popup.firstElementChild.getBoundingClientRect();
        if (ev.clientX < rect.left || ev.clientX > rect.right || ev.clientY < rect.top || ev.clientY > rect.bottom) {
            if (onCancel) executeCallback(onCancel);
            hidePopup();
        }
    });

    btnYes?.addEventListener("click", () => { if (onValidate) executeCallback(onValidate); });
    btnNo?.addEventListener("click", () => { if (onCancel) executeCallback(onCancel); });
    document.body.appendChild(popup);

    if (onCreate) onCreate(popup);

    return popup;
}

function hidePopup() {
    if (popup == null) return;

    popup.classList.remove("popup-show");
    popup.classList.add("popup-hide");
    setTimeout(() => {
        if (popup == null) return;
        popup.remove();
        popup = null;
    }, 500);
}

export { showPopup, hidePopup };