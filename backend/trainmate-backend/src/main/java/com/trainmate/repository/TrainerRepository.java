package com.trainmate.repository;

import com.trainmate.entity.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

@Repository
public interface TrainerRepository extends JpaRepository<Trainer, Long> {
    Optional<Trainer> findByUserId(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Trainer t WHERE t.id = :id")
    Optional<Trainer> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT t FROM Trainer t LEFT JOIN FETCH t.user")
    List<Trainer> findAllWithUser();

    /** Consolidated Admin Trainer Metrics in ONE single aggregate query */
    @Query("SELECT " +
           "COUNT(t), " +
           "SUM(CASE WHEN t.currentWorkload < t.maxWorkload AND (t.availableTill IS NULL OR t.availableTill >= :today) THEN 1L ELSE 0L END) " +
           "FROM Trainer t")
    Object[] getAdminTrainerMetrics(@Param("today") LocalDate today);

    /** Count trainers who have workload headroom AND whose availability has not expired */
    @Query("SELECT COUNT(t) FROM Trainer t WHERE t.currentWorkload < t.maxWorkload " +
           "AND (t.availableTill IS NULL OR t.availableTill >= :today)")
    long countAvailableTrainers(@Param("today") LocalDate today);

    /** Count trainers who are at capacity OR whose availability has expired */
    @Query("SELECT COUNT(t) FROM Trainer t WHERE t.currentWorkload >= t.maxWorkload " +
           "OR (t.availableTill IS NOT NULL AND t.availableTill < :today)")
    long countUnavailableTrainers(@Param("today") LocalDate today);

    /** Server-side search & pagination for trainers (Eliminates N+1 with JOIN FETCH) */
    @Query(value = "SELECT t FROM Trainer t " +
                   "LEFT JOIN FETCH t.user u " +
                   "WHERE (:search IS NULL OR :search = '' OR (" +
                   "   LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                   "   LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                   "   LOWER(t.skillSet) LIKE LOWER(CONCAT('%', :search, '%'))" +
                   "))",
           countQuery = "SELECT COUNT(t) FROM Trainer t " +
                        "LEFT JOIN t.user u " +
                        "WHERE (:search IS NULL OR :search = '' OR (" +
                        "   LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "   LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "   LOWER(t.skillSet) LIKE LOWER(CONCAT('%', :search, '%'))" +
                        "))")
    org.springframework.data.domain.Page<Trainer> findAllFiltered(
            @Param("search") String search,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("UPDATE Trainer t SET t.currentWorkload = CASE WHEN (t.currentWorkload - :decrement) < 0 THEN 0 ELSE (t.currentWorkload - :decrement) END WHERE t.id = :trainerId")
    void decrementWorkload(@Param("trainerId") Long trainerId, @Param("decrement") int decrement);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM Trainer t WHERE t.id IN :trainerIds")
    int deleteByIdIn(@Param("trainerIds") List<Long> trainerIds);
}

