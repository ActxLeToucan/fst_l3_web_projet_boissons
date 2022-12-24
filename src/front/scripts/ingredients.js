import API from "./API.js";

let tree = {};

class Ingredient {
    #id = null;
    #obj = null;
    #name = null;
    #children = null;
    #parents = null;

    constructor(id) {
        this.#id = id;
    }

    find(id) {
        return tree[id];
    }

    get id() {
        if (this.#id !== null) return this.#id;
        if (this.#obj !== null) return this.#obj.id;
        return null;
    }

    get obj() {
        if (this.id === null) return null;
        
        if (this.#obj === null) {
            this.#obj = tree[this.id];
            if (this.#obj == undefined) {
                this.#obj = null;
                return null;
            }
        }

        return this.#obj;
    }

    get name() {
        if (this.#name !== null) return this.#name;

        if (this.obj !== null) {
            this.#name = this.obj.name;
            return this.#name;
        }

        return null;
    }

    get children() {
        if (this.#children !== null) return this.#children;

        if (this.obj !== null) {
            this.#children = this.obj.children.map(c => new Ingredient(c));
            return this.#children;
        }

        return null;
    }

    get parents() {
        if (this.#parents !== null) return this.#parents;

        if (this.obj !== null) {
            this.#parents = this.obj.parents.map(c => new Ingredient(c));
            return this.#parents;
        }

        return null;
    }

    get isRoot() {
        return this.id === tree.root.id;
    }
}

function fetchIngredients() {
    return new Promise((resolve, reject) => {
        API.execute("/ingredients").then(res => {
            const tree = buildIngredientTree(res);
            resolve(tree.root);
        }).catch(err => {
            reject(err);
        });
    });
}

/**
 * 
 * @param {{id:number,name:String,children:number[],parents:number[]}[]} ingredients 
 * @returns the ingredient tree
 */
function buildIngredientTree(ingredients) {
    tree = {};
    for (let key in ingredients) {
        const ingredient = ingredients[key];
        tree[ingredient.id] = ingredient;
        if (ingredient.parents.length === 0)
            tree.root = new Ingredient(ingredient.id);
    }
    return tree;
}

export {
    fetchIngredients
}