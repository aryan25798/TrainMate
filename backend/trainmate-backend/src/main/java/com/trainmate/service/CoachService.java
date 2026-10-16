package com.trainmate.service;

import com.trainmate.allocation.TrainerAllocationService;
import com.trainmate.dto.CoachDashboardResponse;
import com.trainmate.dto.CohortResponse;
import com.trainmate.dto.CohortUploadResponse;
import com.trainmate.dto.CreateCohortRequest;
import com.trainmate.entity.Cohort;
import com.trainmate.entity.CohortStatus;
import com.trainmate.entity.User;
import com.trainmate.exception.AllocationException;
import com.trainmate.exception.DuplicateCohortException;
import com.trainmate.exception.ResourceNotFoundException;
import com.trainmate.repository.CohortRepository;
import com.trainmate.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CoachService {

    private final UserRepository userRepository;
    private final CohortRepository cohortRepository;
    private final ExcelService excelService;
    private final CohortService cohortService;
    private final TrainerAllocationService trainerAllocationService;

    public CoachService(
            UserRepository userRepository,
            CohortRepository cohortRepository,
            ExcelService excelService,
            CohortService cohortService,
            TrainerAllocationService trainerAllocationService
    ) {
        this.userRepository = userRepository;
        this.cohortRepository = cohortRepository;
        this.excelService = excelService;
        this.cohortService = cohortService;
        this.trainerAllocationService = trainerAllocationService;
    }

    @Transactional(readOnly = true)
    public CoachDashboardResponse getDashboard(Long coachUserId) {
        LocalDate today = LocalDate.now();
        Object[] metrics = cohortRepository.getCoachDashboardMetrics(coachUserId, today);
        long totalCohorts = 0L;
        long assigned = 0L;
        long unassigned = 0L;
        long upcoming = 0L;

        if (metrics != null && metrics.length > 0) {
            Object[] row = (metrics[0] instanceof Object[]) ? (Object[]) metrics[0] : metrics;
            totalCohorts = row[0] != null ? ((Number) row[0]).longValue() : 0L;
            assigned = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            unassigned = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            upcoming = row[3] != null ? ((Number) row[3]).longValue() : 0L;
        }

        return new CoachDashboardResponse(totalCohorts, assigned, unassigned, upcoming);
    }

    @Transactional(readOnly = true)
    public List<CohortResponse> getCohorts(Long coachUserId) {
        List<Cohort> cohorts = cohortRepository.findByCoachUserIdOrderByCreatedDateDesc(coachUserId);
        return cohorts.stream().map(cohortService::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<CohortResponse> getCohortsPaged(
            Long coachUserId, String query, CohortStatus status, String serviceLine, org.springframework.data.domain.Pageable pageable) {
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String cleanServiceLine = (serviceLine != null && !serviceLine.trim().isEmpty()) ? serviceLine.trim() : null;
        return cohortRepository.findByCoachFiltered(coachUserId, cleanQuery, status, cleanServiceLine, pageable)
                .map(cohortService::mapToResponse);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<CohortResponse> getCohortsPaged(Long coachUserId, org.springframework.data.domain.Pageable pageable) {
        return getCohortsPaged(coachUserId, null, null, null, pageable);
    }

    public CohortUploadResponse uploadCohorts(Long coachUserId, MultipartFile file) {
        User coachUser = userRepository.findById(coachUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Coach user not found with ID: " + coachUserId));

        return excelService.processCohortExcel(file, coachUser);
    }

    @Transactional
    public CohortResponse createCohort(Long coachUserId, CreateCohortRequest req) {
        User coachUser = userRepository.findById(coachUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Coach user not found with ID: " + coachUserId));

        if (cohortRepository.existsByCohortCode(req.getCohortCode().trim())) {
            throw new DuplicateCohortException("Cohort code already exists: " + req.getCohortCode().trim());
        }

        if (req.getEndDate().isBefore(req.getStartDate())) {
            throw new AllocationException("End date cannot be before start date");
        }

        Cohort cohort = new Cohort();
        cohort.setCohortCode(req.getCohortCode().trim());
        cohort.setServiceLine(req.getServiceLine() != null && !req.getServiceLine().trim().isEmpty() ? req.getServiceLine().trim() : "QEA");
        cohort.setStream(req.getStream() != null && !req.getStream().trim().isEmpty() ? req.getStream().trim() : "Software Development");
        cohort.setRequiredSkill(req.getRequiredSkill().trim());
        cohort.setTraineeCount(req.getNumberOfTrainees());
        cohort.setStartDate(req.getStartDate());
        cohort.setEndDate(req.getEndDate());
        cohort.setLocation(req.getLocation() != null && !req.getLocation().trim().isEmpty() ? req.getLocation().trim() : "Chennai");
        cohort.setVertical(req.getVertical() != null && !req.getVertical().trim().isEmpty() ? req.getVertical().trim() : "General");
        cohort.setCoachUser(coachUser);
        cohort.setStatus(CohortStatus.PENDING);

        Cohort saved = cohortRepository.save(cohort);
        trainerAllocationService.allocateTrainer(saved);

        return cohortService.mapToResponse(saved);
    }
}
