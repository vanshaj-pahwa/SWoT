package com.workout.tracker.services;

import com.workout.tracker.entities.User;
import com.workout.tracker.entities.UserWorkout;
import com.workout.tracker.repositories.UserRepository;
import com.workout.tracker.repositories.UserWorkoutRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class UserWorkoutService {

    private final UserWorkoutRepository userWorkoutRepository;

    private final UserRepository userRepository;

    @Autowired
    public UserWorkoutService(UserWorkoutRepository userWorkoutRepository, UserRepository userRepository) {
        this.userWorkoutRepository = userWorkoutRepository;
        this.userRepository = userRepository;
    }

    public void addUserWorkout(int userId, String workoutName){
        UserWorkout userWorkout = UserWorkout.builder()
                .userId(userRepository.findById(userId).get())
                        .workoutName(workoutName).build();
        userWorkoutRepository.save(userWorkout);
    }

    public List<String> viewUserWorkout(int userId){
        return userWorkoutRepository.findByUserId(userId);
    }

}
