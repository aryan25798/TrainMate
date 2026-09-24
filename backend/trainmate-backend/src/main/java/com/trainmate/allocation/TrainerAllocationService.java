package com.trainmate.allocation;

import com.trainmate.entity.Cohort;
import com.trainmate.entity.CohortStatus;
import com.trainmate.entity.Trainer;
import com.trainmate.repository.CohortRepository;
import com.trainmate.repository.TrainerRepository;
import com.trainmate.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Service
public class TrainerAllocationService {

    private final TrainerRepository trainerRepository;
    private final CohortRepository cohortRepository;
    private final AllocationScorer allocationScorer;
    private final NotificationService notificationService;

    public TrainerAllocationService(
            TrainerRepository trainerRepository,
            CohortRepository cohortRepository,
            AllocationScorer allocationScorer,
            NotificationService notificationService
    ) {
        this.trainerRepository = trainerRepository;
        this.cohortRepository = cohortRepository;
        this.allocationScorer = allocationScorer;
        this.notificationService = notificationService;
    }

    /**
     * Executes automatic allocation for a cohort in a single transactional operation.
     * Uses pessimistic locking to prevent race conditions.
     */
    @Transactional
    public TrainerScore allocateTrainer(Cohort cohort) {
        // Lock cohort for update to prevent concurrent modifications
        Cohort lockedCohort = cohortRepository.findByIdForUpdate(cohort.getId())
                .orElseThrow(() -> new IllegalStateException("Cohort no longer available: " + cohort.getId()));

        List<Trainer> allTrainers = trainerRepository.findAll();
        List<TrainerScore> eligibleScores = new ArrayList<>();

        for (Trainer trainer : allTrainers) {
            TrainerScore score = allocationScorer.evaluate(trainer, lockedCohort);
            if (score.isEligible()) {
                eligibleScores.add(score);
            }
        }

        if (eligibleScores.isEmpty()) {
            lockedCohort.setStatus(CohortStatus.UNASSIGNED);
            lockedCohort.setAssignedTrainer(null);
            cohortRepository.save(lockedCohort);

            notificationService.notifyAllocationFailed(lockedCohort);

            TrainerScore noMatch = new TrainerScore(null);
            noMatch.setEligible(false);
            noMatch.setIneligibilityReason("No eligible trainer available matching skills and dates");
            return noMatch;
        }

        // Sort descending: best candidate first (by score, then by lower workload as tiebreaker)
        eligibleScores.sort(Comparator
                .comparingDouble(TrainerScore::getTotalScore).reversed()
                .thenComparingInt(s -> s.getTrainer().getCurrentWorkload()));

        TrainerScore winner = null;
        Trainer lockedWinner = null;

        // Try each eligible trainer in order until one can be locked and assigned
        for (TrainerScore candidate : eligibleScores) {
            Trainer candidateTrainer = candidate.getTrainer();
            Trainer lockedCandidate = trainerRepository.findByIdForUpdate(candidateTrainer.getId()).orElse(null);
            if (lockedCandidate == null) {
                continue; // Trainer was deleted concurrently
            }

            // Re-evaluate eligibility with locked trainer (workload may have changed)
            TrainerScore recheckScore = allocationScorer.evaluate(lockedCandidate, lockedCohort);
            if (recheckScore.isEligible()) {
                winner = recheckScore;
                lockedWinner = lockedCandidate;
                break;
            }
        }

        if (winner == null || lockedWinner == null) {
            lockedCohort.setStatus(CohortStatus.UNASSIGNED);
            lockedCohort.setAssignedTrainer(null);
            cohortRepository.save(lockedCohort);
            notificationService.notifyAllocationFailed(lockedCohort);

            TrainerScore noMatch = new TrainerScore(null);
            noMatch.setEligible(false);
            noMatch.setIneligibilityReason("No eligible trainer available after re-check");
            return noMatch;
        }

        // Assign directly to cohort
        lockedCohort.setAssignedTrainer(lockedWinner);
        lockedCohort.setStatus(CohortStatus.ASSIGNED);
        cohortRepository.save(lockedCohort);

        // Increment trainer workload
        lockedWinner.setCurrentWorkload(lockedWinner.getCurrentWorkload() + 1);
        trainerRepository.save(lockedWinner);

        // Notify Coach and Trainer via internal mail
        notificationService.notifyTrainerAssigned(lockedCohort, lockedWinner);

        return winner;
    }
}
