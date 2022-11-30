class User {
    static #currentUser = null;

    static get CurrentUser() {
        return this.#currentUser;
    }

    static isConnected() {
        return this.#currentUser !== null;
    }

    firstname = "";
    lastname = "";
    email = "";
    constructor() {
        this.firstname = "firstname";
        this.lastname = "lastname";
        this.email = "email";
        User.#currentUser = this;
    }

    getFullName() {
        return this.firstname + " " + this.lastname;
    }

    getEmail() {
        return this.email;
    }
}

export default User;