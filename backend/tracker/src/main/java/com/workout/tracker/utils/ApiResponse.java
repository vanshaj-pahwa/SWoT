package com.workout.tracker.utils;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T>{
    private String status;
    private T body;
    private String message;
}