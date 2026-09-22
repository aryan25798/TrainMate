package com.trainmate.controller;

import com.trainmate.dto.ApiResponse;
import com.trainmate.dto.CohortResponse;
import com.trainmate.dto.CreateCohortRequest;
import com.trainmate.service.CohortService;
import com.trainmate.service.ExcelService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/cohorts")
public class CohortController {

    private final CohortService cohortService;
    private final ExcelService excelService;

    public CohortController(CohortService cohortService, ExcelService excelService) {
        this.cohortService = cohortService;
        this.excelService = excelService;
    }

    @GetMapping("/{cohortId}")
    public ResponseEntity<ApiResponse<CohortResponse>> getCohort(@PathVariable Long cohortId) {
        CohortResponse data = cohortService.getCohortById(cohortId);
        return ResponseEntity.ok(ApiResponse.success("Cohort retrieved successfully", data));
    }

    @DeleteMapping("/{cohortId}")
    public ResponseEntity<ApiResponse<Void>> deleteCohort(@PathVariable Long cohortId) {
        cohortService.deleteCohort(cohortId);
        return ResponseEntity.ok(ApiResponse.success("Cohort deleted successfully and trainer workload released.", null));
    }

    @PutMapping("/{cohortId}")
    public ResponseEntity<ApiResponse<CohortResponse>> updateCohort(
            @PathVariable Long cohortId,
            @Valid @RequestBody CreateCohortRequest request) {
        CohortResponse data = cohortService.updateCohort(cohortId, request);
        return ResponseEntity.ok(ApiResponse.success("Cohort updated successfully", data));
    }

    @PatchMapping("/{cohortId}/status")
    public ResponseEntity<ApiResponse<CohortResponse>> updateCohortStatus(
            @PathVariable Long cohortId,
            @RequestParam String status) {
        CohortResponse data = cohortService.updateCohortStatus(cohortId, status);
        return ResponseEntity.ok(ApiResponse.success("Cohort status updated to " + status, data));
    }

    @PostMapping("/{cohortId}/reallocate")
    public ResponseEntity<ApiResponse<CohortResponse>> reallocateTrainer(@PathVariable Long cohortId) {
        CohortResponse data = cohortService.reallocateTrainer(cohortId);
        return ResponseEntity.ok(ApiResponse.success("100-point allocation engine re-evaluated successfully", data));
    }

    @GetMapping("/sample-template")
    public ResponseEntity<byte[]> downloadSampleTemplate() throws IOException {
        byte[] templateBytes = excelService.generateSampleExcelTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cohort_template.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(templateBytes);
    }
}
