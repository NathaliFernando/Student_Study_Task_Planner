"use strict";

// Backend API base URL
const API_BASE_URL = "http://localhost:8080/api";

// =========================
// GET ALL TASKS
// =========================

async function getTasksFromBackend() {

    const response = await fetch(`${API_BASE_URL}/tasks`);

    if (!response.ok) {
        throw new Error("Failed to load tasks");
    }

    return await response.json();
}

// =========================
// CREATE TASK
// =========================

async function createTaskInBackend(task) {

    const response = await fetch(`${API_BASE_URL}/tasks`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(task)

    });

    if (!response.ok) {
        throw new Error("Failed to create task");
    }

    return await response.json();
}

// =========================
// UPDATE TASK
// =========================

async function updateTaskInBackend(taskId, task) {

    const response = await fetch(
        `${API_BASE_URL}/tasks/${taskId}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(task)
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update task");
    }

    return await response.json();
}

// =========================
// DELETE TASK
// =========================

async function deleteTaskFromBackend(taskId) {

    const response = await fetch(
        `${API_BASE_URL}/tasks/${taskId}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete task");
    }

    return true;
}