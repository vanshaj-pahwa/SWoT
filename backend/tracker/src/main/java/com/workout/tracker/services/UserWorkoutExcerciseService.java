package com.workout.tracker.services;

import com.workout.tracker.dto.request.WorkoutExcerciseRequestDto;
import com.workout.tracker.entities.UserExcercise;
import com.workout.tracker.entities.UserWorkoutExcercise;
import com.workout.tracker.repositories.UserExcerciseRepository;
import com.workout.tracker.repositories.UserWorkoutExcerciseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserWorkoutExcerciseService {
    private final UserWorkoutExcerciseRepository userWorkoutExcerciseRepository;
    private final UserExcerciseRepository userExcerciseRepository;

    public void addUserWorkoutExcercise(List<WorkoutExcerciseRequestDto> workoutExcerciseRequestDtos){
        List<UserWorkoutExcercise> userWorkoutExcercises = new ArrayList<>();
        workoutExcerciseRequestDtos.forEach(workoutExcerciseRequestDto -> userWorkoutExcercises.add(UserWorkoutExcercise.builder()
                .userExcercise(userExcerciseRepository.findById(workoutExcerciseRequestDto.getUserExcerciseId()).get())
                        .weight(workoutExcerciseRequestDto.getWeight())
                        .reps(workoutExcerciseRequestDto.getReps())
                        .dateTime(LocalDateTime.now())
                .build()));
        log.info(userWorkoutExcercises.toString());
        userWorkoutExcerciseRepository.saveAll(userWorkoutExcercises);
    }

}
