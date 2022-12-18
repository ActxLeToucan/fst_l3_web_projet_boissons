let menus = [];
function createListMenu(coords, elements, selected_elements, onselection, sub = 0) {
    if (!elements) return;

    if (menus[sub]) {
        for (let i = sub; i < menus.length; i++) {
            if (!menus[i]) continue;
            menus[i].remove();
            menus[i] = null;
        }
    }

    const container = document.createElement("div");
    const classes = "fixed z-20 bg-white border border-pink-600 shadow-lg rounded overflow-hidden";
    classes.split(" ").forEach(c => container.classList.add(c));
    container.style.top = coords.y+"px";
    container.style.left = coords.x+"px";
    container.innerHTML = `<div class="flex flex-col space-y-1"></div>`;
    menus[sub] = container;

    elements.forEach(element => {
        const exists = selected_elements.find(e => e.id == element.id);
        const item = document.createElement("div");
        let classes = "flex flex-row justify-between space-x-2 px-2 py-1 transition-colors duration-200";
        if (!exists) classes += " text-slate-700 hover:text-pink-600 hover:bg-pink-50 cursor-pointer";
        else classes += " text-slate-400";
        classes.split(" ").forEach(c => item.classList.add(c));
        item.innerHTML = `<div class="flex flex-col justify-center"> <p class="font-semibold m-0 pb-1"> ${element.name} </p> </div>`;

        item.addEventListener("click", () => {
            if (exists) return;
            selected_elements.push(element);
            onselection(selected_elements);

            if (element.elements) {
                for (let i = 0; i < element.elements.length; i++) {
                    let index = selected_elements.indexOf(element.elements[i]);
                    if (index != -1) {
                        selected_elements.splice(index, 1);
                        onselection(selected_elements);
                    }
                }
            }
        });
        item.addEventListener("mouseenter", () => {
            if (exists) return;
            const rect = item.getBoundingClientRect();
            const coords = {x: rect.x + rect.width, y: rect.y};
            createListMenu(coords, element.children, selected_elements, onselection, sub + 1);
        });
        container.querySelector(".flex").appendChild(item);
    });

    container.isRemoved = false;
    container._remove = container.remove;
    container.remove = () => {
        if (menus.length == 0) return;

        window.removeEventListener("click", container.remove);
        container.isRemoved = true;
        container._remove();
        for (let i = sub + 1; i < menus.length; i++) {
            if (!menus[i]) continue;
            menus[i]._remove();
            menus[i] = null;
        }
    };

    setTimeout(() => {
        if (container.isRemoved) return;
        if (sub != 0) return;

        window.addEventListener("click", container.remove);
    }, 10);

    document.body.appendChild(container);

    // clamp position to screen
    const rect = container.getBoundingClientRect();
    if (rect.x + rect.width > window.innerWidth) {
        container.style.left = (window.innerWidth - rect.width)+"px";
    }
    if (rect.y + rect.height > window.innerHeight) {
        container.style.top = (window.innerHeight - rect.height)+"px";
    }

    return container;
}

export {
    createListMenu
}