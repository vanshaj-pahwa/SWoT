package com.workout.tracker.security;

import com.workout.tracker.dao.request.SignUpRequest;
import com.workout.tracker.dao.request.SigninRequest;
import com.workout.tracker.dao.response.JwtAuthenticationResponse;

public interface AuthenticationService {
    JwtAuthenticationResponse signup(SignUpRequest request);

    JwtAuthenticationResponse signin(SigninRequest request);
}