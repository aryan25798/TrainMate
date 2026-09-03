package com.trainmate.dto;

public class ScoreBreakdownDTO {
    private double skillScore;
    private double availabilityScore;
    private double workloadScore;
    private double experienceScore;
    private double previousCohortsScore;
    private double totalScore;
    private String explanation;

    public ScoreBreakdownDTO() {}

    public ScoreBreakdownDTO(double skillScore, double availabilityScore, double workloadScore, double experienceScore, double previousCohortsScore, double totalScore, String explanation) {
        this.skillScore = skillScore;
        this.availabilityScore = availabilityScore;
        this.workloadScore = workloadScore;
        this.experienceScore = experienceScore;
        this.previousCohortsScore = previousCohortsScore;
        this.totalScore = totalScore;
        this.explanation = explanation;
    }

    public double getSkillScore() {
        return skillScore;
    }

    public void setSkillScore(double skillScore) {
        this.skillScore = skillScore;
    }

    public double getAvailabilityScore() {
        return availabilityScore;
    }

    public void setAvailabilityScore(double availabilityScore) {
        this.availabilityScore = availabilityScore;
    }

    public double getWorkloadScore() {
        return workloadScore;
    }

    public void setWorkloadScore(double workloadScore) {
        this.workloadScore = workloadScore;
    }

    public double getExperienceScore() {
        return experienceScore;
    }

    public void setExperienceScore(double experienceScore) {
        this.experienceScore = experienceScore;
    }

    public double getPreviousCohortsScore() {
        return previousCohortsScore;
    }

    public void setPreviousCohortsScore(double previousCohortsScore) {
        this.previousCohortsScore = previousCohortsScore;
    }

    public double getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(double totalScore) {
        this.totalScore = totalScore;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
