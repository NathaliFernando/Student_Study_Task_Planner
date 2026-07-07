/*
====================================================
SMART STUDY PLANNER - APPLICATION MODULE
====================================================

Description:
This file contains the core application logic of the
Smart Study Planner. It manages task creation,
dashboard updates, study scheduling, theme switching,
navigation, notifications and user interactions.

Responsibilities:
• Task management
• Priority calculation
• Dashboard updates
• Theme management
• Weekly timetable generation
• Navigation between sections
• Event listeners and application initialization

Author: Fernando Nathali
====================================================
*/

"use strict";

// -------------------------------------------------
// Global application state
// -------------------------------------------------

// Stores every study task of the currently logged-in user.
let tasks = [];
let tasks = [];
let currentFilter = "ALL";
let currentEditIndex = null;
let taskChart = null;
let categoryChart = null;
let studyHoursChart = null;
let calendar = null;
let notifiedTasks = JSON.parse(localStorage.getItem("notifiedTasks")) || [];

// -------------------------------------------------
// Study planning configuration
// -------------------------------------------------
const DAILY_LIMIT = 6;
const MAX_SESSION = 2;
const BREAK_TIME = 1;

// -------------------------------------------------
// Frequently accessed DOM elements
// -------------------------------------------------
const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const sortOption = document.getElementById("sortOption");
const themeToggle = document.getElementById("themeToggle");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");
const importBtn = document.getElementById("importBtn");
const menuToggle = document.getElementById("menuToggle");

// Redirect unauthenticated users back to the login page.
if (!localStorage.getItem("currentUser")) {
    window.location.href = "index.html";
}

/**
 * Switches between dashboard tabs.
 *  @param {string} tabName
 * @param {Event} event
 */
function openTab(tabName, event) {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(button => button.classList.remove("active"));

    const tab = document.getElementById(tabName);
    if (tab) {
        tab.classList.add("active");
    }

    if (event?.target) {
        event.target.classList.add("active");
    }
}

/**
 * Calculates task priority using a scoring system based on:
 * - Deadline urgency
 * - Estimated study hours
 * - Task category
 *
 * Returns both the priority level and numerical score.
 */
function calculatePriority(taskType, deadline, studyHours) {
    let score = 0;

    if (deadline) {
        const today = new Date();
        const dueDate = new Date(deadline);
        const daysLeft = (dueDate - today) / (1000 * 60 * 60 * 24);

        if (daysLeft <= 2) score += 50;
        else if (daysLeft <= 5) score += 30;
        else score += 10;
    }

    const hours = parseFloat(studyHours) || 0;

    if (hours >= 10) score += 30;
    else if (hours >= 5) score += 20;
    else score += 10;

    if (taskType === "Exam") score += 30;
    else if (taskType === "Assignment") score += 20;
    else if (taskType === "Quiz") score += 15;
    else score += 10;

    let priority = "LOW";
    if (score >= 70) priority = "HIGH";
    else if (score >= 40) priority = "MEDIUM";

    return { priority, score };
}

/**
 * Creates a new study task from the user input,
 * calculates its priority and refreshes every
 * dashboard component.
 */
function addTask(event) {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const course = document.getElementById("course").value.trim();
    const taskType = document.getElementById("taskType").value;
    const deadline = document.getElementById("deadline").value;
    const studyHours = document.getElementById("studyHours").value;
    const taskTime = document.getElementById("taskTime").value;
    const result = calculatePriority(taskType, deadline, studyHours);

    tasks.push({
        id: Date.now(),
        title,
        course,
        taskType,
        deadline,
        studyHours,
        taskTime,
        priority: result.priority,
        priorityScore: result.score,
        completed: false
    });

    saveTasks();
    refreshDashboard();
    form.reset();
}

/**
 * Switches between light and dark mode.
 * The selected theme is saved in local storage
 * so it persists after page reloads.
 */
function toggleTheme() {

    document.body.classList.toggle("dark-mode");

    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark-mode")
            ? "dark"
            : "light"
    );

    // Refresh ONLY the charts
    updateChart();
    updateCategoryChart();
    updateStudyHoursChart();
}

/**
 * Loads the user's previously selected theme.
 */
function loadTheme() {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }
}

function setFilter(filter) {
    currentFilter = filter;
    renderTasks();
}

/**
 * Displays warning messages for overdue
 * or soon-to-be-due tasks.
 */
function checkDeadlines() {
    const warningsDiv = document.getElementById("warnings");
    if (!warningsDiv) return;

    warningsDiv.innerHTML = "";
    const today = new Date();

    tasks.forEach(task => {
        if (!task.deadline || task.completed) return;

        const dueDate = new Date(task.deadline);
        const daysLeft = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
        const warning = document.createElement("p");

        if (daysLeft < 0) {
            warning.textContent = `Warning: ${task.title} is overdue!`;
            warning.style.color = "red";
        } else if (daysLeft <= 2) {
            warning.textContent = `Warning: ${task.title} is due in ${daysLeft} day(s)`;
            warning.style.color = "orange";
        } else {
            return;
        }

        warningsDiv.appendChild(warning);
    });
}

/**
 * Displays the three nearest upcoming tasks
 * sorted by deadline.
 */
function updateUpcomingTasks() {
    const list = document.getElementById("upcomingTasks");
    if (!list) return;

    list.innerHTML = "";

    tasks
        .filter(task => task.deadline && !task.completed)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 3)
        .forEach(task => {
            const taskCard = document.createElement("div");
            taskCard.classList.add("upcoming-task-item");
            taskCard.innerHTML = `
                <div class="upcoming-task-title">${task.title}</div>
                <div class="upcoming-task-course">Course: ${task.course}</div>
                <div class="upcoming-task-date">Due: ${task.deadline}</div>
            `;
            list.appendChild(taskCard);
        });
}

/**
 * Generates a short recommended study list
 * using the highest priority unfinished tasks.
 */
function generateStudyPlan() {
    const container = document.getElementById("studyPlan");
    if (!container) return;

    container.innerHTML = "";

    tasks
        .filter(task => !task.completed)
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, 3)
        .forEach(task => {
            const p = document.createElement("p");
            p.innerHTML = `<strong>${task.title}</strong> (${task.course})`;
            container.appendChild(p);
        });
}

/**
 * Automatically creates a daily timetable.
 * Long study sessions are split into manageable
 * blocks separated by breaks.
 */
function generateTimetable() {
    const container = document.getElementById("timetable");
    if (!container) return;

    container.innerHTML = "";

    const sortedTasks = tasks
        .filter(task => !task.completed)
        .sort((a, b) => b.priorityScore - a.priorityScore);

    let remainingHours = DAILY_LIMIT;
    let startHour = 9;

    sortedTasks.forEach(task => {
        if (remainingHours <= 0) return;

        let taskHours = parseFloat(task.studyHours) || 2;

        while (taskHours > 0 && remainingHours > 0) {
            const sessionHours = Math.min(taskHours, MAX_SESSION, remainingHours);
            const endHour = startHour + sessionHours;
            const div = document.createElement("div");

            div.classList.add("timetable-card");
            div.innerHTML = `
                <div class="time-block">${startHour}:00 - ${endHour}:00</div>
                <div class="timetable-content">
                    <h4>${task.title}</h4>
                    <p>Course: ${task.course}</p>
                    <p>${sessionHours} hrs</p>
                </div>
            `;

            container.appendChild(div);
            startHour = endHour;
            taskHours -= sessionHours;
            remainingHours -= sessionHours;

            if (taskHours > 0 && remainingHours > 0) {
                const breakDiv = document.createElement("p");
                breakDiv.textContent = `${startHour}:00 - ${startHour + BREAK_TIME}:00 - Break`;
                container.appendChild(breakDiv);
                startHour += BREAK_TIME;
            }
        }
    });

    if (!container.innerHTML) {
        container.innerHTML = "<p>No tasks for today!</p>";
    }
}

/**
 * Stores tasks that have already generated
 * a notification to prevent duplicates.
 */
function markNotified(taskTitle) {
    if (!alreadyNotified(taskTitle)) {
        notifiedTasks.push(taskTitle);
        localStorage.setItem("notifiedTasks", JSON.stringify(notifiedTasks));
    }
}

function alreadyNotified(taskTitle) {
    return notifiedTasks.includes(taskTitle);
}

/**
 * Organizes tasks according to their deadline
 * and displays them in a weekly schedule.
 */
function generateWeeklyPlan() {
    const container = document.getElementById("weeklyPlan");
    if (!container) return;

    container.innerHTML = "";

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyTasks = {};

    tasks.forEach(task => {
        if (!task.deadline) return;

        const day = days[new Date(task.deadline).getDay()];
        weeklyTasks[day] ||= [];
        weeklyTasks[day].push(task);
    });

    const grid = document.createElement("div");
    grid.classList.add("weekly-grid");

    days.forEach(day => {
        const dayCard = document.createElement("div");
        dayCard.classList.add("weekly-day-card");

        const tasksHTML = weeklyTasks[day]
            ? weeklyTasks[day].map(task => `
                <div class="weekly-task">
                    <strong>${task.title}</strong>
                    <p>${task.course}</p>
                </div>
            `).join("")
            : '<p class="no-task">Free Day</p>';

        dayCard.innerHTML = `<h3>${day}</h3>${tasksHTML}`;
        grid.appendChild(dayCard);
    });

    container.appendChild(grid);
}

/**
 * Displays the selected application section
 * while hiding all others.
 */
function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(section => {
        section.style.display = "none";
    });

    document.querySelectorAll(".sidebar li").forEach(item => {
        item.classList.remove("active");
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = "block";
    }

    document.querySelectorAll(".sidebar li").forEach(item => {
        if (item.getAttribute("onclick")?.includes(sectionId)) {
            item.classList.add("active");
        }
    });

    if (sectionId === "calendarTab") {
        setTimeout(renderCalendar, 200);
    }

    if (window.innerWidth < 768) {
        document.getElementById("sidebar")?.classList.add("collapsed");
    }
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
    currentEditIndex = null;
}

/**
 * Saves changes made to an existing task
 * and recalculates its priority.
 */
function saveEditedTask() {
    if (currentEditIndex === null || !tasks[currentEditIndex]) return;

    const task = tasks[currentEditIndex];
    task.title = document.getElementById("editTitle").value.trim();
    task.course = document.getElementById("editCourse").value.trim();
    task.taskType = document.getElementById("editType").value;
    task.deadline = document.getElementById("editDeadline").value;
    task.studyHours = document.getElementById("editHours").value;

    const result = calculatePriority(task.taskType, task.deadline, task.studyHours);
    task.priority = result.priority;
    task.priorityScore = result.score;

    saveTasks();
    refreshDashboard();
    closeEditModal();
    showToast("Task updated successfully");
}

/**
 * Displays a reusable custom dialog window.
 */
function showModal(message) {
    const modal = document.getElementById("customModal");
    const modalMessage = document.getElementById("modalMessage");

    if (!modal || !modalMessage) {
        alert(message);
        return;
    }

    modalMessage.textContent = message;
    modal.style.display = "flex";
}

function closeModal() {
    const customModal = document.getElementById("customModal");
    const editModal = document.getElementById("editModal");

    if (customModal?.style.display === "flex") {
        customModal.style.display = "none";
        return;
    }

    if (editModal) {
        closeEditModal();
    }
}

/**
 * Smoothly hides the loading screen once
 * the application has finished initializing.
 */
function hideLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;

    loader.style.opacity = "0";
    setTimeout(() => {
        loader.style.display = "none";
    }, 500);
}

loadTheme();

// -------------------------------------------------
// Event Listeners
// -------------------------------------------------
searchInput?.addEventListener("input", renderTasks);
sortOption?.addEventListener("change", renderTasks);
themeToggle?.addEventListener("click", toggleTheme);
exportBtn?.addEventListener("click", exportTasks);
importBtn?.addEventListener("click", importTasks);
form?.addEventListener("submit", addTask);

menuToggle?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("active");
});

document.addEventListener("click", event => {
    const menu = document.getElementById("profileMenu");
    const icon = document.querySelector(".profile-icon");

    if (menu && icon && !menu.contains(event.target) && !icon.contains(event.target)) {
        menu.style.display = "none";
    }
});

// -------------------------------------------------
// Application Initialization
// -------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    if (typeof loadUserTasks === "function") {
        loadUserTasks();
    }

    if (typeof updateCurrentUserUI === "function") {
        updateCurrentUserUI();
    }

    const version = document.getElementById("appVersion");
    if (version) {
        version.textContent = "Version 1.0";
    }

    showSection("dashboard");
    setTimeout(hideLoader, 800);
});