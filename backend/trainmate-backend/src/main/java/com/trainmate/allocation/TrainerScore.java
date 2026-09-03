package com.trainmate.allocation;

import com.trainmate.dto.ScoreBreakdownDTO;
import com.trainmate.entity.Trainer;

public class TrainerScore implements Comparable<TrainerScore> {
    private Trainer trainer;
    private boolean eligible;
    private String ineligibilityReason;
    private ScoreBreakdownDTO scoreBreakdown;
    private double totalScore;

    public TrainerScore(Trainer trainer) {
        this.trainer = trainer;
        this.eligible = false;
        this.totalScore = 0.0;
        this.scoreBreakdown = new ScoreBreakdownDTO();
    }

    public Trainer getTrainer() {
        return trainer;
    }

    public void setTrainer(Trainer trainer) {
        this.trainer = trainer;
    }

    public boolean isEligible() {
        return eligible;
    }

    public void setEligible(boolean eligible) {
        this.eligible = eligible;
    }

    public String getIneligibilityReason() {
        return ineligibilityReason;
    }

    public void setIneligibilityReason(String ineligibilityReason) {
        this.ineligibilityReason = ineligibilityReason;
    }

    public ScoreBreakdownDTO getScoreBreakdown() {
        return scoreBreakdown;
    }

    public void setScoreBreakdown(ScoreBreakdownDTO scoreBreakdown) {
        this.scoreBreakdown = scoreBreakdown;
    }

    public double getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(double totalScore) {
        this.totalScore = totalScore;
    }

    @Override
    public int compareTo(TrainerScore other) {
        // 1. Higher total score
        int scoreComparison = Double.compare(other.totalScore, this.totalScore);
        if (scoreComparison != 0) {
            return scoreComparison;
        }

        // 2. Lower current workload
        int workloadComparison = Integer.compare(
                this.trainer.getCurrentWorkload(),
                other.trainer.getCurrentWorkload()
        );
        if (workloadComparison != 0) {
            return workloadComparison;
        }

        // 3. Higher experience
        int expComparison = Double.compare(
                other.trainer.getExperienceYears() != null ? other.trainer.getExperienceYears() : 0.0,
                this.trainer.getExperienceYears() != null ? this.trainer.getExperienceYears() : 0.0
        );
        if (expComparison != 0) {
            return expComparison;
        }

        // 4. Lower trainer ID
        return Long.compare(this.trainer.getId(), other.trainer.getId());
    }
}
