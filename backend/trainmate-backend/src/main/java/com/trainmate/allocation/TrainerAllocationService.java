package com.trainmate.allocation;

import com.trainmate.entity.Cohort;
import com.trainmate.entity.CohortStatus;
import com.trainmate.entity.Trainer;
import com.trainmate.repository.CohortRepository;
import com.trainmate.repository.NotificationRepository;
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

    private final NotificationRepository notificationRepository;

    public TrainerAllocationService(
            TrainerRepository trainerRepository,
            CohortRepository cohortRepository,
            AllocationScorer allocationScorer,
            NotificationService notificationService,
            NotificationRepository notificationRepository
    ) {
        this.trainerRepository = trainerRepository;
        this.cohortRepository = cohortRepository;
        this.allocationScorer = allocationScorer;
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
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
            lockedCohort.setAllocationScore(null);
            lockedCohort.setAllocationExplanation("No eligible trainer available matching skills and dates");
            lockedCohort.setAllocationType("AUTOMATIC");
            lockedCohort.setAllocationDate(java.time.LocalDateTime.now());
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
            lockedCohort.setAllocationScore(null);
            lockedCohort.setAllocationExplanation("No eligible trainer available after re-check");
            lockedCohort.setAllocationType("AUTOMATIC");
            lockedCohort.setAllocationDate(java.time.LocalDateTime.now());
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
        lockedCohort.setAllocationScore(winner.getTotalScore());
        lockedCohort.setAllocationExplanation(winner.getScoreBreakdown() != null ? winner.getScoreBreakdown().getExplanation() : null);
        lockedCohort.setAllocationType("AUTOMATIC");
        lockedCohort.setAllocationDate(java.time.LocalDateTime.now());
        cohortRepository.save(lockedCohort);

        // Increment trainer workload
        lockedWinner.setCurrentWorkload(lockedWinner.getCurrentWorkload() + 1);
        trainerRepository.save(lockedWinner);

        // Notify Coach and Trainer via internal mail
        notificationService.notifyTrainerAssigned(lockedCohort, lockedWinner);

        return winner;
    }

    /**
     * High-throughput Batch Allocation Engine.
     * Evaluates cohorts in strict FIFO order, balances workloads dynamically in-memory,
     * and performs atomic batch saves for cohorts, updated trainers, and notifications.
     */
    @Transactional
    public List<Cohort> allocateBatch(List<Cohort> cohorts) {
        if (cohorts == null || cohorts.isEmpty()) {
            return Collections.emptyList();
        }

        // 1. First persist the cohorts in batch so they obtain IDs and DB records
        List<Cohort> savedCohorts = cohortRepository.saveAll(cohorts);

        // 2. Fetch all trainers with their user accounts in 1 single join fetch query
        List<Trainer> trainers = trainerRepository.findAllWithUser();

        List<com.trainmate.entity.Notification> notifications = new ArrayList<>();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        // 3. Process each cohort in FIFO order
        for (Cohort cohort : savedCohorts) {
            List<TrainerScore> eligibleScores = new ArrayList<>();

            for (Trainer trainer : trainers) {
                TrainerScore score = allocationScorer.evaluate(trainer, cohort);
                if (score.isEligible()) {
                    eligibleScores.add(score);
                }
            }

            if (eligibleScores.isEmpty()) {
                cohort.setStatus(CohortStatus.UNASSIGNED);
                cohort.setAssignedTrainer(null);
                cohort.setAllocationScore(null);
                cohort.setAllocationExplanation("No eligible trainer available matching skills and dates");
                cohort.setAllocationType("AUTOMATIC");
                cohort.setAllocationDate(now);

                if (cohort.getCoachUser() != null) {
                    notifications.add(new com.trainmate.entity.Notification(
                            cohort, cohort.getCoachUser(), "ALLOCATION_PENDING",
                            "No eligible trainer was found for cohort " + cohort.getCohortCode() + ". Status set to UNASSIGNED."
                    ));
                }
                continue;
            }

            // Sort descending: best candidate first (by score, then lower workload)
            eligibleScores.sort(Comparator
                    .comparingDouble(TrainerScore::getTotalScore).reversed()
                    .thenComparingInt(s -> s.getTrainer().getCurrentWorkload()));

            TrainerScore winner = eligibleScores.get(0);
            Trainer winningTrainer = winner.getTrainer();

            // Assign directly to cohort
            cohort.setAssignedTrainer(winningTrainer);
            cohort.setStatus(CohortStatus.ASSIGNED);
            cohort.setAllocationScore(winner.getTotalScore());
            cohort.setAllocationExplanation(winner.getScoreBreakdown() != null ? winner.getScoreBreakdown().getExplanation() : "Deterministic 100-point allocation match");
            cohort.setAllocationType("AUTOMATIC");
            cohort.setAllocationDate(now);

            // Increment workload immediately in memory for subsequent cohorts in batch
            winningTrainer.setCurrentWorkload(winningTrainer.getCurrentWorkload() + 1);

            // Notifications
            if (winningTrainer.getUser() != null) {
                notifications.add(new com.trainmate.entity.Notification(
                        cohort, winningTrainer.getUser(), "COHORT_ASSIGNMENT",
                        "You have been assigned to lead cohort " + cohort.getCohortCode() + " (" + cohort.getRequiredSkill() + ")."
                ));
            }
            if (cohort.getCoachUser() != null) {
                String trainerName = winningTrainer.getUser() != null ? winningTrainer.getUser().getName() : "Assigned Trainer";
                notifications.add(new com.trainmate.entity.Notification(
                        cohort, cohort.getCoachUser(), "TRAINER_ASSIGNED",
                        trainerName + " has been assigned to your cohort " + cohort.getCohortCode() + "."
                ));
            }
        }

        // 4. Batch flush all entities
        List<Cohort> finalCohorts = cohortRepository.saveAll(savedCohorts);
        trainerRepository.saveAll(trainers);
        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }

        return finalCohorts;
    }
}
