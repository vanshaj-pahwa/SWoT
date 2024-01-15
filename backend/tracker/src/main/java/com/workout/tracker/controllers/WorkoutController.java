package com.workout.tracker.controllers;

import com.workout.tracker.services.WorkoutService;
import com.workout.tracker.utils.ResponseEntityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WorkoutController {

    private WorkoutService workoutService;

    @Autowired
    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @PostMapping("/workout")
    public ResponseEntity<?> addWorkout(@RequestParam String workoutType){

        try {
            // Perform data creation logic
            workoutService.addWorkout(workoutType);
            return ResponseEntityUtils.createSuccessResponse("Workout saved successfully!");
        } catch (Exception e) {
            return ResponseEntityUtils.createErrorResponse("Error creating data", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
