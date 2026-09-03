package com.trainmate.dto;

import jakarta.validation.constraints.NotNull;

public class TrainerOverrideRequest {

    @NotNull(message = "Trainer ID is required")
    private Long trainerId;

    private String reason;

    public TrainerOverrideRequest() {}

    public TrainerOverrideRequest(Long trainerId, String reason) {
        this.trainerId = trainerId;
        this.reason = reason;
    }

    public Long getTrainerId() {
        return trainerId;
    }

    public void setTrainerId(Long trainerId) {
        this.trainerId = trainerId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
