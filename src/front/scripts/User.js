class User {
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
        localStorage.setItem("user", JSON.stringify(user));
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

    firstname = "";
    lastname = "";
    email = "";
    constructor(infos) {
        this.firstname = infos.firstname ?? "";
        this.lastname = infos.lastname ?? "";
        this.email = infos.email ?? "";
        User.#currentUser = this;
    }

    getFullName() {
        return this.firstname + " " + this.lastname;
    }

    getEmail() {
        return this.email;
    }

    save() {
        User.#currentUser = this;
        User.toLocalStorage(this);
    }
}

export default User;