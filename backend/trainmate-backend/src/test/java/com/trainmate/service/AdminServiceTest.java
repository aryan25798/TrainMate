package com.trainmate.service;

import com.trainmate.allocation.AllocationScorer;
import com.trainmate.allocation.TrainerScore;
import com.trainmate.dto.CohortResponse;
import com.trainmate.dto.TrainerResponse;
import com.trainmate.entity.Cohort;
import com.trainmate.entity.CohortStatus;
import com.trainmate.entity.Trainer;
import com.trainmate.entity.User;
import com.trainmate.exception.InvalidTrainerException;
import com.trainmate.exception.ResourceNotFoundException;
import com.trainmate.repository.CohortRepository;
import com.trainmate.repository.NotificationRepository;
import com.trainmate.repository.TrainerRepository;
import com.trainmate.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private CohortRepository cohortRepository;

    @Mock
    private TrainerRepository trainerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private CohortService cohortService;

    @Mock
    private AllocationScorer allocationScorer;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AdminService adminService;

    private Cohort cohort;
    private Trainer oldTrainer;
    private Trainer newTrainer;

    @BeforeEach
    void setUp() {
        oldTrainer = new Trainer();
        oldTrainer.setId(10L);
        oldTrainer.setCurrentWorkload(2);
        oldTrainer.setMaxWorkload(5);
        User userOld = new User(10L, "Old Trainer", "old@cognizant.com", "pass", null);
        oldTrainer.setUser(userOld);

        newTrainer = new Trainer();
        newTrainer.setId(20L);
        newTrainer.setCurrentWorkload(1);
        newTrainer.setMaxWorkload(5);
        User userNew = new User(20L, "New Trainer", "new@cognizant.com", "pass", null);
        newTrainer.setUser(userNew);

        cohort = new Cohort();
        cohort.setId(1L);
        cohort.setCohortCode("GEN_JAVA_01");
        cohort.setAssignedTrainer(oldTrainer);
        cohort.setStatus(CohortStatus.ASSIGNED);
    }

    @Test
    void testOverrideTrainer_Success() {
        when(cohortRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(cohort));
        when(trainerRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(oldTrainer));
        when(trainerRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(newTrainer));

        TrainerScore eligibleScore = new TrainerScore(newTrainer);
        eligibleScore.setEligible(true);
        eligibleScore.setTotalScore(88.5);
        when(allocationScorer.evaluate(newTrainer, cohort)).thenReturn(eligibleScore);

        when(cohortRepository.save(cohort)).thenReturn(cohort);
        CohortResponse expectedResponse = new CohortResponse();
        expectedResponse.setId(1L);
        expectedResponse.setCohortCode("GEN_JAVA_01");
        expectedResponse.setStatus(CohortStatus.ASSIGNED.name());
        when(cohortService.mapToResponse(cohort)).thenReturn(expectedResponse);

        CohortResponse response = adminService.overrideTrainer(1L, 20L, "Client requested senior architect");

        assertNotNull(response);
        assertEquals(1, oldTrainer.getCurrentWorkload()); // 2 decremented to 1
        assertEquals(2, newTrainer.getCurrentWorkload()); // 1 incremented to 2
        assertEquals(newTrainer, cohort.getAssignedTrainer());
        assertEquals(CohortStatus.ASSIGNED, cohort.getStatus());
        assertEquals(88.5, cohort.getAllocationScore());
        assertTrue(cohort.getAllocationExplanation().contains("Client requested senior architect"));

        verify(trainerRepository).save(oldTrainer);
        verify(trainerRepository).save(newTrainer);
        verify(cohortRepository).save(cohort);
        verify(notificationService).notifyReassigned(cohort, oldTrainer, newTrainer, "Client requested senior architect");
    }

    @Test
    void testOverrideTrainer_IneligibleTrainer_ThrowsInvalidTrainerException() {
        when(cohortRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(cohort));
        when(trainerRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(oldTrainer));
        when(trainerRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(newTrainer));

        TrainerScore ineligibleScore = new TrainerScore(newTrainer);
        ineligibleScore.setEligible(false);
        ineligibleScore.setIneligibilityReason("Trainer is at maximum capacity");
        when(allocationScorer.evaluate(newTrainer, cohort)).thenReturn(ineligibleScore);

        InvalidTrainerException ex = assertThrows(InvalidTrainerException.class, () ->
                adminService.overrideTrainer(1L, 20L, "Overriding anyway")
        );

        assertTrue(ex.getMessage().contains("Trainer is at maximum capacity"));
        verify(cohortRepository, never()).save(any());
        assertEquals(2, oldTrainer.getCurrentWorkload());
        assertEquals(1, newTrainer.getCurrentWorkload());
    }

    @Test
    void testOverrideTrainer_CohortNotFound_ThrowsResourceNotFoundException() {
        when(cohortRepository.findByIdForUpdate(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                adminService.overrideTrainer(99L, 20L, "Reason")
        );
    }

    @Test
    void testGetAllTrainers_UsesBatchCohortCount() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Trainer> trainers = List.of(oldTrainer, newTrainer);
        Page<Trainer> page = new PageImpl<>(trainers, pageable, 2);

        when(trainerRepository.findAll(pageable)).thenReturn(page);

        // Grouped count returns counts in one query
        List<Object[]> batchCounts = new ArrayList<>();
        batchCounts.add(new Object[]{10L, 3L});
        batchCounts.add(new Object[]{20L, 1L});
        when(cohortRepository.countCohortsGroupedByTrainer()).thenReturn(batchCounts);

        when(allocationScorer.parseSkills(any())).thenReturn(List.of("Java", "Spring"));

        Page<TrainerResponse> result = adminService.getAllTrainersPaged(pageable);

        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals(3, result.getContent().get(0).getPreviouslyHandledCohorts());
        assertEquals(1, result.getContent().get(1).getPreviouslyHandledCohorts());

        // Crucial: verify countByAssignedTrainerId was NEVER called in a loop
        verify(cohortRepository, never()).countByAssignedTrainerId(any());
        verify(cohortRepository, times(1)).countCohortsGroupedByTrainer();
    }
}
