/*
/*
====================================================
SMART STUDY PLANNER - LOGIN PAGE MODULE
====================================================

Purpose:
Handles user registration and login from the
landing page before redirecting users to
the main dashboard.

Author: Fernando Nathali
=========================================================
*/

if (localStorage.getItem("currentUser")) {
    window.location.href = "dashboard.html";
}

// Registers a new user account.
function register() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const message =
        document.getElementById("loginMessage");

    if (password !== confirmPassword) {

        message.textContent =
            "Passwords do not match";

        message.style.color = "red";

        return;

    }

    const users =
        JSON.parse(localStorage.getItem("users"))
        || {};

    if (users[email]) {

        message.textContent =
            "User already exists";

        message.style.color = "orange";

        return;

    }

    users[email] = {
        password: password
    };

    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );

    message.textContent =
        "Registration successful";

    message.style.color = "lightgreen";

}

// Authenticates an existing user and
// redirects to the dashboard.
function login() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("loginMessage");

    const users =
        JSON.parse(localStorage.getItem("users"))
        || {};

    if (
        !users[email] ||
        users[email].password !== password
    ) {

        message.textContent =
            "Invalid credentials";

        message.style.color = "red";

        return;

    }

    localStorage.setItem(
        "currentUser",
        email
    );

    window.location.href =
        "dashboard.html";

}