package com.trainmate.service;

import com.trainmate.dto.CohortResponse;
import com.trainmate.dto.TrainerDashboardResponse;
import com.trainmate.entity.Cohort;
import com.trainmate.entity.CohortStatus;
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

        // Consolidated cohort metrics in 1 single SQL query
        Object[] metrics = cohortRepository.getTrainerDashboardCohortMetrics(trainerId, today);
        long active = 0L;
        long upcoming = 0L;
        long completed = 0L;

        if (metrics != null && metrics.length > 0) {
            Object[] row = (metrics[0] instanceof Object[]) ? (Object[]) metrics[0] : metrics;
            active = row[0] != null ? ((Number) row[0]).longValue() : 0L;
            upcoming = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            completed = row[2] != null ? ((Number) row[2]).longValue() : 0L;
        }

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

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<CohortResponse> getCohortsPaged(
            Long trainerId, String query, CohortStatus status, org.springframework.data.domain.Pageable pageable) {
        if (!trainerRepository.existsById(trainerId)) {
            throw new ResourceNotFoundException("Trainer not found with ID: " + trainerId);
        }
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        return cohortRepository.findByTrainerFiltered(trainerId, cleanQuery, status, pageable)
                .map(cohortService::mapToResponse);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<CohortResponse> getCohortsPaged(Long trainerId, org.springframework.data.domain.Pageable pageable) {
        return getCohortsPaged(trainerId, null, null, pageable);
    }
}
