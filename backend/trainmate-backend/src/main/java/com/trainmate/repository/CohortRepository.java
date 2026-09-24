package com.trainmate.repository;

import com.trainmate.entity.Cohort;
import com.trainmate.entity.CohortStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
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
    Page<Cohort> findAllByOrderByCreatedDateDesc(Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Cohort c WHERE c.id = :id")
    Optional<Cohort> findByIdForUpdate(@Param("id") Long id);

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
