package com.trainmate.controller;

import com.trainmate.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping({"/api/health", "/health"})
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkHealth() {
        return ResponseEntity.ok(ApiResponse.success(
                "TrainMate backend is alive and healthy",
                Map.of(
                        "status", "UP",
                        "timestamp", System.currentTimeMillis()
                )
        ));
    }
}
