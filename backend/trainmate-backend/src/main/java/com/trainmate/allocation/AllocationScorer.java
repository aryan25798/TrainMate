package com.trainmate.allocation;

import com.trainmate.dto.ScoreBreakdownDTO;
import com.trainmate.entity.Cohort;
import com.trainmate.entity.Trainer;
import com.trainmate.repository.CohortRepository;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AllocationScorer {

    public static final double SKILL_WEIGHT = 40.0;
    public static final double AVAILABILITY_WEIGHT = 20.0;
    public static final double WORKLOAD_WEIGHT = 15.0;
    public static final double EXPERIENCE_WEIGHT = 15.0;
    public static final double PREVIOUS_COHORT_WEIGHT = 10.0;

    private final CohortRepository cohortRepository;

    public AllocationScorer(CohortRepository cohortRepository) {
        this.cohortRepository = cohortRepository;
    }

    /**
     * Evaluates a trainer's eligibility and computes their 100-point score for a cohort.
     */
    public TrainerScore evaluate(Trainer trainer, Cohort cohort) {
        TrainerScore result = new TrainerScore(trainer);

        // 1. Workload Check (cannot exceed max workload)
        if (trainer.getCurrentWorkload() >= trainer.getMaxWorkload()) {
            result.setEligible(false);
            result.setIneligibilityReason("Trainer has reached maximum workload (" 
                    + trainer.getCurrentWorkload() + "/" + trainer.getMaxWorkload() + ")");
            return result;
        }

        // 2. Availability Check (must cover cohort dates)
        if (trainer.getAvailableFrom() == null || trainer.getAvailableTill() == null) {
            result.setEligible(false);
            result.setIneligibilityReason("Trainer availability dates are not set");
            return result;
        }
        boolean available = !trainer.getAvailableFrom().isAfter(cohort.getStartDate()) &&
                            !trainer.getAvailableTill().isBefore(cohort.getEndDate());
        if (!available) {
            result.setEligible(false);
            result.setIneligibilityReason("Trainer availability does not cover cohort dates (" 
                    + cohort.getStartDate() + " to " + cohort.getEndDate() + ")");
            return result;
        }

        // 3. Skill Match Check (must match at least 1 required skill)
        List<String> requiredSkills = parseSkills(cohort.getRequiredSkill());
        Set<String> trainerSkills = parseSkills(trainer.getSkillSet()).stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        long matchedSkillsCount = requiredSkills.stream()
                .filter(skill -> isSkillMatched(skill, trainerSkills))
                .count();

        if (matchedSkillsCount == 0) {
            result.setEligible(false);
            result.setIneligibilityReason("Trainer does not match required skills: " + cohort.getRequiredSkill());
            return result;
        }

        // Eligible!
        result.setEligible(true);
        ScoreBreakdownDTO breakdown = calculateBreakdown(trainer, cohort);
        result.setScoreBreakdown(breakdown);
        result.setTotalScore(breakdown.getTotalScore());

        return result;
    }

    /**
     * Calculates explainable 100-point score breakdown for display purposes.
     */
    public ScoreBreakdownDTO calculateBreakdown(Trainer trainer, Cohort cohort) {
        String requiredSkillStr = cohort.getRequiredSkill();
        String trainerSkillStr = trainer.getSkillSet();
        
        List<String> requiredSkills = parseSkills(requiredSkillStr);
        Set<String> trainerSkills = parseSkills(trainerSkillStr).stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        long matchedSkillsCount = requiredSkills.stream()
                .filter(skill -> isSkillMatched(skill, trainerSkills))
                .count();

        // A. Skill Match Score (0 - 40)
        double skillScore = requiredSkills.isEmpty() ? 0.0 :
                Math.round(((double) matchedSkillsCount / requiredSkills.size()) * SKILL_WEIGHT * 100.0) / 100.0;

        // B. Availability Score (20)
        double availabilityScore = 0.0;
        if (trainer.getAvailableFrom() != null && trainer.getAvailableTill() != null) {
            boolean available = !trainer.getAvailableFrom().isAfter(cohort.getStartDate()) &&
                                !trainer.getAvailableTill().isBefore(cohort.getEndDate());
            availabilityScore = available ? AVAILABILITY_WEIGHT : 0.0;
        }

        // C. Workload Score (0 - 15)
        double workloadScore = Math.round(
                (((double) Math.max(0, trainer.getMaxWorkload() - trainer.getCurrentWorkload()) / trainer.getMaxWorkload()) * WORKLOAD_WEIGHT) * 100.0
        ) / 100.0;

        // D. Experience Score (0 - 15)
        double experienceScore = calculateExperienceScore(trainer.getExperienceYears() != null ? trainer.getExperienceYears().intValue() : 0);

        // E. Previous Cohorts Score (0 - 10) - based on actual completed cohorts
        long previousCohortsCount = cohortRepository.countByAssignedTrainerIdAndEndDateBefore(trainer.getId(), cohort.getStartDate());
        double previousCohortsScore = calculatePreviousCohortsScore(previousCohortsCount);

        double totalScore = Math.round((skillScore + availabilityScore + workloadScore + experienceScore + previousCohortsScore) * 100.0) / 100.0;

        String explanation = String.format(
                "Skill Match: %.1f/40 (%d/%d matched), Availability: %.1f/20, Workload: %.1f/15 (%d/%d), Experience: %.1f/15, Previous Cohorts: %.1f/10 (%d completed). Total: %.1f/100",
                skillScore, matchedSkillsCount, requiredSkills.size(),
                availabilityScore,
                workloadScore, trainer.getCurrentWorkload(), trainer.getMaxWorkload(),
                experienceScore,
                previousCohortsScore, previousCohortsCount,
                totalScore
        );

        return new ScoreBreakdownDTO(
                skillScore,
                availabilityScore,
                workloadScore,
                experienceScore,
                previousCohortsScore,
                totalScore,
                explanation
        );
    }

    public double calculateExperienceScore(int experienceYears) {
        if (experienceYears <= 2) {
            return 5.0;
        } else if (experienceYears <= 5) {
            return 10.0;
        } else {
            return 15.0;
        }
    }

    public double calculatePreviousCohortsScore(long completedCohortsCount) {
        if (completedCohortsCount == 0) {
            return 3.0;
        } else if (completedCohortsCount <= 2) {
            return 5.0;
        } else if (completedCohortsCount <= 5) {
            return 8.0;
        } else {
            return 10.0;
        }
    }

    public List<String> parseSkills(String skillsString) {
        if (skillsString == null || skillsString.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.stream(skillsString.split("[,;/]"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private boolean isSkillMatched(String requiredSkill, Set<String> trainerSkills) {
        String req = requiredSkill.toLowerCase().trim();
        return trainerSkills.contains(req);
    }
}
