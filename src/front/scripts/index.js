import { initHeader } from "./header.js";
import { checkForMigration } from "./favorites.js";

onload = () => {
    initHeader();
    checkForMigration();
}