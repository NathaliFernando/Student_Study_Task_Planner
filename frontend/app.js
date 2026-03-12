const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

let tasks = [];

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = document.getElementById("title").value;
    const course = document.getElementById("course").value;
    const taskType = document.getElementById("taskType").value;
    const deadline = document.getElementById("deadline").value;
    const studyHours = document.getElementById("studyHours").value;

    let priority = "LOW";

    if (deadline) {

        const today = new Date();
        const dueDate = new Date(deadline);

        const difference = dueDate - today;
        const daysLeft = difference / (1000 * 60 * 60 * 24);

        if (daysLeft <= 2) {
            priority = "HIGH";
        } 
        else if (daysLeft <= 5) {
            priority = "MEDIUM";
        } 
        else {
            priority = "LOW";
        }
    }

    const task = {
        title,
        course,
        taskType,
        deadline,
        studyHours,
        priority
    };

    tasks.push(task);

    renderTasks();

    form.reset();

});

function renderTasks() {

    taskList.innerHTML = "";

    tasks.sort(function(a, b) {

        const priorityOrder = {
            HIGH: 1,
            MEDIUM: 2,
            LOW: 3
        };

        return priorityOrder[a.priority] - priorityOrder[b.priority];

    });

    tasks.forEach(function(task, index) {

        const li = document.createElement("li");

        li.textContent =
            task.title +
            " | " +
            task.course +
            " | " +
            task.taskType +
            " | Deadline: " +
            task.deadline +
            " | Study Hours: " +
            task.studyHours +
            " | Priority: " +
            task.priority + " ";

        if (task.priority === "HIGH") {
            li.classList.add("high-priority");
        } 
        else if (task.priority === "MEDIUM") {
            li.classList.add("medium-priority");
        } 
        else {
            li.classList.add("low-priority");
        }

        const completeButton = document.createElement("button");
        completeButton.textContent = "Complete";

        completeButton.addEventListener("click", function() {
            li.classList.toggle("completed-task");
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            tasks.splice(index, 1);
            renderTasks();
        });

        li.appendChild(completeButton);
        li.appendChild(deleteButton);

        taskList.appendChild(li);

    });

}
