import { initHeader } from "./header.js";
import User from "./User.js";

onload = () => {
    initHeader();
    if (!User.isConnected()) {
        window.location.href = window.location.origin;
        return;
    }

    setup();
}

function setup() {
    const firtname_input = document.querySelector("input[name='firstname']");
    const lastname_input = document.querySelector("input[name='lastname']");
    const email_input = document.querySelector("input[name='email']");
    const disconnect_btn = document.getElementById("disconnect-btn");

    const user = User.CurrentUser;
    firtname_input.value = user.firstname;
    lastname_input.value = user.lastname;
    email_input.value = user.email;

    disconnect_btn.addEventListener("click", () => {
        User.disconnect();
        window.location.href = window.location.origin;
    });
}