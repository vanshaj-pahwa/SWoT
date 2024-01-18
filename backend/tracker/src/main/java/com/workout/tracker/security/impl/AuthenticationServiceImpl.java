package com.workout.tracker.security.impl;

import com.workout.tracker.dao.request.SignUpRequest;
import com.workout.tracker.dao.request.SigninRequest;
import com.workout.tracker.dao.response.JwtAuthenticationResponse;
import com.workout.tracker.entities.User;
import com.workout.tracker.repositories.UserRepository;
import com.workout.tracker.security.AuthenticationService;
import com.workout.tracker.security.JwtService;
import com.workout.tracker.utils.ResponseEntityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    @Override
    public JwtAuthenticationResponse signup(SignUpRequest request) {
        if(userRepository.findByEmailId(request.getEmail()).isPresent())
            throw new RuntimeException("Already registered for this emailId");
        var user = User.builder().name(request.getName())
                .emailId(request.getEmail()).password(passwordEncoder.encode(request.getPassword()))
                .build();
        userRepository.save(user);
        var jwt = jwtService.generateToken(user);
        return JwtAuthenticationResponse.builder().token(jwt).userId(user.getUserId()).userName(user.getName()).emailId(user.getEmailId()).build();
    }

    @Override
    public JwtAuthenticationResponse signin(SigninRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        var user = userRepository.findByEmailId(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));
        var jwt = jwtService.generateToken(user);
        return JwtAuthenticationResponse.builder().token(jwt).userId(user.getUserId()).userName(user.getName()).emailId(user.getEmailId()).build();


    }
}