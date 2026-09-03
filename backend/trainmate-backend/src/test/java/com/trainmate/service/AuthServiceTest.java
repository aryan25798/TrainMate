package com.trainmate.service;

import com.trainmate.dto.LoginRequest;
import com.trainmate.dto.LoginResponse;
import com.trainmate.entity.Role;
import com.trainmate.entity.User;
import com.trainmate.repository.TrainerRepository;
import com.trainmate.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TrainerRepository trainerRepository;

    @InjectMocks
    private AuthService authService;

    private User coachUser;

    @BeforeEach
    void setUp() {
        coachUser = new User(1L, "Amit Sharma", "coach01@cognizant.com", "password123", Role.COACH);
    }

    @Test
    void testLoginSuccess_Coach() {
        when(userRepository.findByIdentifier("coach01")).thenReturn(Optional.of(coachUser));

        LoginResponse response = authService.login(new LoginRequest("coach01", "password123"));

        assertTrue(response.isSuccess());
        assertEquals("Login successful", response.getMessage());
        assertEquals(1L, response.getUserId());
        assertEquals("Amit Sharma", response.getName());
        assertEquals("COACH", response.getRole());
    }

    @Test
    void testLoginWrongPassword() {
        when(userRepository.findByIdentifier("coach01")).thenReturn(Optional.of(coachUser));

        LoginResponse response = authService.login(new LoginRequest("coach01", "wrongpassword"));

        assertFalse(response.isSuccess());
    }

    @Test
    void testLoginUserNotFound() {
        when(userRepository.findByIdentifier("unknown")).thenReturn(Optional.empty());

        LoginResponse response = authService.login(new LoginRequest("unknown", "pass"));

        assertFalse(response.isSuccess());
    }
}
