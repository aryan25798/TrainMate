package com.trainmate.service;

import com.trainmate.allocation.AllocationScorer;
import com.trainmate.dto.CohortResponse;
import com.trainmate.dto.ScoreBreakdownDTO;
import com.trainmate.entity.Cohort;
import com.trainmate.exception.ResourceNotFoundException;
import com.trainmate.repository.CohortRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CohortService {

    private final CohortRepository cohortRepository;
    private final AllocationScorer allocationScorer;

    public CohortService(CohortRepository cohortRepository, AllocationScorer allocationScorer) {
        this.cohortRepository = cohortRepository;
        this.allocationScorer = allocationScorer;
    }

    @Transactional(readOnly = true)
    public CohortResponse getCohortById(Long cohortId) {
        Cohort cohort = cohortRepository.findById(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found with ID: " + cohortId));
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

        // Coach info (directly from coachUser)
        if (c.getCoachUser() != null) {
            dto.setCoachId(c.getCoachUser().getId());
            dto.setCoachName(c.getCoachUser().getName());
            dto.setCoachEmployeeId("EMP_C" + c.getCoachUser().getId());
        }

        // Trainer info (directly from assignedTrainer)
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
