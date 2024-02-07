package com.workout.tracker.controllers;

import com.workout.tracker.dto.request.WorkoutExcerciseRequestDto;
import com.workout.tracker.services.UserWorkoutExcerciseService;
import com.workout.tracker.utils.ResponseEntityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin
public class UserWorkoutExcerciseController {
    private final UserWorkoutExcerciseService userWorkoutExcerciseService;

    @PostMapping("/addExerciseSets")
    public ResponseEntity<?> addExerciseSets(@RequestBody List<WorkoutExcerciseRequestDto> workoutExcerciseRequestDtoList){
        try{
            userWorkoutExcerciseService.addUserWorkoutExcercise(workoutExcerciseRequestDtoList);
            return ResponseEntityUtils.createSuccessResponse("Added the sets to the exercise successfully!", "Save operation successful.");
        } catch (Exception e){
            return ResponseEntityUtils.createErrorResponse("Error saving exercise sets.");
        }
    }
}
