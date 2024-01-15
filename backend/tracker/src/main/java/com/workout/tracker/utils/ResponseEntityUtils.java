package com.workout.tracker.utils;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ResponseEntityUtils {

    public static <T> ResponseEntity<T> createSuccessResponse(T body) {
        return ResponseEntity.ok(body);
    }

    public static <T> ResponseEntity<T> createNotFoundResponse() {
        return ResponseEntity.notFound().build();
    }

    public static <T> ResponseEntity<?> createErrorResponse(String errorMessage, HttpStatus status) {
        // You can customize this method further based on your needs
        return ResponseEntity.status(status).body(errorMessage);
    }
}

