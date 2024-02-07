package com.workout.tracker.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "USER_X_EXCERCISE")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class UserExcercise {

    @Id
    @GeneratedValue
    @Column(name = "user_excercise_id")
    private int userExcerciseId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User userId;
    private String workoutName;
    private String exerciseName;
}
