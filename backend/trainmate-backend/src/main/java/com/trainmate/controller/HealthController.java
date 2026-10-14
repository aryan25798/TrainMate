package com.trainmate.controller;

import com.trainmate.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/health", "/health"})
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Ultra-fast Liveness check (instant response without database overhead).
     * Used by container orchestrators, Render health probes, and frontend pre-warming.
     */
    @GetMapping({"", "/live"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkLiveness() {
        Map<String, Object> details = new HashMap<>();
        details.put("status", "UP");
        details.put("timestamp", System.currentTimeMillis());
        details.put("uptimeMs", ManagementFactory.getRuntimeMXBean().getUptime());
        details.put("version", "1.0.0");
        return ResponseEntity.ok(ApiResponse.success("TrainMate backend process is alive", details));
    }

    /**
     * Readiness check (validates MySQL connectivity).
     */
    @GetMapping("/ready")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkReadiness() {
        Map<String, Object> details = new HashMap<>();
        details.put("timestamp", System.currentTimeMillis());

        boolean dbHealthy = false;
        try (Connection conn = dataSource.getConnection()) {
            dbHealthy = conn.isValid(2);
            details.put("database", dbHealthy ? "UP" : "DOWN");
        } catch (Exception e) {
            details.put("database", "DOWN");
            details.put("error", e.getMessage());
        }

        if (dbHealthy) {
            details.put("status", "UP");
            return ResponseEntity.ok(ApiResponse.success("TrainMate backend and database are ready", details));
        } else {
            details.put("status", "DOWN");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ApiResponse<>(false, "TrainMate backend is degraded (Database unreachable)", details));
        }
    }
}
