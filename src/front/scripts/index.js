import { initHeader } from "./header.js";
import { checkForMigration } from "./favorites.js";

// Evenement au chargement de la page
onload = () => {
    // Initialisation du header
    initHeader();
    // Verification de la migration des favoris
    checkForMigration();
}