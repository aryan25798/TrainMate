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

    @Query("SELECT c.cohortCode FROM Cohort c WHERE c.cohortCode IN :codes")
    java.util.Set<String> findExistingCohortCodes(@Param("codes") java.util.Collection<String> codes);

    @Query("SELECT DISTINCT c.serviceLine FROM Cohort c WHERE c.serviceLine IS NOT NULL AND c.serviceLine != '' ORDER BY c.serviceLine ASC")
    List<String> findDistinctServiceLines();

    // Consolidated Dashboard Aggregations (Single-query instead of multiple round-trips)
    @Query("SELECT " +
           "COUNT(c), " +
           "SUM(CASE WHEN c.status = com.trainmate.entity.CohortStatus.ASSIGNED THEN 1L ELSE 0L END), " +
           "SUM(CASE WHEN c.status = com.trainmate.entity.CohortStatus.UNASSIGNED THEN 1L ELSE 0L END), " +
           "SUM(CASE WHEN c.status = com.trainmate.entity.CohortStatus.PENDING THEN 1L ELSE 0L END), " +
           "SUM(CASE WHEN c.status = com.trainmate.entity.CohortStatus.ACTIVE THEN 1L ELSE 0L END), " +
           "SUM(CASE WHEN c.status = com.trainmate.entity.CohortStatus.COMPLETED THEN 1L ELSE 0L END) " +
           "FROM Cohort c")
    Object[] getAdminCohortMetrics();

    @Query("SELECT " +
           "COUNT(c), " +
           "SUM(CASE WHEN c.status = com.trainmate.entity.CohortStatus.ASSIGNED THEN 1L ELSE 0L END), " +
           "SUM(CASE WHEN c.status = com.trainmate.entity.CohortStatus.UNASSIGNED THEN 1L ELSE 0L END), " +
           "SUM(CASE WHEN c.startDate > :today THEN 1L ELSE 0L END) " +
           "FROM Cohort c WHERE c.coachUser.id = :coachUserId")
    Object[] getCoachDashboardMetrics(@Param("coachUserId") Long coachUserId, @Param("today") LocalDate today);

    @Query("SELECT " +
           "SUM(CASE WHEN c.startDate <= :today AND c.endDate >= :today THEN 1L ELSE 0L END), " +
           "SUM(CASE WHEN c.startDate > :today THEN 1L ELSE 0L END), " +
           "SUM(CASE WHEN c.endDate < :today THEN 1L ELSE 0L END) " +
           "FROM Cohort c WHERE c.assignedTrainer.id = :trainerId")
    Object[] getTrainerDashboardCohortMetrics(@Param("trainerId") Long trainerId, @Param("today") LocalDate today);

    // Optimized Server-Side Search, Filter, and Pagination (Eliminates N+1 with JOIN FETCH)
    @Query(value = "SELECT c FROM Cohort c " +
                   "LEFT JOIN FETCH c.coachUser " +
                   "LEFT JOIN FETCH c.assignedTrainer t " +
                   "LEFT JOIN FETCH t.user " +
                   "WHERE (:status IS NULL OR c.status = :status) " +
                   "AND (:serviceLine IS NULL OR :serviceLine = '' OR c.serviceLine = :serviceLine) " +
                   "AND (:search IS NULL OR :search = '' OR (" +
                   "   LOWER(c.cohortCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                   "   LOWER(c.requiredSkill) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                   "   LOWER(c.stream) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                   "   LOWER(c.location) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                   "   LOWER(c.coachUser.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                   "   (t IS NOT NULL AND LOWER(t.user.name) LIKE LOWER(CONCAT('%', :search, '%')))" +
                   "))",
           countQuery = "SELECT COUNT(c) FROM Cohort c " +
                        "LEFT JOIN c.coachUser " +
                        "LEFT JOIN c.assignedTrainer t " +
                        "WHERE (:status IS NULL OR c.status = :status) " +
                        "AND (:serviceLine IS NULL OR :serviceLine = '' OR c.serviceLine = :serviceLine) " +
                        "AND (:search IS NULL OR :search = '' OR (" +
                        "   LOWER(c.cohortCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "   LOWER(c.requiredSkill) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "   LOWER(c.stream) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "   LOWER(c.location) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "   LOWER(c.coachUser.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "   (t IS NOT NULL AND LOWER(t.user.name) LIKE LOWER(CONCAT('%', :search, '%')))" +
                        "))")
    Page<Cohort> findAllFiltered(
            @Param("search") String search,
            @Param("status") CohortStatus status,
            @Param("serviceLine") String serviceLine,
            Pageable pageable);

    @Query(value = "SELECT c FROM Cohort c " +
                   "LEFT JOIN FETCH c.coachUser " +
                   "LEFT JOIN FETCH c.assignedTrainer t " +
                   "LEFT JOIN FETCH t.user " +
                   "WHERE c.coachUser.id = :coachUserId " +
                   "AND (:status IS NULL OR c.status = :status) " +
                   "AND (:serviceLine IS NULL OR :serviceLine = '' OR c.serviceLine = :serviceLine) " +
                   "AND (:search IS NULL OR :search = '' OR (" +
                   "   LOWER(c.cohortCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                   "   LOWER(c.requiredSkill) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                   "   LOWER(c.stream) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                   "   LOWER(c.location) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                   "   (t IS NOT NULL AND LOWER(t.user.name) LIKE LOWER(CONCAT('%', :search, '%')))" +
                   "))",
           countQuery = "SELECT COUNT(c) FROM Cohort c " +
                        "LEFT JOIN c.coachUser " +
                        "LEFT JOIN c.assignedTrainer t " +
                        "WHERE c.coachUser.id = :coachUserId " +
                        "AND (:status IS NULL OR c.status = :status) " +
                        "AND (:serviceLine IS NULL OR :serviceLine = '' OR c.serviceLine = :serviceLine) " +
                        "AND (:search IS NULL OR :search = '' OR (" +
                        "   LOWER(c.cohortCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "   LOWER(c.requiredSkill) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "   LOWER(c.stream) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "   LOWER(c.location) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "   (t IS NOT NULL AND LOWER(t.user.name) LIKE LOWER(CONCAT('%', :search, '%')))" +
                        "))")
    Page<Cohort> findByCoachFiltered(
            @Param("coachUserId") Long coachUserId,
            @Param("search") String search,
            @Param("status") CohortStatus status,
            @Param("serviceLine") String serviceLine,
            Pageable pageable);

    @Query(value = "SELECT c FROM Cohort c " +
                   "LEFT JOIN FETCH c.coachUser " +
                   "LEFT JOIN FETCH c.assignedTrainer t " +
                   "LEFT JOIN FETCH t.user " +
                   "WHERE c.assignedTrainer.id = :trainerId " +
                   "AND (:status IS NULL OR c.status = :status) " +
                   "AND (:search IS NULL OR :search = '' OR (" +
                   "   LOWER(c.cohortCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                   "   LOWER(c.requiredSkill) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                   "   LOWER(c.stream) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                   "   LOWER(c.location) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                   "   LOWER(c.coachUser.name) LIKE LOWER(CONCAT('%', :search, '%'))" +
                   "))",
           countQuery = "SELECT COUNT(c) FROM Cohort c " +
                        "LEFT JOIN c.coachUser " +
                        "WHERE c.assignedTrainer.id = :trainerId " +
                        "AND (:status IS NULL OR c.status = :status) " +
                        "AND (:search IS NULL OR :search = '' OR (" +
                        "   LOWER(c.cohortCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "   LOWER(c.requiredSkill) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "   LOWER(c.stream) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "   LOWER(c.location) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "   LOWER(c.coachUser.name) LIKE LOWER(CONCAT('%', :search, '%'))" +
                        "))")
    Page<Cohort> findByTrainerFiltered(
            @Param("trainerId") Long trainerId,
            @Param("search") String search,
            @Param("status") CohortStatus status,
            Pageable pageable);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("UPDATE Cohort c SET c.assignedTrainer = null, c.status = com.trainmate.entity.CohortStatus.UNASSIGNED WHERE c.assignedTrainer.id IN :trainerIds")
    int unassignTrainersIn(@Param("trainerIds") List<Long> trainerIds);
}
