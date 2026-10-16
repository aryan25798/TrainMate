package com.trainmate.allocation;

import com.trainmate.dto.ScoreBreakdownDTO;
import com.trainmate.entity.Cohort;
import com.trainmate.entity.CohortStatus;
import com.trainmate.entity.Trainer;
import com.trainmate.entity.User;
import com.trainmate.repository.CohortRepository;
import com.trainmate.repository.NotificationRepository;
import com.trainmate.repository.TrainerRepository;
import com.trainmate.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BatchAllocationTest {

    @Mock
    private TrainerRepository trainerRepository;

    @Mock
    private CohortRepository cohortRepository;

    @Mock
    private AllocationScorer allocationScorer;

    @Mock
    private NotificationService notificationService;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private TrainerAllocationService allocationService;

    private Trainer trainerA;
    private Trainer trainerB;

    @BeforeEach
    void setUp() {
        User userA = new User(1L, "Alice Senior", "alice@cognizant.com", "pass", null);
        trainerA = new Trainer();
        trainerA.setId(101L);
        trainerA.setUser(userA);
        trainerA.setSkillSet("Java, Spring Boot, Microservices");
        trainerA.setCurrentWorkload(0);
        trainerA.setMaxWorkload(2);
        trainerA.setAvailableFrom(LocalDate.of(2026, 1, 1));
        trainerA.setAvailableTill(LocalDate.of(2026, 12, 31));

        User userB = new User(2L, "Bob Junior", "bob@cognizant.com", "pass", null);
        trainerB = new Trainer();
        trainerB.setId(102L);
        trainerB.setUser(userB);
        trainerB.setSkillSet("Java, Spring Boot");
        trainerB.setCurrentWorkload(0);
        trainerB.setMaxWorkload(2);
        trainerB.setAvailableFrom(LocalDate.of(2026, 1, 1));
        trainerB.setAvailableTill(LocalDate.of(2026, 12, 31));
    }

    @Test
    @DisplayName("allocateBatch processes multiple cohorts in FIFO order and balances workloads")
    void testAllocateBatch_FIFO_WorkloadBalancing() {
        Cohort c1 = new Cohort();
        c1.setId(1L);
        c1.setCohortCode("CH_BATCH_01");
        c1.setRequiredSkill("Java");
        c1.setStartDate(LocalDate.of(2026, 3, 1));
        c1.setEndDate(LocalDate.of(2026, 5, 30));

        Cohort c2 = new Cohort();
        c2.setId(2L);
        c2.setCohortCode("CH_BATCH_02");
        c2.setRequiredSkill("Java");
        c2.setStartDate(LocalDate.of(2026, 3, 1));
        c2.setEndDate(LocalDate.of(2026, 5, 30));

        List<Cohort> cohorts = new ArrayList<>(List.of(c1, c2));

        when(cohortRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
        when(trainerRepository.findAllWithUser()).thenReturn(List.of(trainerA, trainerB));

        // When evaluating c1, Alice gets 95, Bob gets 85
        TrainerScore scoreAliceC1 = new TrainerScore(trainerA);
        scoreAliceC1.setEligible(true);
        scoreAliceC1.setTotalScore(95.0);
        scoreAliceC1.setScoreBreakdown(new ScoreBreakdownDTO(38.0, 20.0, 15.0, 12.0, 10.0, 95.0, "Top Match"));

        TrainerScore scoreBobC1 = new TrainerScore(trainerB);
        scoreBobC1.setEligible(true);
        scoreBobC1.setTotalScore(85.0);
        scoreBobC1.setScoreBreakdown(new ScoreBreakdownDTO(30.0, 20.0, 15.0, 10.0, 10.0, 85.0, "Good Match"));

        when(allocationScorer.evaluate(trainerA, c1)).thenReturn(scoreAliceC1);
        when(allocationScorer.evaluate(trainerB, c1)).thenReturn(scoreBobC1);

        // When evaluating c2, Alice's workload is now 1, so Bob gets a higher score or wins on tiebreak
        TrainerScore scoreAliceC2 = new TrainerScore(trainerA);
        scoreAliceC2.setEligible(true);
        scoreAliceC2.setTotalScore(80.0);

        TrainerScore scoreBobC2 = new TrainerScore(trainerB);
        scoreBobC2.setEligible(true);
        scoreBobC2.setTotalScore(85.0);

        when(allocationScorer.evaluate(trainerA, c2)).thenReturn(scoreAliceC2);
        when(allocationScorer.evaluate(trainerB, c2)).thenReturn(scoreBobC2);

        List<Cohort> result = allocationService.allocateBatch(cohorts);

        assertNotNull(result);
        assertEquals(2, result.size());

        // c1 assigned to Alice
        assertEquals(CohortStatus.ASSIGNED, c1.getStatus());
        assertEquals(trainerA, c1.getAssignedTrainer());
        assertEquals(95.0, c1.getAllocationScore());

        // c2 assigned to Bob
        assertEquals(CohortStatus.ASSIGNED, c2.getStatus());
        assertEquals(trainerB, c2.getAssignedTrainer());
        assertEquals(85.0, c2.getAllocationScore());

        // Both trainer workloads incremented
        assertEquals(1, trainerA.getCurrentWorkload());
        assertEquals(1, trainerB.getCurrentWorkload());

        // Batch saveAll called on cohorts, trainers, notifications
        verify(cohortRepository, atLeastOnce()).saveAll(anyList());
        verify(trainerRepository, times(1)).saveAll(anyList());
        verify(notificationRepository, times(1)).saveAll(anyList());
    }
}
