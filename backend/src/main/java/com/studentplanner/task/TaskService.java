package com.studentplanner.task;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id).orElse(null);
    }

    public Task createTask(Task task) {

        if (task.getStatus() == null || task.getStatus().isBlank()) {
            task.setStatus("PENDING");
        }

        if (task.getPriority() == null || task.getPriority().isBlank()) {
            task.setPriority("LOW");
        }

        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task updatedTask) {

        Task existingTask = getTaskById(id);

        if (existingTask == null) {
            return null;
        }

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setCourse(updatedTask.getCourse());
        existingTask.setTaskType(updatedTask.getTaskType());
        existingTask.setDeadline(updatedTask.getDeadline());

        existingTask.setEstimatedStudyHours(
                updatedTask.getEstimatedStudyHours()
        );

        existingTask.setPriority(updatedTask.getPriority());
        existingTask.setStatus(updatedTask.getStatus());

        return taskRepository.save(existingTask);
    }

    public boolean deleteTask(Long id) {

        if (!taskRepository.existsById(id)) {
            return false;
        }

        taskRepository.deleteById(id);

        return true;
    }
}