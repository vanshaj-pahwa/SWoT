package com.workout.tracker.controllers;

import com.workout.tracker.dao.request.SignUpRequest;
import com.workout.tracker.dao.request.SigninRequest;
import com.workout.tracker.security.AuthenticationService;
import com.workout.tracker.utils.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import lombok.RequiredArgsConstructor;

import static com.workout.tracker.utils.Constants.SUCCESS_MESSAGE;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignUpRequest request) {
        try {

            return new ResponseEntity<>(ApiResponse.builder().status(SUCCESS_MESSAGE).body(authenticationService.signup(request)).message("Succesfully signed up!").build(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Already registered for this emailId!", HttpStatus.FORBIDDEN);
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody SigninRequest request) {
        return new ResponseEntity<>(ApiResponse.builder().status(SUCCESS_MESSAGE).body(authenticationService.signin(request)).message("Successfully signed in!").build(), HttpStatus.OK);
    }
}
