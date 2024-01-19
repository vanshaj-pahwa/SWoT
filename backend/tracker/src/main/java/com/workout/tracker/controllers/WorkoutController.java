package com.workout.tracker.controllers;

import com.workout.tracker.services.WorkoutService;

import com.workout.tracker.utils.ResponseEntityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
public class WorkoutController {

    private WorkoutService workoutService;

    @Autowired
    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @PostMapping("/workout")
    public ResponseEntity<?> addWorkout(@RequestParam String workoutType){

        try {
            workoutService.addWorkout(workoutType);
            return ResponseEntityUtils.createSuccessResponse("Workout saved successfully!","Operation Successful!");
        } catch (Exception e) {
            return ResponseEntityUtils.createErrorResponse("Error creating data!");
        }
    }

    @GetMapping("/workouts")
    public ResponseEntity<?> getListOfWorkouts(){
        return ResponseEntityUtils.createSuccessResponse(workoutService.getAllWorkouts(),"Successfully fetched records!");
    }
}
