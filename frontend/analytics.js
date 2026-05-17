/*
=========================================
SMART STUDY PLANNER - ANALYTICS
=========================================

Features:
- Progress charts
- Study hour analytics
- Predictions
- Smart insights

Author: Fernando Nathali
=========================================
*/

"use strict";

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
}, 

options:{
responsive:true,
maintainAspectRatio:false
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
}, 

options:{
responsive:true,
maintainAspectRatio:false
}

});

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

maintainAspectRatio:false,

plugins: {

legend: {
display: false
}

}

}

});

}

function generateInsights(){

const container = document.getElementById("insights");

if(!container) return;

container.innerHTML = "";

if(tasks.length === 0){
container.innerHTML = "No insights available.";
return;
}

const completed =
tasks.filter(t=>t.completed).length;

const completionRate =
Math.round((completed/tasks.length)*100);

const courseCount = {};

tasks.forEach(task=>{

if(!courseCount[task.course]){
courseCount[task.course] = 0;
}

courseCount[task.course]++;

});

const topCourse =
Object.keys(courseCount).reduce((a,b)=>
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