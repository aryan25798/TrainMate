package com.trainmate.service;

import com.trainmate.allocation.AllocationScorer;
import com.trainmate.dto.AdminDashboardResponse;
import com.trainmate.dto.CohortResponse;
import com.trainmate.dto.TrainerResponse;
import com.trainmate.entity.Cohort;
import com.trainmate.entity.CohortStatus;
import com.trainmate.entity.Trainer;
import com.trainmate.exception.InvalidTrainerException;
import com.trainmate.exception.ResourceNotFoundException;
import com.trainmate.repository.CohortRepository;
import com.trainmate.repository.TrainerRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final CohortRepository cohortRepository;
    private final TrainerRepository trainerRepository;
    private final CohortService cohortService;
    private final AllocationScorer allocationScorer;
    private final NotificationService notificationService;

    public AdminService(
            CohortRepository cohortRepository,
            TrainerRepository trainerRepository,
            CohortService cohortService,
            AllocationScorer allocationScorer,
            NotificationService notificationService
    ) {
        this.cohortRepository = cohortRepository;
        this.trainerRepository = trainerRepository;
        this.cohortService = cohortService;
        this.allocationScorer = allocationScorer;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        AdminDashboardResponse resp = new AdminDashboardResponse();

        resp.setTotalCohorts(cohortRepository.count());
        resp.setAssignedCohorts(cohortRepository.countByStatus(CohortStatus.ASSIGNED));
        resp.setUnassignedCohorts(cohortRepository.countByStatus(CohortStatus.UNASSIGNED));
        resp.setPendingCohorts(cohortRepository.countByStatus(CohortStatus.PENDING));
        resp.setActiveCohorts(cohortRepository.countByStatus(CohortStatus.ACTIVE));
        resp.setCompletedCohorts(cohortRepository.countByStatus(CohortStatus.COMPLETED));

        long totalTrainers = trainerRepository.count();
        resp.setTotalTrainers(totalTrainers);
        resp.setAvailableTrainers(totalTrainers);
        resp.setUnavailableTrainers(0);

        return resp;
    }

    @Transactional(readOnly = true)
    public List<CohortResponse> getAllCohorts() {
        return cohortRepository.findAllByOrderByCreatedDateDesc().stream()
                .map(cohortService::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TrainerResponse> getAllTrainers() {
        return trainerRepository.findAll().stream().map(t -> {
            TrainerResponse dto = new TrainerResponse();
            dto.setId(t.getId());
            dto.setUserId(t.getUser().getId());
            dto.setEmployeeId("EMP_T" + t.getId());
            dto.setName(t.getUser().getName());
            dto.setSkills(allocationScorer.parseSkills(t.getSkillSet()));
            dto.setServiceLine("Training");
            dto.setVertical("General");
            dto.setExperienceYears(t.getExperienceYears() != null ? t.getExperienceYears().intValue() : 0);
            dto.setAvailableFrom(t.getAvailableFrom());
            dto.setAvailableTill(t.getAvailableTill());
            dto.setCurrentWorkload(t.getCurrentWorkload());
            dto.setMaximumWorkload(t.getMaxWorkload());
            dto.setWorkloadRatio(t.getCurrentWorkload() + "/" + t.getMaxWorkload());
            dto.setPreviouslyHandledCohorts((int) cohortRepository.countByAssignedTrainerId(t.getId()));
            dto.setStatus("AVAILABLE");
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public CohortResponse reassignTrainer(Long cohortId, Long newTrainerId, Long adminUserId, String reason) {
        Cohort cohort = cohortRepository.findById(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found with ID: " + cohortId));

        Trainer newTrainer = trainerRepository.findById(newTrainerId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer not found with ID: " + newTrainerId));

        if (newTrainer.getCurrentWorkload() >= newTrainer.getMaxWorkload()) {
            throw new InvalidTrainerException("Trainer has reached maximum workload (" 
                    + newTrainer.getCurrentWorkload() + "/" + newTrainer.getMaxWorkload() + ")");
        }

        Trainer oldTrainer = cohort.getAssignedTrainer();

        // Decrement workload of previous trainer
        if (oldTrainer != null) {
            oldTrainer.setCurrentWorkload(Math.max(0, oldTrainer.getCurrentWorkload() - 1));
            trainerRepository.save(oldTrainer);
        }

        // Increment workload of new trainer
        newTrainer.setCurrentWorkload(newTrainer.getCurrentWorkload() + 1);
        trainerRepository.save(newTrainer);

        // Assign new trainer
        cohort.setAssignedTrainer(newTrainer);
        cohort.setStatus(CohortStatus.ASSIGNED);
        Cohort saved = cohortRepository.save(cohort);

        // Send mails
        notificationService.notifyReassigned(saved, oldTrainer, newTrainer, reason);

        return cohortService.mapToResponse(saved);
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
                row.createCell(10).setCellValue(c.getAssignedTrainer() != null ? c.getAssignedTrainer().getUser().getName() : "Unassigned");
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
