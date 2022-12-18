import { setElementStyle } from "./common.js";

let autocomplete_container;
let focusIndex;
let data_arr = [];
let onselected_callback;

function showAutocomplete(el, data, onselected) {
    focusIndex = -1;
    data_arr = data;
    onselected_callback = onselected;
    if (data.length === 0) {
        if (autocomplete_container != null) {
            autocomplete_container.remove();
            autocomplete_container = null;
        }
        return;
    }

    const elBounds = el.getBoundingClientRect();
    if (!autocomplete_container) {
        const container = document.createElement("div");
        setElementStyle(container, "fixed flex flex-col bg-white border border-pink-600 rounded-lg shadow-lg");
        container.style.top = elBounds.y + elBounds.height + "px";
        container.style.left = elBounds.x + "px";
        container.style.width = elBounds.width + "px";
        container.style.maxHeight = "200px";
        container.style.overflowY = "auto";
        container.style.zIndex = "1000";
        container.style.scrollBehavior = "smooth";
        autocomplete_container = container;

        autocomplete_container.focusDown = () => {
            focusIndex++;
            if (focusIndex >= autocomplete_container.children.length)
                focusIndex = 0;

            autocomplete_container.updateSelected();
        };

        autocomplete_container.focusUp = () => {
            focusIndex--;
            if (focusIndex < 0)
                focusIndex = autocomplete_container.children.length - 1;

            autocomplete_container.updateSelected();
        };

        autocomplete_container.updateSelected = () => {
            for (let i = 0; i < autocomplete_container.children.length; i++) {
                const el = autocomplete_container.children[i];
                if (i == focusIndex) {
                    el.classList.add("bg-pink-100");
                    autocomplete_container.scrollTo(0, el.offsetTop - 80);
                }
                else el.classList.remove("bg-pink-100");
            }
        };

        window.addEventListener("scroll", () => {
            const elBounds = el.getBoundingClientRect();
            if (autocomplete_container == null) {
                window.removeEventListener("scroll", this);
                return;
            }
            autocomplete_container.style.top = elBounds.y + elBounds.height + "px";
            autocomplete_container.style.left = elBounds.x + "px";
        });
    }
    
    autocomplete_container.innerHTML = "";
    data.forEach(item => {
        const itemEl = document.createElement("div");
        setElementStyle(itemEl, "flex items-center px-2 py-1 hover:bg-pink-100 text-md font-semibold text-slate-700 py-2");
        itemEl.innerText = item.title;
        itemEl.addEventListener("click", () => {
            onselected(item);
            autocomplete_container.remove();
        });
        autocomplete_container.appendChild(itemEl);
    });    

    document.body.appendChild(autocomplete_container);
    return autocomplete_container;
}

function hideAutocomplete() {
    showAutocomplete(null, [], null);
}

function focusAutocomplete(key="ArrowDown") {
    if (autocomplete_container == null) return;
    if (key == "ArrowDown") autocomplete_container.focusDown();
    else autocomplete_container.focusUp();
}

function autoCompleteHovered() {
    return focusIndex != -1;
}

function autoCompleteSelect() {
    if (focusIndex == -1) return null;
    return onselected_callback(data_arr[focusIndex]);
}

export {
    showAutocomplete,
    focusAutocomplete,
    autoCompleteHovered,
    autoCompleteSelect,
    hideAutocomplete
};