/*
====================================================
SMART STUDY PLANNER - AUTHENTICATION MODULE
====================================================

Description:
Handles user authentication and session management
for the Smart Study Planner application.

Responsibilities:
• User registration
• Secure password storage
• Login and logout
• Session persistence using Local Storage
• User-specific task loading and saving
• Profile information updates

Author: Fernando Nathali
====================================================
*/

"use strict";

// -------------------------------------------------
// Authentication state
// -------------------------------------------------

// Stores all registered users and their associated data.
let users;

try {
    users = JSON.parse(localStorage.getItem("users")) || {};
}
catch {
    users = {};
}

let currentUser = localStorage.getItem("currentUser") || null;

let loginAttempts = 0;

/**
 * Creates a new user account after validating
 * the email address and password.
 *
 * A personal task list is also initialized for
 * every new user.
 */
function registerUser() {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        showToast("Invalid email");
        return;
    }

    if (!email || !password) {
        showToast("Enter email and password");
        return;
    }

    if (users[email]) {
        showToast("User already exists");
        return;
    }

    if (password.length < 6) {
        showToast("Password must be at least 6 characters");
        return;
    }

    users[email] = {
        password: hashPassword(password),
        tasks: []
    };

    localStorage.setItem("users", JSON.stringify(users));

    currentUser = email;
    localStorage.setItem("currentUser", email);

    tasks = [];

    updateCurrentUserUI();
    refreshDashboard();

    document.getElementById("email").value = "";
    document.getElementById("password").value = "";

    showToast("Account created successfully ðŸŽ‰");
}

/**
 * Authenticates an existing user.
 *
 * Successful authentication restores the user's
 * saved tasks and redirects to the dashboard.
 */
function loginUser() {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (loginAttempts >= 3) {
        showToast("Too many failed attempts");
        return;
    }

    if (!users[email]) {
        loginAttempts++;
        showToast("User not found");
        return;
    }

    const hashedPassword = hashPassword(password);

    if (users[email].password !== hashedPassword) {
        loginAttempts++;
        showToast("Incorrect password");
        return;
    }

    loginAttempts = 0;

    currentUser = email;

    localStorage.setItem("currentUser", email);

    loadUserTasks();

    updateCurrentUserUI();

    document.getElementById("email").value = "";
    document.getElementById("password").value = "";

    showToast("Login successful ✅");

    window.location.href = "dashboard.html";

}

/**
 * Logs the current user out of the application.
 *
 * User tasks are saved before the session is
 * terminated.
 */
function logoutUser() {

    if (!confirm("Logout from account?")) {
        return;
    }

    saveTasks();              // Save the latest tasks

    currentUser = null;
    tasks = [];

    localStorage.removeItem("currentUser");

    window.location.replace("index.html");

}

/**
 * Loads all tasks belonging to the currently
 * authenticated user.
 */
function loadUserTasks() {

    if (currentUser && users[currentUser]) {
        tasks = users[currentUser].tasks || [];
    }
    else {
        tasks = [];
    }

    refreshDashboard();
}

/**
 * Saves the current task list into the user's
 * account stored in Local Storage.
 */
function saveTasks() {

    if (currentUser && users[currentUser]) {

        users[currentUser].tasks = tasks;

        localStorage.setItem(
            "users",
            JSON.stringify(users)
        );
    }
}

/**
 * Updates the profile area with the current
 * user's information.
 *
 * Only the part of the email before '@' is
 * displayed as the profile name.
 */
function updateCurrentUserUI() {

    const profileSection =
        document.getElementById("profileSection");

    const profileName =
        document.getElementById("profileName");

    const currentUserDisplay =
        document.getElementById("currentUserDisplay");

    if (profileSection) {

        if (currentUser) {

            profileSection.style.display = "block";

            // Show only the part before @
            const displayName = currentUser.split("@")[0];

            if (profileName) {
                profileName.textContent = displayName;
            }

            if (currentUserDisplay) {
                currentUserDisplay.textContent =
                    "Logged in as: " + currentUser;
            }

        }
        else {

            profileSection.style.display = "none";

        }

    }

}

/**
 * Opens or closes the profile dropdown menu.
 */
function toggleProfileMenu() {

    const menu = document.getElementById("profileMenu");

    if (menu.style.display === "block") {
        menu.style.display = "none";
    }
    else {
        menu.style.display = "block";
    }
}

// Close menu when clicking outside
document.addEventListener("click", function (event) {

    const menu = document.getElementById("profileMenu");
    const icon = document.querySelector(".profile-icon");

    if (!menu || !icon) {
        return;
    }

    if (
        !menu.contains(event.target) &&
        !icon.contains(event.target)
    ) {
        menu.style.display = "none";
    }
});

/**
 * Restores the previous user session when the
 * application starts.
 */
document.addEventListener("DOMContentLoaded", () => {

    if (currentUser) {
        loadUserTasks();
    }

    updateCurrentUserUI();

});

let inactivityTimer;

// -------------------------------------------------
// Automatic Session Timeout
// -------------------------------------------------

/**
 * Automatically logs the user out after
 * fifteen minutes of inactivity.
 *
 * This improves session security.
 */
function resetInactivityTimer() {

    clearTimeout(inactivityTimer);

    inactivityTimer = setTimeout(() => {

        currentUser = null;
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";

    }, 15 * 60 * 1000);

}

document.addEventListener(
    "mousemove",
    resetInactivityTimer
);

document.addEventListener(
    "keypress",
    resetInactivityTimer
);

resetInactivityTimer();