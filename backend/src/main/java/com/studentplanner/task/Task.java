package com.studentplanner.task;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long taskId;

    private String title;

    private String course;

    private String taskType;

    private String deadline;

    private double estimatedStudyHours;

    private String priority;

    private String status;

    public Task() {

    }

    public Task(Long taskId, String title, String course, String taskType,
                String deadline, double estimatedStudyHours,
                String priority, String status) {

        this.taskId = taskId;
        this.title = title;
        this.course = course;
        this.taskType = taskType;
        this.deadline = deadline;
        this.estimatedStudyHours = estimatedStudyHours;
        this.priority = priority;
        this.status = status;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public String getTaskType() {
        return taskType;
    }

    public void setTaskType(String taskType) {
        this.taskType = taskType;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    public double getEstimatedStudyHours() {
        return estimatedStudyHours;
    }

    public void setEstimatedStudyHours(double estimatedStudyHours) {
        this.estimatedStudyHours = estimatedStudyHours;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}