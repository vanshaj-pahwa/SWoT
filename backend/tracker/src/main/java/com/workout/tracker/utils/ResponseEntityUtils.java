package com.workout.tracker.utils;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static com.workout.tracker.utils.Constants.SUCCESS_MESSAGE;

public class ResponseEntityUtils {

    public static<T> ResponseEntity<?> createSuccessResponse(T body, String message){
        return new ResponseEntity<>( ApiResponse.builder().status(SUCCESS_MESSAGE).body(body).message(message).build(), HttpStatus.OK);
    }

    public static<T> ResponseEntity<?> createErrorResponse(String message){
        return new ResponseEntity<>(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
