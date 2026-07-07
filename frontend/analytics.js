/*
====================================================
SMART STUDY PLANNER - ANALYTICS MODULE
====================================================

 Description :
 This module generates analytical information for the
 Student Study Task Planner application.

 It provides:
 • Study progress visualisation
 • Task category analysis
 • Study hours per course
 • Personalised study insights
 • Study workload prediction

 Author      : Fernando Nathali
=========================================================*/

"use strict";

/*=========================================================
                STUDY PROGRESS ANALYTICS
=========================================================*/

/**
 * Generates the doughnut chart displaying the percentage
 * of completed and pending study tasks.
 *
 * The chart is automatically refreshed whenever the task
 * list changes or the dashboard is updated.
 */

function updateChart() {

    // Count completed and pending tasks.
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.length - completed;

    const ctx = document.getElementById("taskChart");

    if (taskChart) taskChart.destroy();

    taskChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Completed", "Pending"],
            datasets: [{
                data: [completed, pending],
                backgroundColor: ["#4CAF50", "#ff7043"]
            }]
        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: true,
                    position: "top",

                    labels: {

                        color: document.body.classList.contains("dark-mode")
                        ? "#ffffff"
                        : "#222222",

                    }

                },

                datalabels: {

                    color: "#000000",

                    font: {
                        weight: "bold",
                        size: 14
                    },

                    formatter: (value, context) => {

                        const data =
                            context.chart.data.datasets[0].data;

                        const total =
                            data.reduce((a, b) => a + b, 0);

                        const percentage =
                            Math.round((value / total) * 100);

                        return percentage + "%";

                    }

                }

            }

        }

    });
}

/*=========================================================
                TASK CATEGORY ANALYTICS
=========================================================*/

/**
 * Creates a bar chart showing the distribution of tasks
 * according to their category.
 *
 * Categories include:
 * - Assignment
 * - Exam
 * - Quiz
 * - Self Study
 * - Group Study
 *
 * The chart also adapts its axis colours based on the
 * currently selected application theme.
 */

function updateCategoryChart() {

    const axisColor = document.body.classList.contains("dark-mode")
    ? "#ffffff"
    : "#444444";

    // Count the number of tasks in each category.
    const assignments = tasks.filter(t => t.taskType === "Assignment").length;
    const exams = tasks.filter(t => t.taskType === "Exam").length;
    const quizzes = tasks.filter(t => t.taskType === "Quiz").length;
    const selfStudy = tasks.filter(t => t.taskType === "Self Study").length;
    const groupStudy = tasks.filter(t => t.taskType === "Group Study").length;

    const ctx = document.getElementById("categoryChart");

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Assignments", "Exams", "Quizzes", "Self Study","Group Study"],
            datasets: [{
                data: [assignments, exams, quizzes, selfStudy, groupStudy],
                backgroundColor: ["#42a5f5", "#66bb6a", "#ffa726", "#ab47bc", "#ec407a"]
            }]
        },

        options: {

    responsive: true,
    maintainAspectRatio: false,

    scales: {

        x: {

            ticks: {
    color: axisColor
}

        },

        y: {

            ticks: {
    color: axisColor
}

        }

    },

    plugins: {

        legend: {
            display: false
        }

    }

}

    });

}

/*=========================================================
                STUDY HOURS PER COURSE
=========================================================*/

/**
 * Calculates the total study hours allocated to each course
 * and displays the results as a bar chart.
 *
 * This enables users to identify how their study time is
 * distributed across different subjects.
 */

function updateStudyHoursChart() {

    const axisColor = document.body.classList.contains("dark-mode")
    ? "#ffffff"
    : "#444444";

    const courseHours = {};

    // Calculate the total study hours allocated to each course.
    tasks.forEach(task => {

        const course = task.course;
        const hours = parseFloat(task.studyHours) || 0;

        if (!courseHours[course]) {
            courseHours[course] = 0;
        }

        courseHours[course] += hours;

    });

    const labels = Object.keys(courseHours);
    const data = Object.values(courseHours);

    const ctx = document.getElementById("studyHoursChart");

    if (!ctx) return;

    if (studyHoursChart) {
        studyHoursChart.destroy();
    }

    studyHoursChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: labels,

            datasets: [{

                label: "Study Hours",

                data: data,

                backgroundColor: ["#42a5f5", "#66bb6a", "#ffa726", "#ef5350", "#ab47bc", "#26c6da"]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            scales: {

    x: {

        ticks: {
    color: axisColor
}
    },

    y: {

        ticks: {
    color: axisColor
}

    }

},

plugins: {

    legend: {
        display: false
    }

}

        }

    });

}

/*=========================================================
                    SMART INSIGHTS
=========================================================*/

/**
 * Generates personalised study insights based on the
 * current task list.
 *
 * The displayed information includes:
 * - Most active course
 * - Overall completion rate
 * - Total number of study tasks
 */

function generateInsights() {

    const container = document.getElementById("insights");

    if (!container) return;

    container.innerHTML = "";

    if (tasks.length === 0) {
        container.innerHTML = "No insights available.";
        return;
    }

    const completed =
        tasks.filter(t => t.completed).length;

    const completionRate =
        Math.round((completed / tasks.length) * 100);

    const courseCount = {};

    tasks.forEach(task => {

        if (!courseCount[task.course]) {
            courseCount[task.course] = 0;
        }

        courseCount[task.course]++;

    });

    // Determine which course currently contains the most tasks.
    const topCourse =
        Object.keys(courseCount).reduce((a, b) =>
            courseCount[a] > courseCount[b] ? a : b
        );

    container.innerHTML = `
<p>📚 Most active course:
<strong>${topCourse}</strong></p>

<p>✅ Completion Rate:
<strong>${completionRate}%</strong></p>

<p>📝 Total Tasks:
<strong>${tasks.length}</strong></p>
`;

}

/*=========================================================
                STUDY TIME PREDICTION
=========================================================*/

/**
 * Estimates the amount of study time required each day
 * to complete all remaining tasks before their deadlines.
 *
 * The prediction is calculated using:
 * - Remaining study hours
 * - Number of days until each deadline
 *
 * A recommendation is then provided to indicate whether
 * the current study pace is sufficient.
 */

function generatePrediction() {

    const container = document.getElementById("prediction");

    if (!container) return;

    container.innerHTML = "";

    const today = new Date();

    let totalHours = 0;
    let totalDays = 0;

    // Calculate the remaining workload for incomplete tasks.
    tasks.forEach(task => {

        if (task.completed) return;

        const hours = parseFloat(task.studyHours) || 0;

        if (task.deadline) {

            const dueDate = new Date(task.deadline);
            const daysLeft = (dueDate - today) / (1000 * 60 * 60 * 24);

            if (daysLeft > 0) {
                totalHours += hours;
                totalDays += daysLeft;
            }

        }

    });

    if (totalHours === 0 || totalDays === 0) {
        container.innerHTML = "<p>No active tasks to predict.</p>";
        return;
    }

    const requiredPerDay = (totalHours / totalDays).toFixed(2);

    const p = document.createElement("p");

    p.innerHTML = `
📚 Total Remaining Hours: <strong>${totalHours}</strong><br>
📅 Estimated Days Left: <strong>${Math.round(totalDays)}</strong><br>
⏱ Required Study Per Day: <strong>${requiredPerDay} hrs/day</strong>
`;

    container.appendChild(p);

    const status = document.createElement("p");

    // Evaluate whether the recommended daily study hours
    // are realistic based on the predefined daily limit.
    if (requiredPerDay <= DAILY_LIMIT) {
        status.innerHTML = "✅ You are on track. Keep going!";
        status.style.color = "green";
    }
    else if (requiredPerDay <= DAILY_LIMIT * 1.5) {
        status.innerHTML = "⚠ You need to increase your study time.";
        status.style.color = "orange";
    }
    else {
        status.innerHTML = "🔥 High risk! You may miss deadlines.";
        status.style.color = "red";
    }

    container.appendChild(status);

}