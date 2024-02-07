package com.workout.tracker.repositories;

import com.workout.tracker.entities.UserWorkoutExcercise;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserWorkoutExcerciseRepository extends JpaRepository<UserWorkoutExcercise, Integer> {
}
