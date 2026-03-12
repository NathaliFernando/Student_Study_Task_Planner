const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "ALL";

renderTasks();
updateStats();

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
        priority,
        completed: false
    };

    tasks.push(task);

    saveTasks();
    renderTasks();
    updateStats();

    form.reset();

});

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function setFilter(filter) {
    currentFilter = filter;
    renderTasks();
}

function renderTasks() {

    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (currentFilter === "HIGH") {
        filteredTasks = tasks.filter(task => task.priority === "HIGH");
    }

    else if (currentFilter === "MEDIUM") {
        filteredTasks = tasks.filter(task => task.priority === "MEDIUM");
    }

    else if (currentFilter === "LOW") {
        filteredTasks = tasks.filter(task => task.priority === "LOW");
    }

    else if (currentFilter === "COMPLETED") {
        filteredTasks = tasks.filter(task => task.completed === true);
    }

    filteredTasks.sort(function(a, b) {

        const priorityOrder = {
            HIGH: 1,
            MEDIUM: 2,
            LOW: 3
        };

        return priorityOrder[a.priority] - priorityOrder[b.priority];

    });

    filteredTasks.forEach(function(task) {

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

        if (task.completed) {
            li.classList.add("completed-task");
        }

        const completeButton = document.createElement("button");
        completeButton.textContent = "Complete";

        completeButton.addEventListener("click", function() {

            task.completed = !task.completed;

            saveTasks();
            renderTasks();
            updateStats();

        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {

            const index = tasks.indexOf(task);

            tasks.splice(index, 1);

            saveTasks();
            renderTasks();
            updateStats();

        });

        li.appendChild(completeButton);
        li.appendChild(deleteButton);

        taskList.appendChild(li);

    });

}

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const highPriority = tasks.filter(task => task.priority === "HIGH").length;

    document.getElementById("totalTasks").textContent = total;

    document.getElementById("completedTasks").textContent = completed;

    document.getElementById("highPriorityTasks").textContent = highPriority;

}
