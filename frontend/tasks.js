/*
=========================================
SMART STUDY PLANNER - TASK MANAGEMENT
=========================================

Features:
- Add tasks
- Edit tasks
- Delete tasks
- Filter tasks
- Search tasks
- Import/export tasks

Author: Fernando Nathali
=========================================
*/

"use strict";

function renderTasks(){

console.log("renderTasks running");
console.log(tasks);

if(!taskList) return;

taskList.innerHTML = "";

let filteredTasks = [...tasks];

const searchText = (searchInput.value || "").toLowerCase();

filteredTasks = filteredTasks.filter(task => {

const title = String(task.title || "").toLowerCase();
const course = String(task.course || "").toLowerCase();

return (
title.includes(searchText) ||
course.includes(searchText)
);

});

if(sortOption.value === "earliest"){

filteredTasks.sort((a,b)=>
new Date(a.deadline) - new Date(b.deadline)
);

}

if(sortOption.value === "latest"){

filteredTasks.sort((a,b)=>
new Date(b.deadline) - new Date(a.deadline)
);

}

filteredTasks.forEach(task => {

const taskCard = document.createElement("div");

taskCard.classList.add("task-card");

if(task.priority === "HIGH"){
taskCard.classList.add("high-priority");
}
else if(task.priority === "MEDIUM"){
taskCard.classList.add("medium-priority");
}
else{
taskCard.classList.add("low-priority");
}

if(task.completed){
taskCard.classList.add("completed-task");
}

taskCard.innerHTML = `

<h3>${task.title}</h3>

<p>📚 ${task.course}</p>

<p>📝 ${task.taskType}</p>

<p>📅 ${task.deadline || "No deadline"}</p>

<p>⏱ ${task.studyHours} hrs</p>

<p>⭐ ${task.priority}</p>

<div class="task-actions">

<button class="complete-btn">✔</button>

<button class="delete-btn">🗑</button>

</div>

`;

const completeButton =
taskCard.querySelector(".complete-btn");

const deleteButton =
taskCard.querySelector(".delete-btn");

completeButton.addEventListener("click", function(){

task.completed = !task.completed;

saveTasks();

refreshDashboard();

});

deleteButton.addEventListener("click", function(){

const index = tasks.indexOf(task);

if(index > -1){

tasks.splice(index,1);

saveTasks();

refreshDashboard();

}

});

taskList.appendChild(taskCard);

});

if(filteredTasks.length === 0){

taskList.innerHTML = `
<div class="empty-state">
<p>No tasks found 🚀</p>
</div>
`;

}

}

function importTasks(){

const file = importFile.files[0];

if(!file){
    showToast("Please select a CSV file");
    return;
}

const reader = new FileReader();

reader.onload = function(event){

    try{

        const csv = event.target.result.trim();

        const lines = csv.split(/\r?\n/);

        lines.shift();

        lines.forEach(line => {

            if(!line.trim()) return;

            // SUPPORT BOTH CSV + TAB FILES
            let values;

            if(line.includes("\t")){
                values = line.split("\t");
            }
            else{
                values = line.split(",");
            }

            if(values.length < 7){
                throw new Error("Invalid CSV structure");
            }

            const title = String(values[0] || "").trim();
            const course = String(values[1] || "").trim();
            const taskType = String(values[2] || "").trim();
            const deadline = String(values[3] || "").trim();
            const studyHours = parseFloat(values[4]) || 0;
            const priority = String(values[5] || "")
                .trim()
                .toUpperCase();

            const completed =
                String(values[6] || "")
                .trim()
                .toLowerCase() === "true";

            if(!title || !course){
                return;
            }

            const task = {

                title,
                course,
                taskType,
                deadline,
                studyHours,
                priority,
                completed,
                priorityScore: 0

            };

            if(typeof calculatePriority === "function"){

                task.priorityScore =
                    calculatePriority(
                        task.taskType,
                        task.deadline,
                        task.studyHours
                    ).score;

            }

            tasks.push(task);

        });

        saveTasks();

        refreshDashboard();

        showToast("Tasks imported successfully ✅");

    }
    catch(error){

        console.error(error);

        showToast("Invalid CSV file");

    }

};

reader.readAsText(file);

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

function clearCompletedTasks(){

tasks = tasks.filter(task => !task.completed);

saveTasks();
refreshDashboard();

showToast("Completed tasks removed ✅");

}

