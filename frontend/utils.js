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

function showToast(message){

const toast = document.createElement("div");
toast.textContent = message;

toast.style.position = "fixed";
toast.style.bottom = "20px";
toast.style.right = "20px";
toast.style.background = "#333";
toast.style.color = "white";
toast.style.padding = "10px 15px";
toast.style.borderRadius = "8px";
toast.style.zIndex = "9999";

document.body.appendChild(toast);

setTimeout(()=>{
toast.remove();
}, 3000);

}

// =========================
// PASSWORD HASH
// =========================

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

function sendNotification(title, message){

if(Notification.permission === "granted"){
new Notification(title, {
body: message
});
}

}