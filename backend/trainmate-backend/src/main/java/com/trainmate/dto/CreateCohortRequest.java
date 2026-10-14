package com.trainmate.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class CreateCohortRequest {

    @NotBlank(message = "Cohort code is required")
    @Size(max = 30, message = "Cohort code cannot exceed 30 characters")
    private String cohortCode;

    @Size(max = 100, message = "Service line cannot exceed 100 characters")
    private String serviceLine = "QEA";

    @Size(max = 100, message = "Stream cannot exceed 100 characters")
    private String stream = "Software Development";

    @NotBlank(message = "Required skill is required")
    @Size(max = 300, message = "Required skill cannot exceed 300 characters")
    private String requiredSkill;

    @NotNull(message = "Number of trainees is required")
    @Min(value = 1, message = "Number of trainees must be at least 1")
    @Max(value = 500, message = "Number of trainees cannot exceed 500")
    private Integer numberOfTrainees;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @Size(max = 100, message = "Vertical cannot exceed 100 characters")
    private String vertical = "Healthcare";

    @Size(max = 100, message = "Location cannot exceed 100 characters")
    private String location = "Chennai";

    public CreateCohortRequest() {}

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
}
