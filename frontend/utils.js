/*
=========================================
SMART STUDY PLANNER - UTILITIES
=========================================

Features:
- Toast notifications
- Browser notifications
- Notification permission handling
- Password encoding utility
- Reusable helper functions

Author: Fernando Nathali
=========================================
*/

"use strict";

function showToast(message){

const toast = document.createElement("div");

toast.classList.add("toast");

toast.textContent = message;

document.body.appendChild(toast);

setTimeout(()=>{
toast.remove();
},3000);

}

// SIMPLE PASSWORD ENCODING
// NOTE:
// This is for educational purposes only.
// Real applications should use secure hashing.

function hashPassword(password){
    return btoa(password);
}

function requestNotificationPermission(){

if("Notification" in window){

if(Notification.permission !== "granted"){
Notification.requestPermission();
}

}

}