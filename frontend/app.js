const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = document.getElementById("title").value;
    const course = document.getElementById("course").value;
    const taskType = document.getElementById("taskType").value;
    const deadline = document.getElementById("deadline").value;
    const studyHours = document.getElementById("studyHours").value;

    const li = document.createElement("li");

    li.textContent =
        title +
        " | " +
        course +
        " | " +
        taskType +
        " | Deadline: " +
        deadline +
        " | Study Hours: " +
        studyHours;

    taskList.appendChild(li);

    form.reset();

});
