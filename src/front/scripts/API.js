/**
 * Classe API, construite pour faciliter les requetes vers l'API
 */
class API {
    // Constantes pour la classe API (types de requetes, types de fichiers, etc...)
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

    /**
     * Fais un appel a l'API avec les parametres passes en parametres
     * @param {string} path Route de l'API a appeler
     * @param {string} method Methode HTTP a utiliser (voir API.METHOD pour les valeurs possibles)
     * @param {object|string} body Corps de la requete
     * @param {string} type Type de la requete (voir API.TYPE pour les valeurs possibles)
     * @param {object[]}} headers Headers a ajouter a la requete
     * @returns {Promise} Promise de la requete
     */
    static execute(path, method = this.METHOD.GET, body = {}, type = this.TYPE.JSON, headers = {}) {
        return new Promise((resolve, reject) => {
            // On nettoie le path et on y ajoute l'URL de l'API
            path = path.replace("/?", "?").replaceAll("//", "/");
            let urlparts = path.split("?");
            let base = urlparts.splice(0, 1);
            let params = (urlparts.length > 0)? ("?" + urlparts.join("&")) : "";
            path = base + params;

            // On cree les headers de la requete
            let reqHeaders = {
                "User-Agent": navigator.userAgent,
                "Accept": "application/json",
                "Content-Type": type,
                "Accept-Language": "fr"
            };

            // Si des headers sont passes en parametres, on les ajoute a la requete
            if (headers)
                for (let key in headers)
                    reqHeaders[key] = headers[key];

            // On créé le body de la requete depuis le body passe en parametres (ca peut etre un string, object, ...)
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

            // On ajoute l'URL de l'API si elle n'est pas definie
            if (API.API_URL == "" || API.API_URL == undefined) {
                API.API_URL = window.location.origin + "/api";
            }

            // Callback de gestion des erreurs
            const handleError = (err) => {
                if (!err.json) reject(err);
                else err.json().then(error => {
                    if (error.error)
                        reject(error.error);
                    else reject(err);
                }).catch(error => reject(err));
            };
            
            // On fait la requete a l'API
            fetch(API.API_URL + path, {
                credentials: "omit",
                method: method,
                body: method == this.METHOD.GET ? undefined : reqBody,
                headers: reqHeaders,
                referrer: window.location.origin,
                mode: "cors"
            }).then(response => {
                //si la reponse n'est pas 200, on gere l'erreur
                if (response.status != 200)
                    handleError(response);
                else {
                    // sinon on renvoie la reponse en json
                    response.json().then(data => {
                        resolve(data);
                    }).catch(err => handleError(err));
                }
            }).catch(err => {
                // erreur, on gere l'erreur
                handleError(err);
            });
        });
    }

    /**
     * Fais un appel a l'API avec les parametres passes en parametres, en utilisant le token de l'utilisateur
     * @param {string} path Route de l'API a appeler
     * @param {string} method Methode HTTP a utiliser (voir API.METHOD pour les valeurs possibles)
     * @param {string} token Token de l'utilisateur
     * @param {object|string} body Corps de la requete
     * @param {string} type Type de la requete (voir API.TYPE pour les valeurs possibles)
     */
    static execute_logged(path, method = API.METHOD.GET, token, body = {}, type = this.TYPE.JSON) {
        return new Promise((resolve, reject) => {
            // si le token n'est pas defini, on renvoie une erreur
            if (!token) {
                reject({status: -1, message: "Please provide token"});
                return;
            }

            // Sinon on fais un appel classique avec le token en header
            this.execute(path, method, body, type, {token: token}).then(resolve).catch(reject);
        });
    }

    /**
     * Ajoute un parametre au lien donne
     * @param {String} query lien de la requete
     * @param {String} name nom du parametre
     * @param {String} value valeur du parametre
     * @returns le nouveau lien avec le parametre ajoute
     */
    static createParam(query, name, value) {
        // si le parametre n'est pas defini, on renvoie le lien sans modification
        if (value == undefined || value == null) return query;
        
        // Sinon on ajoute le parametre au lien (si il en a deja, on ajoute un &, sinon on ajoute un ?)
        let hasParams = query.indexOf("?") != -1;
        return query + (hasParams ? "&" : "?") + name + "=" + value;
    }
}

export default API;