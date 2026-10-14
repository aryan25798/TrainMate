package com.trainmate.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class CreateTrainerRequest {

    @NotBlank(message = "Trainer name is required")
    @Size(max = 100, message = "Trainer name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email cannot exceed 150 characters")
    private String email;

    @NotBlank(message = "Skill set is required")
    @Size(max = 500, message = "Skill set cannot exceed 500 characters")
    private String skillSet;

    @NotNull(message = "Experience is required")
    @PositiveOrZero(message = "Experience must be zero or positive")
    @Max(value = 50, message = "Experience cannot exceed 50 years")
    private Double experienceYears;

    @NotNull(message = "Available from date is required")
    private LocalDate availableFrom;

    @NotNull(message = "Available till date is required")
    private LocalDate availableTill;

    @NotNull(message = "Max workload is required")
    @Min(value = 1, message = "Max workload must be at least 1")
    @Max(value = 20, message = "Max workload cannot exceed 20")
    private Integer maxWorkload = 5;

    public CreateTrainerRequest() {}

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

    public String getSkillSet() {
        return skillSet;
    }

    public void setSkillSet(String skillSet) {
        this.skillSet = skillSet;
    }

    public Double getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Double experienceYears) {
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

    public Integer getMaxWorkload() {
        return maxWorkload;
    }

    public void setMaxWorkload(Integer maxWorkload) {
        this.maxWorkload = maxWorkload;
    }
}
