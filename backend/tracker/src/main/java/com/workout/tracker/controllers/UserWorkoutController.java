package com.workout.tracker.controllers;

import com.workout.tracker.services.UserWorkoutService;
import com.workout.tracker.utils.ResponseEntityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin
public class UserWorkoutController {
    private final UserWorkoutService userWorkoutService;

    @PostMapping("/customWorkout")
    public ResponseEntity addCustomWorkout(@RequestParam int userId, @RequestParam String workoutName){
        try {
            int workoutId = userWorkoutService.addUserWorkout(userId, workoutName);
            Map<String, Integer> responseMap = new HashMap<>();
            responseMap.put("userWorkoutId", workoutId);
            return ResponseEntityUtils.createSuccessResponse(responseMap,"Custom Workout Added Successfully!");
        }
        catch (Exception e){
            return ResponseEntityUtils.createErrorResponse("Error saving custom workout");
        }
    }

    @GetMapping("/viewCustomWorkouts")
    public ResponseEntity viewCustomWorkout(@RequestParam int userId){
        try{
            List<Map<String, Object>> workoutList = userWorkoutService.viewUserWorkout(userId);
            return ResponseEntityUtils.createSuccessResponse(workoutList, "Successfully fetched the results.");
        } catch (Exception e){
            return ResponseEntityUtils.createErrorResponse("Error fetching custom workouts");
        }
    }

    @DeleteMapping("/deleteCustomWorkout/{userWorkoutId}")
    public ResponseEntity deleteCustomWorkout(@PathVariable int userWorkoutId) {
        try {
            userWorkoutService.deleteUserWorkoutById(userWorkoutId);
            return ResponseEntityUtils.createSuccessResponse("Custom Workout deleted successfully!", "Operation Successful!");
        } catch (Exception e) {
            return ResponseEntityUtils.createErrorResponse("Error deleting custom workout");
        }
    }

}
