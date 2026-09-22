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
        Cohort cohort = cohortRepository.findById(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found with ID: " + cohortId));

        // Release trainer workload if assigned
        if (cohort.getAssignedTrainer() != null) {
            Trainer trainer = cohort.getAssignedTrainer();
            trainer.setCurrentWorkload(Math.max(0, trainer.getCurrentWorkload() - 1));
            trainerRepository.save(trainer);
        }

        // Clean up linked notifications
        notificationRepository.deleteByCohort(cohort);

        // Delete the cohort
        cohortRepository.delete(cohort);
    }

    /**
     * Updates an existing cohort. If skills or dates changed, re-evaluates trainer allocation.
     */
    @Transactional
    public CohortResponse updateCohort(Long cohortId, CreateCohortRequest request) {
        Cohort cohort = cohortRepository.findById(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found with ID: " + cohortId));

        cohort.setServiceLine(request.getServiceLine());
        cohort.setStream(request.getStream());
        cohort.setRequiredSkill(request.getRequiredSkill());
        cohort.setTraineeCount(request.getNumberOfTrainees());
        cohort.setStartDate(request.getStartDate());
        cohort.setEndDate(request.getEndDate());
        cohort.setLocation(request.getLocation());

        Cohort saved = cohortRepository.save(cohort);
        return mapToResponse(saved);
    }

    /**
     * Updates cohort status (PENDING, ACTIVE, COMPLETED, CANCELLED).
     * If CANCELLED, releases trainer workload automatically.
     */
    @Transactional
    public CohortResponse updateCohortStatus(Long cohortId, String statusStr) {
        Cohort cohort = cohortRepository.findById(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found with ID: " + cohortId));

        CohortStatus newStatus = CohortStatus.valueOf(statusStr.toUpperCase());
        CohortStatus oldStatus = cohort.getStatus();

        if (newStatus == CohortStatus.CANCELLED && oldStatus != CohortStatus.CANCELLED) {
            // Free assigned trainer capacity
            if (cohort.getAssignedTrainer() != null) {
                Trainer trainer = cohort.getAssignedTrainer();
                trainer.setCurrentWorkload(Math.max(0, trainer.getCurrentWorkload() - 1));
                trainerRepository.save(trainer);
                cohort.setAssignedTrainer(null);
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
        Cohort cohort = cohortRepository.findById(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found with ID: " + cohortId));

        // Release old trainer's workload if assigned
        if (cohort.getAssignedTrainer() != null) {
            Trainer oldTrainer = cohort.getAssignedTrainer();
            oldTrainer.setCurrentWorkload(Math.max(0, oldTrainer.getCurrentWorkload() - 1));
            trainerRepository.save(oldTrainer);
            cohort.setAssignedTrainer(null);
            cohort.setStatus(CohortStatus.PENDING);
            cohortRepository.save(cohort);
        }

        // Run allocation engine
        trainerAllocationService.allocateTrainer(cohort);
        return mapToResponse(cohort);
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
        dto.setVertical("General");
        dto.setLocation(c.getLocation());
        dto.setStatus(c.getStatus().name());
        dto.setCreatedAt(c.getCreatedDate());
        dto.setUpdatedAt(c.getCreatedDate());

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

            // Generate explainable 100-point score breakdown
            ScoreBreakdownDTO breakdown = allocationScorer.calculateBreakdown(c.getAssignedTrainer(), c);
            dto.setAllocationScore(breakdown.getTotalScore());
            dto.setScoreBreakdown(breakdown);
            dto.setAllocationType("AUTOMATIC");
            dto.setAllocationDate(c.getCreatedDate());
        }

        return dto;
    }
}
