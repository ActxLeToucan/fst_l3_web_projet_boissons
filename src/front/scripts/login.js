import { initHeader } from "./header.js";
import User from "./User.js";

onload = () => {
    initHeader();
    setup();
}

function setup() {
    const continue_btn = document.getElementById("continue-btn");
    continue_btn.addEventListener("click", () => {
        new User({firstname: "John", lastname: "Doe", email: "john.doe@gmail.com"}).save();
        window.location.href = "/index.html";
    });
}