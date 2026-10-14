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

    /** Count trainers who have workload headroom AND whose availability has not expired */
    @Query("SELECT COUNT(t) FROM Trainer t WHERE t.currentWorkload < t.maxWorkload " +
           "AND (t.availableTill IS NULL OR t.availableTill >= :today)")
    long countAvailableTrainers(@Param("today") LocalDate today);

    /** Count trainers who are at capacity OR whose availability has expired */
    @Query("SELECT COUNT(t) FROM Trainer t WHERE t.currentWorkload >= t.maxWorkload " +
           "OR (t.availableTill IS NOT NULL AND t.availableTill < :today)")
    long countUnavailableTrainers(@Param("today") LocalDate today);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("UPDATE Trainer t SET t.currentWorkload = CASE WHEN (t.currentWorkload - :decrement) < 0 THEN 0 ELSE (t.currentWorkload - :decrement) END WHERE t.id = :trainerId")
    void decrementWorkload(@Param("trainerId") Long trainerId, @Param("decrement") int decrement);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM Trainer t WHERE t.id IN :trainerIds")
    int deleteByIdIn(@Param("trainerIds") List<Long> trainerIds);
}

