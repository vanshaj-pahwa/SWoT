package com.workout.tracker.repositories;

import com.workout.tracker.entities.User;
import com.workout.tracker.entities.UserExcercise;
import com.workout.tracker.projection.UserExerciseProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserExcerciseRepository extends JpaRepository<UserExcercise, Integer> {
    List<UserExerciseProjection> findByUserId(User userId);
}
