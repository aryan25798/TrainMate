package com.trainmate.controller;

import com.trainmate.dto.*;
import com.trainmate.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping({"/api/admin", "/admin"})
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        AdminDashboardResponse data = adminService.getDashboard();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard retrieved successfully", data));
    }

    @GetMapping("/cohorts")
    public ResponseEntity<ApiResponse<List<CohortResponse>>> getAllCohorts() {
        List<CohortResponse> cohorts = adminService.getAllCohorts();
        return ResponseEntity.ok(ApiResponse.success("All cohorts retrieved successfully", cohorts));
    }

    @Operation(summary = "Get all cohorts with pagination")
    @GetMapping("/cohorts/paged")
    public ResponseEntity<ApiResponse<Page<CohortResponse>>> getAllCohortsPaged(
            @PageableDefault(size = 20, sort = "createdDate") Pageable pageable) {
        Page<CohortResponse> cohorts = adminService.getAllCohortsPaged(pageable);
        return ResponseEntity.ok(ApiResponse.success("Cohorts retrieved successfully", cohorts));
    }

    @GetMapping("/trainers")
    public ResponseEntity<ApiResponse<List<TrainerResponse>>> getAllTrainers() {
        List<TrainerResponse> trainers = adminService.getAllTrainers();
        return ResponseEntity.ok(ApiResponse.success("All trainers retrieved successfully", trainers));
    }

    @Operation(summary = "Get all trainers with pagination")
    @GetMapping("/trainers/paged")
    public ResponseEntity<ApiResponse<Page<TrainerResponse>>> getAllTrainersPaged(
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<TrainerResponse> trainers = adminService.getAllTrainersPaged(pageable);
        return ResponseEntity.ok(ApiResponse.success("Trainers retrieved successfully", trainers));
    }

    @PostMapping("/trainers")
    public ResponseEntity<ApiResponse<TrainerResponse>> createTrainer(
            @Valid @RequestBody CreateTrainerRequest request) {
        TrainerResponse created = adminService.createTrainer(request);
        return ResponseEntity.ok(ApiResponse.success("Trainer created successfully", created));
    }

    @PutMapping("/trainers/{trainerId}")
    public ResponseEntity<ApiResponse<TrainerResponse>> updateTrainer(
            @PathVariable Long trainerId,
            @Valid @RequestBody CreateTrainerRequest request) {
        TrainerResponse updated = adminService.updateTrainer(trainerId, request);
        return ResponseEntity.ok(ApiResponse.success("Trainer updated successfully", updated));
    }

    @PatchMapping("/trainers/{trainerId}/status")
    public ResponseEntity<ApiResponse<TrainerResponse>> toggleTrainerAvailability(
            @PathVariable Long trainerId,
            @RequestParam boolean available) {
        TrainerResponse updated = adminService.toggleTrainerAvailability(trainerId, available);
        return ResponseEntity.ok(ApiResponse.success("Trainer availability updated", updated));
    }

    @DeleteMapping("/trainers/{trainerId}")
    public ResponseEntity<ApiResponse<Void>> deleteTrainer(@PathVariable Long trainerId) {
        adminService.deleteTrainer(trainerId);
        return ResponseEntity.ok(ApiResponse.success("Trainer deleted successfully and unassigned from cohorts", null));
    }

    @PutMapping("/cohorts/{cohortId}/trainer")
    public ResponseEntity<ApiResponse<CohortResponse>> reassignTrainer(
            @PathVariable Long cohortId,
            @Valid @RequestBody TrainerOverrideRequest request,
            @RequestParam(name = "adminUserId", defaultValue = "6") Long adminUserId
    ) {
        CohortResponse updated = adminService.reassignTrainer(cohortId, request.getTrainerId(), adminUserId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success("Trainer reassigned successfully", updated));
    }

    @GetMapping("/cohorts/export")
    public ResponseEntity<byte[]> exportAllocationReport() throws IOException {
        byte[] excelBytes = adminService.exportAllocationReport();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cohort_allocations.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}
