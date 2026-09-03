package com.trainmate.dto;

public class CoachDashboardResponse {
    private long totalCohorts;
    private long assigned;
    private long unassigned;
    private long upcoming;

    public CoachDashboardResponse() {}

    public CoachDashboardResponse(long totalCohorts, long assigned, long unassigned, long upcoming) {
        this.totalCohorts = totalCohorts;
        this.assigned = assigned;
        this.unassigned = unassigned;
        this.upcoming = upcoming;
    }

    public long getTotalCohorts() {
        return totalCohorts;
    }

    public void setTotalCohorts(long totalCohorts) {
        this.totalCohorts = totalCohorts;
    }

    public long getAssigned() {
        return assigned;
    }

    public void setAssigned(long assigned) {
        this.assigned = assigned;
    }

    public long getUnassigned() {
        return unassigned;
    }

    public void setUnassigned(long unassigned) {
        this.unassigned = unassigned;
    }

    public long getUpcoming() {
        return upcoming;
    }

    public void setUpcoming(long upcoming) {
        this.upcoming = upcoming;
    }
}
