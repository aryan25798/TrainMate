package com.trainmate.service;

import com.trainmate.allocation.AllocationScorer;
import com.trainmate.allocation.TrainerScore;
import com.trainmate.dto.AdminDashboardResponse;
import com.trainmate.dto.CohortResponse;
import com.trainmate.dto.CreateTrainerRequest;
import com.trainmate.dto.TrainerResponse;
import com.trainmate.entity.Cohort;
import com.trainmate.entity.CohortStatus;
import com.trainmate.entity.Role;
import com.trainmate.entity.Trainer;
import com.trainmate.entity.User;
import com.trainmate.exception.InvalidTrainerException;
import com.trainmate.exception.ResourceNotFoundException;
import com.trainmate.repository.CohortRepository;
import com.trainmate.repository.NotificationRepository;
import com.trainmate.repository.TrainerRepository;
import com.trainmate.repository.UserRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final CohortRepository cohortRepository;
    private final TrainerRepository trainerRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final CohortService cohortService;
    private final AllocationScorer allocationScorer;
    private final NotificationService notificationService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminService(
            CohortRepository cohortRepository,
            TrainerRepository trainerRepository,
            UserRepository userRepository,
            NotificationRepository notificationRepository,
            CohortService cohortService,
            AllocationScorer allocationScorer,
            NotificationService notificationService
    ) {
        this.cohortRepository = cohortRepository;
        this.trainerRepository = trainerRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.cohortService = cohortService;
        this.allocationScorer = allocationScorer;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        AdminDashboardResponse resp = new AdminDashboardResponse();

        Object[] cohortMetrics = cohortRepository.getAdminCohortMetrics();
        if (cohortMetrics != null && cohortMetrics.length > 0) {
            Object[] row = (cohortMetrics[0] instanceof Object[]) ? (Object[]) cohortMetrics[0] : cohortMetrics;
            resp.setTotalCohorts(row[0] != null ? ((Number) row[0]).longValue() : 0L);
            resp.setAssignedCohorts(row[1] != null ? ((Number) row[1]).longValue() : 0L);
            resp.setUnassignedCohorts(row[2] != null ? ((Number) row[2]).longValue() : 0L);
            resp.setPendingCohorts(row[3] != null ? ((Number) row[3]).longValue() : 0L);
            resp.setActiveCohorts(row[4] != null ? ((Number) row[4]).longValue() : 0L);
            resp.setCompletedCohorts(row[5] != null ? ((Number) row[5]).longValue() : 0L);
        }

        LocalDate today = LocalDate.now();
        Object[] trainerMetrics = trainerRepository.getAdminTrainerMetrics(today);
        if (trainerMetrics != null && trainerMetrics.length > 0) {
            Object[] row = (trainerMetrics[0] instanceof Object[]) ? (Object[]) trainerMetrics[0] : trainerMetrics;
            long total = row[0] != null ? ((Number) row[0]).longValue() : 0L;
            long available = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            resp.setTotalTrainers(total);
            resp.setAvailableTrainers(available);
            resp.setUnavailableTrainers(Math.max(0L, total - available));
        }

        return resp;
    }

    @Transactional(readOnly = true)
    public List<CohortResponse> getAllCohorts() {
        return cohortRepository.findAllByOrderByCreatedDateDesc().stream()
                .map(cohortService::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<CohortResponse> getAllCohortsPaged(String query, CohortStatus status, String serviceLine, Pageable pageable) {
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String cleanServiceLine = (serviceLine != null && !serviceLine.trim().isEmpty()) ? serviceLine.trim() : null;
        Page<Cohort> page = (cleanQuery != null || status != null || cleanServiceLine != null)
                ? cohortRepository.findAllFiltered(cleanQuery, status, cleanServiceLine, pageable)
                : cohortRepository.findAllByOrderByCreatedDateDesc(pageable);
        return page.map(cohortService::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<CohortResponse> getAllCohortsPaged(Pageable pageable) {
        return getAllCohortsPaged(null, null, null, pageable);
    }

    @Transactional(readOnly = true)
    public List<String> getDistinctServiceLines() {
        return cohortRepository.findDistinctServiceLines();
    }

    @Transactional(readOnly = true)
    public List<TrainerResponse> getAllTrainers() {
        Map<Long, Integer> counts = getTrainerCohortCounts();
        return trainerRepository.findAll().stream()
                .map(t -> mapToTrainerResponse(t, counts.getOrDefault(t.getId(), 0)))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<TrainerResponse> getAllTrainersPaged(String search, Pageable pageable) {
        Map<Long, Integer> counts = getTrainerCohortCounts();
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<Trainer> page = (cleanSearch != null)
                ? trainerRepository.findAllFiltered(cleanSearch, pageable)
                : trainerRepository.findAll(pageable);
        return page.map((Trainer t) -> this.mapToTrainerResponse(t, counts.getOrDefault(t.getId(), 0)));
    }

    @Transactional(readOnly = true)
    public Page<TrainerResponse> getAllTrainersPaged(Pageable pageable) {
        return getAllTrainersPaged(null, pageable);
    }

    private Map<Long, Integer> getTrainerCohortCounts() {
        return cohortRepository.countCohortsGroupedByTrainer().stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> ((Number) row[1]).intValue(),
                        (a, b) -> a
                ));
    }

    public TrainerResponse mapToTrainerResponse(Trainer t) {
        return mapToTrainerResponse(t, null);
    }

    public TrainerResponse mapToTrainerResponse(Trainer t, Integer prevCohortsCount) {
        TrainerResponse dto = new TrainerResponse();
        dto.setId(t.getId());
        dto.setUserId(t.getUser() != null ? t.getUser().getId() : null);
        dto.setEmail(t.getUser() != null ? t.getUser().getEmail() : null);
        dto.setEmployeeId("EMP_T" + t.getId());
        dto.setName(t.getUser() != null ? t.getUser().getName() : "Unknown");
        dto.setSkills(allocationScorer.parseSkills(t.getSkillSet()));
        dto.setServiceLine("Training");
        dto.setVertical("General");
        dto.setExperienceYears(t.getExperienceYears() != null ? t.getExperienceYears().intValue() : 0);
        dto.setAvailableFrom(t.getAvailableFrom());
        dto.setAvailableTill(t.getAvailableTill());
        dto.setCurrentWorkload(t.getCurrentWorkload());
        dto.setMaximumWorkload(t.getMaxWorkload());
        dto.setWorkloadRatio(t.getCurrentWorkload() + "/" + t.getMaxWorkload());
        dto.setPreviouslyHandledCohorts(prevCohortsCount != null ? prevCohortsCount : (int) cohortRepository.countByAssignedTrainerId(t.getId()));

        if (t.getAvailableTill() != null && t.getAvailableTill().isBefore(LocalDate.now())) {
            dto.setStatus("UNAVAILABLE");
        } else if (t.getCurrentWorkload() >= t.getMaxWorkload()) {
            dto.setStatus("AT_CAPACITY");
        } else {
            dto.setStatus("AVAILABLE");
        }
        return dto;
    }

    @Transactional
    public TrainerResponse createTrainer(CreateTrainerRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User with email " + req.getEmail() + " already exists");
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        // Set default password so the registered trainer can log in (or change it)
        user.setPassword(passwordEncoder.encode("trainer123"));
        user.setRole(Role.TRAINER);
        User savedUser = userRepository.save(user);

        Trainer trainer = new Trainer();
        trainer.setUser(savedUser);
        trainer.setSkillSet(req.getSkillSet());
        trainer.setExperienceYears(req.getExperienceYears());
        trainer.setAvailableFrom(req.getAvailableFrom());
        trainer.setAvailableTill(req.getAvailableTill());
        trainer.setMaxWorkload(req.getMaxWorkload() != null ? req.getMaxWorkload() : 5);
        trainer.setCurrentWorkload(0);
        Trainer savedTrainer = trainerRepository.save(trainer);

        return mapToTrainerResponse(savedTrainer);
    }

    @Transactional
    public TrainerResponse updateTrainer(Long trainerId, CreateTrainerRequest req) {
        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer not found with ID: " + trainerId));

        if (trainer.getUser() != null) {
            trainer.getUser().setName(req.getName());
            trainer.getUser().setEmail(req.getEmail());
            userRepository.save(trainer.getUser());
        }

        trainer.setSkillSet(req.getSkillSet());
        trainer.setExperienceYears(req.getExperienceYears());
        trainer.setAvailableFrom(req.getAvailableFrom());
        trainer.setAvailableTill(req.getAvailableTill());
        if (req.getMaxWorkload() != null) {
            trainer.setMaxWorkload(req.getMaxWorkload());
        }
        Trainer saved = trainerRepository.save(trainer);
        return mapToTrainerResponse(saved);
    }

    @Transactional
    public TrainerResponse toggleTrainerAvailability(Long trainerId, boolean available) {
        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer not found with ID: " + trainerId));

        if (available) {
            trainer.setAvailableFrom(LocalDate.now());
            trainer.setAvailableTill(LocalDate.now().plusMonths(6));
        } else {
            trainer.setAvailableTill(LocalDate.now().minusDays(1));
        }
        Trainer saved = trainerRepository.save(trainer);
        return mapToTrainerResponse(saved);
    }

    @Transactional
    public void deleteTrainer(Long trainerId) {
        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer not found with ID: " + trainerId));

        // Unassign from any assigned cohorts
        List<Cohort> assigned = cohortRepository.findByAssignedTrainerIdOrderByStartDateAsc(trainerId);
        for (Cohort c : assigned) {
            c.setAssignedTrainer(null);
            c.setStatus(CohortStatus.UNASSIGNED);
            cohortRepository.save(c);
        }

        User user = trainer.getUser();
        trainerRepository.delete(trainer);
        if (user != null) {
            notificationRepository.deleteByReceiverUserId(user.getId());
            userRepository.delete(user);
        }
    }

    /**
     * Set-based batch bulk deletion of multiple trainers.
     * Unassigns cohorts in 1 batch query, removes notifications in 1 batch query,
     * and deletes trainers and users in constant O(1) set-based queries instead of iterative loops.
     */
    @Transactional
    public int bulkDeleteTrainers(List<Long> trainerIds) {
        if (trainerIds == null || trainerIds.isEmpty()) return 0;

        // 1. Fetch trainer entities to collect linked user IDs
        List<Trainer> trainers = trainerRepository.findAllById(trainerIds);
        if (trainers.isEmpty()) return 0;

        List<Long> userIds = trainers.stream()
                .filter(t -> t.getUser() != null)
                .map(t -> t.getUser().getId())
                .collect(Collectors.toList());

        // 2. Unassign all cohorts assigned to these trainers in 1 set query
        cohortRepository.unassignTrainersIn(trainerIds);

        // 3. Batch delete notifications for the associated users in 1 set query
        if (!userIds.isEmpty()) {
            notificationRepository.deleteByReceiverUserIdIn(userIds);
        }

        // 4. Batch delete trainers in 1 set query
        int deletedCount = trainerRepository.deleteByIdIn(trainerIds);

        // 5. Batch delete users in 1 set query
        if (!userIds.isEmpty()) {
            userRepository.deleteByIdIn(userIds);
        }

        return deletedCount;
    }

    @Transactional
    public CohortResponse overrideTrainer(Long cohortId, Long newTrainerId, String reason) {
        // 1. Lock cohort first to maintain consistent lock hierarchy (Cohort -> Trainer)
        Cohort cohort = cohortRepository.findByIdForUpdate(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found with ID: " + cohortId));

        Long oldTrainerId = cohort.getAssignedTrainer() != null ? cohort.getAssignedTrainer().getId() : null;
        if (oldTrainerId != null && oldTrainerId.equals(newTrainerId)) {
            // Already assigned to this trainer, no workload adjustment or override needed
            return cohortService.mapToResponse(cohort);
        }

        // 2. Lock trainers in deterministic numerical order by trainerId to prevent deadlocks
        Trainer lockedOldTrainer = null;
        Trainer newTrainer = null;

        if (oldTrainerId != null) {
            Long firstLockId = Math.min(oldTrainerId, newTrainerId);
            Long secondLockId = Math.max(oldTrainerId, newTrainerId);

            Trainer firstTrainer = trainerRepository.findByIdForUpdate(firstLockId).orElse(null);
            Trainer secondTrainer = trainerRepository.findByIdForUpdate(secondLockId).orElse(null);

            if (firstLockId.equals(newTrainerId)) {
                newTrainer = firstTrainer;
                lockedOldTrainer = secondTrainer;
            } else {
                lockedOldTrainer = firstTrainer;
                newTrainer = secondTrainer;
            }
        } else {
            newTrainer = trainerRepository.findByIdForUpdate(newTrainerId).orElse(null);
        }

        if (newTrainer == null) {
            throw new ResourceNotFoundException("Trainer not found with ID: " + newTrainerId);
        }

        // Check eligibility: workload, availability, skills
        TrainerScore score = allocationScorer.evaluate(newTrainer, cohort);
        if (!score.isEligible()) {
            throw new InvalidTrainerException("Trainer not eligible: " + score.getIneligibilityReason());
        }

        // Decrement workload of previous trainer
        if (lockedOldTrainer != null) {
            lockedOldTrainer.setCurrentWorkload(Math.max(0, lockedOldTrainer.getCurrentWorkload() - 1));
            trainerRepository.save(lockedOldTrainer);
        }

        // Increment workload of new trainer
        newTrainer.setCurrentWorkload(newTrainer.getCurrentWorkload() + 1);
        trainerRepository.save(newTrainer);

        // Assign new trainer and persist explainable breakdown
        cohort.setAssignedTrainer(newTrainer);
        cohort.setStatus(CohortStatus.ASSIGNED);
        cohort.setAllocationScore(score.getTotalScore());
        cohort.setAllocationExplanation(reason != null && !reason.trim().isEmpty() ? "Manual Override: " + reason.trim() : "Admin manual reassignment");
        cohort.setAllocationType("MANUAL_OVERRIDE");
        cohort.setAllocationDate(java.time.LocalDateTime.now());
        Cohort saved = cohortRepository.save(cohort);

        // Send mails
        notificationService.notifyReassigned(saved, lockedOldTrainer, newTrainer, reason);

        return cohortService.mapToResponse(saved);
    }

    @Transactional
    public CohortResponse reassignTrainer(Long cohortId, Long newTrainerId, Long adminUserId, String reason) {
        return overrideTrainer(cohortId, newTrainerId, reason);
    }

    @Transactional(readOnly = true)
    public byte[] exportAllocationReport() throws IOException {
        List<Cohort> cohorts = cohortRepository.findAllByOrderByCreatedDateDesc();

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Cohort Allocations");

            Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "Cohort Code", "Service Line", "Stream", "Required Skill",
                    "Trainees", "Start Date", "End Date", "Location", "Status",
                    "Coach", "Assigned Trainer", "Score"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd-MMM-yyyy");
            int rowIdx = 1;
            for (Cohort c : cohorts) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(c.getCohortCode());
                row.createCell(1).setCellValue(c.getServiceLine());
                row.createCell(2).setCellValue(c.getStream());
                row.createCell(3).setCellValue(c.getRequiredSkill());
                row.createCell(4).setCellValue(c.getTraineeCount() != null ? c.getTraineeCount() : 0);
                row.createCell(5).setCellValue(c.getStartDate() != null ? c.getStartDate().format(dtf) : "");
                row.createCell(6).setCellValue(c.getEndDate() != null ? c.getEndDate().format(dtf) : "");
                row.createCell(7).setCellValue(c.getLocation());
                row.createCell(8).setCellValue(c.getStatus().name());
                row.createCell(9).setCellValue(c.getCoachUser() != null ? c.getCoachUser().getName() : "");
                String trainerName = "Unassigned";
                if (c.getAssignedTrainer() != null) {
                    trainerName = c.getAssignedTrainer().getUser() != null ? c.getAssignedTrainer().getUser().getName() : "Trainer #" + c.getAssignedTrainer().getId();
                }
                row.createCell(10).setCellValue(trainerName);
                row.createCell(11).setCellValue(c.getAssignedTrainer() != null ? "Assigned" : "N/A");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
