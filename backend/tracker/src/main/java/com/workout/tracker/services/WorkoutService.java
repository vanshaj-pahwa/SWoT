package com.workout.tracker.services;

import com.workout.tracker.entities.Workout;
import com.workout.tracker.repositories.WorkoutRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class WorkoutService {
    private WorkoutRepository workoutRepository;

    @Autowired
    public WorkoutService(WorkoutRepository workoutRepository) {
        this.workoutRepository = workoutRepository;
    }

    public void addWorkout(String workoutType){
        Workout workout = Workout.builder().workoutType(workoutType).build();
        try{
            workoutRepository.save(workout);
        } catch (Exception e){
            log.info(e.getMessage());
            throw new RuntimeException(e.getMessage());
        }
    }
}
