"use strict";

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

if(Notification.permission === "granted"){
new Notification(title, {
body: message
});
}

}

function enableNotifications(){

if(!("Notification" in window)){
alert("Notifications not supported");
return;
}

// Already granted → NO popup
if(Notification.permission === "granted"){
console.log("Already enabled");
return;
}

Notification.requestPermission().then(permission => {

if(permission === "granted"){
showToast("Notifications enabled successfully ✅");
}
else{
alert("Permission denied ❌");
}

});

}

function disableNotifications(){

showToast(
"Disable notifications from browser settings."
);

}