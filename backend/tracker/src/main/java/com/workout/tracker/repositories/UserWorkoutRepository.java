package com.workout.tracker.repositories;

import com.workout.tracker.entities.UserWorkout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserWorkoutRepository extends JpaRepository<UserWorkout, Integer> {
    @Query("select u.workoutName from UserWorkout u where u.userId.userId = :userId")
    List<String> findByUserId(int userId);
}
