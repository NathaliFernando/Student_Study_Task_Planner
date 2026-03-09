const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

form.addEventListener("submit", function(event){

event.preventDefault();

const title = document.getElementById("title").value;
const course = document.getElementById("course").value;

const li = document.createElement("li");

li.textContent = title + " (" + course + ")";

taskList.appendChild(li);

form.reset();

});
