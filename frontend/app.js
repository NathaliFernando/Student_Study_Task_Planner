/*
=========================================
SMART STUDY PLANNER - APPLICATION LOGIC
=========================================

Features:
- Task management
- Dashboard analytics
- Notifications
- Calendar integration
- Study timetable generation
- Progress tracking
- CSV import/export
- Weekly planning
- Productivity prediction

Author: Fernando Nathali
=========================================
*/

"use strict";

console.log("app.js loaded");

let tasks = [];

let currentFilter = "ALL";

let currentEditTask = null;

let taskChart = null;
let categoryChart = null;
let studyHoursChart = null;
let calendar = null;

const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const sortOption = document.getElementById("sortOption");
const themeToggle = document.getElementById("themeToggle");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");
const importBtn = document.getElementById("importBtn");
const DAILY_LIMIT = 6; // max study hours per day
const MAX_SESSION = 2; // max hours per session before break
const BREAK_TIME = 1;  // 1 hour break

function openTab(tabName, event){

document.querySelectorAll(".tab-content").forEach(tab=>{
tab.classList.remove("active");
});

document.querySelectorAll(".tab-btn").forEach(btn=>{
btn.classList.remove("active");
});

document.getElementById(tabName).classList.add("active");

event.target.classList.add("active");

}

let notifiedTasks = JSON.parse(localStorage.getItem("notifiedTasks")) || [];

let completionTrendChart;

loadTheme();
//refreshDashboard();
//renderTasks();

searchInput.addEventListener("input", renderTasks);
sortOption.addEventListener("change", renderTasks);
themeToggle.addEventListener("click", toggleTheme);
exportBtn.addEventListener("click", exportTasks);
importBtn.addEventListener("click", importTasks);

function calculatePriority(taskType, deadline, studyHours){

let score = 0;

// 1. Deadline urgency
if(deadline){
const today = new Date();
const dueDate = new Date(deadline);
const daysLeft = (dueDate - today)/(1000*60*60*24);

if(daysLeft <= 2) score += 50;
else if(daysLeft <= 5) score += 30;
else score += 10;
}

// 2. Study hours weight
const hours = parseFloat(studyHours) || 0;

if(hours >= 10) score += 30;
else if(hours >= 5) score += 20;
else score += 10;

// 3. Task type importance
if(taskType === "Exam") score += 30;
else if(taskType === "Assignment") score += 20;
else if(taskType === "Quiz") score += 15;
else score += 10;

// Convert score → priority label
let priority = "LOW";

if(score >= 70) priority = "HIGH";
else if(score >= 40) priority = "MEDIUM";

return {priority, score};

}

form.addEventListener("submit", function(event){

event.preventDefault();

const title = document.getElementById("title").value;
const course = document.getElementById("course").value;
const taskType = document.getElementById("taskType").value;
const deadline = document.getElementById("deadline").value;
const studyHours = document.getElementById("studyHours").value;
const result = calculatePriority(taskType, deadline, studyHours);

const task = {
id: Date.now(),
title,
course,
taskType,
deadline,
studyHours,
priority: result.priority,
priorityScore: result.score,
completed:false
};

tasks.push(task);

saveTasks();
refreshDashboard();

form.reset();

});

function toggleTheme(){

document.body.classList.toggle("dark-mode");

if(document.body.classList.contains("dark-mode")){
localStorage.setItem("theme","dark");
}else{
localStorage.setItem("theme","light");
}

}

function loadTheme(){

const savedTheme = localStorage.getItem("theme");

if(savedTheme === "dark"){
document.body.classList.add("dark-mode");
}

}

function setFilter(filter){
currentFilter = filter;
renderTasks();
}

function checkDeadlines(){

const warningsDiv = document.getElementById("warnings");
warningsDiv.innerHTML="";

const today = new Date();

tasks.forEach(function(task){

if(!task.deadline || task.completed) return;

const dueDate = new Date(task.deadline);
const difference = dueDate - today;
const daysLeft = Math.floor(difference/(1000*60*60*24));

const warning = document.createElement("p");

if(daysLeft < 0){

warning.textContent = "⚠ "+task.title+" is OVERDUE!";
warning.style.color="red";
warningsDiv.appendChild(warning);

}

else if(daysLeft <= 2){

warning.textContent = "⚠ "+task.title+" due in "+daysLeft+" day(s)";
warning.style.color="orange";
warningsDiv.appendChild(warning);

}

});

}

function updateUpcomingTasks(){

const list = document.getElementById("upcomingTasks");
list.innerHTML="";

const upcoming = tasks
.filter(task=>task.deadline && !task.completed)
.sort((a,b)=>new Date(a.deadline)-new Date(b.deadline))
.slice(0,3);

upcoming.forEach(task=>{

const taskCard = document.createElement("div");

taskCard.innerHTML=`<strong>${task.title}</strong><br>${task.course} - ${task.deadline}`;

list.appendChild(taskCard);

});

}

function updateCompletionTrend(){

const completionData = {};

tasks.forEach(task => {

if(task.completed && task.deadline){

const date = task.deadline;

if(!completionData[date]){
completionData[date] = 0;
}

completionData[date]++;

}

});

const labels = Object.keys(completionData);
const data = Object.values(completionData);

const ctx = document.getElementById("completionTrendChart");

if(!ctx) return;

if(completionTrendChart){
completionTrendChart.destroy();
}

completionTrendChart = new Chart(ctx, {

type: "line",

data: {

labels: labels,

datasets: [{

label: "Tasks Completed",

data: data,

borderColor: "#42a5f5",
fill: false,
tension: 0.3

}]

},

options: {

responsive: true,

maintainAspectRatio:false,

plugins: {

legend: {
display: true
}

}

}

});

}

function generateStudyPlan(){

const todayTasks = tasks
.filter(t => !t.completed)
.sort((a,b)=>b.priorityScore - a.priorityScore)
.slice(0,3);

const container = document.getElementById("studyPlan");

if(!container) return;

container.innerHTML = "";

todayTasks.forEach(task=>{
const p = document.createElement("p");

p.innerHTML = `📘 <strong>${task.title}</strong> (${task.course})`;

container.appendChild(p);
});

}

function generateTimetable(){

const container = document.getElementById("timetable");

if(!container) return;

container.innerHTML = "";

const sortedTasks = tasks
.filter(t => !t.completed)
.sort((a,b)=>b.priorityScore - a.priorityScore);

let remainingHours = DAILY_LIMIT;
let startHour = 9;

sortedTasks.forEach(task => {

if(remainingHours <= 0) return;

let taskHours = parseFloat(task.studyHours) || 2;

while(taskHours > 0 && remainingHours > 0){

let sessionHours = Math.min(taskHours, MAX_SESSION, remainingHours);

let endHour = startHour + sessionHours;

const div = document.createElement("p");

div.innerHTML = `
📘 ${startHour}:00 - ${endHour}:00 → 
<strong>${task.title}</strong> (${task.course})
`;

container.appendChild(div);

startHour = endHour;
taskHours -= sessionHours;
remainingHours -= sessionHours;

// ADD BREAK if more work remains
if(taskHours > 0 && remainingHours > 0){

const breakDiv = document.createElement("p");

breakDiv.innerHTML = `
☕ ${startHour}:00 - ${startHour + BREAK_TIME}:00 → Break
`;

container.appendChild(breakDiv);

startHour += BREAK_TIME;

}

}

});

if(container.innerHTML === ""){
container.innerHTML = "<p>🎉 No tasks for today!</p>";
}

}

function markNotified(taskTitle){
notifiedTasks.push(taskTitle);
localStorage.setItem("notifiedTasks", JSON.stringify(notifiedTasks));
}

function alreadyNotified(taskTitle){
return notifiedTasks.includes(taskTitle);
}

function generateWeeklyPlan(){

const container = document.getElementById("weeklyPlan");

if(!container) return;

container.innerHTML = "";

const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// group tasks by day
const weeklyTasks = {};

tasks.forEach(task => {

if(!task.deadline) return;

const date = new Date(task.deadline);
const day = days[date.getDay()];

if(!weeklyTasks[day]){
weeklyTasks[day] = [];
}

weeklyTasks[day].push(task);

});

// render UI
days.forEach(day => {

const dayDiv = document.createElement("div");
dayDiv.style.marginBottom = "10px";

const title = document.createElement("strong");
title.textContent = day;

dayDiv.appendChild(title);

// add tasks
if(weeklyTasks[day]){

weeklyTasks[day].forEach(task => {

const p = document.createElement("p");

p.innerHTML = `• ${task.title} (${task.course})`;

dayDiv.appendChild(p);

});

}
else{

const p = document.createElement("p");
p.textContent = "No tasks";

dayDiv.appendChild(p);

}

container.appendChild(dayDiv);

});

}

window.addEventListener("DOMContentLoaded", () => {

if(typeof loadUserTasks === "function"){
loadUserTasks();
}

if(typeof updateCurrentUserUI === "function"){
updateCurrentUserUI();
}

});

function showSection(sectionId){

document.querySelectorAll(".section").forEach(sec=>{
sec.style.display = "none";
});

// highlight active menu
document.querySelectorAll(".sidebar li").forEach(li=>{
li.classList.remove("active");
});

const activeSection = document.getElementById(sectionId);
activeSection.style.display = "block";

// highlight clicked item
document.querySelectorAll(".sidebar li").forEach(li=>{
if(li.getAttribute("onclick").includes(sectionId)){
li.classList.add("active");
}
});

// calendar fix
if(sectionId === "calendarTab"){
setTimeout(()=>{ renderCalendar(); }, 200);
}

if(window.innerWidth < 768){
document.getElementById("sidebar")
.classList.add("collapsed");
}

}

showSection("dashboard");

const menuToggle = document.getElementById("menuToggle");

if(menuToggle){
menuToggle.addEventListener("click", function(){
console.log("Sidebar toggle clicked");
document.getElementById("sidebar").classList.toggle("collapsed");
});
}

document.addEventListener("click", function(e){

const menu = document.getElementById("profileMenu");
const icon = document.querySelector(".profile-icon");

if(!menu || !icon) return;

if(!menu.contains(e.target) && !icon.contains(e.target)){
menu.style.display = "none";
}

});

if(typeof updateCurrentUserUI === "function"){
updateCurrentUserUI();
};

function closeModal(){
document.getElementById("editModal").style.display = "none";
}

function saveEditedTask(){

if(!currentEditTask) return;

currentEditTask.title =
document.getElementById("editTitle").value;

currentEditTask.course =
document.getElementById("editCourse").value;

currentEditTask.studyHours =
document.getElementById("editHours").value;

saveTasks();
refreshDashboard();

closeModal();

showToast("Task updated successfully ✅");

}

document.addEventListener("DOMContentLoaded", function(){

setTimeout(() => {

const loader = document.getElementById("loader");

if(loader){
loader.style.opacity = "0";

setTimeout(()=>{
loader.style.display = "none";
},500);
}

}, 800);

});

document.getElementById("appVersion")
.textContent = "Version 1.0";
