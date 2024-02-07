package com.workout.tracker.controllers;

import com.workout.tracker.services.UserWorkoutService;
import com.workout.tracker.utils.ResponseEntityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
public class UserWorkoutController {
    private final UserWorkoutService userWorkoutService;

    @PostMapping("/customWorkout")
    public ResponseEntity addCustomWorkout(@RequestParam int userId, @RequestParam String workoutName){
        try {
            userWorkoutService.addUserWorkout(userId, workoutName);
            return ResponseEntityUtils.createSuccessResponse("Custom Workout saved successfully!","Operation Successful!");
        }
        catch (Exception e){
            return ResponseEntityUtils.createErrorResponse("Error saving custom workout");
        }
    }

    @GetMapping("/viewCustomWorkouts")
    public ResponseEntity viewCustomWorkout(@RequestParam int userId){
        try{
            return ResponseEntityUtils.createSuccessResponse(userWorkoutService.viewUserWorkout(userId),"Successfully fetched the results.");
        } catch (Exception e){
            return ResponseEntityUtils.createErrorResponse("Error fetching custom workouts");
        }
    }
}
