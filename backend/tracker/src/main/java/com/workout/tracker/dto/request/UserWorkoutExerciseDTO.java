package com.workout.tracker.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserWorkoutExerciseDTO {
    private int userWorkoutExcerciseId;
    private int userExcerciseId;
    private int weight;
    private int reps;
    private LocalDateTime dateTime;
}
