package com.trainmate.controller;

import com.trainmate.dto.ApiResponse;
import com.trainmate.dto.CohortResponse;
import com.trainmate.dto.TrainerDashboardResponse;
import com.trainmate.service.TrainerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainers")
public class TrainerController {

    private final TrainerService trainerService;

    public TrainerController(TrainerService trainerService) {
        this.trainerService = trainerService;
    }

    @GetMapping("/{trainerId}/dashboard")
    public ResponseEntity<ApiResponse<TrainerDashboardResponse>> getDashboard(@PathVariable Long trainerId) {
        TrainerDashboardResponse data = trainerService.getDashboard(trainerId);
        return ResponseEntity.ok(ApiResponse.success("Trainer dashboard retrieved successfully", data));
    }

    @GetMapping("/{trainerId}/cohorts")
    public ResponseEntity<ApiResponse<List<CohortResponse>>> getCohorts(@PathVariable Long trainerId) {
        List<CohortResponse> cohorts = trainerService.getCohorts(trainerId);
        return ResponseEntity.ok(ApiResponse.success("Assigned cohorts retrieved successfully", cohorts));
    }
}
