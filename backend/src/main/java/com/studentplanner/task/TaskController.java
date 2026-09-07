package com.studentplanner.task;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // Get all tasks
    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    // Get one task
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {

        Task task = taskService.getTaskById(id);

        if (task == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(task);
    }

    // Create a task
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {

        Task createdTask = taskService.createTask(task);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdTask);
    }

    // Update a task
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @RequestBody Task task) {

        Task updatedTask = taskService.updateTask(id, task);

        if (updatedTask == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedTask);
    }

    // Delete a task
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {

        boolean deleted = taskService.deleteTask(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}