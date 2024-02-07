package com.workout.tracker.controllers;

import com.workout.tracker.dto.request.ExerciseRequestDto;
import com.workout.tracker.services.UserExcerciseService;
import com.workout.tracker.utils.ResponseEntityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
public class UserExerciseController {

    private final UserExcerciseService userExcerciseService;

    @PostMapping("/addExercise")
    public ResponseEntity<?> addUserExercise(@RequestBody ExerciseRequestDto exerciseRequestDto){
        try {
            userExcerciseService.addUserExcercise(exerciseRequestDto);
            return ResponseEntityUtils.createSuccessResponse("Added Exercise Successfully!","Operation successful.");
        }catch (Exception e) {
            return ResponseEntityUtils.createErrorResponse("Error creating exercises!");
        }
    }

    @GetMapping("/viewExercise")
    public ResponseEntity<?> viewUserExercise(@RequestParam int userId){
        try
            {
                return ResponseEntityUtils.createSuccessResponse(userExcerciseService.viewUserExercise(userId), "Successfully fetched results");
            }
        catch (Exception e) {
            return ResponseEntityUtils.createErrorResponse("Error viewing exercises!");
        }

    }

}
