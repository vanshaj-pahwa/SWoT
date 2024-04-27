package com.workout.tracker.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "USER_X_WORKOUT")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserWorkout {

    @Id
    @GeneratedValue
    private int userWorkoutId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User userId;
    private String workoutName;


}
