package com.trainmate.service;

import com.trainmate.dto.CohortResponse;
import com.trainmate.dto.TrainerDashboardResponse;
import com.trainmate.entity.Cohort;
import com.trainmate.entity.Trainer;
import com.trainmate.exception.ResourceNotFoundException;
import com.trainmate.repository.CohortRepository;
import com.trainmate.repository.NotificationRepository;
import com.trainmate.repository.TrainerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrainerService {

    private final TrainerRepository trainerRepository;
    private final CohortRepository cohortRepository;
    private final NotificationRepository notificationRepository;
    private final CohortService cohortService;

    public TrainerService(
            TrainerRepository trainerRepository,
            CohortRepository cohortRepository,
            NotificationRepository notificationRepository,
            CohortService cohortService
    ) {
        this.trainerRepository = trainerRepository;
        this.cohortRepository = cohortRepository;
        this.notificationRepository = notificationRepository;
        this.cohortService = cohortService;
    }

    @Transactional(readOnly = true)
    public TrainerDashboardResponse getDashboard(Long trainerId) {
        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer not found with ID: " + trainerId));

        LocalDate today = LocalDate.now();

        // FRD Section 45:
        // Active: startDate <= today AND endDate >= today
        long active = cohortRepository.countByAssignedTrainerIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                trainerId, today, today);

        // Upcoming: startDate > today
        long upcoming = cohortRepository.countByAssignedTrainerIdAndStartDateAfter(trainerId, today);

        // Completed: endDate < today
        long completed = cohortRepository.countByAssignedTrainerIdAndEndDateBefore(trainerId, today);

        // Mail count for trainer's user account (unread only)
        long unread = notificationRepository.countByReceiverUserIdAndIsReadFalse(trainer.getUser().getId());

        return new TrainerDashboardResponse(active, upcoming, completed, unread);
    }

    @Transactional(readOnly = true)
    public List<CohortResponse> getCohorts(Long trainerId) {
        if (!trainerRepository.existsById(trainerId)) {
            throw new ResourceNotFoundException("Trainer not found with ID: " + trainerId);
        }

        List<Cohort> cohorts = cohortRepository.findByAssignedTrainerIdOrderByStartDateAsc(trainerId);
        return cohorts.stream().map(cohortService::mapToResponse).collect(Collectors.toList());
    }
}
