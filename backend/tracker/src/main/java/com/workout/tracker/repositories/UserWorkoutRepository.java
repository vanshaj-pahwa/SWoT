package com.workout.tracker.repositories;

import com.workout.tracker.entities.UserWorkout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserWorkoutRepository extends JpaRepository<UserWorkout, Integer> {
    @Query("select u.userWorkoutId, u.workoutName from UserWorkout u where u.userId.userId = :userId")
    List<Object[]> findByUserId(int userId);

    @Modifying
    @Transactional
    @Query("delete from UserWorkout u where u.userWorkoutId = :userWorkoutId")
    void deleteUserWorkoutById(int userWorkoutId);
}
