package com.trainmate.service;

import com.trainmate.dto.LoginRequest;
import com.trainmate.dto.LoginResponse;
import com.trainmate.entity.Role;
import com.trainmate.entity.Trainer;
import com.trainmate.entity.User;
import com.trainmate.repository.TrainerRepository;
import com.trainmate.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TrainerRepository trainerRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, TrainerRepository trainerRepository, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.trainerRepository = trainerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        if (request == null || request.getLoginId() == null || request.getPassword() == null) {
            return LoginResponse.failure("Invalid login ID or password");
        }

        String input = request.getLoginId().trim();
        Optional<User> userOpt = userRepository.findByIdentifier(input);
        if (userOpt.isEmpty()) {
            return LoginResponse.failure("Invalid login ID or password");
        }

        User user = userOpt.get();
        String rawPassword = request.getPassword().trim();
        String storedPassword = user.getPassword();
        boolean matches = false;
        if (storedPassword != null) {
            if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
                matches = passwordEncoder.matches(rawPassword, storedPassword);
            } else {
                matches = rawPassword.equals(storedPassword.trim());
            }
        }

        if (!matches) {
            return LoginResponse.failure("Invalid login ID or password");
        }

        Long coachId = null;
        Long trainerId = null;

        if (user.getRole() == Role.COACH) {
            coachId = user.getId();
        } else if (user.getRole() == Role.TRAINER) {
            trainerId = trainerRepository.findByUserId(user.getId()).map(Trainer::getId).orElse(null);
        }

        return new LoginResponse(
                true,
                "Login successful",
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                coachId,
                trainerId
        );
    }
}
