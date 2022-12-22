import API from "./API.js";

class User {
    /**@type {User} */
    static #currentUser = null;

    static get CurrentUser() {
        if (!User.#currentUser) {
            User.#currentUser = User.fromLocalStorage();
        }
        return User.#currentUser;
    }

    static isConnected() {
        return this.CurrentUser !== null;
    }

    static toLocalStorage(user) {
        let data = {};
        user.props.forEach(prop => { data[prop] = user[prop]; });
        localStorage.setItem("user", JSON.stringify(data));
    }

    static fromLocalStorage() {
        const data = JSON.parse(localStorage.getItem("user"));
        if (data)
            return new User(data);
        return null;
    }

    static disconnect() {
        localStorage.removeItem("user");
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
    favorites = [];
    props = ["id", "login", "firstname", "lastname", "birthdate", "email", "city", "zip", "address", "gender", "token", "favorites", "token"];
    constructor(infos) {
        this.setProps(infos);

        User.#currentUser = this;
    }

    setProps(infos) {
        this.props.forEach(prop => { this[prop] = infos[prop] ?? this[prop]; });
    }

    fetchInformations() {
        return new Promise((resolve, reject) => {
            if (this.token === "") {
                reject("Aucun jeton utilisateur");
                return;
            }

            let counter = 0;
            const checkForResolve = () => { if (++counter >= 2) resolve(this); };

            API.execute_logged("/users/me", API.METHOD.GET, this.token).then(res => {
                // set gender to gender_id is possible (to get int instead of string)
                res.gender = res.gender_id ?? res.gender;
                this.setProps(res);
                checkForResolve();
            }).catch(reject);

            this.fetchFavorites().then(checkForResolve).catch(reject);
        });
    }

    fetchFavorites() {
        return new Promise((resolve, reject) => {
            API.execute_logged("/users/me/favorites", API.METHOD.GET, this.token).then(res => {
                this.favorites = res.map(el => parseInt(el.id));
                resolve();
            }).catch(err => reject(err));
        });
    }

    save() {
        User.#currentUser = this;
        User.toLocalStorage(this);
    }
}

window.User = User;
export default User;