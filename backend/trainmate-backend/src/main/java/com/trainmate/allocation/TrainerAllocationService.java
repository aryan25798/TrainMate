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
     */
    @Transactional
    public TrainerScore allocateTrainer(Cohort cohort) {
        List<Trainer> allTrainers = trainerRepository.findAll();
        List<TrainerScore> eligibleScores = new ArrayList<>();

        for (Trainer trainer : allTrainers) {
            TrainerScore score = allocationScorer.evaluate(trainer, cohort);
            if (score.isEligible()) {
                eligibleScores.add(score);
            }
        }

        if (eligibleScores.isEmpty()) {
            cohort.setStatus(CohortStatus.UNASSIGNED);
            cohort.setAssignedTrainer(null);
            cohortRepository.save(cohort);

            notificationService.notifyAllocationFailed(cohort);

            TrainerScore noMatch = new TrainerScore(null);
            noMatch.setEligible(false);
            noMatch.setIneligibilityReason("No eligible trainer available matching skills and dates");
            return noMatch;
        }

        // Sort descending: best candidate first
        Collections.sort(eligibleScores);
        TrainerScore winner = eligibleScores.get(0);
        Trainer winnerTrainer = winner.getTrainer();

        // Assign directly to cohort
        cohort.setAssignedTrainer(winnerTrainer);
        cohort.setStatus(CohortStatus.ASSIGNED);
        cohortRepository.save(cohort);

        // Increment trainer workload
        winnerTrainer.setCurrentWorkload(winnerTrainer.getCurrentWorkload() + 1);
        trainerRepository.save(winnerTrainer);

        // Notify Coach and Trainer via internal mail
        notificationService.notifyTrainerAssigned(cohort, winnerTrainer);

        return winner;
    }
}
