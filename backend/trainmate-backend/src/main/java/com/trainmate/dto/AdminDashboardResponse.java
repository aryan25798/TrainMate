package com.trainmate.dto;

public class AdminDashboardResponse {
    // Cohort Statistics
    private long totalCohorts;
    private long assignedCohorts;
    private long unassignedCohorts;
    private long pendingCohorts;
    private long activeCohorts;
    private long completedCohorts;

    // Trainer Statistics
    private long totalTrainers;
    private long availableTrainers;
    private long unavailableTrainers;

    public AdminDashboardResponse() {}

    public long getTotalCohorts() {
        return totalCohorts;
    }

    public void setTotalCohorts(long totalCohorts) {
        this.totalCohorts = totalCohorts;
    }

    public long getAssignedCohorts() {
        return assignedCohorts;
    }

    public void setAssignedCohorts(long assignedCohorts) {
        this.assignedCohorts = assignedCohorts;
    }

    public long getUnassignedCohorts() {
        return unassignedCohorts;
    }

    public void setUnassignedCohorts(long unassignedCohorts) {
        this.unassignedCohorts = unassignedCohorts;
    }

    public long getPendingCohorts() {
        return pendingCohorts;
    }

    public void setPendingCohorts(long pendingCohorts) {
        this.pendingCohorts = pendingCohorts;
    }

    public long getActiveCohorts() {
        return activeCohorts;
    }

    public void setActiveCohorts(long activeCohorts) {
        this.activeCohorts = activeCohorts;
    }

    public long getCompletedCohorts() {
        return completedCohorts;
    }

    public void setCompletedCohorts(long completedCohorts) {
        this.completedCohorts = completedCohorts;
    }

    public long getTotalTrainers() {
        return totalTrainers;
    }

    public void setTotalTrainers(long totalTrainers) {
        this.totalTrainers = totalTrainers;
    }

    public long getAvailableTrainers() {
        return availableTrainers;
    }

    public void setAvailableTrainers(long availableTrainers) {
        this.availableTrainers = availableTrainers;
    }

    public long getUnavailableTrainers() {
        return unavailableTrainers;
    }

    public void setUnavailableTrainers(long unavailableTrainers) {
        this.unavailableTrainers = unavailableTrainers;
    }
}
