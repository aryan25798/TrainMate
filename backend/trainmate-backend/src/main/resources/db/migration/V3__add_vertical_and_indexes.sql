-- ===================================================
-- V3: Add vertical column to cohort and additional indexes
-- Compatible with MySQL 8.0+ and Aiven Cloud Managed MySQL
-- ===================================================

-- Add vertical column to cohort table
ALTER TABLE cohort 
ADD COLUMN vertical VARCHAR(100) DEFAULT 'General' AFTER location;

-- Add indexes for better query performance on vertical
ALTER TABLE cohort 
ADD INDEX idx_cohort_vertical (vertical);

-- Composite index for admin dashboard queries
ALTER TABLE cohort 
ADD INDEX idx_cohort_service_line_status (service_line, status);

-- Composite index for trainer allocation queries
ALTER TABLE trainer 
ADD INDEX idx_trainer_skill_set_workload (skill_set, current_workload, max_workload);

-- Add updated_date column to cohort for audit trail
ALTER TABLE cohort 
ADD COLUMN updated_date TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP AFTER created_date;

-- Add updated_date column to trainer
ALTER TABLE trainer 
ADD COLUMN updated_date TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP;

-- Add updated_date column to users
ALTER TABLE users 
ADD COLUMN updated_date TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP AFTER created_date;

-- Add updated_by column for audit trail (nullable, stores user_id who made the change)
ALTER TABLE cohort 
ADD COLUMN updated_by BIGINT NULL AFTER updated_date;

-- Add updated_by column to trainer
ALTER TABLE trainer 
ADD COLUMN updated_by BIGINT NULL AFTER updated_date;

-- Add updated_by column to users
ALTER TABLE users 
ADD COLUMN updated_by BIGINT NULL AFTER updated_date;