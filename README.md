# 🎓 Student Study Task Planner

## Project Overview

The Student Study Task Planner is a responsive web application designed to help students organise and manage their academic study tasks.

Users can create, view, edit and delete study tasks and monitor their workload through dashboard statistics, progress indicators, charts, filtering, calendar functionality and study planning features.
The application enables users to manage assignments, exams, quizzes, and study sessions while providing smart scheduling, analytics, deadline tracking, and productivity insights.

---

## 🚀 Live Demo

View the live application:

https://nathalifernando.github.io/Student_Study_Task_Planner/

---

## 📷 Screenshots

### Login Page
<img width="1540" height="845" alt="image" src="https://github.com/user-attachments/assets/e3989027-5765-48bb-a358-cba2dc75913c" />

### Dashboard
<img width="1895" height="1067" alt="Screenshot 2026-07-01 211852" src="https://github.com/user-attachments/assets/98847aa6-7b73-4c08-9dd6-f3e28f1bc630" />

### Calendar
<img width="936" height="767" alt="Screenshot 2026-07-01 212714" src="https://github.com/user-attachments/assets/f5a14e7a-5ad5-4cf5-9eb8-e91947e2a551" />

### Analytics
<img width="937" height="721" alt="Screenshot 2026-07-01 212616" src="https://github.com/user-attachments/assets/2273ee1f-a048-42c4-bc88-8a4c8d264542" />

---

## ✨ Features

## Main Features

* Create study tasks
* View study tasks
* Edit study tasks
* Delete study tasks
* Task priority calculation
* Task status management
* Deadline management
* Study-hour estimation
* Dashboard statistics
* Progress tracking
* Charts and analytics
* Calendar view
* Search and filtering
* Responsive desktop, tablet and mobile layouts
* Dark mode
* CSV import/export

### 👤 User Authentication
- User registration
- User login and logout
- User-specific task storage
- Session persistence

### 📚 Task Management
- Add study tasks
- Edit existing tasks
- Delete tasks
- Mark tasks as completed
- Automatic priority calculation
- Search tasks
- Sort by deadline
- Filter by priority and completion status

### 📅 Planning & Scheduling
- Interactive calendar
- Weekly study plan
- Daily study timetable
- Upcoming tasks section
- Deadline warnings

### 📊 Analytics Dashboard
- Study progress chart
- Task category chart
- Study hours per course chart
- Progress tracking
- Smart insights
- Study workload prediction

### 🔔 Smart Features
- Browser notifications
- Deadline reminders
- Smart notifications panel
- Dark mode
- Responsive user interface

### 📁 Data Management
- Import tasks from CSV
- Export tasks to CSV
- Local Storage persistence

---

## Technologies

### Frontend

* HTML5
* CSS3
* JavaScript
* Chart.js
* FullCalendar
* Font Awesome

### Backend

* Java
* Spring Boot
* Spring Data JPA
* Hibernate
* H2 Database
* Maven

---

## Backend API

The application provides a REST API for task management.

### Get all tasks

GET `/api/tasks`

### Get one task

GET `/api/tasks/{id}`

### Create a task

POST `/api/tasks`

### Update a task

PUT `/api/tasks/{id}`

### Delete a task

DELETE `/api/tasks/{id}`

## Running the Backend

Make sure Java and Maven are installed.

From the project root directory, run:

```bash
mvn -f backend/pom.xml spring-boot:run
```

The Spring Boot application runs on:

`http://localhost:8080`

The task API is available at:

`http://localhost:8080/api/tasks`

## Running the Frontend

Open the `frontend` folder using Visual Studio Code and start the application using Live Server.

Open the frontend through the local Live Server URL, for example:

`http://127.0.0.1:5500/frontend/`

The frontend communicates with the Spring Boot backend through the REST API.

## Database

The project uses an H2 file-based database for persistent task storage.

The database files are stored in the backend data directory.

## Testing

The REST API was tested using curl commands.

Tested operations include:

* Creating tasks
* Retrieving all tasks
* Retrieving individual tasks
* Updating tasks
* Deleting tasks
* Verifying persistence
* Testing a nonexistent task and receiving HTTP 404

---

## 📂 Project Structure

Student_Study_Task_Planner/
│
├── backend/
│   ├── src/
│   ├── data/
│   ├── pom.xml
│   └── ...
│
├── frontend/
│   ├── index.html
│   ├── dashboard.html
│   ├── app.js
│   ├── auth.js
│   ├── login.js
│   ├── dashboard.js
│   ├── tasks.js
│   ├── styles.css
│   └── ...
│
├── screenshots/
│
└── README.md

---

## ▶️ How to Run the Project

### Prerequisites

Make sure the following are installed:

- Java JDK
- Maven
- Visual Studio Code
- A modern web browser
- Live Server extension for Visual Studio Code

### 1. Start the backend

Open Terminal 1 and navigate to the project folder:

cd ~/Documents/"Java & Web Development"/Student_Study_Task_Planner

Start the Spring Boot backend:

mvn -f backend/pom.xml spring-boot:run

Keep this terminal running while using the application.

The backend runs on:

http://localhost:8080

The REST API is available at:

http://localhost:8080/api/tasks

### 2. Start the frontend

Open the project folder in Visual Studio Code.

Open the `frontend` folder and launch `index.html` using the Live Server extension.

The frontend will normally open at:

http://127.0.0.1:5500/frontend/

### 3. Use the application

Register a new account or log in.

The application communicates with the Spring Boot backend for task management.

Tasks are stored in the H2 file-based database and therefore persist across page refreshes and Spring Boot restarts.

### Important

The Spring Boot backend must remain running while using the application.

If the backend is stopped, the frontend cannot load, create, update or delete tasks because the REST API is unavailable.

--

## 📸 Application Modules

- Login & Registration
- Dashboard
- Task Management
- Calendar
- Analytics
- Notifications
- Dark Mode

---

## Development Process

The project was developed iteratively. The initial frontend concept was refined during implementation, followed by the development of a Java Spring Boot backend and persistent database storage.

Testing and debugging were performed throughout development using browser developer tools, Live Server, Maven and curl.

---

## 👨‍💻 Author

**Fernando Nathali**

Developed as part of the **Java & Web Development** module.

© 2026
