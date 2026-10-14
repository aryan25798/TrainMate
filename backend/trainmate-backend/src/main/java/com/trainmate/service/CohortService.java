package com.trainmate.service;

import com.trainmate.allocation.AllocationScorer;
import com.trainmate.allocation.TrainerAllocationService;
import com.trainmate.dto.CohortResponse;
import com.trainmate.dto.CreateCohortRequest;
import com.trainmate.dto.ScoreBreakdownDTO;
import com.trainmate.entity.Cohort;
import com.trainmate.entity.CohortStatus;
import com.trainmate.entity.Trainer;
import com.trainmate.exception.ResourceNotFoundException;
import com.trainmate.repository.CohortRepository;
import com.trainmate.repository.NotificationRepository;
import com.trainmate.repository.TrainerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CohortService {

    private final CohortRepository cohortRepository;
    private final AllocationScorer allocationScorer;
    private final TrainerRepository trainerRepository;
    private final NotificationRepository notificationRepository;
    private final TrainerAllocationService trainerAllocationService;

    public CohortService(CohortRepository cohortRepository,
                         AllocationScorer allocationScorer,
                         TrainerRepository trainerRepository,
                         NotificationRepository notificationRepository,
                         TrainerAllocationService trainerAllocationService) {
        this.cohortRepository = cohortRepository;
        this.allocationScorer = allocationScorer;
        this.trainerRepository = trainerRepository;
        this.notificationRepository = notificationRepository;
        this.trainerAllocationService = trainerAllocationService;
    }

    @Transactional(readOnly = true)
    public CohortResponse getCohortById(Long cohortId) {
        Cohort cohort = cohortRepository.findById(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found with ID: " + cohortId));
        return mapToResponse(cohort);
    }

    /**
     * Deletes a cohort. If assigned to a trainer, releases that trainer's workload immediately.
     */
    @Transactional
    public void deleteCohort(Long cohortId) {
        // Lock cohort for update
        Cohort cohort = cohortRepository.findByIdForUpdate(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found with ID: " + cohortId));

        // Release trainer workload if assigned (with lock)
        if (cohort.getAssignedTrainer() != null) {
            Trainer trainer = cohort.getAssignedTrainer();
            Trainer lockedTrainer = trainerRepository.findByIdForUpdate(trainer.getId()).orElse(null);
            if (lockedTrainer != null) {
                lockedTrainer.setCurrentWorkload(Math.max(0, lockedTrainer.getCurrentWorkload() - 1));
                trainerRepository.save(lockedTrainer);
            }
        }

        // Clean up linked notifications
        notificationRepository.deleteByCohort(cohort);

        // Delete the cohort
        cohortRepository.delete(cohort);
    }

    /**
     * Set-based batch bulk deletion of multiple cohorts.
     * Decrements assigned trainer workloads in aggregated batch, removes linked notifications,
     * and deletes cohorts in constant O(1) set-based queries instead of iterative loops.
     */
    @Transactional
    public int bulkDeleteCohorts(List<Long> cohortIds) {
        if (cohortIds == null || cohortIds.isEmpty()) return 0;

        // 1. Calculate affected trainer workload decrements in a single aggregated GROUP BY query
        List<Object[]> trainerWorkloadCounts = cohortRepository.countAssignedCohortsByTrainer(cohortIds);
        for (Object[] row : trainerWorkloadCounts) {
            Long trainerId = (Long) row[0];
            Long count = (Long) row[1];
            if (trainerId != null && count != null && count > 0) {
                trainerRepository.decrementWorkload(trainerId, count.intValue());
            }
        }

        // 2. Bulk delete linked notifications in 1 set query
        notificationRepository.deleteByCohortIdIn(cohortIds);

        // 3. Bulk delete cohorts in 1 set query
        return cohortRepository.deleteByIdIn(cohortIds);
    }

    /**
     * Updates an existing cohort. If skills or dates changed, re-evaluates trainer allocation.
     */
    @Transactional
    public CohortResponse updateCohort(Long cohortId, CreateCohortRequest request) {
        if (request.getStartDate() != null && request.getEndDate() != null
                && request.getEndDate().isBefore(request.getStartDate())) {
            throw new com.trainmate.exception.AllocationException("End date cannot be before start date");
        }

        Cohort cohort = cohortRepository.findByIdForUpdate(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found with ID: " + cohortId));

        boolean criteriaChanged = (request.getRequiredSkill() != null && !request.getRequiredSkill().trim().equalsIgnoreCase(cohort.getRequiredSkill()))
                || (request.getStartDate() != null && !request.getStartDate().equals(cohort.getStartDate()))
                || (request.getEndDate() != null && !request.getEndDate().equals(cohort.getEndDate()));

        cohort.setServiceLine(request.getServiceLine());
        cohort.setStream(request.getStream());
        cohort.setRequiredSkill(request.getRequiredSkill());
        cohort.setTraineeCount(request.getNumberOfTrainees());
        cohort.setStartDate(request.getStartDate());
        cohort.setEndDate(request.getEndDate());
        cohort.setLocation(request.getLocation());
        cohort.setVertical(request.getVertical() != null ? request.getVertical() : "General");
        cohort.setUpdatedDate(java.time.LocalDateTime.now());

        Cohort saved = cohortRepository.save(cohort);

        // If criteria changed and trainer was assigned, recheck eligibility
        if (criteriaChanged && saved.getAssignedTrainer() != null) {
            Trainer currentTrainer = saved.getAssignedTrainer();
            com.trainmate.allocation.TrainerScore score = allocationScorer.evaluate(currentTrainer, saved);
            if (!score.isEligible()) {
                // Release current trainer's workload and reallocate
                Trainer lockedTrainer = trainerRepository.findByIdForUpdate(currentTrainer.getId()).orElse(null);
                if (lockedTrainer != null) {
                    lockedTrainer.setCurrentWorkload(Math.max(0, lockedTrainer.getCurrentWorkload() - 1));
                    trainerRepository.save(lockedTrainer);
                }
                saved.setAssignedTrainer(null);
                saved.setStatus(CohortStatus.PENDING);
                saved = cohortRepository.save(saved);
                trainerAllocationService.allocateTrainer(saved);
                saved = cohortRepository.findById(saved.getId()).orElse(saved);
            }
        }

        return mapToResponse(saved);
    }

    /**
     * Updates cohort status (PENDING, ACTIVE, COMPLETED, CANCELLED).
     * If CANCELLED, releases trainer workload automatically.
     */
    @Transactional
    public CohortResponse updateCohortStatus(Long cohortId, String statusStr) {
        Cohort cohort = cohortRepository.findByIdForUpdate(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found with ID: " + cohortId));

        CohortStatus newStatus = CohortStatus.valueOf(statusStr.toUpperCase());
        CohortStatus oldStatus = cohort.getStatus();

        if (newStatus == CohortStatus.CANCELLED && oldStatus != CohortStatus.CANCELLED) {
            // Free assigned trainer capacity
            if (cohort.getAssignedTrainer() != null) {
                Trainer trainer = cohort.getAssignedTrainer();
                Trainer lockedTrainer = trainerRepository.findByIdForUpdate(trainer.getId()).orElse(null);
                if (lockedTrainer != null) {
                    lockedTrainer.setCurrentWorkload(Math.max(0, lockedTrainer.getCurrentWorkload() - 1));
                    trainerRepository.save(lockedTrainer);
                }
                cohort.setAssignedTrainer(null);
                cohort.setAllocationScore(null);
                cohort.setAllocationExplanation("Cancelled - Trainer released");
            }
        }

        cohort.setStatus(newStatus);
        Cohort saved = cohortRepository.save(cohort);
        return mapToResponse(saved);
    }

    /**
     * 1-Click Re-run Allocation on Trainer Unavailability.
     * Releases previous trainer's workload and runs the 100-point allocation engine.
     */
    @Transactional
    public CohortResponse reallocateTrainer(Long cohortId) {
        Cohort cohort = cohortRepository.findByIdForUpdate(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found with ID: " + cohortId));

        // Release old trainer's workload if assigned (with lock)
        if (cohort.getAssignedTrainer() != null) {
            Trainer oldTrainer = cohort.getAssignedTrainer();
            Trainer lockedOldTrainer = trainerRepository.findByIdForUpdate(oldTrainer.getId()).orElse(null);
            if (lockedOldTrainer != null) {
                lockedOldTrainer.setCurrentWorkload(Math.max(0, lockedOldTrainer.getCurrentWorkload() - 1));
                trainerRepository.save(lockedOldTrainer);
            }
            cohort.setAssignedTrainer(null);
            cohort.setStatus(CohortStatus.PENDING);
            cohort = cohortRepository.save(cohort);
        }

        // Run allocation engine
        trainerAllocationService.allocateTrainer(cohort);
        Cohort refreshedCohort = cohortRepository.findById(cohortId).orElse(cohort);
        return mapToResponse(refreshedCohort);
    }

    public CohortResponse mapToResponse(Cohort c) {
        CohortResponse dto = new CohortResponse();
        dto.setId(c.getId());
        dto.setCohortCode(c.getCohortCode());
        dto.setServiceLine(c.getServiceLine());
        dto.setStream(c.getStream());
        dto.setRequiredSkill(c.getRequiredSkill());
        dto.setNumberOfTrainees(c.getTraineeCount());
        dto.setStartDate(c.getStartDate());
        dto.setEndDate(c.getEndDate());
        dto.setVertical(c.getVertical() != null ? c.getVertical() : "General");
        dto.setLocation(c.getLocation());
        dto.setStatus(c.getStatus().name());
        dto.setCreatedAt(c.getCreatedDate());
        dto.setUpdatedAt(c.getUpdatedDate() != null ? c.getUpdatedDate() : c.getCreatedDate());

        // Coach info
        if (c.getCoachUser() != null) {
            dto.setCoachId(c.getCoachUser().getId());
            dto.setCoachName(c.getCoachUser().getName());
            dto.setCoachEmployeeId("EMP_C" + c.getCoachUser().getId());
        }

        // Trainer info
        if (c.getAssignedTrainer() != null) {
            dto.setAssignedTrainerId(c.getAssignedTrainer().getId());
            dto.setAssignedTrainerEmployeeId("EMP_T" + c.getAssignedTrainer().getId());
            if (c.getAssignedTrainer().getUser() != null) {
                dto.setAssignedTrainerName(c.getAssignedTrainer().getUser().getName());
            }

            dto.setAllocationScore(c.getAllocationScore());
            dto.setAllocationType(c.getAllocationType() != null ? c.getAllocationType() : "AUTOMATIC");
            dto.setAllocationDate(c.getAllocationDate() != null ? c.getAllocationDate() : c.getCreatedDate());

            if (c.getAllocationExplanation() != null) {
                ScoreBreakdownDTO breakdown = new ScoreBreakdownDTO();
                breakdown.setTotalScore(c.getAllocationScore() != null ? c.getAllocationScore() : 0.0);
                breakdown.setExplanation(c.getAllocationExplanation());
                dto.setScoreBreakdown(breakdown);
            }
        }

        return dto;
    }
}
