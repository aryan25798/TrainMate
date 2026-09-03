package com.trainmate.dto;

public class TrainerDashboardResponse {
    private long active;
    private long upcoming;
    private long completed;
    private long unread;

    public TrainerDashboardResponse() {}

    public TrainerDashboardResponse(long active, long upcoming, long completed, long unread) {
        this.active = active;
        this.upcoming = upcoming;
        this.completed = completed;
        this.unread = unread;
    }

    public long getActive() {
        return active;
    }

    public void setActive(long active) {
        this.active = active;
    }

    public long getUpcoming() {
        return upcoming;
    }

    public void setUpcoming(long upcoming) {
        this.upcoming = upcoming;
    }

    public long getCompleted() {
        return completed;
    }

    public void setCompleted(long completed) {
        this.completed = completed;
    }

    public long getUnread() {
        return unread;
    }

    public void setUnread(long unread) {
        this.unread = unread;
    }
}
