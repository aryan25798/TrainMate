package com.trainmate.controller;

import com.trainmate.dto.ApiResponse;
import com.trainmate.dto.NotificationResponse;
import com.trainmate.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(@PathVariable Long userId) {
        List<NotificationResponse> list = notificationService.getNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success("Mails retrieved successfully", list));
    }
}
