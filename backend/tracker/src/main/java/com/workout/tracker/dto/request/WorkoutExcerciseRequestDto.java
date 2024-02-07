package com.workout.tracker.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WorkoutExcerciseRequestDto {
    private int userExcerciseId;
    private int weight;
    private int reps;
}
