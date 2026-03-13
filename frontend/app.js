const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const sortOption = document.getElementById("sortOption");
const themeToggle = document.getElementById("themeToggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "ALL";

let taskChart;

loadTheme();

renderTasks();
updateStats();
checkDeadlines();
updateProgress();
updateChart();
updateUpcomingTasks();

searchInput.addEventListener("input", renderTasks);
sortOption.addEventListener("change", renderTasks);
themeToggle.addEventListener("click", toggleTheme);

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
renderTasks();
updateStats();
checkDeadlines();
updateProgress();
updateChart();
updateUpcomingTasks();

form.reset();

});

function saveTasks(){
localStorage.setItem("tasks", JSON.stringify(tasks));
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
renderTasks();
updateStats();
checkDeadlines();
updateProgress();
updateChart();
updateUpcomingTasks();

});

editButton.addEventListener("click", function(){

const newTitle = prompt("Edit Task Title", task.title);

if(newTitle !== null){
task.title = newTitle;
}

saveTasks();
renderTasks();
updateStats();
updateChart();
updateUpcomingTasks();

});

deleteButton.addEventListener("click", function(){

const index = tasks.indexOf(task);
tasks.splice(index,1);

saveTasks();
renderTasks();
updateStats();
checkDeadlines();
updateProgress();
updateChart();
updateUpcomingTasks();

});

taskList.appendChild(li);

});

}

function updateStats(){

const total = tasks.length;
const completed = tasks.filter(t => t.completed).length;
const highPriority = tasks.filter(t => t.priority === "HIGH").length;

document.getElementById("totalTasks").textContent = total;
document.getElementById("completedTasks").textContent = completed;
document.getElementById("highPriorityTasks").textContent = highPriority;

}

function updateProgress(){

const total = tasks.length;
const completed = tasks.filter(t => t.completed).length;

let percent = 0;

if(total > 0) percent = Math.round((completed/total)*100);

document.getElementById("progressBar").style.width = percent + "%";
document.getElementById("progressText").textContent = percent + "% Completed";

}

function checkDeadlines(){

const warningsDiv = document.getElementById("warnings");
warningsDiv.innerHTML = "";

const today = new Date();

tasks.forEach(function(task){

if(!task.deadline || task.completed) return;

const dueDate = new Date(task.deadline);

const difference = dueDate - today;
const daysLeft = Math.floor(difference/(1000*60*60*24));

const warning = document.createElement("p");

if(daysLeft < 0){

warning.textContent = "⚠ " + task.title + " is OVERDUE!";
warning.style.color = "red";
warningsDiv.appendChild(warning);

}

else if(daysLeft <= 2){

warning.textContent = "⚠ " + task.title + " is due in " + daysLeft + " day(s)";
warning.style.color = "orange";
warningsDiv.appendChild(warning);

}

});

}

function updateChart(){

const completed = tasks.filter(t => t.completed).length;
const pending = tasks.length - completed;

const ctx = document.getElementById("taskChart");

if(taskChart){
taskChart.destroy();
}

taskChart = new Chart(ctx,{

type:"doughnut",

data:{
labels:["Completed Tasks","Pending Tasks"],
datasets:[{
data:[completed,pending],
backgroundColor:["#4CAF50","#ff7043"]
}]
},

options:{
responsive:true,
plugins:{
legend:{
position:"bottom"
}
}
}

});

}

function updateUpcomingTasks(){

const list = document.getElementById("upcomingTasks");
list.innerHTML = "";

const upcoming = tasks
.filter(task => task.deadline && !task.completed)
.sort((a,b)=>new Date(a.deadline)-new Date(b.deadline))
.slice(0,3);

upcoming.forEach(task=>{

const li = document.createElement("li");

li.innerHTML = `
<strong>${task.title}</strong>
<br>
${task.course} - Due: ${task.deadline}
`;

list.appendChild(li);

});

}
