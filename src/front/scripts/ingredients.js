import API from "./API.js";

let tree = {};

/**
 * Classe Ingredient, permet de représenter un ingrédient
 * dans la liste des ingrédients du site.
 * Permet de naviguer dans l'arbre des ingrédients
 * et de le représenter dans l'interface plus simplement.
 */
class Ingredient {
    #id = null;
    #obj = null;
    #name = null;
    #children = null;
    #parents = null;

    constructor(id) {
        this.#id = id;
    }

    /**
     * Retourne l'aliment correspondant à l'id
     * @param {number} id id de l'aliment à trouver
     * @returns l'aliment correspondant à l'id, ou undefined si il n'existe pas
     */
    find(id) {
        return tree[id];
    }

    /**
     * retourne l'ID de l'ingrédient
     * @returns id de l'ingrédient, ou null si l'ingrédient n'existe pas
     */
    get id() {
        if (this.#id !== null) return this.#id;
        if (this.#obj !== null) return this.#obj.id;
        return null;
    }

    /**
     * Retourne l'objet correspondant à l'ingrédient
     * @returns l'objet correspondant à l'ingrédient, ou null si l'ingrédient n'existe pas
     */
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

    /**
     * Retourne le nom de l'ingrédient
     * @returns le nom de l'ingrédient, ou null si l'ingrédient n'existe pas
     */
    get name() {
        if (this.#name !== null) return this.#name;

        if (this.obj !== null) {
            this.#name = this.obj.name;
            return this.#name;
        }

        return null;
    }

    /**
     * Retourne la liste des enfants de l'ingrédient
     * @returns la liste des enfants de l'ingrédient, ou null si l'ingrédient n'existe pas
     */
    get children() {
        if (this.#children !== null) return this.#children;

        if (this.obj !== null) {
            this.#children = this.obj.children.map(c => new Ingredient(c));
            return this.#children;
        }

        return null;
    }

    /**
     * Retourne la liste des parents de l'ingrédient
     * @returns la liste des parents de l'ingrédient, ou null si l'ingrédient n'existe pas
     */
    get parents() {
        if (this.#parents !== null) return this.#parents;

        if (this.obj !== null) {
            this.#parents = this.obj.parents.map(c => new Ingredient(c));
            return this.#parents;
        }

        return null;
    }

    /**
     * Retourne si l'ingrédient est la racine de l'arbre
     * @returns true si l'ingrédient est la racine de l'arbre, false sinon
     */
    get isRoot() {
        return this.id === tree.root.id;
    }
}

/**
 * Recupère l'arbre des ingrédients depuis l'API
 * @returns une promesse contenant la racine de l'arbre des ingrédients
 */
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
 * Construit l'arbre des ingrédients à partir de la liste des ingrédients en paramètre
 * @param {{id:number,name:String,children:number[],parents:number[]}[]} ingredients 
 * @returns L'arbre des ingrédients, avec la racine dans la propriété "root"
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