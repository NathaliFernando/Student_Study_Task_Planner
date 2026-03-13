const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const sortOption = document.getElementById("sortOption");
const themeToggle = document.getElementById("themeToggle");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");
const importBtn = document.getElementById("importBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "ALL";

let taskChart;
let categoryChart;
let studyHoursChart;

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

let priority = "LOW";

if(deadline){

const today = new Date();
const dueDate = new Date(deadline);

const difference = dueDate - today;
const daysLeft = difference / (1000*60*60*24);

if(daysLeft <= 2) priority = "HIGH";
else if(daysLeft <= 5) priority = "MEDIUM";
else priority = "LOW";

}

const task = {
title,
course,
taskType,
deadline,
studyHours,
priority,
completed:false
};

tasks.push(task);

saveTasks();
refreshDashboard();

form.reset();

});

function saveTasks(){
localStorage.setItem("tasks", JSON.stringify(tasks));
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
.map(task => ({
title: task.title + " (" + task.course + ")",
start: task.deadline
}));

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