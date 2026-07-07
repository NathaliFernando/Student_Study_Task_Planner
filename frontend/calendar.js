/*
====================================================
SMART STUDY PLANNER - CALENDAR MODULE
====================================================

Description:
Displays study tasks in an interactive calendar
using the FullCalendar library.

Responsibilities:
• Calendar rendering
• Event generation
• Event interaction
• Date selection
• Today's study schedule

Author: Fernando Nathali
====================================================
*/

"use strict";

/**
 * Creates or refreshes the interactive study
 * calendar using the current task list.
 *
 * Tasks are colour-coded according to their
 * calculated priority level.
 */
function renderCalendar() {

    const calendarEl = document.getElementById("calendar");

    if (!calendarEl) return;

    if (tasks.length === 0) {

        calendarEl.innerHTML = `
<div class="empty-state">
    <i class="fa-solid fa-calendar-xmark"></i>
    <p>No calendar events available 📅</p>
</div>
`;

        return;
    }

    // Convert application tasks into FullCalendar events.
    const events = tasks
        .filter(task => task.deadline)
        .map(task => {

            let color = "#4caf50";

            if (task.priority === "HIGH") color = "#e53935";
            else if (task.priority === "MEDIUM") color = "#fbc02d";

            return {
                title: task.title + " (" + task.course + ")",
                start: task.deadline + "T" + (task.taskTime || "09:00"),
                backgroundColor: color,
                borderColor: color
            };

        });

    // Remove the existing calendar before rendering a new one.
    if (calendar) {
        calendar.destroy();
    }

    calendarEl.innerHTML = "";

    // Initialize the FullCalendar component.
    calendar = new FullCalendar.Calendar(calendarEl, {

        initialView: "dayGridMonth",

        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
        },

        editable: true,

        selectable: true,

        // Allow users to select a date directly from the calendar.
        select: function (info) {

            document.getElementById("deadline").value =
                info.startStr;

            openTab("tasks");

            showToast("Selected date added ✅");

        },

        customButtons: {
            today: {
                text: "Today",
                click: function () {

                    calendar.today();

                    generateTodaySchedule();

                }
            }
        },

        eventDisplay: "block",

        slotMinTime: "08:00:00",
        slotMaxTime: "22:00:00",
        allDaySlot: false,

        events: events,

        displayEventTime: false,

        // Allow the displayed event title to be edited.
        eventClick: function (info) {

            const title =
                prompt("Edit task title", info.event.title);

            if (title) {

                info.event.setProp("title", title);

            }

        },

        // Display all tasks scheduled for the selected date.
        dateClick: function (info) {

            const todayTasks = tasks.filter(task => {

                return task.deadline === info.dateStr;

            });

            if (todayTasks.length === 0) {

                showToast("No tasks for this day");

                return;

            }

            let message = "";

            todayTasks.forEach(task => {

                message +=
                    `${task.title} (${task.course})\n`;

            });

            alert(message);

        },

        // Add a small hover animation for better user experience.
        eventMouseEnter: function (info) {

            info.el.style.transform = "scale(1.05)";
            info.el.style.transition = "0.2s";

        },

        eventMouseLeave: function (info) {

            info.el.style.transform = "scale(1)";

        }

    });

    // Display the completed calendar.
    calendar.render();

}

/**
 * Generates a simplified schedule containing
 * only today's study tasks.
 */
function generateTodaySchedule() {

    const today =
        new Date().toISOString().split("T")[0];

    const todayTasks = tasks.filter(task =>
        task.deadline === today
    );

    let html = "";

    if (todayTasks.length === 0) {

        html = `
<p>No tasks scheduled today 🎉</p>
`;

    }
    else {

        todayTasks.forEach(task => {

            html += `

<div class="today-task-card">

<div class="today-time">
9:00 AM - 11:00 AM
</div>

<div>

<h4>${task.title}</h4>

<p>${task.course}</p>

</div>

</div>

`;

        });

    }

    document.getElementById("todaySchedule")
        .innerHTML = html;

}