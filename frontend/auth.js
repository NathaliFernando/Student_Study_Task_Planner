/*
=========================================
SMART STUDY PLANNER - AUTHENTICATION
=========================================

Features:
- User registration
- User login/logout
- Password encoding
- Session persistence
- User-specific task storage

Author: Fernando Nathali
=========================================
*/

// =========================
// AUTHENTICATION SYSTEM
// =========================

"use strict";

let users;

try{
users = JSON.parse(localStorage.getItem("users")) || {};
}
catch{
users = {};
}

let currentUser = localStorage.getItem("currentUser") || null;

let loginAttempts = 0;

// =========================
// REGISTER USER
// =========================

function registerUser(){

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if(!username || !password){
        showToast("Enter username and password");
        return;
    }

    if(users[username]){
        showToast("User already exists");
        return;
    }

    users[username] = {
        password: hashPassword(password),
        tasks: []
    };

    localStorage.setItem("users", JSON.stringify(users));

    currentUser = username;
    localStorage.setItem("currentUser", username);

    tasks = [];

    updateCurrentUserUI();
    refreshDashboard();

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

    showToast("Account created successfully 🎉");
}

// =========================
// LOGIN USER
// =========================

function loginUser(){

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if(loginAttempts >= 3){
        showToast("Too many failed attempts");
        return;
    }

    if(!users[username]){
        loginAttempts++;
        showToast("User not found");
        return;
    }

    const hashedPassword = hashPassword(password);

    if(users[username].password !== hashedPassword){
        loginAttempts++;
        showToast("Incorrect password");
        return;
    }

    loginAttempts = 0;

    currentUser = username;

    localStorage.setItem("currentUser", username);

    loadUserTasks();

    updateCurrentUserUI();

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

    showToast("Login successful ✅");
}

// =========================
// LOGOUT USER
// =========================

function logoutUser(){

    if(!confirm("Logout from account?")){
        return;
    }

    currentUser = null;

    tasks = [];

    localStorage.removeItem("currentUser");

    updateCurrentUserUI();

    refreshDashboard();

    showToast("Logged out successfully");
}

// =========================
// LOAD USER TASKS
// =========================

function loadUserTasks(){

console.log("loadUserTasks running");

    if(currentUser && users[currentUser]){
        tasks = users[currentUser].tasks || [];
    }
    else{
        tasks = [];
    }

    refreshDashboard();
}

// =========================
// SAVE TASKS
// =========================

function saveTasks(){

    if(currentUser && users[currentUser]){

        users[currentUser].tasks = tasks;

        localStorage.setItem(
            "users",
            JSON.stringify(users)
        );
    }
}

// =========================
// UPDATE UI
// =========================

function updateCurrentUserUI(){

    const authSection =
        document.getElementById("authSection");

    const profileSection =
        document.getElementById("profileSection");

    const profileName =
        document.getElementById("profileName");

    const currentUserDisplay =
        document.getElementById("currentUserDisplay");

    if(currentUser){

        authSection.style.display = "none";

        profileSection.style.display = "block";

        profileName.textContent = currentUser;

        currentUserDisplay.textContent =
            "Logged in as: " + currentUser;
    }
    else{

        authSection.style.display = "flex";

        profileSection.style.display = "none";

        currentUserDisplay.textContent = "";
    }
}

// =========================
// PROFILE MENU
// =========================

function toggleProfileMenu(){

    const menu = document.getElementById("profileMenu");

    if(menu.style.display === "block"){
        menu.style.display = "none";
    }
    else{
        menu.style.display = "block";
    }
}

// Close menu when clicking outside
document.addEventListener("click", function(event){

    const menu = document.getElementById("profileMenu");
    const icon = document.querySelector(".profile-icon");

    if(!menu || !icon){
        return;
    }

    if(
        !menu.contains(event.target) &&
        !icon.contains(event.target)
    ){
        menu.style.display = "none";
    }
});

// =========================
// AUTO LOGIN
// =========================

if(currentUser){
    loadUserTasks();
}

updateCurrentUserUI();
