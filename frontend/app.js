const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = document.getElementById("title").value;
    const course = document.getElementById("course").value;
    const taskType = document.getElementById("taskType").value;
    const deadline = document.getElementById("deadline").value;
    const studyHours = document.getElementById("studyHours").value;

    let priority = "Low";

    if (deadline) {

        const today = new Date();
        const dueDate = new Date(deadline);

        const difference = dueDate - today;
        const daysLeft = difference / (1000 * 60 * 60 * 24);

        if (daysLeft <= 2) {
            priority = "HIGH";
        } else if (daysLeft <= 5) {
            priority = "MEDIUM";
        } else {
            priority = "LOW";
        }
    }

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
        studyHours +
        " | Priority: " +
        priority;

    taskList.appendChild(li);

    form.reset();

});
