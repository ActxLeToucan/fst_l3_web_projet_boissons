import API from "./API.js";

class User {
    /**@type {User} */
    static #currentUser = null;

    static get CurrentUser() {
        if (User.#currentUser == null) {
            User.#currentUser = User.fromLocalStorage();
        }
        return User.#currentUser;
    }

    static isConnected() {
        return this.CurrentUser !== null;
    }

    static toLocalStorage(user) {
        localStorage.setItem("user", JSON.stringify({
            firstname:  user.firstname,
            lastname:   user.lastname,
            email:      user.email,
            favorites:  user.favorites
        }));
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
    favorites;
    props = ["id", "login", "firstname", "lastname", "birthdate", "email", "city", "zip", "address", "gender", "token", "favorites"];
    constructor(infos) {
        this.setProps(infos);

        User.#currentUser = this;
    }

    setProps(infos) {
        this.props.forEach(prop => { this[prop] = infos[prop]; });
    }

    fetchInformations() {
        return new Promise((resolve, reject) => {
            if (this.token === "") {
                reject("Aucun jeton utilisateur");
                return;
            }

            API.execute_logged("/users/me", API.METHOD.GET, this.token).then(res => {
                this.setProps(res);
                resolve(this);
            }).catch(reject);
        });
    }

    save() {
        User.#currentUser = this;
        User.toLocalStorage(this);
    }
}

export default User;