package com.trainmate.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TrainerResponse {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String employeeId;
    private String serviceLine;
    private String vertical;
    private Integer experienceYears;
    private LocalDate availableFrom;
    private LocalDate availableTill;
    private Integer currentWorkload;
    private Integer maximumWorkload;
    private String workloadRatio; // e.g., "1/5"
    private Integer previouslyHandledCohorts;
    private String status;
    private List<String> skills = new ArrayList<>();

    public TrainerResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getServiceLine() {
        return serviceLine;
    }

    public void setServiceLine(String serviceLine) {
        this.serviceLine = serviceLine;
    }

    public String getVertical() {
        return vertical;
    }

    public void setVertical(String vertical) {
        this.vertical = vertical;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public LocalDate getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(LocalDate availableFrom) {
        this.availableFrom = availableFrom;
    }

    public LocalDate getAvailableTill() {
        return availableTill;
    }

    public void setAvailableTill(LocalDate availableTill) {
        this.availableTill = availableTill;
    }

    public Integer getCurrentWorkload() {
        return currentWorkload;
    }

    public void setCurrentWorkload(Integer currentWorkload) {
        this.currentWorkload = currentWorkload;
    }

    public Integer getMaximumWorkload() {
        return maximumWorkload;
    }

    public void setMaximumWorkload(Integer maximumWorkload) {
        this.maximumWorkload = maximumWorkload;
    }

    public String getWorkloadRatio() {
        return workloadRatio;
    }

    public void setWorkloadRatio(String workloadRatio) {
        this.workloadRatio = workloadRatio;
    }

    public Integer getPreviouslyHandledCohorts() {
        return previouslyHandledCohorts;
    }

    public void setPreviouslyHandledCohorts(Integer previouslyHandledCohorts) {
        this.previouslyHandledCohorts = previouslyHandledCohorts;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
}
