package com.workout.tracker.services;

import com.workout.tracker.entities.User;
import com.workout.tracker.entities.UserWorkout;
import com.workout.tracker.repositories.UserRepository;
import com.workout.tracker.repositories.UserWorkoutRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    public int addUserWorkout(int userId, String workoutName){
        UserWorkout userWorkout = UserWorkout.builder()
                .userId(userRepository.findById(userId).get())
                        .workoutName(workoutName).build();
        UserWorkout savedWorkout = userWorkoutRepository.save(userWorkout);
        return savedWorkout.getUserWorkoutId();
    }

    public List<Map<String, Object>> viewUserWorkout(int userId){
        List<Object[]> resultList = userWorkoutRepository.findByUserId(userId);
        List<Map<String, Object>> workoutList = new ArrayList<>();
        for (Object[] result : resultList) {
            Map<String, Object> workoutMap = new HashMap<>();
            workoutMap.put("userWorkoutId", result[0]);
            workoutMap.put("workoutName", result[1]);
            workoutList.add(workoutMap);
        }
        return workoutList;
    }

    public void deleteUserWorkoutById(int userWorkoutId) {
        userWorkoutRepository.findById(userWorkoutId)
                .orElseThrow(() -> new IllegalArgumentException("Workout not found with ID: " + userWorkoutId));

        userWorkoutRepository.deleteUserWorkoutById(userWorkoutId);
    }
}
