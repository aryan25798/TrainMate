package com.trainmate.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class CohortResponse {
    private Long id;
    private String cohortCode;
    private String serviceLine;
    private String stream;
    private String requiredSkill;
    private Integer numberOfTrainees;
    private LocalDate startDate;
    private LocalDate endDate;
    private String vertical;
    private String location;
    private String status;

    // Coach details
    private Long coachId;
    private String coachName;
    private String coachEmployeeId;

    // Trainer details
    private Long assignedTrainerId;
    private String assignedTrainerName;
    private String assignedTrainerEmployeeId;

    // Allocation details
    private Double allocationScore;
    private String allocationType;
    private LocalDateTime allocationDate;
    private ScoreBreakdownDTO scoreBreakdown;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CohortResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCohortCode() {
        return cohortCode;
    }

    public void setCohortCode(String cohortCode) {
        this.cohortCode = cohortCode;
    }

    public String getServiceLine() {
        return serviceLine;
    }

    public void setServiceLine(String serviceLine) {
        this.serviceLine = serviceLine;
    }

    public String getStream() {
        return stream;
    }

    public void setStream(String stream) {
        this.stream = stream;
    }

    public String getRequiredSkill() {
        return requiredSkill;
    }

    public void setRequiredSkill(String requiredSkill) {
        this.requiredSkill = requiredSkill;
    }

    public Integer getNumberOfTrainees() {
        return numberOfTrainees;
    }

    public void setNumberOfTrainees(Integer numberOfTrainees) {
        this.numberOfTrainees = numberOfTrainees;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getVertical() {
        return vertical;
    }

    public void setVertical(String vertical) {
        this.vertical = vertical;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getCoachId() {
        return coachId;
    }

    public void setCoachId(Long coachId) {
        this.coachId = coachId;
    }

    public String getCoachName() {
        return coachName;
    }

    public void setCoachName(String coachName) {
        this.coachName = coachName;
    }

    public String getCoachEmployeeId() {
        return coachEmployeeId;
    }

    public void setCoachEmployeeId(String coachEmployeeId) {
        this.coachEmployeeId = coachEmployeeId;
    }

    public Long getAssignedTrainerId() {
        return assignedTrainerId;
    }

    public void setAssignedTrainerId(Long assignedTrainerId) {
        this.assignedTrainerId = assignedTrainerId;
    }

    public String getAssignedTrainerName() {
        return assignedTrainerName;
    }

    public void setAssignedTrainerName(String assignedTrainerName) {
        this.assignedTrainerName = assignedTrainerName;
    }

    public String getAssignedTrainerEmployeeId() {
        return assignedTrainerEmployeeId;
    }

    public void setAssignedTrainerEmployeeId(String assignedTrainerEmployeeId) {
        this.assignedTrainerEmployeeId = assignedTrainerEmployeeId;
    }

    public Double getAllocationScore() {
        return allocationScore;
    }

    public void setAllocationScore(Double allocationScore) {
        this.allocationScore = allocationScore;
    }

    public String getAllocationType() {
        return allocationType;
    }

    public void setAllocationType(String allocationType) {
        this.allocationType = allocationType;
    }

    public LocalDateTime getAllocationDate() {
        return allocationDate;
    }

    public void setAllocationDate(LocalDateTime allocationDate) {
        this.allocationDate = allocationDate;
    }

    public ScoreBreakdownDTO getScoreBreakdown() {
        return scoreBreakdown;
    }

    public void setScoreBreakdown(ScoreBreakdownDTO scoreBreakdown) {
        this.scoreBreakdown = scoreBreakdown;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
