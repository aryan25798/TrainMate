package com.trainmate.service;

import com.trainmate.dto.LoginRequest;
import com.trainmate.dto.LoginResponse;
import com.trainmate.entity.Role;
import com.trainmate.entity.Trainer;
import com.trainmate.entity.User;
import com.trainmate.repository.TrainerRepository;
import com.trainmate.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TrainerRepository trainerRepository;

    public AuthService(UserRepository userRepository, TrainerRepository trainerRepository) {
        this.userRepository = userRepository;
        this.trainerRepository = trainerRepository;
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

        if (!request.getPassword().trim().equals(user.getPassword())) {
            return LoginResponse.failure("Invalid login ID or password");
        }

        Long coachId = null;
        Long trainerId = null;

        if (user.getRole() == Role.COACH) {
            coachId = user.getId(); // Coach is user directly
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
