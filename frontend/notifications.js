/*
====================================================
SMART STUDY PLANNER - NOTIFICATIONS MODULE
====================================================

Purpose:
Generates browser notifications, deadline reminders,
overdue alerts and workload recommendations.

Author: Fernando Nathali
=========================================================
*/

"use strict";

// Generates notification messages based on
// task deadlines, workload and study progress.
function generateNotifications() {

    const container = document.getElementById("notifications");

    if (!container) return;

    container.innerHTML = "";

    const today = new Date();

    let totalStudyHours = 0;

    tasks.forEach(task => {

        if (task.completed) return;

        // Calculate total workload
        totalStudyHours += parseFloat(task.studyHours) || 0;

        // Deadline checks
        if (task.deadline) {

            const dueDate = new Date(task.deadline);
            const daysLeft = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

            const p = document.createElement("p");

            if (daysLeft < 0) {
                p.innerHTML = `❌ <strong>${task.title}</strong> is overdue!`;
                p.style.color = "red";
                container.appendChild(p);
            }

            else if (daysLeft <= 2) {
                p.innerHTML = `⚠ <strong>${task.title}</strong> due in ${daysLeft} day(s)`;
                p.style.color = "orange";
                container.appendChild(p);
            }

            if (daysLeft < 0) {
                sendNotification("Overdue Task", task.title + " is overdue!");
            }

            if (daysLeft <= 2 && !alreadyNotified(task.title)) {
                sendNotification("Upcoming Task", task.title + " is due soon!");
                markNotified(task.title);
            }

        }

    });

    // Workload warning
    if (totalStudyHours > DAILY_LIMIT * 2) {

        const p = document.createElement("p");

        p.innerHTML = `🔥 High workload detected. Consider spreading tasks.`;
        p.style.color = "crimson";

        container.appendChild(p);

    }

    // Daily motivation / reminder
    if (tasks.length > 0) {

        const p = document.createElement("p");

        p.innerHTML = `📅 Stay consistent! Focus on today's top priorities.`;

        container.appendChild(p);

    }

}

// Sends a browser notification if permission
// has already been granted.
function sendNotification(title, message) {

    if (Notification.permission === "granted") {
        new Notification(title, {
            body: message
        });
    }

}

// Requests permission from the browser to
// display notifications.
function enableNotifications() {

    if (!("Notification" in window)) {
        showModal("Notifications not supported");
        return;
    }

    // Already granted → NO popup
    if (Notification.permission === "granted") {
        console.log("Already enabled");
        return;
    }

    Notification.requestPermission().then(permission => {

        if (permission === "granted") {
            showToast("Notifications enabled successfully ✅");
        }
        else {
            showModal("Permission denied ❌");
        }

    });

}

// Displays instructions for disabling browser
// notifications manually.
function disableNotifications() {

    showToast(
        "Disable notifications from browser settings."
    );

}

// Opens or closes the notification panel.
function toggleNotifications() {

    const panel =
        document.getElementById("notificationPanel");

    if (panel.style.display === "block") {
        panel.style.display = "none";
    }
    else {

        generateNotificationsPanel();

        panel.style.display = "block";

    }

}

// Displays overdue tasks inside the
// notification panel.
function generateNotificationsPanel() {

    const panel =
        document.getElementById("notificationPanel");

    panel.innerHTML = `
<h3>Notifications</h3>
`;

    const overdueTasks = tasks.filter(task => {

        if (task.completed) return false;

        if (!task.deadline) return false;

        return new Date(task.deadline) < new Date();

    });

    if (overdueTasks.length === 0) {

        panel.innerHTML += `
<p>✅ No urgent notifications</p>
`;

        return;

    }

    overdueTasks.forEach(task => {

        panel.innerHTML += `
<p>⚠ ${task.title} is overdue</p>
`;

    });

}