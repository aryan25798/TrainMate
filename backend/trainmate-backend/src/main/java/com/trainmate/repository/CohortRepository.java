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
    Page<Cohort> findByCoachUserIdOrderByCreatedDateDesc(Long coachUserId, Pageable pageable);
    List<Cohort> findByAssignedTrainerIdOrderByStartDateAsc(Long trainerId);
    Page<Cohort> findByAssignedTrainerIdOrderByStartDateAsc(Long trainerId, Pageable pageable);
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

    @Query("SELECT c.assignedTrainer.id, COUNT(c) FROM Cohort c WHERE c.assignedTrainer IS NOT NULL GROUP BY c.assignedTrainer.id")
    List<Object[]> countCohortsGroupedByTrainer();

    @Query("SELECT c.assignedTrainer.id, COUNT(c) FROM Cohort c WHERE c.id IN :cohortIds AND c.assignedTrainer IS NOT NULL GROUP BY c.assignedTrainer.id")
    List<Object[]> countAssignedCohortsByTrainer(@Param("cohortIds") List<Long> cohortIds);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM Cohort c WHERE c.id IN :cohortIds")
    int deleteByIdIn(@Param("cohortIds") List<Long> cohortIds);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("UPDATE Cohort c SET c.assignedTrainer = null, c.status = com.trainmate.entity.CohortStatus.UNASSIGNED WHERE c.assignedTrainer.id IN :trainerIds")
    int unassignTrainersIn(@Param("trainerIds") List<Long> trainerIds);
}
