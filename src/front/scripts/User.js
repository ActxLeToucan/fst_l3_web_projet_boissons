import API from "./API.js";

/**
 * Classe User, permet de représenter un utilisateur
 * et de gérer ses informations plus ou moins automatiquement.
 */
class User {
    /**@type {User} */
    static #currentUser = null;

    /**
     * Retourne l'utilisateur courant (ou null si aucun utilisateur n'est connecté)
     * @returns {User} l'utilisateur courant
     */
    static get CurrentUser() {
        if (!User.#currentUser) {
            User.#currentUser = User.fromLocalStorage();
        }
        return User.#currentUser;
    }

    /**
     * Retourne si l'utilisateur est connecté ou non
     * @returns {boolean} true si un utilisateur est connecté, false sinon
     */
    static isConnected() {
        return this.CurrentUser !== null;
    }

    /**
     * Sauvegarde l'utilisateur dans le localStorage
     * @param {User} user utilisateur à sauvegarder dans le localStorage
     */
    static toLocalStorage(user) {
        let data = {};
        user.props.forEach(prop => { data[prop] = user[prop]; });
        localStorage.setItem("user", JSON.stringify(data));
    }

    /**
     * Charge un utilisateur depuis le localStorage
     * @returns {User} l'utilisateur récupéré depuis le localStorage
     */
    static fromLocalStorage() {
        const data = JSON.parse(localStorage.getItem("user"));
        if (data) {
            // on recupe les infos de l'utilisateur depuis le localStorage
            const user = new User(data);

            // on recupere les infos de l'utilisateur depuis l'API
            // (pour etre sur qu'il n'a pas ete supprime et pour etre a jour)
            user.fetchInformations().then(() => {
                user.save(); // on sauvegarde les infos de l'utilisateur dans le localStorage
            }).catch(err => {
                // si l'utilisateur n'existe plus, on le deconnecte
                User.disconnect();
                window.location.href = window.location.origin;
            });
            return user;
        }
        return null;
    }

    /**
     * Déconnecte l'utilisateur courant
     */
    static disconnect() {
        localStorage.removeItem("user");
        localStorage.removeItem("hide-migrate-popup");
        User.#currentUser = null;
    }

    id;
    login;
    firstname;
    lastname;
    birthdate;
    email;
    city;
    zip;
    address;
    gender;
    token;
    level;
    favorites = [];
    props = ["id", "login", "firstname", "lastname", "birthdate", "email", "city", "zip", "address", "gender", "token", "favorites", "level"];
    constructor(infos) {
        this.setProps(infos);

        User.#currentUser = this;
    }

    /**
     * Assigne les nouvelles informations donnees a l'utilisateur
     * @param {object} infos informations a mettre a jour dans l'utilisateur
     */
    setProps(infos) {
        this.props.forEach(prop => { this[prop] = infos[prop] ?? this[prop]; });
    }

    /**
     * Recupere les informations de l'utilisateur depuis l'API
     * @returns une promise qui retourne l'utilisateur une fois les informations récupérées
     */
    fetchInformations() {
        return new Promise((resolve, reject) => {
            if (this.token === "") { // pas de token, pas de chocolat !
                reject("Aucun jeton utilisateur");
                return;
            }

            let counter = 0;
            // Fonction permttant de verifier si les deux requetes sont terminees
            const checkForResolve = () => { if (++counter >= 2) resolve(this); };

            // Recupere les informations de l'utilisateur
            API.execute_logged("/users/me", API.METHOD.GET, this.token).then(res => {
                // On mets gender a la valeur de gender_id, pour avoir l'id au lieu du nom
                res.gender = res.gender_id ?? res.gender;
                this.setProps(res); // On mets a jour les informations de l'utilisateur
                checkForResolve();
            }).catch(reject);

            // Recupere les favoris de l'utilisateur
            this.fetchFavorites().then(checkForResolve).catch(reject);
        });
    }

    /**
     * Recupere les favoris de l'utilisateur depuis l'API
     * @returns une promise qui retourne les favoris de l'utilisateur une fois les informations récupérées
     */
    fetchFavorites() {
        return new Promise((resolve, reject) => {
            if (this.token === "") { // pas de token, pas de chocolat !
                reject("Aucun jeton utilisateur");
                return;
            }

            // Recupere les favoris de l'utilisateur
            API.execute_logged("/users/me/favorites", API.METHOD.GET, this.token).then(res => {
                this.favorites = res.map(el => parseInt(el.id));
                resolve(this.favorites);
            }).catch(err => reject(err));
        });
    }

    /**
     * Sauvegarde les informations de l'utilisateur dans le localStorage
     */
    save() {
        User.#currentUser = this;
        User.toLocalStorage(this);
    }
}

window.User = User;
export default User;