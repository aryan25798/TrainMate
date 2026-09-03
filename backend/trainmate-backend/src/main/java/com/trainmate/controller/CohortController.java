package com.trainmate.controller;

import com.trainmate.dto.ApiResponse;
import com.trainmate.dto.CohortResponse;
import com.trainmate.service.CohortService;
import com.trainmate.service.ExcelService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/cohorts")
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

    @GetMapping("/sample-template")
    public ResponseEntity<byte[]> downloadSampleTemplate() throws IOException {
        byte[] templateBytes = excelService.generateSampleExcelTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cohort_template.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(templateBytes);
    }
}
