package com.workout.tracker.services;

import com.workout.tracker.dto.request.ExerciseRequestDto;
import com.workout.tracker.entities.User;
import com.workout.tracker.entities.UserExcercise;
import com.workout.tracker.projection.UserExerciseProjection;
import com.workout.tracker.repositories.UserExcerciseRepository;
import com.workout.tracker.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class UserExcerciseService {

    private final UserExcerciseRepository userExcerciseRepository;
    private final UserRepository userRepository;


    @Autowired
    public UserExcerciseService(UserExcerciseRepository userExcerciseRepository, UserRepository userRepository) {
        this.userExcerciseRepository = userExcerciseRepository;
        this.userRepository = userRepository;
    }

    public void addUserExcercise(ExerciseRequestDto exerciseRequestDto){
        UserExcercise userExcercise = UserExcercise.builder()
                .userId(userRepository.findById(exerciseRequestDto.getUserId()).get())
                .workoutName(exerciseRequestDto.getWorkoutName())
                .exerciseName(exerciseRequestDto.getExcerciseName())
                .build();
        userExcerciseRepository.save(userExcercise);
    }

    public List<UserExerciseProjection> viewUserExercise(int userId){
        return userExcerciseRepository.findByUserId(userRepository.findById(userId).get());
    }
}
