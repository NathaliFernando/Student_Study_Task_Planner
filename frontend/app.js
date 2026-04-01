let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser") || null;

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

function openTab(tabName){

document.querySelectorAll(".tab-content").forEach(tab=>{
tab.classList.remove("active");
});

document.querySelectorAll(".tab-btn").forEach(btn=>{
btn.classList.remove("active");
});

document.getElementById(tabName).classList.add("active");

event.target.classList.add("active");

}

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let notifiedTasks = JSON.parse(localStorage.getItem("notifiedTasks")) || [];

let currentFilter = "ALL";

let taskChart;
let categoryChart;
let studyHoursChart;
let completionTrendChart;

loadTheme();
refreshDashboard();

searchInput.addEventListener("input", renderTasks);
sortOption.addEventListener("change", renderTasks);
themeToggle.addEventListener("click", toggleTheme);
exportBtn.addEventListener("click", exportTasks);
importBtn.addEventListener("click", importTasks);

form.addEventListener("submit", function(event){

event.preventDefault();

const title = document.getElementById("title").value;
const course = document.getElementById("course").value;
const taskType = document.getElementById("taskType").value;
const deadline = document.getElementById("deadline").value;
const studyHours = document.getElementById("studyHours").value;

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

const result = calculatePriority(taskType, deadline, studyHours);

const task = {
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

function saveTasks(){

if(currentUser){
users[currentUser] = tasks;
localStorage.setItem("users", JSON.stringify(users));
}

}

function requestNotificationPermission(){

if("Notification" in window){

if(Notification.permission !== "granted"){
Notification.requestPermission();
}

}

}

function refreshDashboard(){

renderTasks();
updateStats();
checkDeadlines();
updateProgress();
updateChart();
updateCategoryChart();
updateUpcomingTasks();
renderCalendar();
updateStudyHoursChart();
updateCompletionTrend();
updateDashboardSummary();
generateStudyPlan();
generateTimetable();
generateNotifications();
generateWeeklyPlan();
generatePrediction();

}

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

function renderTasks(){

taskList.innerHTML = "";

let filteredTasks = [...tasks];

if(currentFilter === "HIGH")
filteredTasks = filteredTasks.filter(t => t.priority === "HIGH");

else if(currentFilter === "MEDIUM")
filteredTasks = filteredTasks.filter(t => t.priority === "MEDIUM");

else if(currentFilter === "LOW")
filteredTasks = filteredTasks.filter(t => t.priority === "LOW");

else if(currentFilter === "COMPLETED")
filteredTasks = filteredTasks.filter(t => t.completed === true);

const searchText = searchInput.value.toLowerCase();

filteredTasks = filteredTasks.filter(task =>
task.title.toLowerCase().includes(searchText) ||
task.course.toLowerCase().includes(searchText)
);

if(sortOption.value === "earliest"){
filteredTasks.sort((a,b)=>new Date(a.deadline)-new Date(b.deadline));
}

if(sortOption.value === "latest"){
filteredTasks.sort((a,b)=>new Date(b.deadline)-new Date(a.deadline));
}

filteredTasks.forEach(function(task){

const li = document.createElement("li");

li.classList.add("task-card");

if(task.priority === "HIGH") li.classList.add("high-priority");
else if(task.priority === "MEDIUM") li.classList.add("medium-priority");
else li.classList.add("low-priority");

if(task.completed) li.classList.add("completed-task");

li.innerHTML = `

<div class="task-info">

<h3>${task.title}</h3>

<p><strong>Course:</strong> ${task.course}</p>

<p><strong>Type:</strong> ${task.taskType}</p>

<p><strong>Deadline:</strong> ${task.deadline || "N/A"}</p>

<p><strong>Study Hours:</strong> ${task.studyHours || "0"}</p>

<p><strong>Priority:</strong> ${task.priority}</p>

<p><strong>Score:</strong> ${task.priorityScore}</p>

<p><strong>Daily Limit:</strong> 6 hours</p>

</div>

<div class="task-actions">

<button class="complete-btn"><i class="fa-solid fa-check"></i></button>

<button class="edit-btn"><i class="fa-solid fa-pen"></i></button>

<button class="delete-btn"><i class="fa-solid fa-trash"></i></button>

</div>

`;

const completeButton = li.querySelector(".complete-btn");
const editButton = li.querySelector(".edit-btn");
const deleteButton = li.querySelector(".delete-btn");

completeButton.addEventListener("click", function(){

task.completed = !task.completed;

saveTasks();
refreshDashboard();

});

editButton.addEventListener("click", function(){

const newTitle = prompt("Edit Task Title", task.title);

if(newTitle !== null){
task.title = newTitle;
}

saveTasks();
refreshDashboard();

});

deleteButton.addEventListener("click", function(){

const index = tasks.indexOf(task);
tasks.splice(index,1);

saveTasks();
refreshDashboard();

});

taskList.appendChild(li);

});

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

const li = document.createElement("li");

li.innerHTML=`<strong>${task.title}</strong><br>${task.course} - ${task.deadline}`;

list.appendChild(li);

});

}

function updateChart(){

const completed = tasks.filter(t=>t.completed).length;
const pending = tasks.length-completed;

const ctx = document.getElementById("taskChart");

if(taskChart) taskChart.destroy();

taskChart = new Chart(ctx,{
type:"doughnut",
data:{
labels:["Completed","Pending"],
datasets:[{
data:[completed,pending],
backgroundColor:["#4CAF50","#ff7043"]
}]
}
});

}

function updateCategoryChart(){

const assignments = tasks.filter(t=>t.taskType==="Assignment").length;
const exams = tasks.filter(t=>t.taskType==="Exam").length;
const quizzes = tasks.filter(t=>t.taskType==="Quiz").length;
const selfStudy = tasks.filter(t=>t.taskType==="Self Study").length;

const ctx = document.getElementById("categoryChart");

if(categoryChart) categoryChart.destroy();

categoryChart = new Chart(ctx,{
type:"bar",
data:{
labels:["Assignments","Exams","Quiz","Self Study"],
datasets:[{
label:"Tasks",
data:[assignments,exams,quizzes,selfStudy],
backgroundColor:["#42a5f5","#66bb6a","#ffa726","#ab47bc"]
}]
}
});

}

function exportTasks(){

if(tasks.length === 0){
alert("No tasks to export.");
return;
}

let csv = "Title,Course,Type,Deadline,StudyHours,Priority,Completed\n";

tasks.forEach(task => {

csv += `${task.title},${task.course},${task.taskType},${task.deadline},${task.studyHours},${task.priority},${task.completed}\n`;

});

const blob = new Blob([csv], { type: "text/csv" });

const url = window.URL.createObjectURL(blob);

const a = document.createElement("a");

a.setAttribute("href", url);

a.setAttribute("download", "tasks.csv");

a.click();

}

function importTasks(){

const file = importFile.files[0];

if(!file){
alert("Please select a CSV file.");
return;
}

const reader = new FileReader();

reader.onload = function(event){

const csv = event.target.result;

const lines = csv.split("\n");

lines.shift(); // remove header

lines.forEach(line => {

if(!line.trim()) return;

const [title, course, taskType, deadline, studyHours, priority, completed] = line.split(",");

const task = {
title,
course,
taskType,
deadline,
studyHours,
priority,
completed: completed === "true"
};

tasks.push(task);

});

saveTasks();
refreshDashboard();

alert("Tasks imported successfully!");

};

reader.readAsText(file);

}

function renderCalendar(){

const calendarEl = document.getElementById("calendar");

if(!calendarEl) return;

const events = tasks
.filter(task => task.deadline)
.map(task => {

let color = "#4caf50";

if(task.priority === "HIGH"){
color = "#e53935";
}
else if(task.priority === "MEDIUM"){
color = "#fbc02d";
}

return {
title: task.title + " (" + task.course + ")",
start: task.deadline,
backgroundColor: color,
borderColor: color
};

});

calendarEl.innerHTML = "";

const calendar = new FullCalendar.Calendar(calendarEl, {

initialView: "dayGridMonth",

height: 500,

events: events

});

calendar.render();

}

function updateStudyHoursChart(){

const courseHours = {};

tasks.forEach(task => {

const course = task.course;
const hours = parseFloat(task.studyHours) || 0;

if(!courseHours[course]){
courseHours[course] = 0;
}

courseHours[course] += hours;

});

const labels = Object.keys(courseHours);
const data = Object.values(courseHours);

const ctx = document.getElementById("studyHoursChart");

if(!ctx) return;

if(studyHoursChart){
studyHoursChart.destroy();
}

studyHoursChart = new Chart(ctx, {

type: "bar",

data: {

labels: labels,

datasets: [{

label: "Study Hours",

data: data,

backgroundColor: "#42a5f5"

}]

},

options: {

responsive: true,

plugins: {

legend: {
display: false
}

}

}

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

plugins: {

legend: {
display: true
}

}

}

});

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

function generateNotifications(){

const container = document.getElementById("notifications");

if(!container) return;

container.innerHTML = "";

const today = new Date();

let totalStudyHours = 0;

tasks.forEach(task => {

if(task.completed) return;

// Calculate total workload
totalStudyHours += parseFloat(task.studyHours) || 0;

// Deadline checks
if(task.deadline){

const dueDate = new Date(task.deadline);
const daysLeft = Math.floor((dueDate - today)/(1000*60*60*24));

const p = document.createElement("p");

if(daysLeft < 0){
p.innerHTML = `❌ <strong>${task.title}</strong> is overdue!`;
p.style.color = "red";
container.appendChild(p);
}

else if(daysLeft <= 2){
p.innerHTML = `⚠ <strong>${task.title}</strong> due in ${daysLeft} day(s)`;
p.style.color = "orange";
container.appendChild(p);
}

if(daysLeft < 0){
sendNotification("Overdue Task", task.title + " is overdue!");
}

else if(daysLeft <= 2){
sendNotification("Upcoming Task", task.title + " is due soon!");
}

if(daysLeft <= 2 && !alreadyNotified(task.title)){
sendNotification("Upcoming Task", task.title + " is due soon!");
markNotified(task.title);
}

}

});

// Workload warning
if(totalStudyHours > DAILY_LIMIT * 2){

const p = document.createElement("p");

p.innerHTML = `🔥 High workload detected. Consider spreading tasks.`;
p.style.color = "crimson";

container.appendChild(p);

}

// Daily motivation / reminder
if(tasks.length > 0){

const p = document.createElement("p");

p.innerHTML = `📅 Stay consistent! Focus on today's top priorities.`;

container.appendChild(p);

}

}

function sendNotification(title, message){

console.log("Sending notification...");

if(!("Notification" in window)){
alert("Notifications not supported");
return;
}

if(Notification.permission === "granted"){

alert("Permission granted — trying notification");

const n = new Notification(title, {
body: message,
requireInteraction: true
});

console.log("Notification object created:", n);

}
else{
alert("Permission NOT granted");
}

}

function testNotification(){
console.log("Test button clicked");

sendNotification(
"Test Notification",
"If you see this, notifications are working 🎉"
);

}

function markNotified(taskTitle){
notifiedTasks.push(taskTitle);
localStorage.setItem("notifiedTasks", JSON.stringify(notifiedTasks));
}

function alreadyNotified(taskTitle){
return notifiedTasks.includes(taskTitle);
}

function enableNotifications(){

if(!("Notification" in window)){
alert("Notifications not supported");
return;
}

Notification.requestPermission().then(permission => {

if(permission === "granted"){
alert("Notifications enabled!");
sendNotification("Success", "Notifications are now working 🎉");
}
else{
alert("Permission denied!");
}

});

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

function generatePrediction(){

const container = document.getElementById("prediction");

if(!container) return;

container.innerHTML = "";

const today = new Date();

let totalHours = 0;
let totalDays = 0;

tasks.forEach(task => {

if(task.completed) return;

const hours = parseFloat(task.studyHours) || 0;

if(task.deadline){

const dueDate = new Date(task.deadline);
const daysLeft = (dueDate - today)/(1000*60*60*24);

if(daysLeft > 0){
totalHours += hours;
totalDays += daysLeft;
}

}

});

if(totalHours === 0 || totalDays === 0){
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

// Evaluation
const status = document.createElement("p");

if(requiredPerDay <= DAILY_LIMIT){
status.innerHTML = "✅ You are on track. Keep going!";
status.style.color = "green";
}
else if(requiredPerDay <= DAILY_LIMIT * 1.5){
status.innerHTML = "⚠ You need to increase your study time.";
status.style.color = "orange";
}
else{
status.innerHTML = "🔥 High risk! You may miss deadlines.";
status.style.color = "red";
}

container.appendChild(status);

}

function loginUser(){

const username = document.getElementById("username").value.trim();

if(!username){
alert("Enter a username");
return;
}

// create user if doesn't exist
if(!users[username]){
users[username] = [];
}

currentUser = username;

localStorage.setItem("users", JSON.stringify(users));
localStorage.setItem("currentUser", username);

loadUserTasks();
updateCurrentUserUI();

}

function logoutUser(){

currentUser = null;

localStorage.removeItem("currentUser");

tasks = [];

refreshDashboard();
updateCurrentUserUI();

}

function loadUserTasks(){

if(currentUser && users[currentUser]){
tasks = users[currentUser];
}
else{
tasks = [];
}

refreshDashboard();

}

function updateCurrentUserUI(){

const display = document.getElementById("currentUserDisplay");

if(!display) return;

if(currentUser){
display.textContent = "Logged in as: " + currentUser;
}
else{
display.textContent = "No user logged in";
}

}

if(currentUser){
loadUserTasks();
updateCurrentUserUI();
}