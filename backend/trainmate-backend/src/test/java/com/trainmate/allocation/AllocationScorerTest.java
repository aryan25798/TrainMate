package com.trainmate.allocation;

import com.trainmate.entity.Cohort;
import com.trainmate.entity.Trainer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AllocationScorerTest {

    private AllocationScorer scorer;
    private Cohort cohort;

    @BeforeEach
    void setUp() {
        scorer = new AllocationScorer();

        cohort = new Cohort();
        cohort.setId(1L);
        cohort.setCohortCode("QEA26SD001");
        cohort.setRequiredSkill("Java, Spring Boot");
        cohort.setStartDate(LocalDate.of(2026, 9, 1));
        cohort.setEndDate(LocalDate.of(2026, 11, 30));
    }

    private Trainer createTrainer(Long id, List<String> skills, int workload, int maxWorkload, double exp) {
        Trainer t = new Trainer();
        t.setId(id);
        t.setCurrentWorkload(workload);
        t.setMaxWorkload(maxWorkload);
        t.setExperienceYears(exp);
        t.setAvailableFrom(LocalDate.of(2026, 8, 1));
        t.setAvailableTill(LocalDate.of(2026, 12, 31));
        t.setSkillSet(String.join(", ", skills));
        return t;
    }

    @Test
    void testFullSkillMatchScore() {
        Trainer t = createTrainer(1L, List.of("Java", "Spring Boot"), 1, 5, 5.0);
        TrainerScore score = scorer.evaluate(t, cohort);

        assertTrue(score.isEligible());
        // 2 out of 2 matched -> 40.0
        assertEquals(40.0, score.getScoreBreakdown().getSkillScore());
        // Fully available -> 20.0
        assertEquals(20.0, score.getScoreBreakdown().getAvailabilityScore());
        // Workload (5-1)/5 * 15 -> 12.0
        assertEquals(12.0, score.getScoreBreakdown().getWorkloadScore());
    }

    @Test
    void testPartialSkillMatchScore() {
        Trainer t = createTrainer(2L, List.of("Java", "Python"), 2, 5, 3.0);
        TrainerScore score = scorer.evaluate(t, cohort);

        assertTrue(score.isEligible());
        // 1 out of 2 matched -> 20.0
        assertEquals(20.0, score.getScoreBreakdown().getSkillScore());
    }

    @Test
    void testNoSkillMatchIneligible() {
        Trainer t = createTrainer(3L, List.of("Ruby", "PHP"), 0, 5, 8.0);
        TrainerScore score = scorer.evaluate(t, cohort);

        assertFalse(score.isEligible());
        assertTrue(score.getIneligibilityReason().contains("does not match required skills"));
    }

    @Test
    void testMaxWorkloadIneligible() {
        Trainer t = createTrainer(4L, List.of("Java"), 5, 5, 5.0);
        TrainerScore score = scorer.evaluate(t, cohort);

        assertFalse(score.isEligible());
        assertTrue(score.getIneligibilityReason().contains("reached maximum workload"));
    }

    @Test
    void testDateMismatchIneligible() {
        Trainer t = createTrainer(5L, List.of("Java"), 0, 5, 5.0);
        t.setAvailableTill(LocalDate.of(2026, 10, 1)); // Ends before cohort ends
        TrainerScore score = scorer.evaluate(t, cohort);

        assertFalse(score.isEligible());
        assertTrue(score.getIneligibilityReason().contains("does not cover cohort dates"));
    }
}
