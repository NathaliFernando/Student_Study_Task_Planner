/*
====================================================
SMART STUDY PLANNER - UTILITY FUNCTIONS MODULE
====================================================

Purpose:
Provides reusable helper functions used throughout the
application, including toast messages, password encoding
and browser notification permission handling.

Author: Fernando Nathali
=========================================================
*/

"use strict";

// Displays a temporary toast notification to provide
// feedback for user actions.
function showToast(message) {

    // Create a toast notification element.
    const toast = document.createElement("div");

    toast.classList.add("toast");

    toast.textContent = message;

    document.body.appendChild(toast);

    // Automatically remove the notification
    // after three seconds.
    setTimeout(() => {
        toast.remove();
    }, 3000);

}

// =====================================================
// PASSWORD ENCODING
// =====================================================
//
// Note:
// Base64 encoding is used solely for educational purposes
// within this university project. Production applications
// should use secure password hashing algorithms such as
// bcrypt, Argon2 or PBKDF2.

// Encodes a user's password before storing it in
// Local Storage.
function hashPassword(password) {
    return btoa(password);
}

// Requests permission from the browser to allow
// desktop notifications.
function requestNotificationPermission() {

    // Verify that the browser supports notifications.
    if ("Notification" in window) {

        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

    }

}