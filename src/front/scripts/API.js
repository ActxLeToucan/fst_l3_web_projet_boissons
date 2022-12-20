class Credentials {
    static get TYPE() {
        return {
            UNKNOWN: 0,
            TOKEN: 1,
            CREDENTIALS: 2
        };
    }

    static fromToken(token) {
        return new Credentials({token: token, type: Credentials.TYPE.TOKEN});
    }

    static fromCredentials(username, password) {
        return new Credentials({username: username, password: password, type: Credentials.TYPE.CREDENTIALS});
    }

    token = "";
    username = "";
    password = "";
    type = Credentials.TYPE.UNKNOWN;

    constructor(infos) {
        this.token = infos.token ?? this.token;
        this.username = infos.username ?? this.username;
        this.password = infos.password ?? this.password;
        this.type = infos.type ?? this.type;
    }

    isValid() {
        return this.type != Credentials.TYPE.UNKNOWN;
    }

    getToken() {
        return this.token;
    }

    getUsername() {
        return this.username;
    }

    getPassword() {
        return this.password;
    }
}

class API {
    static Credentials = Credentials;

    // API constants
    static API_URL = '';
    static get METHOD() {
        return {
            GET: "GET",
            PUT: "PUT",
            POST: "POST",
            PATCH: "PATCH",
            DELETE: "DELETE"
        };
    }
    static get TYPE() {
        return {
            FORM: "application/x-www-form-urlencoded",
            JSON: "application/json",
            FILE: "multipart/form-data",
            NONE: undefined
        }
    }
    static get AuthorizationHeader() { return "x-furwaz-auth"; };

    // API routes
    static ROUTE = {
        LOGIN: "/auth/token",
        RESET: "/auth/reset",
        PASSWORD: "/auth/password",
        ME: "/users/me",
        USERS: "/users"
    };

    /**
     * Makes an API call with the specified parameters
     * @param {string} path API call url path (see API.ROUTES for possible routes)
     * @param {string} method API call method (see API.METHOD for possible values)
     * @param {object|string} body API call body (data to send, ignored if METHOD.GET is used)
     * @param {string} type API call data type (see API.TYPE for possible values))  
     * @param {object[]}} headers API call additionnal headers
     * @returns a promise resolving when the API call is done
     */
    static execute(path, method = this.METHOD.GET, body = {}, type = this.TYPE.JSON) {
        return new Promise((resolve, reject) => {
            path = path.replace("/?", "?").replaceAll("//", "/");
            let urlparts = path.split("?");
            let base = urlparts.splice(0, 1);
            let params = (urlparts.length > 0)? ("?" + urlparts.join("&")) : "";
            path = base + params;

            let reqHeaders = {
                "User-Agent": navigator.userAgent,
                "Accept": "application/json",
                "Accept-Language": "fr,fr-FR"
            };

            let reqBody = {};
            if (body && type != this.TYPE.FILE) {
                switch (typeof (body)) {
                    case "string":
                        if (body.startsWith("{") && body.endsWith("}"))
                            body = JSON.parse(body);
                    // pas de break, pour faire le traitement "object" suivant
                    case "object":
                        if (type == this.TYPE_FORM)
                            reqBody = new URLSearchParams(body).toString();
                        else reqBody = JSON.stringify(body);
                        break;
                    default: break;
                }
            }

            if (API.API_URL == "" || API.API_URL == undefined) {
                API.API_URL = window.location.origin + "/api";
            }
            
            fetch(API.API_URL + path, {
                credentials: "omit",
                method: method,
                body: method == this.METHOD.GET ? undefined : reqBody,
                headers: reqHeaders,
                referrer: window.location.origin,
                mode: "cors"
            }).then(response => {
                if (response.status != 200)
                    reject(response);
                else {
                    response.json().then(data => {
                        resolve(data);
                    }).catch(err => reject(err));
                }
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Makes a logged API call with the specified parameters, using the specified credentials (token + token type / username + password)
     * @param {string} path API call url path (see API.ROUTES for possible routes)
     * @param {string} method API call method (see API.METHOD for possible values)
     * @param {Credentials} credentials API call credentials to use (use User.currentUser.getCredentials() to get the current user's credentials)
     * @param {object|string} body API call body (data to send, ignored if METHOD.GET is used)
     * @param {string} type API call data type (see API.TYPE for possible values))
     * @param {object[]} headers API call additionnal headers
     * @returns A promise resolving when the API call is done
     */
    static execute_logged(path, method = API.METHOD.GET, token, body = {}, type = this.TYPE.JSON) {
        return new Promise((resolve, reject) => {
            if (!token) {
                reject({status: -1, message: "Please provide token"});
                return;
            }

            this.execute(createParam(path, "token", token), method, body, type).then(resolve).catch(reject);
        });
    }

    static createParam(query, name, value) {
        if (value == undefined || value == null) return query;
        
        let hasParams = query.indexOf("?") != -1;
        return query + (hasParams ? "&" : "?") + name + "=" + value;
    }
}

window.API = API; // for debug purposes
export default API;