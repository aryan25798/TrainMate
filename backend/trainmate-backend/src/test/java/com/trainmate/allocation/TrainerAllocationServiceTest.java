package com.trainmate.allocation;

import com.trainmate.dto.ScoreBreakdownDTO;
import com.trainmate.entity.Cohort;
import com.trainmate.entity.CohortStatus;
import com.trainmate.entity.Trainer;
import com.trainmate.entity.User;
import com.trainmate.repository.CohortRepository;
import com.trainmate.repository.TrainerRepository;
import com.trainmate.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrainerAllocationServiceTest {

    @Mock
    private TrainerRepository trainerRepository;

    @Mock
    private CohortRepository cohortRepository;

    @Mock
    private AllocationScorer allocationScorer;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TrainerAllocationService allocationService;

    private Cohort cohort;
    private Trainer trainer1;
    private Trainer trainer2;

    @BeforeEach
    void setUp() {
        cohort = new Cohort();
        cohort.setId(10L);
        cohort.setCohortCode("QEA26SD100");
        cohort.setRequiredSkill("Java, Spring Boot");
        cohort.setStartDate(LocalDate.of(2026, 9, 1));
        cohort.setEndDate(LocalDate.of(2026, 11, 30));
        cohort.setStatus(CohortStatus.PENDING);

        User user1 = new User(1L, "Rahul Trainer", "rahul@cognizant.com", "pass", null);
        trainer1 = new Trainer();
        trainer1.setId(101L);
        trainer1.setUser(user1);
        trainer1.setSkillSet("Java, Spring Boot");
        trainer1.setCurrentWorkload(1);
        trainer1.setMaxWorkload(5);
        trainer1.setAvailableFrom(LocalDate.of(2026, 8, 1));
        trainer1.setAvailableTill(LocalDate.of(2026, 12, 31));

        User user2 = new User(2L, "Priya Trainer", "priya@cognizant.com", "pass", null);
        trainer2 = new Trainer();
        trainer2.setId(102L);
        trainer2.setUser(user2);
        trainer2.setSkillSet("Java");
        trainer2.setCurrentWorkload(0);
        trainer2.setMaxWorkload(5);
        trainer2.setAvailableFrom(LocalDate.of(2026, 8, 1));
        trainer2.setAvailableTill(LocalDate.of(2026, 12, 31));
    }

    @Test
    void testSuccessfulAllocationAndWorkloadIncrement() {
        when(cohortRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(cohort));
        when(trainerRepository.findAll()).thenReturn(List.of(trainer1, trainer2));

        TrainerScore score1 = new TrainerScore(trainer1);
        score1.setEligible(true);
        score1.setTotalScore(85.0);
        score1.setScoreBreakdown(new ScoreBreakdownDTO(40.0, 20.0, 12.0, 10.0, 3.0, 85.0, "High match"));

        TrainerScore score2 = new TrainerScore(trainer2);
        score2.setEligible(true);
        score2.setTotalScore(65.0);
        score2.setScoreBreakdown(new ScoreBreakdownDTO(20.0, 20.0, 15.0, 5.0, 5.0, 65.0, "Moderate match"));

        when(allocationScorer.evaluate(trainer1, cohort)).thenReturn(score1);
        when(allocationScorer.evaluate(trainer2, cohort)).thenReturn(score2);

        when(trainerRepository.findByIdForUpdate(101L)).thenReturn(Optional.of(trainer1));
        when(allocationScorer.evaluate(trainer1, cohort)).thenReturn(score1);

        TrainerScore result = allocationService.allocateTrainer(cohort);

        assertTrue(result.isEligible());
        assertEquals(85.0, result.getTotalScore());
        assertEquals(CohortStatus.ASSIGNED, cohort.getStatus());
        assertEquals(trainer1, cohort.getAssignedTrainer());
        assertEquals(2, trainer1.getCurrentWorkload()); // Workload incremented from 1 to 2
        assertEquals(85.0, cohort.getAllocationScore());
        assertEquals("AUTOMATIC", cohort.getAllocationType());

        verify(cohortRepository, atLeastOnce()).save(cohort);
        verify(trainerRepository).save(trainer1);
        verify(notificationService).notifyTrainerAssigned(cohort, trainer1);
    }

    @Test
    void testNoEligibleTrainersSetsUnassigned() {
        when(cohortRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(cohort));
        when(trainerRepository.findAll()).thenReturn(List.of(trainer1));

        TrainerScore score1 = new TrainerScore(trainer1);
        score1.setEligible(false);
        score1.setIneligibilityReason("No skills match");
        when(allocationScorer.evaluate(trainer1, cohort)).thenReturn(score1);

        TrainerScore result = allocationService.allocateTrainer(cohort);

        assertFalse(result.isEligible());
        assertEquals(CohortStatus.UNASSIGNED, cohort.getStatus());
        assertNull(cohort.getAssignedTrainer());
        assertNull(cohort.getAllocationScore());

        verify(cohortRepository).save(cohort);
        verify(notificationService).notifyAllocationFailed(cohort);
        verify(trainerRepository, never()).save(any());
    }
}
