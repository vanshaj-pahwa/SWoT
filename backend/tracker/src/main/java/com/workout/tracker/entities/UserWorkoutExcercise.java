package com.workout.tracker.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "USER_X_WORKOUT_X_EXCERCISE")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class UserWorkoutExcercise {
    @Id
    @GeneratedValue
    private int userWorkoutExcerciseId;

    private int setNumber;
    @ManyToOne
    @JoinColumn(name="user_excercise_id", referencedColumnName = "user_excercise_id")
    private UserExcercise userExcercise;

    private int weight;
    private int reps;
    private LocalDateTime dateTime;
}
