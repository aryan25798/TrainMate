package com.trainmate.repository;

import com.trainmate.entity.Cohort;
import com.trainmate.entity.CohortStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CohortRepository extends JpaRepository<Cohort, Long> {
    Optional<Cohort> findByCohortCode(String cohortCode);
    boolean existsByCohortCode(String cohortCode);

    List<Cohort> findByCoachUserIdOrderByCreatedDateDesc(Long coachUserId);
    List<Cohort> findByAssignedTrainerIdOrderByStartDateAsc(Long trainerId);
    List<Cohort> findAllByOrderByCreatedDateDesc();

    // Coach Dashboard Counts
    long countByCoachUserId(Long coachUserId);
    long countByCoachUserIdAndStatus(Long coachUserId, CohortStatus status);
    long countByCoachUserIdAndStartDateAfter(Long coachUserId, LocalDate date);

    // Trainer Dashboard Counts
    long countByAssignedTrainerId(Long trainerId);
    long countByAssignedTrainerIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(Long trainerId, LocalDate start, LocalDate end);
    long countByAssignedTrainerIdAndStartDateAfter(Long trainerId, LocalDate date);
    long countByAssignedTrainerIdAndEndDateBefore(Long trainerId, LocalDate date);

    // Admin Dashboard Counts
    long countByStatus(CohortStatus status);
}
