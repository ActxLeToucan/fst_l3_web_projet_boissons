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

    #firstname = "";
    #lastname = "";
    #email = "";
    #favorites = [];

    constructor(infos) {
        this.#firstname = infos.firstname ?? "";
        this.#lastname = infos.lastname ?? "";
        this.#email = infos.email ?? "";
        this.#favorites = infos.favorites ?? [];

        User.#currentUser = this;
    }

    get lastname() {
        return this.#lastname;
    }

    get firstname() {
        return this.#firstname;
    }

    get fullname() {
        return this.#firstname + " " + this.#lastname;
    }

    get email() {
        return this.#email;
    }

    get favorites() {
        return this.#favorites;
    }

    set favorites(val) {
        this.#favorites = val;
        this.save();
    }

    save() {
        User.#currentUser = this;
        User.toLocalStorage(this);
    }
}

export default User;