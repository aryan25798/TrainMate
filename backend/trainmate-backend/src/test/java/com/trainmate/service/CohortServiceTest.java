package com.trainmate.service;

import com.trainmate.allocation.AllocationScorer;
import com.trainmate.allocation.TrainerAllocationService;
import com.trainmate.allocation.TrainerScore;
import com.trainmate.dto.CohortResponse;
import com.trainmate.dto.CreateCohortRequest;
import com.trainmate.entity.Cohort;
import com.trainmate.entity.CohortStatus;
import com.trainmate.entity.Trainer;
import com.trainmate.entity.User;
import com.trainmate.exception.AllocationException;
import com.trainmate.repository.CohortRepository;
import com.trainmate.repository.NotificationRepository;
import com.trainmate.repository.TrainerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CohortServiceTest {

    @Mock
    private CohortRepository cohortRepository;

    @Mock
    private AllocationScorer allocationScorer;

    @Mock
    private TrainerRepository trainerRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private TrainerAllocationService trainerAllocationService;

    @InjectMocks
    private CohortService cohortService;

    private Cohort cohort;
    private Trainer trainer;

    @BeforeEach
    void setUp() {
        trainer = new Trainer();
        trainer.setId(101L);
        trainer.setCurrentWorkload(2);
        trainer.setMaxWorkload(5);

        User coach = new User(1L, "Amit Sharma", "coach@cognizant.com", "pass", null);

        cohort = new Cohort();
        cohort.setId(1L);
        cohort.setCohortCode("QEA26SD001");
        cohort.setRequiredSkill("Java, Spring Boot");
        cohort.setStartDate(LocalDate.of(2026, 9, 1));
        cohort.setEndDate(LocalDate.of(2026, 11, 30));
        cohort.setStatus(CohortStatus.ASSIGNED);
        cohort.setAssignedTrainer(trainer);
        cohort.setCoachUser(coach);
        cohort.setAllocationScore(88.0);
        cohort.setAllocationExplanation("Skill Match: 40/40");
        cohort.setAllocationType("AUTOMATIC");
    }

    @Test
    void testDeleteCohortReleasesTrainerWorkload() {
        when(cohortRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(cohort));
        when(trainerRepository.findByIdForUpdate(101L)).thenReturn(Optional.of(trainer));

        cohortService.deleteCohort(1L);

        assertEquals(1, trainer.getCurrentWorkload()); // Workload decremented from 2 to 1
        verify(trainerRepository).save(trainer);
        verify(notificationRepository).deleteByCohort(cohort);
        verify(cohortRepository).delete(cohort);
    }

    @Test
    void testUpdateCohortStatusCancelledReleasesTrainerWorkload() {
        when(cohortRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(cohort));
        when(trainerRepository.findByIdForUpdate(101L)).thenReturn(Optional.of(trainer));
        when(cohortRepository.save(any(Cohort.class))).thenAnswer(i -> i.getArgument(0));

        CohortResponse response = cohortService.updateCohortStatus(1L, "CANCELLED");

        assertEquals("CANCELLED", response.getStatus());
        assertEquals(1, trainer.getCurrentWorkload()); // Workload decremented from 2 to 1
        assertNull(cohort.getAssignedTrainer());
        verify(trainerRepository).save(trainer);
        verify(cohortRepository).save(cohort);
    }

    @Test
    void testUpdateCohortRejectsInvalidDates() {
        CreateCohortRequest req = new CreateCohortRequest();
        req.setStartDate(LocalDate.of(2026, 11, 30));
        req.setEndDate(LocalDate.of(2026, 9, 1)); // End before start!

        assertThrows(AllocationException.class, () -> cohortService.updateCohort(1L, req));
    }

    @Test
    void testMapToResponseUsesPersistedScoresWithoutDatabaseQueries() {
        CohortResponse dto = cohortService.mapToResponse(cohort);

        assertEquals("QEA26SD001", dto.getCohortCode());
        assertEquals(88.0, dto.getAllocationScore());
        assertEquals("AUTOMATIC", dto.getAllocationType());
        assertNotNull(dto.getScoreBreakdown());
        assertEquals("Skill Match: 40/40", dto.getScoreBreakdown().getExplanation());

        // Verify zero database calls were executed during mapping
        verifyNoInteractions(allocationScorer);
        verifyNoInteractions(cohortRepository);
    }
}
