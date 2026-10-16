package com.trainmate.controller;

import com.trainmate.dto.ApiResponse;
import com.trainmate.dto.CoachDashboardResponse;
import com.trainmate.dto.CohortResponse;
import com.trainmate.dto.CohortUploadResponse;
import com.trainmate.service.CoachService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping({"/api/coach", "/coach"})
public class CoachController {

    private final CoachService coachService;

    public CoachController(CoachService coachService) {
        this.coachService = coachService;
    }

    @GetMapping("/{coachId}/dashboard")
    public ResponseEntity<ApiResponse<CoachDashboardResponse>> getDashboard(@PathVariable Long coachId) {
        CoachDashboardResponse data = coachService.getDashboard(coachId);
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved successfully", data));
    }

    @GetMapping("/{coachId}/cohorts")
    public ResponseEntity<ApiResponse<List<CohortResponse>>> getCohorts(@PathVariable Long coachId) {
        List<CohortResponse> cohorts = coachService.getCohorts(coachId);
        return ResponseEntity.ok(ApiResponse.success("Cohorts retrieved successfully", cohorts));
    }

    @GetMapping("/{coachId}/cohorts/paged")
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<CohortResponse>>> getCohortsPaged(
            @PathVariable Long coachId,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) com.trainmate.entity.CohortStatus status,
            @RequestParam(required = false) String serviceLine,
            @org.springframework.data.web.PageableDefault(size = 15, sort = "createdDate", direction = org.springframework.data.domain.Sort.Direction.DESC) org.springframework.data.domain.Pageable pageable
    ) {
        org.springframework.data.domain.Page<CohortResponse> cohorts = coachService.getCohortsPaged(coachId, query, status, serviceLine, pageable);
        return ResponseEntity.ok(ApiResponse.success("Cohorts retrieved successfully", cohorts));
    }

    @PostMapping("/{coachId}/cohorts")
    public ResponseEntity<ApiResponse<CohortResponse>> createCohort(
            @PathVariable Long coachId,
            @jakarta.validation.Valid @RequestBody com.trainmate.dto.CreateCohortRequest request
    ) {
        CohortResponse cohort = coachService.createCohort(coachId, request);
        return ResponseEntity.ok(ApiResponse.success("Cohort created and trainer allocated successfully", cohort));
    }

    @PostMapping("/{coachId}/cohorts/upload")
    public ResponseEntity<ApiResponse<CohortUploadResponse>> uploadCohorts(
            @PathVariable Long coachId,
            @RequestParam("file") MultipartFile file
    ) {
        CohortUploadResponse result = coachService.uploadCohorts(coachId, file);
        return ResponseEntity.ok(ApiResponse.success("File processed", result));
    }
}
