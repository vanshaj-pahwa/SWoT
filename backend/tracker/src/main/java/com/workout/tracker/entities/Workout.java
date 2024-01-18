package com.workout.tracker.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="Workout")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "workout_id")
    private int workoutId;

    @Column(name = "workout_type")
    private String workoutType;
}
