"use strict";

function renderCalendar(){

const calendarEl = document.getElementById("calendar");

if(!calendarEl) return;

if(tasks.length === 0){

calendarEl.innerHTML = `
<div class="empty-state">
    <i class="fa-solid fa-calendar-xmark"></i>
    <p>No calendar events available 📅</p>
</div>
`;

return;
}

// prepare events
const events = tasks
.filter(task => task.deadline)
.map(task => {

let color = "#4caf50";

if(task.priority === "HIGH") color = "#e53935";
else if(task.priority === "MEDIUM") color = "#fbc02d";

return {
title: task.title + " (" + task.course + ")",
start: task.deadline,
backgroundColor: color,
borderColor: color
};

});

// destroy old calendar if exists
if(calendar){
calendar.destroy();
}

// create new calendar
calendar = new FullCalendar.Calendar(calendarEl, {

initialView: "dayGridMonth",

height: 500,

events: events,

eventClick: function(info){

alert(
info.event.title +
"\nDeadline: " +
info.event.start.toLocaleDateString()
);

},

eventMouseEnter: function(info){

info.el.style.transform = "scale(1.05)";
info.el.style.transition = "0.2s";

},

eventMouseLeave: function(info){

info.el.style.transform = "scale(1)";

}

});

// render
calendar.render();

}