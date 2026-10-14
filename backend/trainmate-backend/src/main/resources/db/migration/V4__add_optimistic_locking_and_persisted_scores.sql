-- ===================================================
-- V4: Add Optimistic Locking and Persisted Allocation Scores
-- Compatible with MySQL 8.0+, Aiven Cloud Managed DB
-- ===================================================

-- 1. Add version column for optimistic locking
ALTER TABLE users ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE trainer ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE cohort ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

-- 2. Add persisted allocation score fields to cohort to eliminate N+1 queries during reads
ALTER TABLE cohort ADD COLUMN allocation_score DOUBLE NULL;
ALTER TABLE cohort ADD COLUMN allocation_explanation VARCHAR(1000) NULL;
ALTER TABLE cohort ADD COLUMN allocation_type VARCHAR(30) NULL;
ALTER TABLE cohort ADD COLUMN allocation_date TIMESTAMP NULL;

-- 3. Populate existing assigned cohorts with default allocation score values
UPDATE cohort 
SET allocation_score = 90.0, 
    allocation_explanation = 'Initial historical allocation',
    allocation_type = 'AUTOMATIC',
    allocation_date = created_date
WHERE assigned_trainer_id IS NOT NULL;

-- 4. Clean up redundant indexes
ALTER TABLE users DROP INDEX idx_users_email;
ALTER TABLE trainer DROP INDEX idx_trainer_available_dates;
