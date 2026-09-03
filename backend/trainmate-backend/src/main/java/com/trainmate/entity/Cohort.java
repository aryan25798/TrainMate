package com.trainmate.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cohort")
public class Cohort {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cohort_id")
    private Long id;

    @Column(name = "cohort_code", nullable = false, unique = true, length = 30)
    private String cohortCode;

    @Column(name = "service_line", nullable = false, length = 100)
    private String serviceLine;

    @Column(name = "stream", nullable = false, length = 100)
    private String stream;

    @Column(name = "required_skill", nullable = false, length = 300)
    private String requiredSkill;

    @Column(name = "trainee_count", nullable = false)
    private Integer traineeCount;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "location", nullable = false, length = 100)
    private String location;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "coach_user_id", nullable = false)
    private User coachUser;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_trainer_id")
    private Trainer assignedTrainer;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CohortStatus status = CohortStatus.PENDING;

    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @PrePersist
    protected void onCreate() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
        if (status == null) {
            status = CohortStatus.PENDING;
        }
    }

    public Cohort() {}

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

    public Integer getTraineeCount() {
        return traineeCount;
    }

    public void setTraineeCount(Integer traineeCount) {
        this.traineeCount = traineeCount;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public User getCoachUser() {
        return coachUser;
    }

    public void setCoachUser(User coachUser) {
        this.coachUser = coachUser;
    }

    public Trainer getAssignedTrainer() {
        return assignedTrainer;
    }

    public void setAssignedTrainer(Trainer assignedTrainer) {
        this.assignedTrainer = assignedTrainer;
    }

    public CohortStatus getStatus() {
        return status;
    }

    public void setStatus(CohortStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
}
