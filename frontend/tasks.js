/*
====================================================
SMART STUDY PLANNER - TASK MANAGEMENT MODULE
====================================================

Purpose:
Manages all task-related operations including creating,
displaying, filtering, searching, sorting, editing,
deleting, importing and exporting study tasks.

Author: Fernando Nathali
=========================================================
*/

"use strict";

"use strict";

// Returns the list of tasks after applying the
// selected filter, search keyword and sorting option.
function getVisibleTasks() {

    // Create a copy of the task list to avoid
    // modifying the original array.
    let filteredTasks = [...tasks];

    // Apply the selected task filter.
    if (currentFilter === "COMPLETED") {
        filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (currentFilter === "PENDING") {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (["HIGH", "MEDIUM", "LOW"].includes(currentFilter)) {
        filteredTasks = filteredTasks.filter(task => task.priority === currentFilter && !task.completed);
    }

    // Filter tasks using the search box.
    const searchText = (searchInput?.value || "").toLowerCase();
    filteredTasks = filteredTasks.filter(task => {
        const title = String(task.title || "").toLowerCase();
        const course = String(task.course || "").toLowerCase();
        return title.includes(searchText) || course.includes(searchText);
    });

    // Sort tasks according to the selected option.
    if (sortOption?.value === "earliest") {
        filteredTasks.sort((a, b) => new Date(a.deadline || "9999-12-31") - new Date(b.deadline || "9999-12-31"));
    } else if (sortOption?.value === "latest") {
        filteredTasks.sort((a, b) => new Date(b.deadline || "0001-01-01") - new Date(a.deadline || "0001-01-01"));
    }

    return filteredTasks;
}

// Displays all visible tasks as interactive
// task cards in the task list.
function renderTasks() {
    if (!taskList) return;

    taskList.innerHTML = "";
    const filteredTasks = getVisibleTasks();

    // Generate one task card for each task.
    filteredTasks.forEach(task => {
        const taskCard = document.createElement("div");
        taskCard.classList.add("task-card", `${String(task.priority || "LOW").toLowerCase()}-priority`);

        if (task.completed) {
            taskCard.classList.add("completed-task");
        }

        taskCard.innerHTML = `
            <h3>${task.title}</h3>
            <p>Course: ${task.course}</p>
            <p>Type: ${task.taskType}</p>
            <p>Deadline: ${task.deadline || "No deadline"}</p>
            <p>Study hours: ${task.studyHours || 0}</p>
            <p>Priority: ${task.priority}</p>
            <div class="task-actions">
                <button class="complete-btn" type="button">${task.completed ? "Undo" : "Done"}</button>
                <button class="delete-btn" type="button">Delete</button>
                <button class="edit-btn" type="button">Edit</button>
            </div>
        `;

        // Attach button event listeners.
        taskCard.querySelector(".complete-btn").addEventListener("click", () => toggleTaskCompleted(task));
        taskCard.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task));
        taskCard.querySelector(".edit-btn").addEventListener("click", () => editTask(tasks.indexOf(task)));

        taskList.appendChild(taskCard);
    });

    // Display an empty state if no tasks match
    // the selected filters.
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <p>No tasks found</p>
            </div>
        `;
    }
}

// Marks a task as completed or restores it
// back to pending.
function toggleTaskCompleted(task) {
    task.completed = !task.completed;
    saveTasks();
    refreshDashboard();
}

// Removes the selected task from the Task List.
function deleteTask(task) {
    const index = tasks.indexOf(task);

    if (index > -1) {
        tasks.splice(index, 1);
        saveTasks();
        refreshDashboard();
    }
}

// Open the Edit Task dialog and loads the
// selected task information.
function editTask(index) {
    if (index < 0 || !tasks[index]) return;

    currentEditIndex = index;
    const task = tasks[index];

    document.getElementById("editTitle").value = task.title || "";
    document.getElementById("editCourse").value = task.course || "";
    document.getElementById("editType").value = task.taskType || "Assignment";
    document.getElementById("editDeadline").value = task.deadline || "";
    document.getElementById("editHours").value = task.studyHours || "";
    document.getElementById("editModal").style.display = "flex";
}

// Imports study tasks from a CSV file and
// automatically recalculates task priorities.
function importTasks() {
    const file = importFile?.files[0];

    if (!file) {
        showToast("Please select a CSV file");
        return;
    }

    // Read the selected CSV file.
    const reader = new FileReader();

    // Parse each CSV record into a task object.
    reader.onload = event => {
        try {
            const csv = event.target.result.trim();
            const lines = csv.split(/\r?\n/);
            lines.shift();

            lines.forEach(line => {
                if (!line.trim()) return;

                const values = line.includes("\t") ? line.split("\t") : line.split(",");

                if (values.length < 7) {
                    throw new Error("Invalid CSV structure");
                }

                const title = String(values[0] || "").trim();
                const course = String(values[1] || "").trim();
                const taskType = String(values[2] || "").trim() || "Assignment";
                const deadline = String(values[3] || "").trim();
                const studyHours = parseFloat(values[4]) || 0;
                const completed = String(values[6] || "").trim().toLowerCase() === "true";

                if (!title || !course) return;

                const result = calculatePriority(taskType, deadline, studyHours);

                // Create a new task from the imported data.
                tasks.push({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    title,
                    course,
                    taskType,
                    deadline,
                    studyHours,
                    taskTime: "",
                    priority: result.priority,
                    priorityScore: result.score,
                    completed
                });
            });

            saveTasks();
            refreshDashboard();
            showToast("Tasks imported successfully");
        } catch (error) {
            console.error(error);
            showToast("Invalid CSV file");
        }
    };

    reader.readAsText(file);
}

// Escapes special characters before exporting 
// data to CSV format.
function csvEscape(value) {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Exports all study tasks to a downloadable
// CSV file.
function exportTasks() {
    if (tasks.length === 0) {
        showModal("No tasks to export.");
        return;
    }

    // Create CSV header and data rows.
    const header = "Title,Course,Type,Deadline,StudyHours,Priority,Completed";
    const rows = tasks.map(task => [
        task.title,
        task.course,
        task.taskType,
        task.deadline,
        task.studyHours,
        task.priority,
        task.completed
    ].map(csvEscape).join(","));

    // Generate and download the CSV file.
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "tasks.csv";
    a.click();
    window.URL.revokeObjectURL(url);
}

// Removes all completed tasks from the
// application.
function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    refreshDashboard();
    showToast("Completed tasks removed");
}