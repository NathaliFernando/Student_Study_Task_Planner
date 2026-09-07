package com.studentplanner.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.studentplanner")
@EnableJpaRepositories(basePackages = "com.studentplanner.task")
@EntityScan(basePackages = "com.studentplanner.task")
public class StudentStudyTaskPlannerApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudentStudyTaskPlannerApplication.class, args);
    }
}