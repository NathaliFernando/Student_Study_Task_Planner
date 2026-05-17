"use strict";

function refreshDashboard(){

renderTasks();
updateStats();
checkDeadlines();
updateProgress();
updateChart();
updateCategoryChart();
updateUpcomingTasks();
updateStudyHoursChart();
updateCompletionTrend();
updateDashboardSummary();
generateStudyPlan();
generateTimetable();
generateNotifications();
generateWeeklyPlan();
generatePrediction();
renderCalendar();
generateInsights();

}

function updateStats(){

document.getElementById("totalTasks").textContent = tasks.length;
document.getElementById("completedTasks").textContent =
tasks.filter(t=>t.completed).length;
document.getElementById("highPriorityTasks").textContent =
tasks.filter(t=>t.priority==="HIGH").length;

}

function updateProgress(){

const total = tasks.length;
const completed = tasks.filter(t=>t.completed).length;

let percent = total ? Math.round((completed/total)*100) : 0;

document.getElementById("progressBar").style.width = percent+"%";
document.getElementById("progressText").textContent = percent+"% Completed";

}

function updateDashboardSummary(){

const total = tasks.length;
const completed = tasks.filter(t => t.completed).length;
const pending = total - completed;

const today = new Date();

const upcoming = tasks.filter(task => {

if(!task.deadline || task.completed) return false;

const dueDate = new Date(task.deadline);

const difference = dueDate - today;

const daysLeft = difference / (1000*60*60*24);

return daysLeft >= 0 && daysLeft <= 7;

}).length;

document.getElementById("dashboardTotal").textContent = total;
document.getElementById("dashboardCompleted").textContent = completed;
document.getElementById("dashboardPending").textContent = pending;
document.getElementById("dashboardUpcoming").textContent = upcoming;

}