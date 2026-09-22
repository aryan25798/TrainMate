package com.trainmate.controller;

import com.trainmate.dto.ApiResponse;
import com.trainmate.dto.NotificationResponse;
import com.trainmate.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/notifications", "/notifications"})
@Tag(name = "Notifications", description = "Notification/mailbox endpoints")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Operation(summary = "Get user notifications", description = "Retrieve all notifications for a user")
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(@PathVariable Long userId) {
        List<NotificationResponse> list = notificationService.getNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", list));
    }

    @Operation(summary = "Mark all notifications as read", description = "Mark all unread notifications as read for a user")
    @PutMapping("/{userId}/read-all")
    public ResponseEntity<ApiResponse<Integer>> markAllAsRead(@PathVariable Long userId) {
        int count = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success(count + " notifications marked as read", count));
    }

    @Operation(summary = "Get unread notification count", description = "Get count of unread notifications for a user")
    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", count));
    }
}
