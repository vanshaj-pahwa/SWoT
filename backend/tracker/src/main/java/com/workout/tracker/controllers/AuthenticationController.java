package com.workout.tracker.controllers;

import com.workout.tracker.dao.request.SignUpRequest;
import com.workout.tracker.dao.request.SigninRequest;
import com.workout.tracker.dao.response.JwtAuthenticationResponse;
import com.workout.tracker.security.AuthenticationService;
import com.workout.tracker.utils.ResponseEntityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignUpRequest request) {
        try {
            return ResponseEntity.ok(authenticationService.signup(request));
        }
        catch (Exception e){
            return ResponseEntityUtils.createErrorResponse("Already registered for this emailId!", HttpStatus.FORBIDDEN);
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody SigninRequest request) {
        return ResponseEntity.ok(authenticationService.signin(request));
    }
}
